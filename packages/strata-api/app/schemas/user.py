import uuid
from datetime import datetime

from pydantic import BaseModel


class UserCreate(BaseModel):
    clerk_id: str
    email: str


class UserResponse(BaseModel):
    id: uuid.UUID
    clerk_id: str
    email: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
