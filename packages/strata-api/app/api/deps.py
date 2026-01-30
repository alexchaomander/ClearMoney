import logging

from fastapi import Depends, Header, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.db.session import get_async_session
from app.models.user import User

logger = logging.getLogger(__name__)


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
    clerk_user_id: str | None = None

    # Try JWT first
    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        clerk_user_id = _try_decode_jwt(token)

    # Fall back to header
    if clerk_user_id is None:
        clerk_user_id = x_clerk_user_id

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


async def get_optional_user(
    request: Request,
    x_clerk_user_id: str | None = Header(None, description="Clerk user ID"),
    session: AsyncSession = Depends(get_async_session),
) -> User | None:
    """Optionally get the current user if authenticated.

    Returns None if no authentication header is present.
    """
    clerk_user_id: str | None = None

    auth_header = request.headers.get("authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        clerk_user_id = _try_decode_jwt(token)

    if clerk_user_id is None:
        clerk_user_id = x_clerk_user_id

    if not clerk_user_id:
        return None

    result = await session.execute(
        select(User).where(User.clerk_id == clerk_user_id)
    )
    return result.scalar_one_or_none()
