from __future__ import annotations

from typing import Any

from app.schemas.agent import (
    ConfidenceFactor,
    ContextQualityResponse,
    DecisionTracePayload,
    DecisionTraceRemediationAction,
    DecisionTraceReviewSummary,
    DecisionTraceRuleCheck,
    DecisionTraceInsight,
    FreshnessStatus,
    TraceCorrectionTarget,
)

_DEFAULT_CORRECTION_TARGETS = [
    TraceCorrectionTarget(
        field="manual_review",
        label="Request review",
        input_type="text",
        metric_ids=[],
    ),
    TraceCorrectionTarget(
        field="monthly_income",
        label="Monthly income",
        input_type="currency",
        metric_ids=["savingsRate"],
    ),
    TraceCorrectionTarget(
        field="average_monthly_expenses",
        label="Monthly expenses",
        input_type="currency",
        metric_ids=["savingsRate", "personalRunway"],
    ),
]


def _coverage_status(context_quality: ContextQualityResponse) -> str:
    return "full" if context_quality.coverage_ratio >= 0.8 else "partial"


def build_trace_remediation_actions(
    context: dict[str, Any],
    context_quality: ContextQualityResponse,
    freshness_status: dict[str, Any],
    review_summary: DecisionTraceReviewSummary | None = None,
) -> list[DecisionTraceRemediationAction]:
    actions: list[DecisionTraceRemediationAction] = []
    profile = context.get("profile", {}) or {}
    continuity = context_quality.continuity_status

    if continuity in {"revoked", "recovery_required"}:
        actions.append(
            DecisionTraceRemediationAction(
                action_id="reconnect_accounts",
                label="Reconnect linked accounts",
                description="At least one linked connection needs recovery before ClearMoney should make action-ready recommendations.",
                href="/connect",
                priority="high",
            )
        )
    elif continuity in {"stale", "degraded"} or not freshness_status.get("is_fresh", True):
        actions.append(
            DecisionTraceRemediationAction(
                action_id="resync_connections",
                label="Refresh your data",
                description="ClearMoney is working with stale or degraded data. Syncing connections will improve confidence.",
                href="/dashboard",
                priority="high" if continuity == "degraded" else "medium",
            )
        )

    if context_quality.coverage_ratio < 0.8:
        actions.append(
            DecisionTraceRemediationAction(
                action_id="expand_account_coverage",
                label="Link missing accounts",
                description="Coverage is partial. Linking missing institutions will improve recommendation quality and continuity.",
                href="/connect",
                priority="medium",
            )
        )

    if profile.get("monthly_income") in {None, "", 0} or profile.get("average_monthly_expenses") in {None, "", 0}:
        actions.append(
            DecisionTraceRemediationAction(
                action_id="complete_cashflow_profile",
                label="Complete your cash flow profile",
                description="Monthly income and expense inputs are still incomplete. Fill them in to unlock stronger recommendations.",
                href="/profile",
                priority="medium",
            )
        )

    if review_summary and review_summary.open_review_count > 0:
        actions.append(
            DecisionTraceRemediationAction(
                action_id="resolve_open_reviews",
                label="Resolve open recommendation reviews",
                description="Unresolved disputes or review requests should be addressed before relying on related guidance.",
                href="/dashboard/recommendation-reviews",
                priority="high",
            )
        )

    unique: dict[str, DecisionTraceRemediationAction] = {}
    for action in actions:
        unique[action.action_id] = action
    return list(unique.values())


def build_decision_trace_payload(
    *,
    trace_kind: str,
    context: dict[str, Any],
    context_quality: ContextQualityResponse,
    freshness_status: dict[str, Any],
    rules_applied: list[dict[str, Any]],
    insights: list[dict[str, Any]],
    assumptions: list[str],
    title: str | None = None,
    summary: str | None = None,
    recommendation_status: str | None = None,
    superseded_by_trace_id: str | None = None,
    superseded_at: str | None = None,
    blocked_reason: str | None = None,
    confidence_score: float | None = None,
    confidence_factors: list[ConfidenceFactor] | None = None,
    warnings: list[str] | None = None,
    correction_targets: list[TraceCorrectionTarget] | None = None,
    review_summary: DecisionTraceReviewSummary | None = None,
) -> dict[str, Any]:
    freshness = FreshnessStatus(**freshness_status)
    if review_summary is not None and isinstance(review_summary, dict):
        review_summary = DecisionTraceReviewSummary(**review_summary)
    merged_warnings = list(dict.fromkeys([*(warnings or []), *context_quality.warnings]))
    if review_summary and review_summary.open_review_count > 0:
        merged_warnings.append(
            "There are open recommendation reviews tied to this guidance. Treat it as pending adjudication until those reviews are resolved."
        )
    payload = DecisionTracePayload(
        trace_kind=trace_kind,
        title=title,
        summary=summary,
        recommendation_status=recommendation_status,
        superseded_by_trace_id=superseded_by_trace_id,
        superseded_at=superseded_at,
        blocked_reason=blocked_reason,
        rules_applied=[DecisionTraceRuleCheck(**rule) for rule in rules_applied],
        insights=[
            DecisionTraceInsight(
                title=insight.get("title", "Insight"),
                summary=insight.get("summary"),
                recommendation=insight.get("recommendation"),
                severity=insight.get("severity"),
            )
            for insight in insights
        ],
        assumptions=assumptions,
        confidence_score=confidence_score if confidence_score is not None else context_quality.confidence_score,
        confidence_factors=confidence_factors or list(context_quality.confidence_factors),
        determinism_class="deterministic",
        source_tier="derived_context",
        continuity_status=context_quality.continuity_status,
        recommendation_readiness=context_quality.recommendation_readiness,
        coverage_status=_coverage_status(context_quality),
        policy_version="context-policy-v1",
        freshness=freshness,
        context_quality=context_quality,
        warnings=merged_warnings,
        remediation_actions=build_trace_remediation_actions(
            context,
            context_quality,
            freshness_status,
            review_summary=review_summary,
        ),
        correction_targets=correction_targets or list(_DEFAULT_CORRECTION_TARGETS),
        review_summary=review_summary,
        deterministic={
            "rules_applied": rules_applied,
            "insights": insights,
            "assumptions": assumptions,
        },
    )
    return payload.model_dump()
