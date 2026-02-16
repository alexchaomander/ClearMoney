import logging
import uuid
from datetime import datetime, timezone, timedelta

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification, NotificationType, NotificationSeverity
from app.models.financial_memory import FinancialMemory
from app.services.financial_context import build_financial_context
from app.services.agent_guardrails import evaluate_freshness
from app.services.commingling import ComminglingDetectionEngine
from app.services.tax_shield import TaxShieldService

logger = logging.getLogger(__name__)


class ObservationService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def run_observations(self, user_id: uuid.UUID):
        """Run a suite of automated checks to trigger proactive notifications."""
        context = await build_financial_context(user_id, self._session)
        
        # Load memory
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()
        
        if not memory:
            return

        await self._check_emergency_fund(user_id, context, memory)
        await self._check_data_freshness(user_id, context)
        await self._check_tax_loss_harvesting(user_id, context)
        await self._check_commingling(user_id)
        await self._check_burn_optimization(user_id, context)
        await self._check_tax_payment(user_id)

    async def _check_emergency_fund(self, user_id: uuid.UUID, context: dict, memory: FinancialMemory):
        """Alert if liquid cash is below the user's stated emergency fund target."""
        target_months = memory.emergency_fund_target_months
        monthly_expenses = memory.average_monthly_expenses
        
        if not target_months or not monthly_expenses:
            return

        target_amount = float(target_months) * float(monthly_expenses)
        total_cash = float(context.get("portfolio_metrics", {}).get("total_cash_value", 0))

        if total_cash < target_amount:
            # Check if we already have an unread notification for this
            existing = await self._session.execute(
                select(Notification).where(
                    Notification.user_id == user_id,
                    Notification.type == NotificationType.low_emergency_fund,
                    Notification.is_read == False
                )
            )
            if not existing.scalar_one_or_none():
                notification = Notification(
                    user_id=user_id,
                    type=NotificationType.low_emergency_fund,
                    severity=NotificationSeverity.warning,
                    title="Low Emergency Fund",
                    message=f"Your current cash (${total_cash:,.0f}) is below your {target_months}-month target of ${target_amount:,.0f}.",
                    action_url="/advisor?skill=emergency_fund",
                    metadata_json={
                        "current_cash": total_cash,
                        "target_amount": target_amount,
                        "target_months": target_months
                    }
                )
                self._session.add(notification)
                await self._session.commit()

    async def _check_data_freshness(self, user_id: uuid.UUID, context: dict):
        """Alert if data sync is stale."""
        freshness = evaluate_freshness(context)
        
        if not freshness["is_fresh"] and freshness["age_hours"] > 72:
            # Alert for stale data
            existing = await self._session.execute(
                select(Notification).where(
                    Notification.user_id == user_id,
                    Notification.type == NotificationType.data_stale,
                    Notification.is_read == False
                )
            )
            if not existing.scalar_one_or_none():
                notification = Notification(
                    user_id=user_id,
                    type=NotificationType.data_stale,
                    severity=NotificationSeverity.info,
                    title="Data Stale",
                    message=f"Your financial data hasn't been synced in {int(freshness['age_hours'])} hours. Some recommendations may be outdated.",
                    action_url="/settings",
                    metadata_json={
                        "age_hours": freshness["age_hours"],
                        "last_sync": freshness["last_sync"]
                    }
                )
                self._session.add(notification)
                await self._session.commit()

    async def _check_tax_loss_harvesting(self, user_id: uuid.UUID, context: dict):
        """Placeholder for tax-loss harvesting opportunity detection."""
        # In a real implementation, we would scan holdings for unrealized losses
        # against a configurable threshold (e.g., > $500 or > 5%).
        pass

    async def _check_commingling(self, user_id: uuid.UUID):
        """Scan for commingled transactions and alert if high risk detected."""
        engine = ComminglingDetectionEngine(self._session)
        await engine.scan_and_flag(user_id)
        report = await engine.get_vulnerability_report(user_id)
        
        if report["status"] == "critical" or (report["commingled_count"] > 5):
            # Check for unread notification
            existing = await self._session.execute(
                select(Notification).where(
                    Notification.user_id == user_id,
                    Notification.type == NotificationType.policy_breach,
                    Notification.is_read == False
                )
            )
            if not existing.scalar_one_or_none():
                notification = Notification(
                    user_id=user_id,
                    type=NotificationType.policy_breach,
                    severity=NotificationSeverity.critical,
                    title="Corporate Veil Vulnerability",
                    message=f"Detected {report['commingled_count']} commingled transactions totalling ${report['commingled_amount']:,.2f}. This weakens your corporate veil.",
                    action_url="/dashboard/founder-operating-room",
                    metadata_json=report
                )
                self._session.add(notification)
                await self._session.commit()

    async def _check_burn_optimization(self, user_id: uuid.UUID, context: dict):
        """Placeholder for burn optimization (e.g., duplicate SaaS detection)."""
        pass

    async def _check_tax_payment(self, user_id: uuid.UUID):
        """Alert if quarterly tax payment is recommended."""
        service = TaxShieldService(self._session)
        metrics = await service.get_tax_shield_metrics(user_id)
        
        if metrics["next_quarterly_payment"] > 1000 and not metrics["safe_harbor_met"]:
             # Check for unread notification
            existing = await self._session.execute(
                select(Notification).where(
                    Notification.user_id == user_id,
                    Notification.type == NotificationType.tax_loss_harvesting, # Reusing for tax-related for now
                    Notification.is_read == False
                )
            )
            if not existing.scalar_one_or_none():
                notification = Notification(
                    user_id=user_id,
                    type=NotificationType.tax_loss_harvesting,
                    severity=NotificationSeverity.info,
                    title="Estimated Tax Action",
                    message=f"Based on YTD biz income, we recommend an estimated tax payment of ${metrics['next_quarterly_payment']:,.2f}.",
                    action_url="/advisor?skill=tax_optimization",
                    metadata_json=metrics
                )
                self._session.add(notification)
                await self._session.commit()
