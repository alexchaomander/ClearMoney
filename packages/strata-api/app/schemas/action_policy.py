from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class ActionPolicyRequest(BaseModel):
    allowed_actions: list[str] = Field(default_factory=list)
    max_amount: float | None = None
    require_confirmation: bool = True
    status: str = "active"


class ActionPolicyResponse(BaseModel):
    id: UUID
    allowed_actions: list[str]
    max_amount: float | None
    require_confirmation: bool
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
