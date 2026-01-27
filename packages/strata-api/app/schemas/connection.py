import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.models.connection import ConnectionStatus


class ConnectionCreate(BaseModel):
    provider: str
    provider_user_id: str
    credentials: dict[str, Any] | None = None
    status: ConnectionStatus = ConnectionStatus.pending


class ConnectionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    provider: str
    provider_user_id: str
    status: ConnectionStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
