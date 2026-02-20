"""Gemini extraction provider — stub for future implementation."""

from app.schemas.tax_document import ExtractionResult
from app.services.providers.base_extraction import ExtractionProvider


class GeminiExtractionProvider(ExtractionProvider):
    """Stubbed provider for Google Gemini Vision extraction."""

    provider_name = "gemini"

    def supported_mime_types(self) -> list[str]:
        return ["image/png", "image/jpeg", "application/pdf"]

    async def extract(
        self,
        file_bytes: bytes,
        mime_type: str,
        filename: str,
        *,
        document_type_hint: str | None = None,
    ) -> ExtractionResult:
        raise NotImplementedError(
            "Gemini extraction provider is not yet implemented. "
            "Set STRATA_EXTRACTION_PROVIDER=claude to use Claude instead."
        )
