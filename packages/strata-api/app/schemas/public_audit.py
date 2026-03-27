from typing import Any
from uuid import UUID
from pydantic import BaseModel, Field
from app.schemas.agent import DecisionTracePayload

class PublicAuditUploadResponse(BaseModel):
    session_id: UUID
    message: str

class PublicAuditStatusResponse(BaseModel):
    session_id: UUID
    status: str  # pending | processing | success | error
    progress: int = 0
    error_message: str | None = None
    trace_payload: DecisionTracePayload | None = None

class PublicAuditManualInput(BaseModel):
    # Common fields for both Founder Runway and Tax Shield
    monthly_income: float | None = None
    monthly_expenses: float | None = None
    cash_balance: float | None = None
    business_cash_balance: float | None = None
    # Add more fields as needed for specific shots
