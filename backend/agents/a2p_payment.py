"""A2P (Agent-to-Payment) Protocol — secure, auditable agent-initiated payments.

Provides: authorization, payment execution, verification, and audit logging
for autonomous purchase-order-to-payment flow.
"""

from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Any

from sqlalchemy.orm import Session

from models import (
    PurchaseOrder, ApprovalRequest, PaymentTransaction, AuditLog,
    POStatus, RiskLevel, ApprovalStatus, PaymentStatus,
)


# ─── Thresholds ──────────────────────────────────────

LOW_RISK_CEILING = 10_000      # ₹ — auto-approve
HIGH_RISK_FLOOR  = 50_000      # ₹ — requires manual approval


# ─── Audit helpers ───────────────────────────────────

def log_action(
    db: Session,
    session_id: str,
    action: str,
    agent_name: str,
    details: dict | None = None,
) -> None:
    db.add(AuditLog(
        session_id=session_id,
        action=action,
        agent_name=agent_name,
        details_json=json.dumps(details or {}),
    ))
    db.commit()


def get_audit_trail(db: Session, session_id: str, limit: int = 50) -> list[dict]:
    rows = (
        db.query(AuditLog)
        .filter(AuditLog.session_id == session_id)
        .order_by(AuditLog.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "action": r.action,
            "agent": r.agent_name,
            "details": json.loads(r.details_json or "{}"),
            "timestamp": r.timestamp.isoformat() if r.timestamp else None,
        }
        for r in rows
    ]


# ─── Purchase Orders ────────────────────────────────

def create_purchase_order(
    db: Session,
    session_id: str,
    supplier_name: str,
    items: list[dict],
    total_amount: float,
) -> dict:
    po_num = f"PO-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    po = PurchaseOrder(
        session_id=session_id,
        po_number=po_num,
        supplier_name=supplier_name,
        status=POStatus.draft,
        items_json=json.dumps(items),
        total_amount=round(total_amount, 2),
    )
    db.add(po)
    db.commit()
    db.refresh(po)

    log_action(db, session_id, "purchase_order_created", "A2P-Agent", {
        "po_id": po.id, "po_number": po_num, "supplier": supplier_name,
        "total": round(total_amount, 2), "item_count": len(items),
    })

    return _po_to_dict(po)


def get_purchase_orders(db: Session, session_id: str) -> list[dict]:
    rows = (
        db.query(PurchaseOrder)
        .filter(PurchaseOrder.session_id == session_id)
        .order_by(PurchaseOrder.created_at.desc())
        .all()
    )
    return [_po_to_dict(r) for r in rows]


def _po_to_dict(po: PurchaseOrder) -> dict:
    return {
        "id": po.id,
        "po_number": po.po_number,
        "supplier_name": po.supplier_name,
        "status": po.status.value if hasattr(po.status, "value") else po.status,
        "items": json.loads(po.items_json or "[]"),
        "total_amount": po.total_amount,
        "created_at": po.created_at.isoformat() if po.created_at else None,
        "approved_at": po.approved_at.isoformat() if po.approved_at else None,
        "paid_at": po.paid_at.isoformat() if po.paid_at else None,
    }


# ─── Risk Assessment & Approval ─────────────────────

def assess_risk(total_amount: float) -> str:
    if total_amount <= LOW_RISK_CEILING:
        return "low"
    if total_amount >= HIGH_RISK_FLOOR:
        return "high"
    return "medium"


def create_approval_request(
    db: Session,
    session_id: str,
    po_id: int,
    auto_approve_low_risk: bool = True,
) -> dict:
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id,
        PurchaseOrder.session_id == session_id,
    ).first()
    if not po:
        return {"error": "PO not found"}

    risk = assess_risk(po.total_amount)
    auto = auto_approve_low_risk and risk == "low"

    approval = ApprovalRequest(
        session_id=session_id,
        po_id=po_id,
        risk_level=risk,
        auto_approved=1 if auto else 0,
        status=ApprovalStatus.approved if auto else ApprovalStatus.pending,
        resolver="system" if auto else "user",
        resolved_at=datetime.utcnow() if auto else None,
    )
    db.add(approval)

    po.status = POStatus.approved if auto else POStatus.pending_approval
    if auto:
        po.approved_at = datetime.utcnow()

    db.commit()
    db.refresh(approval)

    log_action(db, session_id, "approval_created", "Authorization-Engine", {
        "po_id": po_id, "risk": risk, "auto_approved": auto,
        "status": approval.status.value if hasattr(approval.status, "value") else approval.status,
    })

    return _approval_to_dict(approval)


def approve_request(db: Session, session_id: str, approval_id: int) -> dict:
    appr = db.query(ApprovalRequest).filter(
        ApprovalRequest.id == approval_id,
        ApprovalRequest.session_id == session_id,
    ).first()
    if not appr:
        return {"error": "Approval not found"}

    appr.status = ApprovalStatus.approved
    appr.resolved_at = datetime.utcnow()
    appr.resolver = "user"

    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == appr.po_id).first()
    if po:
        po.status = POStatus.approved
        po.approved_at = datetime.utcnow()

    db.commit()
    db.refresh(appr)

    log_action(db, session_id, "approval_granted", "Authorization-Engine", {
        "approval_id": approval_id, "po_id": appr.po_id,
    })
    return _approval_to_dict(appr)


