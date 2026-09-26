from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from enum import Enum
from urllib.parse import urlparse


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
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    additional_link: Optional[str] = None

    @field_validator("portfolio_url", "additional_link")
    @classmethod
    def validate_http_url(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        value = value.strip()
        parsed = urlparse(value)
        if len(value) > 2048 or parsed.scheme not in {"http", "https"} or not parsed.netloc:
            raise ValueError("Enter a valid http or https URL")
        return value


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


class ApplicationGigResponse(BaseModel):
    id: int
    title: str
    budget: int

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
    resume_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    additional_link: Optional[str] = None
    status: ApplicationStatus
    created_at: datetime
    freelancer: Optional[FreelancerUserResponse] = None
    gig: Optional[ApplicationGigResponse] = None

    class Config:
        from_attributes = True