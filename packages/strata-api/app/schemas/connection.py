import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.connection import ConnectionStatus
from app.schemas.action_capability import ActionCapability


class ConnectionCreate(BaseModel):
    provider: str
    provider_user_id: str
    institution_id: uuid.UUID | None = None
    credentials: dict[str, Any] | None = None
    status: ConnectionStatus = ConnectionStatus.pending


class ConnectionUpdate(BaseModel):
    status: ConnectionStatus | None = None
    institution_id: uuid.UUID | None = None
    error_code: str | None = None
    error_message: str | None = None


class ConnectionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    institution_id: uuid.UUID | None
    provider: str
    provider_user_id: str
    status: ConnectionStatus
    capabilities: list[ActionCapability] = Field(default_factory=lambda: [ActionCapability.READ_ONLY])
    last_synced_at: datetime | None
    error_code: str | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class LinkSessionRequest(BaseModel):
    """Request to create a connection link session."""

    institution_id: uuid.UUID | None = None
    redirect_uri: str | None = None


class LinkSessionResponse(BaseModel):
    """Response containing the link session URL."""

    redirect_url: str
    session_id: str | None = None


class ConnectionCallbackRequest(BaseModel):
    """Callback request from the OAuth provider."""

    code: str | None = None
    state: str | None = None
    error: str | None = None
    error_description: str | None = None
