from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SAEnum, Text
from sqlalchemy.sql import func
from database import Base
import enum


class TransactionType(str, enum.Enum):
    credit = "credit"
    debit = "debit"


class InvoiceStatus(str, enum.Enum):
    draft = "draft"
    sent = "sent"
    paid = "paid"
    overdue = "overdue"
    cancelled = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    business_type = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    email = Column(String, default="")
    phone = Column(String, default="")
    gstin = Column(String, default="")
    address = Column(String, default="")
    payment_terms = Column(Integer, default=30)  # days
    total_invoiced = Column(Float, default=0)
    total_paid = Column(Float, default=0)
    created_at = Column(DateTime, server_default=func.now())


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    invoice_number = Column(String, nullable=False)
    customer_name = Column(String, nullable=False)
    customer_gstin = Column(String, default="")
    date = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    status = Column(SAEnum(InvoiceStatus), default=InvoiceStatus.draft)
    subtotal = Column(Float, nullable=False)
    gst_rate = Column(Float, default=18.0)
    gst_amount = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    items_json = Column(Text, nullable=False)  # JSON array of line items
    notes = Column(String, default="")
    payment_link = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    date = Column(String, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    type = Column(SAEnum(TransactionType), nullable=False)
    category = Column(String, nullable=False)
    merchant = Column(String, default="")
    created_at = Column(DateTime, server_default=func.now())


class InventoryItem(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    sku = Column(String, nullable=False)
    stock = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=20)
    unit_cost = Column(Float, default=0)
    sell_price = Column(Float, default=0)
    units_sold_30d = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class MonthlySales(Base):
    __tablename__ = "monthly_sales"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    month = Column(String, nullable=False)       # e.g. "2026-01"
    revenue = Column(Float, nullable=False)
    expenses = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    product = Column(String, default="all")       # product-level or "all"


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)         # growth, cost, product
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    impact = Column(String, nullable=False)
    confidence = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


# ─── QUBO + A2P Models ───────────────────────────────


class POStatus(str, enum.Enum):
    draft = "draft"
    pending_approval = "pending_approval"
    approved = "approved"
    payment_initiated = "payment_initiated"
    paid = "paid"
    dispatched = "dispatched"
    completed = "completed"
    rejected = "rejected"


class RiskLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class ApprovalStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    success = "success"
    failed = "failed"


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    po_number = Column(String, nullable=False)
    supplier_name = Column(String, nullable=False)
    status = Column(SAEnum(POStatus), default=POStatus.draft)
    items_json = Column(Text, nullable=False)       # JSON array [{sku, name, qty, unit_cost, total}]
    total_amount = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    approved_at = Column(DateTime, nullable=True)
    paid_at = Column(DateTime, nullable=True)


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    po_id = Column(Integer, nullable=False)
    risk_level = Column(SAEnum(RiskLevel), nullable=False)
    auto_approved = Column(Integer, default=0)      # 0=False, 1=True (SQLite compat)
    status = Column(SAEnum(ApprovalStatus), default=ApprovalStatus.pending)
    requested_at = Column(DateTime, server_default=func.now())
    resolved_at = Column(DateTime, nullable=True)
    resolver = Column(String, default="system")     # system or user


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    po_id = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, default="UPI/Paytm")
    payment_link = Column(String, default="")
    status = Column(SAEnum(PaymentStatus), default=PaymentStatus.pending)
    initiated_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)
    reference_id = Column(String, default="")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    action = Column(String, nullable=False)
    agent_name = Column(String, nullable=False)
    details_json = Column(Text, default="{}")
    timestamp = Column(DateTime, server_default=func.now())


class QUBOResult(Base):
    __tablename__ = "qubo_results"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, nullable=False, index=True)
    run_at = Column(DateTime, server_default=func.now())
    qubo_matrix_size = Column(Integer, nullable=False)
    solver_method = Column(String, default="simulated_annealing")
    energy = Column(Float, nullable=False)
    decisions_json = Column(Text, nullable=False)   # JSON [{sku, reorder, qty, cost}]
    constraints_json = Column(Text, default="{}")   # JSON {budget, capacity, ...}
    total_cost = Column(Float, default=0)
    total_savings = Column(Float, default=0)
