import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.connection import Connection
from app.models.portfolio_snapshot import PortfolioSnapshot
from app.services.portfolio_metrics import get_cash_and_debt_totals, get_investment_total, get_physical_asset_total


class AdvisorBriefingService:
    """Generates continuity briefings for what changed since last login."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def generate_briefing(self, user_id: uuid.UUID) -> dict:
        items = []

        # 1. Connection states
        result = await self.session.execute(
            select(Connection).where(Connection.user_id == user_id)
        )
        connections = result.scalars().all()
        for conn in connections:
            if conn.continuity_status and conn.continuity_status != "healthy":
                items.append({
                    "category": "Connection",
                    "message": f"Your data source '{conn.name}' is currently {conn.continuity_status}. Please reconnect to ensure accurate advice.",
                    "impact": "warning"
                })

        # 2. Net worth changes
        current_cash, current_debt = await get_cash_and_debt_totals(self.session, user_id)
        current_inv = await get_investment_total(self.session, user_id)
        current_physical = await get_physical_asset_total(self.session, user_id)

        current_nw = current_cash + current_inv + current_physical - current_debt

        history_result = await self.session.execute(
            select(PortfolioSnapshot)
            .where(PortfolioSnapshot.user_id == user_id)
            .order_by(PortfolioSnapshot.snapshot_date.desc())
            .limit(7)
        )
        history = list(history_result.scalars().all())

        if len(history) >= 2:
            oldest = history[-1]
            diff = float(current_nw) - float(oldest.net_worth)
            if abs(diff) > 100:  # Only report if there's a meaningful change
                direction = "increased" if diff > 0 else "decreased"
                impact = "positive" if diff > 0 else "negative"
                items.append({
                    "category": "Net Worth",
                    "message": f"Your net worth {direction} by ${abs(diff):,.2f} since {oldest.snapshot_date}.",
                    "impact": impact
                })
        else:
            items.append({
                "category": "Welcome",
                "message": f"Welcome back! Your current tracked net worth is ${float(current_nw):,.2f}.",
                "impact": "neutral"
            })

        return {
            "last_login": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
            "items": items
        }
