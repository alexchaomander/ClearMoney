import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.security import SecurityResponse


class HoldingCreate(BaseModel):
    account_id: uuid.UUID
    security_id: uuid.UUID
    quantity: Decimal
    cost_basis: Decimal | None = None
    market_value: Decimal | None = None
    as_of: datetime | None = None


class HoldingUpdate(BaseModel):
    security_id: uuid.UUID | None = None
    quantity: Decimal | None = None
    cost_basis: Decimal | None = None
    market_value: Decimal | None = None
    as_of: datetime | None = None


class HoldingResponse(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    security_id: uuid.UUID
    quantity: Decimal
    cost_basis: Decimal | None
    market_value: Decimal | None
    as_of: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HoldingWithSecurityResponse(HoldingResponse):
    """Holding response with security details included."""

    security: SecurityResponse
