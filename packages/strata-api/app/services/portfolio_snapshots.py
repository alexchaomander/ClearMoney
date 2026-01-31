import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portfolio_snapshot import PortfolioSnapshot
from app.models.user import User
from app.services.portfolio_metrics import (
    get_cash_and_debt_totals,
    get_investment_total,
)


async def create_snapshot_for_user(
    session: AsyncSession,
    user_id: uuid.UUID,
    snapshot_date: date | None = None,
) -> tuple[PortfolioSnapshot, bool]:
    snapshot_date = snapshot_date or date.today()

    existing = await session.execute(
        select(PortfolioSnapshot).where(
            PortfolioSnapshot.user_id == user_id,
            PortfolioSnapshot.snapshot_date == snapshot_date,
        )
    )
    snapshot = existing.scalar_one_or_none()
    if snapshot:
        return snapshot, False

    total_cash, total_debt = await get_cash_and_debt_totals(session, user_id)
    total_investment = await get_investment_total(session, user_id)
    net_worth = total_cash + total_investment - total_debt

    snapshot = PortfolioSnapshot(
        user_id=user_id,
        snapshot_date=snapshot_date,
        net_worth=net_worth,
        total_investment_value=total_investment,
        total_cash_value=total_cash,
        total_debt_value=total_debt,
    )
    session.add(snapshot)
    await session.flush()
    return snapshot, True


async def create_daily_snapshots(session: AsyncSession) -> int:
    result = await session.execute(select(User))
    users = result.scalars().all()

    created = 0
    for user in users:
        _, was_created = await create_snapshot_for_user(session, user.id)
        if was_created:
            created += 1

    await session.commit()
    return created
