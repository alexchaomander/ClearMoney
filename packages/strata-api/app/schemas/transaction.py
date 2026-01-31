import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.transaction import TransactionType


class TransactionResponse(BaseModel):
    id: uuid.UUID
    account_id: uuid.UUID
    security_id: uuid.UUID | None
    provider_transaction_id: str | None
    type: TransactionType
    quantity: Decimal | None
    price: Decimal | None
    amount: Decimal | None
    trade_date: date | None
    settlement_date: date | None
    currency: str
    description: str | None
    source: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
