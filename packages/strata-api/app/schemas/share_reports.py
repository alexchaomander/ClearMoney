from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Literal

from pydantic import BaseModel, Field


ShareMode = Literal["full", "redacted"]


class ShareReportCreateRequest(BaseModel):
    tool_id: str = Field(min_length=1, max_length=128)
    mode: ShareMode
    payload: dict[str, Any]
    expires_in_days: int | None = Field(default=30, ge=1, le=365)
    max_views: int | None = Field(default=None, ge=1, le=1000)


class ShareReportCreateResponse(BaseModel):
    id: uuid.UUID
    token: str
    tool_id: str
    mode: ShareMode
    created_at: datetime
    expires_at: datetime | None
    max_views: int | None

    model_config = {"from_attributes": True}


class ShareReportPublicResponse(BaseModel):
    id: uuid.UUID
    tool_id: str
    mode: ShareMode
    created_at: datetime
    expires_at: datetime | None
    max_views: int | None
    view_count: int
    last_viewed_at: datetime | None
    payload: dict[str, Any]


class ShareReportListItem(BaseModel):
    id: uuid.UUID
    tool_id: str
    mode: ShareMode
    created_at: datetime
    expires_at: datetime | None
    revoked_at: datetime | None
    max_views: int | None
    view_count: int
    last_viewed_at: datetime | None
    payload: dict[str, Any] | None = None

    model_config = {"from_attributes": True}


def compute_expires_at(expires_in_days: int | None) -> datetime | None:
    if not expires_in_days:
        return None
    return datetime.now(timezone.utc) + timedelta(days=expires_in_days)
