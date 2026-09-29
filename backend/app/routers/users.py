from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.user import User, Profile, UserRole
from app.models.skill import Skill, UserSkill
from app.models.portfolio import PortfolioItem
from app.models.contract import Contract, ContractStatus
from app.models.review import Review
from app.models.payment import Payment, PaymentStatus
from app.schemas.user import ProfileCreate, ProfileUpdate, ProfileResponse
from app.core.security import get_current_user
from sqlalchemy import func

router = APIRouter()


def _get_profile_stats(user: User, db: Session) -> dict:
    contract_owner_column = (
        Contract.freelancer_id if user.role == UserRole.STUDENT else Contract.client_id
    )
    completed_count = db.query(func.count(Contract.id)).filter(
        contract_owner_column == user.id,
        Contract.status == ContractStatus.COMPLETED,
    ).scalar() or 0

    received_from_client = user.role == UserRole.STUDENT
    received_reviews = Review.reviewed_id == user.id
    rating_direction = Review.is_from_client.is_(received_from_client)
    average_rating = db.query(func.avg(Review.rating)).filter(
        received_reviews,
        rating_direction,
    ).scalar()
    total_reviews = db.query(func.count(Review.id)).filter(
        received_reviews,
        rating_direction,
    ).scalar() or 0

    total_earnings = 0
    if user.role == UserRole.STUDENT:
        total_earnings = db.query(func.coalesce(func.sum(Payment.amount), 0)).join(
            Contract, Payment.contract_id == Contract.id
        ).filter(
            Payment.recipient_id == user.id,
            Payment.status == PaymentStatus.RELEASED,
            Contract.freelancer_id == user.id,
            Contract.status == ContractStatus.COMPLETED,
        ).scalar() or 0

    return {
        "completed_gigs_count": completed_count,
        "average_rating": round(float(average_rating), 1) if average_rating is not None else 0,
        "total_earnings": total_earnings,
        "total_reviews": total_reviews,
    }


def _profile_response(profile: Profile, stats: dict) -> dict:
    result = ProfileResponse.model_validate(profile).model_dump()
    result.update({
        "completed_gigs_count": stats["completed_gigs_count"],
        "average_rating": stats["average_rating"],
        "total_earnings": stats["total_earnings"],
    })
    return result


