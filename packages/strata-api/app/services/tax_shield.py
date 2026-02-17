import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.financial_memory import FinancialMemory


class TaxShieldService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_tax_shield_metrics(self, user_id: uuid.UUID) -> dict:
        """Estimate quarterly tax obligations based on business/1099 income."""
        # 1. Identify business income streams
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .where(
                CashAccount.user_id == user_id,
                CashAccount.is_business == True,
                BankTransaction.amount > 0  # Credits
            )
        )
        biz_credits = result.scalars().all()

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
