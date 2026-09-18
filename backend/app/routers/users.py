from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User, Profile, UserRole
from app.models.skill import Skill, UserSkill
from app.models.portfolio import PortfolioItem
from app.models.contract import Contract
from app.models.review import Review
from app.schemas.user import ProfileCreate, ProfileUpdate, ProfileResponse
from app.core.security import get_current_user
from sqlalchemy import func

router = APIRouter()


@router.get("/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    skills = db.query(UserSkill).join(Skill).filter(UserSkill.user_id == user_id).all()
    portfolio = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()
    
    reviews = db.query(Review).filter(Review.reviewed_id == user_id).all()
    avg_rating = round(sum(r.rating for r in reviews) / len(reviews)) if reviews else 0
    
    return {
        "user": {"id": user.id, "email": user.email, "role": user.role.value},
        "profile": ProfileResponse.model_validate(profile) if profile else None,
        "skills": [{"id": us.skill.id, "name": us.skill.name, "proficiency": us.proficiency_level} for us in skills],
        "portfolio": [p.__dict__ for p in portfolio],
        "stats": {"average_rating": avg_rating, "total_reviews": len(reviews)},
    }


@router.get("/profile/me", response_model=ProfileResponse)
def get_my_profile(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    if not profile:
        # Auto-create profile if doesn't exist
        user = db.query(User).filter(User.id == user_id).first()
        default_name = user.email.split("@")[0] if user and user.email else f"User {user_id}"
        profile = Profile(user_id=user_id, full_name=default_name, availability="available")
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return ProfileResponse.model_validate(profile)

@router.post("/profile", response_model=ProfileResponse)
def create_or_update_profile(
    profile_data: ProfileCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    if profile:
        for field, value in profile_data.model_dump(exclude_unset=True).items():
            setattr(profile, field, value)
    else:
        profile = Profile(user_id=user_id, **profile_data.model_dump())
        db.add(profile)
    
    db.commit()
    db.refresh(profile)
    return ProfileResponse.model_validate(profile)


@router.put("/profile/me", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    
    if not profile:
        # Create profile if it doesn't exist
        profile = Profile(
            user_id=user_id,
            **profile_data.model_dump(exclude_unset=True)
        )
        db.add(profile)
    else:
        # Update existing profile
        for field, value in profile_data.model_dump(exclude_unset=True).items():
            if value is not None:
                setattr(profile, field, value)
    
    db.commit()
    db.refresh(profile)
    return ProfileResponse.model_validate(profile)


@router.get("/me/stats")
def get_my_stats(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    user = db.query(User).filter(User.id == user_id).first()
    
    if user.role == UserRole.STUDENT:
        active = db.query(Contract).filter(Contract.freelancer_id == user_id, Contract.status == "active").count()
        completed = db.query(Contract).filter(Contract.freelancer_id == user_id, Contract.status == "completed").count()
        return {"role": "student", "active_contracts": active, "completed_contracts": completed}
    else:
        active_gigs = db.query(Contract).filter(Contract.client_id == user_id, Contract.status == "active").count()
        return {"role": "client", "active_contracts": active_gigs}