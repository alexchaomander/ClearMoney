import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.entity import EntityType
from app.models.financial_memory import FinancialMemory


class RunwayService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_runway_metrics(self, user_id: uuid.UUID) -> dict:
        """Calculate personal and entity runway metrics."""
        # 1. Fetch cash accounts with their associated entity
        result = await self._session.execute(
            select(CashAccount)
            .options(joinedload(CashAccount.entity))
            .where(CashAccount.user_id == user_id)
        )
        accounts = result.scalars().all()

        def is_business_account(a: CashAccount) -> bool:
            if a.entity:
                return a.entity.entity_type != EntityType.personal
            return a.is_business

        personal_cash = sum((a.balance for a in accounts if not is_business_account(a)), Decimal("0.00"))
        business_cash = sum((a.balance for a in accounts if is_business_account(a)), Decimal("0.00"))

        # 2. Fetch memory for average monthly expenses (fallback if transaction data is light)
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()
        personal_burn_target = memory.average_monthly_expenses if memory else None

        # 3. Calculate observed burn from transactions (last 90 days)
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
        # We handle entity vs is_business gracefully here:
        # If an account has an entity, we check the entity_type.
        # If not, we fall back to the old is_business flag.
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .outerjoin(CashAccount.entity)
            .options(joinedload(BankTransaction.cash_account).joinedload(CashAccount.entity))
            .where(
                CashAccount.user_id == user_id,
                BankTransaction.amount < 0  # Debits
            )
        )
        transactions = result.scalars().all()
        
        # Filter transactions in Python to handle the complex OR logic easily
        filtered_txs = []
        for tx in transactions:
            acct = tx.cash_account
            acct_is_biz = (acct.entity.entity_type != EntityType.personal) if acct.entity else acct.is_business
            if acct_is_biz == is_business:
                filtered_txs.append(tx)

        if not filtered_txs:
            return Decimal("0.00")

        total_burn = sum((abs(tx.amount) for tx in filtered_txs), Decimal("0.00"))
        return total_burn / Decimal("3.0") # Average over 3 months
