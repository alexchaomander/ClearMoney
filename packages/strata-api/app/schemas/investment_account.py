from __future__ import annotations

import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.investment_account import InvestmentAccountType
from app.schemas.holding import HoldingWithSecurityResponse


class InvestmentAccountCreate(BaseModel):
    connection_id: uuid.UUID | None = None
    institution_id: uuid.UUID | None = None
    name: str
    account_type: InvestmentAccountType
    provider_account_id: str | None = None
    balance: Decimal = Decimal("0.00")
    currency: str = "USD"
    is_tax_advantaged: bool = False


class InvestmentAccountUpdate(BaseModel):
    connection_id: uuid.UUID | None = None
    institution_id: uuid.UUID | None = None
    name: str | None = None
    account_type: InvestmentAccountType | None = None
    provider_account_id: str | None = None
    balance: Decimal | None = None
    currency: str | None = None
    is_tax_advantaged: bool | None = None


class InvestmentAccountResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    connection_id: uuid.UUID | None
    institution_id: uuid.UUID | None
    name: str
    account_type: InvestmentAccountType
    provider_account_id: str | None
    balance: Decimal
    currency: str
    is_tax_advantaged: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InvestmentAccountWithHoldingsResponse(InvestmentAccountResponse):
    """Investment account response with holdings included."""

    holdings: list[HoldingWithSecurityResponse] = []

    model_config = {"from_attributes": True}
