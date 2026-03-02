import logging
from datetime import date
from decimal import Decimal

from app.models.equity_grant import EquityGrant, EquityGrantType
from app.schemas.equity import EquityPortfolioSummary, EquityValuation
from app.services.providers.stock_price import stock_price_service

logger = logging.getLogger(__name__)


class EquityValuationService:
    """Service to calculate valuations for equity grants."""

    async def calculate_grant_valuation(self, grant: EquityGrant) -> EquityValuation:
        """Calculate the current valuation of a single grant."""
        current_price = await stock_price_service.get_price(grant.symbol)

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
            symbol=grant.symbol,
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


# Global instance
equity_valuation_service = EquityValuationService()
