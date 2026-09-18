from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    STUDENT = "student"
    CLIENT = "client"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class ProfileCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    bio: Optional[str] = None
    university: Optional[str] = None
    avatar_url: Optional[str] = None


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    university: Optional[str] = None
    avatar_url: Optional[str] = None
    availability: Optional[str] = None
    skills_summary: Optional[str] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    full_name: str
    bio: Optional[str] = None
    university: Optional[str] = None
    avatar_url: Optional[str] = None
    availability: str = "available"
    skills_summary: Optional[str] = None
    completed_gigs_count: int = 0
    average_rating: int = 0
    total_earnings: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True