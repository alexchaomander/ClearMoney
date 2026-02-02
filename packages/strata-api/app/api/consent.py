import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.consent import ConsentGrant, ConsentStatus
from app.models.user import User
from app.schemas.consent import ConsentCreateRequest, ConsentResponse
from app.services.consent import ConsentService

router = APIRouter(prefix="/consents", tags=["consents"])


@router.post("", response_model=ConsentResponse, status_code=201)
async def create_consent(
    data: ConsentCreateRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> ConsentResponse:
    consent = ConsentGrant(
        user_id=user.id,
        scopes=data.scopes,
        purpose=data.purpose,
        source=data.source or "api",
        status=ConsentStatus.active,
    )
    session.add(consent)
    await session.commit()
    await session.refresh(consent)
    return ConsentResponse.model_validate(consent)


@router.get("", response_model=list[ConsentResponse])
async def list_consents(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[ConsentResponse]:
    result = await session.execute(
        select(ConsentGrant)
        .where(ConsentGrant.user_id == user.id)
        .order_by(ConsentGrant.created_at.desc())
    )
    consents = result.scalars().all()
    return [ConsentResponse.model_validate(c) for c in consents]


@router.post("/{consent_id}/revoke", response_model=ConsentResponse)
async def revoke_consent(
    consent_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> ConsentResponse:
    result = await session.execute(
        select(ConsentGrant).where(
            ConsentGrant.id == consent_id,
            ConsentGrant.user_id == user.id,
        )
    )
    consent = result.scalar_one_or_none()
    if consent is None:
        raise HTTPException(status_code=404, detail="Consent not found")
    service = ConsentService(session)
    await service.revoke_and_purge(consent)
    return ConsentResponse.model_validate(consent)