def reject_request(db: Session, session_id: str, approval_id: int) -> dict:
    appr = db.query(ApprovalRequest).filter(
        ApprovalRequest.id == approval_id,
        ApprovalRequest.session_id == session_id,
    ).first()
    if not appr:
        return {"error": "Approval not found"}

    appr.status = ApprovalStatus.rejected
    appr.resolved_at = datetime.utcnow()
    appr.resolver = "user"

    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == appr.po_id).first()
    if po:
        po.status = POStatus.rejected

    db.commit()
    db.refresh(appr)

    log_action(db, session_id, "approval_rejected", "Authorization-Engine", {
        "approval_id": approval_id, "po_id": appr.po_id,
    })
    return _approval_to_dict(appr)


def get_pending_approvals(db: Session, session_id: str) -> list[dict]:
    rows = (
        db.query(ApprovalRequest)
        .filter(
            ApprovalRequest.session_id == session_id,
            ApprovalRequest.status == ApprovalStatus.pending,
        )
        .order_by(ApprovalRequest.requested_at.desc())
        .all()
    )
    result = []
    for a in rows:
        d = _approval_to_dict(a)
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == a.po_id).first()
        if po:
            d["po"] = _po_to_dict(po)
        result.append(d)
    return result


def get_all_approvals(db: Session, session_id: str) -> list[dict]:
    rows = (
        db.query(ApprovalRequest)
        .filter(ApprovalRequest.session_id == session_id)
        .order_by(ApprovalRequest.requested_at.desc())
        .all()
    )
    return [_approval_to_dict(r) for r in rows]


def _approval_to_dict(a: ApprovalRequest) -> dict:
    return {
        "id": a.id,
        "po_id": a.po_id,
        "risk_level": a.risk_level.value if hasattr(a.risk_level, "value") else a.risk_level,
        "auto_approved": bool(a.auto_approved),
        "status": a.status.value if hasattr(a.status, "value") else a.status,
        "requested_at": a.requested_at.isoformat() if a.requested_at else None,
        "resolved_at": a.resolved_at.isoformat() if a.resolved_at else None,
        "resolver": a.resolver,
    }


# ─── Payment Execution ──────────────────────────────

def initiate_payment(db: Session, session_id: str, po_id: int) -> dict:
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == po_id,
        PurchaseOrder.session_id == session_id,
    ).first()
    if not po:
        return {"error": "PO not found"}

    # Check for duplicate payments
    existing = db.query(PaymentTransaction).filter(
        PaymentTransaction.po_id == po_id,
        PaymentTransaction.session_id == session_id,
        PaymentTransaction.status == PaymentStatus.success,
    ).first()
    if existing:
        return {"error": "Payment already completed for this PO", "payment_id": existing.id}

    ref_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"
    link = f"https://paytm.me/finai/{po.po_number.lower()}"

    pmt = PaymentTransaction(
        session_id=session_id,
        po_id=po_id,
        amount=po.total_amount,
        payment_method="UPI/Paytm",
        payment_link=link,
        status=PaymentStatus.pending,
        reference_id=ref_id,
    )
    db.add(pmt)
    po.status = POStatus.payment_initiated
    db.commit()
    db.refresh(pmt)

    log_action(db, session_id, "payment_initiated", "Payment-Engine", {
        "po_id": po_id, "amount": po.total_amount,
        "payment_link": link, "reference_id": ref_id,
    })

    return _payment_to_dict(pmt)


def simulate_payment_callback(db: Session, session_id: str, payment_id: int) -> dict:
    """Simulate a successful payment callback (for demo purposes).
    Also updates inventory stock for the items in the PO.
    """
    pmt = db.query(PaymentTransaction).filter(
        PaymentTransaction.id == payment_id,
        PaymentTransaction.session_id == session_id,
    ).first()
    if not pmt:
        return {"error": "Payment not found"}

    pmt.status = PaymentStatus.success
    pmt.completed_at = datetime.utcnow()

    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == pmt.po_id).first()
    if po:
        po.status = POStatus.paid
        po.paid_at = datetime.utcnow()

        # Update inventory stock for items in this PO
        from models import InventoryItem
        items = json.loads(po.items_json or "[]")
        stock_updates = []
        for it in items:
            inv_item = db.query(InventoryItem).filter(
                InventoryItem.session_id == session_id,
                InventoryItem.sku == it.get("sku", ""),
            ).first()
            if inv_item:
                old_stock = inv_item.stock
                inv_item.stock += it.get("qty", 0)
                stock_updates.append({
                    "sku": it["sku"], "old": old_stock, "new": inv_item.stock,
                })

        po.status = POStatus.completed

    db.commit()
    db.refresh(pmt)

    log_action(db, session_id, "payment_completed", "Payment-Engine", {
        "payment_id": payment_id, "po_id": pmt.po_id,
        "amount": pmt.amount, "reference_id": pmt.reference_id,
        "stock_updated": True,
    })

    return _payment_to_dict(pmt)


def get_payments(db: Session, session_id: str) -> list[dict]:
    rows = (
        db.query(PaymentTransaction)
        .filter(PaymentTransaction.session_id == session_id)
        .order_by(PaymentTransaction.initiated_at.desc())
        .all()
    )
    return [_payment_to_dict(r) for r in rows]


def _payment_to_dict(p: PaymentTransaction) -> dict:
    return {
        "id": p.id,
        "po_id": p.po_id,
        "amount": p.amount,
        "payment_method": p.payment_method,
        "payment_link": p.payment_link,
        "status": p.status.value if hasattr(p.status, "value") else p.status,
        "initiated_at": p.initiated_at.isoformat() if p.initiated_at else None,
        "completed_at": p.completed_at.isoformat() if p.completed_at else None,
        "reference_id": p.reference_id,
    }
