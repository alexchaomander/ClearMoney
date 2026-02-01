import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.financial_memory import FinancialMemory
from app.models.investment_account import InvestmentAccount
from app.models.debt_account import DebtAccount, DebtType
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

    updated_fields.extend(await _derive_retirement_savings(user_id, memory, session))
    updated_fields.extend(await _derive_mortgage_details(user_id, memory, session))

    return updated_fields


async def _derive_retirement_savings(
    user_id: uuid.UUID,
    memory: FinancialMemory,
    session: AsyncSession,
) -> list[str]:
    updated_fields = []
    
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


async def _derive_mortgage_details(
    user_id: uuid.UUID,
    memory: FinancialMemory,
    session: AsyncSession,
) -> list[str]:
    updated_fields = []
    
    # Derive mortgage balance and rate from debt accounts
    result = await session.execute(
        select(DebtAccount).where(
            DebtAccount.user_id == user_id,
            DebtAccount.debt_type == DebtType.mortgage,
        )
    )
    mortgage_accounts = result.scalars().all()
    
    # If we have multiple mortgages, we sum balances and average rates (weighted?)
    # For MVP, we'll just take the primary (largest balance) one or sum balances.
    if mortgage_accounts:
        total_balance = sum(
            (a.balance for a in mortgage_accounts), Decimal("0.00")
        )
        
        # Weighted average interest rate
        weighted_rate_sum = Decimal("0.00")
        total_balance_with_rates = Decimal("0.00")

        for a in mortgage_accounts:
            if a.interest_rate is not None:
                weighted_rate_sum += a.interest_rate * a.balance
                total_balance_with_rates += a.balance

        avg_rate = (
            (weighted_rate_sum / total_balance_with_rates)
            if total_balance_with_rates > 0
            else None
        )
        
        # Update Balance
        old_balance = (
            str(memory.mortgage_balance)
            if memory.mortgage_balance is not None
            else None
        )
        if memory.mortgage_balance != total_balance:
            memory.mortgage_balance = total_balance
            updated_fields.append("mortgage_balance")
            session.add(
                MemoryEvent(
                    user_id=user_id,
                    field_name="mortgage_balance",
                    old_value=old_balance,
                    new_value=str(total_balance),
                    source=MemoryEventSource.account_sync,
                    context="Derived from linked mortgage accounts",
                )
            )
            
        # Update Rate (only if we calculated one)
        if avg_rate is not None:
             old_rate = (
                str(memory.mortgage_rate)
                if memory.mortgage_rate is not None
                else None
            )
             # Fuzzy float comparison
             if memory.mortgage_rate is None or abs(memory.mortgage_rate - avg_rate) > Decimal("0.001"):
                memory.mortgage_rate = avg_rate
                updated_fields.append("mortgage_rate")
                session.add(
                    MemoryEvent(
                        user_id=user_id,
                        field_name="mortgage_rate",
                        old_value=old_rate,
                        new_value=str(avg_rate),
                        source=MemoryEventSource.account_sync,
                        context="Derived from linked mortgage accounts (weighted average)",
                    )
                )

    return updated_fields
