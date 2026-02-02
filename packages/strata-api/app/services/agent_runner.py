import asyncio
import json
import sys
from typing import Any

from app.core.config import settings


async def _create_message(payload: dict[str, Any]) -> dict:
    try:
        import anthropic
    except ImportError as exc:
        raise RuntimeError(
            "anthropic package not installed. Run: uv pip install anthropic"
        ) from exc

    if not settings.anthropic_api_key:
        raise RuntimeError("STRATA_ANTHROPIC_API_KEY not configured")

    client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)
    response = await client.messages.create(
        model=payload["model"],
        max_tokens=payload["max_tokens"],
        system=payload["system"],
        messages=payload["messages"],
        tools=payload["tools"],
    )
    content = []
    for block in response.content:
        if block.type == "text":
            content.append({"type": "text", "text": block.text})
        elif block.type == "tool_use":
            content.append({
                "type": "tool_use",
                "id": block.id,
                "name": block.name,
                "input": block.input,
            })
    return {"content": content, "stop_reason": response.stop_reason}


async def main() -> None:
    if len(sys.argv) > 2:
        with open(sys.argv[1], "r", encoding="utf-8") as handle:
            payload = json.load(handle)
        response_path = sys.argv[2]
        result = await _create_message(payload)
        with open(response_path, "w", encoding="utf-8") as handle:
            json.dump(result, handle)
        return

    payload = json.loads(sys.stdin.read())
    result = await _create_message(payload)
    sys.stdout.write(json.dumps(result))


if __name__ == "__main__":
    asyncio.run(main())
