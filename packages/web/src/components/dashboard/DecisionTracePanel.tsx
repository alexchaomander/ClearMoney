"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Database, Info } from "lucide-react";
import { useDecisionTraces } from "@/lib/strata/hooks";
import { getDecisionTracePayload } from "@/lib/strata/decision-traces";
import { format } from "date-fns";
import type { DecisionTrace } from "@clearmoney/strata-sdk";

function formatTraceType(type: DecisionTrace["trace_type"]) {
  switch (type) {
    case "analysis":
      return "Analysis";
    case "action":
      return "Action";
    default:
      return "Recommendation";
  }
}

export function DecisionTracePanel() {
  const { data: traces, isLoading } = useDecisionTraces();
  const [activeTrace, setActiveTrace] = useState<DecisionTrace | null>(null);

  const recentTraces = useMemo(() => traces?.slice(0, 6) ?? [], [traces]);
  const tracePayload = useMemo(
    () => (activeTrace ? getDecisionTracePayload(activeTrace) : null),
    [activeTrace]
  );

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/70 p-6 shadow-sm dark:shadow-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Decision Traces</h2>
          <p className="text-sm text-slate-500 dark:text-neutral-400">
            See the data, rules, and reasoning behind every recommendation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-neutral-500">
          <Database className="h-4 w-4" />
          Auditable history
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50 p-4 text-sm text-slate-400 dark:text-neutral-400">
            Loading traces...
          </div>
        ) : recentTraces.length === 0 ? (
          <div className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/50 p-4 text-sm text-slate-400 dark:text-neutral-400">
            No decision traces yet. Create recommendations in the advisor to see them here.
          </div>
        ) : (
          recentTraces.map((trace) => (
            <button
              key={trace.id}
              onClick={() => setActiveTrace(trace)}
              className="w-full rounded-xl border border-slate-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/40 p-4 text-left transition hover:border-emerald-500/50 hover:bg-slate-100 dark:hover:bg-neutral-900/70 shadow-sm dark:shadow-none"
            >
              {(() => {
                const payload = getDecisionTracePayload(trace);
                return (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {payload?.title ?? `${formatTraceType(trace.trace_type)} Trace`}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400">
                    {format(new Date(trace.created_at), "MMM d, yyyy · h:mm a")}
                  </p>
                  {payload ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:border-neutral-700 dark:text-neutral-400">
                        {payload.determinism_class}
                      </span>
                      <span className="rounded-full border border-emerald-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-700 dark:border-emerald-900 dark:text-emerald-300">
                        {payload.recommendation_readiness}
                      </span>
                    </div>
                  ) : null}
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 dark:text-neutral-500" />
              </div>
                );
              })()}
            </button>
          ))
        )}
      </div>

      {activeTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-neutral-800 px-6 py-4">
              <div>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Decision Trace</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {formatTraceType(activeTrace.trace_type)} #{activeTrace.id.slice(0, 8)}
                </h3>
              </div>
              <button
                onClick={() => setActiveTrace(null)}
                className="text-sm text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 overflow-y-auto p-6 text-sm text-slate-700 dark:text-neutral-200">
              {tracePayload ? (
                <section className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40 p-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-slate-100 dark:text-slate-900">
                      {tracePayload.trace_kind}
                    </span>
                    <span className="rounded-full border border-slate-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600 dark:border-neutral-700 dark:text-neutral-300">
                      {tracePayload.continuity_status}
                    </span>
                    <span className="rounded-full border border-emerald-200 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-700 dark:border-emerald-900 dark:text-emerald-300">
                      {tracePayload.recommendation_readiness}
                    </span>
                  </div>
                  {tracePayload.summary ? (
                    <p className="mt-3 text-sm text-slate-600 dark:text-neutral-300">{tracePayload.summary}</p>
                  ) : null}
                </section>
              ) : null}
              {tracePayload?.rules_applied?.length ? (
                <section className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    <Info className="h-4 w-4" />
                    Deterministic Rules
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    {tracePayload.rules_applied.map((rule, idx) => (
                      <div
                        key={`${rule.name}-${idx}`}
                        className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm text-slate-900 dark:text-white">{rule.name}</p>
                          {rule.message ? (
                            <p className="text-xs text-slate-500 dark:text-neutral-400">{rule.message}</p>
                          ) : null}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            rule.passed ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"
                          }`}
                        >
                          {rule.passed ? "PASS" : "FLAG"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              {tracePayload?.insights?.length ? (
                <section className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    <Info className="h-4 w-4" />
                    Deterministic Insights
                  </div>
                  <div className="mt-3 space-y-3">
                    {tracePayload.insights.map((insight, idx) => (
                      <div key={`${insight.title}-${idx}`} className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-slate-900 dark:text-white">{insight.title}</p>
                          {insight.severity ? (
                            <span className="text-xs uppercase text-slate-400 dark:text-neutral-500">{insight.severity}</span>
                          ) : null}
                        </div>
                        {insight.summary ? (
                          <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{insight.summary}</p>
                        ) : null}
                        {insight.recommendation ? (
                          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-300">{insight.recommendation}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              {tracePayload?.confidence_factors?.length ? (
                <section className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    <Info className="h-4 w-4" />
                    Confidence Factors
                  </div>
                  <div className="mt-3 space-y-2">
                    {tracePayload.confidence_factors.map((factor) => (
                      <div key={factor.label} className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-950/60 px-3 py-2">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm text-slate-900 dark:text-white">{factor.label}</p>
                          <span className="text-xs text-slate-500 dark:text-neutral-400">{Math.round(factor.value * 100)}%</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{factor.reason}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              {tracePayload?.remediation_actions?.length ? (
                <section className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    <Info className="h-4 w-4" />
                    What To Fix First
                  </div>
                  <div className="mt-3 space-y-3">
                    {tracePayload.remediation_actions.map((action) => (
                      <a
                        key={action.action_id}
                        href={action.href}
                        className="block rounded-lg border border-amber-200 bg-white px-3 py-2 dark:border-amber-900/60 dark:bg-slate-950/50"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{action.label}</p>
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700 dark:text-amber-300">{action.priority}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-500 dark:text-neutral-400">{action.description}</p>
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}
              {tracePayload?.assumptions?.length ? (
                <section className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    <Info className="h-4 w-4" />
                    Assumptions
                  </div>
                  <ul className="mt-3 space-y-2 text-xs text-slate-600 dark:text-neutral-300">
                    {tracePayload.assumptions.map((assumption, idx) => (
                      <li key={`${assumption}-${idx}`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-neutral-800 dark:bg-neutral-950/60">
                        {assumption}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              <section className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  <Info className="h-4 w-4" />
                  Inputs
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-600 dark:text-neutral-300">
                  {JSON.stringify(activeTrace.input_data, null, 2)}
                </pre>
              </section>
              <section className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  <Info className="h-4 w-4" />
                  Reasoning
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-600 dark:text-neutral-300">
                  {JSON.stringify(activeTrace.reasoning_steps, null, 2)}
                </pre>
              </section>
              <section className="rounded-xl border border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-900/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                  <Info className="h-4 w-4" />
                  Outputs
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-slate-600 dark:text-neutral-300">
                  {JSON.stringify(activeTrace.outputs, null, 2)}
                </pre>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
