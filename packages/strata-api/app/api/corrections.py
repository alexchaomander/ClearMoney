
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_scopes
from app.core.config import settings
from app.db.session import get_async_session
from app.models.consent import ConsentGrant, ConsentStatus
from app.models.user import User
from app.schemas.correction import (
    FinancialCorrectionCreate,
    FinancialCorrectionResponse,
)
from app.services.consent import ConsentService
from app.services.corrections import CorrectionService

router = APIRouter(prefix="/corrections", tags=["corrections"])


def _required_scopes_for_correction(payload: FinancialCorrectionCreate) -> list[str]:
    scopes = ["memory:write", "portfolio:read"]
    if payload.target_field == "transaction_category":
        scopes.append("transactions:read")
    return scopes


async def _authorize_correction(
    payload: FinancialCorrectionCreate,
    user: User,
    session: AsyncSession,
) -> None:
    required_scopes = _required_scopes_for_correction(payload)
    consent = ConsentService(session)
    try:
        await consent.require_scopes(user.id, required_scopes)
    except HTTPException:
        if settings.auto_consent_on_missing and required_scopes:
            session.add(
                ConsentGrant(
                    user_id=user.id,
                    scopes=required_scopes,
                    purpose="Auto-consent for development/testing",
                    status=ConsentStatus.active,
                    source="auto",
                )
            )
            await session.commit()
            return
        raise


@router.post("", response_model=FinancialCorrectionResponse, status_code=201)
async def create_correction(
    payload: FinancialCorrectionCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> FinancialCorrectionResponse:
    await _authorize_correction(payload, user, session)
    correction = await CorrectionService(session).create_correction(user.id, payload)
    return FinancialCorrectionResponse.model_validate(correction)


@router.get("", response_model=list[FinancialCorrectionResponse])
async def list_corrections(
    metric_id: str | None = None,
    user: User = Depends(require_scopes(["memory:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[FinancialCorrectionResponse]:
    corrections = await CorrectionService(session).list_corrections(user.id, metric_id)
    return [FinancialCorrectionResponse.model_validate(item) for item in corrections]
