from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class FreshnessStatus(BaseModel):
    is_fresh: bool
    age_hours: float | None = None
    max_age_hours: float
    last_sync: str | None = None
    warning: str | None = None


class AgentContextResponse(BaseModel):
    allowed: bool
    freshness: FreshnessStatus
    context: dict


class DecisionTraceResponse(BaseModel):
    id: UUID
    session_id: UUID
    recommendation_id: UUID | None
    trace_type: str
    input_data: dict
    reasoning_steps: list
    outputs: dict
    data_freshness: dict
    warnings: list
    source: str
    created_at: datetime

    class Config:
        from_attributes = True
