import uuid
from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.financial_memory import FinancialMemory


class SavingsService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_savings_metrics(self, user_id: uuid.UUID) -> dict:
        """Calculate savings metrics based on true organic inflow vs outflow."""
        cutoff = date.today() - timedelta(days=90)
        
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .where(
                CashAccount.user_id == user_id,
                BankTransaction.transaction_date >= cutoff,
            )
        )
        txs = result.scalars().all()

        income = sum(
            (
                tx.amount
                for tx in txs
                if tx.amount > 0 and tx.primary_category != "TRANSFER_IN"
            ),
            Decimal("0.00"),
        )
        burn = sum(
            (
                abs(tx.amount)
                for tx in txs
                if tx.amount < 0
                and tx.primary_category not in ("TRANSFER_OUT", "LOAN_PAYMENTS")
            ),
            Decimal("0.00"),
        )

        if income > 0:
            savings_rate = (income - burn) / income
        else:
            savings_rate = Decimal("0.00")

        # Get FinancialMemory for target liquidity
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()
        target = memory.emergency_fund_target_months if memory and memory.emergency_fund_target_months else 6

        return {
            "monthly_income": float(income / Decimal("3")),
            "monthly_burn": float(burn / Decimal("3")),
            "monthly_savings": float((income - burn) / Decimal("3")),
            "savings_rate_90d": float(savings_rate),
            "liquidity_months_target": target,
        }
