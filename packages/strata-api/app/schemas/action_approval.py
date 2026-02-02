from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class ActionApprovalResponse(BaseModel):
    id: UUID
    action_type: str
    payload: dict
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
