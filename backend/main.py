"""FastAPI backend — AI-Powered Financial Intelligence Platform."""

from __future__ import annotations

import io
import json
import os
import traceback
import uuid
from collections import defaultdict
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Query, Body, Form
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import (
    Transaction, InventoryItem, MonthlySales, Invoice, Customer, InvoiceStatus,
    PurchaseOrder, ApprovalRequest, PaymentTransaction, AuditLog, QUBOResult,
)
from agents import (
    aggregation, analytics, inventory, recommendation, forecasting,
    invoice as invoice_agent, quantum_inventory, a2p_payment, orchestrator,
)

# Load .env from project root
_this_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_this_dir)
load_dotenv(os.path.join(_project_root, ".env"))

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("VITE_OPENAI_API_KEY", "")
print(f"[FinAI] API key loaded: {'YES' if OPENAI_API_KEY else 'NO'} (len={len(OPENAI_API_KEY)})")
openai_client = OpenAI(api_key=OPENAI_API_KEY)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(title="FinAI Backend", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Helpers ──────────────────────────────────────────

def _seed_session(db: Session, session_id: str) -> dict:
    """Seed a session with hardcoded retail electronics data (no CSV needed)."""
    import json as _json
    from datetime import datetime as _dt, timedelta as _td
    import random as _rnd

    _rnd.seed(session_id)  # reproducible per session

    # ─── Transactions (18 months of realistic data) ────
    _categories_credit = [
        ("Revenue", "Product sales — electronics retail", ["B2B Customer", "Walk-in", "Online Order"]),
        ("Other Income", "Interest / cashback received", ["HDFC Bank", "Paytm Cashback"]),
    ]
    _categories_debit = [
        ("COGS", "Stock purchase — supplier payment", ["Shenzhen Electro", "Mumbai Wholesale", "DigiParts India"]),
        ("Salary", "Team salary payout", ["Payroll"]),
        ("Rent", "Office & warehouse rent", ["Realty Corp"]),
        ("Marketing", "Ad spend — digital marketing", ["Google Ads", "Meta Ads", "InMobi"]),
        ("Utilities", "Electricity, internet, phone", ["Tata Power", "Airtel", "Jio"]),
        ("Expense", "Packaging, courier, misc", ["Delhivery", "BlueDart", "Office Supplies Co"]),
    ]

    base_date = _dt.now() - _td(days=540)
    monthly_rev: dict[str, float] = defaultdict(float)
    monthly_exp: dict[str, float] = defaultdict(float)
    tx_count = 0

    for day_offset in range(540):
        d = base_date + _td(days=day_offset)
        date_str = d.strftime("%Y-%m-%d")
        month_key = date_str[:7]
        month_num = d.month

        # Seasonal multiplier (Indian market)
        if month_num in (10, 11):
            season = 1.4
        elif month_num == 12:
            season = 1.2
        elif month_num in (3, 4):
            season = 0.8
        else:
            season = 1.0

        # 2-4 credit transactions per day
        for _ in range(_rnd.randint(2, 4)):
            cat, desc, merchants = _rnd.choice(_categories_credit)
            amt = round(_rnd.uniform(5000, 80000) * season, 2)
            db.add(Transaction(
                session_id=session_id, date=date_str,
                description=desc, amount=amt, type="credit",
                category=cat, merchant=_rnd.choice(merchants),
            ))
            monthly_rev[month_key] += amt
            tx_count += 1

        # 1-3 debit transactions per day
        for _ in range(_rnd.randint(1, 3)):
            cat, desc, merchants = _rnd.choice(_categories_debit)
            amt = round(_rnd.uniform(1000, 40000) * season, 2)
            db.add(Transaction(
                session_id=session_id, date=date_str,
                description=desc, amount=amt, type="debit",
                category=cat, merchant=_rnd.choice(merchants),
            ))
            monthly_exp[month_key] += amt
            tx_count += 1

    # ─── Monthly Sales ─────────────────────────────────
    all_months = sorted(set(monthly_rev.keys()) | set(monthly_exp.keys()))
    for month in all_months:
        rev = round(monthly_rev.get(month, 0), 2)
        exp = round(monthly_exp.get(month, 0), 2)
        db.add(MonthlySales(
            session_id=session_id,
            month=month, revenue=rev, expenses=exp,
            profit=round(rev - exp, 2), product="all",
        ))

    # ─── Inventory (distributed: 2 critical, 2 reorder, 2 overstock, 2 healthy) ──
    inv_data = [
        ("Wireless Earbuds Pro",       "WE-001",   3, 80,  250,  599, 160),   # CRITICAL — below safety stock
        ("USB-C Fast Charger 65W",     "UC-002",  42, 50,  120,  349, 100),   # REORDER — at reorder point
        ("Premium Phone Case (iPhone 15)", "PC-003", 210, 80,  80, 249, 150), # HEALTHY
        ("Bluetooth Speaker 20W",      "BS-004",   1, 30,  450, 1299,  50),   # CRITICAL — nearly out
        ("Tempered Glass Screen Protector", "SP-005", 520, 150, 30, 149, 250),# OVERSTOCK — way too much
        ("Laptop Stand Adjustable",    "LS-006",  18, 25,  350,  899,  30),   # REORDER — near reorder point
        ("Power Bank 20000mAh",        "PB-007",  48, 25,  500, 1499,  30),   # HEALTHY
        ("Wireless Ergonomic Mouse",   "WM-008", 155, 30,  200,  533,  50),   # OVERSTOCK — excess inventory
    ]
    for name, sku, stock, reorder, cost, price, sold in inv_data:
        db.add(InventoryItem(
            session_id=session_id,
            name=name, sku=sku, stock=stock, reorder_level=reorder,
            unit_cost=cost, sell_price=price, units_sold_30d=sold,
        ))

    # ─── Customers ─────────────────────────────────────
    _customers = [
        ("Raj Electronics", "raj@electronics.in", "9876543210", "29AABCU9603R1ZM", "Mumbai", 30),
        ("MegaMart Retail", "purchase@megamart.com", "9988776655", "07AAACM1234F1ZK", "Delhi", 15),
        ("Digital Hub", "orders@digitalhub.in", "8899001122", "", "Bangalore", 30),
        ("LK Mobile", "lk@mobile.co", "7766554433", "27AADFL5678G1ZP", "Pune", 45),
        ("QuickBuy Online", "vendor@quickbuy.in", "9090909090", "06AABCQ9999H1ZA", "Chennai", 30),
        ("Corporate Solutions", "procurement@corpsol.com", "8080808080", "33AADFC1111K1ZB", "Hyderabad", 60),
        ("TechDistro Singapore", "imports@techdistro.sg", "+6591234567", "", "Singapore", 45),
    ]
    for name, email, phone, gstin, addr, terms in _customers:
        db.add(Customer(
            session_id=session_id, name=name, email=email, phone=phone,
            gstin=gstin, address=addr, payment_terms=terms,
            total_invoiced=0, total_paid=0,
        ))

    # ─── Invoices ──────────────────────────────────────
    _inv_items_pool = [
        [{"description": "Wireless Earbuds Pro", "quantity": 50, "unit_price": 599, "sku": "WE-001"},
         {"description": "USB-C Fast Charger 65W", "quantity": 30, "unit_price": 349, "sku": "UC-002"}],
        [{"description": "Bluetooth Speaker 20W", "quantity": 20, "unit_price": 1299, "sku": "BS-004"},
         {"description": "Premium Phone Case", "quantity": 40, "unit_price": 249, "sku": "PC-003"}],
        [{"description": "Screen Protector", "quantity": 100, "unit_price": 149, "sku": "SP-005"},
         {"description": "Wireless Mouse", "quantity": 25, "unit_price": 533, "sku": "WM-008"}],
        [{"description": "Power Bank 20000mAh", "quantity": 15, "unit_price": 1499, "sku": "PB-007"},
         {"description": "Laptop Stand Adjustable", "quantity": 10, "unit_price": 899, "sku": "LS-006"}],
        [{"description": "Wireless Earbuds Pro", "quantity": 100, "unit_price": 599, "sku": "WE-001"}],
        [{"description": "USB-C Fast Charger 65W", "quantity": 50, "unit_price": 349, "sku": "UC-002"},
         {"description": "Bluetooth Speaker 20W", "quantity": 30, "unit_price": 1299, "sku": "BS-004"},
         {"description": "Screen Protector", "quantity": 200, "unit_price": 149, "sku": "SP-005"}],
        [{"description": "Premium Phone Case", "quantity": 60, "unit_price": 249, "sku": "PC-003"},
         {"description": "Wireless Mouse", "quantity": 40, "unit_price": 533, "sku": "WM-008"}],
        [{"description": "Power Bank 20000mAh", "quantity": 25, "unit_price": 1499, "sku": "PB-007"}],
    ]
    _statuses = ["paid", "paid", "paid", "sent", "paid", "sent", "overdue", "draft"]
    _dates_offset = [60, 50, 40, 30, 25, 15, 45, 0]

    inv_count = 0
    for idx, (cust_tuple, items, status_str, days_ago) in enumerate(
        zip(_customers, _inv_items_pool, _statuses, _dates_offset)
    ):
        cname = cust_tuple[0]
        cgstin = cust_tuple[3]
        subtotal = sum(it["quantity"] * it["unit_price"] for it in items)
        gst_amt = round(subtotal * 0.18, 2)
        total = round(subtotal + gst_amt, 2)
        inv_date = (_dt.now() - _td(days=days_ago)).strftime("%Y-%m-%d")
        due_date = (_dt.now() - _td(days=days_ago) + _td(days=cust_tuple[5])).strftime("%Y-%m-%d")
        inv_num = f"INV-{_dt.now().strftime('%Y%m')}-{idx+1:04d}"

        db.add(Invoice(
            session_id=session_id,
            invoice_number=inv_num,
            customer_name=cname,
            customer_gstin=cgstin,
            date=inv_date,
            due_date=due_date,
            status=status_str,
            subtotal=round(subtotal, 2),
            gst_rate=18.0,
            gst_amount=gst_amt,
            total=total,
            items_json=_json.dumps(items),
            notes="",
            payment_link=f"https://paytm.me/finai/{inv_num.lower()}",
        ))

        cust = db.query(Customer).filter(
            Customer.session_id == session_id, Customer.name == cname
        ).first()
        if cust:
            cust.total_invoiced = (cust.total_invoiced or 0) + total
            if status_str == "paid":
                cust.total_paid = (cust.total_paid or 0) + total
        inv_count += 1

    db.commit()
    return {
        "transactions": tx_count, "months": len(all_months),
        "products": len(inv_data), "invoices": inv_count,
        "customers": len(_customers),
    }


# ─── Health ───────────────────────────────────────────

@app.get("/api/health")
def health():
    return {"status": "ok"}


# ─── Session Management ──────────────────────────────

@app.post("/api/sessions")
def create_session(db: Session = Depends(get_db)):
    """Create a new isolated session pre-loaded with seed data. Returns session_id."""
    sid = uuid.uuid4().hex[:12]
    stats = _seed_session(db, sid)
    return {"session_id": sid, **stats}


# ─── Login (demo) ────────────────────────────────────

_DEMO_USERS = {
    "user1": "retail",
    "user2": "fnb",
    "user3": "saas",
    "user4": "services",
}


class LoginRequest(BaseModel):
    username: str
    password: str


@app.post("/api/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Demo login — creates a fresh session seeded with data."""
    if req.password != "user123":
        raise HTTPException(status_code=401, detail="Invalid password")
    btype = _DEMO_USERS.get(req.username)
    if not btype:
        raise HTTPException(status_code=401, detail="Unknown user")
    sid = uuid.uuid4().hex[:12]
    _seed_session(db, sid)
    return {"session_id": sid, "business_type": btype, "username": req.username}


# ─── Aggregation Agent ───────────────────────────────

class AggregateRequest(BaseModel):
    raw_text: str


@app.post("/api/aggregation/process")
def process_transactions(
    req: AggregateRequest,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    """Classify and store transactions using GPT-4o mini."""
    try:
        results = aggregation.process_and_store(req.raw_text, openai_client, db, session_id)
        total_credit = sum(t["amount"] for t in results if t["type"] == "credit")
        total_debit = sum(t["amount"] for t in results if t["type"] == "debit")
        return {
            "transactions": results,
            "summary": {
                "total_revenue": round(total_credit, 2),
                "total_expenses": round(total_debit, 2),
                "net_profit": round(total_credit - total_debit, 2),
                "count": len(results),
            },
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/aggregation/upload")
async def upload_statement(
    file: UploadFile = File(...),
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    """Upload a CSV/text bank statement file and process it."""
    content = await file.read()
    raw_text = content.decode("utf-8", errors="replace")
    try:
        results = aggregation.process_and_store(raw_text, openai_client, db, session_id)
        total_credit = sum(t["amount"] for t in results if t["type"] == "credit")
        total_debit = sum(t["amount"] for t in results if t["type"] == "debit")
        return {
            "transactions": results,
            "summary": {
                "total_revenue": round(total_credit, 2),
                "total_expenses": round(total_debit, 2),
                "net_profit": round(total_credit - total_debit, 2),
                "count": len(results),
            },
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ─── Analytics Agent ──────────────────────────────────

@app.get("/api/analytics/summary")
def get_analytics_summary(session_id: str = Query(...), db: Session = Depends(get_db)):
    summary = analytics.get_summary(db, session_id)
    summary["category_breakdown"] = analytics.get_category_breakdown(db, session_id)
    return summary


@app.get("/api/analytics/monthly")
def get_monthly_trends(session_id: str = Query(...), db: Session = Depends(get_db)):
    return analytics.get_monthly_trends(db, session_id)


@app.get("/api/analytics/products")
def get_product_performance(session_id: str = Query(...), db: Session = Depends(get_db)):
    return analytics.get_product_performance(db, session_id)


@app.get("/api/analytics/hero")
def get_hero_product(session_id: str = Query(...), db: Session = Depends(get_db)):
    return analytics.get_hero_product(db, session_id, openai_client)


@app.get("/api/analytics/health-score")
def get_health_score(session_id: str = Query(...), db: Session = Depends(get_db)):
    return analytics.get_health_score(db, session_id)


# ─── Inventory Agent ──────────────────────────────────

@app.get("/api/inventory")
def get_inventory(session_id: str = Query(...), db: Session = Depends(get_db)):
    return inventory.get_all_items(db, session_id)


@app.get("/api/inventory/alerts")
def get_inventory_alerts(session_id: str = Query(...), db: Session = Depends(get_db)):
    return inventory.get_alerts(db, session_id)


@app.get("/api/inventory/optimise")
def optimise_inventory(session_id: str = Query(...), db: Session = Depends(get_db)):
    return inventory.optimise_inventory(db, session_id)


class InventoryAddRequest(BaseModel):
    name: str
    sku: str
    stock: int
    reorder_level: int = 20
    unit_cost: float = 0
    sell_price: float = 0
    units_sold_30d: int = 0


@app.post("/api/inventory")
def add_inventory_item(
    req: InventoryAddRequest,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    return inventory.add_item(db, session_id, req.model_dump())


class StockUpdateRequest(BaseModel):
    sku: str
    stock: int


@app.patch("/api/inventory/stock")
def update_inventory_stock(
    req: StockUpdateRequest,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    return inventory.update_stock(db, session_id, req.sku, req.stock)


# ─── Recommendation Agent ────────────────────────────

@app.post("/api/recommendations/generate")
def generate_recommendations(session_id: str = Query(...), db: Session = Depends(get_db)):
    """Generate fresh AI recommendations using GPT-4o mini."""
    try:
        summary = analytics.get_summary(db, session_id)
        summary["category_breakdown"] = analytics.get_category_breakdown(db, session_id)
        inv_data = inventory.get_all_items(db, session_id)
        recs = recommendation.generate_recommendations(summary, inv_data, openai_client, db, session_id)
        return recs
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/recommendations")
def get_recommendations(session_id: str = Query(...), db: Session = Depends(get_db)):
    """Get cached recommendations."""
    return recommendation.get_cached_recommendations(db, session_id)


# ─── Forecasting Engine ──────────────────────────────

@app.get("/api/forecast/revenue")
def get_revenue_forecast(session_id: str = Query(...), periods: int = 3, db: Session = Depends(get_db)):
    return forecasting.forecast_revenue(db, session_id, periods)


@app.get("/api/forecast/demand")
def get_demand_forecast(session_id: str = Query(...), db: Session = Depends(get_db)):
    return forecasting.forecast_product_demand(db, session_id)


@app.get("/api/forecast/seasonal")
def get_seasonal_analysis(session_id: str = Query(...), db: Session = Depends(get_db)):
    return forecasting.get_seasonal_analysis(db, session_id)


@app.get("/api/forecast/price")
def get_price_forecast(
    session_id: str = Query(...),
    sku: str = Query(None),
    periods: int = Query(6),
    db: Session = Depends(get_db),
):
    return forecasting.forecast_price(db, session_id, sku, periods)


# ─── Invoice Intelligence Agent ──────────────────────

@app.get("/api/invoices/dashboard")
def get_invoice_dashboard(session_id: str = Query(...), db: Session = Depends(get_db)):
    return invoice_agent.get_dashboard(db, session_id)


@app.get("/api/invoices/aging")
def get_invoice_aging(session_id: str = Query(...), db: Session = Depends(get_db)):
    return invoice_agent.get_aging(db, session_id)


@app.get("/api/invoices/activity")
def get_activity_feed(session_id: str = Query(...), db: Session = Depends(get_db)):
    return invoice_agent.get_activity_feed(db, session_id)


@app.get("/api/invoices/trend")
def get_invoice_trend(session_id: str = Query(...), db: Session = Depends(get_db)):
    return invoice_agent.get_monthly_invoice_trend(db, session_id)


@app.get("/api/invoices")
def get_invoices(session_id: str = Query(...), db: Session = Depends(get_db)):
    return invoice_agent.get_invoices(db, session_id)


class InvoiceCreateRequest(BaseModel):
    customer_name: str
    customer_gstin: str = ""
    items: list[dict]
    gst_rate: float = 18.0
    notes: str = ""
    payment_terms_days: int = 30


@app.post("/api/invoices")
def create_invoice(
    req: InvoiceCreateRequest,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    return invoice_agent.create_invoice(
        db, session_id, req.customer_name, req.customer_gstin,
        req.items, req.gst_rate, req.notes, req.payment_terms_days,
    )


@app.post("/api/invoices/extract")
async def extract_invoice(
    session_id: str = Query(...),
    raw_text: str = Form(""),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    """Extract invoice data from raw text, image, or PDF using GPT-4o mini."""
    try:
        if file:
            content = await file.read()
            fname = (file.filename or "").lower()
            ctype = (file.content_type or "").lower()

            # ── Image → GPT-4o mini vision ──
            if ctype.startswith("image/") or fname.endswith((".png", ".jpg", ".jpeg", ".webp", ".gif")):
                mime = ctype if ctype.startswith("image/") else "image/png"
                data = invoice_agent.extract_invoice_from_image(content, mime, openai_client)
                return data

            # ── PDF → extract text with pdfplumber, fallback to vision ──
            if ctype == "application/pdf" or fname.endswith(".pdf"):
                import pdfplumber, io
                text = ""
                images_bytes = []
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text() or ""
                        text += page_text + "\n"
                        # If page has no real text, render as image for vision
                        if len(page_text.strip()) < 20:
                            img = page.to_image(resolution=200).original
                            buf = io.BytesIO()
                            img.save(buf, format="PNG")
                            images_bytes.append(buf.getvalue())
                text = text.strip()
                # If we got enough text, use text extraction
                if len(text) > 50:
                    data = invoice_agent.extract_invoice_data(text, openai_client)
                    return data
                # Otherwise use vision on the first page image
                if images_bytes:
                    data = invoice_agent.extract_invoice_from_image(images_bytes[0], "image/png", openai_client)
                    return data
                if text:
                    data = invoice_agent.extract_invoice_data(text, openai_client)
                    return data
                raise HTTPException(status_code=400, detail="Could not extract text from PDF")

            # ── Plain text/CSV file ──
            text = content.decode("utf-8", errors="replace")
        else:
            text = raw_text

        if not text.strip():
            raise HTTPException(status_code=400, detail="No input provided")
        data = invoice_agent.extract_invoice_data(text, openai_client)
        return data
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Could not parse extracted data")
    except HTTPException:
        raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.patch("/api/invoices/{invoice_id}/pay")
def mark_invoice_paid(
    invoice_id: int,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    return invoice_agent.mark_paid(db, session_id, invoice_id)


@app.get("/api/customers")
def get_customers(session_id: str = Query(...), db: Session = Depends(get_db)):
    return invoice_agent.get_customers(db, session_id)


@app.post("/api/invoices/{invoice_id}/reminder")
def send_reminder(
    invoice_id: int,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    """Generate AI payment reminder for an invoice."""
    inv = db.query(Invoice).filter(
        Invoice.session_id == session_id, Invoice.id == invoice_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    inv_data = {
        "invoice_number": inv.invoice_number,
        "customer_name": inv.customer_name,
        "total": inv.total,
        "due_date": inv.due_date,
        "status": inv.status.value if hasattr(inv.status, "value") else inv.status,
    }
    message = invoice_agent.generate_reminder(inv_data, openai_client)
    return {"reminder": message, "invoice_number": inv.invoice_number}


# ─── QUBO Quantum Inventory Optimization ─────────────

class QUBORequest(BaseModel):
    budget: float | None = None
    capacity: float | None = None


@app.post("/api/qubo/optimize")
def qubo_optimize(
    session_id: str = Query(...),
    req: QUBORequest = QUBORequest(),
    db: Session = Depends(get_db),
):
    """Run QUBO-based inventory optimization via simulated annealing."""
    try:
        return quantum_inventory.run_quantum_optimization(
            db, session_id, budget=req.budget, capacity=req.capacity,
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/qubo/history")
def qubo_history(session_id: str = Query(...), db: Session = Depends(get_db)):
    return quantum_inventory.get_optimization_history(db, session_id)


@app.get("/api/qubo/compare")
def qubo_compare(session_id: str = Query(...), db: Session = Depends(get_db)):
    """Compare QUBO vs traditional EOQ side-by-side."""
    try:
        return quantum_inventory.compare_methods(db, session_id)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# ─── A2P Payment Protocol ────────────────────────────


@app.post("/api/inventory/draft-po")
def draft_po_from_inventory(
    session_id: str = Query(...),
    req: dict = Body(...),
    db: Session = Depends(get_db),
):
    """Create a PO from a single inventory item, run risk assessment."""
    sku = req.get("sku", "")
    name = req.get("name", "")
    qty = req.get("qty", 0)
    unit_cost = req.get("unit_cost", 0)
    total = round(qty * unit_cost, 2)
    supplier = req.get("supplier", "TechSource India Pvt Ltd")

    po_items = [{"sku": sku, "name": name, "qty": qty, "unit_cost": unit_cost, "total": total}]
    po = a2p_payment.create_purchase_order(db, session_id, supplier, po_items, total)
    approval = a2p_payment.create_approval_request(db, session_id, po["id"], auto_approve_low_risk=True)
    return {"po": po, "approval": approval}


@app.get("/api/a2p/purchase-orders")
def get_pos(session_id: str = Query(...), db: Session = Depends(get_db)):
    return a2p_payment.get_purchase_orders(db, session_id)


@app.get("/api/a2p/approvals")
def get_approvals(session_id: str = Query(...), db: Session = Depends(get_db)):
    return a2p_payment.get_pending_approvals(db, session_id)


@app.patch("/api/a2p/approvals/{approval_id}/approve")
def approve_po(
    approval_id: int,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    result = a2p_payment.approve_request(db, session_id, approval_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.patch("/api/a2p/approvals/{approval_id}/reject")
def reject_po(
    approval_id: int,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    result = a2p_payment.reject_request(db, session_id, approval_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.post("/api/a2p/payments/{po_id}/initiate")
def initiate_payment(
    po_id: int,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    result = a2p_payment.initiate_payment(db, session_id, po_id)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@app.post("/api/a2p/payments/{payment_id}/simulate-callback")
def simulate_callback(
    payment_id: int,
    session_id: str = Query(...),
    db: Session = Depends(get_db),
):
    result = a2p_payment.simulate_payment_callback(db, session_id, payment_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@app.get("/api/a2p/payments")
def get_payment_history(session_id: str = Query(...), db: Session = Depends(get_db)):
    return a2p_payment.get_payments(db, session_id)


@app.get("/api/a2p/audit")
def get_audit(session_id: str = Query(...), limit: int = 50, db: Session = Depends(get_db)):
    return a2p_payment.get_audit_trail(db, session_id, limit)


# ─── Orchestrator ────────────────────────────────────

@app.post("/api/orchestrator/run")
def run_pipeline(
    session_id: str = Query(...),
    req: QUBORequest = QUBORequest(),
    db: Session = Depends(get_db),
):
    """Execute the full 8-step agentic pipeline."""
    try:
        return orchestrator.run_full_pipeline(
            db, session_id, budget=req.budget, capacity=req.capacity,
        )
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/orchestrator/status")
def get_pipeline_status(session_id: str = Query(...), db: Session = Depends(get_db)):
    return orchestrator.get_pipeline_status(db, session_id)


# ─── FinAI CRM Chatbot ───────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str

@app.post("/api/chat")
def chat_with_finai(req: ChatRequest, db: Session = Depends(get_db)):
    """FinAI CRM chatbot — answers questions using live DB data."""
    try:
        # Gather live context from DB
        inv_items = inventory.get_all_items(db, req.session_id)
        alerts = inventory.get_alerts(db, req.session_id)
        summary = analytics.get_summary(db, req.session_id)
        health = analytics.get_health_score(db, req.session_id)
        inv_dashboard = invoice_agent.get_dashboard(db, req.session_id)
        aging = invoice_agent.get_aging(db, req.session_id)
        products = analytics.get_product_performance(db, req.session_id)

        # Build a compact context string for GPT
        ctx_parts = []
        ctx_parts.append("=== FINANCIAL SUMMARY ===")
        ctx_parts.append(f"Total Revenue: ₹{summary.get('total_revenue', 0):,.2f}")
        ctx_parts.append(f"Total Expenses: ₹{summary.get('total_expenses', 0):,.2f}")
        ctx_parts.append(f"Net Profit: ₹{summary.get('net_profit', 0):,.2f}")
        ctx_parts.append(f"Profit Margin: {summary.get('profit_margin', 0):.1f}%")
        ctx_parts.append(f"Transaction Count: {summary.get('transaction_count', 0)}")

        ctx_parts.append("\n=== BUSINESS HEALTH SCORE ===")
        ctx_parts.append(f"Overall: {health.get('overall', 0)}/100 ({health.get('grade', 'N/A')})")
        for k, v in health.get("axes", {}).items():
            ctx_parts.append(f"  {v['label']}: {v['score']}/100 ({v['grade']})")

        ctx_parts.append("\n=== INVENTORY ({} items) ===".format(len(inv_items)))
        for item in inv_items:
            ctx_parts.append(
                f"  {item['name']} (SKU: {item['sku']}) — Stock: {item['stock']}, "
                f"Reorder Level: {item['reorder_level']}, Status: {item.get('status', 'N/A')}, "
                f"Unit Cost: ₹{item.get('unit_cost', 0)}, Sell Price: ₹{item.get('sell_price', 0)}, "
                f"Sold (30d): {item.get('units_sold_30d', 0)}"
            )

        if alerts:
            ctx_parts.append(f"\n=== INVENTORY ALERTS ({len(alerts)} items) ===")
            for a in alerts:
                ctx_parts.append(f"  ⚠️ {a['name']} — Status: {a.get('status', 'N/A')}, Stock: {a['stock']}, Reorder: {a['reorder_level']}")

        ctx_parts.append("\n=== INVOICES ===")
        ctx_parts.append(f"Total Invoiced: ₹{inv_dashboard.get('total_invoiced', 0):,.2f}")
        ctx_parts.append(f"Total Paid: ₹{inv_dashboard.get('total_paid', 0):,.2f}")
        ctx_parts.append(f"Total Overdue: ₹{inv_dashboard.get('total_overdue', 0):,.2f}")
        ctx_parts.append(f"Total Pending: ₹{inv_dashboard.get('total_pending', 0):,.2f}")
        status_counts = inv_dashboard.get("status_counts", {})
        ctx_parts.append(f"Status: " + ", ".join(f"{k}: {v}" for k, v in status_counts.items()))

        if inv_dashboard.get("top_customers"):
            ctx_parts.append("\nTop Customers:")
            for tc in inv_dashboard["top_customers"][:5]:
                amt = tc.get('total', tc.get('invoiced', 0))
                ctx_parts.append(f"  {tc['name']}: ₹{amt:,.2f}")

        ctx_parts.append("\n=== AGING (Receivables) ===")
        aging_buckets = aging.get("buckets", []) if isinstance(aging, dict) else aging
        for bucket in aging_buckets:
            lbl = bucket.get('label', bucket.get('bucket', '?'))
            ctx_parts.append(f"  {lbl}: ₹{bucket.get('amount', 0):,.2f} ({bucket.get('count', 0)} invoices)")

        if products:
            ctx_parts.append(f"\n=== TOP PRODUCTS (by revenue) ===")
            for p in products[:8]:
                ctx_parts.append(
                    f"  {p['name']}: Revenue ₹{p.get('revenue', 0):,.2f}, "
                    f"Units: {p.get('units_sold', 0)}, Margin: {p.get('margin', 0):.0f}%"
                )

        db_context = "\n".join(ctx_parts)

        system_prompt = f"""You are FinAI — an intelligent CRM assistant for an Indian electronics retail business.
You have access to LIVE data from the business database. Use it to answer questions accurately.

RULES:
- Always use the actual numbers from the data below. Never make up figures.
- Format currency in Indian Rupees (₹) with commas.
- Be concise but helpful. Use bullet points for lists.
- If asked about inventory, check the inventory data below.
- If asked about invoices or payments, check the invoice data.
- If asked about business health, refer to the health score axes.
- For actionable advice (e.g. "what should I reorder?"), use the alerts and stock levels.
- Keep responses under 200 words unless the user asks for detail.
- You can suggest the user navigate to specific CRM tabs (Inventory, Invoices, Analytics, etc.) for more detail.

LIVE BUSINESS DATA:
{db_context}"""

        resp = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.message},
            ],
            max_tokens=500,
            temperature=0.4,
        )
        reply = resp.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
