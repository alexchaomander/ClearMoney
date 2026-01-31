from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cash_account import CashAccount
from app.models.debt_account import DebtAccount
from app.models.investment_account import InvestmentAccount


async def get_cash_and_debt_totals(
    session: AsyncSession,
    user_id,
) -> tuple[Decimal, Decimal]:
    """Return (total_cash, total_debt) for a user."""
    cash_result = await session.execute(
        select(CashAccount).where(CashAccount.user_id == user_id)
    )
    total_cash = sum(a.balance for a in cash_result.scalars().all())

    debt_result = await session.execute(
        select(DebtAccount).where(DebtAccount.user_id == user_id)
    )
    total_debt = sum(a.balance for a in debt_result.scalars().all())

    return total_cash, total_debt


async def get_investment_total(
    session: AsyncSession,
    user_id,
) -> Decimal:
    result = await session.execute(
        select(InvestmentAccount).where(InvestmentAccount.user_id == user_id)
    )
    accounts = result.scalars().all()
    return sum(a.balance for a in accounts)
