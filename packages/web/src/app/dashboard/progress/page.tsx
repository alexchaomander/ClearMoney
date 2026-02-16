"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarClock,
  Compass,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import {
  useAccounts,
  useConsentStatus,
  useFinancialMemory,
  useConnections,
  usePortfolioHistory,
  usePortfolioSummary,
  useSpendingSummary,
  useSyncAllConnections,
} from "@/lib/strata/hooks";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { getPreviewPortfolioHistory, getPreviewPortfolioSummary, FALLBACK_SPENDING_SUMMARY } from "../_shared/preview-data";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PortfolioHistoryRange } from "@clearmoney/strata-sdk";

const RANGES: { label: string; value: PortfolioHistoryRange }[] = [
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
  { label: "ALL", value: "all" },
];

type RiskBand = "good" | "watch" | "critical";

interface Milestone {
  label: string;
  value: number;
  target: number;
  unit: string;
  warnThreshold: number;
  lowerIsBetter?: boolean;
}

function scoreTone(
  value: number,
  target: number,
  warnThreshold: number,
  lowerIsBetter = false,
): RiskBand {
  if (lowerIsBetter) {
    if (value <= target) return "good";
    if (value <= warnThreshold) return "watch";
    return "critical";
  }

  if (value >= target) return "good";
  if (value >= warnThreshold) return "watch";
  return "critical";
}

function toneToStyle(level: RiskBand) {
  if (level === "good") {
    return {
      badge: "text-emerald-200 bg-emerald-900/25 border-emerald-700",
      bar: "bg-emerald-500",
      value: "text-emerald-200",
    };
  }
  if (level === "watch") {
    return {
      badge: "text-amber-200 bg-amber-900/25 border-amber-700",
      bar: "bg-amber-500",
      value: "text-amber-200",
    };
  }
  return {
    badge: "text-rose-200 bg-rose-900/25 border-rose-700",
    bar: "bg-rose-500",
    value: "text-rose-200",
  };
}

