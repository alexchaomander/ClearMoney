from fastapi import APIRouter, Depends, Request
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_async_session

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(
    request: Request,
    session: AsyncSession = Depends(get_async_session),
) -> dict[str, str]:
    try:
        await session.execute(text("SELECT 1"))
        db_status = "ok"
    except SQLAlchemyError:
        db_status = "error"

    redis_status = "not_configured"
    if settings.redis_url:
        try:
            session_store = request.app.state.session_store
            await session_store.ping()
            redis_status = "ok"
        except Exception:
            redis_status = "error"

    return {"status": "ok", "database": db_status, "redis": redis_status}
