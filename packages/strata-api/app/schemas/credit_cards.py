from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CardCreditBase(BaseModel):
    name: str
    value: Decimal
    period: str
    description: Optional[str] = None
    category: Optional[str] = None

class CardCredit(CardCreditBase):
    id: UUID
    card_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CardBenefitBase(BaseModel):
    name: str
    description: Optional[str] = None
    valuation_method: Optional[str] = None
    default_value: Optional[Decimal] = None

class CardBenefit(CardBenefitBase):
    id: UUID
    card_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class CreditCardBase(BaseModel):
    name: str
    issuer: str
    annual_fee: Decimal
    image_url: Optional[str] = None
    apply_url: Optional[str] = None

class CreditCard(CreditCardBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    credits: list[CardCredit] = []
    benefits: list[CardBenefit] = []

    model_config = ConfigDict(from_attributes=True)
