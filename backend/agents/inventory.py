"""Inventory Agent — stock tracking, alerts, supply-chain optimisation (EOQ, reorder, safety stock)."""

import math
from sqlalchemy.orm import Session
from models import InventoryItem


def get_all_items(db: Session, session_id: str) -> list[dict]:
    items = db.query(InventoryItem).filter(InventoryItem.session_id == session_id).order_by(InventoryItem.name).all()
    result = []
    for item in items:
        turnover = round(item.units_sold_30d / max(item.stock, 1), 2)
        if item.stock <= item.reorder_level * 0.3:
            status = "critical"
        elif item.stock <= item.reorder_level:
            status = "low"
        else:
            status = "healthy"
        result.append({
            "id": item.id,
            "name": item.name,
            "sku": item.sku,
            "stock": item.stock,
            "reorder_level": item.reorder_level,
            "unit_cost": item.unit_cost,
            "sell_price": item.sell_price,
            "units_sold_30d": item.units_sold_30d,
            "turnover": turnover,
            "status": status,
        })
    return result


def get_alerts(db: Session, session_id: str) -> list[dict]:
    items = get_all_items(db, session_id)
    return [i for i in items if i["status"] != "healthy"]


def add_item(db: Session, session_id: str, data: dict) -> dict:
    item = InventoryItem(session_id=session_id, **data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "name": item.name, "sku": item.sku}


def update_stock(db: Session, session_id: str, sku: str, new_stock: int) -> dict:
    item = db.query(InventoryItem).filter(
        InventoryItem.session_id == session_id, InventoryItem.sku == sku
    ).first()
    if not item:
        return {"error": "Item not found"}
    item.stock = new_stock
    db.commit()
    return {"sku": sku, "stock": new_stock}


def optimise_inventory(db: Session, session_id: str) -> list[dict]:
    """
    Supply-chain inventory optimisation using:
    - EOQ (Economic Order Quantity) = sqrt(2 * D * S / H)
      where D = annual demand, S = ordering cost, H = holding cost/unit/year
    - Reorder Point = (avg_daily_demand * lead_time_days) + safety_stock
    - Safety Stock = Z * sigma * sqrt(lead_time_days)
      Z = 1.65 for 95% service level

    Returns actionable per-SKU recommendations.
    """
    items = db.query(InventoryItem).filter(InventoryItem.session_id == session_id).all()
    results = []

    # Assumptions (could be made configurable per business type)
    ORDERING_COST = 500       # ₹ per order placed
    HOLDING_RATE = 0.20       # 20% of unit cost per year = holding cost
    LEAD_TIME_DAYS = 7        # days to receive order
    DEMAND_SIGMA_FACTOR = 0.2 # 20% variability in demand (σ = 20% of avg daily demand)
    Z_95 = 1.65               # z-score for 95% service level

    for item in items:
        daily_demand = item.units_sold_30d / 30.0
        annual_demand = daily_demand * 365

        unit_cost = max(item.unit_cost, 1)
        holding_cost = unit_cost * HOLDING_RATE

        # EOQ
        if annual_demand > 0 and holding_cost > 0:
            eoq = math.sqrt((2 * annual_demand * ORDERING_COST) / holding_cost)
            eoq = max(1, round(eoq))
        else:
            eoq = item.reorder_level * 2

        # Safety Stock
        sigma_daily_demand = daily_demand * DEMAND_SIGMA_FACTOR
        safety_stock = round(Z_95 * sigma_daily_demand * math.sqrt(LEAD_TIME_DAYS))
        safety_stock = max(safety_stock, 1)

        # Reorder Point
        reorder_point = round((daily_demand * LEAD_TIME_DAYS) + safety_stock)
        reorder_point = max(reorder_point, item.reorder_level)

        # Days until stockout (considering safety stock as minimum)
        usable_stock = item.stock - safety_stock
        if daily_demand > 0:
            days_until_stockout = max(0, round(usable_stock / daily_demand))
        else:
            days_until_stockout = 999

        # Quantity to order (EOQ-based)
        qty_to_order = eoq

        # Action
        if item.stock <= safety_stock:
            action = "BUY_NOW"
            urgency = "critical"
            action_label = f"Order {qty_to_order} units immediately — below safety stock"
        elif item.stock <= reorder_point:
            action = "BUY_NOW"
            urgency = "high"
            action_label = f"Order {qty_to_order} units — at reorder point"
        elif days_until_stockout <= LEAD_TIME_DAYS + 3:
            action = "BUY_SOON"
            urgency = "medium"
            action_label = f"Order {qty_to_order} units within {days_until_stockout} days"
        elif item.stock > reorder_point * 3 and daily_demand > 0:
            action = "OVERSTOCK"
            urgency = "low"
            overstock_days = round(item.stock / daily_demand)
            action_label = f"Overstocked — {overstock_days} days of supply. Reduce next order."
        else:
            action = "HEALTHY"
            urgency = "none"
            action_label = f"On track — next reorder in ~{days_until_stockout} days"

        # Stock health percentage vs optimal
        optimal_stock = reorder_point + eoq
        stock_vs_optimal = round(item.stock / max(optimal_stock, 1) * 100, 1)

        results.append({
            "id": item.id,
            "name": item.name,
            "sku": item.sku,
            "current_stock": item.stock,
            "daily_demand": round(daily_demand, 1),
            "annual_demand": round(annual_demand),
            "eoq": eoq,
            "safety_stock": safety_stock,
            "reorder_point": reorder_point,
            "days_until_stockout": days_until_stockout,
            "qty_to_order": qty_to_order,
            "optimal_stock": optimal_stock,
            "stock_vs_optimal_pct": stock_vs_optimal,
            "action": action,
            "urgency": urgency,
            "action_label": action_label,
            "unit_cost": item.unit_cost,
            "sell_price": item.sell_price,
            "order_value": round(qty_to_order * item.unit_cost, 2),
        })

    # Sort: critical first, then by days until stockout
    urgency_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "none": 4}
    results.sort(key=lambda x: (urgency_order.get(x["urgency"], 5), x["days_until_stockout"]))
    return results
