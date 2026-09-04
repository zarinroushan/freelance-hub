from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationCreate(BaseModel):
    gig_id: int
    proposed_price: int = Field(..., gt=0)
    delivery_days: int = Field(..., gt=0)
    cover_letter: str = Field(..., min_length=20, max_length=3000)


class ApplicationResponse(BaseModel):
    id: int
    gig_id: int
    freelancer_id: int
    proposed_price: int
    status: ApplicationStatus
    created_at: datetime
    
    class Config:
        from_attributes = True