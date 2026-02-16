"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  CircleDollarSign,
  Link2,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  Cell,
  type TooltipProps,
} from "recharts";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  useAccounts,
  useBankAccounts,
  useConsentStatus,
  useConnections,
  usePortfolioHistory,
  usePortfolioSummary,
  useSpendingSummary,
  useSyncAllConnections,
} from "@/lib/strata/hooks";
import { formatCurrency, formatPercent, formatTitleCase } from "@/lib/shared/formatters";
import {
  FALLBACK_SPENDING_SUMMARY,
  getPreviewPortfolioHistory,
  getPreviewPortfolioSummary,
} from "../_shared/preview-data";
import type { PortfolioHistoryRange } from "@clearmoney/strata-sdk";

const RANGES: { label: string; value: PortfolioHistoryRange }[] = [
  { label: "30D", value: "30d" },
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
  { label: "ALL", value: "all" },
];

interface WaterfallNode {
  label: string;
  value: number;
  type: "asset" | "debt";
  details: string[];
}

function formatAxisDate(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const numericPayload = (payload ?? []).filter(
    (point): point is { value: number; dataKey?: string | number; name?: string } =>
      typeof point?.value === "number",
  );
  if (!active || !numericPayload.length || !label) return null;
  const labelText = String(label);
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200">
      <p className="text-neutral-400 mb-1">{formatAxisDate(labelText)}</p>
      {numericPayload.map((item) => {
        const key = String(item.dataKey ?? item.name ?? "value");
        return (
          <p key={key} className="text-sm text-white">
            {item.dataKey === "value" ? `Net worth: ${formatCurrency(item.value)}` : `${key}: ${formatCurrency(item.value)}`}
          </p>
        );
      })}
    </div>
  );
}

