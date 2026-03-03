import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_async_session, require_scopes
from app.models.entity import LegalEntity
from app.models.user import User
from app.schemas.entity import EntityCreate, EntityResponse, EntityUpdate

router = APIRouter(prefix="/entities", tags=["entities"])


@router.get("/", response_model=list[EntityResponse])
async def list_entities(
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
):
    """List all entities for the user."""
    result = await session.execute(
        select(LegalEntity).where(LegalEntity.user_id == user.id)
    )
    return result.scalars().all()


@router.post("/", response_model=EntityResponse, status_code=status.HTTP_201_CREATED)
async def create_entity(
    entity_in: EntityCreate,
    user: User = Depends(require_scopes(["portfolio:write"])),
    session: AsyncSession = Depends(get_async_session),
):
    """Create a new entity."""
    entity = LegalEntity(
        user_id=user.id,
        name=entity_in.name,
        entity_type=entity_in.entity_type,
    )
    session.add(entity)
    await session.commit()
    await session.refresh(entity)
    return entity


@router.get("/{entity_id}", response_model=EntityResponse)
async def get_entity(
    entity_id: uuid.UUID,
    user: User = Depends(require_scopes(["portfolio:read"])),
    session: AsyncSession = Depends(get_async_session),
):
    """Get a specific entity."""
    entity = await session.get(LegalEntity, entity_id)
    if not entity or entity.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found"
        )
    return entity


@router.patch("/{entity_id}", response_model=EntityResponse)
async def update_entity(
    entity_id: uuid.UUID,
    entity_in: EntityUpdate,
    user: User = Depends(require_scopes(["portfolio:write"])),
    session: AsyncSession = Depends(get_async_session),
):
    """Update an entity."""
    entity = await session.get(LegalEntity, entity_id)
    if not entity or entity.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found"
        )

    if entity_in.name is not None:
        entity.name = entity_in.name
    if entity_in.entity_type is not None:
        entity.entity_type = entity_in.entity_type

    await session.commit()
    await session.refresh(entity)
    return entity


@router.delete("/{entity_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_entity(
    entity_id: uuid.UUID,
    user: User = Depends(require_scopes(["portfolio:write"])),
    session: AsyncSession = Depends(get_async_session),
):
    """Delete an entity."""
    entity = await session.get(LegalEntity, entity_id)
    if not entity or entity.user_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Entity not found"
        )

    await session.delete(entity)
    await session.commit()
