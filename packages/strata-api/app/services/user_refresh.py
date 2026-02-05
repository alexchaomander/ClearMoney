import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.financial_memory import FinancialMemory
from app.services.memory_derivation import derive_memory_from_accounts
from app.services.portfolio_snapshots import create_snapshot_for_user


async def get_or_create_memory(
    user_id: uuid.UUID,
    session: AsyncSession,
) -> FinancialMemory:
    result = await session.execute(
        select(FinancialMemory).where(FinancialMemory.user_id == user_id)
    )
    memory = result.scalar_one_or_none()

    if memory is None:
        memory = FinancialMemory(user_id=user_id)
        session.add(memory)
        await session.flush()

    return memory


async def refresh_user_financials(
    session: AsyncSession,
    user_id: uuid.UUID,
    *,
    commit: bool = True,
) -> FinancialMemory:
    memory = await get_or_create_memory(user_id, session)
    await derive_memory_from_accounts(user_id, memory, session)
    await create_snapshot_for_user(session, user_id)

    if commit:
        await session.commit()
        await session.refresh(memory)

    return memory