function ScoreBadge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "positive" | "neutral" | "warn";
}) {
  const toneClass =
    tone === "positive"
      ? "text-emerald-300 bg-emerald-900/40"
      : tone === "warn"
        ? "text-amber-300 bg-amber-900/30"
        : "text-neutral-300 bg-neutral-800";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium tracking-wide ${toneClass}`}
    >
      {label}: {value}
    </span>
  );
}

export default function GraphPage() {
  const [selectedRange, setSelectedRange] = useState<PortfolioHistoryRange>("1y");

  const { hasConsent: hasDataConsent, isLoading: consentLoading } = useConsentStatus([
    "portfolio:read",
    "accounts:read",
    "transactions:read",
    "connections:read",
  ]);
  const { hasConsent: hasSyncConsent } = useConsentStatus(["connections:write"]);

  const syncAllConnections = useSyncAllConnections();
  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorDetails,
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasDataConsent });

  const {
    data: allAccounts,
    isLoading: allAccountsLoading,
    isError: accountsError,
    error: accountsErrorDetails,
    refetch: refetchAccounts,
  } = useAccounts({ enabled: hasDataConsent });

  const {
    data: bankAccounts,
    isLoading: bankAccountsLoading,
    isError: bankAccountsError,
    error: bankAccountsErrorDetails,
    refetch: refetchBankAccounts,
  } = useBankAccounts({ enabled: hasDataConsent });

  const {
    data: spending,
    isLoading: spendingLoading,
    isError: spendingError,
    error: spendingErrorDetails,
    refetch: refetchSpending,
  } = useSpendingSummary(3, { enabled: hasDataConsent });

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorDetails,
    refetch: refetchHistory,
  } = usePortfolioHistory(selectedRange, { enabled: hasDataConsent });
  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasDataConsent });

  const isLoading =
    consentLoading ||
    portfolioLoading ||
    allAccountsLoading ||
    bankAccountsLoading ||
    spendingLoading ||
    historyLoading ||
    connectionsLoading;

  const isError =
    portfolioError ||
    accountsError ||
    bankAccountsError ||
    spendingError ||
    historyError ||
    connectionsError;

  const usingDemoData =
    !portfolio || !allAccounts || !bankAccounts || !spending || !history;
  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncTimes = connections
      .map((connection) => connection.last_synced_at)
      .filter((date): date is string => Boolean(date))
      .map((date) => new Date(date).getTime())
      .filter((timestamp) => !Number.isNaN(timestamp));
    if (!syncTimes.length) return null;
    return new Date(Math.max(...syncTimes)).toISOString();
  }, [connections]);
  const sourceItems = useMemo<DataSourceStatusItem[]>(() => {
    const accountCount =
      (allAccounts?.investment_accounts?.length ?? 0) +
      (allAccounts?.cash_accounts?.length ?? 0) +
      (allAccounts?.debt_accounts?.length ?? 0);
    const bankCount = bankAccounts?.length ?? 0;
    const liveCore = Boolean(portfolio && allAccounts && bankAccounts && spending);

    return [
      {
        id: "portfolio",
        title: "Portfolio summary",
        value: liveCore ? "Live" : "Fallback",
        detail: liveCore
          ? "Portfolio and allocation data is connected."
          : "Synthetic portfolio summary is in use.",
        tone: liveCore ? "live" : "missing",
        href: "/dashboard",
        actionLabel: "Open dashboard",
        lastSyncedAt,
      },
      {
        id: "accounts",
        title: "Accounts",
        value: `${accountCount} source${accountCount === 1 ? "" : "s"}`,
        detail: allAccounts
          ? "Connected account inventory is available."
          : "Account list is still using fallback values.",
        tone: allAccounts ? "live" : "missing",
      },
      {
        id: "banking",
        title: "Bank links",
        value: `${bankCount} link${bankCount === 1 ? "" : "s"}`,
        detail: bankCount > 0 ? "Bank connectors are present." : "No active bank links.",
        tone: bankCount > 0 ? "live" : "warning",
        href: "/connect",
        actionLabel: "Link bank",
        lastSyncedAt,
      },
      {
        id: "spending",
        title: "Spending visibility",
        value: spending ? `${spending.months_analyzed} months` : "Fallback",
        detail:
          spending && spending.months_analyzed > 0
            ? `${spending.categories.length} category buckets visible.`
            : "Spending is not streaming yet.",
        tone: spending ? "live" : "partial",
        href: "/dashboard/graph",
        actionLabel: "Review spend",
      },
      {
        id: "history",
        title: "Range history",
        value: history && !usingDemoData ? `${history.length} points` : "Fallback",
        detail:
          history && !usingDemoData
            ? "Portfolio history is fed by live source snapshots."
            : "History preview is loaded without live sync.",
        tone: history ? "live" : "partial",
      },
      {
        id: "connections",
        title: "Connections",
        value: connections?.length ? `${connections.length} active` : "No active links",
        detail: connections?.length
          ? "Connection metadata is present and tracked."
          : "No active Strata connections available.",
        tone: connections?.length ? "live" : "warning",
      },
    ];
  }, [
    allAccounts,
    bankAccounts,
    usingDemoData,
    history,
    lastSyncedAt,
    connections,
    portfolio,
    spending,
    spending?.months_analyzed,
    spending?.categories,
  ]);

  const errorDetails =
    portfolioErrorDetails ||
    accountsErrorDetails ||
    bankAccountsErrorDetails ||
    spendingErrorDetails ||
    historyErrorDetails ||
    connectionsErrorDetails;

  const effectiveSummary = portfolio ?? getPreviewPortfolioSummary();
  const effectiveHistory = history ?? getPreviewPortfolioHistory(selectedRange);
  const effectiveSpending = spending ?? FALLBACK_SPENDING_SUMMARY;

  const financialNodes = useMemo<WaterfallNode[]>(() => {
    const investment = allAccounts?.investment_accounts ?? [];
    const cash = allAccounts?.cash_accounts ?? [];
    const debt = allAccounts?.debt_accounts ?? [];

    const investmentValue = effectiveSummary.total_investment_value;
    const cashValue = effectiveSummary.total_cash_value;
    const debtValue = effectiveSummary.total_debt_value;

    return [
      {
        label: "Investment Accounts",
        value: investmentValue,
        type: "asset",
        details: investment.map((account) => `${account.name}: ${formatCurrency(account.balance)}`),
      },
      {
        label: "Cash Accounts",
        value: cashValue,
        type: "asset",
        details: cash.map((account) => `${account.name}: ${formatCurrency(account.balance)}`),
      },
      {
        label: "Debt & Liabilities",
        value: debtValue,
        type: "debt",
        details: debt.map((account) => `${account.name}: ${formatCurrency(account.balance)}`),
      },
      {
        label: "Transaction Source Mix",
        value: Math.max(effectiveSummary.total_cash_value * 0.2, 0),
        type: "asset",
        details: [
          `Connected bank accounts: ${bankAccounts?.length ?? 2}`,
          `Categories tracked: ${effectiveSpending.categories.length}`,
        ],
      },
    ];
  }, [allAccounts, bankAccounts, effectiveSummary, effectiveSpending]);

  const latest = effectiveHistory[effectiveHistory.length - 1]?.value ?? 0;
  const earliest = effectiveHistory[0]?.value ?? latest;
  const change = latest - earliest;
  const changePercent = earliest !== 0 ? (change / earliest) * 100 : 0;

  const allocationBuckets = useMemo(
    () => [
      {
        name: "Tax-Advantaged",
        value: effectiveSummary.tax_advantaged_value,
        color: "#10b981",
      },
      {
        name: "Taxable",
        value: effectiveSummary.taxable_value,
        color: "#34d399",
      },
      {
        name: "Cash",
        value: effectiveSummary.total_cash_value,
        color: "#6ee7b7",
      },
      {
        name: "Debt",
        value: effectiveSummary.total_debt_value,
        color: "#f472b6",
      },
    ],
    [effectiveSummary]
  );

  const topAllocations = useMemo(() => {
    const buckets = effectiveSummary.allocation_by_account_type ?? [];
    return [...buckets].sort((a, b) => b.value - a.value).slice(0, 4);
  }, [effectiveSummary]);

  async function handleRefresh() {
    if (!hasSyncConsent) {
      refetchPortfolio();
      refetchAccounts();
      refetchBankAccounts();
      refetchSpending();
      refetchHistory();
      if (hasDataConsent) {
        refetchConnections();
      }
      return;
    }
    await syncAllConnections.mutateAsync();
    refetchPortfolio();
    refetchAccounts();
    refetchBankAccounts();
    refetchSpending();
    refetchHistory();
    if (hasDataConsent) {
      refetchConnections();
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <DashboardHeader
          onRefresh={handleRefresh}
          isRefreshing={syncAllConnections.isPending}
          showRefresh={hasSyncConsent}
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
          onRefresh={handleRefresh}
          isRefreshing={syncAllConnections.isPending}
          showRefresh={hasSyncConsent}
        />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <ApiErrorState
            message="Could not load graph data from your connected data sources."
            error={errorDetails}
            onRetry={handleRefresh}
          />
        </main>
      </div>
    );
  }

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
        onRefresh={handleRefresh}
        isRefreshing={syncAllConnections.isPending}
        showRefresh={hasSyncConsent}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-start justify-between gap-4 mb-6"
        >
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Data Graph</p>
            <h1 className="mt-2 font-serif text-3xl text-white">Money Graph Workspace</h1>
            <p className="mt-2 text-neutral-400 max-w-xl">
              Build a clear picture of how your accounts, cash flow, and debt shape cash movement
              over time.
            </p>
            {usingDemoData ? (
              <p className="mt-2 text-xs text-amber-300 inline-flex items-center gap-2">
                <RefreshCw className="w-3 h-3" />
                Synthetic graph timeline is active until live snapshots and transactions are connected.
              </p>
            ) : null}
          </div>
          <Link
            href="/dashboard/coverage"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-sm text-neutral-200 hover:bg-neutral-900 transition-colors"
          >
            Improve data coverage
            <Link2 className="w-4 h-4" />
          </Link>
        </motion.div>

        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />

        <ConsentGate
          scopes={[
            "portfolio:read",
            "accounts:read",
            "transactions:read",
            "connections:read",
          ]}
          purpose="Load connected account balances, bank transactions, and spend context for the graph"
        >
          <div className="space-y-6">
            <section className="grid md:grid-cols-4 gap-4">
              <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">Net Worth</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(effectiveSummary.net_worth)}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  {change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-rose-400" />
                  )}
                  <span
                    className={`text-sm ${change >= 0 ? "text-emerald-300" : "text-rose-300"}`}
                  >
                    {formatCurrency(change)} ({formatPercent(changePercent / 100, 1, true)})
                  </span>
                </div>
              </article>

              <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">Investments</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(effectiveSummary.total_investment_value)}
                </p>
                <p className="mt-3 text-xs text-neutral-500">
                  Tax advantaged: {formatCurrency(effectiveSummary.tax_advantaged_value)}
                </p>
              </article>

              <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">Cash Position</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(effectiveSummary.total_cash_value)}
                </p>
                <p className="mt-3 text-xs text-neutral-500">
                  Last 3 months spend: {formatCurrency(effectiveSpending.total_spending)}
                </p>
              </article>

              <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-5">
                <p className="text-sm text-neutral-400">Debt</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(effectiveSummary.total_debt_value)}
                </p>
                <p className="mt-3">
                  <ScoreBadge
                    label="Debt ratio"
                    value={formatPercent(
                      effectiveSummary.total_debt_value /
                        Math.max(1, effectiveSummary.total_investment_value + effectiveSummary.total_cash_value),
                      1
                    )}
                    tone={
                      effectiveSummary.total_debt_value > 30000 ? "warn" : "positive"
                    }
                  />
                </p>
              </article>
            </section>

            <section className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl text-white">Portfolio trajectory</h2>
                  <div className="flex gap-1 rounded-lg bg-neutral-950 p-1">
                    {RANGES.map((range) => (
                      <button
                        key={range.value}
                        onClick={() => setSelectedRange(range.value)}
                        className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                          selectedRange === range.value
                            ? "bg-emerald-600 text-white"
                            : "text-neutral-400 hover:text-neutral-200"
                        }`}
                      >
                        {range.label}
                      </button>
                    ))}
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart
                    data={effectiveHistory}
                    margin={{ left: 0, right: 0, top: 4, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="graphFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatAxisDate}
                      tick={{ fill: "#737373", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(Number(value))}
                      tick={{ fill: "#737373", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={84}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      dataKey="value"
                      stroke="#34d399"
                      fill="url(#graphFill)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>

                <p className="mt-2 text-xs text-neutral-500">
                  Showing {selectedRange} trend from {effectiveHistory.length} points, built from account
                  snapshots and transaction activity.
                </p>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-white">Money Flow Nodes</h3>
                    <CircleDollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="space-y-4">
                    {financialNodes.map((node) => {
                      const totalAssets = Math.max(
                        effectiveSummary.total_investment_value + effectiveSummary.total_cash_value,
                        1
                      );
                      const percent = (node.value / totalAssets) * 100;
                      return (
                        <div key={node.label}>
                          <div className="mb-1 flex items-center justify-between">
                            <p className="text-sm text-neutral-300">{node.label}</p>
                            <p className="text-sm text-white">{formatCurrency(node.value)}</p>
                          </div>
                          <div className="h-2 rounded-full bg-neutral-800">
                            <div
                              className={`h-full rounded-full ${
                                node.type === "asset" ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.abs(percent))}%` }}
                            />
                          </div>
                          <ul className="mt-2 text-xs text-neutral-400 space-y-1">
                            {node.details.map((detail) => (
                              <li key={detail} className="truncate">
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
                  <h3 className="font-medium text-white mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    Account bucketing
                  </h3>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart
                      data={topAllocations}
                      margin={{ left: 0, right: 0, top: 0, bottom: 4 }}
                    >
                      <XAxis
                        dataKey="category"
                        tick={{ fill: "#737373", fontSize: 10 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        labelFormatter={(label) => formatTitleCase(String(label))}
                        contentStyle={{ backgroundColor: "#0a0a0a", borderColor: "#262626" }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {topAllocations.map((entry, index) => (
                          <Cell key={entry.category} fill={index % 2 === 0 ? "#34d399" : "#6ee7b7"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="font-serif text-xl text-white mb-4">Next-step pathways</h2>
              <p className="text-sm text-neutral-400 max-w-3xl">
                This graph is live when real accounts and transaction consent are enabled. If you
                already have connections, you can refine each view with richer category tags and full
                historical transaction depth.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {[
                  { href: "/dashboard/progress", label: "Track progression" },
                  { href: "/dashboard/scenario-lab", label: "Open scenario lab" },
                  { href: "/dashboard/coverage", label: "Improve data coverage" },
                  { href: "/dashboard/command-center", label: "Open command center" },
                  { href: "/dashboard/decision-narrative", label: "Read decision narrative" },
                  { href: "/dashboard/founder-operating-room", label: "Open founder ops room" },
                ].map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="inline-flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-900/20 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-900/40 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {route.label}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </ConsentGate>
      </main>
    </div>
  );
}
