import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.services.portfolio import PortfolioService
from app.services.runway import RunwayService

class PortfolioAnalysisService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_portfolio_analysis(self, user_id: uuid.UUID) -> dict[str, Any]:
        """
        Calculates Cash Drag, Tax Drag, and Concentration Risk.
        Returns a dict conforming to PortfolioAnalysisMetrics schema.
        """
        portfolio_service = PortfolioService(self.session, user_id)
        total_cash_decimal, _ = await portfolio_service.get_cash_and_debt_totals()
        total_investment_decimal = await portfolio_service.get_investment_total()
        
        total_cash = float(total_cash_decimal)
        total_investment = float(total_investment_decimal)
        total_portfolio = total_cash + total_investment

        # 1. Cash Drag: Identify if cash exceeds 2 months of burn
        runway_service = RunwayService(self.session)
        runway_metrics = await runway_service.get_runway_metrics(user_id)
        monthly_burn = runway_metrics["personal"]["monthly_burn"]
        
        target_cash = monthly_burn * 2
        excess_cash = max(0.0, total_cash - target_cash)
        current_cash_yield = 0.01  # Assuming 1% default
        target_cash_yield = 0.045  # Assuming 4.5% HYSA availability
        missed_annual_yield = excess_cash * (target_cash_yield - current_cash_yield)
        
        cash_drag = {
            "excess_cash": excess_cash,
            "current_cash_yield": current_cash_yield,
            "target_cash_yield": target_cash_yield,
            "missed_annual_yield": missed_annual_yield,
            "is_warning": excess_cash > 5000 and missed_annual_yield > 100
        }

        # 2. Concentration Risk
        investment_result = await self.session.execute(
            select(InvestmentAccount)
            .options(
                selectinload(InvestmentAccount.holdings).selectinload(Holding.security)
            )
            .where(InvestmentAccount.user_id == user_id)
        )
        investment_accounts = investment_result.scalars().all()

        holdings_map: dict[str, dict] = {}
        for account in investment_accounts:
            for holding in account.holdings:
                ticker = holding.security.ticker
                key = ticker or holding.security.name
                val = float(holding.market_value or 0)
                if key not in holdings_map:
                    holdings_map[key] = {
                        "holding_name": holding.security.name,
                        "ticker": ticker,
                        "value": 0.0
                    }
                holdings_map[key]["value"] += val

        concentration_risks = []
        if total_portfolio > 0:
            for h in holdings_map.values():
                pct = (h["value"] / total_portfolio) * 100
                if pct >= 20.0:  # 20% concentration threshold
                    concentration_risks.append({
                        "holding_name": h["holding_name"],
                        "ticker": h["ticker"],
                        "percentage_of_portfolio": pct,
                        "value": h["value"],
                        "is_warning": True
                    })
        
        # Sort concentration by highest percentage
        concentration_risks.sort(key=lambda x: x["percentage_of_portfolio"], reverse=True)

        # 3. Tax Drag: Calculate ratio of high-yield fixed income in taxable
        # Simplification for MVP: Just map taxable vs tax-advantaged fixed income
        taxable_fixed_income = 0.0
        tax_advantaged_fixed_income = 0.0

        for account in investment_accounts:
            for holding in account.holdings:
                # We assume bond/fixed income have a higher absolute yield subject to ordinary income tax
                if holding.security.security_type.value in ("bond", "fixed_income", "mutual_fund"):
                    val = float(holding.market_value or 0)
                    if account.is_tax_advantaged:
                        tax_advantaged_fixed_income += val
                    else:
                        taxable_fixed_income += val

        tax_drag_value = taxable_fixed_income * 0.04 * 0.35  # Assuming average 4% yield, 35% tax rate
        
        tax_drag = {
            "taxable_yield_value": taxable_fixed_income,
            "tax_advantaged_yield_value": tax_advantaged_fixed_income,
            "estimated_tax_drag_value": tax_drag_value,
            "is_warning": tax_drag_value > 500
        }

        return {
            "concentration_risks": concentration_risks,
            "cash_drag": cash_drag,
            "tax_drag": tax_drag
        }
