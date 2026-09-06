from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.database import Base


class ContractStatus(str, enum.Enum):
    PENDING = "pending"
    ACTIVE = "active"
    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    REVISION_REQUESTED = "revision_requested"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Contract(Base):
    __tablename__ = "contracts"
    
    id = Column(Integer, primary_key=True, index=True)
    gig_id = Column(Integer, ForeignKey("gigs.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    client_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    freelancer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    agreed_budget = Column(Integer, nullable=False)
    delivery_deadline = Column(DateTime, nullable=False)
    start_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum(ContractStatus), default=ContractStatus.PENDING)
    completion_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    payment = relationship("Payment", back_populates="contract", uselist=False)
    gig = relationship("Gig")
    application = relationship("Application", back_populates="contract")
    client = relationship("User", back_populates="contracts_as_client", foreign_keys=[client_id])
    freelancer = relationship("User", back_populates="contracts_as_freelancer", foreign_keys=[freelancer_id])
    deliverables = relationship("ContractDeliverable", back_populates="contract", cascade="all, delete-orphan")


class ContractDeliverable(Base):
    __tablename__ = "contract_deliverables"
    
    id = Column(Integer, primary_key=True, index=True)
    contract_id = Column(Integer, ForeignKey("contracts.id"), nullable=False)
    description = Column(Text, nullable=False)
    file_urls = Column(Text)
    submission_message = Column(Text)
    submitted_at = Column(DateTime)
    is_submitted = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    contract = relationship("Contract", back_populates="deliverables")