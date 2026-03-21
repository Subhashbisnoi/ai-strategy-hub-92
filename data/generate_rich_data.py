import sys
import os
import json
from datetime import datetime, timedelta
import random

# Add backend to sys path so we can import models
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_dir)

from database import SessionLocal, engine, Base
from models import User, InventoryItem, MonthlySales, Transaction, Customer, Invoice

# High-End Electronics & Gadgets Retail Business Profile
BUSINESS_CONFIG = {
    "daily_sales_mean": 250000,
    "seasonality": lambda m: 1.4 if m in [10, 11] else (0.8 if m in [3, 4] else 1.0)
}

REALISTIC_PRODUCTS = [
    {"name": "Apple iPhone 15 Pro Max", "sku": "SKU-RTL-001", "cost": 99000, "price": 159900, "cat": "Smartphones", "hero": True},
    {"name": "Sony PlayStation 5 Console", "sku": "SKU-RTL-002", "cost": 41000, "price": 54990, "cat": "Gaming", "hero": False},
    {"name": "Apple MacBook Pro M3", "sku": "SKU-RTL-003", "cost": 135000, "price": 169900, "cat": "Computers", "hero": False},
    {"name": "Sony WH-1000XM5 Headphones", "sku": "SKU-RTL-004", "cost": 18000, "price": 29990, "cat": "Audio", "hero": False},
    {"name": "Samsung Galaxy S24 Ultra", "sku": "SKU-RTL-005", "cost": 85000, "price": 129999, "cat": "Smartphones", "hero": False},
    {"name": "Dyson V15 Detect Vacuum", "sku": "SKU-RTL-006", "cost": 42000, "price": 65900, "cat": "Home Appliances", "hero": False},
    {"name": "LG C3 65-inch OLED TV", "sku": "SKU-RTL-007", "cost": 145000, "price": 195000, "cat": "Televisions", "hero": False},
    {"name": "Nintendo Switch OLED", "sku": "SKU-RTL-008", "cost": 21000, "price": 34990, "cat": "Gaming", "hero": False},
    {"name": "Apple AirPods Pro (2nd Gen)", "sku": "SKU-RTL-009", "cost": 16000, "price": 24900, "cat": "Audio", "hero": False},
    {"name": "Garmin Fenix 7X Pro", "sku": "SKU-RTL-010", "cost": 65000, "price": 98990, "cat": "Wearables", "hero": False},
    {"name": "DJI Mini 4 Pro Drone", "sku": "SKU-RTL-011", "cost": 55000, "price": 82990, "cat": "Drones", "hero": False},
    {"name": "Bose QuietComfort Ultra", "sku": "SKU-RTL-012", "cost": 22000, "price": 35900, "cat": "Audio", "hero": False},
    {"name": "GoPro HERO 12 Black", "sku": "SKU-RTL-013", "cost": 28000, "price": 44990, "cat": "Cameras", "hero": False},
    {"name": "Canon EOS R5 Camera", "sku": "SKU-RTL-014", "cost": 230000, "price": 295000, "cat": "Cameras", "hero": False},
    {"name": "Sonos Arc Soundbar", "sku": "SKU-RTL-015", "cost": 65000, "price": 99999, "cat": "Audio", "hero": False},
    {"name": "Apple iPad Air (M2)", "sku": "SKU-RTL-016", "cost": 42000, "price": 59900, "cat": "Tablets", "hero": False},
    {"name": "Nespresso Vertuo Next", "sku": "SKU-RTL-017", "cost": 9500, "price": 17990, "cat": "Home Appliances", "hero": False},
    {"name": "Samsung Odyssey G9 Monitor", "sku": "SKU-RTL-018", "cost": 95000, "price": 135000, "cat": "Computers", "hero": False},
    {"name": "Microsoft Xbox Series X", "sku": "SKU-RTL-019", "cost": 42000, "price": 55990, "cat": "Gaming", "hero": False},
    {"name": "Kobo Clara 2E eReader", "sku": "SKU-RTL-020", "cost": 8500, "price": 14999, "cat": "Tablets", "hero": False}
]

