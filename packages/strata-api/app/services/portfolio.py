import uuid
from collections import defaultdict
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.models.equity_grant import EquityGrant
from app.services.equity_valuation import equity_valuation_service
from app.services.portfolio_metrics import (
    get_cash_and_debt_totals,
    get_physical_asset_total,
    get_investment_total,
)

class PortfolioService:
    """Service for calculating portfolio-wide metrics and totals."""
    
    def __init__(self, session: AsyncSession, user_id: uuid.UUID):
        self.session = session
        self.user_id = user_id

    async def get_cash_and_debt_totals(self) -> tuple[Decimal, Decimal]:
        """Return (total_cash, total_debt) for the user."""
        return await get_cash_and_debt_totals(self.session, self.user_id)

    async def get_physical_asset_total(self) -> Decimal:
        """Return total market value of all physical assets."""
        return await get_physical_asset_total(self.session, self.user_id)

    async def get_investment_total(self) -> Decimal:
        """Return total market value of all investment accounts."""
        return await get_investment_total(self.session, self.user_id)

    async def get_portfolio_summary_data(self) -> dict:
        """
        Calculate the complex summary data for the portfolio.
        Moves business logic out of the API layer.
        """
        total_cash, total_debt = await self.get_cash_and_debt_totals()
        
        # Get equity grants and calculate valuation
        equity_result = await self.session.execute(
            select(EquityGrant).where(EquityGrant.user_id == self.user_id)
        )
        equity_grants = equity_result.scalars().all()
        equity_summary = await equity_valuation_service.calculate_portfolio_summary(
            list(equity_grants)
        )
        total_equity_vested = equity_summary.total_vested_value
        total_equity_unvested = equity_summary.total_unvested_value

        # Get investment accounts with holdings
        investment_result = await self.session.execute(
            select(InvestmentAccount)
            .options(
                selectinload(InvestmentAccount.holdings).selectinload(Holding.security)
            )
            .where(InvestmentAccount.user_id == self.user_id)
        )
        investment_accounts = investment_result.scalars().all()

        total_investment = Decimal("0.00")
        tax_advantaged_value = Decimal("0.00")
        taxable_value = Decimal("0.00")
        allocation_by_asset_type: dict[str, Decimal] = defaultdict(Decimal)
        allocation_by_account_type: dict[str, Decimal] = defaultdict(Decimal)
        all_holdings: list[dict] = []

        for account in investment_accounts:
            account_value = account.balance
            total_investment += account_value
            if account.is_tax_advantaged:
                tax_advantaged_value += account_value
            else:
                taxable_value += account_value

            allocation_by_account_type[account.account_type.value] += account_value

            for holding in account.holdings:
                market_value = holding.market_value or Decimal("0.00")
                security_type = holding.security.security_type.value
                allocation_by_asset_type[security_type] += market_value

                all_holdings.append({
                    "ticker": holding.security.ticker,
                    "name": holding.security.name,
                    "security_type": security_type,
                    "quantity": holding.quantity,
                    "market_value": market_value,
                    "cost_basis": holding.cost_basis,
                    "account_name": account.name,
                })

        total_physical = await self.get_physical_asset_total()
        net_worth = (
            total_cash
            + total_investment
            + total_equity_vested
            + total_physical
            - total_debt
        )

        total_assets = total_cash + total_investment + total_equity_vested + total_physical
        asset_type_allocations = []
        account_type_allocations = []

        if total_assets > 0:
            allocation_by_asset_type["cash"] += total_cash
            allocation_by_asset_type["equity"] += total_equity_vested
            if total_physical > 0:
                allocation_by_asset_type["physical_assets"] += total_physical

            asset_type_allocations = [
                {
                    "category": category,
                    "value": value,
                    "percentage": (value / total_assets * Decimal("100")).quantize(Decimal("0.01")),
                }
                for category, value in sorted(allocation_by_asset_type.items(), key=lambda x: x[1], reverse=True)
                if value > 0
            ]

            account_type_allocations = [
                {
                    "category": category,
                    "value": value,
                    "percentage": (value / total_investment * Decimal("100")).quantize(Decimal("0.01"))
                    if total_investment > 0 else Decimal("0.00"),
                }
                for category, value in sorted(allocation_by_account_type.items(), key=lambda x: x[1], reverse=True)
                if value > 0
            ]

        top_holdings = sorted(all_holdings, key=lambda x: x["market_value"], reverse=True)[:10]

        concentration_alerts = []
        concentration_threshold = Decimal("10.0")
        if total_assets > 0:
            for holding in all_holdings:
                percentage = (holding["market_value"] / total_assets * Decimal("100")).quantize(Decimal("0.01"))
                if percentage >= concentration_threshold:
                    display_pct = percentage.quantize(Decimal("0.1"))
                    concentration_alerts.append({
                        "ticker": holding["ticker"],
                        "name": holding["name"],
                        "percentage": percentage,
                        "message": f"{holding['ticker'] or holding['name']} represents {display_pct}% of your portfolio",
                    })

        return {
            "total_investment_value": total_investment,
            "total_cash_value": total_cash,
            "total_debt_value": total_debt,
            "total_physical_asset_value": total_physical,
            "total_equity_vested_value": total_equity_vested,
            "total_equity_unvested_value": total_equity_unvested,
            "net_worth": net_worth,
            "tax_advantaged_value": tax_advantaged_value,
            "taxable_value": taxable_value,
            "allocation_by_asset_type": asset_type_allocations,
            "allocation_by_account_type": account_type_allocations,
            "top_holdings": top_holdings,
            "concentration_alerts": concentration_alerts,
        }
