import uuid
from datetime import date
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.equity_grant import EquityGrantType


class VestingEvent(BaseModel):
    date: date
    quantity: Decimal


class EquityGrantBase(BaseModel):
    symbol: str
    grant_name: str
    grant_type: EquityGrantType
    quantity: Decimal = Field(default=Decimal("0.00"))
    strike_price: Decimal | None = None
    grant_date: date
    vesting_schedule: list[VestingEvent] | None = None
    notes: str | None = None


class EquityGrantCreate(EquityGrantBase):
    pass


class EquityGrantUpdate(BaseModel):
    symbol: str | None = None
    grant_name: str | None = None
    grant_type: EquityGrantType | None = None
    quantity: Decimal | None = None
    strike_price: Decimal | None = None
    grant_date: date | None = None
    vesting_schedule: list[VestingEvent] | None = None
    notes: str | None = None


class EquityGrant(EquityGrantBase):
    id: uuid.UUID
    user_id: uuid.UUID

    model_config = ConfigDict(from_attributes=True)


class EquityValuation(BaseModel):
    symbol: str
    current_price: Decimal
    vested_quantity: Decimal
    unvested_quantity: Decimal
    vested_value: Decimal
    unvested_value: Decimal
    total_value: Decimal
    next_vest_date: date | None = None
    next_vest_quantity: Decimal | None = None


class EquityPortfolioSummary(BaseModel):
    total_vested_value: Decimal
    total_unvested_value: Decimal
    total_value: Decimal
    grant_valuations: list[EquityValuation]


class EquityProjection(BaseModel):
    date: date
    total_value: Decimal
    liquid_value: Decimal
