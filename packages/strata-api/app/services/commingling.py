import uuid
from decimal import Decimal
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.debt_account import DebtAccount

# Categories that are highly likely to be personal when on a business account
PERSONAL_SPEND_CATEGORIES = {
    "FOOD_AND_DRINK",
    "ENTERTAINMENT",
    "PERSONAL_CARE",
    "GIFTS_AND_DONATIONS",
    "LOAN_PAYMENTS",  # Personal loan payments on biz account
}

# Categories that are highly likely to be business when on a personal account
BUSINESS_SPEND_CATEGORIES = {
    "GENERAL_SERVICES",  # e.g., SaaS, Legal
    "MARKETING",
    "OFFICE_SUPPLIES",
}


class ComminglingDetectionEngine:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def scan_and_flag(self, user_id: uuid.UUID):
        """Scan all transactions for commingling risk and set the is_commingled flag."""
        # 1. Identify business and personal accounts
        cash_accounts = await self._session.execute(
            select(CashAccount).where(CashAccount.user_id == user_id)
        )
        debt_accounts = await self._session.execute(
            select(DebtAccount).where(DebtAccount.user_id == user_id)
        )
        
        all_accounts = list(cash_accounts.scalars().all()) + list(debt_accounts.scalars().all())
        biz_account_ids = {a.id for a in all_accounts if getattr(a, "is_business", False)}
        pers_account_ids = {a.id for a in all_accounts if not getattr(a, "is_business", False)}

        # 2. Fetch transactions for these accounts
        # Note: Current BankTransaction model only links to cash_accounts. 
        # In a full implementation, it would link to all account types.
        transactions_result = await self._session.execute(
            select(BankTransaction).where(BankTransaction.cash_account_id.in_(biz_account_ids | pers_account_ids))
        )
        transactions = transactions_result.scalars().all()

        for tx in transactions:
            is_commingled = False
            if tx.cash_account_id in biz_account_ids:
                # Business account: check for personal spend
                if tx.primary_category in PERSONAL_SPEND_CATEGORIES:
                    is_commingled = True
            elif tx.cash_account_id in pers_account_ids:
                # Personal account: check for business spend
                if tx.primary_category in BUSINESS_SPEND_CATEGORIES:
                    is_commingled = True
            
            tx.is_commingled = is_commingled

        await self._session.commit()

    async def get_vulnerability_report(self, user_id: uuid.UUID) -> dict:
        """Calculate commingling metrics for the Founder Operating Room."""
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .where(CashAccount.user_id == user_id)
        )
        transactions = result.scalars().all()
        
        total_count = len(transactions)
        commingled_count = sum(1 for tx in transactions if tx.is_commingled)
        commingled_amount = sum(abs(tx.amount) for tx in transactions if tx.is_commingled)
        
        risk_score = 100 - (min(100, (commingled_count / total_count * 500)) if total_count > 0 else 0)

        return {
            "risk_score": round(risk_score, 1),
            "commingled_count": commingled_count,
            "commingled_amount": float(commingled_amount),
            "total_analyzed": total_count,
            "status": "critical" if risk_score < 40 else "warning" if risk_score < 80 else "strong"
        }
