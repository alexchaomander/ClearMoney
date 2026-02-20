"""Tesseract OCR extraction provider — stub for future implementation."""

from app.schemas.tax_document import ExtractionResult
from app.services.providers.base_extraction import ExtractionProvider


class TesseractExtractionProvider(ExtractionProvider):
    """Stubbed provider for Tesseract OCR-based extraction."""

    provider_name = "tesseract"

    def supported_mime_types(self) -> list[str]:
        return ["image/png", "image/jpeg", "image/tiff"]

    async def extract(
        self,
        file_bytes: bytes,
        mime_type: str,
        filename: str,
        *,
        document_type_hint: str | None = None,
    ) -> ExtractionResult:
        raise NotImplementedError(
            "Tesseract extraction provider is not yet implemented. "
            "Set STRATA_EXTRACTION_PROVIDER=claude to use Claude instead."
        )
