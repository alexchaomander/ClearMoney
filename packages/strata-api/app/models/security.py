import enum
from datetime import date
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Date, Enum, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.holding import Holding


class SecurityType(str, enum.Enum):
    stock = "stock"
    etf = "etf"
    mutual_fund = "mutual_fund"
    bond = "bond"
    crypto = "crypto"
    cash = "cash"
    option = "option"
    other = "other"


class Security(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "securities"

    ticker: Mapped[str | None] = mapped_column(String(20), index=True)
    name: Mapped[str] = mapped_column(String(255))
    security_type: Mapped[SecurityType] = mapped_column(
        Enum(SecurityType, values_callable=lambda e: [x.value for x in e]),
    )
    cusip: Mapped[str | None] = mapped_column(String(9))
    isin: Mapped[str | None] = mapped_column(String(12))
    close_price: Mapped[Decimal | None] = mapped_column(Numeric(precision=14, scale=4))
    close_price_as_of: Mapped[date | None] = mapped_column(Date)

    holdings: Mapped[list["Holding"]] = relationship(back_populates="security")
