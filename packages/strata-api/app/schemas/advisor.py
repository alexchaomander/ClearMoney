from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.agent_session import RecommendationStatus, SessionStatus


class SessionCreateRequest(BaseModel):
    skill_name: str | None = None


class SessionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    skill_name: str | None
    status: SessionStatus
    messages: list
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SessionSummaryResponse(BaseModel):
    id: uuid.UUID
    skill_name: str | None
    status: SessionStatus
    message_count: int
    created_at: datetime
    updated_at: datetime


class MessageRequest(BaseModel):
    content: str


class RecommendationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    session_id: uuid.UUID
    skill_name: str
    title: str
    summary: str
    details: dict
    status: RecommendationStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
