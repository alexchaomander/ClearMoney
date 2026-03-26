import uuid
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.debt_account import DebtAccount


class DebtPrioritizationService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_debt_metrics(self, user_id: uuid.UUID) -> dict:
        """Calculate aggregate debt load and prioritize via Avalanche."""
        result = await self._session.execute(
            select(DebtAccount).where(DebtAccount.user_id == user_id)
        )
        accounts = result.scalars().all()

        total_balance = sum((a.balance for a in accounts), Decimal("0.00"))
        total_min_payment = sum(
            (a.minimum_payment or Decimal("0.00") for a in accounts), Decimal("0.00")
        )

        # Avalanche: sort by int rate desc
        sorted_accts = sorted(
            accounts, key=lambda a: a.interest_rate or Decimal("0"), reverse=True
        )

        strategy = []
        for a in sorted_accts:
            if a.balance > 0:
                strategy.append(
                    {
                        "account_id": str(a.id),
                        "name": a.name,
                        "balance": float(a.balance),
                        "interest_rate": float(a.interest_rate or Decimal("0")),
                        "minimum_payment": float(a.minimum_payment or Decimal("0")),
                    }
                )

        if total_balance > 0:
            weighted_rate = sum(
                (
                    (a.balance / total_balance) * (a.interest_rate or Decimal("0"))
                    for a in accounts
                ),
                Decimal("0.00"),
            )
        else:
            weighted_rate = Decimal("0.00")

        return {
            "total_debt_value": float(total_balance),
            "total_minimum_payments": float(total_min_payment),
            "weighted_average_interest": float(weighted_rate),
            "avalanche_strategy": strategy,
        }
