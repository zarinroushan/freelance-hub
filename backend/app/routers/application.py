from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.models.application import Application, ApplicationStatus
from app.models.gig import Gig, GigStatus
from app.models.user import User, UserRole
from app.models.notification import Notification, NotificationType
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
    apps = db.query(Application).filter(Application.freelancer_id == user_id).order_by(Application.created_at.desc()).all()
    return [ApplicationResponse.model_validate(a) for a in apps]


@router.get("/gig/{gig_id}", response_model=List[ApplicationResponse])
def get_gig_applications(gig_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    gig = db.query(Gig).filter(Gig.id == gig_id).first()
    if not gig or gig.client_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    apps = db.query(Application).filter(Application.gig_id == gig_id).all()
    return [ApplicationResponse.model_validate(a) for a in apps]


@router.post("/{application_id}/accept")
def accept_application(application_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Not found")
    
    gig = db.query(Gig).filter(Gig.id == app.gig_id).first()
    if gig.client_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    app.status = ApplicationStatus.ACCEPTED
    app.responded_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Application accepted"}


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