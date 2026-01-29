import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.security import SecurityType


class SecurityCreate(BaseModel):
    ticker: str | None = None
    name: str
    security_type: SecurityType
    cusip: str | None = None
    isin: str | None = None
    close_price: Decimal | None = None
    close_price_as_of: date | None = None


class SecurityUpdate(BaseModel):
    ticker: str | None = None
    name: str | None = None
    security_type: SecurityType | None = None
    cusip: str | None = None
    isin: str | None = None
    close_price: Decimal | None = None
    close_price_as_of: date | None = None


class SecurityResponse(BaseModel):
    id: uuid.UUID
    ticker: str | None
    name: str
    security_type: SecurityType
    cusip: str | None
    isin: str | None
    close_price: Decimal | None
    close_price_as_of: date | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
