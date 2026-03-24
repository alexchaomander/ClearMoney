import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.equity_grant import EquityGrant
from app.models.user import User
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

router = APIRouter(prefix="/equity", tags=["Equity"])


@router.get("/portfolio", response_model=EquityPortfolioSummary)
async def get_equity_portfolio(
    user: Annotated[User, Depends(require_scopes(["portfolio:read"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Get the user's equity portfolio summary including valuations."""
    result = await session.execute(
        select(EquityGrant).where(EquityGrant.user_id == user.id)
    )
    grants = result.scalars().all()
    return await equity_valuation_service.calculate_portfolio_summary(list(grants))


@router.get("/projections", response_model=list[EquityProjection])
async def get_equity_projections(
    user: Annotated[User, Depends(require_scopes(["portfolio:read"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Get monthly equity wealth projections for the next 24 months."""
    result = await session.execute(
        select(EquityGrant).where(EquityGrant.user_id == user.id)
    )
    grants = result.scalars().all()
    return await equity_valuation_service.calculate_portfolio_projections(list(grants))


@router.get("/grants", response_model=list[EquityGrantSchema])
async def list_equity_grants(
    user: Annotated[User, Depends(require_scopes(["portfolio:read"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """List all equity grants for the current user."""
    result = await session.execute(
        select(EquityGrant).where(EquityGrant.user_id == user.id)
    )
    return result.scalars().all()


@router.post("/grants", response_model=EquityGrantSchema)
async def create_equity_grant(
    grant_in: EquityGrantCreate,
    user: Annotated[User, Depends(require_scopes(["portfolio:write"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Create a new equity grant."""
    grant_data = grant_in.model_dump()
    if grant_in.vesting_schedule:
        # Manually serialize the schedule to ensure JSON compatibility for the database column
        grant_data["vesting_schedule"] = [
            event.model_dump(mode="json") for event in grant_in.vesting_schedule
        ]

    grant = EquityGrant(
        **grant_data,
        user_id=user.id,
    )
    session.add(grant)
    await session.commit()
    await session.refresh(grant)
    return grant


@router.patch("/grants/{grant_id}", response_model=EquityGrantSchema)
async def update_equity_grant(
    grant_id: uuid.UUID,
    grant_in: EquityGrantUpdate,
    user: Annotated[User, Depends(require_scopes(["portfolio:write"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Update an existing equity grant."""
    result = await session.execute(
        select(EquityGrant).where(
            EquityGrant.id == grant_id, EquityGrant.user_id == user.id
        )
    )
    grant = result.scalar_one_or_none()
    if not grant:
        raise HTTPException(status_code=404, detail="Equity grant not found")

    update_data = grant_in.model_dump(exclude_unset=True)
    if "vesting_schedule" in update_data and grant_in.vesting_schedule:
        update_data["vesting_schedule"] = [
            event.model_dump(mode="json") for event in grant_in.vesting_schedule
        ]

    for key, value in update_data.items():
        setattr(grant, key, value)

    await session.commit()
    await session.refresh(grant)
    return grant


@router.delete("/grants/{grant_id}")
async def delete_equity_grant(
    grant_id: uuid.UUID,
    user: Annotated[User, Depends(require_scopes(["portfolio:write"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Delete an equity grant."""
    result = await session.execute(
        select(EquityGrant).where(
            EquityGrant.id == grant_id, EquityGrant.user_id == user.id
        )
    )
    grant = result.scalar_one_or_none()
    if not grant:
        raise HTTPException(status_code=404, detail="Equity grant not found")

    await session.delete(grant)
    await session.commit()
    return {"status": "success", "message": "Equity grant deleted"}
