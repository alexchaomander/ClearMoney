from __future__ import annotations

from typing import Any

from app.schemas.agent import (
    ConfidenceFactor,
    ContextQualityResponse,
    DecisionTracePayload,
    DecisionTraceRemediationAction,
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
    confidence_score: float | None = None,
    confidence_factors: list[ConfidenceFactor] | None = None,
    warnings: list[str] | None = None,
    correction_targets: list[TraceCorrectionTarget] | None = None,
) -> dict[str, Any]:
    freshness = FreshnessStatus(**freshness_status)
    merged_warnings = list(dict.fromkeys([*(warnings or []), *context_quality.warnings]))
    payload = DecisionTracePayload(
        trace_kind=trace_kind,
        title=title,
        summary=summary,
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
        remediation_actions=build_trace_remediation_actions(context, context_quality, freshness_status),
        correction_targets=correction_targets or list(_DEFAULT_CORRECTION_TARGETS),
        deterministic={
            "rules_applied": rules_applied,
            "insights": insights,
            "assumptions": assumptions,
        },
    )
    return payload.model_dump()
