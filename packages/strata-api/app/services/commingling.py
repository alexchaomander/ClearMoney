import uuid
from decimal import Decimal

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

BATCH_SIZE = 500


class ComminglingDetectionEngine:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def scan_and_flag(self, user_id: uuid.UUID) -> dict:
        """Scan all transactions for commingling risk and set the is_commingled flag.

        Returns a summary dict with total_count, commingled_count, and commingled_amount
        so callers can use the results without re-querying.
        """
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

        all_account_ids = biz_account_ids | pers_account_ids

        # 2. Process transactions in batches to avoid loading everything at once
        total_count = 0
        commingled_count = 0
        commingled_amount = Decimal("0.00")
        offset = 0

        while True:
            transactions_result = await self._session.execute(
                select(BankTransaction)
                .where(BankTransaction.cash_account_id.in_(all_account_ids))
                .order_by(BankTransaction.id)
                .offset(offset)
                .limit(BATCH_SIZE)
            )
            batch = transactions_result.scalars().all()

            if not batch:
                break

            for tx in batch:
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
                total_count += 1
                if is_commingled:
                    commingled_count += 1
                    commingled_amount += abs(tx.amount)

            offset += BATCH_SIZE

        await self._session.commit()

        return {
            "total_count": total_count,
            "commingled_count": commingled_count,
            "commingled_amount": commingled_amount,
        }

    async def get_vulnerability_report(self, user_id: uuid.UUID) -> dict:
        """Calculate commingling metrics for the Founder Operating Room."""
        scan_result = await self.scan_and_flag(user_id)

        total_count = scan_result["total_count"]
        commingled_count = scan_result["commingled_count"]
        commingled_amount = scan_result["commingled_amount"]

        penalty = min(100, (commingled_count / max(1, total_count) * 500))
        risk_score = max(0, 100 - penalty)

        return {
            "risk_score": round(risk_score, 1),
            "commingled_count": commingled_count,
            "commingled_amount": float(commingled_amount),
            "total_analyzed": total_count,
            "status": "critical" if risk_score < 40 else "warning" if risk_score < 80 else "good"
        }
