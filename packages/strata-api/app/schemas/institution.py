import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel


class InstitutionCreate(BaseModel):
    name: str
    logo_url: str | None = None
    providers: dict[str, Any] | None = None


class InstitutionUpdate(BaseModel):
    name: str | None = None
    logo_url: str | None = None
    providers: dict[str, Any] | None = None


class InstitutionResponse(BaseModel):
    id: uuid.UUID
    name: str
    logo_url: str | None
    providers: dict[str, Any] | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
