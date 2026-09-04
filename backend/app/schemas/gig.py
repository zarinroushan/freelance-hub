from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class GigStatus(str, Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class GigCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=20, max_length=5000)
    category_id: int
    budget: int = Field(..., gt=0)
    delivery_days: int = Field(..., gt=0)
    requirements: Optional[str] = None
    deliverables: Optional[str] = None
    skill_ids: Optional[List[int]] = []


class GigUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    budget: Optional[int] = None
    delivery_days: Optional[int] = None
    status: Optional[GigStatus] = None


class GigResponse(BaseModel):
    id: int
    title: str
    description: str
    category_id: int
    client_id: int
    budget: int
    delivery_days: int
    status: GigStatus
    application_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True