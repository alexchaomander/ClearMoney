from typing import TYPE_CHECKING

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.action_intent import ActionIntent
    from app.models.cash_account import CashAccount
    from app.models.connection import Connection
    from app.models.debt_account import DebtAccount
    from app.models.income_source import IncomeSource
    from app.models.investment_account import InvestmentAccount
    from app.models.portfolio_snapshot import PortfolioSnapshot


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    clerk_id: Mapped[str] = mapped_column(
        String(255), unique=True, index=True
    )
    email: Mapped[str] = mapped_column(String(320))

    connections: Mapped[list["Connection"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    cash_accounts: Mapped[list["CashAccount"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    debt_accounts: Mapped[list["DebtAccount"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    income_sources: Mapped[list["IncomeSource"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    investment_accounts: Mapped[list["InvestmentAccount"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    portfolio_snapshots: Mapped[list["PortfolioSnapshot"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
    action_intents: Mapped[list["ActionIntent"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )
