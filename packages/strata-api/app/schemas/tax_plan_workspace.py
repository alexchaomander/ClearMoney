from __future__ import annotations

import json
import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator

PlanStatus = Literal["draft", "active", "archived"]
CollaboratorRole = Literal["owner", "editor", "viewer"]
VersionSource = Literal["manual", "workspace", "advisor", "import"]
UserEventType = Literal[
    "packet_exported",
    "comparison_used",
    "csv_imported",
    "shared_import_loaded",
    "share_link_created",
    "version_saved",
    "plan_created",
    "viewed",
]

MAX_JSON_PAYLOAD_BYTES = 102_400  # 100 KB
MAX_EVENT_METADATA_BYTES = 4_096  # 4 KB


def _check_json_size(value: dict[str, Any], max_bytes: int, field_name: str) -> dict[str, Any]:
    if len(json.dumps(value)) > max_bytes:
        raise ValueError(f"{field_name} exceeds maximum size of {max_bytes} bytes")
    return value


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
    status: PlanStatus
    approved_version_id: uuid.UUID | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaxPlanVersionCreateRequest(BaseModel):
    label: str = Field(min_length=1, max_length=128)
    inputs: dict[str, Any]
    results: dict[str, Any] | None = None
    source: VersionSource = "manual"

    @field_validator("inputs")
    @classmethod
    def validate_inputs_size(cls, v: dict[str, Any]) -> dict[str, Any]:
        return _check_json_size(v, MAX_JSON_PAYLOAD_BYTES, "inputs")

    @field_validator("results")
    @classmethod
    def validate_results_size(cls, v: dict[str, Any] | None) -> dict[str, Any] | None:
        if v is not None:
            _check_json_size(v, MAX_JSON_PAYLOAD_BYTES, "results")
        return v


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


class TaxPlanCommentResponse(BaseModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    version_id: uuid.UUID | None
    author_user_id: uuid.UUID
    author_role: CollaboratorRole
    body: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaxPlanCollaboratorCreateRequest(BaseModel):
    email: EmailStr = Field(max_length=320)
    role: CollaboratorRole


class TaxPlanCollaboratorResponse(BaseModel):
    id: uuid.UUID
    plan_id: uuid.UUID
    email: str
    role: CollaboratorRole
    invited_by_user_id: uuid.UUID
    accepted_at: datetime | None
    revoked_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaxPlanEventCreateRequest(BaseModel):
    version_id: uuid.UUID | None = None
    event_type: UserEventType
    event_metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("event_metadata")
    @classmethod
    def validate_metadata_size(cls, v: dict[str, Any]) -> dict[str, Any]:
        return _check_json_size(v, MAX_EVENT_METADATA_BYTES, "event_metadata")


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
