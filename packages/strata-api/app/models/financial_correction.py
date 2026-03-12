import enum
import uuid
from typing import Any

from sqlalchemy import JSON, Enum, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class FinancialCorrectionType(str, enum.Enum):
    wrong_fact = "wrong_fact"
    stale_fact = "stale_fact"
    wrong_categorization = "wrong_categorization"
    wrong_assumption = "wrong_assumption"
    wrong_recommendation = "wrong_recommendation"
    intentional_exception = "intentional_exception"
    source_mistrust = "source_mistrust"
    execution_mismatch = "execution_mismatch"


class FinancialCorrectionStatus(str, enum.Enum):
    open = "open"
    applied = "applied"
    dismissed = "dismissed"


class FinancialCorrection(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "financial_corrections"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
    )
    trace_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("decision_traces.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    metric_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    correction_type: Mapped[FinancialCorrectionType] = mapped_column(
        Enum(FinancialCorrectionType, values_callable=lambda e: [x.value for x in e]),
        index=True,
    )
    status: Mapped[FinancialCorrectionStatus] = mapped_column(
        Enum(FinancialCorrectionStatus, values_callable=lambda e: [x.value for x in e]),
        default=FinancialCorrectionStatus.open,
        index=True,
    )
    target_field: Mapped[str] = mapped_column(String(100), index=True)
    target_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    summary: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reason: Mapped[str] = mapped_column(String(1000))
    original_value: Mapped[dict[str, Any]] = mapped_column(JSON, default=lambda: {})
    proposed_value: Mapped[dict[str, Any]] = mapped_column(JSON, default=lambda: {})
    resolved_value: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    impact_summary: Mapped[dict[str, Any]] = mapped_column(JSON, default=lambda: {})
