from __future__ import annotations

import uuid
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.decision_trace import DecisionTrace
from app.models.financial_correction import (
    FinancialCorrection,
    FinancialCorrectionStatus,
)
from app.models.financial_memory import FinancialMemory
from app.models.memory_event import MemoryEvent, MemoryEventSource
from app.schemas.correction import FinancialCorrectionCreate
from app.services.commingling import ComminglingDetectionEngine
from app.services.metric_trace import build_metric_trace
from app.services.spending_derivation import update_memory_spending_categories

IMMEDIATE_MEMORY_FIELDS = {
    "monthly_income": "monthly_income",
    "average_monthly_expenses": "average_monthly_expenses",
}


class CorrectionService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def create_correction(
        self,
        user_id: uuid.UUID,
        payload: FinancialCorrectionCreate,
    ) -> FinancialCorrection:
        trace = None
        if payload.trace_id is not None:
            trace_result = await self._session.execute(
                select(DecisionTrace).where(
                    DecisionTrace.id == payload.trace_id,
                    DecisionTrace.user_id == user_id,
                )
            )
            trace = trace_result.scalar_one_or_none()
            if trace is None:
                raise HTTPException(status_code=404, detail="Decision trace not found")

        original_value = await self._get_original_value(
            user_id, payload.target_field, payload.target_id
        )
        correction = FinancialCorrection(
            user_id=user_id,
            trace_id=trace.id if trace else None,
            metric_id=payload.metric_id,
            correction_type=payload.correction_type,
            target_field=payload.target_field,
            target_id=payload.target_id,
            summary=payload.summary,
            reason=payload.reason,
            original_value=original_value,
            proposed_value=payload.proposed_value,
            impact_summary={},
        )
        self._session.add(correction)
        await self._session.flush()

        if payload.apply_immediately:
            impact_summary = await self._apply_if_supported(user_id, correction)
            if impact_summary:
                correction.status = FinancialCorrectionStatus.applied
                correction.resolved_value = correction.proposed_value
                correction.impact_summary = impact_summary

        await self._session.commit()
        await self._session.refresh(correction)
        return correction

    async def list_corrections(
        self, user_id: uuid.UUID, metric_id: str | None = None
    ) -> list[FinancialCorrection]:
        query = select(FinancialCorrection).where(
            FinancialCorrection.user_id == user_id
        )
        if metric_id:
            query = query.where(FinancialCorrection.metric_id == metric_id)
        result = await self._session.execute(
            query.order_by(FinancialCorrection.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_blocked_recommendation_intents(self, user_id: uuid.UUID) -> list[str]:
        """Returns a list of blocked recommendation intents (stored as target_field) for the user."""
        result = await self._session.execute(
            select(FinancialCorrection.target_field).where(
                FinancialCorrection.user_id == user_id,
                FinancialCorrection.correction_type == FinancialCorrectionType.wrong_recommendation,
                FinancialCorrection.status == FinancialCorrectionStatus.applied,
            )
        )
        return list(result.scalars().all())

    async def _get_or_create_memory(self, user_id: uuid.UUID) -> FinancialMemory:
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()
        if memory is None:
            memory = FinancialMemory(user_id=user_id)
            self._session.add(memory)
            await self._session.flush()
        return memory

    async def _get_original_value(
        self, user_id: uuid.UUID, target_field: str, target_id: str | None
    ) -> dict:
        if target_field in IMMEDIATE_MEMORY_FIELDS:
            memory = await self._get_or_create_memory(user_id)
            raw_value = getattr(memory, IMMEDIATE_MEMORY_FIELDS[target_field])
            return {"value": float(raw_value) if raw_value is not None else None}
        if target_field == "transaction_category":
            if not target_id:
                raise HTTPException(
                    status_code=400,
                    detail="transaction_category corrections require target_id",
                )
            result = await self._session.execute(
                select(BankTransaction)
                .join(CashAccount, BankTransaction.cash_account_id == CashAccount.id)
                .where(
                    BankTransaction.id == uuid.UUID(target_id),
                    CashAccount.user_id == user_id,
                )
            )
            tx = result.scalar_one_or_none()
            if tx is None:
                raise HTTPException(
                    status_code=404, detail="Bank transaction not found"
                )
            return {
                "primary_category": tx.primary_category,
                "detailed_category": tx.detailed_category,
            }
        if target_field == "debt_balance":
            if not target_id:
                raise HTTPException(status_code=400, detail="debt_balance requires target_id")
            from app.models.debt_account import DebtAccount
            result = await self._session.execute(
                select(DebtAccount).where(DebtAccount.id == uuid.UUID(target_id), DebtAccount.user_id == user_id)
            )
            debt = result.scalar_one_or_none()
            if not debt:
                raise HTTPException(status_code=404, detail="Debt account not found")
            return {"balance": float(debt.balance)}
            
        if target_field == "asset_allocation":
            if not target_id:
                raise HTTPException(status_code=400, detail="asset_allocation requires target_id")
            from app.models.security import Security
            result = await self._session.execute(
                select(Security).where(Security.id == uuid.UUID(target_id))
            )
            security = result.scalar_one_or_none()
            if not security:
                raise HTTPException(status_code=404, detail="Security not found")
            return {"security_type": security.security_type.value}

        return {}

    async def _apply_if_supported(
        self, user_id: uuid.UUID, correction: FinancialCorrection
    ) -> dict | None:
        if correction.target_field in IMMEDIATE_MEMORY_FIELDS:
            value = correction.proposed_value.get("value")
            if value is None:
                raise HTTPException(
                    status_code=400, detail="proposed_value.value is required"
                )
            memory = await self._get_or_create_memory(user_id)
            field_name = IMMEDIATE_MEMORY_FIELDS[correction.target_field]
            old_value = getattr(memory, field_name)
            new_value = Decimal(str(value))
            setattr(memory, field_name, new_value)
            self._session.add(
                MemoryEvent(
                    user_id=user_id,
                    field_name=field_name,
                    old_value=str(old_value) if old_value is not None else None,
                    new_value=str(new_value),
                    source=MemoryEventSource.user_input,
                    context=f"Applied correction {correction.id}",
                )
            )
            impacted_metrics = (
                ["savingsRate"]
                if field_name == "monthly_income"
                else ["savingsRate", "personalRunway"]
            )
            recomputed = {}
            for metric_id in impacted_metrics:
                trace = await build_metric_trace(user_id, metric_id, self._session)
                recomputed[metric_id] = {
                    "confidence_score": trace.confidence_score,
                    "continuity_status": trace.continuity_status,
                    "data_points": [point.model_dump() for point in trace.data_points],
                }
            return {
                "applied": True,
                "target_field": field_name,
                "impacted_metrics": impacted_metrics,
                "recomputed_traces": recomputed,
            }

        if correction.target_field == "transaction_category":
            target_id = correction.target_id
            if not target_id:
                raise HTTPException(status_code=400, detail="target_id is required")
            category = correction.proposed_value.get("primary_category")
            if not isinstance(category, str) or not category.strip():
                raise HTTPException(
                    status_code=400,
                    detail="proposed_value.primary_category is required",
                )
            result = await self._session.execute(
                select(BankTransaction)
                .join(CashAccount, BankTransaction.cash_account_id == CashAccount.id)
                .where(
                    BankTransaction.id == uuid.UUID(target_id),
                    CashAccount.user_id == user_id,
                )
            )
            tx = result.scalar_one_or_none()
            if tx is None:
                raise HTTPException(
                    status_code=404, detail="Bank transaction not found"
                )
            tx.primary_category = category.strip()
            spending_categories_updated = await update_memory_spending_categories(
                self._session, user_id
            )
            commingling_summary = await ComminglingDetectionEngine(
                self._session
            ).scan_and_flag(user_id)
            return {
                "applied": True,
                "target_field": "transaction_category",
                "transaction_id": target_id,
                "new_primary_category": tx.primary_category,
                "impacted_fields": ["spending_categories_monthly", "is_commingled"],
                "spending_categories_updated": spending_categories_updated,
                "commingling_summary": {
                    "total_count": commingling_summary["total_count"],
                    "commingled_count": commingling_summary["commingled_count"],
                    "commingled_amount": float(
                        commingling_summary["commingled_amount"]
                    ),
                },
                "transaction_is_commingled": tx.is_commingled,
            }

        if correction.target_field == "debt_balance":
            target_id = correction.target_id
            new_balance = correction.proposed_value.get("balance")
            if new_balance is None:
                raise HTTPException(status_code=400, detail="proposed_value.balance required")
            from app.models.debt_account import DebtAccount
            result = await self._session.execute(
                select(DebtAccount).where(DebtAccount.id == uuid.UUID(target_id), DebtAccount.user_id == user_id)
            )
            debt = result.scalar_one_or_none()
            if not debt:
                raise HTTPException(status_code=404, detail="Debt account not found")
            
            debt.balance = Decimal(str(new_balance))
            # Optional: recompute metrics
            trace = await build_metric_trace(user_id, "netWorth", self._session)
            return {
                "applied": True,
                "target_field": "debt_balance",
                "impacted_metrics": ["netWorth"],
                "recomputed_traces": {
                    "netWorth": {
                        "confidence_score": trace.confidence_score,
                        "data_points": [p.model_dump() for p in trace.data_points]
                    }
                }
            }
            
        if correction.target_field == "asset_allocation":
            target_id = correction.target_id
            new_type = correction.proposed_value.get("security_type")
            if not new_type:
                raise HTTPException(status_code=400, detail="proposed_value.security_type required")
            from app.models.security import Security, SecurityType
            result = await self._session.execute(
                select(Security).where(Security.id == uuid.UUID(target_id))
            )
            security = result.scalar_one_or_none()
            if not security:
                raise HTTPException(status_code=404, detail="Security not found")
            
            try:
                security.security_type = SecurityType(new_type)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid security type")
                
            return {
                "applied": True,
                "target_field": "asset_allocation",
                "impacted_metrics": ["portfolioAllocation"]
            }

        if correction.correction_type == FinancialCorrectionType.wrong_recommendation:
            # Applying a recommendation suppression doesn't mutate a strict DB record,
            # but setting the correction to `applied` is enough to trigger the blocklist
            # logic in the agent when it queries for suppressed intents matching this metric.
            return {
                "applied": True,
                "target_field": correction.target_field,
                "action": "suppress_recommendation_intent"
            }

        return None
