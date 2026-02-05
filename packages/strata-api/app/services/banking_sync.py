import logging
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.connection import Connection
from app.services.providers.base_banking import (
    BaseBankingProvider,
    NormalizedBankAccount,
    NormalizedBankTransaction,
)
from app.services.spending_derivation import update_memory_spending_categories
from app.services.user_refresh import refresh_user_financials

logger = logging.getLogger(__name__)


async def sync_banking_connection(
    session: AsyncSession,
    connection: Connection,
    provider: BaseBankingProvider,
    full_history: bool = False,
) -> None:
    """Sync bank accounts and transactions for a connection.

    Args:
        session: Database session.
        connection: The connection to sync.
        provider: The banking provider instance.
        full_history: If True, fetch full transaction history (up to banking_history_days).
    """
    # 1. Sync accounts
    normalized_accounts = await provider.get_accounts(connection)
    account_map: dict[str, CashAccount] = {}

    for normalized in normalized_accounts:
        account = await upsert_bank_account(session, connection, normalized)
        account_map[normalized.provider_account_id] = account

    # 2. Sync transactions
    days = settings.banking_history_days if full_history else 30
    start_date = date.today() - timedelta(days=days)
    end_date = date.today()

    transactions = await provider.get_transactions(connection, start_date, end_date)
    await upsert_bank_transactions(session, account_map, transactions)

    await session.flush()

    # 3. Derive spending categories from transactions
    await update_memory_spending_categories(session, connection.user_id)

    # 4. Refresh user financial summary
    await refresh_user_financials(session, connection.user_id, commit=False)


async def upsert_bank_account(
    session: AsyncSession,
    connection: Connection,
    normalized: NormalizedBankAccount,
) -> CashAccount:
    """Create or update a bank account from normalized data.

    Args:
        session: Database session.
        connection: The connection this account belongs to.
        normalized: Normalized account data from provider.

    Returns:
        The created or updated CashAccount.
    """
    # Check if account already exists
    result = await session.execute(
        select(CashAccount).where(
            CashAccount.connection_id == connection.id,
            CashAccount.provider_account_id == normalized.provider_account_id,
        )
    )
    account = result.scalar_one_or_none()

    if account is None:
        # Create new account
        account = CashAccount(
            user_id=connection.user_id,
            connection_id=connection.id,
            provider_account_id=normalized.provider_account_id,
            name=normalized.name,
            account_type=normalized.account_type,
            balance=normalized.balance,
            available_balance=normalized.available_balance,
            institution_name=normalized.institution_name,
            mask=normalized.mask,
            is_manual=False,
        )
        session.add(account)
    else:
        # Update existing account
        account.name = normalized.name
        account.account_type = normalized.account_type
        account.balance = normalized.balance
        account.available_balance = normalized.available_balance
        account.institution_name = normalized.institution_name
        account.mask = normalized.mask

    await session.flush()
    return account


async def upsert_bank_transactions(
    session: AsyncSession,
    account_map: dict[str, CashAccount],
    transactions: list[NormalizedBankTransaction],
) -> int:
    """Create or update bank transactions.

    Args:
        session: Database session.
        account_map: Mapping of provider_account_id to CashAccount.
        transactions: List of normalized transactions from provider.

    Returns:
        Number of transactions upserted.
    """
    upserted = 0

    for normalized in transactions:
        # Get the account_id from the transaction (set by provider)
        provider_account_id = getattr(normalized, "_account_id", None)
        if not provider_account_id:
            logger.warning(
                f"Transaction {normalized.provider_transaction_id} missing account_id"
            )
            continue

        account = account_map.get(provider_account_id)
        if not account:
            logger.warning(
                f"Transaction {normalized.provider_transaction_id} has unknown "
                f"account_id {provider_account_id}"
            )
            continue

        # Check if transaction exists
        result = await session.execute(
            select(BankTransaction).where(
                BankTransaction.cash_account_id == account.id,
                BankTransaction.provider_transaction_id == normalized.provider_transaction_id,
            )
        )
        txn = result.scalar_one_or_none()

        # Fields to sync from normalized transaction
        sync_fields = {
            "amount": normalized.amount,
            "transaction_date": normalized.transaction_date,
            "posted_date": normalized.posted_date,
            "name": normalized.name,
            "primary_category": normalized.primary_category,
            "detailed_category": normalized.detailed_category,
            "plaid_category": normalized.plaid_category,
            "merchant_name": normalized.merchant_name,
            "payment_channel": normalized.payment_channel,
            "pending": normalized.pending,
        }

        if txn is None:
            txn = BankTransaction(
                cash_account_id=account.id,
                provider_transaction_id=normalized.provider_transaction_id,
                iso_currency_code=normalized.iso_currency_code,
                **sync_fields,
            )
            session.add(txn)
        else:
            # Update existing transaction (may have changed from pending to posted)
            for field, value in sync_fields.items():
                setattr(txn, field, value)

        upserted += 1

    return upserted
