import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
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
