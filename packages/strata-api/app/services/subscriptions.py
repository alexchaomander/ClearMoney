import logging
import uuid
from collections import defaultdict
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount

logger = logging.getLogger(__name__)

class SubscriptionService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def detect_subscriptions(self, user_id: uuid.UUID) -> dict:
        """Scan transactions for recurring billing patterns."""
        # 1. Fetch last 120 days of transactions to find patterns
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .where(
                CashAccount.user_id == user_id,
                BankTransaction.amount < 0  # Only debits
            )
            .order_by(BankTransaction.transaction_date.desc())
        )
        transactions = result.scalars().all()

        # 2. Group by merchant/name
        merchant_groups = defaultdict(list)
        for tx in transactions:
            key = tx.merchant_name or tx.name
            merchant_groups[key.lower()].append(tx)

        subscriptions = []
        total_monthly_burn = Decimal("0.00")

        # 3. Analyze groups for recurrence
        for merchant, txs in merchant_groups.items():
            if len(txs) < 2:
                continue

            # Sort by date
            txs.sort(key=lambda x: x.transaction_date)

            # Check intervals
            intervals = []
            for i in range(len(txs) - 1):
                delta = (txs[i+1].transaction_date - txs[i].transaction_date).days
                intervals.append(delta)

            # Simple check for monthly (25-35 days) or weekly (6-8 days) patterns
            avg_interval = sum(intervals) / len(intervals)
            is_recurring = False
            frequency = "unknown"

            if 25 <= avg_interval <= 35:
                is_recurring = True
                frequency = "monthly"
            elif 6 <= avg_interval <= 8:
                is_recurring = True
                frequency = "weekly"
            elif 80 <= avg_interval <= 100:
                is_recurring = True
                frequency = "quarterly"

            if is_recurring:
                latest_amount = abs(txs[-1].amount)
                monthly_impact = latest_amount if frequency == "monthly" else (latest_amount * 4 if frequency == "weekly" else latest_amount / 3)

                subscriptions.append({
                    "merchant": txs[-1].merchant_name or txs[-1].name,
                    "amount": float(latest_amount),
                    "frequency": frequency,
                    "last_date": txs[-1].transaction_date.isoformat(),
                    "monthly_impact": float(monthly_impact),
                    "category": txs[-1].primary_category
                })
                total_monthly_burn += monthly_impact

        # Sort by impact
        subscriptions.sort(key=lambda x: x["monthly_impact"], reverse=True)

        return {
            "subscriptions": subscriptions,
            "total_monthly_subscription_burn": float(total_monthly_burn),
            "subscription_count": len(subscriptions)
        }
