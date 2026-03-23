import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models import User
from app.schemas.crypto import (
    CryptoPortfolioResponse,
    CryptoWalletCreate,
)
from app.schemas.crypto import (
    CryptoWallet as CryptoWalletSchema,
)
from app.services.crypto import CryptoService

router = APIRouter(prefix="/crypto", tags=["Crypto"])


@router.get("/wallets", response_model=list[CryptoWalletSchema])
async def list_wallets(
    user: Annotated[User, Depends(require_scopes(["portfolio:read"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """List all tracked crypto wallets for the user."""
    service = CryptoService(session)
    return await service.list_wallets(user.id)


@router.post("/wallets", response_model=CryptoWalletSchema)
async def add_wallet(
    user: Annotated[User, Depends(require_scopes(["portfolio:write"]))],
    wallet_in: CryptoWalletCreate,
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Add a new crypto wallet address to track."""
    service = CryptoService(session)
    try:
        return await service.add_wallet(user.id, wallet_in)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/wallets/{wallet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_wallet(
    wallet_id: uuid.UUID,
    user: Annotated[User, Depends(require_scopes(["portfolio:write"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Remove a tracked crypto wallet."""
    service = CryptoService(session)
    success = await service.delete_wallet(user.id, wallet_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wallet not found")


@router.delete("/wallets", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_wallets(
    user: Annotated[User, Depends(require_scopes(["portfolio:write"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Remove all tracked crypto wallets for the user."""
    service = CryptoService(session)
    await service.delete_all_wallets(user.id)


@router.get("/portfolio", response_model=CryptoPortfolioResponse)
async def get_crypto_portfolio(
    user: Annotated[User, Depends(require_scopes(["portfolio:read"]))],
    session: Annotated[AsyncSession, Depends(get_async_session)],
):
    """Get the user's aggregated crypto portfolio, assets, and DeFi positions."""
    service = CryptoService(session)
    return await service.get_portfolio(user.id)