@router.get("/me/stats")
def get_my_stats(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    from app.models.gig import Gig, GigStatus
    stats = _get_profile_stats(user, db)

    if user.role == UserRole.STUDENT:
        active = db.query(Contract).filter(
            Contract.freelancer_id == user_id,
            Contract.status.in_([ContractStatus.ACTIVE, "active", "ACTIVE", ContractStatus.SUBMITTED, "submitted", "SUBMITTED", ContractStatus.REVISION_REQUESTED, "revision_requested", "REVISION_REQUESTED"])
        ).count()
        return {
            "role": "student",
            "active_contracts": active,
            "completed_contracts": stats["completed_gigs_count"],
            "total_earned": stats["total_earnings"],
            "average_rating": stats["average_rating"] if stats["total_reviews"] else None,
        }
    else:
        active_gigs = db.query(Gig).filter(Gig.client_id == user_id, Gig.status == GigStatus.OPEN).count()
        total_spent = db.query(func.coalesce(func.sum(Contract.agreed_budget), 0)).filter(
            Contract.client_id == user_id,
            Contract.status == ContractStatus.COMPLETED,
        ).scalar() or 0
        gigs = db.query(Gig).filter(Gig.client_id == user_id).all()
        total_proposals = sum(g.application_count for g in gigs)

        return {
            "role": "client",
            "active_gigs": active_gigs,
            "completed_contracts": stats["completed_gigs_count"],
            "total_proposals_received": total_proposals,
            "total_spent": total_spent,
        }


@router.get("/{user_id}")
def get_user_profile(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    skills = db.query(UserSkill).join(Skill).filter(UserSkill.user_id == user_id).all()
    portfolio = db.query(PortfolioItem).filter(PortfolioItem.user_id == user_id).all()
    
    stats = _get_profile_stats(user, db)
    
    return {
        "user": {"id": user.id, "email": user.email, "role": user.role.value},
        "profile": _profile_response(profile, stats) if profile else None,
        "skills": [{"id": us.skill.id, "name": us.skill.name, "proficiency": us.proficiency_level} for us in skills],
        "portfolio": [p.__dict__ for p in portfolio],
        "stats": {
            "average_rating": stats["average_rating"] if stats["total_reviews"] else None,
            "total_reviews": stats["total_reviews"],
        },
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
    
    user = db.query(User).filter(User.id == user_id).first()
    return _profile_response(profile, _get_profile_stats(user, db))

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
    user = db.query(User).filter(User.id == user_id).first()
    return _profile_response(profile, _get_profile_stats(user, db))


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
    user = db.query(User).filter(User.id == user_id).first()
    return _profile_response(profile, _get_profile_stats(user, db))


# ── SKILLS ENDPOINTS ───────────────────────────────────────

PREDEFINED_SKILL_CATEGORIES = {
    "Development & Tech": [
        "React", "TypeScript", "JavaScript", "Node.js", "Python", "HTML/CSS",
        "Mobile App Dev", "Next.js", "Django", "FastAPI", "SQL", "Git", "Java", "C++"
    ],
    "Design & Creative": [
        "Figma", "UI/UX Design", "Logo Design", "Graphic Design", "Photoshop",
        "Illustrator", "Canva", "3D Modeling", "Branding"
    ],
    "Writing & Content": [
        "Content Writing", "Copywriting", "Technical Writing", "Blogging",
        "Proofreading & Editing", "Creative Writing", "SEO Writing"
    ],
    "Video & Audio": [
        "Video Editing", "Premiere Pro", "DaVinci Resolve", "Animation",
        "Voiceover", "Audio Editing", "Motion Graphics"
    ],
    "Marketing & Business": [
        "Social Media Marketing", "SEO", "Digital Marketing", "Content Strategy",
        "Brand Strategy", "Market Research", "Email Marketing"
    ],
    "Data & Analytics": [
        "Data Analysis", "Excel / Spreadsheets", "Machine Learning",
        "Python Data Science", "PowerBI", "SQL Analytics"
    ],
}


@router.get("/skills/categories")
def get_skill_categories():
    """Returns the predefined enum skill categories and skills list."""
    return PREDEFINED_SKILL_CATEGORIES


@router.get("/profile/me/skills")
def get_my_skills(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get list of current user's skills."""
    user_id = int(current_user["user_id"])
    user_skills = db.query(UserSkill).join(Skill).filter(UserSkill.user_id == user_id).all()
    return [
        {
            "id": us.skill.id,
            "name": us.skill.name,
            "category": us.skill.category,
            "proficiency": us.proficiency_level,
        }
        for us in user_skills
    ]


@router.put("/profile/me/skills")
def update_my_skills(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sync user skills. Body format: {"skills": ["React", "TypeScript", ...]}
    """
    user_id = int(current_user["user_id"])
    skills_names = payload.get("skills", [])

    # Delete current user skills
    db.query(UserSkill).filter(UserSkill.user_id == user_id).delete()

    for skill_name in skills_names:
        skill_name = skill_name.strip()
        if not skill_name:
            continue
        
        # Check if skill exists in database
        skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
        if not skill:
            # Determine category
            category = "Other"
            for cat, names in PREDEFINED_SKILL_CATEGORIES.items():
                if any(n.lower() == skill_name.lower() for n in names):
                    category = cat
                    break
            skill = Skill(name=skill_name, category=category)
            db.add(skill)
            db.flush()

        user_skill = UserSkill(user_id=user_id, skill_id=skill.id)
        db.add(user_skill)

    db.commit()

    # Also update skills_summary string in profile for fast queries
    profile = db.query(Profile).filter(Profile.user_id == user_id).first()
    if profile:
        profile.skills_summary = ", ".join(skills_names)
        db.commit()

    user_skills = db.query(UserSkill).join(Skill).filter(UserSkill.user_id == user_id).all()
    return [
        {
            "id": us.skill.id,
            "name": us.skill.name,
            "category": us.skill.category,
            "proficiency": us.proficiency_level,
        }
        for us in user_skills
    ]


@router.post("/profile/me/skills")
def add_my_skill(
    payload: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a single skill to user profile."""
    user_id = int(current_user["user_id"])
    skill_name = payload.get("name", "").strip()
    category = payload.get("category", "Other")

    if not skill_name:
        raise HTTPException(status_code=400, detail="Skill name is required")

    skill = db.query(Skill).filter(Skill.name.ilike(skill_name)).first()
    if not skill:
        skill = Skill(name=skill_name, category=category)
        db.add(skill)
        db.flush()

    existing = db.query(UserSkill).filter(
        UserSkill.user_id == user_id, UserSkill.skill_id == skill.id
    ).first()

    if not existing:
        user_skill = UserSkill(user_id=user_id, skill_id=skill.id)
        db.add(user_skill)
        db.commit()

    return {"message": "Skill added successfully", "skill": {"id": skill.id, "name": skill.name, "category": skill.category}}


@router.delete("/profile/me/skills/{skill_identifier}")
def remove_my_skill(
    skill_identifier: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a skill by ID or name from current user profile."""
    user_id = int(current_user["user_id"])

    if skill_identifier.isdigit():
        skill_id = int(skill_identifier)
        db.query(UserSkill).filter(
            UserSkill.user_id == user_id, UserSkill.skill_id == skill_id
        ).delete()
    else:
        skill = db.query(Skill).filter(Skill.name.ilike(skill_identifier)).first()
        if skill:
            db.query(UserSkill).filter(
                UserSkill.user_id == user_id, UserSkill.skill_id == skill.id
            ).delete()

    db.commit()
    return {"message": "Skill removed successfully"}