from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field


class LinkSessionRequest(BaseModel):
    user_id: str
    redirect_uri: str | None = None


class LinkSessionResponse(BaseModel):
    redirect_url: str
    session_id: str | None = None
    user_secret: str | None = None


class CallbackRequest(BaseModel):
    user_id: str
    user_secret: str
    authorization_id: str | None = None


class CredentialsResponse(BaseModel):
    snaptrade_user_id: str
    user_secret: str
    authorization_id: str | None = None


class ConnectionCredentials(BaseModel):
    snaptrade_user_id: str
    user_secret: str


class AccountRequest(BaseModel):
    credentials: ConnectionCredentials


class HoldingsRequest(AccountRequest):
    provider_account_id: str


class TransactionsRequest(AccountRequest):
    provider_account_id: str


class DeleteConnectionRequest(AccountRequest):
    pass


class NormalizedSecurityResponse(BaseModel):
    ticker: str | None = None
    name: str
    security_type: str
    cusip: str | None = None
    isin: str | None = None
    close_price: Decimal | None = None
    close_price_as_of: datetime | None = None
    provider_security_id: str | None = None


class NormalizedHoldingResponse(BaseModel):
    security: NormalizedSecurityResponse
    quantity: Decimal
    cost_basis: Decimal | None = None
    market_value: Decimal | None = None
    as_of: datetime | None = None
    provider_holding_id: str | None = None


class NormalizedAccountResponse(BaseModel):
    provider_account_id: str
    name: str
    account_type: str
    balance: Decimal
    currency: str = "USD"
    is_tax_advantaged: bool = False
    institution_name: str | None = None
    institution_id: str | None = None
    capabilities: list[str] = Field(default_factory=list)


class NormalizedTransactionResponse(BaseModel):
    provider_transaction_id: str | None = None
    transaction_type: str | None = None
    quantity: Decimal | None = None
    price: Decimal | None = None
    amount: Decimal | None = None
    trade_date: date | None = None
    settlement_date: date | None = None
    currency: str | None = None
    description: str | None = None
    security: NormalizedSecurityResponse | None = None
    source: str | None = None
