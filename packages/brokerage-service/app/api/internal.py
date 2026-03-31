from fastapi import APIRouter, Depends, Header, HTTPException

from app.core.config import settings
from app.schemas.brokerage import (
    AccountRequest,
    CallbackRequest,
    CredentialsResponse,
    DeleteConnectionRequest,
    HoldingsRequest,
    LinkSessionRequest,
    LinkSessionResponse,
    NormalizedAccountResponse,
    NormalizedHoldingResponse,
    NormalizedTransactionResponse,
    TransactionsRequest,
)
from app.services.snaptrade_provider import SnapTradeProvider

router = APIRouter(prefix="/internal/brokerage", tags=["brokerage"])


def _require_internal_token(x_internal_token: str | None = Header(None)) -> None:
    if not settings.internal_token:
        raise HTTPException(
            status_code=500, detail="BROKERAGE_INTERNAL_TOKEN is not configured"
        )
    if x_internal_token != settings.internal_token:
        raise HTTPException(status_code=401, detail="Invalid internal token")


def get_provider() -> SnapTradeProvider:
    return SnapTradeProvider()


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/link-session", response_model=LinkSessionResponse)
async def create_link_session(
    request: LinkSessionRequest,
    _auth: None = Depends(_require_internal_token),
    provider: SnapTradeProvider = Depends(get_provider),
) -> LinkSessionResponse:
    return await provider.create_link_session(request.user_id, request.redirect_uri)


@router.post("/callback", response_model=CredentialsResponse)
async def handle_callback(
    request: CallbackRequest,
    _auth: None = Depends(_require_internal_token),
    provider: SnapTradeProvider = Depends(get_provider),
) -> CredentialsResponse:
    return await provider.handle_callback(
        request.user_id,
        request.user_secret,
        request.authorization_id,
    )


@router.post("/accounts", response_model=list[NormalizedAccountResponse])
async def get_accounts(
    request: AccountRequest,
    _auth: None = Depends(_require_internal_token),
    provider: SnapTradeProvider = Depends(get_provider),
) -> list[NormalizedAccountResponse]:
    return await provider.get_accounts(request.credentials)


@router.post("/holdings", response_model=list[NormalizedHoldingResponse])
async def get_holdings(
    request: HoldingsRequest,
    _auth: None = Depends(_require_internal_token),
    provider: SnapTradeProvider = Depends(get_provider),
) -> list[NormalizedHoldingResponse]:
    return await provider.get_holdings(request.credentials, request.provider_account_id)


@router.post("/transactions", response_model=list[NormalizedTransactionResponse])
async def get_transactions(
    request: TransactionsRequest,
    _auth: None = Depends(_require_internal_token),
    provider: SnapTradeProvider = Depends(get_provider),
) -> list[NormalizedTransactionResponse]:
    return await provider.get_transactions(
        request.credentials, request.provider_account_id
    )


@router.post("/delete")
async def delete_connection(
    request: DeleteConnectionRequest,
    _auth: None = Depends(_require_internal_token),
    provider: SnapTradeProvider = Depends(get_provider),
) -> dict[str, str]:
    await provider.delete_connection(request.credentials)
    return {"status": "deleted"}
