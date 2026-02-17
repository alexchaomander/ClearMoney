import logging
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from math import ceil

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.connection import Connection, ConnectionStatus
from app.models.user import User
from app.schemas.banking import (
    BankAccountResponse,
    BankTransactionReimbursementUpdate,
    BankTransactionResponse,
    ConnectionResponse,
    PaginatedBankTransactions,
    PlaidCallbackRequest,
    PlaidLinkRequest,
    PlaidLinkResponse,
    SpendingCategoryBreakdown,
    SpendingSummaryResponse,
)
from app.services.banking_sync import sync_banking_connection
from app.services.providers.plaid import PlaidProvider
from app.services.user_refresh import refresh_user_financials

logger = logging.getLogger(__name__)

from app.services.subscriptions import SubscriptionService

router = APIRouter(prefix="/banking", tags=["banking"])


def get_plaid_provider() -> PlaidProvider:
    """Get the Plaid provider instance."""
    return PlaidProvider()


async def _get_user_connection(
    session: AsyncSession,
    connection_id: uuid.UUID,
    user_id: uuid.UUID,
) -> Connection:
    """Get a connection owned by the user or raise 404."""
    result = await session.execute(
        select(Connection).where(
            Connection.id == connection_id,
            Connection.user_id == user_id,
        )
    )
    connection = result.scalar_one_or_none()

    if not connection:
        raise HTTPException(status_code=404, detail="Connection not found")

    return connection


async def _sync_connection_with_error_handling(
    session: AsyncSession,
    connection: Connection,
    provider: PlaidProvider,
    full_history: bool = False,
) -> None:
    """Sync a banking connection and handle errors consistently.

    Updates connection status to active on success or error on failure.
    """
    try:
        await sync_banking_connection(session, connection, provider, full_history=full_history)
        connection.status = ConnectionStatus.active
        connection.last_synced_at = datetime.now(timezone.utc)
        connection.error_code = None
        connection.error_message = None
    except Exception as e:
        logger.error(f"Failed to sync banking connection {connection.id}: {e}", exc_info=True)
        connection.status = ConnectionStatus.error
        connection.error_code = "SYNC_FAILED"
        # Use generic message to avoid exposing sensitive information
        connection.error_message = "Failed to sync banking data. Please try again or reconnect."


@router.post("/link", response_model=PlaidLinkResponse)
async def create_plaid_link_token(
    request: PlaidLinkRequest,
    user: User = Depends(require_scopes(["connections:write"])),
    provider: PlaidProvider = Depends(get_plaid_provider),
) -> PlaidLinkResponse:
    """Create a Plaid Link token for initializing Plaid Link.

    Returns a link_token that the client should use to initialize Plaid Link.
    """
    link_session = await provider.create_link_token(
        user_id=str(user.id),
        redirect_uri=request.redirect_uri,
    )

    return PlaidLinkResponse(
        link_token=link_session.link_token,
        expiration=link_session.expiration,
    )


@router.post("/callback", response_model=ConnectionResponse)
async def handle_plaid_callback(
    request: PlaidCallbackRequest,
    user: User = Depends(require_scopes(["connections:write"])),
    session: AsyncSession = Depends(get_async_session),
    provider: PlaidProvider = Depends(get_plaid_provider),
) -> ConnectionResponse:
    """Handle the Plaid Link success callback.

    This endpoint is called after the user completes the Plaid Link flow.
    It exchanges the public_token for an access_token and syncs accounts.
    """
    # Exchange public token for access token
    credentials = await provider.exchange_public_token(
        user_id=str(user.id),
        public_token=request.public_token,
    )

    # Create the connection record
    connection = Connection(
        user_id=user.id,
        provider=provider.provider_name,
        provider_user_id=credentials.get("plaid_user_id", ""),
        credentials=credentials,
        status=ConnectionStatus.pending,
        last_synced_at=None,
    )
    session.add(connection)
    await session.commit()
    await session.refresh(connection)

    # Sync accounts and transactions (full history for initial sync)
    await _sync_connection_with_error_handling(
        session, connection, provider, full_history=True
    )
    await session.commit()
    await session.refresh(connection)

    return ConnectionResponse.model_validate(connection)


