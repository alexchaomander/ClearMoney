"""Claude Vision extraction provider for tax documents."""

import base64
import logging
from functools import cached_property

from app.core.config import settings
from app.schemas.tax_document import ExtractionResult
from app.services.providers.base_extraction import (
    EXTRACTION_SYSTEM_PROMPT,
    ExtractionProvider,
)

logger = logging.getLogger(__name__)

CLAUDE_DEFAULT_MODEL = "claude-sonnet-4-20250514"


class ClaudeExtractionProvider(ExtractionProvider):
    """Extraction provider using Anthropic Claude with vision/document support."""

    provider_name = "claude"

    @cached_property
    def _client(self):
        """Lazily initialize and cache the Anthropic client."""
        if not settings.anthropic_api_key:
            raise RuntimeError("STRATA_ANTHROPIC_API_KEY not configured")
        try:
            import anthropic
        except ImportError:
            raise RuntimeError(
                "anthropic package not installed. Run: uv pip install anthropic"
            ) from None
        return anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    @staticmethod
    def _resolve_model() -> str:
        """Return a Claude-compatible model name.

        Falls back to ``CLAUDE_DEFAULT_MODEL`` when the global
        ``extraction_model`` setting points at a non-Claude model.
        """
        model = settings.extraction_model
        if model.startswith("claude"):
            return model
        logger.warning(
            "extraction_model '%s' is not a Claude model; "
            "falling back to '%s'",
            model,
            CLAUDE_DEFAULT_MODEL,
        )
        return CLAUDE_DEFAULT_MODEL

    def supported_mime_types(self) -> list[str]:
        return [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
            "application/pdf",
        ]

    async def extract(
        self,
        file_bytes: bytes,
        mime_type: str,
        filename: str,
        *,
        document_type_hint: str | None = None,
    ) -> ExtractionResult:
        client = self._client

        b64_data = base64.standard_b64encode(file_bytes).decode("utf-8")

        block_type = "document" if mime_type == "application/pdf" else "image"
        content_block = {
            "type": block_type,
            "source": {
                "type": "base64",
                "media_type": mime_type,
                "data": b64_data,
            },
        }

        response = await client.messages.create(
            model=self._resolve_model(),
            max_tokens=4096,
            system=EXTRACTION_SYSTEM_PROMPT,
            messages=[
                {
                    "role": "user",
                    "content": [
                        content_block,
                        {
                            "type": "text",
                            "text": self.build_user_prompt(filename, document_type_hint),
                        },
                    ],
                }
            ],
        )

        raw_text = "".join(
            block.text for block in response.content if block.type == "text"
        )
        return self.parse_llm_response(raw_text)
