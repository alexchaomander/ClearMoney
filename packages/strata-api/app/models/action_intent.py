import enum
import uuid
from typing import Any

from sqlalchemy import Enum, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ActionIntentStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    PROCESSING = "processing"
    EXECUTED = "executed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ActionIntentType(str, enum.Enum):
    ACH_TRANSFER = "ach_transfer"
    ACATS_TRANSFER = "acats_transfer"
    REBALANCE = "rebalance"
    TAX_HARVEST = "tax_loss_harvest"
    OPEN_ACCOUNT = "open_account"
    CUSTOM = "custom"


class ActionIntent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "action_intents"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    
    # Traceability: Link to the specific logic trace that generated this intent
    decision_trace_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("decision_traces.id", ondelete="SET NULL"), nullable=True
    )

    intent_type: Mapped[ActionIntentType] = mapped_column(
        Enum(ActionIntentType, values_callable=lambda e: [x.value for x in e]),
        nullable=False,
    )
    
    status: Mapped[ActionIntentStatus] = mapped_column(
        Enum(ActionIntentStatus, values_callable=lambda e: [x.value for x in e]),
        default=ActionIntentStatus.DRAFT,
        index=True,
    )

    # Core details
    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    
    # Execution Payload (e.g. { source_account_id: "...", target_account_id: "...", amount: 1000 })
    payload: Mapped[dict[str, Any]] = mapped_column(JSON, default=lambda: {})
    
    # Logic/Impact (Snapshot of why we are doing this, e.g. { estimated_savings: 500 })
    impact_summary: Mapped[dict[str, Any]] = mapped_column(JSON, default=lambda: {})

    # Ghost Navigation Manifest (Steps, Deep Links, Snippets)
    execution_manifest: Mapped[dict[str, Any]] = mapped_column(JSON, default=lambda: {})

    # Relationships
    user = relationship("User", back_populates="action_intents")
    decision_trace = relationship("DecisionTrace")
