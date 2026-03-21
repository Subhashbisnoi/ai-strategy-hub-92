"""Analytics Agent — KPIs, revenue vs expense, product performance, hero product, health score."""

import math
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from openai import OpenAI
from models import Transaction, MonthlySales, InventoryItem, Invoice, Customer, InvoiceStatus


def get_summary(db: Session, session_id: str) -> dict:
    """Return overall financial KPIs."""
    total_revenue = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.session_id == session_id, Transaction.type == "credit")
        .scalar()
    )
    total_expenses = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.session_id == session_id, Transaction.type == "debit")
        .scalar()
    )
    profit = total_revenue - total_expenses
    margin = (profit / total_revenue * 100) if total_revenue else 0
    tx_count = db.query(func.count(Transaction.id)).filter(Transaction.session_id == session_id).scalar()

    return {
        "total_revenue": round(total_revenue, 2),
        "total_expenses": round(total_expenses, 2),
        "net_profit": round(profit, 2),
        "profit_margin": round(margin, 1),
        "transaction_count": tx_count,
    }


def get_category_breakdown(db: Session, session_id: str) -> list[dict]:
    """Revenue / expense breakdown by category."""
    rows = (
        db.query(Transaction.category, Transaction.type, func.sum(Transaction.amount))
        .filter(Transaction.session_id == session_id)
        .group_by(Transaction.category, Transaction.type)
        .all()
    )
    return [
        {"category": cat, "type": typ, "total": round(total, 2)}
        for cat, typ, total in rows
    ]


def get_monthly_trends(db: Session, session_id: str) -> list[dict]:
    """Monthly revenue + expense from monthly_sales table."""
    rows = (
        db.query(MonthlySales)
        .filter(MonthlySales.session_id == session_id, MonthlySales.product == "all")
        .order_by(MonthlySales.month)
        .all()
    )
    return [
        {
            "month": r.month,
            "revenue": r.revenue,
            "expenses": r.expenses,
            "profit": r.profit,
        }
        for r in rows
    ]


def get_product_performance(db: Session, session_id: str) -> list[dict]:
    """Product performance from inventory + monthly_sales."""
    items = db.query(InventoryItem).filter(InventoryItem.session_id == session_id).all()
    result = []
    for item in items:
        revenue = item.units_sold_30d * item.sell_price
        cost = item.units_sold_30d * item.unit_cost
        margin = ((revenue - cost) / revenue * 100) if revenue else 0
        result.append({
            "name": item.name,
            "sku": item.sku,
            "revenue": round(revenue, 2),
            "units_sold": item.units_sold_30d,
            "margin": round(margin, 1),
        })
    result.sort(key=lambda x: x["revenue"], reverse=True)
    return result


def get_hero_product(db: Session, session_id: str, openai_client: Optional[OpenAI] = None) -> dict:
    """
    Identify hero product (highest revenue), worst performer, revenue concentration risk.
    Uses GPT-4o mini for narrative if client provided.
    """
    items = db.query(InventoryItem).filter(InventoryItem.session_id == session_id).all()
    if not items:
        return {"hero": None, "worst": None, "concentration_risk": "low", "hhi": 0, "narrative": "No products found."}

    products = []
    for item in items:
        rev = item.units_sold_30d * item.sell_price
        cost = item.units_sold_30d * item.unit_cost
        margin = ((rev - cost) / rev * 100) if rev else 0
        products.append({
            "name": item.name,
            "sku": item.sku,
            "revenue": round(rev, 2),
            "units_sold": item.units_sold_30d,
            "margin": round(margin, 1),
            "stock": item.stock,
            "sell_price": item.sell_price,
            "unit_cost": item.unit_cost,
            "reorder_level": item.reorder_level,
        })

    products.sort(key=lambda x: x["revenue"], reverse=True)
    total_rev = sum(p["revenue"] for p in products) or 1

    # Herfindahl-Hirschman Index (revenue concentration)
    hhi = sum((p["revenue"] / total_rev * 100) ** 2 for p in products)
    hhi = round(hhi, 1)

    if hhi > 4000:
        concentration_risk = "critical"
        risk_label = "Very High — over-reliant on one product"
    elif hhi > 2500:
        concentration_risk = "high"
        risk_label = "High — top product dominates revenue"
    elif hhi > 1500:
        concentration_risk = "moderate"
        risk_label = "Moderate — some diversification needed"
    else:
        concentration_risk = "low"
        risk_label = "Low — healthy product diversification"

    hero = products[0]
    hero["revenue_share"] = round(hero["revenue"] / total_rev * 100, 1)
    hero["rank"] = 1

    worst = products[-1] if len(products) > 1 else None
    if worst:
        worst["revenue_share"] = round(worst["revenue"] / total_rev * 100, 1)
        worst["rank"] = len(products)

    # AI narrative
    narrative = _generate_hero_narrative(hero, worst, hhi, concentration_risk, openai_client)

    return {
        "hero": hero,
        "worst": worst,
        "all_products": products,
        "concentration_risk": concentration_risk,
        "risk_label": risk_label,
        "hhi": hhi,
        "narrative": narrative,
        "total_revenue": round(total_rev, 2),
    }


