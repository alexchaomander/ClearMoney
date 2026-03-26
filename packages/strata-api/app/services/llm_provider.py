import logging
from abc import ABC, abstractmethod
from typing import Optional

from app.core.config import settings

logger = logging.getLogger(__name__)

class LLMProvider(ABC):
    @abstractmethod
    async def generate_narrative(self, system_prompt: str, user_prompt: str) -> str:
        """Generates a text narrative from the chosen LLM provider."""
        pass


class OpenAIProvider(LLMProvider):
    def __init__(self, api_key: str, base_url: Optional[str] = None):
        try:
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=api_key, base_url=base_url)
        except ImportError:
            logger.error("openai package not installed.")
            self.client = None

    async def generate_narrative(self, system_prompt: str, user_prompt: str) -> str:
        if not self.client:
            return "Error: OpenAI client not initialized."
        try:
            response = await self.client.chat.completions.create(
                model=settings.advisor_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.choices[0].message.content or ""
        except Exception as e:
            logger.error(f"OpenAI error: {e}")
            return f"Fallback Narrative: Processing error ({e})"


class AnthropicProvider(LLMProvider):
    def __init__(self, api_key: str):
        try:
            from anthropic import AsyncAnthropic
            self.client = AsyncAnthropic(api_key=api_key)
        except ImportError:
            logger.error("anthropic package not installed.")
            self.client = None

    async def generate_narrative(self, system_prompt: str, user_prompt: str) -> str:
        if not self.client:
            return "Error: Anthropic client not initialized."
        try:
            response = await self.client.messages.create(
                model=settings.advisor_model,
                max_tokens=settings.advisor_max_tokens,
                system=system_prompt,
                messages=[
                    {"role": "user", "content": user_prompt}
                ]
            )
            return response.content[0].text
        except Exception as e:
            logger.error(f"Anthropic error: {e}")
            return f"Fallback Narrative: Processing error ({e})"


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str):
        try:
            from google import genai
            if api_key:
                from google.genai import types
                self.client = genai.Client(api_key=api_key)
                self.types = types
            else:
                self.client = None
        except ImportError:
            logger.error("google-genai package not installed.")
            self.client = None

    async def generate_narrative(self, system_prompt: str, user_prompt: str) -> str:
        if not self.client:
            return "Error: Gemini client not initialized."
        try:
            config = self.types.GenerateContentConfig(system_instruction=system_prompt)
            response = await self.client.aio.models.generate_content(
                model=settings.advisor_model,
                contents=user_prompt,
                config=config
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini error: {e}")
            return f"Fallback Narrative: Processing error ({e})"


class ProviderFactory:
    @staticmethod
    def get_provider() -> LLMProvider:
        provider = settings.advisor_provider.lower()
        
        if provider == "openai":
            return OpenAIProvider(api_key=settings.openai_api_key, base_url=settings.openai_base_url or None)
        elif provider == "anthropic":
            return AnthropicProvider(api_key=settings.anthropic_api_key)
        elif provider == "gemini":
            return GeminiProvider(api_key=settings.google_api_key)
        elif provider == "openrouter":
            return OpenAIProvider(
                api_key=settings.openrouter_api_key or settings.openai_api_key, 
                base_url=settings.advisor_base_url or "https://openrouter.ai/api/v1"
            )
        elif provider == "ollama":
            return OpenAIProvider(
                api_key="ollama", # Ollama doesn't need auth verification
                base_url=settings.ollama_base_url
            )
        elif provider == "nvidia":
            return OpenAIProvider(
                api_key=settings.nvidia_api_key,
                base_url="https://integrate.api.nvidia.com/v1"
            )
        else:
            logger.warning(f"Unknown provider: {provider}, falling back to OpenAI")
            return OpenAIProvider(api_key=settings.openai_api_key)
