"""Document extraction orchestration service."""

import logging
import uuid

from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.tax_document import TaxDocument
from app.models.tax_plan_workspace import TaxPlan, TaxPlanVersion
from app.schemas.tax_document import (
    FIELD_SCHEMAS,
    REQUIRED_FIELDS,
    ExtractionResult,
    PrefillTaxPlanResponse,
    ValidationIssue,
)
from app.services.providers.base_extraction import ExtractionProvider

logger = logging.getLogger(__name__)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB
ALLOWED_MIME_TYPES = {
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
    "application/pdf",
}


class DocumentExtractionService:
    """Orchestrates document upload, extraction, validation, and pre-fill."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _get_provider(self) -> ExtractionProvider:
        """Factory: return the configured extraction provider."""
        provider_name = settings.extraction_provider.lower()

        if provider_name == "claude":
            from app.services.providers.claude_extraction import ClaudeExtractionProvider
            return ClaudeExtractionProvider()
        elif provider_name == "gemini":
            from app.services.providers.gemini_extraction import GeminiExtractionProvider
            return GeminiExtractionProvider()
        elif provider_name == "openai":
            from app.services.providers.openai_extraction import OpenAIExtractionProvider
            return OpenAIExtractionProvider()
        elif provider_name == "deepseek":
            from app.services.providers.deepseek_extraction import DeepSeekExtractionProvider
            return DeepSeekExtractionProvider()
        elif provider_name == "tesseract":
            from app.services.providers.tesseract_extraction import TesseractExtractionProvider
            return TesseractExtractionProvider()
        else:
            raise ValueError(f"Unknown extraction provider: {provider_name}")

    def validate_extraction(
        self, result: ExtractionResult
    ) -> list[ValidationIssue]:
        """Validate extracted fields against per-document-type schemas."""
        issues: list[ValidationIssue] = []

        doc_type = result.document_type
        if doc_type == "unknown":
            issues.append(
                ValidationIssue(
                    field="document_type",
                    message="Could not determine document type",
                    severity="warning",
                )
            )
            return issues

        # Validate field structure using Pydantic model
        schema_cls = FIELD_SCHEMAS.get(doc_type)
        if schema_cls:
            try:
                validated = schema_cls.model_validate(result.fields)
                result.fields = validated.model_dump()
            except ValidationError as e:
                for error in e.errors():
                    issues.append(
                        ValidationIssue(
                            field=".".join(str(loc) for loc in error["loc"]),
                            message=error["msg"],
                            severity="error",
                        )
                    )

        # Check required fields
        required = REQUIRED_FIELDS.get(doc_type, [])
        for field_name in required:
            value = result.fields.get(field_name)
            if value is None:
                issues.append(
                    ValidationIssue(
                        field=field_name,
                        message=f"Required field '{field_name}' is missing",
                        severity="warning",
                    )
                )

        return issues

    async def process_upload(
        self,
        user_id: uuid.UUID,
        file_bytes: bytes,
        filename: str,
        mime_type: str,
        *,
        document_type_hint: str | None = None,
    ) -> TaxDocument:
        """Process a document upload: validate, extract, store."""
        # Validate file
        if len(file_bytes) > MAX_FILE_SIZE:
            raise ValueError(f"File too large: {len(file_bytes)} bytes (max {MAX_FILE_SIZE})")
        if mime_type not in ALLOWED_MIME_TYPES:
            raise ValueError(f"Unsupported file type: {mime_type}")

        # Verify the configured provider supports this MIME type
        provider = self._get_provider()
        if mime_type not in provider.supported_mime_types():
            raise ValueError(
                f"Provider '{provider.provider_name}' does not support "
                f"{mime_type}. Supported: {', '.join(provider.supported_mime_types())}"
            )

        # Create document record
        doc = TaxDocument(
            user_id=user_id,
            original_filename=filename,
            mime_type=mime_type,
            file_size_bytes=len(file_bytes),
            status="processing",
        )
        self._session.add(doc)
        await self._session.flush()

        try:
            # Extract
            result = await provider.extract(
                file_bytes, mime_type, filename,
                document_type_hint=document_type_hint,
            )

            # Validate
            issues = self.validate_extraction(result)
            has_errors = any(i.severity == "error" for i in issues)

            # Update document
            doc.document_type = result.document_type
            doc.tax_year = result.tax_year
            doc.provider_used = result.provider_name
            doc.extracted_data = result.fields
            doc.confidence_score = result.confidence
            doc.validation_errors = [i.model_dump() for i in issues] if issues else None
            doc.status = "needs_review" if has_errors else "completed"

        except Exception as e:
            logger.exception("Extraction failed for document %s", doc.id)
            doc.status = "failed"
            # Sanitize: only expose the exception class name, not internal details
            doc.error_message = f"Extraction failed: {type(e).__name__}"

        await self._session.commit()
        await self._session.refresh(doc)
        return doc

    async def prefill_tax_plan(
        self,
        user_id: uuid.UUID,
        document_ids: list[uuid.UUID],
        plan_id: uuid.UUID,
        label: str,
    ) -> PrefillTaxPlanResponse:
        """Create a TaxPlanVersion pre-filled from extracted document data."""
        # Verify the user owns the target plan
        plan_result = await self._session.execute(
            select(TaxPlan).where(
                TaxPlan.id == plan_id,
                TaxPlan.user_id == user_id,
            )
        )
        if not plan_result.scalar_one_or_none():
            raise ValueError("Tax plan not found or not owned by user")

        # Load documents
        result = await self._session.execute(
            select(TaxDocument).where(
                TaxDocument.id.in_(document_ids),
                TaxDocument.user_id == user_id,
                TaxDocument.status.in_(["completed", "needs_review"]),
            )
        )
        docs = result.scalars().all()

        if not docs:
            raise ValueError("No completed documents found for the given IDs")

        # Build pre-fill mapping
        inputs: dict = {}
        fields_populated: list[str] = []
        warnings: list[str] = []

        for doc in docs:
            data = doc.extracted_data or {}
            doc_type = doc.document_type

            if doc_type == "w2":
                if "wages_tips_compensation" in data:
                    inputs["wagesIncome"] = inputs.get("wagesIncome", 0) + (data["wages_tips_compensation"] or 0)
                    fields_populated.append("wagesIncome")
                if "federal_income_tax_withheld" in data:
                    inputs["currentWithholding"] = inputs.get("currentWithholding", 0) + (data["federal_income_tax_withheld"] or 0)
                    fields_populated.append("currentWithholding")

            elif doc_type == "1099-b":
                if "short_term_gain_loss" in data:
                    inputs["shortTermGains"] = inputs.get("shortTermGains", 0) + (data["short_term_gain_loss"] or 0)
                    fields_populated.append("shortTermGains")
                if "long_term_gain_loss" in data:
                    inputs["longTermGains"] = inputs.get("longTermGains", 0) + (data["long_term_gain_loss"] or 0)
                    fields_populated.append("longTermGains")

            elif doc_type == "1099-int":
                if "interest_income" in data:
                    inputs["otherOrdinaryIncome"] = inputs.get("otherOrdinaryIncome", 0) + (data["interest_income"] or 0)
                    fields_populated.append("otherOrdinaryIncome")

            elif doc_type == "1099-div":
                if "total_ordinary_dividends" in data:
                    inputs["otherOrdinaryIncome"] = inputs.get("otherOrdinaryIncome", 0) + (data["total_ordinary_dividends"] or 0)
                    fields_populated.append("otherOrdinaryIncome")
                if "total_capital_gain" in data:
                    inputs["longTermGains"] = inputs.get("longTermGains", 0) + (data["total_capital_gain"] or 0)
                    fields_populated.append("longTermGains")

            if doc.confidence_score and doc.confidence_score < 0.7:
                warnings.append(f"{doc.original_filename}: low confidence ({doc.confidence_score:.0%})")

        # Create version
        version = TaxPlanVersion(
            plan_id=plan_id,
            created_by_user_id=user_id,
            label=label,
            inputs=inputs,
            source="import",
        )
        self._session.add(version)
        await self._session.commit()
        await self._session.refresh(version)

        return PrefillTaxPlanResponse(
            version_id=version.id,
            plan_id=plan_id,
            fields_populated=list(set(fields_populated)),
            warnings=warnings,
        )
