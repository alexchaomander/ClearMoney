"""Financial Advisor agent service — orchestrates Claude conversations with tools."""

import json
import logging
import uuid
from collections.abc import AsyncGenerator

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

from app.core.config import settings
from app.models.agent_session import (
    AgentSession,
    Recommendation,
    RecommendationStatus,
    SessionStatus,
)
from app.models.decision_trace import DecisionTrace, DecisionTraceType
from app.models.financial_memory import FinancialMemory, FilingStatus, RiskTolerance
from app.models.memory_event import MemoryEvent, MemoryEventSource
from app.services.agent_guardrails import evaluate_freshness
from app.services.agent_runtime import AgentRuntime
from app.services.action_policy import ActionPolicyService
from app.services.context_renderer import render_context_as_markdown
from app.services.decision_engine import run_deterministic_checks
from app.services.financial_context import build_financial_context
from app.services.skill_registry import get_skill_registry

logger = logging.getLogger(__name__)

# Allowlist of fields the advisor can update on FinancialMemory.
# Excludes id, user_id, created_at, updated_at and other internal columns.
_UPDATABLE_MEMORY_FIELDS = {
    "age",
    "state",
    "filing_status",
    "num_dependents",
    "annual_income",
    "monthly_income",
    "income_growth_rate",
    "federal_tax_rate",
    "state_tax_rate",
    "capital_gains_rate",
    "retirement_age",
    "current_retirement_savings",
    "monthly_retirement_contribution",
    "employer_match_pct",
    "expected_social_security",
    "desired_retirement_income",
    "home_value",
    "mortgage_balance",
    "mortgage_rate",
    "monthly_rent",
    "risk_tolerance",
    "investment_horizon_years",
    "monthly_savings_target",
    "average_monthly_expenses",
    "emergency_fund_target_months",
    "spending_categories_monthly",
    "debt_profile",
    "portfolio_summary",
    "equity_compensation",
    "notes",
}

# Type mapping for coercing string values from the LLM into correct Python types.
_INT_FIELDS = {"age", "num_dependents", "retirement_age", "investment_horizon_years", "emergency_fund_target_months"}
_DECIMAL_FIELDS = {
    "annual_income", "monthly_income", "income_growth_rate",
    "federal_tax_rate", "state_tax_rate", "capital_gains_rate",
    "current_retirement_savings", "monthly_retirement_contribution",
    "employer_match_pct", "expected_social_security", "desired_retirement_income",
    "home_value", "mortgage_balance", "mortgage_rate", "monthly_rent",
    "monthly_savings_target", "average_monthly_expenses",
}
_ENUM_FIELDS: dict[str, type] = {
    "filing_status": FilingStatus,
    "risk_tolerance": RiskTolerance,
}


def _coerce_memory_value(field_name: str, value: str) -> object:
    """Coerce a string value from the LLM to the correct Python type for the field."""
    if field_name in _INT_FIELDS:
        return int(value)
    if field_name in _DECIMAL_FIELDS:
        from decimal import Decimal
        return Decimal(value)
    if field_name in _ENUM_FIELDS:
        return _ENUM_FIELDS[field_name](value)
    if field_name == "state":
        return str(value).upper()[:2]
    if field_name in {
        "notes",
        "spending_categories_monthly",
        "debt_profile",
        "portfolio_summary",
        "equity_compensation",
    }:
        if isinstance(value, dict):
            return value
        if isinstance(value, str):
            try:
                return json.loads(value)
            except json.JSONDecodeError:
                return {"value": value}
        return {"value": value}
    return value


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
                "rationale": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Key reasoning steps used to reach the recommendation.",
                },
                "data_used": {
                    "type": "object",
                    "description": "Data points or context used in the recommendation.",
                },
                "freshness_summary": {
                    "type": "object",
                    "description": "Summary of data freshness or known gaps.",
                },
                "warnings": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Any risk or confidence warnings to show the user.",
                },
                "trace": {
                    "type": "object",
                    "description": "Structured decision trace payload (inputs, rules, assumptions, confidence).",
                },
                "confidence": {
                    "type": "number",
                    "description": "Confidence score from 0 to 1 for the recommendation.",
                },
            },
            "required": ["title", "summary"],
        },
    },
    {
        "name": "get_portfolio_metrics",
        "description": "Get the user's current portfolio allocation percentages, top holdings, and performance metrics.",
        "input_schema": {
            "type": "object",
            "properties": {},
            "required": [],
        },
    },
    {
        "name": "calculate",
        "description": "Run a financial calculation. Supported calculators: compound_growth, loan_payment, retirement_gap, savings_goal.",
        "input_schema": {
            "type": "object",
            "properties": {
                "calculator": {
                    "type": "string",
                    "description": "Which calculator to run: compound_growth, loan_payment, retirement_gap, savings_goal",
                },
                "inputs": {
                    "type": "object",
                    "description": "Calculator-specific inputs as key-value pairs",
                },
            },
            "required": ["calculator", "inputs"],
        },
    },
    {
        "name": "ask_user",
        "description": "Ask the user a clarifying question. Use when you need more information before making a recommendation.",
        "input_schema": {
            "type": "object",
            "properties": {
                "question": {
                    "type": "string",
                    "description": "The question to ask the user",
                },
                "options": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional list of suggested answers",
                },
            },
            "required": ["question"],
        },
    },
]