def generate_retail_data(db, username, config, products):
    print(f"Generating realistic retail dataset for {username}...")
    
    # 1. Generate Products in DB — distributed across health statuses
    # Assign each product a status category for realistic distribution
    status_pool = ["critical", "critical", "critical",
                   "reorder", "reorder", "reorder", "reorder",
                   "overstock", "overstock", "overstock",
                   "healthy", "healthy", "healthy", "healthy", "healthy",
                   "healthy", "healthy", "healthy", "healthy", "healthy"]
    random.shuffle(status_pool)

    for idx, p in enumerate(products):
        is_hero = p["hero"]
        daily_sell = random.randint(3, 15) if is_hero else random.randint(1, 4)
        lead = random.randint(3, 10)
        safety = max(1, int(daily_sell * lead * random.uniform(0.5, 1.5)))
        reorder = safety + (daily_sell * lead)
        eoq = max(int(reorder), int(reorder * 3))
        units_sold_30d = int(random.randint(50, 400) if is_hero else random.randint(5, 50))

        assigned_status = status_pool[idx % len(status_pool)]
        if assigned_status == "critical":
            stock = random.randint(0, max(1, int(safety * 0.3)))
        elif assigned_status == "reorder":
            stock = random.randint(safety + 1, reorder)
        elif assigned_status == "overstock":
            stock = int(reorder * random.uniform(3.5, 6.0))
        else:  # healthy
            stock = random.randint(reorder + 1, reorder * 3)

        db.add(InventoryItem(
            session_id=username,
            name=p["name"],
            sku=p["sku"],
            stock=int(stock),
            reorder_level=int(reorder),
            unit_cost=float(p["cost"]),
            sell_price=float(p["price"]),
            units_sold_30d=units_sold_30d
        ))
        
    # 2. Generate 18 Months of Daily Sales (agg to months)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=540)
    current_date = start_date
    sales_cache = []
    
    hero_sku = next(p for p in products if p["hero"])["sku"]
    monthly_acc = {}
    
    while current_date <= end_date:
        month = current_date.month
        month_str = current_date.strftime("%Y-%m")
        season_mult = config["seasonality"](month)
        
        days_passed = (current_date - start_date).days
        trend = 1 + (days_passed / 540) * 0.3
        
        daily_rev = config["daily_sales_mean"] * season_mult * trend * random.uniform(0.8, 1.2)
        daily_exp = daily_rev * 0.7 * random.uniform(0.9, 1.1) # approx 30% margin avg for entire store
        profit = daily_rev - daily_exp
        
        # Determine top SKU for the day
        top_sku = hero_sku if random.random() < 0.6 else random.choice(products)["sku"]
        
        if month_str not in monthly_acc:
            monthly_acc[month_str] = {"revenue": 0.0, "expenses": 0.0, "profit": 0.0, "skus": {}}
        monthly_acc[month_str]["revenue"] += daily_rev
        monthly_acc[month_str]["expenses"] += daily_exp
        monthly_acc[month_str]["profit"] += profit
        monthly_acc[month_str]["skus"][top_sku] = monthly_acc[month_str]["skus"].get(top_sku, 0) + 1
        
        sales_cache.append({
            "date": current_date.strftime("%Y-%m-%d"),
            "revenue": round(daily_rev, 2),
            "expenses": round(daily_exp, 2)
        })
        current_date += timedelta(days=1)
        
    for m_str, acc in monthly_acc.items():
        db.add(MonthlySales(
            session_id=username,
            month=m_str,
            revenue=acc["revenue"],
            expenses=acc["expenses"],
            profit=acc["profit"],
            product="all"
        ))
        
    # 3. Generate Transactions
    for s in sales_cache:
        db.add(Transaction(
            session_id=username,
            date=s["date"],
            description="Daily POS Settlement",
            amount=s["revenue"],
            type="credit",
            category="Sales Revenue",
            merchant="Payment Gateway"
        ))
        if random.random() < 0.3:
            db.add(Transaction(
                session_id=username,
                date=s["date"],
                description="Inventory Supplier Payment",
                amount=s["expenses"] * random.uniform(0.8, 1.5),
                type="debit",
                category=random.choice(["COGS", "Rent", "Marketing", "Payroll"]),
                merchant="Various Vendors"
            ))
            
    # 4. Generate Customers & Invoices
    customers_cache = []
    for i in range(1, 15):
        cname = f"Premium Buyer {i}"
        cgst = f"29AABCU{str(i).zfill(4)}R1Z{random.choice(['A', 'B', 'C'])}"
        terms = random.choice([15, 30, 45, 60])
        
        customers_cache.append({
            "name": cname,
            "gstin": cgst,
            "payment_terms": terms
        })
        
        db.add(Customer(
            session_id=username,
            name=cname,
            email=f"contact@buyer{i}.com",
            phone=f"9000000{str(i).zfill(3)}",
            gstin=cgst,
            address=random.choice(["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"]),
            payment_terms=terms,
            total_invoiced=0.0,
            total_paid=0.0
        ))
        
    statuses = ["paid", "paid", "paid", "sent", "sent", "overdue", "draft"]
    db.flush() # flush to DB
    for i in range(1, 41):
        cust = random.choice(customers_cache)
        inv_items = []
        subtotal = 0.0
        for _ in range(random.randint(1, 3)): # B2B bulk orders
            p = random.choice(products)
            qty = random.randint(1, 5) # Electronic items
            inv_items.append({
                "description": p["name"],
                "quantity": qty,
                "unit_price": float(p["price"]),
                "sku": p["sku"]
            })
            subtotal += qty * p["price"]

        gst = round(subtotal * 0.18, 2)
        total = round(subtotal + gst, 2)
        days_ago = random.randint(0, 90)
        inv_date = datetime.now() - timedelta(days=days_ago)
        due_date = inv_date + timedelta(days=cust["payment_terms"])
        status_str = random.choice(statuses)

        db.add(Invoice(
            session_id=username,
            invoice_number=f"INV-{inv_date.strftime('%Y%m')}-{i:04d}",
            customer_name=cust["name"],
            customer_gstin=cust["gstin"],
            date=inv_date.strftime("%Y-%m-%d"),
            due_date=due_date.strftime("%Y-%m-%d"),
            status=status_str,
            subtotal=subtotal,
            gst_rate=18.0,
            gst_amount=gst,
            total=total,
            items_json=json.dumps(inv_items),
            notes="Thank you for your premium purchase.",
            payment_link=f"https://paytm.me/finai/inv-{inv_date.strftime('%Y%m')}-{i:04d}"
        ))

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        print("Clearing database...")
        db.query(User).delete()
        db.query(InventoryItem).delete()
        db.query(MonthlySales).delete()
        db.query(Transaction).delete()
        db.query(Customer).delete()
        db.query(Invoice).delete()
        db.commit()
        
        users_config = ["user1", "user2", "user3", "user4"]
        
        for username in users_config:
            # Everything is just retail now
            u = User(username=username, password_hash="user123", business_type="retail")
            db.add(u)
            db.commit()
            generate_retail_data(db, username, BUSINESS_CONFIG, REALISTIC_PRODUCTS)
            db.commit()
            
    print("Done generating highly realistic premium retail data strictly into finai.db for all 4 initial users!")
