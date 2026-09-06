from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.database import get_db
from app.models.gig import Gig, GigStatus, GigSkill
from app.models.category import Category
from app.models.skill import Skill
from app.models.user import User
from app.models.saved_gig import SavedGig
from app.schemas.gig import GigCreate, GigUpdate, GigResponse
from app.core.security import get_current_user

router = APIRouter()


# GET all gigs
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
    query = db.query(Gig).filter(Gig.status == GigStatus.OPEN)

    if category:
        query = query.filter(Gig.category_id == category)

    if min_budget:
        query = query.filter(Gig.budget >= min_budget)

    if max_budget:
        query = query.filter(Gig.budget <= max_budget)

    if sort == "budget_low":
        query = query.order_by(Gig.budget.asc())
    elif sort == "budget_high":
        query = query.order_by(Gig.budget.desc())
    else:
        query = query.order_by(Gig.created_at.desc())

    offset = (page - 1) * limit
    gigs = query.offset(offset).limit(limit).all()

    return [GigResponse.model_validate(g) for g in gigs]


# GET categories
@router.get("/categories", response_model=List[dict])
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description
        }
        for c in categories
    ]


# GET skills
@router.get("/skills", response_model=List[dict])
def get_skills(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Skill)

    if search:
        query = query.filter(Skill.name.ilike(f"%{search}%"))

    return [
        {
            "id": s.id,
            "name": s.name,
            "category": s.category
        }
        for s in query.all()
    ]


# GET single gig
@router.get("/{gig_id}", response_model=GigResponse)
def get_gig(
    gig_id: int,
    db: Session = Depends(get_db)
):
    gig = db.query(Gig).filter(Gig.id == gig_id).first()

    if not gig:
        raise HTTPException(
            status_code=404,
            detail="Gig not found"
        )

    gig.view_count += 1
    db.commit()

    return GigResponse.model_validate(gig)


# POST create gig
@router.post("", response_model=GigResponse)
def create_gig(
    gig_data: GigCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])

    user = db.query(User).filter(User.id == user_id).first()

    if user.role.value != "client":
        raise HTTPException(
            status_code=403,
            detail="Only clients can post gigs"
        )

    new_gig = Gig(
        **gig_data.model_dump(exclude={"skill_ids"}),
        client_id=user_id,
        status=GigStatus.OPEN
    )

    db.add(new_gig)
    db.commit()
    db.refresh(new_gig)

    if gig_data.skill_ids:
        for skill_id in gig_data.skill_ids:
            gig_skill = GigSkill(
                gig_id=new_gig.id,
                skill_id=skill_id
            )
            db.add(gig_skill)

        db.commit()

    return GigResponse.model_validate(new_gig)


# DELETE gig
@router.delete("/{gig_id}")
def delete_gig(
    gig_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    gig = db.query(Gig).filter(Gig.id == gig_id).first()

    if not gig or gig.client_id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized"
        )

    db.delete(gig)
    db.commit()

    return {"message": "Gig deleted"}


# POST save gig
@router.post("/{gig_id}/save")
def save_gig(
    gig_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    existing = db.query(SavedGig).filter(
        SavedGig.user_id == user_id,
        SavedGig.gig_id == gig_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Already saved"
        )

    saved = SavedGig(
        user_id=user_id,
        gig_id=gig_id
    )

    db.add(saved)
    db.commit()

    return {"message": "Gig saved"}


# GET saved gigs
@router.get("/saved/list", response_model=List[GigResponse])
def get_saved_gigs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    saved = db.query(SavedGig).filter(
        SavedGig.user_id == user_id
    ).all()

    return [
        GigResponse.model_validate(s.gig)
        for s in saved
    ]