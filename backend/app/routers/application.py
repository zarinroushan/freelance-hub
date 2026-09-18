from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.gig import Gig, GigStatus
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType
from app.models.contract import Contract, ContractStatus
from app.schemas.application import ApplicationCreate, ApplicationResponse
from app.core.security import get_current_user

router = APIRouter()



@router.post("", response_model=ApplicationResponse)
def create_application(
    application_data: ApplicationCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    user = db.query(User).filter(User.id == user_id).first()
    
    if user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can apply")
    
    gig = db.query(Gig).filter(Gig.id == application_data.gig_id).first()
    if not gig or gig.status != GigStatus.OPEN:
        raise HTTPException(status_code=400, detail="Gig not available")
    
    existing = db.query(Application).filter(
        Application.gig_id == application_data.gig_id,
        Application.freelancer_id == user_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied")
    
    new_app = Application(**application_data.model_dump(), freelancer_id=user_id, status=ApplicationStatus.PENDING)
    db.add(new_app)
    gig.application_count += 1
    
    notification = Notification(
        user_id=gig.client_id,
        type=NotificationType.APPLICATION_RECEIVED,
        title="New Application",
        message=f"Someone applied to your gig: {gig.title}",
    )
    db.add(notification)
    
    db.commit()
    db.refresh(new_app)
    return ApplicationResponse.model_validate(new_app)


@router.get("", response_model=List[ApplicationResponse])
def get_my_applications(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    user = db.query(User).filter(User.id == user_id).first()

    # Clients see all their applications (for their gigs)
    if user.role == UserRole.CLIENT:
        apps = db.query(Application).filter(Application.freelancer_id == user_id).order_by(Application.created_at.desc()).all()
        return [ApplicationResponse.model_validate(a) for a in apps]

    # Freelancers: exclude applications for gigs that already have an accepted applicant
    filled_gig_ids = (
        db.query(Application.gig_id)
        .filter(Application.status == ApplicationStatus.ACCEPTED)
        .subquery()
    )
    apps = (
        db.query(Application)
        .filter(
            Application.freelancer_id == user_id,
            ~Application.gig_id.in_(filled_gig_ids),
        )
        .order_by(Application.created_at.desc())
        .all()
    )
    return [ApplicationResponse.model_validate(a) for a in apps]


@router.get("/gig/{gig_id}")
def get_gig_applications(gig_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    gig = db.query(Gig).filter(Gig.id == gig_id).first()
    if not gig or gig.client_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    apps = (
        db.query(Application)
        .options(joinedload(Application.freelancer).joinedload(User.profile))
        .filter(Application.gig_id == gig_id)
        .order_by(Application.created_at.desc())
        .all()
    )

    result = []
    for a in apps:
        freelancer_data = None
        if a.freelancer:
            profile_data = None
            if a.freelancer.profile:
                p = a.freelancer.profile
                profile_data = {
                    "id": p.id,
                    "user_id": p.user_id,
                    "full_name": p.full_name,
                    "bio": p.bio,
                    "university": p.university,
                    "avatar_url": p.avatar_url,
                    "availability": p.availability,
                    "skills_summary": p.skills_summary,
                    "completed_gigs_count": p.completed_gigs_count,
                    "average_rating": p.average_rating,
                }
            freelancer_data = {
                "id": a.freelancer.id,
                "email": a.freelancer.email,
                "role": a.freelancer.role.value if hasattr(a.freelancer.role, 'value') else a.freelancer.role,
                "profile": profile_data,
            }

        result.append({
            "id": a.id,
            "gig_id": a.gig_id,
            "freelancer_id": a.freelancer_id,
            "proposed_price": a.proposed_price,
            "delivery_days": a.delivery_days,
            "cover_letter": a.cover_letter,
            "portfolio_links": a.portfolio_links,
            "status": a.status.value if hasattr(a.status, 'value') else a.status,
            "created_at": a.created_at.isoformat(),
            "freelancer": freelancer_data,
        })

    return result


@router.post("/{application_id}/accept")
def accept_application(application_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    
    gig = db.query(Gig).filter(Gig.id == app.gig_id).first()
    if gig.client_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Mark the accepted application
    app.status = ApplicationStatus.ACCEPTED
    app.responded_at = datetime.utcnow()

    # Create a contract for the accepted application
    contract = Contract(
        gig_id=gig.id,
        application_id=app.id,
        client_id=gig.client_id,
        freelancer_id=app.freelancer_id,
        agreed_budget=app.proposed_price,
        delivery_deadline=datetime.utcnow(),
        status=ContractStatus.ACTIVE,
    )
    db.add(contract)

    # Reject all other pending applications for this gig
    other_apps = db.query(Application).filter(
        Application.gig_id == gig.id,
        Application.id != app.id,
        Application.status == ApplicationStatus.PENDING
    ).all()
    for other in other_apps:
        other.status = ApplicationStatus.REJECTED
        other.responded_at = datetime.utcnow()

    db.commit()
    db.refresh(app)
    db.refresh(contract)

    return {
        "message": "Application accepted",
        "contract_id": contract.id,
    }


@router.post("/{application_id}/reject")
def reject_application(application_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    
    gig = db.query(Gig).filter(Gig.id == app.gig_id).first()
    if gig.client_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    app.status = ApplicationStatus.REJECTED
    app.responded_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Application rejected"}