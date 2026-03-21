"""Invoice Intelligence Agent — smart invoice generation, OCR extraction, payment tracking."""

from __future__ import annotations

import json
from datetime import datetime, timedelta
from openai import OpenAI
from sqlalchemy.orm import Session
from sqlalchemy import func as sa_func
from models import Invoice, Customer, Transaction, InventoryItem, InvoiceStatus, MonthlySales


# ─── GPT prompts ──────────────────────────────────────

EXTRACT_PROMPT = """You are an invoice data extraction agent for Indian small businesses.
Given raw text (from a document, chat, email, or PDF), extract invoice data.
Return a JSON object:
{
  "customer_name": "<name>",
  "customer_gstin": "<GSTIN if found, else empty string>",
  "items": [
    {"description": "<item>", "quantity": <int>, "unit_price": <float>, "sku": "<if found>"}
  ],
  "notes": "<any special notes>",
  "payment_terms_days": <int, default 30>
}
Return ONLY the JSON object, nothing else."""

REMINDER_PROMPT = """You are a polite payment reminder assistant for Indian small businesses.
Given invoice details, generate a short professional payment reminder message (2-3 lines).
Include the invoice number, amount, and due date. Be polite but firm.
Return ONLY the message text, nothing else."""


def extract_invoice_data(raw_text: str, client: OpenAI) -> dict:
    """Use GPT-4o mini to extract structured invoice data from raw text."""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": EXTRACT_PROMPT},
            {"role": "user", "content": raw_text},
        ],
        temperature=0.1,
        max_tokens=2048,
    )
    content = resp.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0]
    return json.loads(content)


def extract_invoice_from_image(image_bytes: bytes, mime_type: str, client: OpenAI) -> dict:
    """Use GPT-4o mini vision to extract invoice data from an image."""
    import base64
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": EXTRACT_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": "Extract invoice data from this image."},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{b64}"},
                    },
                ],
            },
        ],
        temperature=0.1,
        max_tokens=2048,
    )
    content = resp.choices[0].message.content.strip()
    if content.startswith("```"):
        content = content.split("\n", 1)[1]
        content = content.rsplit("```", 1)[0]
    return json.loads(content)


