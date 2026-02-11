from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

PlanStatus = Literal["draft", "active", "archived"]
CollaboratorRole = Literal["owner", "editor", "viewer"]


class TaxPlanCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    household_name: str | None = Field(default=None, max_length=160)


class TaxPlanUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=128)
    household_name: str | None = Field(default=None, max_length=160)
    status: PlanStatus | None = None


class TaxPlanResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    household_name: str | None
    status: str
    approved_version_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaxPlanVersionCreateRequest(BaseModel):
    label: str = Field(min_length=1, max_length=128)
    inputs: dict[str, Any]
    results: dict[str, Any] | None = None
    source: str = Field(default="manual", max_length=32)


class TaxPlanVersionResponse(BaseModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    created_by_user_id: uuid.UUID
    label: str
    inputs: dict[str, Any]
    results: dict[str, Any] | None
    source: str
    is_approved: bool
    approved_at: datetime | None
    approved_by_user_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaxPlanCommentCreateRequest(BaseModel):
    version_id: uuid.UUID | None = None
    body: str = Field(min_length=1, max_length=10000)
    author_role: CollaboratorRole = "owner"


class TaxPlanCommentResponse(BaseModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    version_id: uuid.UUID | None
    author_user_id: uuid.UUID
    author_role: str
    body: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaxPlanCollaboratorCreateRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    role: CollaboratorRole


class TaxPlanCollaboratorResponse(BaseModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    email: str
    role: str
    invited_by_user_id: uuid.UUID
    accepted_at: datetime | None
    revoked_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaxPlanEventCreateRequest(BaseModel):
    version_id: uuid.UUID | None = None
    event_type: str = Field(min_length=1, max_length=64)
    event_metadata: dict[str, Any] = Field(default_factory=dict)


class TaxPlanEventResponse(BaseModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    version_id: uuid.UUID | None
    actor_user_id: uuid.UUID | None
    event_type: str
    event_metadata: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
