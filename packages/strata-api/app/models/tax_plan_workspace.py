from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.user import User


class TaxPlan(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tax_plans"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    household_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="draft")
    approved_version_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tax_plan_versions.id", ondelete="SET NULL", use_alter=True),
        nullable=True,
    )

    user: Mapped["User"] = relationship(back_populates="tax_plans")
    versions: Mapped[list["TaxPlanVersion"]] = relationship(
        back_populates="plan",
        cascade="all, delete-orphan",
        foreign_keys="[TaxPlanVersion.plan_id]",
    )
    comments: Mapped[list["TaxPlanComment"]] = relationship(
        back_populates="plan", cascade="all, delete-orphan"
    )
    collaborators: Mapped[list["TaxPlanCollaborator"]] = relationship(
        back_populates="plan", cascade="all, delete-orphan"
    )
    events: Mapped[list["TaxPlanEvent"]] = relationship(
        back_populates="plan", cascade="all, delete-orphan"
    )


class TaxPlanVersion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tax_plan_versions"

    plan_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tax_plans.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    label: Mapped[str] = mapped_column(String(128), nullable=False)
    inputs: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    results: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False, default="manual")
    is_approved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    approved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    approved_by_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    plan: Mapped["TaxPlan"] = relationship(
        back_populates="versions", foreign_keys="[TaxPlanVersion.plan_id]"
    )


class TaxPlanComment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tax_plan_comments"

    plan_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tax_plans.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    version_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tax_plan_versions.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    author_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    author_role: Mapped[str] = mapped_column(
        String(32),
        nullable=False,
        default="owner",
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)

    plan: Mapped["TaxPlan"] = relationship(back_populates="comments")


class TaxPlanCollaborator(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tax_plan_collaborators"
    __table_args__ = (
        Index(
            "ix_active_collaborator_plan_email",
            "plan_id",
            "email",
            unique=True,
            postgresql_where="revoked_at IS NULL",
        ),
    )

    plan_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tax_plans.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    email: Mapped[str] = mapped_column(String(320), index=True, nullable=False)
    role: Mapped[str] = mapped_column(String(32), nullable=False)
    invited_by_user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    accepted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    revoked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    plan: Mapped["TaxPlan"] = relationship(back_populates="collaborators")


class TaxPlanEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "tax_plan_events"

    plan_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tax_plans.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    version_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("tax_plan_versions.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    actor_user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    event_type: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    event_metadata: Mapped[dict[str, Any]] = mapped_column(
        JSON,
        nullable=False,
        default=dict,
    )

    plan: Mapped["TaxPlan"] = relationship(back_populates="events")
