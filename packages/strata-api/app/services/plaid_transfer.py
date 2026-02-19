import logging
import uuid
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

logger = logging.getLogger(__name__)


class PlaidTransferService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def initiate_transfer(
        self,
        user_id: uuid.UUID,
        from_account_id: str,
        to_account_id: str,
        amount: Decimal,
        description: str = "ClearMoney Transfer",
    ) -> dict:
        """Initiate an ACH transfer between two accounts via Plaid Transfer.

        Not yet implemented — requires Plaid Transfer API integration.
        """
        raise NotImplementedError(
            "ACH transfers are not yet available. "
            "Plaid Transfer integration is under development."
        )

    async def get_transfer_status(self, transfer_id: str) -> str:
        """Fetch the latest status of a Plaid transfer."""
        raise NotImplementedError(
            "Transfer status checks are not yet available."
        )
