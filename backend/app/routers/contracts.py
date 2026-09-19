import json
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.models.contract import Contract, ContractStatus, ContractDeliverable
from app.models.gig import GigStatus
from app.models.payment import Payment, PaymentStatus
from app.models.notification import Notification, NotificationType
from app.core.security import get_current_user
from app.models.review import Review

router = APIRouter()


class RevisionRequest(BaseModel):
    feedback: str = Field(..., min_length=1, max_length=2000)


def _parse_file_urls(urls_val):
    if not urls_val:
        return []
    if isinstance(urls_val, list):
        return urls_val
    if isinstance(urls_val, str):
        try:
            parsed = json.loads(urls_val)
            if isinstance(parsed, list):
                return parsed
            return [parsed]
        except Exception:
            return [urls_val] if urls_val.strip() else []
    return []


@router.get("", response_model=List[dict])
def get_my_contracts(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contracts = db.query(Contract).filter(
        (Contract.client_id == user_id) | (Contract.freelancer_id == user_id)
    ).order_by(Contract.created_at.desc()).all()
    result = []
    for contract in contracts:
        item = {
            key: value
            for key, value in contract.__dict__.items()
            if key != "_sa_instance_state"
        }
        review = db.query(Review).filter(
            Review.contract_id == contract.id,
            Review.reviewer_id == user_id,
        ).first()
        item["reviewed_by_me"] = review is not None

        # Fetch deliverables/submissions for this contract
        deliverables = db.query(ContractDeliverable).filter(
            ContractDeliverable.contract_id == contract.id
        ).order_by(ContractDeliverable.submitted_at.desc()).all()

        item["deliverables"] = [
            {
                "id": d.id,
                "description": d.description,
                "file_urls": _parse_file_urls(d.file_urls),
                "submission_message": d.submission_message,
                "submitted_at": d.submitted_at.isoformat() if d.submitted_at else None,
            }
            for d in deliverables
        ]
        result.append(item)
    return result


@router.post("/{contract_id}/deliver")
def submit_deliverable(contract_id: int, data: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or contract.freelancer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if contract.status not in (ContractStatus.ACTIVE, ContractStatus.REVISION_REQUESTED):
        raise HTTPException(status_code=409, detail="This contract is not accepting deliverables")
    
    description = data.get("description") or data.get("submission_message")
    if not description or not str(description).strip():
        raise HTTPException(status_code=422, detail="A delivery description is required")
    
    file_urls_input = data.get("file_urls")
    if isinstance(file_urls_input, list):
        file_urls_str = json.dumps(file_urls_input)
    elif isinstance(file_urls_input, str) and file_urls_input.strip():
        file_urls_str = json.dumps([file_urls_input.strip()])
    else:
        file_urls_str = None

    deliverable = ContractDeliverable(
        contract_id=contract_id,
        description=str(description).strip(),
        file_urls=file_urls_str,
        submission_message=data.get("submission_message") or str(description).strip(),
        is_submitted=True,
        submitted_at=datetime.utcnow(),
    )
    db.add(deliverable)
    contract.status = ContractStatus.SUBMITTED
    contract.revision_feedback = None
    db.add(Notification(
        user_id=contract.client_id,
        type=NotificationType.WORK_SUBMITTED,
        title="Work Submitted",
        message="Your freelancer submitted work for review.",
        related_entity_type="contract",
        related_entity_id=contract.id,
    ))
    db.commit()
    return {"message": "Work submitted"}


@router.post("/{contract_id}/request-revision")
def request_revision(
    contract_id: int,
    data: RevisionRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or contract.client_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if contract.status != ContractStatus.SUBMITTED:
        raise HTTPException(status_code=409, detail="Only submitted work can be sent for revision")

    contract.status = ContractStatus.REVISION_REQUESTED
    contract.revision_feedback = data.feedback.strip()
    db.add(Notification(
        user_id=contract.freelancer_id,
        type=NotificationType.WORK_APPROVED,
        title="Revision Requested",
        message=contract.revision_feedback,
        related_entity_type="contract",
        related_entity_id=contract.id,
    ))
    db.commit()
    return {"message": "Revision requested"}


@router.post("/{contract_id}/approve")
def approve_deliverable(contract_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract or contract.client_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if contract.status != ContractStatus.SUBMITTED:
        raise HTTPException(status_code=409, detail="Only submitted work can be approved")
    if contract.payment:
        raise HTTPException(status_code=409, detail="This contract has already been paid")
    
    contract.status = ContractStatus.COMPLETED
    contract.completion_date = datetime.utcnow()
    if contract.gig:
        contract.gig.status = GigStatus.COMPLETED
    
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
    db.add(Notification(
        user_id=contract.freelancer_id,
        type=NotificationType.WORK_APPROVED,
        title="Work Approved",
        message="Your submitted work was approved and payment was released.",
        related_entity_type="contract",
        related_entity_id=contract.id,
    ))
    
    db.commit()
    return {"message": "Work approved. Payment released.", "payment_id": payment.id}