from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.review import Review
from app.models.contract import Contract, ContractStatus
from app.core.security import get_current_user

router = APIRouter()


@router.post("")
def create_review(data: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contract = db.query(Contract).filter(Contract.id == data["contract_id"]).first()
    if not contract or contract.status != ContractStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only review completed contracts")
    
    if contract.client_id != user_id and contract.freelancer_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    existing = db.query(Review).filter(Review.contract_id == data["contract_id"]).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")
    
    review = Review(
        contract_id=data["contract_id"],
        reviewer_id=user_id,
        reviewed_id=data["reviewed_id"],
        rating=data["rating"],
        comment=data.get("comment"),
        is_from_client=contract.client_id == user_id,
    )
    db.add(review)
    db.commit()
    return review.__dict__


@router.get("/user/{user_id}", response_model=List[dict])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.reviewed_id == user_id).all()
    return [r.__dict__ for r in reviews]