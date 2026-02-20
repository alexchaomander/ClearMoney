"""Abstract base class for document extraction providers."""

import json
import logging
from abc import ABC, abstractmethod

from app.schemas.tax_document import ExtractionResult

logger = logging.getLogger(__name__)

EXTRACTION_SYSTEM_PROMPT = """You are a tax document extraction assistant. Given an image or PDF of a tax document, extract all relevant fields into structured JSON.

Return a JSON object with exactly these top-level keys:
- "document_type": one of "w2", "1099-int", "1099-div", "1099-b", "k-1", "1040", "unknown"
- "tax_year": integer year (e.g. 2025) or null if not determinable
- "fields": object with document-type-specific fields (all values as numbers or strings)
- "confidence": float 0.0-1.0 indicating extraction confidence
- "warnings": array of strings for any issues or uncertainties

For W-2 documents, fields should include: employer_name, employer_ein, wages_tips_compensation, federal_income_tax_withheld, social_security_wages, social_security_tax_withheld, medicare_wages, medicare_tax_withheld, state, state_wages, state_income_tax.

For 1099-INT: payer_name, interest_income, early_withdrawal_penalty, federal_income_tax_withheld, tax_exempt_interest.

For 1099-DIV: payer_name, total_ordinary_dividends, qualified_dividends, total_capital_gain, federal_income_tax_withheld.

For 1099-B: payer_name, short_term_proceeds, short_term_cost_basis, short_term_gain_loss, long_term_proceeds, long_term_cost_basis, long_term_gain_loss, federal_income_tax_withheld.

For K-1: partnership_name, partnership_ein, ordinary_business_income, net_rental_income, guaranteed_payments, interest_income, dividends, short_term_capital_gain, long_term_capital_gain.

Return ONLY the JSON object, no markdown fences or explanation."""


class ExtractionProvider(ABC):
    """Provider-agnostic interface for tax document extraction."""

    provider_name: str = "base"

    @abstractmethod
    async def extract(
        self,
        file_bytes: bytes,
        mime_type: str,
        filename: str,
        *,
        document_type_hint: str | None = None,
    ) -> ExtractionResult:
        """Extract structured data from a document."""
        ...

    @abstractmethod
    def supported_mime_types(self) -> list[str]:
        """Return list of MIME types this provider can handle."""
        ...

    # --- Shared helpers for LLM-based providers ---

    @staticmethod
    def build_user_prompt(filename: str, document_type_hint: str | None = None) -> str:
        """Build the user-facing prompt text."""
        text = f"Extract all fields from this tax document: {filename}"
        if document_type_hint:
            text += f" (expected type: {document_type_hint})"
        return text

    def parse_llm_response(self, raw_text: str) -> ExtractionResult:
        """Parse a raw LLM text response into an ExtractionResult.

        Handles markdown fence stripping and JSON parsing. Returns a
        zero-confidence fallback result on parse failure.
        """
        try:
            cleaned = raw_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("\n", 1)[1]
                if cleaned.endswith("```"):
                    cleaned = cleaned[:-3]
                cleaned = cleaned.strip()

            parsed = json.loads(cleaned)
        except (json.JSONDecodeError, IndexError):
            logger.error(
                "Failed to parse %s response as JSON: %s",
                self.provider_name,
                raw_text[:500],
                exc_info=True,
            )
            return ExtractionResult(
                document_type="unknown",
                tax_year=None,
                fields={},
                confidence=0.0,
                provider_name=self.provider_name,
                raw_provider_response={"text": raw_text},
                warnings=["Failed to parse extraction response as JSON"],
            )

        return ExtractionResult(
            document_type=parsed.get("document_type", "unknown"),
            tax_year=parsed.get("tax_year"),
            fields=parsed.get("fields", {}),
            confidence=min(1.0, max(0.0, float(parsed.get("confidence", 0.5)))),
            provider_name=self.provider_name,
            raw_provider_response=parsed,
            warnings=parsed.get("warnings", []),
        )
