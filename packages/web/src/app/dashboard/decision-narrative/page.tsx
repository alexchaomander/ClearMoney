"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  CircleEllipsis,
  MessageCircleQuestion,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import { FALLBACK_DECISION_TRACES, FALLBACK_FINANCIAL_MEMORY } from "../_shared/preview-data";
import {
  useConsentStatus,
  useDecisionTraces,
  useFinancialMemory,
  usePortfolioSummary,
  useSyncAllConnections,
  useConnections,
} from "@/lib/strata/hooks";
import type { DecisionTrace } from "@clearmoney/strata-sdk";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

type Filter = "all" | "analysis" | "recommendation" | "action";

function getDeterministic(trace: DecisionTrace): {
  rulesApplied: Array<{ name: string; passed: boolean; message?: string }>;
  insights: Array<{ title: string; summary?: string; recommendation?: string; severity?: string }>;
  assumptions: string[];
} {
  const raw =
    (trace.outputs as { trace?: Record<string, unknown> })?.trace?.deterministic ?? {};

  const rules =
    typeof raw === "object" && raw !== null && Array.isArray((raw as Record<string, unknown>).rules_applied)
      ? ((raw as Record<string, unknown>).rules_applied as Array<{ name: string; passed: boolean; message?: string }>)
      : [];

  const insights =
    typeof raw === "object" && raw !== null && Array.isArray((raw as Record<string, unknown>).insights)
      ? ((raw as Record<string, unknown>).insights as Array<{ title: string; summary?: string; recommendation?: string; severity?: string }>)
      : [];

  const assumptions =
    typeof raw === "object" && raw !== null && Array.isArray((raw as Record<string, unknown>).assumptions)
      ? ((raw as Record<string, unknown>).assumptions as string[])
      : [];

  return { rulesApplied: rules, insights, assumptions };
}

