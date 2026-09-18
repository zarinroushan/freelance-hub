from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(
        Integer,
        ForeignKey("contracts.id"),
        unique=True,
        nullable=False
    )
    reviewer_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    reviewed_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )
    rating = Column(Integer, nullable=False)
    comment = Column(Text)
    is_from_client = Column(Boolean, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract")

    reviewer = relationship(
        "User",
        back_populates="reviews_given",
        foreign_keys=[reviewer_id]
    )

    reviewed = relationship(
        "User",
        back_populates="reviews_received",
        foreign_keys=[reviewed_id]
    )