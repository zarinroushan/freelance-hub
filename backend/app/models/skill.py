from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False, index=True)
    category = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user_skills = relationship("UserSkill", back_populates="skill", cascade="all, delete-orphan")
    gig_skills = relationship("GigSkill", back_populates="skill", cascade="all, delete-orphan")


class UserSkill(Base):
    __tablename__ = "user_skills"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_id = Column(Integer, ForeignKey("skills.id"), nullable=False)
    proficiency_level = Column(String, default="intermediate")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="skills")
    skill = relationship("Skill", back_populates="user_skills")
    
    __table_args__ = (UniqueConstraint("user_id", "skill_id", name="unique_user_skill"),)