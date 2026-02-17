from decimal import Decimal
from uuid import UUID

from sqlalchemy import ForeignKey, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CreditCard(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "credit_cards"

    name: Mapped[str] = mapped_column(String(255))
    issuer: Mapped[str] = mapped_column(String(100), index=True)
    annual_fee: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    apply_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    credits: Mapped[list["CardCredit"]] = relationship(
        back_populates="card", cascade="all, delete-orphan", lazy="selectin"
    )
    benefits: Mapped[list["CardBenefit"]] = relationship(
        back_populates="card", cascade="all, delete-orphan", lazy="selectin"
    )

class CardCredit(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "card_credits"

    card_id: Mapped[UUID] = mapped_column(ForeignKey("credit_cards.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    value: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    period: Mapped[str] = mapped_column(String(50)) # annual, monthly
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)

    card: Mapped["CreditCard"] = relationship(back_populates="credits")

class CardBenefit(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "card_benefits"

    card_id: Mapped[UUID] = mapped_column(ForeignKey("credit_cards.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    valuation_method: Mapped[str | None] = mapped_column(String(50), nullable=True)
    default_value: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    card: Mapped["CreditCard"] = relationship(back_populates="benefits")
