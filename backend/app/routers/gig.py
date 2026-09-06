from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.database import get_db
from app.models.gig import Gig, GigStatus, GigSkill
from app.models.category import Category
from app.models.skill import Skill
from app.models.user import User
from app.models.saved_gig import SavedGig
from app.schemas.gig import GigCreate, GigResponse
from app.core.security import get_current_user
from typing import List
from app.models.user import User

router = APIRouter()


# =========================================================
# GET ALL GIGS
# =========================================================
@router.get("", response_model=List[GigResponse])
def get_gigs(
    category: Optional[int] = None,
    min_budget: Optional[int] = None,
    max_budget: Optional[int] = None,
    sort: str = "recent",
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Gig).filter(
        Gig.status == GigStatus.OPEN
    )

    # Filter by category
    if category:
        query = query.filter(
            Gig.category_id == category
        )

    # Filter by minimum budget
    if min_budget is not None:
        query = query.filter(
            Gig.budget >= min_budget
        )

    # Filter by maximum budget
    if max_budget is not None:
        query = query.filter(
            Gig.budget <= max_budget
        )

    # Sorting
    if sort == "budget_low":
        query = query.order_by(
            Gig.budget.asc()
        )

    elif sort == "budget_high":
        query = query.order_by(
            Gig.budget.desc()
        )

    else:
        query = query.order_by(
            Gig.created_at.desc()
        )

    # Pagination
    offset = (page - 1) * limit

    gigs = query.offset(
        offset
    ).limit(
        limit
    ).all()

    return [
        GigResponse.model_validate(gig)
        for gig in gigs
    ]


# =========================================================
# GET CATEGORIES
# =========================================================
@router.get("/categories", response_model=List[dict])
def get_categories(
    db: Session = Depends(get_db)
):
    categories = db.query(Category).all()

    return [
        {
            "id": category.id,
            "name": category.name,
            "description": category.description
        }
        for category in categories
    ]


# =========================================================
# GET SKILLS
# =========================================================
@router.get("/skills", response_model=List[dict])
def get_skills(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Skill)

    if search:
        query = query.filter(
            Skill.name.ilike(f"%{search}%")
        )

    skills = query.all()

    return [
        {
            "id": skill.id,
            "name": skill.name,
            "category": skill.category
        }
        for skill in skills
    ]


# =========================================================
# GET MY GIGS
# CLIENT -> THEIR POSTED GIGS
# STUDENT -> ALL OPEN GIGS
# =========================================================
@router.get("/my-gigs", response_model=List[GigResponse])
def get_my_gigs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Client sees only their posted gigs
    if user.role.value == "client":
        gigs = db.query(Gig).filter(
            Gig.client_id == user_id
        ).order_by(
            Gig.created_at.desc()
        ).all()

    # Student sees all open gigs
    else:
        gigs = db.query(Gig).filter(
            Gig.status == GigStatus.OPEN
        ).order_by(
            Gig.created_at.desc()
        ).all()

    return [
        GigResponse.model_validate(gig)
        for gig in gigs
    ]


# =========================================================
# GET SAVED GIGS
# =========================================================
@router.get("/saved/list", response_model=List[GigResponse])
def get_saved_gigs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    saved_gigs = db.query(SavedGig).filter(
        SavedGig.user_id == user_id
    ).all()

    return [
        GigResponse.model_validate(saved.gig)
        for saved in saved_gigs
        if saved.gig is not None
    ]


# =========================================================
# CREATE GIG
# ONLY CLIENT CAN CREATE
# =========================================================
@router.post("", response_model=GigResponse)
def create_gig(
    gig_data: GigCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Only clients can post gigs
    if user.role.value != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can post gigs"
        )

    # Create new gig
    new_gig = Gig(
        **gig_data.model_dump(
            exclude={"skill_ids"}
        ),
        client_id=user_id,
        status=GigStatus.OPEN
    )

    db.add(new_gig)
    db.commit()
    db.refresh(new_gig)

    # Add skills
    if gig_data.skill_ids:
        for skill_id in gig_data.skill_ids:

            # Check if skill exists
            skill = db.query(Skill).filter(
                Skill.id == skill_id
            ).first()

            if skill:
                gig_skill = GigSkill(
                    gig_id=new_gig.id,
                    skill_id=skill_id
                )

                db.add(gig_skill)

        db.commit()

    db.refresh(new_gig)

    return GigResponse.model_validate(new_gig)


# =========================================================
# GET SINGLE GIG
# IMPORTANT:
# KEEP THIS AFTER ALL STATIC ROUTES
# =========================================================
@router.get("/{gig_id}", response_model=GigResponse)
def get_gig(
    gig_id: int,
    db: Session = Depends(get_db)
):
    gig = db.query(Gig).filter(
        Gig.id == gig_id
    ).first()

    if not gig:
        raise HTTPException(
            status_code=404,
            detail="Gig not found"
        )

    # Increase view count
    gig.view_count += 1

    db.commit()
    db.refresh(gig)

    return GigResponse.model_validate(gig)


# =========================================================
# DELETE GIG
# ONLY GIG OWNER CAN DELETE
# =========================================================
@router.delete("/{gig_id}")
def delete_gig(
    gig_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    gig = db.query(Gig).filter(
        Gig.id == gig_id
    ).first()

    if not gig:
        raise HTTPException(
            status_code=404,
            detail="Gig not found"
        )

    # Check ownership
    if gig.client_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete this gig"
        )

    db.delete(gig)
    db.commit()

    return {
        "message": "Gig deleted successfully"
    }


# =========================================================
# SAVE GIG
# =========================================================
@router.post("/{gig_id}/save")
def save_gig(
    gig_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    # Check if gig exists
    gig = db.query(Gig).filter(
        Gig.id == gig_id
    ).first()

    if not gig:
        raise HTTPException(
            status_code=404,
            detail="Gig not found"
        )

    # Check if already saved
    existing = db.query(SavedGig).filter(
        SavedGig.user_id == user_id,
        SavedGig.gig_id == gig_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Gig already saved"
        )

    # Save gig
    saved = SavedGig(
        user_id=user_id,
        gig_id=gig_id
    )

    db.add(saved)
    db.commit()

    return {
        "message": "Gig saved successfully"
    }

# GET my gigs (for client to see their posted gigs)
@router.get("/my-gigs", response_model=List[GigResponse])
def get_my_gigs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    user = db.query(User).filter(User.id == user_id).first()
    
    if user.role.value == "client":
        # Client sees their posted gigs
        gigs = db.query(Gig).filter(Gig.client_id == user_id).all()
    else:
        # Student sees all open gigs
        gigs = db.query(Gig).filter(Gig.status == GigStatus.OPEN).all()
    
    return [GigResponse.model_validate(gig) for gig in gigs]