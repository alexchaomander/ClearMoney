import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.agent_session import Recommendation, RecommendationStatus
from app.models.connection import Connection
from app.models.decision_trace import DecisionTrace, DecisionTraceType
from app.models.user import User
from app.schemas.agent import (
    AgentContextResponse,
    BriefingNarrativeResponse,
    BriefingSummary,
    ContextQualityResponse,
    DecisionTracePayload,
    DecisionTraceResponse,
    ExecuteRecommendationRequest,
    ExecuteRecommendationResponse,
    FreshnessStatus,
    MetricTraceResponse,
)
from app.services.action_policy import ActionPolicyService
from app.services.agent_guardrails import evaluate_freshness
from app.services.briefing import AdvisorBriefingService
from app.services.brokerage_execution import BrokerageExecutionService
from app.services.context_quality import evaluate_context_quality
from app.services.deep_links import DeepLinkService
from app.services.financial_context import build_financial_context
from app.services.metric_trace import build_metric_trace
from app.services.narrative import NarrativeService
from app.services.plaid_transfer import PlaidTransferService
from app.services.portfolio_analysis import PortfolioAnalysisService
from app.services.recommendation_reviews import RecommendationReviewService
from app.core.config import settings

router = APIRouter(prefix="/agent", tags=["agent"])
AUDIT_SCOPES = ["decision_traces:read"]


async def _serialize_decision_trace(
    session: AsyncSession,
    trace: DecisionTrace,
    review_summary: dict | None = None,
) -> DecisionTraceResponse:
    raw_payload = (
        trace.outputs.get("trace") if isinstance(trace.outputs, dict) else None
    )
    trace_payload = None

    if isinstance(raw_payload, dict):
        payload_data = dict(raw_payload)

        # Fetch latest recommendation status if applicable
        if trace.recommendation_id:
            recommendation = await session.scalar(
                select(Recommendation).where(
                    Recommendation.id == trace.recommendation_id
                )
            )
            if recommendation:
                payload_data["recommendation_status"] = (
                    recommendation.status.value
                    if hasattr(recommendation.status, "value")
                    else str(recommendation.status)
                )
                if recommendation.superseded_by_recommendation_id:
                    # Find the trace ID for the superseding recommendation
                    superseding_trace_id = await session.scalar(
                        select(DecisionTrace.id).where(
                            DecisionTrace.recommendation_id
                            == recommendation.superseded_by_recommendation_id
                        )
                    )
                    if superseding_trace_id:
                        payload_data["superseded_by_trace_id"] = str(
                            superseding_trace_id
                        )
                    if recommendation.status == RecommendationStatus.superseded:
                        payload_data["superseded_at"] = (
                            recommendation.updated_at.isoformat()
                        )

        if review_summary:
            payload_data["review_summary"] = review_summary

        try:
            trace_payload = DecisionTracePayload.model_validate(payload_data)
        except Exception:
            trace_payload = None

    return DecisionTraceResponse(
        id=trace.id,
        session_id=trace.session_id,
        recommendation_id=trace.recommendation_id,
        trace_type=trace.trace_type.value
        if hasattr(trace.trace_type, "value")
        else str(trace.trace_type),
        input_data=trace.input_data,
        reasoning_steps=trace.reasoning_steps,
        outputs=trace.outputs,
        data_freshness=trace.data_freshness,
        warnings=trace.warnings,
        source=trace.source,
        created_at=trace.created_at,
        trace_payload=trace_payload,
    )


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

