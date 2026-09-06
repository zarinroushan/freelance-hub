from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base


class UserRole(str, enum.Enum):
    STUDENT = "student"
    CLIENT = "client"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile = relationship(
        "Profile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    gigs_posted = relationship(
        "Gig",
        back_populates="client",
        foreign_keys="Gig.client_id"
    )

    applications = relationship(
        "Application",
        back_populates="freelancer"
    )

    contracts_as_client = relationship(
        "Contract",
        back_populates="client",
        foreign_keys="Contract.client_id"
    )

    contracts_as_freelancer = relationship(
        "Contract",
        back_populates="freelancer",
        foreign_keys="Contract.freelancer_id"
    )

    sent_messages = relationship(
        "Message",
        back_populates="sender",
        foreign_keys="Message.sender_id"
    )

    notifications = relationship(
        "Notification",
        back_populates="user"
    )

    saved_gigs = relationship(
        "SavedGig",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    portfolio_items = relationship(
        "PortfolioItem",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    skills = relationship(
        "UserSkill",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    reviews_given = relationship(
        "Review",
        back_populates="reviewer",
        foreign_keys="Review.reviewer_id"
    )

    reviews_received = relationship(
        "Review",
        back_populates="reviewed",
        foreign_keys="Review.reviewed_id"
    )

class Profile(Base):
    __tablename__ = "profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    bio = Column(Text)
    university = Column(String)
    avatar_url = Column(String)
    skills_summary = Column(String)
    availability = Column(String, default="available")
    completed_gigs_count = Column(Integer, default=0)
    average_rating = Column(Integer, default=0)
    total_earnings = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="profile")
    