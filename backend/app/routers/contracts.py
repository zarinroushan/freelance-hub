from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.models.contract import Contract, ContractStatus, ContractDeliverable
from app.models.payment import Payment, PaymentStatus
from app.models.notification import Notification, NotificationType
from app.core.security import get_current_user

router = APIRouter()


@router.get("", response_model=List[dict])
def get_my_contracts(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contracts = db.query(Contract).filter(
        (Contract.client_id == user_id) | (Contract.freelancer_id == user_id)
    ).order_by(Contract.created_at.desc()).all()
    return [c.__dict__ for c in contracts]


@router.post("/{contract_id}/deliver")
def submit_deliverable(contract_id: int, data: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or contract.freelancer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    deliverable = ContractDeliverable(
        contract_id=contract_id,
        description=data.get("description", ""),
        file_urls=data.get("file_urls"),
        submission_message=data.get("submission_message"),
        is_submitted=True,
        submitted_at=datetime.utcnow(),
    )
    db.add(deliverable)
    contract.status = ContractStatus.SUBMITTED
    db.commit()
    return {"message": "Work submitted"}


@router.post("/{contract_id}/approve")
def approve_deliverable(contract_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or contract.client_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    contract.status = ContractStatus.COMPLETED
    contract.completion_date = datetime.utcnow()
    
    payment = Payment(
        contract_id=contract_id,
        payer_id=contract.client_id,
        recipient_id=contract.freelancer_id,
        amount=contract.agreed_budget,
        status=PaymentStatus.RELEASED,
        released_at=datetime.utcnow(),
    )
    db.add(payment)
    
    notification = Notification(
        user_id=contract.freelancer_id,
        type=NotificationType.PAYMENT_RELEASED,
        title="Payment Released! 🎉",
        message=f"Your payment of ₹{contract.agreed_budget} has been released!",
    )
    db.add(notification)
    
    db.commit()
    return {"message": "Work approved. Payment released.", "payment_id": payment.id}