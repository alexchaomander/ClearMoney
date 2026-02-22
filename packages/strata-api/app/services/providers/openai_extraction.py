"""OpenAI-compatible extraction provider.

Works with the official OpenAI API (GPT-4o) as well as any
OpenAI-compatible endpoint such as vLLM, Ollama, or Together AI.

Set STRATA_OPENAI_BASE_URL to override the default OpenAI endpoint.
"""

import base64
import logging
import re
from functools import cached_property

from app.core.config import settings
from app.schemas.tax_document import ExtractionResult
from app.services.providers.base_extraction import (
    EXTRACTION_SYSTEM_PROMPT,
    ExtractionProvider,
)

logger = logging.getLogger(__name__)

OPENAI_DEFAULT_MODEL = "gpt-4o"


class OpenAIExtractionProvider(ExtractionProvider):
    """Extraction provider using OpenAI-compatible chat completions API.

    Supports the official OpenAI API and any OpenAI-compatible endpoint
    (vLLM, Ollama, Together AI, etc.) by setting STRATA_OPENAI_BASE_URL.
    """

    provider_name = "openai"

    @cached_property
    def _client(self):
        """Lazily initialize and cache the OpenAI client."""
        api_key = settings.openai_api_key
        if not api_key:
            raise RuntimeError("STRATA_OPENAI_API_KEY not configured")
        try:
            from openai import AsyncOpenAI
        except ImportError:
            raise RuntimeError(
                "openai package not installed. Run: uv pip install openai"
            ) from None

        kwargs: dict = {"api_key": api_key}
        if settings.openai_base_url:
            kwargs["base_url"] = settings.openai_base_url

        return AsyncOpenAI(**kwargs)

    @staticmethod
    def _resolve_model() -> str:
        """Return an OpenAI-compatible model name.

        Falls back to ``OPENAI_DEFAULT_MODEL`` when the global
        ``extraction_model`` setting points at a non-OpenAI model.
        """
        model = settings.extraction_model
        if re.match(r"^(gpt|o\d)", model):
            return model
        logger.warning(
            "extraction_model '%s' is not an OpenAI model; "
            "falling back to '%s'",
            model,
            OPENAI_DEFAULT_MODEL,
        )
        return OPENAI_DEFAULT_MODEL

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
        data_url = f"data:{mime_type};base64,{b64_data}"

        response = await client.chat.completions.create(
            model=self._resolve_model(),
            max_tokens=4096,
            messages=[
                {"role": "system", "content": EXTRACTION_SYSTEM_PROMPT},
                {
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": data_url}},
                        {
                            "type": "text",
                            "text": self.build_user_prompt(filename, document_type_hint),
                        },
                    ],
                },
            ],
        )

        raw_text = response.choices[0].message.content or ""
        return self.parse_llm_response(raw_text)
