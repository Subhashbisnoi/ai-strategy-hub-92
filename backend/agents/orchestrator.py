"""Agentic Orchestrator — coordinates the full inventory→payment→dispatch pipeline.

Steps: Forecast → QUBO Optimise → Create POs → Risk Assess → Approve → Pay → Dispatch → Update
"""

from __future__ import annotations

import json
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from models import PurchaseOrder, InventoryItem, POStatus
from agents import (
    forecasting,
    quantum_inventory,
    a2p_payment,
)


# supplier assignment for demo (round-robin from a fixed list)
DEMO_SUPPLIERS = [
    "TechSource India Pvt Ltd",
    "DigiParts Distribution",
    "ElectroPro Wholesale",
    "MicroChip Supplies Co",
]


def run_full_pipeline(
    db: Session,
    session_id: str,
    budget: float | None = None,
    capacity: float | None = None,
    auto_approve_low_risk: bool = True,
) -> dict[str, Any]:
    """Execute the 8-step agentic pipeline end-to-end."""

    pipeline: dict[str, Any] = {
        "session_id": session_id,
        "started_at": datetime.utcnow().isoformat(),
        "steps": {},
    }

    def _step(name: str, fn, *args, **kwargs):
        t0 = datetime.utcnow()
        try:
            result = fn(*args, **kwargs)
            pipeline["steps"][name] = {
                "status": "completed",
                "started_at": t0.isoformat(),
                "completed_at": datetime.utcnow().isoformat(),
                "result": result,
            }
            return result
        except Exception as e:
            pipeline["steps"][name] = {
                "status": "failed",
                "started_at": t0.isoformat(),
                "completed_at": datetime.utcnow().isoformat(),
                "error": str(e),
            }
            return None

    # ── Step 1: Demand Forecast ─────────────
    demand = _step("forecast", forecasting.forecast_product_demand, db, session_id, 90)

    # ── Step 2: QUBO Optimisation ───────────
    qubo = _step("qubo_optimize", quantum_inventory.run_quantum_optimization,
                 db, session_id, budget, capacity)

    if not qubo or "decisions" not in qubo:
        pipeline["status"] = "failed"
        pipeline["completed_at"] = datetime.utcnow().isoformat()
        a2p_payment.log_action(db, session_id, "pipeline_failed", "Orchestrator",
                               {"reason": "QUBO optimization failed"})
        return pipeline

    # ── Step 3: Create Purchase Orders ──────
    reorder_items = [d for d in qubo["decisions"] if d.get("reorder")]

    # Group by supplier (round-robin for demo)
    supplier_groups: dict[str, list[dict]] = {}
    for i, item in enumerate(reorder_items):
        supplier = DEMO_SUPPLIERS[i % len(DEMO_SUPPLIERS)]
        supplier_groups.setdefault(supplier, []).append(item)

    created_pos = []
    for supplier, items in supplier_groups.items():
        total = sum(it["cost"] for it in items)
        po_items = [
            {"sku": it["sku"], "name": it["name"], "qty": it["qty"],
             "unit_cost": it["unit_cost"], "total": it["cost"]}
            for it in items
        ]
        po = a2p_payment.create_purchase_order(db, session_id, supplier, po_items, total)
        created_pos.append(po)

    pipeline["steps"]["create_pos"] = {
        "status": "completed",
        "started_at": datetime.utcnow().isoformat(),
        "completed_at": datetime.utcnow().isoformat(),
        "result": {"po_count": len(created_pos), "pos": created_pos},
    }

    # ── Step 4: Risk Assessment ─────────────
    approvals = []
    for po in created_pos:
        appr = _step(
            f"risk_assess_{po['id']}",
            a2p_payment.create_approval_request,
            db, session_id, po["id"], auto_approve_low_risk,
        )
        if appr:
            approvals.append(appr)

    pipeline["steps"]["risk_assessment"] = {
        "status": "completed",
        "started_at": datetime.utcnow().isoformat(),
        "completed_at": datetime.utcnow().isoformat(),
        "result": {
            "total": len(approvals),
            "auto_approved": sum(1 for a in approvals if a.get("auto_approved")),
            "pending_manual": sum(1 for a in approvals if a.get("status") == "pending"),
            "approvals": approvals,
        },
    }

    # ── Step 5: Payment for approved POs ────
    payments = []
    for po in created_pos:
        # Re-fetch PO to check current status
        db_po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po["id"]).first()
        if db_po and db_po.status == POStatus.approved:
            pmt = _step(f"pay_{po['id']}", a2p_payment.initiate_payment,
                        db, session_id, po["id"])
            if pmt and "error" not in pmt:
                # Auto-simulate payment success for demo
                callback = a2p_payment.simulate_payment_callback(db, session_id, pmt["id"])
                pmt["callback"] = callback
                payments.append(pmt)

    pipeline["steps"]["payments"] = {
        "status": "completed",
        "started_at": datetime.utcnow().isoformat(),
        "completed_at": datetime.utcnow().isoformat(),
        "result": {"paid_count": len(payments), "payments": payments},
    }

    # ── Step 6: Dispatch (simulated) ────────
    dispatched = []
    for po in created_pos:
        db_po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po["id"]).first()
        if db_po and db_po.status == POStatus.paid:
            db_po.status = POStatus.dispatched
            db.commit()
            dispatched.append(po["po_number"])
            a2p_payment.log_action(db, session_id, "order_dispatched", "Dispatch-Agent",
                                   {"po_id": po["id"], "po_number": po["po_number"]})

    pipeline["steps"]["dispatch"] = {
        "status": "completed",
        "started_at": datetime.utcnow().isoformat(),
        "completed_at": datetime.utcnow().isoformat(),
        "result": {"dispatched_count": len(dispatched), "po_numbers": dispatched},
    }

    # ── Step 7: Update Inventory ────────────
    stock_updates = []
    for po in created_pos:
        db_po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po["id"]).first()
        if db_po and db_po.status == POStatus.dispatched:
            items = json.loads(db_po.items_json or "[]")
            for it in items:
                inv_item = db.query(InventoryItem).filter(
                    InventoryItem.session_id == session_id,
                    InventoryItem.sku == it["sku"],
                ).first()
                if inv_item:
                    old_stock = inv_item.stock
                    inv_item.stock += it["qty"]
                    stock_updates.append({
                        "sku": it["sku"], "name": it["name"],
                        "old_stock": old_stock, "added": it["qty"],
                        "new_stock": inv_item.stock,
                    })
            db_po.status = POStatus.completed
            db.commit()

    pipeline["steps"]["update_inventory"] = {
        "status": "completed",
        "started_at": datetime.utcnow().isoformat(),
        "completed_at": datetime.utcnow().isoformat(),
        "result": {"updates": stock_updates},
    }

    # ── Summary ─────────────────────────────
    pipeline["status"] = "completed"
    pipeline["completed_at"] = datetime.utcnow().isoformat()
    pipeline["summary"] = {
        "items_analysed": qubo.get("qubo_matrix_size", 0),
        "reorder_count": qubo.get("reorder_count", 0),
        "total_order_value": qubo.get("total_reorder_cost", 0),
        "savings_vs_eoq": qubo.get("savings", 0),
        "pos_created": len(created_pos),
        "auto_approved": sum(1 for a in approvals if a.get("auto_approved")),
        "pending_approval": sum(1 for a in approvals if a.get("status") == "pending"),
        "payments_completed": len(payments),
        "dispatched": len(dispatched),
        "stock_updates": len(stock_updates),
    }

    a2p_payment.log_action(db, session_id, "pipeline_completed", "Orchestrator", pipeline["summary"])

    return pipeline


def get_pipeline_status(db: Session, session_id: str) -> dict:
    """Get the last pipeline run summary from audit log."""
    from models import AuditLog
    last = (
        db.query(AuditLog)
        .filter(
            AuditLog.session_id == session_id,
            AuditLog.agent_name == "Orchestrator",
            AuditLog.action.in_(["pipeline_completed", "pipeline_failed"]),
        )
        .order_by(AuditLog.timestamp.desc())
        .first()
    )
    if not last:
        return {"status": "no_runs", "message": "No pipeline runs yet"}

    return {
        "status": last.action.replace("pipeline_", ""),
        "timestamp": last.timestamp.isoformat() if last.timestamp else None,
        "details": json.loads(last.details_json or "{}"),
    }
