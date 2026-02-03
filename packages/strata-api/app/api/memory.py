import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.financial_memory import FinancialMemory
from app.models.memory_event import MemoryEvent, MemoryEventSource
from app.models.user import User
from app.schemas.memory import (
    FinancialMemoryResponse,
    FinancialMemoryUpdate,
    MemoryEventResponse,
)
from app.services.financial_context import build_financial_context
from app.services.context_renderer import render_context_as_markdown
from app.services.memory_derivation import derive_memory_from_accounts

router = APIRouter(prefix="/memory", tags=["memory"])

# Fields that live on the FinancialMemory model (excludes source tracking fields)
_MEMORY_FIELDS = {
    "age",
    "state",
    "filing_status",
    "num_dependents",
    "annual_income",
    "monthly_income",
    "income_growth_rate",
    "federal_tax_rate",
    "state_tax_rate",
    "capital_gains_rate",
    "retirement_age",
    "current_retirement_savings",
    "monthly_retirement_contribution",
    "employer_match_pct",
    "expected_social_security",
    "desired_retirement_income",
    "home_value",
    "mortgage_balance",
    "mortgage_rate",
    "monthly_rent",
    "risk_tolerance",
    "investment_horizon_years",
    "monthly_savings_target",
    "average_monthly_expenses",
    "emergency_fund_target_months",
    "spending_categories_monthly",
    "debt_profile",
    "portfolio_summary",
    "equity_compensation",
    "notes",
}


async def _get_or_create_memory(
    user_id: uuid.UUID, session: AsyncSession
) -> FinancialMemory:
    """Get the user's financial memory, creating an empty one if it doesn't exist."""
    result = await session.execute(
        select(FinancialMemory).where(FinancialMemory.user_id == user_id)
    )
    memory = result.scalar_one_or_none()

    if memory is None:
        memory = FinancialMemory(user_id=user_id)
        session.add(memory)
        await session.commit()
        await session.refresh(memory)

    return memory


@router.get("", response_model=FinancialMemoryResponse)
async def get_memory(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> FinancialMemoryResponse:
    """Get the user's financial memory (creates empty if not exists)."""
    memory = await _get_or_create_memory(user.id, session)
    return FinancialMemoryResponse.model_validate(memory)


@router.patch("", response_model=FinancialMemoryResponse)
async def update_memory(
    data: FinancialMemoryUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> FinancialMemoryResponse:
    """Partial update of the user's financial memory.

    Logs a MemoryEvent for each changed field.
    """
    memory = await _get_or_create_memory(user.id, session)

    update_dict = data.model_dump(exclude_unset=True)
    source = update_dict.pop("source", MemoryEventSource.user_input)
    source_context = update_dict.pop("source_context", None)

    for field_name, new_value in update_dict.items():
        if field_name not in _MEMORY_FIELDS:
            continue

        old_value = getattr(memory, field_name)

        # Convert enums to their value for comparison
        old_comparable = old_value.value if hasattr(old_value, "value") else old_value
        new_comparable = new_value.value if hasattr(new_value, "value") else new_value

        if old_comparable == new_comparable:
            continue

        setattr(memory, field_name, new_value)

        session.add(
            MemoryEvent(
                user_id=user.id,
                field_name=field_name,
                old_value=str(old_value) if old_value is not None else None,
                new_value=str(new_value) if new_value is not None else None,
                source=source,
                context=source_context,
            )
        )

    await session.commit()
    await session.refresh(memory)
    return FinancialMemoryResponse.model_validate(memory)


@router.get("/events", response_model=list[MemoryEventResponse])
async def list_memory_events(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(50, le=200),
    offset: int = Query(0, ge=0),
) -> list[MemoryEventResponse]:
    """List memory events (paginated, newest first)."""
    result = await session.execute(
        select(MemoryEvent)
        .where(MemoryEvent.user_id == user.id)
        .order_by(MemoryEvent.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    events = result.scalars().all()
    return [MemoryEventResponse.model_validate(e) for e in events]


@router.post("/derive", response_model=FinancialMemoryResponse)
async def derive_memory(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> FinancialMemoryResponse:
    """Derive memory fields from linked account data."""
    memory = await _get_or_create_memory(user.id, session)
    await derive_memory_from_accounts(user.id, memory, session)
    await session.commit()
    await session.refresh(memory)
    return FinancialMemoryResponse.model_validate(memory)


@router.get("/context")
async def get_financial_context(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    format: str = Query("json", pattern="^(json|markdown)$"),
):
    """Get the user's complete financial context.

    ?format=json (default) returns structured JSON.
    ?format=markdown returns LLM-optimized markdown text.
    """
    context = await build_financial_context(user.id, session)

    if format == "markdown":
        md = render_context_as_markdown(context)
        return PlainTextResponse(content=md, media_type="text/markdown")

    return context


@router.delete("")
async def delete_memory(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """Reset the user's financial memory."""
    result = await session.execute(
        select(FinancialMemory).where(FinancialMemory.user_id == user.id)
    )
    memory = result.scalar_one_or_none()

    if memory:
        await session.delete(memory)
        await session.commit()

    return {"status": "deleted"}
