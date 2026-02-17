import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.financial_memory import FinancialMemory


class RunwayService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_runway_metrics(self, user_id: uuid.UUID) -> dict:
        """Calculate personal and entity runway metrics."""
        # 1. Fetch cash accounts
        result = await self._session.execute(
            select(CashAccount).where(CashAccount.user_id == user_id)
        )
        accounts = result.scalars().all()

        personal_cash = sum((a.balance for a in accounts if not a.is_business), Decimal("0.00"))
        business_cash = sum((a.balance for a in accounts if a.is_business), Decimal("0.00"))

        # 2. Fetch memory for average monthly expenses (fallback if transaction data is light)
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()
        personal_burn_target = memory.average_monthly_expenses if memory else None

        # 3. Calculate observed burn from transactions (last 90 days)
        # For simplicity, we'll take the average of monthly debits
        # This is a rough approximation for the MVP
        biz_burn = await self._calculate_observed_burn(user_id, is_business=True)
        pers_burn = await self._calculate_observed_burn(user_id, is_business=False)

        # Fallback to memory for personal if observed is 0
        effective_pers_burn = pers_burn if pers_burn > 0 else (personal_burn_target or Decimal("1.00"))
        effective_biz_burn = biz_burn if biz_burn > 0 else Decimal("1.00")

        return {
            "personal": {
                "liquid_cash": float(personal_cash),
                "monthly_burn": float(effective_pers_burn),
                "runway_months": float(personal_cash / effective_pers_burn) if effective_pers_burn > 0 else 0,
            },
            "entity": {
                "liquid_cash": float(business_cash),
                "monthly_burn": float(effective_biz_burn),
                "runway_months": float(business_cash / effective_biz_burn) if effective_biz_burn > 0 else 0,
            }
        }

    async def _calculate_observed_burn(self, user_id: uuid.UUID, is_business: bool) -> Decimal:
        """Calculate average monthly burn based on debits in the last 90 days."""
        # Join with CashAccount to filter by is_business
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .where(
                CashAccount.user_id == user_id,
                CashAccount.is_business == is_business,
                BankTransaction.amount < 0  # Debits
            )
        )
        transactions = result.scalars().all()
        if not transactions:
            return Decimal("0.00")

        total_burn = sum((abs(tx.amount) for tx in transactions), Decimal("0.00"))
        return total_burn / Decimal("3.0") # Average over 3 months
