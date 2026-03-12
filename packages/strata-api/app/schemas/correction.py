import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.financial_correction import (
    FinancialCorrectionStatus,
    FinancialCorrectionType,
)


class FinancialCorrectionCreate(BaseModel):
    metric_id: str | None = None
    trace_id: uuid.UUID | None = None
    correction_type: FinancialCorrectionType
    target_field: str
    target_id: str | None = None
    summary: str | None = None
    reason: str
    proposed_value: dict[str, Any] = Field(default_factory=dict)
    apply_immediately: bool = True


class FinancialCorrectionUpdate(BaseModel):
    status: FinancialCorrectionStatus | None = None
    summary: str | None = None
    resolved_value: dict[str, Any] | None = None
    impact_summary: dict[str, Any] | None = None


class FinancialCorrectionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    trace_id: uuid.UUID | None
    metric_id: str | None
    correction_type: FinancialCorrectionType
    status: FinancialCorrectionStatus
    target_field: str
    target_id: str | None
    summary: str | None
    reason: str
    original_value: dict[str, Any]
    proposed_value: dict[str, Any]
    resolved_value: dict[str, Any] | None
    impact_summary: dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
