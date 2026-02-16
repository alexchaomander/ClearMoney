import uuid
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.connection import Connection
from app.models.decision_trace import DecisionTrace, DecisionTraceType
from app.models.user import User
from app.models.agent_session import Recommendation, RecommendationStatus
from app.schemas.agent import (
    AgentContextResponse,
    DecisionTraceResponse,
    ExecuteRecommendationRequest,
    ExecuteRecommendationResponse,
    FreshnessStatus,
)
from app.services.agent_guardrails import evaluate_freshness
from app.services.action_policy import ActionPolicyService
from app.services.financial_context import build_financial_context
from app.services.plaid_transfer import PlaidTransferService
from app.services.brokerage_execution import BrokerageExecutionService
from app.services.deep_links import DeepLinkService

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

    if recommendation.status == RecommendationStatus.dismissed:
        raise HTTPException(status_code=409, detail="Cannot execute a dismissed recommendation")

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
            raise HTTPException(status_code=400, detail="Invalid amount in recommendation payload") from exc
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
    if action_type == "savings_transfer" and amount:
        transfer_service = PlaidTransferService(session)
        from_id = action_payload.get("from_account_id")
        to_id = action_payload.get("to_account_id")
        
        if not from_id or not to_id:
            raise HTTPException(status_code=400, detail="Missing source or destination account for transfer")
        
        transfer = await transfer_service.initiate_transfer(
            user_id=user.id,
            from_account_id=from_id,
            to_account_id=to_id,
            amount=Decimal(str(amount))
        )
        execution_status = transfer["status"]
        execution_result["transfer_details"] = transfer

    elif action_type == "rebalance_portfolio":
        brokerage_service = BrokerageExecutionService(session)
        account_id = action_payload.get("account_id") or "robinhood_001"
        trades = await brokerage_service.rebalance_portfolio(user.id, account_id, {})
        execution_status = "accepted"
        execution_result["rebalance_trades"] = trades

    elif action_type == "open_account":
        deep_link_service = DeepLinkService()
        provider_id = action_payload.get("provider_id") or "amex_gold"
        link = deep_link_service.generate_referral_link(provider_id, {"user_id": str(user.id)})
        execution_status = "completed"
        execution_result["referral_link"] = link

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
    session.add(trace)
    await session.commit()
    await session.refresh(trace)
    await session.refresh(recommendation)

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
