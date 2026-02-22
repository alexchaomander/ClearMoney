"""Gemini extraction provider using the google-genai SDK."""

import logging
from functools import cached_property

from app.core.config import settings
from app.schemas.tax_document import ExtractionResult
from app.services.providers.base_extraction import (
    EXTRACTION_SYSTEM_PROMPT,
    ExtractionProvider,
)

logger = logging.getLogger(__name__)

GEMINI_DEFAULT_MODEL = "gemini-2.0-flash"


class GeminiExtractionProvider(ExtractionProvider):
    """Extraction provider using Google Gemini with vision/document support."""

    provider_name = "gemini"

    @cached_property
    def _client(self):
        """Lazily initialize and cache the Gemini client."""
        if not settings.google_api_key:
            raise RuntimeError("STRATA_GOOGLE_API_KEY not configured")
        try:
            from google import genai
        except ImportError:
            raise RuntimeError(
                "google-genai package not installed. "
                "Run: uv pip install 'strata-api[providers]'"
            ) from None
        return genai.Client(api_key=settings.google_api_key)

    def supported_mime_types(self) -> list[str]:
        return ["image/png", "image/jpeg", "image/webp", "application/pdf"]

    @staticmethod
    def _resolve_model() -> str:
        """Return a Gemini-compatible model name.

        Falls back to ``GEMINI_DEFAULT_MODEL`` when the global
        ``extraction_model`` setting points at a non-Gemini model
        (e.g. ``claude-sonnet-*`` or ``gpt-4o``).
        """
        model = settings.extraction_model
        if model.startswith("gemini"):
            return model
        logger.warning(
            "extraction_model '%s' is not a Gemini model; "
            "falling back to '%s'",
            model,
            GEMINI_DEFAULT_MODEL,
        )
        return GEMINI_DEFAULT_MODEL

    async def extract(
        self,
        file_bytes: bytes,
        mime_type: str,
        filename: str,
        *,
        document_type_hint: str | None = None,
    ) -> ExtractionResult:
        client = self._client

        from google.genai import types

        part = types.Part.from_bytes(data=file_bytes, mime_type=mime_type)
        user_text = self.build_user_prompt(filename, document_type_hint)

        response = await client.aio.models.generate_content(
            model=self._resolve_model(),
            config=types.GenerateContentConfig(
                system_instruction=EXTRACTION_SYSTEM_PROMPT,
                max_output_tokens=4096,
            ),
            contents=[part, user_text],
        )

        return self.parse_llm_response(response.text or "")
