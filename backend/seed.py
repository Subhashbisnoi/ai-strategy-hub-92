"""Seed the SQLite database from the rich business_sales_data.csv.

Usage:
    python seed.py                 # seeds with session_id="demo"
    python seed.py my_session_id   # seeds with a custom session_id
"""

import csv
import os
import sys
from collections import defaultdict
from database import engine, SessionLocal, Base
from models import Transaction, InventoryItem, MonthlySales

Base.metadata.create_all(bind=engine)
db = SessionLocal()

SESSION_ID = sys.argv[1] if len(sys.argv) > 1 else "demo"

# Clear only this session's data
db.query(Transaction).filter(Transaction.session_id == SESSION_ID).delete()
db.query(InventoryItem).filter(InventoryItem.session_id == SESSION_ID).delete()
db.query(MonthlySales).filter(MonthlySales.session_id == SESSION_ID).delete()
db.commit()

CSV_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data", "business_sales_data.csv")

# ─── Parse CSV into Transactions ──────────────────────
monthly_rev = defaultdict(float)
monthly_exp = defaultdict(float)
tx_count = 0

with open(CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        amount = float(row["Amount"])
        if amount == 0:
            continue
        is_credit = row["Type"].strip().upper() == "CR"
        tx_type = "credit" if is_credit else "debit"

        cat = row["Category"].strip()
        if cat in ("Revenue", "Other Income", "Capital"):
            model_cat = "Revenue" if cat == "Revenue" else cat
        elif cat == "COGS":
            model_cat = "COGS"
        elif cat == "Tax":
            model_cat = "Tax"
        elif cat == "Salary":
            model_cat = "Salary"
        elif cat == "Rent":
            model_cat = "Rent"
        elif cat == "Marketing":
            model_cat = "Marketing"
        elif cat == "Utilities":
            model_cat = "Utilities"
        elif cat == "Refund":
            model_cat = "Expense"
            tx_type = "debit"
        else:
            model_cat = "Expense"

        abs_amount = abs(amount)

        db.add(Transaction(
            session_id=SESSION_ID,
            date=row["Date"].strip(),
            description=row["Description"].strip(),
            amount=abs_amount,
            type=tx_type,
            category=model_cat,
            merchant=row["Customer_Vendor"].strip(),
        ))
        tx_count += 1

        month_key = row["Date"].strip()[:7]
        if tx_type == "credit":
            monthly_rev[month_key] += abs_amount
        else:
            monthly_exp[month_key] += abs_amount

print(f"  → {tx_count} transactions loaded (session={SESSION_ID})")

# ─── Monthly Sales from actual transaction data ───────
all_months = sorted(set(monthly_rev.keys()) | set(monthly_exp.keys()))
for month in all_months:
    rev = round(monthly_rev.get(month, 0), 2)
    exp = round(monthly_exp.get(month, 0), 2)
    db.add(MonthlySales(
        session_id=SESSION_ID,
        month=month, revenue=rev, expenses=exp,
        profit=round(rev - exp, 2), product="all",
    ))
print(f"  → {len(all_months)} months of sales data computed")

# ─── Inventory (based on CSV SKU data) ───────────────
inventory = [
    ("Wireless Earbuds Pro",       "WE-001", 185, 80,  250,  599, 160),
    ("USB-C Fast Charger 65W",     "UC-002",  92, 50,  120,  349, 100),
    ("Premium Phone Case (iPhone 15)", "PC-003", 210, 80,  80, 249, 150),
    ("Bluetooth Speaker 20W",      "BS-004",  65, 30,  450, 1299,  50),
    ("Tempered Glass Screen Protector", "SP-005", 380, 150, 30, 149, 250),
    ("Laptop Stand Adjustable",    "LS-006",  55, 25,  350,  899,  30),
    ("Power Bank 20000mAh",        "PB-007",  48, 25,  500, 1499,  30),
    ("Wireless Ergonomic Mouse",   "WM-008",  72, 30,  200,  533,  50),
]

for name, sku, stock, reorder, cost, price, sold in inventory:
    db.add(InventoryItem(
        session_id=SESSION_ID,
        name=name, sku=sku, stock=stock, reorder_level=reorder,
        unit_cost=cost, sell_price=price, units_sold_30d=sold,
    ))
print(f"  → {len(inventory)} inventory items loaded")

db.commit()
db.close()
print(f"✅ Database seeded successfully for session '{SESSION_ID}'!")
