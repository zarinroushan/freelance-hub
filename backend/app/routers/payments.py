import uuid
import random
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.core.security import get_current_user
from app.models.payment import Payment, PaymentStatus
from app.models.contract import Contract, ContractStatus
from app.models.gig import GigStatus
from app.models.notification import Notification, NotificationType

router = APIRouter()


# ── Schemas ────────────────────────────────────────────────────────────────────

class PaymentInitiateRequest(BaseModel):
    contract_id: int
    card_number: str          # fake – never stored as-is
    card_holder: str
    expiry: str
    cvv: str
    payment_method: Optional[str] = "card"


class PaymentProcessRequest(BaseModel):
    payment_intent_id: str    # the fake token we issued in initiate


# ── Helpers ────────────────────────────────────────────────────────────────────

def _mask_card(card_number: str) -> str:
    digits = card_number.replace(" ", "").replace("-", "")
    return "**** **** **** " + digits[-4:] if len(digits) >= 4 else "****"


# ── GET /payments  (transaction history for current user) ─────────────────────

@router.get("", response_model=List[dict])
def get_my_payments(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    payments = (
        db.query(Payment)
        .filter(
            (Payment.payer_id == user_id) | (Payment.recipient_id == user_id)
        )
        .order_by(Payment.created_at.desc())
        .all()
    )

    result = []
    for p in payments:
        item = {
            "id": p.id,
            "contract_id": p.contract_id,
            "amount": p.amount,
            "status": p.status,
            "payment_method": p.payment_method,
            "transaction_id": p.transaction_id,
            "released_at": p.released_at.isoformat() if p.released_at else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
            "is_sender": p.payer_id == user_id,
        }
        result.append(item)
    return result


# ── GET /payments/earnings  (summary stats for freelancer) ────────────────────

@router.get("/earnings", response_model=dict)
def get_earnings(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])

    released = (
        db.query(Payment)
        .filter(
            Payment.recipient_id == user_id,
            Payment.status == PaymentStatus.RELEASED,
        )
        .all()
    )
    pending = (
        db.query(Payment)
        .filter(
            Payment.recipient_id == user_id,
            Payment.status == PaymentStatus.PENDING,
        )
        .all()
    )

    return {
        "total_earned": sum(p.amount for p in released),
        "pending": sum(p.amount for p in pending),
        "completed_count": len(released),
    }


# ── POST /payments/initiate  ──────────────────────────────────────────────────
#   Called BEFORE approval – validates contract & creates a PENDING payment
#   with a fake "payment_intent_id" token returned to the frontend.

@router.post("/initiate", response_model=dict)
def initiate_payment(
    data: PaymentInitiateRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])

    contract = db.query(Contract).filter(Contract.id == data.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.client_id != user_id:
        raise HTTPException(status_code=403, detail="Only the client can release payment")
    if contract.status != ContractStatus.SUBMITTED:
        raise HTTPException(status_code=409, detail="Work must be submitted before payment")
    if contract.payment:
        raise HTTPException(status_code=409, detail="Payment already exists for this contract")

    # Basic fake card validation (demo only – never store raw card data)
    card_digits = data.card_number.replace(" ", "").replace("-", "")
    if len(card_digits) < 13 or not card_digits.isdigit():
        raise HTTPException(status_code=422, detail="Invalid card number")

    # Create a PENDING payment record
    payment_intent_id = str(uuid.uuid4())
    masked = _mask_card(data.card_number)

    payment = Payment(
        contract_id=data.contract_id,
        payer_id=contract.client_id,
        recipient_id=contract.freelancer_id,
        amount=contract.agreed_budget,
        status=PaymentStatus.PENDING,
        transaction_id=payment_intent_id,
        payment_method=f"{data.payment_method} ({masked})",
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "payment_intent_id": payment_intent_id,
        "amount": contract.agreed_budget,
        "masked_card": masked,
        "message": "Payment intent created. Confirm to release.",
    }


# ── POST /payments/confirm  ───────────────────────────────────────────────────
#   Called AFTER initiate – simulates processing, marks payment RELEASED,
#   marks contract COMPLETED, notifies freelancer.

@router.post("/confirm", response_model=dict)
def confirm_payment(
    data: PaymentProcessRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])

    payment = (
        db.query(Payment)
        .filter(Payment.transaction_id == data.payment_intent_id)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment intent not found")
    if payment.payer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if payment.status == PaymentStatus.RELEASED:
        raise HTTPException(status_code=409, detail="Payment already released")
    if payment.status == PaymentStatus.FAILED:
        raise HTTPException(status_code=409, detail="Payment failed – please initiate again")

    contract = db.query(Contract).filter(Contract.id == payment.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    # Simulate a ~95 % success rate (always success in demo for simplicity)
    payment.status = PaymentStatus.RELEASED
    payment.released_at = datetime.utcnow()
    payment.updated_at = datetime.utcnow()

    # Update contract & gig
    contract.status = ContractStatus.COMPLETED
    contract.completion_date = datetime.utcnow()
    if contract.gig:
        contract.gig.status = GigStatus.COMPLETED

    # Notifications
    db.add(
        Notification(
            user_id=contract.freelancer_id,
            type=NotificationType.PAYMENT_RELEASED,
            title="Payment Released! 🎉",
            message=f"Your payment of ₹{payment.amount} has been released!",
            related_entity_type="contract",
            related_entity_id=contract.id,
        )
    )
    db.add(
        Notification(
            user_id=contract.freelancer_id,
            type=NotificationType.WORK_APPROVED,
            title="Work Approved",
            message="Your submitted work was approved and payment was released.",
            related_entity_type="contract",
            related_entity_id=contract.id,
        )
    )

    db.commit()

    return {
        "message": "Payment released successfully!",
        "payment_id": payment.id,
        "amount": payment.amount,
        "released_at": payment.released_at.isoformat(),
    }
