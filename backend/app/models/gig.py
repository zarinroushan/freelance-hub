from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base


class GigStatus(str, enum.Enum):
    DRAFT = "draft"
    OPEN = "open"
    CLOSED = "closed"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Gig(Base):
    __tablename__ = "gigs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    budget = Column(Integer, nullable=False)
    delivery_days = Column(Integer, nullable=False)
    status = Column(Enum(GigStatus), default=GigStatus.OPEN)
    requirements = Column(Text)
    deliverables = Column(Text)
    is_featured = Column(Boolean, default=False)
    application_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deadline = Column(DateTime)
    
    category = relationship("Category", back_populates="gigs")
    client = relationship("User", back_populates="gigs_posted", foreign_keys=[client_id])
    skills = relationship("GigSkill", back_populates="gig", cascade="all, delete-orphan")
    attachments = relationship("GigAttachment", back_populates="gig", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="gig", cascade="all, delete-orphan")
    saved_by = relationship("SavedGig", back_populates="gig", cascade="all, delete-orphan")


class GigSkill(Base):
    __tablename__ = "gig_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    gig_id = Column(Integer, ForeignKey("gigs.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    gig = relationship("Gig", back_populates="skills")
    skill = relationship("Skill", back_populates="gig_skills")


class GigAttachment(Base):
    __tablename__ = "gig_attachments"
    
    id = Column(Integer, primary_key=True, index=True)
    gig_id = Column(Integer, ForeignKey("gigs.id"), nullable=False)
    file_url = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String)
    file_size = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    gig = relationship("Gig", back_populates="attachments")