import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.equity_grant import EquityGrant
from app.schemas.equity import (
    EquityGrant as EquityGrantSchema,
)
from app.schemas.equity import (
    EquityGrantCreate,
    EquityGrantUpdate,
    EquityPortfolioSummary,
    EquityProjection,
)
from app.services.equity_valuation import equity_valuation_service

router = APIRouter(prefix="/v1/equity", tags=["Equity"])


@router.get("/portfolio", response_model=EquityPortfolioSummary)
async def get_equity_portfolio(
    user_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Get the user's equity portfolio summary including valuations."""
    result = await session.execute(
        select(EquityGrant).where(EquityGrant.user_id == user_id)
    )
    grants = result.scalars().all()
    return await equity_valuation_service.calculate_portfolio_summary(list(grants))


@router.get("/projections", response_model=list[EquityProjection])
async def get_equity_projections(
    user_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Get monthly equity wealth projections for the next 24 months."""
    result = await session.execute(
        select(EquityGrant).where(EquityGrant.user_id == user_id)
    )
    grants = result.scalars().all()
    return await equity_valuation_service.calculate_portfolio_projections(list(grants))


@router.post("/grants", response_model=EquityGrantSchema)
async def create_equity_grant(
    user_id: uuid.UUID,
    grant_in: EquityGrantCreate,
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Add a new equity grant for the user."""
    # Convert vesting schedule to JSON-compatible format
    vesting_schedule_json = None
    if grant_in.vesting_schedule:
        vesting_schedule_json = [
            {"date": v.date.isoformat(), "quantity": str(v.quantity)}
            for v in grant_in.vesting_schedule
        ]

    grant = EquityGrant(
        user_id=user_id,
        symbol=grant_in.symbol,
        company_name=grant_in.company_name,
        grant_name=grant_in.grant_name,
        grant_type=grant_in.grant_type,
        quantity=grant_in.quantity,
        strike_price=grant_in.strike_price,
        grant_date=grant_in.grant_date,
        valuation_cap=grant_in.valuation_cap,
        discount_rate=grant_in.discount_rate,
        amount_invested=grant_in.amount_invested,
        vesting_schedule=vesting_schedule_json,
        notes=grant_in.notes,
    )
    session.add(grant)
    await session.commit()
    await session.refresh(grant)
    return grant


@router.patch("/grants/{grant_id}", response_model=EquityGrantSchema)
async def update_equity_grant(
    grant_id: uuid.UUID,
    user_id: uuid.UUID,
    grant_in: EquityGrantUpdate,
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Update an existing equity grant."""
    result = await session.execute(
        select(EquityGrant).where(
            EquityGrant.id == grant_id, EquityGrant.user_id == user_id
        )
    )
    grant = result.scalar_one_or_none()
    if not grant:
        raise HTTPException(status_code=404, detail="Equity grant not found")

    update_data = grant_in.model_dump(exclude_unset=True)

    if "vesting_schedule" in update_data and update_data["vesting_schedule"]:
        update_data["vesting_schedule"] = [
            {"date": v.date.isoformat(), "quantity": str(v.quantity)}
            for v in update_data["vesting_schedule"]
        ]

    for field, value in update_data.items():
        setattr(grant, field, value)

    await session.commit()
    await session.refresh(grant)
    return grant


@router.delete("/grants/{grant_id}")
async def delete_equity_grant(
    grant_id: uuid.UUID,
    user_id: uuid.UUID,
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Delete an equity grant."""
    result = await session.execute(
        select(EquityGrant).where(
            EquityGrant.id == grant_id, EquityGrant.user_id == user_id
        )
    )
    grant = result.scalar_one_or_none()
    if not grant:
        raise HTTPException(status_code=404, detail="Equity grant not found")

    await session.delete(grant)
    await session.commit()
    return {"status": "success", "message": "Equity grant deleted"}