def create_invoice(
    db: Session,
    session_id: str,
    customer_name: str,
    customer_gstin: str,
    items: list[dict],
    gst_rate: float,
    notes: str,
    payment_terms_days: int,
) -> dict:
    """Create a GST-compliant invoice and corresponding transaction."""
    subtotal = sum(item["quantity"] * item["unit_price"] for item in items)
    gst_amount = round(subtotal * gst_rate / 100, 2)
    total = round(subtotal + gst_amount, 2)

    count = db.query(sa_func.count(Invoice.id)).filter(Invoice.session_id == session_id).scalar()
    inv_number = f"INV-{datetime.now().strftime('%Y%m')}-{count + 1:04d}"

    today = datetime.now().strftime("%Y-%m-%d")
    due = (datetime.now() + timedelta(days=payment_terms_days)).strftime("%Y-%m-%d")

    payment_link = f"https://paytm.me/finai/{inv_number.lower()}"

    invoice = Invoice(
        session_id=session_id,
        invoice_number=inv_number,
        customer_name=customer_name,
        customer_gstin=customer_gstin,
        date=today,
        due_date=due,
        status=InvoiceStatus.sent,
        subtotal=round(subtotal, 2),
        gst_rate=gst_rate,
        gst_amount=gst_amount,
        total=total,
        items_json=json.dumps(items),
        notes=notes,
        payment_link=payment_link,
    )
    db.add(invoice)

    # Credit transaction for Analytics/Forecasting
    db.add(Transaction(
        session_id=session_id,
        date=today,
        description=f"Invoice {inv_number} — {customer_name}",
        amount=total,
        type="credit",
        category="Revenue",
        merchant=customer_name,
    ))

    # Deduct inventory stock for items with matching SKUs or names
    stock_updates = []
    total_cogs = 0.0
    for item in items:
        sku = item.get("sku", "").strip()
        desc = item.get("description", "").strip().lower()
        inv_item = None

        # Try by SKU first
        if sku:
            inv_item = db.query(InventoryItem).filter(
                InventoryItem.session_id == session_id, InventoryItem.sku == sku
            ).first()

        # Fallback: match by product name
        if not inv_item and desc:
            all_inv = db.query(InventoryItem).filter(
                InventoryItem.session_id == session_id
            ).all()
            for candidate in all_inv:
                if candidate.name.lower() in desc or desc in candidate.name.lower():
                    inv_item = candidate
                    break

        if inv_item:
            old_stock = inv_item.stock
            qty = item.get("quantity", 0)
            inv_item.stock = max(0, inv_item.stock - qty)
            inv_item.units_sold_30d = (inv_item.units_sold_30d or 0) + qty
            cogs = qty * (inv_item.unit_cost or 0)
            total_cogs += cogs
            stock_updates.append({
                "sku": inv_item.sku, "product": inv_item.name,
                "old_stock": old_stock, "new_stock": inv_item.stock,
                "deducted": qty,
            })

    # Debit transaction for cost of goods sold
    if total_cogs > 0:
        db.add(Transaction(
            session_id=session_id,
            date=today,
            description=f"COGS for {inv_number}",
            amount=round(total_cogs, 2),
            type="debit",
            category="Cost of Goods Sold",
            merchant="Inventory",
        ))

    # Upsert customer
    cust = db.query(Customer).filter(
        Customer.session_id == session_id,
        Customer.name == customer_name,
    ).first()
    if cust:
        cust.total_invoiced = (cust.total_invoiced or 0) + total
        if customer_gstin:
            cust.gstin = customer_gstin
    else:
        db.add(Customer(
            session_id=session_id,
            name=customer_name,
            gstin=customer_gstin,
            payment_terms=payment_terms_days,
            total_invoiced=total,
        ))

    # Upsert MonthlySales for current month so health score + trends stay current
    current_month = datetime.now().strftime("%Y-%m")
    ms = db.query(MonthlySales).filter(
        MonthlySales.session_id == session_id,
        MonthlySales.month == current_month,
        MonthlySales.product == "all",
    ).first()
    if ms:
        ms.revenue = (ms.revenue or 0) + total
        ms.expenses = (ms.expenses or 0) + round(total_cogs, 2)
        ms.profit = ms.revenue - ms.expenses
    else:
        db.add(MonthlySales(
            session_id=session_id,
            month=current_month,
            revenue=total,
            expenses=round(total_cogs, 2),
            profit=round(total - total_cogs, 2),
            product="all",
        ))

    db.commit()

    return {
        "invoice_number": inv_number,
        "customer_name": customer_name,
        "date": today,
        "due_date": due,
        "items": items,
        "subtotal": round(subtotal, 2),
        "gst_rate": gst_rate,
        "gst_amount": gst_amount,
        "total": total,
        "status": "sent",
        "payment_link": payment_link,
        "stock_updates": stock_updates,
    }


def get_invoices(db: Session, session_id: str) -> list[dict]:
    """Return all invoices for the session."""
    rows = (
        db.query(Invoice)
        .filter(Invoice.session_id == session_id)
        .order_by(Invoice.date.desc())
        .all()
    )
    return [
        {
            "id": r.id,
            "invoice_number": r.invoice_number,
            "customer_name": r.customer_name,
            "customer_gstin": r.customer_gstin,
            "date": r.date,
            "due_date": r.due_date,
            "status": r.status.value if hasattr(r.status, "value") else r.status,
            "subtotal": r.subtotal,
            "gst_rate": r.gst_rate,
            "gst_amount": r.gst_amount,
            "total": r.total,
            "items": json.loads(r.items_json),
            "notes": r.notes,
            "payment_link": r.payment_link,
        }
        for r in rows
    ]


