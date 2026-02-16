import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.cash_account import CashAccountType


class CashAccountCreate(BaseModel):
    name: str
    account_type: CashAccountType
    balance: Decimal = Decimal("0.00")
    apy: Decimal | None = None
    institution_name: str | None = None
    is_business: bool = False


class CashAccountUpdate(BaseModel):
    name: str | None = None
    account_type: CashAccountType | None = None
    balance: Decimal | None = None
    apy: Decimal | None = None
    institution_name: str | None = None
    is_business: bool | None = None


class CashAccountResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    account_type: CashAccountType
    balance: Decimal
    apy: Decimal | None
    institution_name: str | None
    is_business: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
