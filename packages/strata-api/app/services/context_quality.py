from __future__ import annotations

from datetime import datetime, timezone

from app.models.connection import Connection, ConnectionStatus
from app.schemas.agent import ConfidenceFactor, ContextQualityResponse, FreshnessStatus
from app.services.agent_guardrails import evaluate_freshness


def _is_revoked(connection: Connection) -> bool:
    error_text = (
        f"{connection.error_code or ''} {connection.error_message or ''}".lower()
    )
    return "revoked" in error_text or "consent" in error_text


def evaluate_context_quality(
    context: dict,
    connections: list[Connection],
) -> ContextQualityResponse:
    freshness_dict = evaluate_freshness(context)
    freshness = FreshnessStatus(**freshness_dict)
    accounts_count = int(context.get("data_freshness", {}).get("accounts_count") or 0)
    total_connections = len(connections)
    active_connections = sum(
        1 for connection in connections if connection.status == ConnectionStatus.active
    )
    errored_connections = sum(
        1 for connection in connections if connection.status == ConnectionStatus.error
    )

    stale_connections = 0
    now = datetime.now(timezone.utc)
    for connection in connections:
        if connection.last_synced_at is None:
            stale_connections += 1
            continue
        last_sync = connection.last_synced_at
        if last_sync.tzinfo is None:
            last_sync = last_sync.replace(tzinfo=timezone.utc)
        age_hours = (now - last_sync).total_seconds() / 3600
        if age_hours > freshness.max_age_hours:
            stale_connections += 1

    warnings: list[str] = []
    if freshness.warning:
        warnings.append(freshness.warning)

    coverage_ratio = 0.0
    if accounts_count > 0 and total_connections > 0:
        coverage_ratio = min(1.0, active_connections / max(total_connections, 1))
    elif accounts_count > 0:
        coverage_ratio = 0.5

    if total_connections == 0 and accounts_count > 0:
        continuity_status = "manual_substitute"
        warnings.append(
            "Context is relying on manually maintained accounts without active connections."
        )
    elif any(_is_revoked(connection) for connection in connections):
        continuity_status = "revoked"
        warnings.append(
            "At least one connection was revoked and needs recovery before high-confidence guidance."
        )
    elif total_connections > 0 and active_connections == 0 and errored_connections > 0:
        continuity_status = "recovery_required"
        warnings.append(
            "All linked connections need recovery before action-ready guidance is safe."
        )
    elif errored_connections > 0:
        continuity_status = "degraded"
        warnings.append("One or more linked connections are degraded.")
    elif stale_connections > 0 or not freshness.is_fresh:
        continuity_status = "stale"
    elif active_connections < total_connections:
        continuity_status = "partially_covered"
    else:
        continuity_status = "healthy"

    readiness = "ready"
    if continuity_status in {"revoked", "recovery_required"}:
        readiness = "blocked"
    elif continuity_status in {
        "degraded",
        "stale",
        "partially_covered",
        "manual_substitute",
    }:
        readiness = "cautious"

    confidence_factors = [
        ConfidenceFactor(
            label="Freshness",
            value=1.0 if freshness.is_fresh else 0.45,
            impact="positive" if freshness.is_fresh else "negative",
            reason="Linked data is within freshness policy."
            if freshness.is_fresh
            else "Linked data is stale or missing sync metadata.",
        ),
        ConfidenceFactor(
            label="Connection Coverage",
            value=coverage_ratio,
            impact="positive"
            if coverage_ratio >= 0.8
            else "mixed"
            if coverage_ratio >= 0.5
            else "negative",
            reason=f"{active_connections} of {total_connections} connection(s) are active."
            if total_connections
            else "No active linked connections.",
        ),
        ConfidenceFactor(
            label="Account Coverage",
            value=1.0 if accounts_count > 0 else 0.2,
            impact="positive" if accounts_count > 0 else "negative",
            reason="Accounts are present in the context graph."
            if accounts_count > 0
            else "No accounts are present in the current context.",
        ),
    ]
    confidence_score = round(
        sum(factor.value for factor in confidence_factors) / len(confidence_factors), 2
    )

    return ContextQualityResponse(
        continuity_status=continuity_status,
        recommendation_readiness=readiness,
        confidence_score=confidence_score,
        freshness=freshness,
        coverage_ratio=round(coverage_ratio, 2),
        active_connection_count=active_connections,
        total_connection_count=total_connections,
        stale_connection_count=stale_connections,
        errored_connection_count=errored_connections,
        warnings=warnings,
        confidence_factors=confidence_factors,
    )
