from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class NotificationType(str, Enum):
    APPLICATION_RECEIVED = "application_received"
    APPLICATION_ACCEPTED = "application_accepted"
    APPLICATION_REJECTED = "application_rejected"
    CONTRACT_CREATED = "contract_created"
    CONTRACT_COMPLETED = "contract_completed"
    MESSAGE_RECEIVED = "message_received"
    REVIEW_RECEIVED = "review_received"


class NotificationResponse(BaseModel):
    id: int
    user_id: int
    type: NotificationType
    title: str
    message: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True