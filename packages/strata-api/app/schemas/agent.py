from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


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

    model_config = ConfigDict(from_attributes=True)


class ExecuteRecommendationRequest(BaseModel):
    action: str
    connection_id: UUID | None = None
    payload: dict[str, Any] | None = None


class ExecuteRecommendationResponse(BaseModel):
    recommendation_id: UUID
    action: str
    status: str
    result: dict[str, Any]
    trace_id: UUID
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
