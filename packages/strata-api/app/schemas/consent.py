from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ConsentCreateRequest(BaseModel):
    scopes: list[str] = Field(..., min_length=1)
    purpose: str = Field(..., min_length=1)
    source: str | None = None


class ConsentResponse(BaseModel):
    id: UUID
    scopes: list[str]
    purpose: str
    status: str
    source: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
