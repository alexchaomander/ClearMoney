import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.user import User
from app.schemas.correction import (
    FinancialCorrectionCreate,
    FinancialCorrectionResponse,
)
from app.services.corrections import CorrectionService

router = APIRouter(prefix="/corrections", tags=["corrections"])


@router.post("", response_model=FinancialCorrectionResponse, status_code=201)
async def create_correction(
    payload: FinancialCorrectionCreate,
    user: User = Depends(require_scopes(["memory:write", "transactions:read", "portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> FinancialCorrectionResponse:
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
