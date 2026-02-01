import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.financial_memory import FinancialMemory
from app.models.investment_account import InvestmentAccount
from app.models.memory_event import MemoryEvent, MemoryEventSource


async def derive_memory_from_accounts(
    user_id: uuid.UUID,
    memory: FinancialMemory,
    session: AsyncSession,
) -> list[str]:
    """Auto-populate memory fields from linked account data.

    Returns a list of field names that were updated.
    """
    updated_fields: list[str] = []

    # Derive current_retirement_savings from tax-advantaged accounts
    result = await session.execute(
        select(InvestmentAccount).where(
            InvestmentAccount.user_id == user_id,
            InvestmentAccount.is_tax_advantaged.is_(True),
        )
    )
    tax_advantaged_accounts = result.scalars().all()

    if tax_advantaged_accounts:
        total = sum(
            (a.balance for a in tax_advantaged_accounts), Decimal("0.00")
        )
        old_value = (
            str(memory.current_retirement_savings)
            if memory.current_retirement_savings is not None
            else None
        )
        if memory.current_retirement_savings != total:
            memory.current_retirement_savings = total
            updated_fields.append("current_retirement_savings")
            session.add(
                MemoryEvent(
                    user_id=user_id,
                    field_name="current_retirement_savings",
                    old_value=old_value,
                    new_value=str(total),
                    source=MemoryEventSource.account_sync,
                    context="Derived from sum of tax-advantaged account balances",
                )
            )

    return updated_fields
