import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.debt_account import DebtAccount
from app.models.entity import EntityType

# Categories that are highly likely to be personal when on a business account
PERSONAL_SPEND_CATEGORIES = {
    "FOOD_AND_DRINK",
    "ENTERTAINMENT",
    "PERSONAL_CARE",
    "GIFTS_AND_DONATIONS",
    "LOAN_PAYMENTS",  # Personal loan payments on biz account
}

PERSONAL_MERCHANTS = [
    "doordash", "uber eats", "equinox", "netflix", "hulu", "spotify",
    "whole foods", "sweetgreen", "amc theatres", "peloton"
]

# Categories that are highly likely to be business when on a personal account
BUSINESS_SPEND_CATEGORIES = {
    "GENERAL_SERVICES",  # e.g., SaaS, Legal
    "MARKETING",
    "OFFICE_SUPPLIES",
}

BUSINESS_MERCHANTS = [
    "aws", "amazon web services", "stripe", "brex", "github", "plaid",
    "notion", "quickbooks", "salesforce", "google cloud", "google workspace",
    "adobe", "figma", "shopify", "openai", "delaware franchise tax", "gusto"
]

class ComminglingDetectionEngine:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def scan_and_flag(self, user_id: uuid.UUID):
        """Scan all transactions for commingling risk and set the is_commingled flag."""
        # 1. Identify business and personal accounts
        cash_accounts = await self._session.execute(
            select(CashAccount)
            .options(joinedload(CashAccount.entity))
            .where(CashAccount.user_id == user_id)
        )
        debt_accounts = await self._session.execute(
            select(DebtAccount)
            .options(joinedload(DebtAccount.entity))
            .where(DebtAccount.user_id == user_id)
        )

        all_accounts = list(cash_accounts.scalars().all()) + list(debt_accounts.scalars().all())
        
        biz_account_ids = set()
        pers_account_ids = set()
        
        for a in all_accounts:
            if a.entity:
                if a.entity.entity_type != EntityType.personal:
                    biz_account_ids.add(a.id)
                else:
                    pers_account_ids.add(a.id)
            else:
                if getattr(a, "is_business", False):
                    biz_account_ids.add(a.id)
                else:
                    pers_account_ids.add(a.id)

        # 2. Fetch transactions for these accounts
        # Note: Current BankTransaction model only links to cash_accounts.
        transactions_result = await self._session.execute(
            select(BankTransaction).where(BankTransaction.cash_account_id.in_(biz_account_ids | pers_account_ids))
        )
        transactions = transactions_result.scalars().all()

        for tx in transactions:
            is_commingled = False
            merchant_name = (tx.merchant_name or "").lower()
            primary_category = tx.primary_category or ""

            if tx.cash_account_id in biz_account_ids:
                # Business account: check for personal spend
                if primary_category in PERSONAL_SPEND_CATEGORIES:
                    is_commingled = True
                elif any(m in merchant_name for m in PERSONAL_MERCHANTS):
                    is_commingled = True
            elif tx.cash_account_id in pers_account_ids:
                # Personal account: check for business spend
                if primary_category in BUSINESS_SPEND_CATEGORIES:
                    is_commingled = True
                elif any(m in merchant_name for m in BUSINESS_MERCHANTS):
                    is_commingled = True

            tx.is_commingled = is_commingled

        await self._session.commit()

    async def get_vulnerability_report(self, user_id: uuid.UUID) -> dict:
        """Calculate commingling metrics for the Founder Operating Room."""
        # Ensure we run a scan first to get fresh flags
        await self.scan_and_flag(user_id)
        
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .where(CashAccount.user_id == user_id)
        )
        transactions = result.scalars().all()

        total_count = len(transactions)
        commingled_count = sum(1 for tx in transactions if tx.is_commingled)
        commingled_amount = sum(abs(tx.amount) for tx in transactions if tx.is_commingled)

        penalty = min(100, (commingled_count / max(1, total_count) * 500))
        risk_score = max(0, 100 - penalty)

        return {
            "risk_score": round(risk_score, 1),
            "commingled_count": commingled_count,
            "commingled_amount": float(commingled_amount),
            "total_analyzed": total_count,
            "status": "critical" if risk_score < 40 else "warning" if risk_score < 80 else "good"
        }
