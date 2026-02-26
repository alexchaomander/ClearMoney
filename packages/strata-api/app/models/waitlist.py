import uuid
from typing import Optional

from sqlalchemy import String, Numeric, Enum, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

class WaitlistUser(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "waitlist_users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    role: Mapped[Optional[str]] = mapped_column(String(100)) # e.g., "Founder", "HNW", "Professional"
    net_worth_bracket: Mapped[Optional[str]] = mapped_column(String(50)) # e.g., "<250k", "250k-1M", "1M-5M", "5M+"
    interested_tier: Mapped[Optional[str]] = mapped_column(String(50)) # e.g., "Free", "Individual", "Founder Pro"
    source_tool: Mapped[Optional[str]] = mapped_column(String(100)) # e.g., "Runway Tester", "Card Optimizer"
    referral_code: Mapped[str] = mapped_column(String(20), unique=True, index=True, default=lambda: str(uuid.uuid4())[:8])
    referred_by: Mapped[Optional[str]] = mapped_column(String(20)) # The referral_code of the referrer
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON) # For any tool-specific data
