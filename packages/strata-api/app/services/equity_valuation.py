import asyncio
import logging
from datetime import date
from decimal import Decimal

from dateutil.relativedelta import relativedelta

from app.models.equity_grant import EquityGrant, EquityGrantType
from app.schemas.equity import EquityPortfolioSummary, EquityProjection, EquityValuation
from app.services.providers.stock_price import stock_price_service

logger = logging.getLogger(__name__)


class EquityValuationService:
    """Service to calculate valuations for equity grants."""

    async def calculate_grant_valuation(self, grant: EquityGrant) -> EquityValuation:
        """Calculate the current valuation of a single grant."""
        # For SAFEs and Convertible notes, use amount invested as a baseline value if symbol is empty
        # Real valuation for SAFEs can be complex (based on next round), but amount_invested is a safe floor.
        if grant.grant_type in {EquityGrantType.safe, EquityGrantType.convertible_note}:
            current_price = Decimal("1.00") # Dummy price
            total_val = grant.amount_invested or Decimal("0.00")
            return EquityValuation(
                symbol=grant.symbol or grant.company_name or "Private",
                current_price=current_price,
                vested_quantity=total_val,
                unvested_quantity=Decimal("0.00"),
                vested_value=total_val,
                unvested_value=Decimal("0.00"),
                total_value=total_val,
                next_vest_date=None,
                next_vest_quantity=None,
            )

        # For founder stock, or regular RSUs/Options
        current_price = Decimal("0.00")
        if grant.symbol:
            current_price = await stock_price_service.get_price(grant.symbol)
        elif grant.strike_price and grant.grant_type == EquityGrantType.founder_stock:
            # Founder stock without symbol might use strike_price as the current 409a estimate
            current_price = grant.strike_price

        today = date.today()
        vested_quantity = Decimal("0.00")
        unvested_quantity = Decimal("0.00")
        next_vest_date = None
        next_vest_quantity = None

        if grant.vesting_schedule:
            for event in grant.vesting_schedule:
                # Assuming the event is already a dict or Pydantic model
                event_date = event.get("date")
                if isinstance(event_date, str):
                    event_date = date.fromisoformat(event_date)

                event_qty = Decimal(str(event.get("quantity", "0")))

                if event_date <= today:
                    vested_quantity += event_qty
                else:
                    unvested_quantity += event_qty
                    if next_vest_date is None or event_date < next_vest_date:
                        next_vest_date = event_date
                        next_vest_quantity = event_qty
        else:
            # If no schedule, assume fully unvested for now (safety fallback)
            # Except for founder stock which is often fully vested or vests over time, we assume fully vested if no schedule
            if grant.grant_type == EquityGrantType.founder_stock:
                vested_quantity = grant.quantity
            else:
                unvested_quantity = grant.quantity

        vested_value = vested_quantity * current_price
        unvested_value = unvested_quantity * current_price

        # Handle options (only count "in the money" value)
        if grant.grant_type in {EquityGrantType.iso, EquityGrantType.nso}:
            strike = grant.strike_price or Decimal("0")
            intrinsic_value_per_share = max(Decimal("0.00"), current_price - strike)
            vested_value = vested_quantity * intrinsic_value_per_share
            unvested_value = unvested_quantity * intrinsic_value_per_share

        return EquityValuation(
            symbol=grant.symbol or grant.company_name or "Private",
            current_price=current_price,
            vested_quantity=vested_quantity,
            unvested_quantity=unvested_quantity,
            vested_value=vested_value,
            unvested_value=unvested_value,
            total_value=vested_value + unvested_value,
            next_vest_date=next_vest_date,
            next_vest_quantity=next_vest_quantity,
        )

    async def calculate_portfolio_summary(
        self, grants: list[EquityGrant]
    ) -> EquityPortfolioSummary:
        """Calculate a summary of all equity grants for a user."""
        valuations = []
        for grant in grants:
            val = await self.calculate_grant_valuation(grant)
            valuations.append(val)

        total_vested = sum(v.vested_value for v in valuations)
        total_unvested = sum(v.unvested_value for v in valuations)

        return EquityPortfolioSummary(
            total_vested_value=total_vested,
            total_unvested_value=total_unvested,
            total_value=total_vested + total_unvested,
            grant_valuations=valuations
        )

    async def calculate_portfolio_projections(
        self, grants: list[EquityGrant]
    ) -> list[EquityProjection]:
        """Calculate monthly wealth projection from equity for the next 24 months."""
        today = date.today()

        # Get current prices for all symbols involved concurrently
        symbols = list(set(g.symbol for g in grants))
        price_tasks = [stock_price_service.get_price(s) for s in symbols]
        price_results = await asyncio.gather(*price_tasks)
        prices = dict(zip(symbols, price_results))

        # Pre-calculate intrinsic value per share and total potential value once
        total_potential_value = Decimal("0.00")
        grant_data = []
        for grant in grants:
            current_price = prices.get(grant.symbol, Decimal("0.00"))

            # Calculate intrinsic value per share
            value_per_share = current_price
            if grant.grant_type in {EquityGrantType.iso, EquityGrantType.nso}:
                strike = grant.strike_price or Decimal("0")
                value_per_share = max(Decimal("0.00"), current_price - strike)

            total_potential_value += grant.quantity * value_per_share
            grant_data.append({
                "grant": grant,
                "value_per_share": value_per_share
            })

        projections = []
        for i in range(25):  # Next 24 months + current month
            target_date = today + relativedelta(months=i)
            liquid_value = Decimal("0.00")

            for item in grant_data:
                grant = item["grant"]
                value_per_share = item["value_per_share"]
                vested_qty = Decimal("0.00")

                if grant.vesting_schedule:
                    for event in grant.vesting_schedule:
                        event_date = event.get("date")
                        if isinstance(event_date, str):
                            event_date = date.fromisoformat(event_date)

                        if event_date <= target_date:
                            vested_qty += Decimal(str(event.get("quantity", "0")))

                liquid_value += vested_qty * value_per_share

            projections.append(EquityProjection(
                date=target_date,
                total_value=total_potential_value,
                liquid_value=liquid_value
            ))

        return projections


# Global instance
equity_valuation_service = EquityValuationService()
