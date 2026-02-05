import uuid

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_scopes
from app.db.session import get_async_session
from app.models.agent_session import AgentSession, Recommendation
from app.models.user import User
from app.schemas.advisor import (
    MessageRequest,
    RecommendationResponse,
    SessionCreateRequest,
    SessionResponse,
    SessionSummaryResponse,
)
from app.services.financial_advisor import FinancialAdvisor

router = APIRouter(prefix="/advisor", tags=["advisor"])

ADVISOR_DATA_SCOPES = [
    "agent:read",
    "portfolio:read",
    "transactions:read",
    "accounts:read",
    "memory:read",
]


@router.post("/sessions", response_model=SessionResponse, status_code=201)
async def create_session(
    data: SessionCreateRequest,
    user: User = Depends(require_scopes(ADVISOR_DATA_SCOPES)),
    session: AsyncSession = Depends(get_async_session),
) -> SessionResponse:
    """Start a new advisor session, optionally with a specific skill."""
    advisor = FinancialAdvisor(session)
    agent_session = await advisor.start_session(user.id, data.skill_name)
    return SessionResponse.model_validate(agent_session)


@router.get("/sessions", response_model=list[SessionSummaryResponse])
async def list_sessions(
    user: User = Depends(require_scopes(["agent:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[SessionSummaryResponse]:
    """List the user's advisor sessions."""
    result = await session.execute(
        select(AgentSession)
        .where(AgentSession.user_id == user.id)
        .order_by(AgentSession.updated_at.desc())
    )
    sessions = result.scalars().all()
    return [
        SessionSummaryResponse(
            id=s.id,
            skill_name=s.skill_name,
            status=s.status,
            message_count=len(s.messages),
            created_at=s.created_at,
            updated_at=s.updated_at,
        )
        for s in sessions
    ]


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: uuid.UUID,
    user: User = Depends(require_scopes(["agent:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> SessionResponse:
    """Get a specific session with its messages."""
    result = await session.execute(
        select(AgentSession).where(
            AgentSession.id == session_id,
            AgentSession.user_id == user.id,
        )
    )
    agent_session = result.scalar_one_or_none()
    if not agent_session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse.model_validate(agent_session)


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: uuid.UUID,
    data: MessageRequest,
    user: User = Depends(require_scopes(ADVISOR_DATA_SCOPES)),
    session: AsyncSession = Depends(get_async_session),
):
    """Send a message to the advisor and stream the response via SSE."""
    advisor = FinancialAdvisor(session)

    async def generate():
        try:
            async for chunk in advisor.send_message(
                session_id, user.id, data.content
            ):
                # SSE format
                yield f"data: {chunk}\n\n"
            yield "data: [DONE]\n\n"
        except ValueError as e:
            yield f"data: [ERROR:{str(e)}]\n\n"
        except RuntimeError as e:
            yield f"data: [ERROR:{str(e)}]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/recommendations", response_model=list[RecommendationResponse])
async def list_recommendations(
    user: User = Depends(require_scopes(["decision_traces:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[RecommendationResponse]:
    """List the user's recommendations from advisor sessions."""
    result = await session.execute(
        select(Recommendation)
        .where(Recommendation.user_id == user.id)
        .order_by(Recommendation.created_at.desc())
    )
    recs = result.scalars().all()
    return [RecommendationResponse.model_validate(r) for r in recs]
