import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_scopes
from app.db.session import get_async_session
from app.models.decision_trace import DecisionTrace
from app.models.user import User
from app.schemas.agent import AgentContextResponse, DecisionTraceResponse, FreshnessStatus
from app.services.agent_guardrails import evaluate_freshness
from app.services.financial_context import build_financial_context

router = APIRouter(prefix="/agent", tags=["agent"])
AUDIT_SCOPES = ["decision_traces:read"]


@router.get("/context", response_model=AgentContextResponse)
async def get_agent_context(
    user: User = Depends(require_scopes(["agent:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> AgentContextResponse:
    context = await build_financial_context(user.id, session)
    freshness = evaluate_freshness(context)
    return AgentContextResponse(
        allowed=freshness["is_fresh"],
        freshness=FreshnessStatus(**freshness),
        context=context,
    )


@router.get("/portfolio-metrics", response_model=AgentContextResponse)
async def get_portfolio_metrics(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> AgentContextResponse:
    context = await build_financial_context(user.id, session)
    freshness = evaluate_freshness(context)
    portfolio_metrics = context.get("portfolio_metrics", {})
    return AgentContextResponse(
        allowed=freshness["is_fresh"],
        freshness=FreshnessStatus(**freshness),
        context={"portfolio_metrics": portfolio_metrics},
    )


@router.get("/decision-traces", response_model=list[DecisionTraceResponse])
async def list_decision_traces(
    session_id: uuid.UUID | None = Query(default=None),
    recommendation_id: uuid.UUID | None = Query(default=None),
    user: User = Depends(require_scopes(AUDIT_SCOPES)),
    session: AsyncSession = Depends(get_async_session),
) -> list[DecisionTraceResponse]:
    query = select(DecisionTrace).where(DecisionTrace.user_id == user.id)
    if session_id:
        query = query.where(DecisionTrace.session_id == session_id)
    if recommendation_id:
        query = query.where(DecisionTrace.recommendation_id == recommendation_id)
    result = await session.execute(query.order_by(DecisionTrace.created_at.desc()))
    traces = result.scalars().all()
    return [DecisionTraceResponse.model_validate(t) for t in traces]


@router.get("/audit-summary")
async def get_audit_summary(
    user: User = Depends(require_scopes(AUDIT_SCOPES)),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    result = await session.execute(
        select(DecisionTrace).where(DecisionTrace.user_id == user.id)
    )
    traces = result.scalars().all()
    warning_count = sum(1 for trace in traces if trace.warnings)
    total = len(traces)
    return {
        "total_traces": total,
        "traces_with_warnings": warning_count,
        "warning_rate": round(warning_count / total, 2) if total else 0.0,
    }
