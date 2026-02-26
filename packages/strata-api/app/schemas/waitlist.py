from typing import Optional, Dict
from pydantic import BaseModel, EmailStr
from uuid import UUID
from datetime import datetime

class WaitlistCreate(BaseModel):
    email: EmailStr
    role: Optional[str] = None
    net_worth_bracket: Optional[str] = None
    interested_tier: Optional[str] = None
    source_tool: Optional[str] = None
    referred_by: Optional[str] = None
    metadata_json: Optional[Dict] = None

class WaitlistResponse(BaseModel):
    id: UUID
    referral_code: str
    created_at: datetime

    class Config:
        from_attributes = True
