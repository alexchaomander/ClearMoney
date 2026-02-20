"""Claude Vision extraction provider for tax documents."""

import base64

from app.core.config import settings
from app.schemas.tax_document import ExtractionResult
from app.services.providers.base_extraction import (
    EXTRACTION_SYSTEM_PROMPT,
    ExtractionProvider,
)


class ClaudeExtractionProvider(ExtractionProvider):
    """Extraction provider using Anthropic Claude with vision/document support."""

    provider_name = "claude"

    def __init__(self) -> None:
        self._client = None

    def _get_client(self):
        if self._client is None:
            if not settings.anthropic_api_key:
                raise RuntimeError("STRATA_ANTHROPIC_API_KEY not configured")
            try:
                import anthropic
            except ImportError:
                raise RuntimeError(
                    "anthropic package not installed. Run: uv pip install anthropic"
                )
            self._client = anthropic.AsyncAnthropic(
                api_key=settings.anthropic_api_key
            )
        return self._client

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
        client = self._get_client()

        b64_data = base64.standard_b64encode(file_bytes).decode("utf-8")

        if mime_type == "application/pdf":
            content_block = {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": b64_data,
                },
            }
        else:
            content_block = {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": mime_type,
                    "data": b64_data,
                },
            }

        response = await client.messages.create(
            model=settings.extraction_model,
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

        raw_text = ""
        for block in response.content:
            if block.type == "text":
                raw_text += block.text

        return self.parse_llm_response(raw_text)
