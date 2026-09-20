from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models.message import Conversation, Message
from app.models.user import User
from app.models.gig import Gig
from app.core.security import get_current_user
from sqlalchemy import or_, and_

router = APIRouter()


@router.get("/conversations", response_model=List[dict])
def get_my_conversations(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    convs = db.query(Conversation).filter(
        or_(
            Conversation.participant_1_id == user_id,
            Conversation.participant_2_id == user_id
        ),
        Conversation.gig_id.isnot(None),
        Conversation.application_id.isnot(None)
    ).order_by(Conversation.last_message_at.desc()).all()
    
    result = []
    for conv in convs:
        other_id = conv.participant_2_id if conv.participant_1_id == user_id else conv.participant_1_id
        other = db.query(User).filter(User.id == other_id).first()
        gig = db.query(Gig).filter(Gig.id == conv.gig_id).first()
        last_msg = db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).first()
        result.append({
            "conversation": {
                "id": conv.id,
                "participant_1_id": conv.participant_1_id,
                "participant_2_id": conv.participant_2_id,
                "gig_id": conv.gig_id,
                "application_id": conv.application_id,
                "last_message_at": conv.last_message_at,
            },
            "other_user": {
                "id": other.id,
                "email": other.email
            } if other else None,
            "gig": {
                "id": gig.id,
                "title": gig.title
            } if gig else None,
            "last_message": {
                "id": last_msg.id,
                "conversation_id": last_msg.conversation_id,
                "sender_id": last_msg.sender_id,
                "content": last_msg.content,
                "created_at": last_msg.created_at,
            } if last_msg else None,
        })
    return result


@router.post("/start/{recipient_id}")
def start_conversation(
    recipient_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    raise HTTPException(
        status_code=403,
        detail="Messaging is available only after an application is accepted."
    )


@router.get("/conversation/{conversation_id}", response_model=List[dict])
def get_messages(conversation_id: int, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv or (conv.participant_1_id != user_id and conv.participant_2_id != user_id):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    msgs = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [
        {
            "id": m.id,
            "conversation_id": m.conversation_id,
            "sender_id": m.sender_id,
            "content": m.content,
            "created_at": m.created_at,
        }
        for m in msgs
    ]


@router.post("/send")
def send_message(data: dict, current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    user_id = int(current_user["user_id"])
    conv_id = data.get("conversation_id")
    conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
    if (
        not conv
        or conv.gig_id is None
        or conv.application_id is None
        or (
            conv.participant_1_id != user_id
            and conv.participant_2_id != user_id
        )
    ):
        raise HTTPException(
            status_code=403,
            detail="Messaging is available only for accepted applications."
        )
    
    msg = Message(conversation_id=conv_id, sender_id=user_id, content=data.get("content", ""))
    db.add(msg)
    conv.last_message_at = msg.created_at
    db.commit()
    db.refresh(msg)

    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "sender_id": msg.sender_id,
        "content": msg.content,
        "created_at": msg.created_at,
    }