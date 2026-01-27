import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.debt_account import DebtType


class DebtAccountCreate(BaseModel):
    name: str
    debt_type: DebtType
    balance: Decimal = Decimal("0.00")
    interest_rate: Decimal
    minimum_payment: Decimal = Decimal("0.00")
    institution_name: str | None = None


class DebtAccountUpdate(BaseModel):
    name: str | None = None
    debt_type: DebtType | None = None
    balance: Decimal | None = None
    interest_rate: Decimal | None = None
    minimum_payment: Decimal | None = None
    institution_name: str | None = None


class DebtAccountResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    debt_type: DebtType
    balance: Decimal
    interest_rate: Decimal
    minimum_payment: Decimal
    institution_name: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