def get_dashboard(db: Session, session_id: str) -> dict:
    """CRM dashboard stats with trends."""
    invoices = db.query(Invoice).filter(Invoice.session_id == session_id).all()
    customers = db.query(Customer).filter(Customer.session_id == session_id).all()
    today_str = datetime.now().strftime("%Y-%m-%d")

    # Auto-mark overdue
    for inv in invoices:
        if inv.status == InvoiceStatus.sent and inv.due_date < today_str:
            inv.status = InvoiceStatus.overdue
    db.commit()

    total_invoiced = sum(i.total for i in invoices)
    total_paid = sum(i.total for i in invoices if i.status == InvoiceStatus.paid)
    total_overdue = sum(i.total for i in invoices if i.status == InvoiceStatus.overdue)
    total_pending = sum(
        i.total for i in invoices
        if i.status in (InvoiceStatus.sent, InvoiceStatus.draft)
    )

    # Top 5 customers by revenue (computed from invoices, not stale Customer fields)
    cust_totals: dict = {}
    for inv in invoices:
        cn = inv.customer_name
        if cn not in cust_totals:
            cust_totals[cn] = {"invoiced": 0.0, "paid": 0.0}
        cust_totals[cn]["invoiced"] += inv.total or 0
        if inv.status == InvoiceStatus.paid:
            cust_totals[cn]["paid"] += inv.total or 0
    top_customers = sorted(
        [{"name": k, "invoiced": round(v["invoiced"], 2), "paid": round(v["paid"], 2),
          "outstanding": round(v["invoiced"] - v["paid"], 2)}
         for k, v in cust_totals.items()],
        key=lambda x: x["invoiced"], reverse=True
    )[:5]

    # Status breakdown
    status_counts = {"draft": 0, "sent": 0, "paid": 0, "overdue": 0, "cancelled": 0}
    for inv in invoices:
        s = inv.status.value if hasattr(inv.status, "value") else inv.status
        status_counts[s] = status_counts.get(s, 0) + 1

    return {
        "total_invoiced": round(total_invoiced, 2),
        "total_paid": round(total_paid, 2),
        "total_overdue": round(total_overdue, 2),
        "total_pending": round(total_pending, 2),
        "invoice_count": len(invoices),
        "customer_count": len(customers),
        "collection_rate": round((total_paid / total_invoiced * 100) if total_invoiced else 0, 1),
        "top_customers": top_customers,
        "status_counts": status_counts,
    }


def get_aging(db: Session, session_id: str) -> dict:
    """Receivables aging analysis in 0-30, 31-60, 61-90, 90+ buckets."""
    invoices = db.query(Invoice).filter(
        Invoice.session_id == session_id,
        Invoice.status.in_([InvoiceStatus.sent, InvoiceStatus.overdue]),
    ).all()
    today = datetime.now()
    buckets = {"0-30": 0.0, "31-60": 0.0, "61-90": 0.0, "90+": 0.0}
    bucket_counts = {"0-30": 0, "31-60": 0, "61-90": 0, "90+": 0}

    for inv in invoices:
        try:
            inv_date = datetime.strptime(inv.date, "%Y-%m-%d")
        except ValueError:
            continue
        days = (today - inv_date).days
        if days <= 30:
            key = "0-30"
        elif days <= 60:
            key = "31-60"
        elif days <= 90:
            key = "61-90"
        else:
            key = "90+"
        buckets[key] += inv.total
        bucket_counts[key] += 1

    total_outstanding = sum(buckets.values())
    return {
        "buckets": [
            {"label": k, "amount": round(v, 2), "count": bucket_counts[k],
             "percent": round(v / total_outstanding * 100, 1) if total_outstanding else 0}
            for k, v in buckets.items()
        ],
        "total_outstanding": round(total_outstanding, 2),
    }


