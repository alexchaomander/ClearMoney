import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator

from app.models.action_intent import ActionIntentStatus, ActionIntentType


class ActionIntentCreate(BaseModel):
    intent_type: ActionIntentType
    title: str
    description: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    impact_summary: dict[str, Any] = Field(default_factory=dict)
    execution_manifest: dict[str, Any] = Field(default_factory=dict)
    decision_trace_id: uuid.UUID | None = None


class ActionIntentUpdate(BaseModel):
    status: ActionIntentStatus | None = None
    payload: dict[str, Any] | None = None
    impact_summary: dict[str, Any] | None = None
    execution_manifest: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_execution_manifest_not_null(self) -> "ActionIntentUpdate":
        if (
            "execution_manifest" in self.model_fields_set
            and self.execution_manifest is None
        ):
            raise ValueError("execution_manifest cannot be null")
        return self


class ActionIntentResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    decision_trace_id: uuid.UUID | None
    intent_type: ActionIntentType
    status: ActionIntentStatus
    title: str
    description: str | None
    payload: dict[str, Any]
    impact_summary: dict[str, Any]
    execution_manifest: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
