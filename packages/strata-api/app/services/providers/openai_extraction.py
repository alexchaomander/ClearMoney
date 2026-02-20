"""OpenAI-compatible extraction provider.

Works with the official OpenAI API (GPT-4o) as well as any
OpenAI-compatible endpoint such as vLLM, Ollama, or Together AI.

Set STRATA_OPENAI_BASE_URL to override the default OpenAI endpoint.
"""

import base64

from app.core.config import settings
from app.schemas.tax_document import ExtractionResult
from app.services.providers.base_extraction import (
    EXTRACTION_SYSTEM_PROMPT,
    ExtractionProvider,
)


class OpenAIExtractionProvider(ExtractionProvider):
    """Extraction provider using OpenAI-compatible chat completions API.

    Supports the official OpenAI API and any OpenAI-compatible endpoint
    (vLLM, Ollama, Together AI, etc.) by setting STRATA_OPENAI_BASE_URL.
    """

    provider_name = "openai"

    def __init__(self) -> None:
        self._client = None

    def _get_client(self):
        if self._client is None:
            api_key = settings.openai_api_key
            if not api_key:
                raise RuntimeError("STRATA_OPENAI_API_KEY not configured")
            try:
                from openai import AsyncOpenAI
            except ImportError:
                raise RuntimeError(
                    "openai package not installed. Run: uv pip install openai"
                )

            kwargs: dict = {"api_key": api_key}
            if settings.openai_base_url:
                kwargs["base_url"] = settings.openai_base_url

            self._client = AsyncOpenAI(**kwargs)
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
        data_url = f"data:{mime_type};base64,{b64_data}"

        response = await client.chat.completions.create(
            model=settings.extraction_model,
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
