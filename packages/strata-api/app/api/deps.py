import logging
import uuid

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_async_session
from app.models.user import User
from app.services.consent import ConsentService

logger = logging.getLogger(__name__)


async def get_db(
    session: AsyncSession = Depends(get_async_session),
) -> AsyncSession:
    """Backwards-compatible DB session dependency."""
    return session


def _try_decode_jwt(token: str) -> str | None:
    """Attempt to decode a Clerk JWT and return the subject (user ID).

    Returns None if jose is not installed or the key is not configured.
    Raises HTTPException on invalid tokens when the key IS configured.
    """
    pem_key = settings.clerk_pem_public_key
    if not pem_key:
        return None

    try:
        from jose import JWTError, jwt  # type: ignore[import-untyped]
    except ImportError:
        logger.warning("python-jose not installed; skipping JWT validation")
        return None

    try:
        payload = jwt.decode(
            token,
            pem_key,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub")
        return str(sub)
    except JWTError as exc:
        raise HTTPException(status_code=401, detail=f"Invalid token: {exc}") from exc


def _resolve_clerk_user_id(
    request: Request,
    x_clerk_user_id: str | None,
) -> str | None:
    """Resolve the Clerk user ID from the request.

    Strategy (in priority order):
    1. If a Bearer token is present, try JWT validation.
    2. Only if clerk_pem_public_key is NOT configured, fall back to
       the X-Clerk-User-Id header (dev mode).

    When the PEM key IS configured the header fallback is blocked to
    prevent unauthenticated requests bypassing JWT validation.
    """
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        clerk_user_id = _try_decode_jwt(token)
        if clerk_user_id:
            return clerk_user_id

    # Only allow header fallback when JWT is not configured
    if not settings.clerk_pem_public_key:
        return x_clerk_user_id

    return None


async def get_current_user(
    request: Request,
    x_clerk_user_id: str | None = Header(None, description="Clerk user ID"),
    session: AsyncSession = Depends(get_async_session),
) -> User:
    """Get or create the current user.

    Authentication strategy (in priority order):
    1. If clerk_pem_public_key is configured, validate the Authorization
       Bearer JWT and extract the user ID from the 'sub' claim.
    2. Otherwise, fall back to the X-Clerk-User-Id header (dev mode).
    """
    clerk_user_id = _resolve_clerk_user_id(request, x_clerk_user_id)

    if not clerk_user_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Get or create user by clerk_id
    result = await session.execute(
        select(User).where(User.clerk_id == clerk_user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        user = User(
            clerk_id=clerk_user_id,
            email=f"{clerk_user_id}@placeholder.local",
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return user


def require_scopes(required_scopes: list[str]):
    async def _dependency(
        user: User = Depends(get_current_user),
        session: AsyncSession = Depends(get_async_session),
    ) -> User:
        consent = ConsentService(session)
        await consent.require_scopes(user.id, required_scopes)
        return user

    return _dependency


def require_step_up(
    x_step_up_token: str | None = Header(None, alias="X-Step-Up-Token"),
):
    if not settings.agent_step_up_token:
        raise HTTPException(
            status_code=500,
            detail="Step-up authentication is not configured",
        )
    if x_step_up_token != settings.agent_step_up_token:
        raise HTTPException(status_code=401, detail="Invalid step-up token")


async def get_optional_user(
    request: Request,
    x_clerk_user_id: str | None = Header(None, description="Clerk user ID"),
    session: AsyncSession = Depends(get_async_session),
) -> User | None:
    """Optionally get the current user if authenticated.

    Returns None if no authentication header is present.
    """
    clerk_user_id = _resolve_clerk_user_id(request, x_clerk_user_id)

    if not clerk_user_id:
        return None

    result = await session.execute(
        select(User).where(User.clerk_id == clerk_user_id)
    )
    return result.scalar_one_or_none()


async def get_owned_account(
    model: type,
    session: AsyncSession,
    account_id: uuid.UUID,
    user_id: uuid.UUID,
    label: str = "Account",
):
    """Fetch an account owned by the given user, or raise 404."""
    result = await session.execute(
        select(model).where(model.id == account_id, model.user_id == user_id)
    )
    account = result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=404, detail=f"{label} not found")
    return account