function DecisionCard({
  trace,
  onOpen,
  isActive,
}: {
  trace: DecisionTrace;
  onOpen: (trace: DecisionTrace) => void;
  isActive: boolean;
}) {
  const deterministic = useMemo(() => getDeterministic(trace), [trace]);
  const firstInsight = deterministic.insights[0];
  const ruleCount = deterministic.rulesApplied.length;
  const isRecent = new Date().getTime() - new Date(trace.created_at).getTime() < 7 * 24 * 60 * 60 * 1000;

  return (
    <button
      onClick={() => onOpen(trace)}
      className={`w-full text-left rounded-xl border p-4 transition ${
        isActive
          ? "border-emerald-400 dark:border-emerald-500/60 bg-emerald-50 dark:bg-emerald-900/15"
          : "border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-emerald-300 dark:hover:border-emerald-900/60"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="font-medium text-slate-900 dark:text-white">{firstInsight?.title ?? "Decision trace"}</p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full px-2 py-1 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              {trace.trace_type}
            </span>
            <span className="rounded-full px-2 py-1 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
              {ruleCount} rule checks
            </span>
            {isRecent ? <span className="rounded-full px-2 py-1 border border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-transparent">Fresh</span> : null}
          </div>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-500 mt-1 shrink-0" />
      </div>

      <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
        {firstInsight?.summary ?? "Open this trace to read the full deterministic rationale and assumptions."}
      </p>

      <p className="mt-3 text-xs text-slate-500">
        {format(new Date(trace.created_at), "MMM d, yyyy · h:mm a")}
      </p>
    </button>
  );
}

export default function DecisionNarrativePage() {
  const { hasConsent, isLoading: consentLoading } = useConsentStatus([
    "decision_traces:read",
    "agent:read",
    "portfolio:read",
    "transactions:read",
    "memory:read",
    "connections:read",
  ]);
  const { hasConsent: hasSyncConsent } = useConsentStatus(["connections:write"]);
  const { hasConsent: hasConnectionsConsent, isLoading: connectionsConsentLoading } = useConsentStatus(["connections:read"]);
  const syncAllConnections = useSyncAllConnections();

  const {
    data: traces,
    isLoading: tracesLoading,
    isError: tracesError,
    error: tracesErrorDetails,
    refetch: refetchTraces,
  } = useDecisionTraces(undefined, { enabled: hasConsent });
  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorDetails,
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasConsent });
  const {
    data: memory,
    isLoading: memoryLoading,
    isError: memoryError,
    error: memoryErrorDetails,
    refetch: refetchMemory,
  } = useFinancialMemory({ enabled: hasConsent });
  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasConnectionsConsent });

  const [filter, setFilter] = useState<Filter>("all");
  const [activeTrace, setActiveTrace] = useState<DecisionTrace | null>(null);

  const source = traces && traces.length > 0 ? traces : FALLBACK_DECISION_TRACES;
  const profile = memory ?? FALLBACK_FINANCIAL_MEMORY;
  const filtered = source.filter((trace) => (filter === "all" ? true : trace.trace_type === filter));
  const usingDemoData = !traces || traces.length === 0 || !portfolio || !memory;
  const isLoading = consentLoading || tracesLoading || portfolioLoading || memoryLoading || connectionsLoading || connectionsConsentLoading;
  const isError = tracesError || portfolioError || memoryError || connectionsError;
  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncTimes = connections
      .map((connection) => connection.last_synced_at)
      .filter((date): date is string => Boolean(date))
      .map((date) => new Date(date).getTime())
      .filter((value) => !Number.isNaN(value));
    if (!syncTimes.length) return null;
    return new Date(Math.max(...syncTimes)).toISOString();
  }, [connections]);

  const sourceItems = useMemo<DataSourceStatusItem[]>(() => {
    const profileCompleteness = [
      profile.monthly_income,
      profile.annual_income,
      profile.monthly_savings_target,
      profile.emergency_fund_target_months,
      profile.risk_tolerance,
      profile.investment_horizon_years,
    ].filter((value) => value !== null && value !== undefined).length;

    return [
      {
        id: "traces",
        title: "Decision traces",
        value: traces?.length ? `${traces.length} trace${traces.length === 1 ? "" : "s"}` : "Fallback",
        detail: traces?.length
          ? "Deterministic recommendation traces are available."
          : "Synthetic traces are used until real decisions are generated.",
        tone: traces?.length ? "live" : "partial",
      },
      {
        id: "portfolio",
        title: "Portfolio signal",
        value: portfolio ? "Live" : "Fallback",
        detail: portfolio
          ? "Net worth and allocation snapshots support trace context."
          : "Portfolio signal is currently synthetic.",
        tone: portfolio ? "live" : "warning",
        href: "/dashboard",
        actionLabel: "Open dashboard",
        lastSyncedAt,
      },
      {
        id: "memory",
        title: "Profile context",
        value: `${profileCompleteness}/6`,
        detail:
          profileCompleteness >= 4
            ? "Profile context is sufficiently detailed."
            : "Add more profile fields to strengthen narrative quality.",
        tone:
          profileCompleteness >= 4
            ? "live"
            : profileCompleteness >= 2
              ? "partial"
              : "warning",
        href: "/profile",
        actionLabel: "Update profile",
      },
      {
        id: "connections",
        title: "Connection sync",
        value: connections?.length ? `${connections.length} active` : "No active links",
        detail: connections?.length
          ? "Connection metadata is active for data provenance."
          : "No active connections loaded yet.",
        tone: connections?.length ? "live" : "warning",
      },
    ];
  }, [
    connections,
    lastSyncedAt,
    portfolio,
    traces,
    profile,
  ]);

  async function handleRefresh() {
    if (!hasSyncConsent) {
      refetchTraces();
      refetchPortfolio();
      refetchMemory();
      if (hasConnectionsConsent) {
        refetchConnections();
      }
      return;
    }
    await syncAllConnections.mutateAsync();
    refetchTraces();
    refetchPortfolio();
    refetchMemory();
    if (hasConnectionsConsent) {
      refetchConnections();
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 transition-colors duration-500">
        <DashboardHeader
          showRefresh={hasSyncConsent}
          isRefreshing={syncAllConnections.isPending}
          onRefresh={handleRefresh}
        />
        <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <DashboardLoadingSkeleton />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 transition-colors duration-500">
        <DashboardHeader
          showRefresh={hasSyncConsent}
          isRefreshing={syncAllConnections.isPending}
          onRefresh={handleRefresh}
        />
        <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-8">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <ApiErrorState
            message="Could not load decision trace narrative."
            error={tracesErrorDetails || portfolioErrorDetails || memoryErrorDetails || connectionsErrorDetails}
            onRetry={handleRefresh}
          />
        </main>
      </div>
    );
  }

  const active = activeTrace ?? filtered[0] ?? null;

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 transition-colors duration-500">
      <div
        className="fixed inset-0 opacity-0 dark:opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader
        showRefresh={hasSyncConsent}
        isRefreshing={syncAllConnections.isPending}
        onRefresh={handleRefresh}
      />

      <main className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Decision Narrative" }]} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">Narrative AI Layer</p>
          <h1 className="mt-2 font-serif text-3xl text-slate-900 dark:text-white">Decision Narrative</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-3xl">
            Every recommendation leaves a complete audit trail. Explore which rules fired, what
            assumptions were applied, and how conclusions were drawn.
          </p>
          {usingDemoData ? (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-300 inline-flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Synthetic traces are active until live decision runs and memory inputs are connected.
            </p>
          ) : null}
        </motion.div>

        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />

        <ConsentGate
          scopes={[
            "decision_traces:read",
            "agent:read",
            "portfolio:read",
            "transactions:read",
            "memory:read",
          ]}
          purpose="Load historical decision traces and the rationale behind recommendations"
        >
          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-1 space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-wrap gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "Analysis", value: "analysis" },
                  { label: "Recommendation", value: "recommendation" },
                  { label: "Action", value: "action" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value as Filter)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      filter === option.value
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {filtered.length === 0 ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 text-slate-600 dark:text-slate-400 text-sm">
                  No traces in this filter yet. Generate recommendations in the advisor to populate your
                  decision timeline.
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((trace) => (
                    <DecisionCard
                      key={trace.id}
                      trace={trace}
                      onOpen={setActiveTrace}
                      isActive={active?.id === trace.id}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="lg:col-span-2">
              {!active ? (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-slate-600 dark:text-slate-400 text-sm">
                  Select a trace from the list to view details.
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Trace details</p>
                      <h2 className="text-xl text-slate-900 dark:text-white mt-1">
                        {(getDeterministic(active).insights[0]?.title) ?? `Decision ${active.trace_type}`}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        {active.recommendation_id ? `Recommendation ${active.recommendation_id}` : `Type: ${active.trace_type}`}
                      </p>
                    </div>

                    <span className="text-xs rounded-full border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-600 dark:text-slate-400">
                      {format(new Date(active.created_at), "PPpp")}
                    </span>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <MessageCircleQuestion className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Summary
                    </h3>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-2">
                      {(active.outputs as { summary?: string })?.summary ??
                        "This trace records the deterministic decision logic and recommendations used at the time of generation."}
                    </p>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Rules and assumptions
                    </h3>
                    <div className="mt-3 space-y-3">
                      {getDeterministic(active).rulesApplied.length === 0 ? (
                        <p className="text-sm text-slate-600 dark:text-slate-400">No deterministic rules were recorded.</p>
                      ) : (
                        getDeterministic(active).rulesApplied.map((rule, index) => (
                          <article
                            key={`${rule.name}-${index}`}
                            className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 bg-white dark:bg-slate-900"
                          >
                            <div className="flex items-center justify-between text-sm">
                              <p className="text-slate-800 dark:text-slate-100">{rule.name}</p>
                              <span
                                className={`text-xs rounded-full px-2 py-1 ${
                                  rule.passed
                                    ? "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20"
                                    : "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-900/20"
                                }`}
                              >
                                {rule.passed ? "PASS" : "FLAG"}
                              </span>
                            </div>
                            {rule.message ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{rule.message}</p> : null}
                          </article>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <CircleEllipsis className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Input snapshot
                    </h3>
                    <pre className="mt-3 text-xs text-slate-700 dark:text-slate-300 overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(active.input_data, null, 2)}
                    </pre>
                  </div>

                  <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                    <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                      <CalendarClock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Raw reasoning
                    </h3>
                    <pre className="mt-3 text-xs text-slate-700 dark:text-slate-300 overflow-auto whitespace-pre-wrap">
                      {JSON.stringify(active.reasoning_steps, null, 2)}
                    </pre>
                  </div>

                  {getDeterministic(active).assumptions.length > 0 ? (
                    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                        Assumptions
                      </h3>
                      <ul className="mt-3 text-sm text-slate-700 dark:text-slate-300 list-disc pl-5 space-y-1">
                        {getDeterministic(active).assumptions.map((assumption, index) => (
                          <li key={`${assumption}-${index}`}>{assumption}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => refetchTraces()}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh traces
                    </button>
                    <p className="text-xs text-slate-500 self-center">
                      Active scope: {hasConsent ? "Connected" : "Consent required"}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </ConsentGate>
      </main>
    </div>
  );
}
