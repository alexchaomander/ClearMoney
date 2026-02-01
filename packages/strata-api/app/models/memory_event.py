import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class MemoryEventSource(str, enum.Enum):
    user_input = "user_input"
    calculator = "calculator"
    account_sync = "account_sync"
    agent = "agent"


class MemoryEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "memory_events"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    field_name: Mapped[str] = mapped_column(String(100))
    old_value: Mapped[str | None] = mapped_column(Text, default=None)
    new_value: Mapped[str | None] = mapped_column(Text, default=None)
    source: Mapped[MemoryEventSource] = mapped_column(
        Enum(MemoryEventSource, values_callable=lambda e: [x.value for x in e]),
    )
    context: Mapped[str | None] = mapped_column(Text, default=None)
