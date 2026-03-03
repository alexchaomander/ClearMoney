import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.entity import EntityType
from app.models.financial_memory import FinancialMemory
from app.models.action_intent import ActionIntent, ActionIntentType, ActionIntentStatus
from app.models.decision_trace import DecisionTrace, DecisionTraceType


class TaxShieldService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_tax_shield_metrics(self, user_id: uuid.UUID) -> dict:
        """Estimate quarterly tax obligations based on business/1099 income."""
        # 1. Identify business income streams
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .outerjoin(CashAccount.entity)
            .options(joinedload(BankTransaction.cash_account).joinedload(CashAccount.entity))
            .where(
                CashAccount.user_id == user_id,
                BankTransaction.amount > 0  # Credits
            )
        )
        all_credits = result.scalars().all()
        
        biz_credits = []
        for tx in all_credits:
            acct = tx.cash_account
            is_biz = (acct.entity.entity_type != EntityType.personal) if acct.entity else acct.is_business
            if is_biz:
                biz_credits.append(tx)

        ytd_income = sum((tx.amount for tx in biz_credits), Decimal("0.00"))

        # 2. Get tax preferences from memory
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()

        fed_rate = memory.federal_tax_rate or Decimal("0.24")
        state_rate = memory.state_tax_rate or Decimal("0.07")
        combined_rate = fed_rate + state_rate

        estimated_tax_ytd = ytd_income * combined_rate

        # 3. Simple quarterly breakdown
        quarterly_estimate = estimated_tax_ytd / Decimal("4.0")

        return {
            "ytd_business_income": float(ytd_income),
            "estimated_combined_tax_rate": float(combined_rate),
            "total_tax_liability_ytd": float(estimated_tax_ytd),
            "next_quarterly_payment": float(quarterly_estimate),
            "safe_harbor_met": False, # Placeholder for safe harbor logic
        }

    async def generate_tax_withholding_intent(self, user_id: uuid.UUID) -> ActionIntent | None:
        """Generate an ActionIntent to move estimated tax to a withholding account."""
        metrics = await self.get_tax_shield_metrics(user_id)
        amount = metrics["next_quarterly_payment"]

        if amount <= 0:
            return None

        # 1. Create a Decision Trace for the reasoning
        trace = DecisionTrace(
            user_id=user_id,
            trace_type=DecisionTraceType.rebalance, # We can reuse rebalance or similar
            title="Quarterly Tax Withholding",
            reasoning=f"Based on YTD business income of ${metrics['ytd_business_income']:,.2f} and an estimated combined tax rate of {metrics['estimated_combined_tax_rate']*100:.1f}%, you should set aside ${amount:,.2f} for Q3 estimated taxes.",
            data_snapshot=metrics
        )
        self._session.add(trace)
        await self._session.flush()

        # 2. Create the Action Intent
        intent = ActionIntent(
            user_id=user_id,
            decision_trace_id=trace.id,
            intent_type=ActionIntentType.ACH_TRANSFER,
            title="Fund Tax Withholding Account",
            description=f"Transfer ${amount:,.2f} to your dedicated tax holding account.",
            payload={
                "amount": float(amount),
                "memo": "Estimated Tax Withholding"
            },
            impact_summary={
                "liability_covered": float(amount),
                "safe_harbor_impact": "Will meet Q3 requirement"
            },
            status=ActionIntentStatus.DRAFT
        )
        self._session.add(intent)
        await self._session.commit()
        await self._session.refresh(intent)

        return intent
