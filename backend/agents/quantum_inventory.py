"""Quantum Inventory Optimization Agent — uses QUBO solver for reorder decisions.

Orchestrates: demand forecast → QUBO formulation → simulated annealing → decoded plan.
Compares QUBO-optimised results against traditional EOQ for savings estimation.
"""

from __future__ import annotations

import json
import math
from typing import Any

from sqlalchemy.orm import Session

from models import InventoryItem, QUBOResult
from agents import qubo_solver, inventory as inv_agent, forecasting


# ─── Core ─────────────────────────────────────────────

def run_quantum_optimization(
    db: Session,
    session_id: str,
    budget: float | None = None,
    capacity: float | None = None,
) -> dict[str, Any]:
    """Full QUBO-based inventory optimisation pipeline.

    1. Fetch inventory items + demand forecast
    2. Compute per-item holding cost, stockout risk, EOQ
    3. Build QUBO matrix and solve via simulated annealing
    4. Decode → compare with EOQ → persist result
    """
    # ── Gather data ─────────────────────────
    raw_items = inv_agent.get_all_items(db, session_id)
    if not raw_items:
        return {"error": "No inventory items found"}

    demand_data = forecasting.forecast_product_demand(db, session_id, days=90)

    # Index demand by SKU
    demand_map: dict[str, dict] = {}
    for d in demand_data:
        demand_map[d["sku"]] = d

    # ── Prepare QUBO input vector ──────────
    qubo_items: list[dict] = []
    eoq_baseline_cost = 0.0

    for it in raw_items:
        sku = it["sku"]
        stock = it["stock"]
        unit_cost = it.get("unit_cost", 0)
        sell_price = it.get("sell_price", 0)
        sold_30d = it.get("units_sold_30d", 0)
        daily_demand = sold_30d / 30 if sold_30d else 0.5

        # Holding cost: 25% of unit cost annually, proportional to EOQ batch
        annual_demand = daily_demand * 365
        ordering_cost = max(unit_cost * 0.1, 50)
        holding_rate = 0.25
        holding_cost_per_unit = unit_cost * holding_rate

        # EOQ
        if annual_demand > 0 and holding_cost_per_unit > 0:
            eoq = math.sqrt(2 * annual_demand * ordering_cost / holding_cost_per_unit)
            eoq = max(1, round(eoq))
        else:
            eoq = max(1, sold_30d)

        # Stock adequacy: heavily penalise reordering items with sufficient stock
        reorder_point_est = daily_demand * 7 + 1.65 * math.sqrt(7) * max(daily_demand * 0.3, 1)
        stock_ratio = stock / reorder_point_est if reorder_point_est > 0 else 10.0
        if stock_ratio >= 1.0:
            stock_penalty = 1.0 + (stock_ratio - 1.0) ** 2 * 10
        else:
            stock_penalty = 1.0

        # Holding cost for QUBO = cost of holding EOQ quantity × stock penalty
        holding_cost = eoq * holding_cost_per_unit / 365 * 30 * stock_penalty

        # Stockout risk = lost margin × probability
        margin = max(sell_price - unit_cost, 0)
        reorder_point = daily_demand * 7 + 1.65 * math.sqrt(7) * max(daily_demand * 0.3, 1)
        if stock <= 0:
            stockout_prob = 1.0
        elif stock < reorder_point:
            stockout_prob = 1 - (stock / reorder_point)
        else:
            stockout_prob = 0.05  # small base risk

        stockout_risk = margin * daily_demand * 30 * stockout_prob

        # Order cost for budget constraint
        order_cost = eoq * unit_cost

        # Urgency
        days_until_stockout = stock / daily_demand if daily_demand > 0 else 999
        if days_until_stockout <= 7:
            urgency = "critical"
        elif days_until_stockout <= 21:
            urgency = "high"
        else:
            urgency = "normal"

        qubo_items.append({
            "sku": sku,
            "name": it["name"],
            "current_stock": stock,
            "unit_cost": unit_cost,
            "sell_price": sell_price,
            "daily_demand": round(daily_demand, 2),
            "eoq": eoq,
            "reorder_point": round(reorder_point, 1),
            "safety_stock": round(1.65 * math.sqrt(7) * max(daily_demand * 0.3, 1), 1),
            "holding_cost": round(holding_cost, 2),
            "stockout_risk": round(stockout_risk, 2),
            "order_cost": round(order_cost, 2),
            "volume": eoq,          # Use qty as proxy for capacity consumption
            "urgency": urgency,
            "days_until_stockout": round(days_until_stockout, 1),
        })

        # EOQ baseline: naive approach reorders ALL items at full EOQ
        eoq_baseline_cost += order_cost

    # ── Solve QUBO ─────────────────────────
    result = qubo_solver.solve(qubo_items, budget=budget, capacity=capacity)

    # ── Compute savings vs EOQ ─────────────
    qubo_cost = result["total_reorder_cost"]
    savings = max(0, eoq_baseline_cost - qubo_cost)
    savings_pct = round(savings / eoq_baseline_cost * 100, 1) if eoq_baseline_cost > 0 else 0

    result["eoq_baseline_cost"] = round(eoq_baseline_cost, 2)
    result["savings"] = round(savings, 2)
    result["savings_pct"] = savings_pct
    result["budget"] = budget
    result["capacity"] = capacity

    # ── Persist ────────────────────────────
    qr = QUBOResult(
        session_id=session_id,
        qubo_matrix_size=result["qubo_matrix_size"],
        solver_method=result["solver_method"],
        energy=result["energy"],
        decisions_json=json.dumps(result["decisions"]),
        constraints_json=json.dumps({"budget": budget, "capacity": capacity}),
        total_cost=qubo_cost,
        total_savings=savings,
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)
    result["run_id"] = qr.id

    return result


# ─── History ─────────────────────────────────────────

def get_optimization_history(db: Session, session_id: str, limit: int = 10) -> list[dict]:
    rows = (
        db.query(QUBOResult)
        .filter(QUBOResult.session_id == session_id)
        .order_by(QUBOResult.run_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "run_at": r.run_at.isoformat() if r.run_at else None,
            "matrix_size": r.qubo_matrix_size,
            "energy": r.energy,
            "total_cost": r.total_cost,
            "total_savings": r.total_savings,
            "solver": r.solver_method,
            "decisions": json.loads(r.decisions_json or "[]"),
            "constraints": json.loads(r.constraints_json or "{}"),
        }
        for r in rows
    ]


# ─── QUBO vs EOQ Comparison ─────────────────────────

def compare_methods(db: Session, session_id: str) -> dict:
    """Return the latest QUBO run vs naive EOQ for chart comparison."""
    history = get_optimization_history(db, session_id, limit=1)
    if not history:
        # No previous run — run one now
        result = run_quantum_optimization(db, session_id)
        return {
            "qubo": {"total_cost": result.get("total_reorder_cost", 0)},
            "eoq": {"total_cost": result.get("eoq_baseline_cost", 0)},
            "savings": result.get("savings", 0),
            "savings_pct": result.get("savings_pct", 0),
        }
    last = history[0]
    return {
        "qubo": {"total_cost": last["total_cost"]},
        "eoq": {"total_cost": last["total_cost"] + last["total_savings"]},
        "savings": last["total_savings"],
        "savings_pct": round(last["total_savings"] / (last["total_cost"] + last["total_savings"]) * 100, 1)
            if (last["total_cost"] + last["total_savings"]) > 0 else 0,
    }