@router.get("/accounts", response_model=list[BankAccountResponse])
async def list_bank_accounts(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
    include_manual: bool = Query(True, description="Include manually-created accounts"),
) -> list[BankAccountResponse]:
    """List all bank accounts (linked and optionally manual)."""
    query = select(CashAccount).where(CashAccount.user_id == user.id)

    if not include_manual:
        query = query.where(CashAccount.is_manual == False)  # noqa: E712

    result = await session.execute(query.order_by(CashAccount.created_at.desc()))
    accounts = result.scalars().all()

    return [BankAccountResponse.model_validate(a) for a in accounts]


@router.get("/transactions", response_model=PaginatedBankTransactions)
async def list_bank_transactions(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
    account_id: uuid.UUID | None = Query(None, description="Filter by account ID"),
    start_date: date | None = Query(None, description="Start date filter"),
    end_date: date | None = Query(None, description="End date filter"),
    category: str | None = Query(None, description="Filter by primary category"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=500, description="Items per page"),
) -> PaginatedBankTransactions:
    """List bank transactions with filtering and pagination."""
    # Base query joining to cash_accounts to verify ownership
    base_query = (
        select(BankTransaction)
        .join(CashAccount)
        .where(CashAccount.user_id == user.id)
    )

    if account_id:
        base_query = base_query.where(BankTransaction.cash_account_id == account_id)

    if start_date:
        base_query = base_query.where(BankTransaction.transaction_date >= start_date)

    if end_date:
        base_query = base_query.where(BankTransaction.transaction_date <= end_date)

    if category:
        base_query = base_query.where(BankTransaction.primary_category == category)

    # Get total count
    count_query = select(func.count()).select_from(base_query.subquery())
    total_result = await session.execute(count_query)
    total = total_result.scalar() or 0

    # Get paginated results
    offset = (page - 1) * page_size
    result = await session.execute(
        base_query.order_by(BankTransaction.transaction_date.desc())
        .offset(offset)
        .limit(page_size)
    )
    transactions = result.scalars().all()

    return PaginatedBankTransactions(
        transactions=[BankTransactionResponse.model_validate(t) for t in transactions],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total > 0 else 0,
    )


