import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.entity import EntityType


class EntityBase(BaseModel):
    name: str
    entity_type: EntityType


class EntityCreate(EntityBase):
    pass


class EntityUpdate(BaseModel):
    name: str | None = None
    entity_type: EntityType | None = None


class EntityResponse(EntityBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
