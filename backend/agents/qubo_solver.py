"""QUBO Solver — Quadratic Unconstrained Binary Optimization via Simulated Annealing.

Models inventory reorder decisions as binary variables x_i ∈ {0,1} and minimises:
    Σ holding_cost_i · x_i  +  Σ stockout_risk_i · (1 − x_i)  +  Σ penalty_ij · x_i · x_j
"""

from __future__ import annotations

import math
import random
from typing import Any

import numpy as np


# ────────────────────────────────────────────────────────
# 1.  Build QUBO matrix
# ────────────────────────────────────────────────────────

def build_qubo_matrix(
    items: list[dict],
    budget: float | None = None,
    capacity: float | None = None,
    budget_penalty: float = 10.0,
    capacity_penalty: float = 10.0,
) -> np.ndarray:
    """Construct a symmetric Q matrix of shape (n, n).

    Diagonal entries encode linear terms (holding vs stockout).
    Off-diagonal entries encode constraint penalties (budget, capacity).
    """
    n = len(items)
    Q = np.zeros((n, n), dtype=np.float64)

    for i, it in enumerate(items):
        holding_cost = it.get("holding_cost", 0.0)
        stockout_risk = it.get("stockout_risk", 0.0)
        # When x_i=1 (reorder): cost = holding_cost − stockout_risk
        # When x_i=0 (skip):    cost = stockout_risk  (constant, absorbed into offset)
        # Net diagonal effect:
        Q[i, i] = holding_cost - stockout_risk

    # ── Budget constraint via penalty ─────────────
    # penalty * (Σ cost_i · x_i − B)^2
    # Expands to: penalty * [Σ c_i^2 · x_i + 2 Σ_{i<j} c_i·c_j · x_i·x_j − 2B Σ c_i · x_i + B^2]
    if budget is not None and budget > 0:
        costs = np.array([it.get("order_cost", 0.0) for it in items])
        for i in range(n):
            Q[i, i] += budget_penalty * (costs[i] ** 2 - 2 * budget * costs[i])
            for j in range(i + 1, n):
                val = budget_penalty * 2 * costs[i] * costs[j]
                Q[i, j] += val
                Q[j, i] += val

    # ── Capacity constraint via penalty ───────────
    if capacity is not None and capacity > 0:
        volumes = np.array([it.get("volume", 1.0) for it in items])
        for i in range(n):
            Q[i, i] += capacity_penalty * (volumes[i] ** 2 - 2 * capacity * volumes[i])
            for j in range(i + 1, n):
                val = capacity_penalty * 2 * volumes[i] * volumes[j]
                Q[i, j] += val
                Q[j, i] += val

    return Q


# ────────────────────────────────────────────────────────
# 2.  Simulated Annealing solver
# ────────────────────────────────────────────────────────

def _energy(Q: np.ndarray, x: np.ndarray) -> float:
    return float(x @ Q @ x)


def simulated_annealing(
    Q: np.ndarray,
    num_reads: int = 80,
    T_init: float = 1000.0,
    T_min: float = 0.01,
    cooling: float = 0.995,
) -> tuple[np.ndarray, float]:
    """Classic simulated annealing over binary vector x.

    Returns (best_solution, best_energy).
    """
    n = Q.shape[0]
    best_x = np.zeros(n, dtype=np.int8)
    best_e = _energy(Q, best_x)

    for _ in range(num_reads):
        x = np.random.randint(0, 2, size=n).astype(np.int8)
        e = _energy(Q, x)
        T = T_init

        while T > T_min:
            # Flip a random bit
            idx = random.randint(0, n - 1)
            x_new = x.copy()
            x_new[idx] = 1 - x_new[idx]
            e_new = _energy(Q, x_new)
            delta = e_new - e

            if delta < 0 or random.random() < math.exp(-delta / T):
                x = x_new
                e = e_new

            T *= cooling

        if e < best_e:
            best_e = e
            best_x = x.copy()

    return best_x, best_e


# ────────────────────────────────────────────────────────
# 3.  Decode solution
# ────────────────────────────────────────────────────────

def decode_solution(
    binary_vector: np.ndarray,
    items: list[dict],
    budget: float | None = None,
    capacity: float | None = None,
) -> list[dict]:
    """Map binary decisions back to human-readable reorder plan.

    Scales quantities down proportionally when budget or capacity constraints
    would be exceeded, so the output is responsive to user inputs.
    """
    # First pass: collect reorder items with full EOQ
    reorder_indices = [i for i in range(len(items)) if binary_vector[i]]
    eoqs = {i: items[i].get("eoq", 0) for i in reorder_indices}

    # Compute scale factor based on constraints
    scale = 1.0
    if budget is not None and budget > 0 and reorder_indices:
        total_cost = sum(eoqs[i] * items[i].get("unit_cost", 0) for i in reorder_indices)
        if total_cost > budget:
            scale = min(scale, budget / total_cost)
    if capacity is not None and capacity > 0 and reorder_indices:
        total_volume = sum(eoqs[i] for i in reorder_indices)
        if total_volume > capacity:
            scale = min(scale, capacity / total_volume)

    decisions = []
    for i, it in enumerate(items):
        reorder = bool(binary_vector[i])
        if reorder:
            qty = max(1, round(eoqs[i] * scale))
        else:
            qty = 0
        cost = qty * it.get("unit_cost", 0.0)
        decisions.append({
            "sku": it["sku"],
            "name": it["name"],
            "reorder": reorder,
            "qty": qty,
            "unit_cost": it.get("unit_cost", 0.0),
            "cost": round(cost, 2),
            "current_stock": it.get("current_stock", 0),
            "reorder_point": it.get("reorder_point", 0),
            "safety_stock": it.get("safety_stock", 0),
            "urgency": it.get("urgency", "normal"),
            "holding_cost": round(it.get("holding_cost", 0.0), 2),
            "stockout_risk": round(it.get("stockout_risk", 0.0), 2),
        })
    return decisions


# ────────────────────────────────────────────────────────
# 4.  Convenience wrapper
# ────────────────────────────────────────────────────────

def solve(
    items: list[dict],
    budget: float | None = None,
    capacity: float | None = None,
) -> dict[str, Any]:
    """End-to-end: build matrix → solve → decode → return results."""
    Q = build_qubo_matrix(items, budget, capacity)
    solution, energy = simulated_annealing(Q)
    decisions = decode_solution(solution, items, budget=budget, capacity=capacity)

    total_reorder_cost = sum(d["cost"] for d in decisions if d["reorder"])
    reorder_count = sum(1 for d in decisions if d["reorder"])

    return {
        "qubo_matrix_size": len(items),
        "solver_method": "simulated_annealing",
        "energy": round(energy, 4),
        "decisions": decisions,
        "reorder_count": reorder_count,
        "skip_count": len(items) - reorder_count,
        "total_reorder_cost": round(total_reorder_cost, 2),
        "qubo_matrix": Q.tolist(),
    }
