import asyncio
import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cash_account import CashAccount
from app.models.debt_account import DebtAccount
from app.models.investment_account import InvestmentAccount
from app.models.physical_asset import (
    RealEstateAsset, 
    VehicleAsset,
    CollectibleAsset,
    PreciousMetalAsset,
    AlternativeAsset
)


async def get_cash_and_debt_totals(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> tuple[Decimal, Decimal]:
    """Return (total_cash, total_debt) for a user."""
    cash_result = await session.execute(
        select(CashAccount).where(CashAccount.user_id == user_id)
    )
    total_cash = sum(
        (a.balance for a in cash_result.scalars().all()), Decimal("0.00")
    )

    debt_result = await session.execute(
        select(DebtAccount).where(DebtAccount.user_id == user_id)
    )
    total_debt = sum(
        (a.balance for a in debt_result.scalars().all()), Decimal("0.00")
    )

    return total_cash, total_debt


async def get_physical_asset_total(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> Decimal:
    """Return total market value of all physical assets (real estate + vehicles + collectibles + metals + alternatives)."""
    re_result, v_result, c_result, m_result, a_result = await asyncio.gather(
        session.execute(select(RealEstateAsset).where(RealEstateAsset.user_id == user_id)),
        session.execute(select(VehicleAsset).where(VehicleAsset.user_id == user_id)),
        session.execute(select(CollectibleAsset).where(CollectibleAsset.user_id == user_id)),
        session.execute(select(PreciousMetalAsset).where(PreciousMetalAsset.user_id == user_id)),
        session.execute(select(AlternativeAsset).where(AlternativeAsset.user_id == user_id)),
    )

    total_re = sum((a.market_value for a in re_result.scalars().all()), Decimal("0.00"))
    total_v = sum((a.market_value for a in v_result.scalars().all()), Decimal("0.00"))
    total_c = sum((a.market_value for a in c_result.scalars().all()), Decimal("0.00"))
    total_m = sum((a.market_value for a in m_result.scalars().all()), Decimal("0.00"))
    total_a = sum((a.market_value for a in a_result.scalars().all()), Decimal("0.00"))

    return total_re + total_v + total_c + total_m + total_a


async def get_investment_total(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> Decimal:
    result = await session.execute(
        select(InvestmentAccount).where(InvestmentAccount.user_id == user_id)
    )
    accounts = result.scalars().all()
    return sum((a.balance for a in accounts), Decimal("0.00"))
