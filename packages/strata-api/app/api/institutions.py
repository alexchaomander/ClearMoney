from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.institution import Institution
from app.schemas.institution import InstitutionResponse

router = APIRouter(prefix="/institutions", tags=["institutions"])


@router.get("", response_model=list[InstitutionResponse])
async def search_institutions(
    q: str | None = Query(None, description="Search query for institution name"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of results"),
    session: AsyncSession = Depends(get_async_session),
) -> list[InstitutionResponse]:
    """Search for supported institutions.

    Returns institutions that can be connected via SnapTrade or other providers.
    """
    query = select(Institution).limit(limit)

    if q:
        # Case-insensitive search on name
        query = query.where(Institution.name.ilike(f"%{q}%"))

    query = query.order_by(Institution.name)

    result = await session.execute(query)
    institutions = result.scalars().all()

    return [InstitutionResponse.model_validate(i) for i in institutions]


@router.get("/popular", response_model=list[InstitutionResponse])
async def get_popular_institutions(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of results"),
    session: AsyncSession = Depends(get_async_session),
) -> list[InstitutionResponse]:
    """Get popular institutions for quick selection.

    Returns a curated list of commonly used brokerages.
    """
    # In a production system, this would be based on actual usage data
    # For now, we just return all institutions ordered by name
    popular_names = [
        "Fidelity",
        "Charles Schwab",
        "Vanguard",
        "TD Ameritrade",
        "E*TRADE",
        "Robinhood",
        "Interactive Brokers",
        "Merrill Edge",
        "Wealthfront",
        "Betterment",
    ]

    # Try to find these institutions, fall back to all if none found
    result = await session.execute(
        select(Institution)
        .where(Institution.name.in_(popular_names))
        .limit(limit)
    )
    institutions = result.scalars().all()

    if not institutions:
        # Fall back to returning any institutions we have
        result = await session.execute(
            select(Institution).order_by(Institution.name).limit(limit)
        )
        institutions = result.scalars().all()

    return [InstitutionResponse.model_validate(i) for i in institutions]
