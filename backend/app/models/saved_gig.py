from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class SavedGig(Base):
    __tablename__ = "saved_gigs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    gig_id = Column(Integer, ForeignKey("gigs.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="saved_gigs")
    gig = relationship("Gig", back_populates="saved_by")
    
    __table_args__ = (UniqueConstraint("user_id", "gig_id", name="unique_saved_gig"),)