def get_activity_feed(db: Session, session_id: str, limit: int = 10) -> list[dict]:
    """Recent activity events — invoices, payments, etc."""
    invoices = (
        db.query(Invoice)
        .filter(Invoice.session_id == session_id)
        .order_by(Invoice.created_at.desc())
        .limit(limit)
        .all()
    )
    events = []
    for inv in invoices:
        status = inv.status.value if hasattr(inv.status, "value") else inv.status
        if status == "paid":
            events.append({
                "type": "payment",
                "icon": "check",
                "title": f"Payment received — {inv.invoice_number}",
                "subtitle": f"{inv.customer_name} paid ₹{inv.total:,.0f}",
                "date": inv.date,
                "color": "green",
            })
        elif status == "overdue":
            events.append({
                "type": "overdue",
                "icon": "alert",
                "title": f"Invoice overdue — {inv.invoice_number}",
                "subtitle": f"{inv.customer_name} owes ₹{inv.total:,.0f} (due {inv.due_date})",
                "date": inv.date,
                "color": "red",
            })
        elif status == "sent":
            events.append({
                "type": "invoice",
                "icon": "send",
                "title": f"Invoice sent — {inv.invoice_number}",
                "subtitle": f"₹{inv.total:,.0f} to {inv.customer_name}",
                "date": inv.date,
                "color": "blue",
            })
        else:
            events.append({
                "type": "draft",
                "icon": "file",
                "title": f"Draft created — {inv.invoice_number}",
                "subtitle": f"₹{inv.total:,.0f} for {inv.customer_name}",
                "date": inv.date,
                "color": "gray",
            })
    return events


def get_monthly_invoice_trend(db: Session, session_id: str) -> list[dict]:
    """Monthly invoice totals for trend chart."""
    invoices = db.query(Invoice).filter(Invoice.session_id == session_id).all()
    monthly: dict[str, dict] = {}
    for inv in invoices:
        month = inv.date[:7]
        if month not in monthly:
            monthly[month] = {"month": month, "invoiced": 0, "collected": 0, "count": 0}
        monthly[month]["invoiced"] += inv.total
        monthly[month]["count"] += 1
        if inv.status == InvoiceStatus.paid:
            monthly[month]["collected"] += inv.total

    result = sorted(monthly.values(), key=lambda x: x["month"])
    for r in result:
        r["invoiced"] = round(r["invoiced"], 2)
        r["collected"] = round(r["collected"], 2)
    return result


def mark_paid(db: Session, session_id: str, invoice_id: int) -> dict:
    """Mark an invoice as paid and update customer totals."""
    inv = db.query(Invoice).filter(
        Invoice.session_id == session_id, Invoice.id == invoice_id
    ).first()
    if not inv:
        return {"error": "Invoice not found"}
    inv.status = InvoiceStatus.paid

    cust = db.query(Customer).filter(
        Customer.session_id == session_id, Customer.name == inv.customer_name
    ).first()
    if cust:
        cust.total_paid = (cust.total_paid or 0) + inv.total

    db.commit()
    return {"invoice_number": inv.invoice_number, "status": "paid"}


def get_customers(db: Session, session_id: str) -> list[dict]:
    """Return all customers for the session."""
    rows = db.query(Customer).filter(Customer.session_id == session_id).order_by(Customer.name).all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "email": r.email,
            "phone": r.phone,
            "gstin": r.gstin,
            "payment_terms": r.payment_terms,
            "total_invoiced": round(r.total_invoiced or 0, 2),
            "total_paid": round(r.total_paid or 0, 2),
            "outstanding": round((r.total_invoiced or 0) - (r.total_paid or 0), 2),
        }
        for r in rows
    ]


def generate_reminder(inv_data: dict, client: OpenAI) -> str:
    """Generate a smart payment reminder using GPT-4o mini."""
    user_content = (
        f"Invoice: {inv_data['invoice_number']}\n"
        f"Customer: {inv_data['customer_name']}\n"
        f"Amount: ₹{inv_data['total']:,.2f}\n"
        f"Due Date: {inv_data['due_date']}\n"
        f"Status: {inv_data['status']}"
    )
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": REMINDER_PROMPT},
            {"role": "user", "content": user_content},
        ],
        temperature=0.7,
        max_tokens=256,
    )
    return resp.choices[0].message.content.strip()
