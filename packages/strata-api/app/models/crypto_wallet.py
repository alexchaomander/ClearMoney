import enum
import uuid
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class CryptoChain(str, enum.Enum):
    ethereum = "ethereum"
    solana = "solana"
    polygon = "polygon"
    arbitrum = "arbitrum"
    base = "base"
    optimism = "optimism"
    bitcoin = "bitcoin"


class CryptoWallet(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "crypto_wallets"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    address: Mapped[str] = mapped_column(String(255), index=True)
    chain: Mapped[CryptoChain] = mapped_column(
        Enum(CryptoChain), default=CryptoChain.ethereum
    )
    label: Mapped[str | None] = mapped_column(String(255))
    
    # Metadata for the last known balance state
    last_balance_usd: Mapped[Decimal | None] = mapped_column(
        Numeric(36, 18), default=Decimal("0.0")
    )

    user: Mapped["User"] = relationship(back_populates="crypto_wallets")
