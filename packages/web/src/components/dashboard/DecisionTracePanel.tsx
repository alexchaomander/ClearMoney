"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Database, Info } from "lucide-react";
import { useDecisionTraces } from "@/lib/strata/hooks";
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
  const deterministic = useMemo(() => {
    if (!activeTrace) return null;
    const outputTrace = (activeTrace.outputs as { trace?: Record<string, unknown> })?.trace;
    if (!outputTrace || typeof outputTrace !== "object") return null;
    return (outputTrace as Record<string, unknown>).deterministic as
      | { rules_applied?: Array<{ name: string; passed: boolean; value?: unknown; threshold?: unknown; message?: string }>; insights?: Array<{ title: string; summary?: string; recommendation?: string; severity?: string }>; assumptions?: string[] }
      | undefined
      | null;
  }, [activeTrace]);

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/70 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Decision Traces</h2>
          <p className="text-sm text-neutral-400">
            See the data, rules, and reasoning behind every recommendation.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Database className="h-4 w-4" />
          Auditable history
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-400">
            Loading traces...
          </div>
        ) : recentTraces.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-sm text-neutral-400">
            No decision traces yet. Create recommendations in the advisor to see them here.
          </div>
        ) : (
          recentTraces.map((trace) => (
            <button
              key={trace.id}
              onClick={() => setActiveTrace(trace)}
              className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-left transition hover:border-emerald-500/50 hover:bg-neutral-900/70"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">
                    {formatTraceType(trace.trace_type)} Trace
                  </p>
                  <p className="text-xs text-neutral-400">
                    {format(new Date(trace.created_at), "MMM d, yyyy · h:mm a")}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-neutral-500" />
              </div>
            </button>
          ))
        )}
      </div>

      {activeTrace && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950">
            <div className="flex items-start justify-between border-b border-neutral-800 px-6 py-4">
              <div>
                <p className="text-sm text-emerald-400">Decision Trace</p>
                <h3 className="text-lg font-semibold text-white">
                  {formatTraceType(activeTrace.trace_type)} #{activeTrace.id.slice(0, 8)}
                </h3>
              </div>
              <button
                onClick={() => setActiveTrace(null)}
                className="text-sm text-neutral-400 hover:text-white"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 overflow-y-auto p-6 text-sm text-neutral-200">
              {deterministic?.rules_applied?.length ? (
                <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
                    <Info className="h-4 w-4" />
                    Deterministic Rules
                  </div>
                  <div className="mt-3 space-y-2 text-sm">
                    {deterministic.rules_applied.map((rule, idx) => (
                      <div
                        key={`${rule.name}-${idx}`}
                        className="flex items-start justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm text-white">{rule.name}</p>
                          {rule.message ? (
                            <p className="text-xs text-neutral-400">{rule.message}</p>
                          ) : null}
                        </div>
                        <span
                          className={`text-xs font-semibold ${
                            rule.passed ? "text-emerald-300" : "text-rose-300"
                          }`}
                        >
                          {rule.passed ? "PASS" : "FLAG"}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              {deterministic?.insights?.length ? (
                <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
                    <Info className="h-4 w-4" />
                    Deterministic Insights
                  </div>
                  <div className="mt-3 space-y-3">
                    {deterministic.insights.map((insight, idx) => (
                      <div key={`${insight.title}-${idx}`} className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-white">{insight.title}</p>
                          {insight.severity ? (
                            <span className="text-xs uppercase text-neutral-500">{insight.severity}</span>
                          ) : null}
                        </div>
                        {insight.summary ? (
                          <p className="mt-1 text-xs text-neutral-400">{insight.summary}</p>
                        ) : null}
                        {insight.recommendation ? (
                          <p className="mt-2 text-xs text-emerald-300">{insight.recommendation}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
              <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
                  <Info className="h-4 w-4" />
                  Inputs
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-neutral-300">
                  {JSON.stringify(activeTrace.input_data, null, 2)}
                </pre>
              </section>
              <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
                  <Info className="h-4 w-4" />
                  Reasoning
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-neutral-300">
                  {JSON.stringify(activeTrace.reasoning_steps, null, 2)}
                </pre>
              </section>
              <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-neutral-400">
                  <Info className="h-4 w-4" />
                  Outputs
                </div>
                <pre className="mt-3 whitespace-pre-wrap text-xs text-neutral-300">
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
