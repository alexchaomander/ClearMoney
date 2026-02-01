"""Financial Advisor agent service — orchestrates Claude conversations with tools."""

import json
import logging
import uuid
from collections.abc import AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.agent_session import (
    AgentSession,
    Recommendation,
    RecommendationStatus,
    SessionStatus,
)
from app.models.financial_memory import FinancialMemory
from app.models.memory_event import MemoryEvent, MemoryEventSource
from app.services.context_renderer import render_context_as_markdown
from app.services.financial_context import build_financial_context
from app.services.skill_registry import get_skill_registry

logger = logging.getLogger(__name__)

# Tools available to the advisor during conversation
ADVISOR_TOOLS = [
    {
        "name": "get_financial_context",
        "description": "Get the user's complete financial context including profile, accounts, holdings, and portfolio metrics.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "update_memory",
        "description": "Update a field in the user's financial memory/profile. Use this when the user provides new financial information during the conversation.",
        "input_schema": {
            "type": "object",
            "properties": {
                "field_name": {
                    "type": "string",
                    "description": "The memory field to update (e.g., 'retirement_age', 'monthly_savings_target')",
                },
                "value": {
                    "type": "string",
                    "description": "The new value as a string",
                },
                "reason": {
                    "type": "string",
                    "description": "Why this update is being made",
                },
            },
            "required": ["field_name", "value", "reason"],
        },
    },
    {
        "name": "create_recommendation",
        "description": "Save a formal recommendation for the user. Use this when you have a concrete, actionable suggestion.",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Short title for the recommendation",
                },
                "summary": {
                    "type": "string",
                    "description": "1-2 sentence summary of what to do",
                },
                "details": {
                    "type": "object",
                    "description": "Structured details (numbers, timelines, etc.)",
                },
            },
            "required": ["title", "summary"],
        },
    },
]


