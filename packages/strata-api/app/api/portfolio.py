from collections import defaultdict
from datetime import date, timedelta
from decimal import Decimal
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.models.portfolio_snapshot import PortfolioSnapshot
from app.models.user import User
from app.schemas.portfolio import (
    ConcentrationAlert,
    DebtMetrics,
    PortfolioAnalysisMetrics,
    PortfolioHistoryPoint,
    PortfolioSummary,
    RunwayMetrics,
    SavingsMetrics,
    TaxShieldMetrics,
)
from app.services.commingling import ComminglingDetectionEngine
from app.services.debt import DebtPrioritizationService
from app.models.equity_grant import EquityGrant
from app.services.equity_valuation import equity_valuation_service
from app.services.portfolio import PortfolioService
from app.services.portfolio_analysis import PortfolioAnalysisService
from app.services.runway import RunwayService
from app.services.savings import SavingsService
from app.services.tax_shield import TaxShieldService

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

# Concentration threshold for alerts (percentage)
CONCENTRATION_THRESHOLD = Decimal("10.0")


@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> PortfolioSummary:
    """Get a summary of the user's entire portfolio.

    Includes net worth calculation, asset allocation, and concentration alerts.
    """
    portfolio_service = PortfolioService(session, user.id)
    summary_data = await portfolio_service.get_portfolio_summary_data()

    return PortfolioSummary(**summary_data)


@router.get("/holdings", response_model=list[dict])
async def get_all_holdings(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[dict]:
    """Get all holdings across all investment accounts.

    Returns a flat list of all holdings with account and security details.
    """
    result = await session.execute(
        select(InvestmentAccount)
        .options(
            selectinload(InvestmentAccount.holdings).selectinload(Holding.security)
        )
        .where(InvestmentAccount.user_id == user.id)
    )
    accounts = result.scalars().all()

    all_holdings = []
    for account in accounts:
        for holding in account.holdings:
            all_holdings.append(
                {
                    "id": str(holding.id),
                    "account_id": str(account.id),
                    "account_name": account.name,
                    "account_type": account.account_type.value,
                    "is_tax_advantaged": account.is_tax_advantaged,
                    "security": {
                        "id": str(holding.security.id),
                        "ticker": holding.security.ticker,
                        "name": holding.security.name,
                        "security_type": holding.security.security_type.value,
                        "close_price": float(holding.security.close_price)
                        if holding.security.close_price
                        else None,
                    },
                    "quantity": float(holding.quantity),
                    "cost_basis": float(holding.cost_basis)
                    if holding.cost_basis
                    else None,
                    "market_value": float(holding.market_value)
                    if holding.market_value
                    else None,
                    "as_of": holding.as_of.isoformat() if holding.as_of else None,
                }
            )

    return sorted(
        all_holdings,
        key=lambda x: x["market_value"] or 0,
        reverse=True,
    )


@router.get("/history", response_model=list[PortfolioHistoryPoint])
async def get_portfolio_history(
    range: Literal["30d", "90d", "1y", "all"] = Query("1y"),
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[PortfolioHistoryPoint]:
    """Get portfolio value history.

    Returns daily snapshot points for the requested range, falling back
    to a single current value if no snapshots exist yet.
    """
    today = date.today()
    if range == "30d":
        start_date = today - timedelta(days=30)
    elif range == "90d":
        start_date = today - timedelta(days=90)
    elif range == "1y":
        start_date = today - timedelta(days=365)
    else:
        start_date = None

    query = (
        select(PortfolioSnapshot)
        .where(PortfolioSnapshot.user_id == user.id)
        .order_by(PortfolioSnapshot.snapshot_date.asc())
    )
    if start_date:
        query = query.where(PortfolioSnapshot.snapshot_date >= start_date)

    result = await session.execute(query)
    snapshots = result.scalars().all()

    if not snapshots:
        portfolio_service = PortfolioService(session, user.id)
        total_cash, total_debt = await portfolio_service.get_cash_and_debt_totals()
        total_investment = await portfolio_service.get_investment_total()
        current_value = total_cash + total_investment - total_debt

        return [
            PortfolioHistoryPoint(
                date=today.isoformat(),
                value=current_value,
            )
        ]

    return [
        PortfolioHistoryPoint(
            date=snapshot.snapshot_date.isoformat(),
            value=snapshot.net_worth,
        )
        for snapshot in snapshots
    ]


@router.get("/vulnerability-report")
async def get_vulnerability_report(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """Get the commingling vulnerability report for the Founder Operating Room."""
    engine = ComminglingDetectionEngine(session)
    return await engine.get_vulnerability_report(user.id)


@router.get("/runway", response_model=RunwayMetrics)
async def get_runway_metrics(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> RunwayMetrics:
    """Get personal and entity runway calculations."""
    service = RunwayService(session)
    data = await service.get_runway_metrics(user.id)
    return RunwayMetrics(**data)

@router.get("/debt", response_model=DebtMetrics)
async def get_debt_metrics(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> DebtMetrics:
    """Get debt prioritization strategy using the Avalanche method."""
    service = DebtPrioritizationService(session)
    data = await service.get_debt_metrics(user.id)
    return DebtMetrics(**data)

@router.get("/savings", response_model=SavingsMetrics)
async def get_savings_metrics(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> SavingsMetrics:
    """Get deterministic savings rate metrics based on transactions."""
    service = SavingsService(session)
    data = await service.get_savings_metrics(user.id)
    return SavingsMetrics(**data)


@router.get("/tax-shield", response_model=TaxShieldMetrics)
async def get_tax_shield_metrics(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> TaxShieldMetrics:
    """Get tax shield metrics for founders."""
    service = TaxShieldService(session)
    data = await service.get_tax_shield_metrics(user.id)
    return TaxShieldMetrics(**data)

@router.get("/analysis", response_model=PortfolioAnalysisMetrics)
async def get_portfolio_analysis(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> PortfolioAnalysisMetrics:
    """Get deterministic portfolio concentration, tax drag, and cash drag analysis."""
    service = PortfolioAnalysisService(session)
    data = await service.get_portfolio_analysis(user.id)
    return PortfolioAnalysisMetrics(**data)
