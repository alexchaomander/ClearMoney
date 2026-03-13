"use client";

import type {
  DecisionTrace,
  DecisionTracePayload,
} from "@clearmoney/strata-sdk";

export function getDecisionTracePayload(trace: DecisionTrace): DecisionTracePayload | null {
  if (trace.trace_payload) {
    return trace.trace_payload;
  }

  const rawPayload = (trace.outputs as { trace?: unknown } | undefined)?.trace;
  if (!rawPayload || typeof rawPayload !== "object") {
    return null;
  }

  const raw = rawPayload as Record<string, unknown>;
  const deterministic =
    raw.deterministic && typeof raw.deterministic === "object"
      ? (raw.deterministic as Record<string, unknown>)
      : {};

  const rules = Array.isArray(raw.rules_applied)
    ? raw.rules_applied
    : Array.isArray(deterministic.rules_applied)
      ? deterministic.rules_applied
      : [];
  const insights = Array.isArray(raw.insights)
    ? raw.insights
    : Array.isArray(deterministic.insights)
      ? deterministic.insights
      : [];
  const assumptions = Array.isArray(raw.assumptions)
    ? raw.assumptions
    : Array.isArray(deterministic.assumptions)
      ? deterministic.assumptions
      : [];

  return {
    trace_version: typeof raw.trace_version === "string" ? raw.trace_version : "v2",
    trace_kind: typeof raw.trace_kind === "string" ? raw.trace_kind : trace.trace_type,
    title: typeof raw.title === "string" ? raw.title : null,
    summary: typeof raw.summary === "string" ? raw.summary : null,
    rules_applied: rules as DecisionTracePayload["rules_applied"],
    insights: insights as DecisionTracePayload["insights"],
    assumptions: assumptions as string[],
    confidence_score: typeof raw.confidence_score === "number" ? raw.confidence_score : null,
    confidence_factors: Array.isArray(raw.confidence_factors)
      ? (raw.confidence_factors as DecisionTracePayload["confidence_factors"])
      : [],
    determinism_class:
      typeof raw.determinism_class === "string" ? raw.determinism_class : "deterministic",
    source_tier: typeof raw.source_tier === "string" ? raw.source_tier : "derived_context",
    continuity_status: typeof raw.continuity_status === "string" ? raw.continuity_status : "unknown",
    recommendation_readiness:
      typeof raw.recommendation_readiness === "string" ? raw.recommendation_readiness : "unknown",
    coverage_status: typeof raw.coverage_status === "string" ? raw.coverage_status : "partial",
    policy_version: typeof raw.policy_version === "string" ? raw.policy_version : "unknown",
    freshness:
      typeof raw.freshness === "object" && raw.freshness !== null
        ? (raw.freshness as DecisionTracePayload["freshness"])
        : {
            is_fresh: true,
            age_hours: null,
            max_age_hours: 24,
            last_sync: null,
            warning: null,
          },
    context_quality:
      typeof raw.context_quality === "object" && raw.context_quality !== null
        ? (raw.context_quality as DecisionTracePayload["context_quality"])
        : {
            continuity_status: "unknown",
            recommendation_readiness: "unknown",
            confidence_score: 0,
            freshness: {
              is_fresh: true,
              age_hours: null,
              max_age_hours: 24,
              last_sync: null,
              warning: null,
            },
            coverage_ratio: 0,
            active_connection_count: 0,
            total_connection_count: 0,
            stale_connection_count: 0,
            errored_connection_count: 0,
            warnings: [],
            confidence_factors: [],
          },
    warnings: Array.isArray(raw.warnings) ? (raw.warnings as string[]) : trace.warnings,
    remediation_actions: Array.isArray(raw.remediation_actions)
      ? (raw.remediation_actions as DecisionTracePayload["remediation_actions"])
      : [],
    correction_targets: Array.isArray(raw.correction_targets)
      ? (raw.correction_targets as DecisionTracePayload["correction_targets"])
      : [],
    review_summary:
      typeof raw.review_summary === "object" && raw.review_summary !== null
        ? (raw.review_summary as DecisionTracePayload["review_summary"])
        : null,
    deterministic,
  };
}