def _generate_hero_narrative(hero: dict, worst: Optional[dict], hhi: float,
                              risk: str, client: Optional[OpenAI]) -> str:
    if not client:
        rev_share = hero.get("revenue_share", 0)
        return (
            f"{hero['name']} is your #1 product driving {rev_share}% of revenue "
            f"at {hero['margin']}% margin. "
            + (f"Consider bundling with {worst['name']} to boost its sales." if worst else "")
        )
    try:
        prompt = (
            f"You are a business analyst AI. Give a 2-sentence actionable insight about:\n"
            f"Hero product: {hero['name']} — {hero['revenue_share']}% of revenue, "
            f"margin {hero['margin']}%, {hero['units_sold']} units/month.\n"
            f"Worst performer: {worst['name'] if worst else 'N/A'} — "
            f"{worst['revenue_share'] if worst else 0}% revenue, {worst['margin'] if worst else 0}% margin.\n"
            f"Revenue concentration (HHI): {hhi} ({risk} risk).\n"
            f"Be specific and actionable. Mention price, bundling, or discontinuation where relevant."
        )
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        rev_share = hero.get("revenue_share", 0)
        return (
            f"{hero['name']} drives {rev_share}% of your revenue at {hero['margin']}% margin — "
            f"protect and grow this product. "
            + (f"Consider discontinuing or promoting {worst['name']}." if worst else "")
        )


def get_health_score(db: Session, session_id: str) -> dict:
    """
    Compute a 5-axis business health score (0–100 each):
    1. Revenue Growth (MoM trend)
    2. Profit Margin
    3. Collection Rate (paid / total invoiced)
    4. Inventory Health (% items healthy)
    5. Customer Retention (repeat customers)
    """
    axes = {}

    # 1. Revenue Growth — compute from transactions grouped by month
    from sqlalchemy import extract, cast, String
    monthly_rev = (
        db.query(
            func.substr(Transaction.date, 1, 7).label("month"),
            func.sum(Transaction.amount).label("rev"),
        )
        .filter(Transaction.session_id == session_id, Transaction.type == "credit")
        .group_by(func.substr(Transaction.date, 1, 7))
        .order_by(func.substr(Transaction.date, 1, 7))
        .all()
    )
    if len(monthly_rev) >= 2:
        recent = monthly_rev[-1].rev or 0
        prev = monthly_rev[-2].rev or 1
        growth_pct = (recent - prev) / prev * 100
        axes["revenue_growth"] = round(min(100, max(0, 50 + growth_pct * 1.67)), 1)
    elif len(monthly_rev) == 1:
        axes["revenue_growth"] = 65.0  # single month = decent
    else:
        axes["revenue_growth"] = 50.0

    # 2. Profit Margin (0–40% maps to 0–100)
    total_rev = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.session_id == session_id, Transaction.type == "credit")
        .scalar()
    )
    total_exp = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(Transaction.session_id == session_id, Transaction.type == "debit")
        .scalar()
    )
    margin = ((total_rev - total_exp) / total_rev * 100) if total_rev else 0
    axes["profit_margin"] = round(min(100, max(0, margin * 2.5)), 1)

    # 3. Collection Rate
    invoices = db.query(Invoice).filter(Invoice.session_id == session_id).all()
    if invoices:
        total_inv = sum(i.total for i in invoices)
        total_paid = sum(
            i.total for i in invoices
            if i.status == InvoiceStatus.paid
            or (hasattr(i.status, 'value') and i.status.value == 'paid')
            or str(i.status) in ('paid', 'InvoiceStatus.paid')
        )
        collection_rate = (total_paid / total_inv * 100) if total_inv else 0
        axes["collection_rate"] = round(max(collection_rate, 20.0), 1)  # floor at 20 for sent invoices
    else:
        axes["collection_rate"] = 50.0

    # 4. Inventory Health (% of items with healthy status)
    inv_items = db.query(InventoryItem).filter(InventoryItem.session_id == session_id).all()
    if inv_items:
        healthy = sum(1 for i in inv_items if i.stock > i.reorder_level)
        axes["inventory_health"] = round(max(healthy / len(inv_items) * 100, 15.0), 1)
    else:
        axes["inventory_health"] = 50.0

    # 5. Customer Retention (customers with >1 invoice)
    if invoices:
        from collections import Counter
        customer_counts = Counter(i.customer_name for i in invoices)
        repeat = sum(1 for c in customer_counts.values() if c > 1)
        total_customers = len(customer_counts)
        base = round(repeat / total_customers * 100, 1) if total_customers else 0
        # bonus for having multiple customers even without repeats
        diversity_bonus = min(20, total_customers * 5)
        axes["customer_retention"] = round(min(100, max(base + diversity_bonus, 20.0)), 1)
    else:
        axes["customer_retention"] = 50.0

    overall = round(sum(axes.values()) / len(axes), 1)

    def grade(score: float) -> str:
        if score >= 80:
            return "excellent"
        elif score >= 60:
            return "good"
        elif score >= 40:
            return "fair"
        return "poor"

    return {
        "overall": overall,
        "grade": grade(overall),
        "axes": {
            "revenue_growth": {"score": axes["revenue_growth"], "label": "Revenue Growth", "grade": grade(axes["revenue_growth"])},
            "profit_margin": {"score": axes["profit_margin"], "label": "Profit Margin", "grade": grade(axes["profit_margin"])},
            "collection_rate": {"score": axes["collection_rate"], "label": "Collection Rate", "grade": grade(axes["collection_rate"])},
            "inventory_health": {"score": axes["inventory_health"], "label": "Inventory Health", "grade": grade(axes["inventory_health"])},
            "customer_retention": {"score": axes["customer_retention"], "label": "Customer Retention", "grade": grade(axes["customer_retention"])},
        },
    }
