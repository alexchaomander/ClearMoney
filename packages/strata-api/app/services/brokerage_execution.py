import logging
import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class BrokerageExecutionService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def execute_trade(
        self,
        user_id: uuid.UUID,
        account_id: str,
        symbol: str,
        quantity: Decimal,
        side: str = "buy",
    ) -> dict:
        """Execute a trade order via a brokerage partner.

        Not yet implemented — requires brokerage API integration.
        """
        raise NotImplementedError(
            "Trade execution is not yet available. "
            "Brokerage API integration is under development."
        )

    async def rebalance_portfolio(
        self, user_id: uuid.UUID, account_id: str, target_allocations: dict
    ) -> list[dict]:
        """Trigger a suite of trades to reach target allocation."""
        raise NotImplementedError(
            "Portfolio rebalancing is not yet available."
        )
