from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel, Field
from app.db.database import get_db
from app.models.review import Review
from app.models.user import Profile, User, UserRole
from app.models.contract import Contract, ContractStatus, ContractDeliverable
from app.core.security import get_current_user

router = APIRouter()


class ReviewCreate(BaseModel):
    contract_id: int
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(default=None, max_length=2000)


@router.post("")
def create_review(data: ReviewCreate, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    user = db.query(User).filter(User.id == user_id).first()
    contract = db.query(Contract).filter(Contract.id == data.contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if contract.status != ContractStatus.COMPLETED:
        raise HTTPException(status_code=409, detail="Can only review completed contracts")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.STUDENT and contract.freelancer_id == user_id:
        reviewed_id = contract.client_id
        is_from_client = False
    elif user.role == UserRole.CLIENT and contract.client_id == user_id:
        reviewed_id = contract.freelancer_id
        is_from_client = True
    else:
        raise HTTPException(status_code=403, detail="Only contract participants can submit a review")

    submitted_work = db.query(ContractDeliverable).filter(
        ContractDeliverable.contract_id == contract.id,
        ContractDeliverable.is_submitted.is_(True),
    ).first()
    if not submitted_work:
        raise HTTPException(status_code=400, detail="Can only review a contract after submitting work")
    
    existing = db.query(Review).filter(
        Review.contract_id == data.contract_id,
        Review.reviewer_id == user_id,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Already reviewed this contract")
    
    review = Review(
        contract_id=data.contract_id,
        reviewer_id=user_id,
        reviewed_id=reviewed_id,
        rating=data.rating,
        comment=data.comment,
        is_from_client=is_from_client,
    )
    db.add(review)
    try:
        db.flush()
        reviewed_user = db.query(User).filter(User.id == reviewed_id).first()
        reviewed_profile = db.query(Profile).filter(Profile.user_id == reviewed_id).first()
        if reviewed_user and reviewed_profile:
            received_from_client = reviewed_user.role == UserRole.STUDENT
            average_rating = db.query(func.avg(Review.rating)).filter(
                Review.reviewed_id == reviewed_id,
                Review.is_from_client.is_(received_from_client),
            ).scalar()
            reviewed_profile.average_rating = round(float(average_rating)) if average_rating is not None else 0
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Already reviewed this contract")
    db.refresh(review)
    return {
        "id": review.id,
        "contract_id": review.contract_id,
        "reviewer_id": review.reviewer_id,
        "reviewed_id": review.reviewed_id,
        "rating": review.rating,
        "comment": review.comment,
        "is_from_client": review.is_from_client,
        "created_at": review.created_at,
    }


@router.get("/contract/{contract_id}/mine")
def get_my_contract_review(contract_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    contract = db.query(Contract).filter(Contract.id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    if user_id not in (contract.client_id, contract.freelancer_id):
        raise HTTPException(status_code=403, detail="Only contract participants can view their review")
    review = db.query(Review).filter(
        Review.contract_id == contract_id,
        Review.reviewer_id == user_id,
    ).first()
    return review.__dict__ if review else None


@router.get("/user/{user_id}", response_model=List[dict])
def get_user_reviews(user_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.reviewed_id == user_id).all()
    return [
        {
            "id": review.id,
            "contract_id": review.contract_id,
            "gig_id": review.contract.gig_id,
            "gig_title": review.contract.gig.title if review.contract.gig else None,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at,
        }
        for review in reviews
    ]