export default function ProgressPage() {
  const { hasConsent, isLoading: consentLoading } = useConsentStatus([
    "portfolio:read",
    "accounts:read",
    "transactions:read",
    "memory:read",
  ]);
  const { hasConsent: hasSyncConsent } = useConsentStatus(["connections:write"]);
  const syncAllConnections = useSyncAllConnections();
  const [range, setRange] = useState<PortfolioHistoryRange>("1y");

  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorDetails,
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasConsent });

  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
    error: accountsErrorDetails,
    refetch: refetchAccounts,
  } = useAccounts({ enabled: hasConsent });

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorDetails,
    refetch: refetchHistory,
  } = usePortfolioHistory(range, { enabled: hasConsent });

  const {
    data: spending,
    isLoading: spendingLoading,
    isError: spendingError,
    error: spendingErrorDetails,
    refetch: refetchSpending,
  } = useSpendingSummary(3, { enabled: hasConsent });

  const {
    data: memory,
    isLoading: memoryLoading,
    isError: memoryError,
    error: memoryErrorDetails,
    refetch: refetchMemory,
  } = useFinancialMemory({ enabled: hasConsent });

  const { hasConsent: hasConnectionsConsent, isLoading: connectionsConsentLoading } = useConsentStatus(["connections:read"]);
  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasConnectionsConsent });

  const summary = portfolio ?? getPreviewPortfolioSummary();
  const timeline = history ?? getPreviewPortfolioHistory(range);
  const spendingSummary = spending ?? FALLBACK_SPENDING_SUMMARY;

  const debtBalance = useMemo(
    () =>
      accounts?.debt_accounts
        ? accounts.debt_accounts.reduce((sum, debt) => sum + debt.balance, 0)
        : summary.total_debt_value,
    [accounts?.debt_accounts, summary.total_debt_value],
  );

  const derived = useMemo(() => {
    const first = timeline[0]?.value ?? summary.net_worth;
    const last = timeline[timeline.length - 1]?.value ?? first;
    const change = last - first;
    const changePercent = first > 0 ? change / first : 0;

    const monthlyBurn = spendingSummary.monthly_average > 0 ? spendingSummary.monthly_average : 1;
    const runway = summary.total_cash_value / monthlyBurn;
    const annualIncome = memory?.monthly_income ? memory.monthly_income * 12 : summary.total_investment_value * 0.15;
    const debtCoverage = annualIncome > 0 ? debtBalance / annualIncome : 0;
    const reserveRatio = annualIncome > 0 ? summary.total_cash_value / annualIncome : 0;

    const milestones: Milestone[] = [
      {
        label: "Runway",
        value: runway,
        target: 12,
        warnThreshold: 6,
        unit: "mo",
        lowerIsBetter: false,
      },
      {
        label: "Debt coverage",
        value: debtCoverage,
        target: 0.25,
        warnThreshold: 0.45,
        unit: "of annual income",
        lowerIsBetter: true,
      },
      {
        label: "Cash reserve",
        value: reserveRatio,
        target: 0.5,
        warnThreshold: 0.25,
        unit: "of annual income",
        lowerIsBetter: false,
      },
    ];

    return {
      first,
      last,
      change,
      changePercent,
      runway,
      debtCoverage,
      reserveRatio,
      milestones,
      minNetWorth: timeline.reduce((acc, point) => Math.min(acc, point.value), first),
      maxNetWorth: timeline.reduce((acc, point) => Math.max(acc, point.value), first),
      monthlyBurn,
    };
  }, [accounts, debtBalance, memory?.monthly_income, summary.net_worth, summary.total_cash_value, spendingSummary.monthly_average, timeline]);

  const isLoading =
    consentLoading ||
    connectionsConsentLoading ||
    connectionsLoading ||
    portfolioLoading ||
    accountsLoading ||
    historyLoading ||
    spendingLoading ||
    memoryLoading;

  const isError =
    portfolioError ||
    accountsError ||
    historyError ||
    spendingError ||
    memoryError ||
    connectionsError;

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

  const accountCount =
    (accounts?.investment_accounts?.length ?? 0) +
    (accounts?.cash_accounts?.length ?? 0) +
    (accounts?.debt_accounts?.length ?? 0);

  const sourceItems = useMemo<DataSourceStatusItem[]>(() => {
    const spendingCoverage = spendingSummary.months_analyzed > 0;
    const profileCompleteness = [
      memory?.monthly_income,
      memory?.monthly_savings_target,
      memory?.risk_tolerance,
      memory?.annual_income,
      memory?.emergency_fund_target_months,
    ].filter((value) => value !== null && value !== undefined).length;

    return [
      {
        id: "portfolio",
        title: "Portfolio summary",
        value: portfolio ? "Live" : "Fallback",
        detail: portfolio
          ? "Net worth baseline is connected."
          : "Portfolio preview is currently active.",
        tone: portfolio ? "live" : "missing",
        href: "/dashboard",
        actionLabel: "Open dashboard",
        lastSyncedAt,
      },
      {
        id: "accounts",
        title: "Accounts",
        value: `${accountCount} source${accountCount === 1 ? "" : "s"}`,
        detail: accounts
          ? "Account inventory is connected."
          : "No account signals are active yet.",
        tone: accounts ? "live" : "warning",
      },
      {
        id: "history",
        title: "Portfolio history",
        value: timeline?.length ? `${timeline.length} points` : "Fallback",
        detail: timeline?.length
          ? "Trajectory points are available."
          : "History currently reflects synthetic data.",
        tone: timeline?.length ? "live" : "partial",
      },
      {
        id: "spending",
        title: "Spending trend",
        value: spendingCoverage ? `${spendingSummary.months_analyzed} months` : "Fallback",
        detail: spendingCoverage
          ? `${spendingSummary.categories.length} category buckets seen.`
          : "Spend trend requires transactions in progress.",
        tone: spending ? "live" : "partial",
      },
      {
        id: "profile",
        title: "Profile depth",
        value: `${profileCompleteness}/5`,
        detail:
          profileCompleteness >= 4
            ? "Profile has strong recommendation signal."
            : "Add remaining profile traits for stronger progression context.",
        tone:
          profileCompleteness >= 4
            ? "live"
            : profileCompleteness >= 2
              ? "partial"
              : "warning",
        href: "/profile",
        actionLabel: "Complete profile",
      },
      {
        id: "connections",
        title: "Connection freshness",
        value: connections?.length ? `${connections.length} active` : "No active links",
        detail: connections?.length ? "Integration layer has synced records." : "No connection metadata yet.",
        tone: connections?.length ? "live" : "warning",
      },
    ];
  }, [
    accountCount,
    lastSyncedAt,
    memory?.annual_income,
    memory?.emergency_fund_target_months,
    memory?.monthly_income,
    memory?.monthly_savings_target,
    memory?.risk_tolerance,
    portfolio,
    spending?.categories.length,
    spendingSummary.months_analyzed,
    timeline?.length,
    timeline?.length,
    connections?.length,
    accounts?.debt_accounts?.length,
    accounts?.cash_accounts?.length,
    accounts?.investment_accounts?.length,
  ]);

  const usingDemoData = !portfolio || !accounts || !history || !spending || !memory;

  async function handleRefresh() {
    if (!hasSyncConsent) {
      refetchPortfolio();
      refetchAccounts();
      refetchHistory();
      refetchSpending();
      refetchMemory();
      if (hasConnectionsConsent) {
        refetchConnections();
      }
      return;
    }
    await syncAllConnections.mutateAsync();
    refetchPortfolio();
    refetchAccounts();
    refetchHistory();
    refetchSpending();
    refetchMemory();
    if (hasConnectionsConsent) {
      refetchConnections();
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <DashboardHeader
          showRefresh={hasSyncConsent}
          isRefreshing={syncAllConnections.isPending}
          onRefresh={handleRefresh}
        />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <DashboardLoadingSkeleton />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <DashboardHeader
          showRefresh={hasSyncConsent}
          isRefreshing={syncAllConnections.isPending}
          onRefresh={handleRefresh}
        />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <ApiErrorState
            message="Could not load progress data."
            error={
              portfolioErrorDetails ??
              accountsErrorDetails ??
              spendingErrorDetails ??
              memoryErrorDetails ??
              historyErrorDetails
            }
            onRetry={handleRefresh}
          />
        </main>
      </div>
    );
  }

  const rangeLabel = RANGES.find((entry) => entry.value === range)?.label ?? "1Y";
  const trendTone = derived.change >= 0 ? "good" : "critical";

  return (
    <div className="min-h-screen bg-neutral-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
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

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Progress tracking</p>
          <h1 className="mt-2 font-serif text-3xl text-white">Founder Progress</h1>
          <p className="mt-2 text-neutral-400 max-w-3xl">
            Follow measurable progress across runway, net worth direction, and debt pressure.
          </p>
          {usingDemoData ? (
            <p className="mt-2 text-xs text-amber-300 inline-flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Showing synthetic preview trajectory until live portfolio history is connected.
            </p>
          ) : null}
        </motion.div>

        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />

        <ConsentGate
          scopes={[
            "portfolio:read",
            "accounts:read",
            "transactions:read",
            "memory:read",
          ]}
          purpose="Track your real portfolio trajectory and progress metrics."
        >
          <section className="grid lg:grid-cols-4 gap-4 mb-6">
            <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="text-sm text-neutral-400">Net worth change ({rangeLabel})</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatCurrency(derived.change)}</p>
              <p
                className={`mt-2 text-xs ${
                  trendTone === "good" ? "text-emerald-300" : "text-rose-300"
                }`}
              >
                {trendTone === "good" ? (
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                )}
                {formatPercent(derived.changePercent, 1)}
              </p>
            </article>

            <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="text-sm text-neutral-400">Runway</p>
              <p className="mt-2 text-2xl font-semibold text-white">{derived.runway.toFixed(1)} mo</p>
              <p className="mt-2 text-xs text-neutral-400">Against {formatCurrency(derived.monthlyBurn)} monthly burn.</p>
            </article>

            <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="text-sm text-neutral-400">Debt pressure</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatPercent(derived.debtCoverage, 1)}</p>
              <p className="mt-2 text-xs text-neutral-400">Debt versus annual income coverage.</p>
            </article>

            <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
              <p className="text-sm text-neutral-400">Cash reserve ratio</p>
              <p className="mt-2 text-2xl font-semibold text-white">{formatPercent(derived.reserveRatio, 1)}</p>
              <p className="mt-2 text-xs text-neutral-400">Cash compared to annual income target.</p>
            </article>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 mb-6">
            <div className="flex flex-wrap justify-between items-center gap-3">
              <h2 className="text-lg text-white font-medium">Net worth trajectory</h2>
              <div className="flex gap-1 rounded-lg bg-neutral-950 p-1">
                {RANGES.map((entry) => (
                  <button
                    type="button"
                    key={entry.value}
                    onClick={() => setRange(entry.value)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      range === entry.value
                        ? "bg-emerald-600 text-white"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    {entry.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 h-72 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeline}>
                  <defs>
                    <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: "#737373", fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(value) => formatCurrency(Number(value), 0)}
                    tick={{ fill: "#737373", fontSize: 11 }}
                    width={84}
                  />
                  <Tooltip formatter={(value) => formatCurrency(Number(value), 2)} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#34d399"
                    fill="url(#progressFill)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-3 text-xs text-neutral-500">
              Lowest: {formatCurrency(derived.minNetWorth)} • Highest: {formatCurrency(derived.maxNetWorth)}
            </p>
          </section>

          <section className="grid lg:grid-cols-3 gap-4 mb-6">
            {derived.milestones.map((milestone) => {
              const lowerIsBetter = milestone.lowerIsBetter ?? false;
              const tone = scoreTone(
                milestone.value,
                milestone.target,
                milestone.warnThreshold,
                lowerIsBetter,
              );
              const toneStyles = toneToStyle(tone);
              const isRunwayMilestone = milestone.label === "Runway";
              const displayValue =
                isRunwayMilestone ? `${milestone.value.toFixed(1)} ${milestone.unit}` : formatPercent(milestone.value, 1);
              const displayTarget =
                isRunwayMilestone
                  ? `${milestone.target.toFixed(1)} ${milestone.unit}`
                  : formatPercent(milestone.target, 1);

              const completion = lowerIsBetter
                ? Math.max(4, 100 - Math.min(100, (milestone.value / milestone.warnThreshold) * 100))
                : Math.max(4, Math.min(100, (milestone.value / milestone.target) * 100));

              return (
                  <article
                    key={milestone.label}
                    className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"
                  >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white">{milestone.label}</p>
                    <span className={`text-xs px-2 py-1 rounded-full border ${toneStyles.badge}`}>{tone}</span>
                  </div>
                  <p className={`mt-3 text-lg ${toneStyles.value}`}>{displayValue}</p>
                  <p className={`mt-2 text-xs ${toneStyles.value}`}>Target {displayTarget}</p>
                  <div className="mt-3 h-2 rounded-full bg-neutral-800">
                    <div className={`h-full ${toneStyles.bar}`} style={{ width: `${completion}%` }} />
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg text-white font-medium">Next actions</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Close gaps and convert assumptions into measurable execution.
                </p>
              </div>
              <CalendarClock className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <Link
                href="/dashboard/scenario-lab"
                className="rounded-lg border border-neutral-700 p-3 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Run a 12-month scenario
              </Link>
              <Link
                href="/dashboard/founder-operating-room"
                className="rounded-lg border border-neutral-700 p-3 text-sm text-neutral-200 hover:bg-neutral-800"
              >
                Review commingling and runway signals
              </Link>
              <Link
                href="/dashboard/command-center"
                className="rounded-lg border border-neutral-700 p-3 text-sm text-neutral-200 hover:bg-neutral-800 flex items-center gap-2"
              >
                <Compass className="w-3 h-3" />
                Open command center
              </Link>
              <Link
                href="/dashboard/decision-narrative"
                className="rounded-lg border border-emerald-800 bg-emerald-900/15 p-3 text-sm text-emerald-200 hover:bg-emerald-900/30"
              >
                Validate new decisions
                <ArrowRight className="w-3 h-3 inline ml-2" />
              </Link>
            </div>
          </section>
        </ConsentGate>
      </main>
    </div>
  );
}
