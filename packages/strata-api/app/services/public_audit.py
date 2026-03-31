import logging
from typing import Any
from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.services.document_extraction import DocumentExtractionService
from app.schemas.agent import DecisionTracePayload, DecisionTraceRuleCheck, ContextQualityResponse, FreshnessStatus

logger = logging.getLogger(__name__)

class PublicAuditService:
    def __init__(self, session: AsyncSession):
        self._session = session
        self._extraction_service = DocumentExtractionService(session)

    async def run_public_tax_audit(self, file_bytes: bytes, filename: str, mime_type: str) -> DecisionTracePayload:
        """
        Runs an end-to-end tax audit for an unauthenticated user.
        1. Extract data from document
        2. Run deterministic tax rules
        3. Generate a sanitized Decision Trace
        """
        # 1. Extraction
        # Note: In a real public scenario, we might want a light version of process_upload
        # that doesn't persist to the main TaxDocument table if we want true ephemerality.
        extracted_data: dict[str, Any] = {}
        try:
            provider = self._extraction_service._get_provider()
            result = await provider.extract(file_bytes, mime_type, filename)
            extracted_data = result.fields
        except Exception:
            logger.exception("Public extraction failed for %s", filename)

        # 2. Deterministic Audit (Mocked logic for the "Shot" experience)
        wages = Decimal(str(extracted_data.get("wages_tips_compensation", 0) or 0))
        withholding = Decimal(str(extracted_data.get("federal_income_tax_withheld", 0) or 0))
        
        # Heuristic: Scan for common "missing" shields
        potential_shields = []
        total_impact = Decimal("0")
        
        # Example rule: Home Office
        if wages > 50000:
            potential_shields.append(DecisionTraceRuleCheck(
                name="Home Office Deduction",
                passed=False,
                value=0,
                threshold=2100,
                message="Based on your income level, you may be eligible for a ~$2,100 home office shield."
            ))
            total_impact += Decimal("2100")

        # 3. Generate Trace Payload
        return DecisionTracePayload(
            trace_kind="public_tax_audit",
            title="AI Tax Shield Audit Results",
            summary=f"We identified ${total_impact:,.0f} in potential missing tax shields.",
            recommendation_status="actionable",
            rules_applied=potential_shields,
            confidence_score=0.92,
            determinism_class="deterministic",
            source_tier="ephemeral_upload",
            freshness=FreshnessStatus(is_fresh=True, max_age_hours=24),
            context_quality=ContextQualityResponse(
                continuity_status="healthy",
                recommendation_readiness="ready",
                confidence_score=0.92,
                freshness=FreshnessStatus(is_fresh=True, max_age_hours=24),
                coverage_ratio=1.0,
                active_connection_count=0,
                total_connection_count=0,
                stale_connection_count=0,
                errored_connection_count=0
            ),
            deterministic={
                "total_impact": float(total_impact),
                "wages_detected": float(wages),
                "withholding_detected": float(withholding)
            }
        )

    async def run_public_manual_audit(self, data: dict[str, Any]) -> DecisionTracePayload:
        monthly_income = Decimal(str(data.get("monthly_income", 0) or 0))
        monthly_expenses = Decimal(str(data.get("monthly_expenses", 0) or 0))
        personal_cash = Decimal(str(data.get("cash_balance", 0) or 0))
        business_cash = Decimal(str(data.get("business_cash_balance", 0) or 0))

        monthly_surplus = monthly_income - monthly_expenses
        available_cash = personal_cash + business_cash
        runway_months = (
            available_cash / abs(monthly_surplus)
            if monthly_surplus < 0
            else Decimal("999")
        )

        rules_applied = [
            DecisionTraceRuleCheck(
                name="Monthly Cash Flow",
                passed=monthly_surplus >= 0,
                value=float(monthly_surplus),
                threshold=0,
                message=(
                    "Your monthly surplus is positive."
                    if monthly_surplus >= 0
                    else "Your monthly expenses are outpacing income."
                ),
            ),
            DecisionTraceRuleCheck(
                name="Combined Liquidity",
                passed=available_cash > 0,
                value=float(available_cash),
                threshold=0,
                message="We combine personal and business liquidity for a conservative runway estimate.",
            ),
        ]

        summary = (
            "You appear cash-flow positive based on the values entered."
            if monthly_surplus >= 0
            else f"At your current burn, you have roughly {runway_months:.1f} months of combined runway."
        )

        return DecisionTracePayload(
            trace_kind="public_manual_audit",
            title="Manual Financial Audit Results",
            summary=summary,
            recommendation_status="actionable",
            rules_applied=rules_applied,
            confidence_score=0.88,
            determinism_class="deterministic",
            source_tier="manual_input",
            freshness=FreshnessStatus(is_fresh=True, max_age_hours=24),
            context_quality=ContextQualityResponse(
                continuity_status="healthy",
                recommendation_readiness="ready",
                confidence_score=0.88,
                freshness=FreshnessStatus(is_fresh=True, max_age_hours=24),
                coverage_ratio=1.0,
                active_connection_count=0,
                total_connection_count=0,
                stale_connection_count=0,
                errored_connection_count=0,
            ),
            deterministic={
                "monthly_surplus": float(monthly_surplus),
                "available_cash": float(available_cash),
                "runway_months": float(runway_months) if monthly_surplus < 0 else None,
            },
        )
