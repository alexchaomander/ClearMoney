import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_session
from app.schemas.crypto import (
    CryptoPortfolioResponse,
    CryptoWallet as CryptoWalletSchema,
    CryptoWalletCreate,
)
from app.services.crypto import CryptoService

router = APIRouter(prefix="/v1/crypto", tags=["Crypto"])


@router.get("/wallets", response_model=list[CryptoWalletSchema])
async def list_wallets(
    user: Annotated[Any, Depends(require_scopes(["portfolio:read"]))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """List all tracked crypto wallets for the user."""
    service = CryptoService(session)
    return await service.list_wallets(user.id)


@router.post("/wallets", response_model=CryptoWalletSchema)
async def add_wallet(
    user: Annotated[Any, Depends(require_scopes(["portfolio:write"]))],
    wallet_in: CryptoWalletCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Add a new crypto wallet address to track."""
    service = CryptoService(session)
    return await service.add_wallet(user.id, wallet_in)


@router.delete("/wallets/{wallet_id}")
async def delete_wallet(
    wallet_id: uuid.UUID,
    user: Annotated[Any, Depends(require_scopes(["portfolio:write"]))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Remove a tracked crypto wallet."""
    service = CryptoService(session)
    success = await service.delete_wallet(user.id, wallet_id)
    if not success:
        raise HTTPException(status_code=404, detail="Wallet not found")
    return {"status": "success"}


@router.get("/portfolio", response_model=CryptoPortfolioResponse)
async def get_crypto_portfolio(
    user: Annotated[Any, Depends(require_scopes(["portfolio:read"]))],
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """Get the user's aggregated crypto portfolio, assets, and DeFi positions."""
    service = CryptoService(session)
    return await service.get_portfolio(user.id)