class FinancialAdvisor:
    def __init__(self, session: AsyncSession):
        self._session = session
        self._client = None
        self._runtime = AgentRuntime()

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
        self._runtime.ensure_runtime_allowed()
        system_prompt = await self._build_system_prompt(user_id, agent_session.skill_name)

        # Append user message
        messages = list(agent_session.messages)
        messages.append({"role": "user", "content": user_message})

        # Claude API call with tool use (loop for tool call handling)
        full_response = ""
        max_iterations = 5
        iteration = 0
        created_recommendation = False

        while iteration < max_iterations:
            iteration += 1

            response = await self._runtime.create_message(
                model=settings.advisor_model,
                max_tokens=settings.advisor_max_tokens,
                system=system_prompt,
                messages=messages,
                tools=ADVISOR_TOOLS,
            )

            # Process response content blocks
            has_tool_use = False
            assistant_content = []

            for block in response["content"]:
                if block["type"] == "text":
                    full_response += block["text"]
                    assistant_content.append({
                        "type": "text",
                        "text": block["text"],
                    })
                    yield block["text"]

                elif block["type"] == "tool_use":
                    has_tool_use = True
                    assistant_content.append({
                        "type": "tool_use",
                        "id": block["id"],
                        "name": block["name"],
                        "input": block["input"],
                    })

                    # Handle tool call
                    tool_result = await self._handle_tool_call(
                        user_id, session_id, block["name"], block["input"]
                    )
                    if block["name"] == "create_recommendation":
                        created_recommendation = True

                    # Yield tool call info for frontend visualization
                    yield f"\n[TOOL:{block['name']}:{json.dumps(tool_result)}]\n"

                    # Add assistant message with tool use and tool result
                    messages.append({"role": "assistant", "content": assistant_content})
                    messages.append({
                        "role": "user",
                        "content": [{
                            "type": "tool_result",
                            "tool_use_id": block["id"],
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
        if response.get("stop_reason") == "end_turn":
            agent_session.status = SessionStatus.active
        await self._session.commit()

        if not created_recommendation and full_response.strip():
            context = await build_financial_context(user_id, self._session)
            freshness_status = evaluate_freshness(context)
            warning = freshness_status.get("warning")
            deterministic = run_deterministic_checks(context)
            rule_checks = self._build_rule_checks(context, freshness_status) + deterministic["rules_applied"]
            assumptions = self._build_assumptions(context) + deterministic["assumptions"]
            trace = DecisionTrace(
                user_id=user_id,
                session_id=session_id,
                recommendation_id=None,
                trace_type=DecisionTraceType.analysis,
                input_data={"user_message": user_message, "profile": context.get("profile", {})},
                reasoning_steps=[],
                outputs={
                    "assistant_response": full_response,
                    "trace": {
                        "rules_applied": rule_checks,
                        "assumptions": assumptions,
                        "freshness": freshness_status,
                        "deterministic": deterministic,
                    },
                },
                data_freshness=context.get("data_freshness", {}),
                warnings=[warning] if warning else [],
                source="advisor",
            )
            self._session.add(trace)
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
            "- Monitor 'Emergency Fund Runway' and suggest building cash reserves if < 3 months",
            "- When calling create_recommendation, include data_used, rationale, warnings, and a trace object with rules/assumptions/confidence",
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
        freshness_status = evaluate_freshness(context)
        if not freshness_status["is_fresh"]:
            warning = freshness_status["warning"]
            if warning:
                parts.append("")
                parts.append("## Data Freshness Warning")
                parts.append(warning)

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

        elif tool_name == "get_portfolio_metrics":
            return await self._handle_get_portfolio_metrics(user_id)

        elif tool_name == "calculate":
            return self._handle_calculate(tool_input)

        elif tool_name == "ask_user":
            return self._handle_ask_user(tool_input)

        return {"error": f"Unknown tool: {tool_name}"}

    async def _handle_update_memory(
        self, user_id: uuid.UUID, tool_input: dict
    ) -> dict:
        field_name = tool_input.get("field_name", "")
        value = tool_input.get("value", "")
        reason = tool_input.get("reason", "")

        # Validate against allowlist
        if field_name not in _UPDATABLE_MEMORY_FIELDS:
            return {"error": f"Unknown or protected field: {field_name}"}

        # Load or create memory
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()
        if not memory:
            memory = FinancialMemory(user_id=user_id)
            self._session.add(memory)
            await self._session.flush()

        # Coerce the string value to the correct type
        try:
            coerced_value = _coerce_memory_value(field_name, value)
        except (ValueError, TypeError, KeyError) as e:
            return {"error": f"Invalid value for {field_name}: {e}"}

        old_value = getattr(memory, field_name)
        setattr(memory, field_name, coerced_value)

        # Log event
        self._session.add(
            MemoryEvent(
                user_id=user_id,
                field_name=field_name,
                old_value=str(old_value) if old_value is not None else None,
                new_value=str(coerced_value),
                source=MemoryEventSource.agent,
                context=reason,
            )
        )

        await self._session.commit()
        return {"status": "updated", "field": field_name, "value": str(coerced_value)}

    async def _handle_create_recommendation(
        self,
        user_id: uuid.UUID,
        session_id: uuid.UUID,
        tool_input: dict,
    ) -> dict:
        context = await build_financial_context(user_id, self._session)
        freshness_status = evaluate_freshness(context)
        deterministic = run_deterministic_checks(context)
        rule_checks = self._build_rule_checks(context, freshness_status) + deterministic["rules_applied"]
        assumptions = self._build_assumptions(context) + deterministic["assumptions"]

        # Get skill name from session
        result = await self._session.execute(
            select(AgentSession).where(AgentSession.id == session_id)
        )
        agent_session = result.scalar_one_or_none()
        if not agent_session:
            return {"error": f"Session {session_id} not found"}

        details = tool_input.get("details", {})
        action = details.get("action") if isinstance(details, dict) else None
        if action and isinstance(action, dict):
            action_type = action.get("type")
            amount = action.get("amount")
            if action_type:
                policy = ActionPolicyService(self._session)
                try:
                    await policy.validate_action(
                        user_id=user_id,
                        action_type=action_type,
                        amount=amount,
                        payload=action,
                    )
                except HTTPException as exc:
                    return {"error": exc.detail}

        rec = Recommendation(
            user_id=user_id,
            session_id=session_id,
            skill_name=agent_session.skill_name or "general",
            title=tool_input.get("title", ""),
            summary=tool_input.get("summary", ""),
            details=details,
            status=RecommendationStatus.pending,
        )
        self._session.add(rec)
        await self._session.commit()
        await self._session.refresh(rec)

        data_used = tool_input.get("data_used") or {}
        if "portfolio_metrics" not in data_used:
            data_used["portfolio_metrics"] = context.get("portfolio_metrics", {})
        if "profile" not in data_used:
            data_used["profile"] = context.get("profile", {})

        trace_payload = tool_input.get("trace") or {}
        trace_payload.setdefault("rules_applied", rule_checks)
        trace_payload.setdefault("assumptions", assumptions)
        trace_payload.setdefault("confidence", tool_input.get("confidence"))
        trace_payload.setdefault("freshness", freshness_status)
        trace_payload.setdefault("deterministic", deterministic)

        trace = DecisionTrace(
            user_id=user_id,
            session_id=session_id,
            recommendation_id=rec.id,
            trace_type=DecisionTraceType.recommendation,
            input_data=data_used,
            reasoning_steps=tool_input.get("rationale", []),
            outputs={
                "title": rec.title,
                "summary": rec.summary,
                "details": rec.details,
                "trace": trace_payload,
            },
            data_freshness=tool_input.get("freshness_summary", freshness_status),
            warnings=tool_input.get("warnings", []),
            source="advisor",
        )
        self._session.add(trace)
        await self._session.commit()

        return {
            "status": "created",
            "recommendation_id": str(rec.id),
            "title": rec.title,
        }

    async def _handle_get_portfolio_metrics(self, user_id: uuid.UUID) -> dict:
        """Return portfolio allocation and top holdings."""
        context = await build_financial_context(user_id, self._session)
        holdings = context.get("holdings", [])
        metrics = context.get("portfolio_metrics", {})

        # Compute allocation by asset type if holdings exist
        allocation: dict[str, float] = {}
        total_value = sum(float(h.get("market_value", 0)) for h in holdings)
        if total_value > 0:
            for h in holdings:
                asset_type = h.get("security_type", "other")
                allocation[asset_type] = allocation.get(asset_type, 0) + float(
                    h.get("market_value", 0)
                )
            allocation = {k: round(v / total_value * 100, 1) for k, v in allocation.items()}

        return {
            "net_worth": metrics.get("net_worth"),
            "total_investment_value": metrics.get("total_investment_value"),
            "total_cash": metrics.get("total_cash"),
            "total_debt": metrics.get("total_debt"),
            "allocation_pct": allocation,
            "top_holdings": holdings[:10],
            "holding_count": len(holdings),
        }

    @staticmethod
    def _build_rule_checks(context: dict, freshness_status: dict) -> list[dict]:
        metrics = context.get("portfolio_metrics", {}) or {}
        rules: list[dict] = []

        runway = metrics.get("runway_months")
        if runway is not None:
            rules.append({
                "name": "Emergency fund runway >= 3 months",
                "passed": runway >= 3,
                "value": runway,
            })

        total_debt = metrics.get("total_debt_value")
        if total_debt is not None:
            rules.append({
                "name": "No revolving debt balance",
                "passed": total_debt <= 0,
                "value": total_debt,
            })

        total_investment = metrics.get("total_investment_value") or 0
        tax_advantaged = metrics.get("tax_advantaged_value")
        if tax_advantaged is not None and total_investment:
            ratio = tax_advantaged / total_investment if total_investment else 0
            rules.append({
                "name": "Tax-advantaged share >= 40%",
                "passed": ratio >= 0.4,
                "value": round(ratio, 2),
            })

        if freshness_status.get("warning"):
            rules.append({
                "name": "Data freshness within policy",
                "passed": bool(freshness_status.get("is_fresh")),
                "value": freshness_status.get("age_hours"),
            })

        return rules

    @staticmethod
    def _build_assumptions(context: dict) -> list[str]:
        profile = context.get("profile", {}) or {}
        assumptions = []
        if not profile.get("average_monthly_expenses"):
            assumptions.append("Monthly expenses missing; runway uses available cash only.")
        if not profile.get("annual_income") and not profile.get("monthly_income"):
            assumptions.append("Income not provided; contribution guidance may be incomplete.")
        if not profile.get("risk_tolerance"):
            assumptions.append("Risk tolerance not set; recommendations default to moderate risk.")
        if not context.get("accounts", {}).get("investment"):
            assumptions.append("No investment accounts connected; allocations may be incomplete.")
        return assumptions

    @staticmethod
    def _handle_calculate(tool_input: dict) -> dict:
        """Run a built-in financial calculation."""
        calculator = tool_input.get("calculator", "")
        inputs = tool_input.get("inputs", {})

        try:
            if calculator == "compound_growth":
                principal = float(inputs.get("principal", 0))
                monthly_contribution = float(inputs.get("monthly_contribution", 0))
                annual_rate = float(inputs.get("annual_rate", 7)) / 100
                years = int(inputs.get("years", 10))

                monthly_rate = annual_rate / 12
                months = years * 12
                balance = principal
                for _ in range(months):
                    balance = balance * (1 + monthly_rate) + monthly_contribution

                total_contributions = principal + monthly_contribution * months
                return {
                    "calculator": "compound_growth",
                    "final_balance": round(balance, 2),
                    "total_contributions": round(total_contributions, 2),
                    "total_growth": round(balance - total_contributions, 2),
                }

            elif calculator == "loan_payment":
                principal = float(inputs.get("principal", 0))
                annual_rate = float(inputs.get("annual_rate", 5)) / 100
                years = int(inputs.get("years", 30))

                monthly_rate = annual_rate / 12
                months = years * 12
                if monthly_rate == 0:
                    payment = principal / months
                else:
                    payment = principal * (monthly_rate * (1 + monthly_rate) ** months) / (
                        (1 + monthly_rate) ** months - 1
                    )

                total_paid = payment * months
                return {
                    "calculator": "loan_payment",
                    "monthly_payment": round(payment, 2),
                    "total_paid": round(total_paid, 2),
                    "total_interest": round(total_paid - principal, 2),
                }

            elif calculator == "retirement_gap":
                current_savings = float(inputs.get("current_savings", 0))
                monthly_contribution = float(inputs.get("monthly_contribution", 0))
                years_to_retirement = int(inputs.get("years_to_retirement", 30))
                annual_return = float(inputs.get("annual_return", 7)) / 100
                desired_annual_income = float(inputs.get("desired_annual_income", 60000))
                withdrawal_rate = float(inputs.get("withdrawal_rate", 4)) / 100

                monthly_rate = annual_return / 12
                months = years_to_retirement * 12
                balance = current_savings
                for _ in range(months):
                    balance = balance * (1 + monthly_rate) + monthly_contribution

                needed = desired_annual_income / withdrawal_rate if withdrawal_rate > 0 else 0
                gap = needed - balance

                return {
                    "calculator": "retirement_gap",
                    "projected_savings": round(balance, 2),
                    "needed_for_goal": round(needed, 2),
                    "gap": round(gap, 2),
                    "on_track": gap <= 0,
                }

            elif calculator == "savings_goal":
                goal = float(inputs.get("goal", 10000))
                current = float(inputs.get("current", 0))
                monthly = float(inputs.get("monthly_contribution", 500))
                annual_rate = float(inputs.get("annual_rate", 5)) / 100

                if monthly <= 0:
                    return {"calculator": "savings_goal", "months": -1, "error": "Monthly contribution must be positive"}

                monthly_rate = annual_rate / 12
                balance = current
                months = 0
                max_months = 600  # 50 years cap

                while balance < goal and months < max_months:
                    balance = balance * (1 + monthly_rate) + monthly
                    months += 1

                return {
                    "calculator": "savings_goal",
                    "months_to_goal": months,
                    "years_to_goal": round(months / 12, 1),
                    "final_balance": round(balance, 2),
                    "total_contributed": round(current + monthly * months, 2),
                }

            else:
                return {"error": f"Unknown calculator: {calculator}. Supported: compound_growth, loan_payment, retirement_gap, savings_goal"}

        except (ValueError, TypeError, ZeroDivisionError) as e:
            return {"error": f"Calculation error: {e}"}

    @staticmethod
    def _handle_ask_user(tool_input: dict) -> dict:
        """Format a clarifying question to present to the user.

        The question is returned as a tool result so the frontend can render it
        as a structured prompt rather than inline text.
        """
        question = tool_input.get("question", "")
        options = tool_input.get("options", [])
        return {
            "type": "question",
            "question": question,
            "options": options,
        }