@router.get("/briefing", response_model=BriefingSummary)
async def get_advisor_briefing(
    user: User = Depends(require_scopes(["agent:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> BriefingSummary:
    """Get the Advisor continuity briefing, summarizing what changed since last login."""
    service = AdvisorBriefingService(session)
    data = await service.generate_briefing(user.id)
    return BriefingSummary(**data)


@router.get("/briefing-narrative", response_model=BriefingNarrativeResponse)
async def get_briefing_narrative(
    user: User = Depends(require_scopes(["agent:read", "portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> BriefingNarrativeResponse:
    """Generate an AI-driven briefing narrative based on recent portfolio metrics."""
    context = await build_financial_context(user.id, session)
    analysis_metrics = await PortfolioAnalysisService.analyze(session, user.id)
    narrative = await NarrativeService.generate_briefing_narrative(
        context, analysis_metrics
    )

    return BriefingNarrativeResponse(
        text=narrative, provider=settings.advisor_provider, model=settings.advisor_model
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
    summaries = await RecommendationReviewService(session).summarize_by_trace(
        user.id,
        [trace.id for trace in traces],
    )
    return [
        await _serialize_decision_trace(session, t, summaries.get(t.id)) for t in traces
    ]


@router.get("/metric-traces/{metric_id}", response_model=MetricTraceResponse)
async def get_metric_trace(
    metric_id: str,
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> MetricTraceResponse:
    try:
        return await build_metric_trace(user.id, metric_id, session)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/context-quality", response_model=ContextQualityResponse)
async def get_context_quality(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> ContextQualityResponse:
    context = await build_financial_context(user.id, session)
    connection_result = await session.execute(
        select(Connection).where(Connection.user_id == user.id)
    )
    connections = list(connection_result.scalars().all())
    return evaluate_context_quality(context, connections)


@router.post(
    "/recommendations/{recommendation_id}/execute",
    response_model=ExecuteRecommendationResponse,
    status_code=200,
)
async def execute_recommendation(
    recommendation_id: uuid.UUID,
    request: ExecuteRecommendationRequest,
    user: User = Depends(require_scopes(["agent:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> ExecuteRecommendationResponse:
    result = await session.execute(
        select(Recommendation).where(
            Recommendation.id == recommendation_id,
            Recommendation.user_id == user.id,
        )
    )
    recommendation = result.scalar_one_or_none()
    if not recommendation:
        raise HTTPException(status_code=404, detail="Recommendation not found")

    if recommendation.status in (
        RecommendationStatus.dismissed,
        RecommendationStatus.superseded,
        RecommendationStatus.blocked,
    ):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot execute a {recommendation.status.value} recommendation",
        )

    action_payload = request.payload or {}
    action_type = request.action
    amount = action_payload.get("amount") if isinstance(action_payload, dict) else None

    if action_type is not None and not isinstance(action_type, str):
        raise HTTPException(
            status_code=400,
            detail="Invalid action type in recommendation payload",
        )

    if request.connection_id is not None:
        connection_result = await session.execute(
            select(Connection).where(
                Connection.id == request.connection_id,
                Connection.user_id == user.id,
            )
        )
        if not connection_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Connection not found")

    if amount is not None:
        try:
            amount_value = float(amount)
        except (TypeError, ValueError) as exc:
            raise HTTPException(
                status_code=400, detail="Invalid amount in recommendation payload"
            ) from exc
        amount = amount_value
    policy_check = "completed"
    policy = ActionPolicyService(session)
    await policy.validate_action(
        user_id=user.id,
        action_type=action_type,
        amount=amount,
        payload={**action_payload, "action": action_type},
    )

    execution_status = "queued"
    execution_result = {
        "recommendation_title": recommendation.title,
        "policy_check": policy_check,
        "connection_id": str(request.connection_id) if request.connection_id else None,
    }

    # Handle specialized execution paths
    try:
        if action_type == "savings_transfer" and amount:
            transfer_service = PlaidTransferService(session)
            from_id = action_payload.get("from_account_id")
            to_id = action_payload.get("to_account_id")

            if not from_id or not to_id:
                raise HTTPException(
                    status_code=400,
                    detail="Missing source or destination account for transfer",
                )

            transfer = await transfer_service.initiate_transfer(
                user_id=user.id,
                from_account_id=from_id,
                to_account_id=to_id,
                amount=Decimal(str(amount)),
            )
            execution_status = transfer["status"]
            execution_result["transfer_details"] = transfer

        elif action_type == "rebalance_portfolio":
            brokerage_service = BrokerageExecutionService(session)
            account_id = action_payload.get("account_id")
            if not account_id:
                raise HTTPException(
                    status_code=400, detail="Missing account ID for portfolio rebalance"
                )
            trades = await brokerage_service.rebalance_portfolio(
                user.id, account_id, {}
            )
            execution_status = "accepted"
            execution_result["rebalance_trades"] = trades

        elif action_type == "open_account":
            deep_link_service = DeepLinkService()
            provider_id = action_payload.get("provider_id")
            if not provider_id:
                raise HTTPException(
                    status_code=400,
                    detail="Missing provider ID for open account action",
                )
            link = deep_link_service.generate_referral_link(
                provider_id, {"user_id": str(user.id)}
            )
            execution_status = "completed"
            execution_result["referral_link"] = link
    except NotImplementedError as exc:
        raise HTTPException(status_code=501, detail=str(exc)) from exc

    recommendation.status = RecommendationStatus.accepted
    trace = DecisionTrace(
        user_id=user.id,
        session_id=recommendation.session_id,
        recommendation_id=recommendation.id,
        trace_type=DecisionTraceType.action,
        input_data={
            "request": request.model_dump(),
            "recommendation_id": str(recommendation.id),
        },
        reasoning_steps=[],
        outputs={
            "action": action_type,
            "status": execution_status,
        },
        data_freshness={},
        warnings=[],
        source="api",
    )
    session.add(trace)
    await session.commit()
    await session.refresh(trace)
    await session.refresh(recommendation)

    execution_result["trace_id"] = str(trace.id)

    return ExecuteRecommendationResponse(
        recommendation_id=recommendation.id,
        action=action_type,
        status=execution_status,
        result=execution_result,
        trace_id=trace.id,
        updated_at=recommendation.updated_at,
    )


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
