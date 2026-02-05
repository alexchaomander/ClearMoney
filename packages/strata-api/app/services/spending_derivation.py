"""Spending categories derivation from bank transactions."""

import logging
import uuid
from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.financial_memory import FinancialMemory
from app.models.memory_event import MemoryEvent, MemoryEventSource

logger = logging.getLogger(__name__)


async def derive_spending_categories_from_transactions(
    session: AsyncSession,
    user_id: uuid.UUID,
    months: int = 3,
) -> dict[str, float]:
    """Derive spending_categories_monthly from bank transactions.

    Calculates the average monthly spending by category from linked bank accounts.

    Args:
        session: Database session.
        user_id: User ID to derive spending for.
        months: Number of months to analyze.

    Returns:
        Dictionary of category -> average monthly spending amount.
    """
    start_date = date.today() - timedelta(days=months * 30)

    # Query spending by category (only debits, amount < 0)
    result = await session.execute(
        select(
            BankTransaction.primary_category,
            func.sum(BankTransaction.amount).label("total"),
        )
        .join(CashAccount)
        .where(
            CashAccount.user_id == user_id,
            CashAccount.is_manual == False,  # noqa: E712 - Only linked accounts
            BankTransaction.transaction_date >= start_date,
            BankTransaction.amount < 0,  # Debits only
        )
        .group_by(BankTransaction.primary_category)
    )

    rows = result.all()

    if not rows:
        return {}

    # Calculate average monthly spending per category
    spending: dict[str, float] = {}
    for row in rows:
        category = row.primary_category or "uncategorized"
        # Convert to monthly average and make positive
        monthly_avg = abs(float(row.total)) / months
        spending[category] = round(monthly_avg, 2)

    return spending


async def update_memory_spending_categories(
    session: AsyncSession,
    user_id: uuid.UUID,
    months: int = 3,
) -> bool:
    """Update the user's financial memory with derived spending categories.

    Only updates if the user has linked banking accounts. Preserves manually
    entered data if no linked accounts exist.

    Args:
        session: Database session.
        user_id: User ID to update memory for.
        months: Number of months to analyze.

    Returns:
        True if memory was updated, False otherwise.
    """
    # Check if user has any linked (non-manual) bank accounts
    linked_accounts_result = await session.execute(
        select(func.count())
        .select_from(CashAccount)
        .where(
            CashAccount.user_id == user_id,
            CashAccount.is_manual == False,  # noqa: E712
        )
    )
    linked_count = linked_accounts_result.scalar() or 0

    if linked_count == 0:
        logger.debug(f"User {user_id} has no linked bank accounts, skipping derivation")
        return False

    # Derive spending categories
    spending = await derive_spending_categories_from_transactions(session, user_id, months)

    if not spending:
        logger.debug(f"No spending data found for user {user_id}")
        return False

    # Get or create financial memory
    memory_result = await session.execute(
        select(FinancialMemory).where(FinancialMemory.user_id == user_id)
    )
    memory = memory_result.scalar_one_or_none()

    if memory is None:
        memory = FinancialMemory(user_id=user_id)
        session.add(memory)
        await session.flush()

    # Update spending categories
    old_value = memory.spending_categories_monthly
    memory.spending_categories_monthly = spending

    # Log the derivation event
    event = MemoryEvent(
        memory_id=memory.id,
        field_name="spending_categories_monthly",
        old_value=old_value,
        new_value=spending,
        source=MemoryEventSource.derived,
        agent_session_id=None,
    )
    session.add(event)

    logger.info(
        f"Updated spending_categories_monthly for user {user_id} with {len(spending)} categories"
    )

    return True
