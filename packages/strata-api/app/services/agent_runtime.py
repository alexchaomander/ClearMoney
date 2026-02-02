import json
from typing import Any

from fastapi import HTTPException

from app.core.config import settings


class AgentRuntime:
    """Centralized runtime policy gate for agent execution modes."""

    def __init__(self) -> None:
        self._client = None

    def ensure_runtime_allowed(self) -> None:
        if settings.agent_runtime_mode in {"in_process", "sandbox", "container"}:
            return
        raise HTTPException(
            status_code=500,
            detail=f"Unknown agent runtime mode: {settings.agent_runtime_mode}",
        )

    async def create_message(
        self,
        *,
        model: str,
        max_tokens: int,
        system: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> dict:
        self.ensure_runtime_allowed()
        if settings.agent_runtime_mode == "in_process":
            response = await self._create_message_in_process(
                model=model,
                max_tokens=max_tokens,
                system=system,
                messages=messages,
                tools=tools,
            )
            return response
        if settings.agent_runtime_mode == "sandbox":
            return await self._create_message_sandbox(
                model=model,
                max_tokens=max_tokens,
                system=system,
                messages=messages,
                tools=tools,
            )
        return await self._create_message_container(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
            tools=tools,
        )

    def _get_anthropic_client(self):
        if self._client is None:
            try:
                import anthropic
                self._client = anthropic.AsyncAnthropic(
                    api_key=settings.anthropic_api_key
                )
            except ImportError:
                raise RuntimeError(
                    "anthropic package not installed. Run: uv pip install anthropic"
                )
            if not settings.anthropic_api_key:
                raise RuntimeError(
                    "STRATA_ANTHROPIC_API_KEY not configured"
                )
        return self._client

    async def _create_message_in_process(
        self,
        *,
        model: str,
        max_tokens: int,
        system: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> dict:
        client = self._get_anthropic_client()
        response = await client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=messages,
            tools=tools,
        )
        return self._normalize_response(response)

    async def _create_message_sandbox(
        self,
        *,
        model: str,
        max_tokens: int,
        system: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> dict:
        import asyncio
        import sys

        runner = settings.agent_runtime_command
        if not runner:
            raise HTTPException(
                status_code=501,
                detail="Sandbox runtime is not configured (STRATA_AGENT_RUNTIME_COMMAND).",
            )

        parts = runner.split(" ")
        if parts[0] == "python":
            parts = [sys.executable, *parts[1:]]
        process = await asyncio.create_subprocess_exec(
            *parts,
            stdin=asyncio.subprocess.PIPE,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        payload = {
            "model": model,
            "max_tokens": max_tokens,
            "system": system,
            "messages": messages,
            "tools": tools,
        }
        stdout, stderr = await process.communicate(
            input=json.dumps(payload).encode("utf-8")
        )
        if process.returncode != 0:
            raise HTTPException(
                status_code=500,
                detail=f"Sandbox runtime failed: {stderr.decode('utf-8')}",
            )
        return json.loads(stdout.decode("utf-8"))

    async def _create_message_container(
        self,
        *,
        model: str,
        max_tokens: int,
        system: str,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> dict:
        import asyncio
        import tempfile

        command = settings.agent_container_command
        if not command:
            raise HTTPException(
                status_code=501,
                detail="Container runtime is not configured (STRATA_AGENT_CONTAINER_COMMAND).",
            )

        payload = {
            "model": model,
            "max_tokens": max_tokens,
            "system": system,
            "messages": messages,
            "tools": tools,
        }

        with tempfile.TemporaryDirectory() as temp_dir:
            request_path = f"{temp_dir}/request.json"
            response_path = f"{temp_dir}/response.json"
            with open(request_path, "w", encoding="utf-8") as handle:
                json.dump(payload, handle)

            process = await asyncio.create_subprocess_exec(
                *command.split(" "),
                request_path,
                response_path,
                stdin=asyncio.subprocess.DEVNULL,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE,
            )
            stdout, stderr = await process.communicate()
            if process.returncode != 0:
                raise HTTPException(
                    status_code=500,
                    detail=f"Container runtime failed: {stderr.decode('utf-8')}",
                )
            try:
                with open(response_path, "r", encoding="utf-8") as handle:
                    return json.load(handle)
            except FileNotFoundError as exc:
                raise HTTPException(
                    status_code=500,
                    detail=f"Container runtime did not write response. Output: {stdout.decode('utf-8')}",
                ) from exc

    @staticmethod
    def _normalize_response(response: Any) -> dict:
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
        return {
            "content": content,
            "stop_reason": response.stop_reason,
        }
