import uuid
from typing import TYPE_CHECKING

from sqlalchemy import JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.connection import Connection
    from app.models.investment_account import InvestmentAccount


class Institution(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "institutions"

    name: Mapped[str] = mapped_column(String(255))
    logo_url: Mapped[str | None] = mapped_column(String(512))
    providers: Mapped[dict | None] = mapped_column(JSON)

    connections: Mapped[list["Connection"]] = relationship(back_populates="institution")
    investment_accounts: Mapped[list["InvestmentAccount"]] = relationship(
        back_populates="institution"
    )