class FinancialAdvisor:
    def __init__(self, session: AsyncSession):
        self._session = session
        self._client = None

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

    async def start_session(
        self,
        user_id: uuid.UUID,
        skill_name: str | None = None,
    ) -> AgentSession:
        """Start a new advisor session."""
        agent_session = AgentSession(
            user_id=user_id,
            skill_name=skill_name,
            status=SessionStatus.active,
            messages=[],
        )
        self._session.add(agent_session)
        await self._session.commit()
        await self._session.refresh(agent_session)
        return agent_session

    async def send_message(
        self,
        session_id: uuid.UUID,
        user_id: uuid.UUID,
        user_message: str,
    ) -> AsyncGenerator[str, None]:
        """Send a message and stream the response.

        Yields chunks of assistant text as they arrive.
        Handles tool calls internally (memory updates, recommendations).
        """
        # Load session
        result = await self._session.execute(
            select(AgentSession).where(
                AgentSession.id == session_id,
                AgentSession.user_id == user_id,
            )
        )
        agent_session = result.scalar_one_or_none()
        if not agent_session:
            raise ValueError("Session not found")

        # Build system prompt
        system_prompt = await self._build_system_prompt(user_id, agent_session.skill_name)

        # Append user message
        messages = list(agent_session.messages)
        messages.append({"role": "user", "content": user_message})

        client = self._get_anthropic_client()

        # Claude API call with tool use (loop for tool call handling)
        full_response = ""
        max_iterations = 5
        iteration = 0

        while iteration < max_iterations:
            iteration += 1

            response = await client.messages.create(
                model=settings.advisor_model,
                max_tokens=settings.advisor_max_tokens,
                system=system_prompt,
                messages=messages,
                tools=ADVISOR_TOOLS,
            )

            # Process response content blocks
            has_tool_use = False
            assistant_content = []

            for block in response.content:
                if block.type == "text":
                    full_response += block.text
                    assistant_content.append({
                        "type": "text",
                        "text": block.text,
                    })
                    yield block.text

                elif block.type == "tool_use":
                    has_tool_use = True
                    assistant_content.append({
                        "type": "tool_use",
                        "id": block.id,
                        "name": block.name,
                        "input": block.input,
                    })

                    # Handle tool call
                    tool_result = await self._handle_tool_call(
                        user_id, session_id, block.name, block.input
                    )

                    # Yield tool call info for frontend visualization
                    yield f"\n[TOOL:{block.name}:{json.dumps(tool_result)}]\n"

                    # Add assistant message with tool use and tool result
                    messages.append({"role": "assistant", "content": assistant_content})
                    messages.append({
                        "role": "user",
                        "content": [{
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": json.dumps(tool_result),
                        }],
                    })
                    assistant_content = []
                    break

            if not has_tool_use:
                # No more tool calls, add final assistant message
                messages.append({"role": "assistant", "content": assistant_content})
                break

        # Save messages to session
        agent_session.messages = messages
        if response.stop_reason == "end_turn":
            agent_session.status = SessionStatus.active
        await self._session.commit()

    async def _build_system_prompt(
        self, user_id: uuid.UUID, skill_name: str | None
    ) -> str:
        """Build the system prompt from context and optional skill."""
        parts = [
            "You are ClearMoney's Financial Advisor, an AI assistant that helps users "
            "understand and improve their financial situation. You have access to the "
            "user's financial data and can update their profile, create recommendations, "
            "and run calculations.",
            "",
            "IMPORTANT GUIDELINES:",
            "- Never recommend specific securities, funds, or financial products",
            "- Always caveat that your analysis is educational, not financial advice",
            "- Be concise and actionable in your responses",
            "- Use the user's actual data whenever possible",
            "- Flag when data is missing or stale",
        ]

        # Add skill-specific instructions
        if skill_name:
            registry = get_skill_registry()
            skill = registry.get_skill(skill_name)
            if skill:
                parts.append("")
                parts.append(f"## Current Skill: {skill.display_name}")
                parts.append(skill.content)

        # Add financial context
        context = await build_financial_context(user_id, self._session)
        context_md = render_context_as_markdown(context)

        parts.append("")
        parts.append("## User's Financial Data")
        parts.append(context_md)

        return "\n".join(parts)

    async def _handle_tool_call(
        self,
        user_id: uuid.UUID,
        session_id: uuid.UUID,
        tool_name: str,
        tool_input: dict,
    ) -> dict:
        """Dispatch tool calls from the advisor."""
        if tool_name == "get_financial_context":
            context = await build_financial_context(user_id, self._session)
            return context

        elif tool_name == "update_memory":
            return await self._handle_update_memory(
                user_id, tool_input
            )

        elif tool_name == "create_recommendation":
            return await self._handle_create_recommendation(
                user_id, session_id, tool_input
            )

        return {"error": f"Unknown tool: {tool_name}"}

    async def _handle_update_memory(
        self, user_id: uuid.UUID, tool_input: dict
    ) -> dict:
        field_name = tool_input.get("field_name", "")
        value = tool_input.get("value", "")
        reason = tool_input.get("reason", "")

        # Load memory
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()
        if not memory:
            return {"error": "No financial memory found"}

        if not hasattr(memory, field_name):
            return {"error": f"Unknown field: {field_name}"}

        old_value = getattr(memory, field_name)
        setattr(memory, field_name, value)

        # Log event
        self._session.add(
            MemoryEvent(
                user_id=user_id,
                field_name=field_name,
                old_value=str(old_value) if old_value is not None else None,
                new_value=value,
                source=MemoryEventSource.agent,
                context=reason,
            )
        )

        await self._session.commit()
        return {"status": "updated", "field": field_name, "value": value}

    async def _handle_create_recommendation(
        self,
        user_id: uuid.UUID,
        session_id: uuid.UUID,
        tool_input: dict,
    ) -> dict:
        # Get skill name from session
        result = await self._session.execute(
            select(AgentSession).where(AgentSession.id == session_id)
        )
        agent_session = result.scalar_one_or_none()

        rec = Recommendation(
            user_id=user_id,
            session_id=session_id,
            skill_name=agent_session.skill_name or "general",
            title=tool_input.get("title", ""),
            summary=tool_input.get("summary", ""),
            details=tool_input.get("details", {}),
            status=RecommendationStatus.pending,
        )
        self._session.add(rec)
        await self._session.commit()
        await self._session.refresh(rec)

        return {
            "status": "created",
            "recommendation_id": str(rec.id),
            "title": rec.title,
        }
