from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
from app.db.database import get_db
from app.models.review import Review
from app.models.user import Profile
from app.models.contract import Contract, ContractStatus
from app.core.security import get_current_user

router = APIRouter()


class ReviewCreate(BaseModel):
    contract_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


@router.post("")
def create_review(data: ReviewCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contract = db.query(Contract).filter(Contract.id == data.contract_id).first()
    if not contract or contract.status != ContractStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only review completed contracts")

    if contract.freelancer_id != user_id:
        raise HTTPException(status_code=403, detail="Only the student who completed the work can review it")
    
    existing = db.query(Review).filter(Review.contract_id == data.contract_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already reviewed")
    
    review = Review(
        contract_id=data.contract_id,
        reviewer_id=user_id,
        reviewed_id=contract.client_id,
        rating=data.rating,
        comment=data.comment,
        is_from_client=False,
    )
    db.add(review)
    db.commit()
    reviewed_profile = db.query(Profile).filter(Profile.user_id == contract.client_id).first()
    if reviewed_profile:
        reviews = db.query(Review).filter(Review.reviewed_id == contract.client_id).all()
        reviewed_profile.average_rating = round(sum(item.rating for item in reviews) / len(reviews))
        db.commit()
    return review.__dict__


@router.get("/contract/{contract_id}/mine")
def get_my_contract_review(contract_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(Review).filter(
        Review.contract_id == contract_id,
        Review.reviewer_id == int(current_user["user_id"]),
    ).first()
    return review.__dict__ if review else None


@router.get("/user/{user_id}", response_model=List[dict])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.reviewed_id == user_id).all()
    return [r.__dict__ for r in reviews]