import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.income_source import IncomeFrequency, IncomeSourceType


class IncomeSourceCreate(BaseModel):
    name: str
    source_type: IncomeSourceType
    amount: Decimal
    frequency: IncomeFrequency
    is_variable: bool = False


class IncomeSourceUpdate(BaseModel):
    name: str | None = None
    source_type: IncomeSourceType | None = None
    amount: Decimal | None = None
    frequency: IncomeFrequency | None = None
    is_variable: bool | None = None


class IncomeSourceResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    name: str
    source_type: IncomeSourceType
    amount: Decimal
    frequency: IncomeFrequency
    is_variable: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
