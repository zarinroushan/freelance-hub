from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    SHORTLISTED = "shortlisted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationCreate(BaseModel):
    gig_id: int
    proposed_price: int = Field(..., gt=0)
    delivery_days: int = Field(..., gt=0)
    cover_letter: str = Field(..., min_length=20, max_length=3000)


class FreelancerProfileResponse(BaseModel):
    id: Optional[int] = None
    user_id: Optional[int] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    university: Optional[str] = None
    avatar_url: Optional[str] = None
    availability: Optional[str] = "available"
    skills_summary: Optional[str] = None
    completed_gigs_count: Optional[int] = 0
    average_rating: Optional[int] = 0

    class Config:
        from_attributes = True


class FreelancerUserResponse(BaseModel):
    id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None
    profile: Optional[FreelancerProfileResponse] = None

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: int
    gig_id: int
    freelancer_id: int
    proposed_price: int
    delivery_days: int
    cover_letter: str
    portfolio_links: Optional[str] = None
    status: ApplicationStatus
    created_at: datetime
    freelancer: Optional[FreelancerUserResponse] = None

    class Config:
        from_attributes = True