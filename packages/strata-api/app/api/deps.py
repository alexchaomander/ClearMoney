from fastapi import Depends, Header, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_async_session
from app.models.user import User


async def get_current_user(
    x_clerk_user_id: str = Header(..., description="Clerk user ID"),
    session: AsyncSession = Depends(get_async_session),
) -> User:
    """Get or create the current user from Clerk user ID header.

    This dependency extracts the Clerk user ID from the request header
    and returns the corresponding User model. If the user doesn't exist,
    it creates a new user record.

    SECURITY WARNING: This implementation trusts the x-clerk-user-id header
    directly without validation. In production, you MUST:
    1. Validate the Clerk session JWT token
    2. Extract the user ID from the validated token
    3. Never trust client-provided headers for authentication

    Example production implementation:
        from clerk_backend_api import Clerk
        clerk = Clerk(api_key=settings.clerk_secret_key)
        session_token = request.headers.get("Authorization", "").replace("Bearer ", "")
        claims = clerk.sessions.verify_token(session_token)
        clerk_user_id = claims.sub
    """
    # Get or create user by clerk_id
    result = await session.execute(
        select(User).where(User.clerk_id == x_clerk_user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        # Auto-create user on first API call
        # In production, you'd want to validate the Clerk token first
        user = User(
            clerk_id=x_clerk_user_id,
            email=f"{x_clerk_user_id}@placeholder.local",  # Placeholder until we get real email
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

    return user


async def get_optional_user(
    x_clerk_user_id: str | None = Header(None, description="Clerk user ID"),
    session: AsyncSession = Depends(get_async_session),
) -> User | None:
    """Optionally get the current user if authenticated.

    Returns None if no authentication header is present.
    """
    if x_clerk_user_id is None:
        return None

    result = await session.execute(
        select(User).where(User.clerk_id == x_clerk_user_id)
    )
    return result.scalar_one_or_none()
