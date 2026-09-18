from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.notification import Notification
from app.models.notification import NotificationType as ModelNotificationType
from app.schemas.notification import NotificationResponse, NotificationType as SchemaNotificationType
from app.core.security import get_current_user

router = APIRouter()


_VALID_SCHEMA_TYPES = {member.value for member in SchemaNotificationType}


def _to_response_schema(notification: Notification) -> NotificationResponse:
    raw_type = notification.type
    if isinstance(raw_type, ModelNotificationType):
        raw_type = raw_type.value
    if raw_type not in _VALID_SCHEMA_TYPES:
        raw_type = SchemaNotificationType.APPLICATION_RECEIVED.value
    notification.type = raw_type
    return NotificationResponse.model_validate(notification)


@router.get("", response_model=List[NotificationResponse])
def get_my_notifications(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id
    ).order_by(Notification.created_at.desc()).all()
    
    return [_to_response_schema(n) for n in notifications]


@router.get("/unread-count")
def get_unread_count(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    unread_count = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.is_read == False
    ).count()
    
    return {"unread_count": unread_count}


@router.patch("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_id = int(current_user["user_id"])
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}


@router.put("/{notification_id}/read")
def mark_notification_read_put(
    notification_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Support both PUT and PATCH for backwards compatibility"""
    user_id = int(current_user["user_id"])
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == user_id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}