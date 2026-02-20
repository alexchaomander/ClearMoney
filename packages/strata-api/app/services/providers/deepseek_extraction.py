"""DeepSeek-OCR2 extraction provider via vLLM OpenAI-compatible API."""

import base64

from app.core.config import settings
from app.schemas.tax_document import ExtractionResult
from app.services.providers.base_extraction import (
    EXTRACTION_SYSTEM_PROMPT,
    ExtractionProvider,
)


class DeepSeekExtractionProvider(ExtractionProvider):
    """Extraction provider using DeepSeek-OCR2 served via vLLM.

    DeepSeek-OCR2 is a vision-language model optimized for document OCR.
    It is self-hosted via vLLM which exposes an OpenAI-compatible
    ``/v1/chat/completions`` endpoint.

    Required config (env vars):
        STRATA_DEEPSEEK_BASE_URL  - vLLM server URL (e.g. http://localhost:8000/v1)
        STRATA_DEEPSEEK_API_KEY   - API key (use "EMPTY" for unauthenticated vLLM)
        STRATA_DEEPSEEK_MODEL     - model name as registered in vLLM
    """

    provider_name = "deepseek"

    def __init__(self) -> None:
        self._client = None

    def _get_client(self):
        if self._client is None:
            base_url = settings.deepseek_base_url
            if not base_url:
                raise RuntimeError(
                    "STRATA_DEEPSEEK_BASE_URL not configured. "
                    "Set it to your vLLM endpoint (e.g. http://localhost:8000/v1)."
                )
            try:
                from openai import AsyncOpenAI
            except ImportError:
                raise RuntimeError(
                    "openai package not installed. Run: uv pip install openai"
                )

            self._client = AsyncOpenAI(
                api_key=settings.deepseek_api_key or "EMPTY",
                base_url=base_url,
            )
        return self._client

    def supported_mime_types(self) -> list[str]:
        return [
            "image/png",
            "image/jpeg",
            "image/webp",
            "image/gif",
        ]

    async def extract(
        self,
        file_bytes: bytes,
        mime_type: str,
        filename: str,
        *,
        document_type_hint: str | None = None,
    ) -> ExtractionResult:
        if mime_type == "application/pdf":
            return ExtractionResult(
                document_type="unknown",
                tax_year=None,
                fields={},
                confidence=0.0,
                provider_name=self.provider_name,
                warnings=[
                    "DeepSeek-OCR2 does not natively support PDF input. "
                    "Convert to images first or use the claude provider."
                ],
            )

        client = self._get_client()

        b64_data = base64.standard_b64encode(file_bytes).decode("utf-8")
        data_url = f"data:{mime_type};base64,{b64_data}"

        response = await client.chat.completions.create(
            model=settings.deepseek_model,
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
