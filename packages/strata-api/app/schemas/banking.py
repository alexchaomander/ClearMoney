import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel

from app.models.cash_account import CashAccountType


class PlaidLinkRequest(BaseModel):
    """Request to create a Plaid Link token."""

    redirect_uri: str | None = None


class PlaidLinkResponse(BaseModel):
    """Response containing the Plaid Link token."""

    link_token: str
    expiration: str | None = None


class PlaidCallbackRequest(BaseModel):
    """Callback request from Plaid Link success."""

    public_token: str
    institution_id: str | None = None
    institution_name: str | None = None


class BankAccountResponse(BaseModel):
    """Response for a bank account."""

    id: uuid.UUID
    user_id: uuid.UUID
    connection_id: uuid.UUID | None
    name: str
    account_type: CashAccountType
    balance: Decimal
    available_balance: Decimal | None
    institution_name: str | None
    mask: str | None
    is_manual: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BankTransactionResponse(BaseModel):
    """Response for a bank transaction."""

    id: uuid.UUID
    cash_account_id: uuid.UUID
    provider_transaction_id: str
    amount: Decimal
    transaction_date: date
    posted_date: date | None
    name: str
    primary_category: str | None
    detailed_category: str | None
    merchant_name: str | None
    payment_channel: str | None
    pending: bool
    iso_currency_code: str
    reimbursed_at: datetime | None
    reimbursement_memo: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BankTransactionReimbursementUpdate(BaseModel):
    reimbursed: bool
    memo: str | None = None


class PaginatedBankTransactions(BaseModel):
    """Paginated list of bank transactions."""

    transactions: list[BankTransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SpendingCategoryBreakdown(BaseModel):
    """Breakdown of spending by category."""

    category: str
    total: Decimal
    percentage: float
    transaction_count: int


class SpendingSummaryResponse(BaseModel):
    """Response for spending summary."""

    total_spending: Decimal
    monthly_average: Decimal
    categories: list[SpendingCategoryBreakdown]
    start_date: date
    end_date: date
    months_analyzed: int


class ConnectionResponse(BaseModel):
    """Response for a banking connection."""

    id: uuid.UUID
    user_id: uuid.UUID
    provider: str
    status: str
    last_synced_at: datetime | None
    error_code: str | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
