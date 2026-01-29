from collections import defaultdict
from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.cash_account import CashAccount
from app.models.debt_account import DebtAccount
from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount, InvestmentAccountType
from app.models.security import Security
from app.models.user import User
from app.schemas.holding import HoldingWithSecurityResponse
from app.schemas.portfolio import (
    AssetAllocation,
    ConcentrationAlert,
    PortfolioSummary,
    TopHolding,
)
from app.schemas.security import SecurityResponse

router = APIRouter(prefix="/portfolio", tags=["portfolio"])

# Concentration threshold for alerts (percentage)
CONCENTRATION_THRESHOLD = Decimal("10.0")


@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> PortfolioSummary:
    """Get a summary of the user's entire portfolio.

    Includes net worth calculation, asset allocation, and concentration alerts.
    """
    # Get cash accounts
    cash_result = await session.execute(
        select(CashAccount).where(CashAccount.user_id == user.id)
    )
    cash_accounts = cash_result.scalars().all()
    total_cash = sum(a.balance for a in cash_accounts)

    # Get debt accounts
    debt_result = await session.execute(
        select(DebtAccount).where(DebtAccount.user_id == user.id)
    )
    debt_accounts = debt_result.scalars().all()
    total_debt = sum(a.balance for a in debt_accounts)

    # Get investment accounts with holdings
    investment_result = await session.execute(
        select(InvestmentAccount)
        .options(
            selectinload(InvestmentAccount.holdings).selectinload(Holding.security)
        )
        .where(InvestmentAccount.user_id == user.id)
    )
    investment_accounts = investment_result.scalars().all()

    # Calculate investment totals
    total_investment = Decimal("0.00")
    tax_advantaged_value = Decimal("0.00")
    taxable_value = Decimal("0.00")

    # Track allocations
    allocation_by_asset_type: dict[str, Decimal] = defaultdict(Decimal)
    allocation_by_account_type: dict[str, Decimal] = defaultdict(Decimal)

    # Track holdings for top holdings and concentration
    all_holdings: list[TopHolding] = []

    for account in investment_accounts:
        account_value = account.balance
        total_investment += account_value

        if account.is_tax_advantaged:
            tax_advantaged_value += account_value
        else:
            taxable_value += account_value

        # Track by account type
        allocation_by_account_type[account.account_type.value] += account_value

        # Process holdings
        for holding in account.holdings:
            market_value = holding.market_value or Decimal("0.00")

            # Track by security type
            security_type = holding.security.security_type.value
            allocation_by_asset_type[security_type] += market_value

            all_holdings.append(TopHolding(
                ticker=holding.security.ticker,
                name=holding.security.name,
                security_type=security_type,
                quantity=holding.quantity,
                market_value=market_value,
                cost_basis=holding.cost_basis,
                account_name=account.name,
            ))

    # Calculate net worth
    net_worth = total_cash + total_investment - total_debt

    # Calculate allocation percentages
    total_assets = total_cash + total_investment
    if total_assets > 0:
        # Add cash to asset allocation
        allocation_by_asset_type["cash"] += total_cash

        asset_type_allocations = [
            AssetAllocation(
                category=category,
                value=value,
                percentage=(value / total_assets * Decimal("100")).quantize(Decimal("0.01")),
            )
            for category, value in sorted(
                allocation_by_asset_type.items(),
                key=lambda x: x[1],
                reverse=True,
            )
            if value > 0
        ]

        account_type_allocations = [
            AssetAllocation(
                category=category,
                value=value,
                percentage=(value / total_investment * Decimal("100")).quantize(Decimal("0.01"))
                if total_investment > 0
                else Decimal("0.00"),
            )
            for category, value in sorted(
                allocation_by_account_type.items(),
                key=lambda x: x[1],
                reverse=True,
            )
            if value > 0
        ]
    else:
        asset_type_allocations = []
        account_type_allocations = []

    # Get top holdings by market value
    top_holdings = sorted(
        all_holdings,
        key=lambda x: x.market_value,
        reverse=True,
    )[:10]

    # Calculate concentration alerts
    concentration_alerts: list[ConcentrationAlert] = []
    if total_assets > 0:
        for holding in all_holdings:
            percentage = (holding.market_value / total_assets * Decimal("100")).quantize(Decimal("0.01"))
            if percentage >= CONCENTRATION_THRESHOLD:
                display_pct = percentage.quantize(Decimal("0.1"))
                concentration_alerts.append(ConcentrationAlert(
                    ticker=holding.ticker,
                    name=holding.name,
                    percentage=percentage,
                    message=f"{holding.ticker or holding.name} represents {display_pct}% of your portfolio",
                ))

    return PortfolioSummary(
        total_investment_value=total_investment,
        total_cash_value=total_cash,
        total_debt_value=total_debt,
        net_worth=net_worth,
        tax_advantaged_value=tax_advantaged_value,
        taxable_value=taxable_value,
        allocation_by_asset_type=asset_type_allocations,
        allocation_by_account_type=account_type_allocations,
        top_holdings=top_holdings,
        concentration_alerts=concentration_alerts,
    )


@router.get("/holdings", response_model=list[dict])
async def get_all_holdings(
    user: User = Depends(get_current_user),
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
            all_holdings.append({
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
                "cost_basis": float(holding.cost_basis) if holding.cost_basis else None,
                "market_value": float(holding.market_value) if holding.market_value else None,
                "as_of": holding.as_of.isoformat() if holding.as_of else None,
            })

    return sorted(
        all_holdings,
        key=lambda x: x["market_value"] or 0,
        reverse=True,
    )