@router.patch("/transactions/{transaction_id}", response_model=BankTransactionResponse)
async def update_bank_transaction_reimbursement(
    transaction_id: uuid.UUID,
    data: BankTransactionReimbursementUpdate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> BankTransactionResponse:
    """Annotate a bank transaction with reimbursement metadata."""
    result = await session.execute(
        select(BankTransaction)
        .join(CashAccount)
        .where(BankTransaction.id == transaction_id, CashAccount.user_id == user.id)
    )
    tx = result.scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if data.reimbursed:
        tx.reimbursed_at = datetime.now(timezone.utc)
        tx.reimbursement_memo = (data.memo or "").strip() or None
    else:
        tx.reimbursed_at = None
        tx.reimbursement_memo = None

    await session.commit()
    await session.refresh(tx)
    return BankTransactionResponse.model_validate(tx)


@router.get("/spending-summary", response_model=SpendingSummaryResponse)
async def get_spending_summary(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
    months: int = Query(3, ge=1, le=24, description="Number of months to analyze"),
) -> SpendingSummaryResponse:
    """Get spending breakdown by category for the specified period."""
    end_date = date.today()
    # Calculate start_date by subtracting months precisely
    year = end_date.year
    month = end_date.month - months
    while month <= 0:
        month += 12
        year -= 1
    # Clamp day to valid range for the target month
    day = min(end_date.day, 28)  # Safe for all months
    start_date = date(year, month, day)

    # Query spending by category (only debits, amount < 0)
    category_query = (
        select(
            BankTransaction.primary_category,
            func.sum(BankTransaction.amount).label("total"),
            func.count().label("count"),
        )
        .join(CashAccount)
        .where(
            CashAccount.user_id == user.id,
            BankTransaction.transaction_date >= start_date,
            BankTransaction.transaction_date <= end_date,
            BankTransaction.amount < 0,  # Debits only
        )
        .group_by(BankTransaction.primary_category)
        .order_by(func.sum(BankTransaction.amount))  # Most spending first (most negative)
    )

    result = await session.execute(category_query)
    rows = result.all()

    # Calculate totals
    total_spending = Decimal("0")
    categories: list[SpendingCategoryBreakdown] = []

    for row in rows:
        amount = abs(row.total) if row.total else Decimal("0")
        total_spending += amount

    # Build category breakdown with percentages
    for row in rows:
        amount = abs(row.total) if row.total else Decimal("0")
        percentage = float(amount / total_spending * 100) if total_spending > 0 else 0

        categories.append(
            SpendingCategoryBreakdown(
                category=row.primary_category or "Uncategorized",
                total=amount,
                percentage=round(percentage, 2),
                transaction_count=row.count,
            )
        )

    monthly_average = total_spending / Decimal(str(months)) if months > 0 else Decimal("0")

    return SpendingSummaryResponse(
        total_spending=total_spending,
        monthly_average=monthly_average.quantize(Decimal("0.01")),
        categories=categories,
        start_date=start_date,
        end_date=end_date,
        months_analyzed=months,
    )


@router.post("/{connection_id}/sync", response_model=ConnectionResponse)
async def sync_banking_connection_endpoint(
    connection_id: uuid.UUID,
    user: User = Depends(require_scopes(["connections:write"])),
    session: AsyncSession = Depends(get_async_session),
    provider: PlaidProvider = Depends(get_plaid_provider),
) -> ConnectionResponse:
    """Manually trigger a sync for a banking connection."""
    connection = await _get_user_connection(session, connection_id, user.id)

    if connection.provider != provider.provider_name:
        raise HTTPException(
            status_code=400,
            detail=f"Connection is not a Plaid connection (provider: {connection.provider})",
        )

    await _sync_connection_with_error_handling(session, connection, provider)
    await session.commit()
    await session.refresh(connection)

    return ConnectionResponse.model_validate(connection)


@router.delete("/{connection_id}")
async def delete_banking_connection(
    connection_id: uuid.UUID,
    user: User = Depends(require_scopes(["connections:write"])),
    session: AsyncSession = Depends(get_async_session),
    provider: PlaidProvider = Depends(get_plaid_provider),
) -> dict:
    """Delete a banking connection and all associated accounts/transactions."""
    connection = await _get_user_connection(session, connection_id, user.id)

    if connection.provider != provider.provider_name:
        raise HTTPException(
            status_code=400,
            detail=f"Connection is not a Plaid connection (provider: {connection.provider})",
        )

    # Delete from Plaid first
    await provider.delete_connection(connection)

    # Get all cash accounts for this connection
    accounts_result = await session.execute(
        select(CashAccount).where(CashAccount.connection_id == connection.id)
    )
    accounts = accounts_result.scalars().all()

    # Delete accounts (cascade will handle associated transactions)
    for account in accounts:
        await session.delete(account)

    # Finally delete the connection
    await session.delete(connection)
    await session.commit()
    await refresh_user_financials(session, user.id)

    logger.info(
        f"Deleted banking connection {connection_id} with {len(accounts)} accounts "
        f"for user {user.id}"
    )

    return {"status": "deleted"}


@router.get("/subscriptions")
async def get_subscriptions(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """Detect recurring subscriptions from transactions."""
    service = SubscriptionService(session)
    return await service.detect_subscriptions(user.id)
