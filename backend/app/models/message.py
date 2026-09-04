from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from app.db.database import Base


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)

    participant_1_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    participant_2_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    last_message_at = Column(DateTime, default=datetime.utcnow)

    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan"
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(
        Integer,
        ForeignKey("conversations.id"),
        nullable=False
    )

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    content = Column(Text, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship(
        "Conversation",
        back_populates="messages"
    )

    sender = relationship(
        "User",
        back_populates="sent_messages"
    )