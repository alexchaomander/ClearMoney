"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import { motion } from "framer-motion";

const CommandCenterTrajectoryChart = dynamic(
  () => import("@/components/dashboard/CommandCenterTrajectoryChart").then(m => m.CommandCenterTrajectoryChart),
  { ssr: false, loading: () => <div className="lg:col-span-2 h-44 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> }
);
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Flag,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  useAccounts,
  useBankAccounts,
  useBankTransactions,
  useConsentStatus,
  useFinancialMemory,
  useConnections,
  usePortfolioHistory,
  usePortfolioSummary,
  useSpendingSummary,
  useSyncAllConnections,
} from "@/lib/strata/hooks";
import { formatCurrency, formatMonthsAsYears, formatPercent } from "@/lib/shared/formatters";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import {
  FALLBACK_BANK_ACCOUNTS,
  FALLBACK_BANK_TRANSACTIONS,
  FALLBACK_FINANCIAL_MEMORY,
  FALLBACK_SPENDING_SUMMARY,
  getPreviewPortfolioHistory,
  getPreviewPortfolioSummary,
} from "../_shared/preview-data";

type RiskBand = "good" | "watch" | "critical";

interface ActionItem {
  href: string;
  title: string;
  description: string;
  tone: RiskBand;
}

function scoreStyle(level: RiskBand) {
  if (level === "good") {
    return {
      border: "border-emerald-700",
      badge: "text-emerald-700 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/25",
      value: "text-emerald-700 dark:text-emerald-200",
      icon: TrendingUp,
    };
  }
  if (level === "watch") {
    return {
      border: "border-amber-700",
      badge: "text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/25",
      value: "text-amber-700 dark:text-amber-200",
      icon: CircleDashed,
    };
  }
  return {
    border: "border-rose-700",
    badge: "text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-900/25",
    value: "text-rose-700 dark:text-rose-200",
    icon: TrendingDown,
  };
}

function signalTone(
  value: number,
  target: number,
  direction: "higher" | "lower",
): RiskBand {
  if (direction === "higher") {
    if (value >= target) return "good";
    if (value >= target * 0.7) return "watch";
    return "critical";
  }

  if (value <= target) return "good";
  if (value <= target * 1.4) return "watch";
  return "critical";
}

function toPercentSafe(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function CommandCenterPage() {
  const { hasConsent, isLoading: consentLoading } = useConsentStatus([
    "portfolio:read",
    "accounts:read",
    "transactions:read",
    "connections:read",
    "memory:read",
  ]);
  const { hasConsent: hasSyncConsent } = useConsentStatus(["connections:write"]);
  const syncAllConnections = useSyncAllConnections();

  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorDetails,
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasConsent });

  const {
    data: allAccounts,
    isLoading: accountsLoading,
    isError: accountsError,
    error: allAccountsErrorDetails,
    refetch: refetchAccounts,
  } = useAccounts({ enabled: hasConsent });

  const {
    data: bankAccounts,
    isLoading: bankAccountsLoading,
    isError: bankAccountsError,
    error: bankAccountsErrorDetails,
    refetch: refetchBankAccounts,
  } = useBankAccounts({ enabled: hasConsent });

  const {
    data: transactionPage,
    isLoading: transactionsLoading,
    isError: transactionsError,
    error: transactionsErrorDetails,
    refetch: refetchTransactions,
  } = useBankTransactions({ page: 1, page_size: 120 }, { enabled: hasConsent });

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

  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorDetails,
    refetch: refetchHistory,
  } = usePortfolioHistory("90d", { enabled: hasConsent });
  const { hasConsent: hasConnectionsConsent, isLoading: connectionsConsentLoading } = useConsentStatus(["connections:read"]);
  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasConnectionsConsent });

  const summary = portfolio ?? getPreviewPortfolioSummary();
  const spendingSummary = spending ?? FALLBACK_SPENDING_SUMMARY;
  const memoryProfile = memory ?? FALLBACK_FINANCIAL_MEMORY;
  const connectedBanks = bankAccounts ?? FALLBACK_BANK_ACCOUNTS;
  const transactions = transactionPage?.transactions ?? FALLBACK_BANK_TRANSACTIONS.transactions;
  const trajectory = history ?? getPreviewPortfolioHistory("90d");

  const derived = useMemo(() => {
    const investmentAccounts = allAccounts?.investment_accounts?.length ?? 0;
    const cashAccounts = allAccounts?.cash_accounts?.length ?? 0;
    const debtAccounts = allAccounts?.debt_accounts?.length ?? 0;
    const debtList = allAccounts?.debt_accounts ?? [];
    const debtBalance = debtList.length > 0
      ? debtList.reduce((sum, debt) => sum + debt.balance, 0)
      : summary.total_debt_value;
    const bankCount = connectedBanks.length;
    const monthlySpend = spendingSummary.monthly_average > 0 ? spendingSummary.monthly_average : 1;
    const runway = summary.total_cash_value / monthlySpend;
    const annualIncome = memoryProfile.monthly_income ? memoryProfile.monthly_income * 12 : summary.total_cash_value * 0.15;
    const debtCoverage = annualIncome > 0 ? debtBalance / annualIncome : 0;
    const reserveCoverage = annualIncome > 0 ? summary.total_cash_value / annualIncome : 0;

    const trackedSpend = transactions.reduce((sum, tx) => (tx.amount < 0 ? sum + Math.abs(tx.amount) : sum), 0);
    const profileCompleteness = [
      memoryProfile.monthly_income,
      memoryProfile.annual_income,
      memoryProfile.monthly_savings_target,
      memoryProfile.risk_tolerance,
      memoryProfile.emergency_fund_target_months,
      memoryProfile.investment_horizon_years,
    ].filter((value) => value !== null && value !== undefined).length;

    const lastPoint = trajectory.at(-1)?.value ?? summary.net_worth;
    const firstPoint = trajectory.at(0)?.value ?? summary.net_worth;
    const trajectoryDelta = lastPoint - firstPoint;

    const runwayTone = signalTone(runway, 12, "higher");
    const coverageTone = signalTone(bankCount, 2, "higher");
    const debtTone = signalTone(debtCoverage, 0.25, "lower");
    const reserveTone = signalTone(reserveCoverage, 0.5, "higher");

    return {
      investmentAccounts,
      cashAccounts,
      debtAccounts,
      bankCount,
      debtBalance,
      runway,
      debtCoverage,
      reserveCoverage,
      trackedSpend,
      profileCompleteness,
      trajectoryDelta,
      runwayTone,
      coverageTone,
      debtTone,
      reserveTone,
    };
  }, [
    allAccounts,
    connectedBanks.length,
    memoryProfile,
    summary.net_worth,
    summary.total_cash_value,
    summary.total_debt_value,
    spendingSummary.monthly_average,
    transactions,
    trajectory,
  ]);

  const healthPercent = clamp(
    Math.round(
      toPercentSafe(derived.runway / 18) * 0.35 +
        toPercentSafe(derived.reserveCoverage * 2) * 0.25 +
        toPercentSafe(1 - Math.min(1, derived.debtCoverage)) * 0.2 +
        (derived.profileCompleteness / 6) * 100 * 0.2
    ),
    0,
    100,
  );

  const isLoading =
    consentLoading ||
    connectionsConsentLoading ||
    connectionsLoading ||
    portfolioLoading ||
    accountsLoading ||
    bankAccountsLoading ||
    transactionsLoading ||
    spendingLoading ||
    memoryLoading ||
    historyLoading;

  const isError =
    portfolioError ||
    accountsError ||
    bankAccountsError ||
    transactionsError ||
    spendingError ||
    memoryError ||
    historyError ||
    connectionsError;

  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncTimes = connections
      .map((connection) => connection.last_synced_at)
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).getTime())
      .filter((value) => !Number.isNaN(value));
    if (!syncTimes.length) return null;
    return new Date(Math.max(...syncTimes)).toISOString();
  }, [connections]);

  const usingDemoData = !portfolio || !allAccounts || !bankAccounts || !transactionPage || !history || !spending || !memory;
  const sourceItems = useMemo<DataSourceStatusItem[]>(() => {
    const accountCount = (allAccounts?.investment_accounts?.length ?? 0) + (allAccounts?.cash_accounts?.length ?? 0) + (allAccounts?.debt_accounts?.length ?? 0);
    const bankCount = connectedBanks.length;
    const txCount = transactions.length;
    const profileCompleteness = [
      memoryProfile.annual_income,
      memoryProfile.monthly_income,
      memoryProfile.monthly_savings_target,
      memoryProfile.risk_tolerance,
      memoryProfile.emergency_fund_target_months,
    ].filter((value) => value !== null && value !== undefined).length;

    return [
      {
        id: "portfolio",
        title: "Portfolio summary",
        value: portfolio ? "Live" : "Fallback",
        detail: portfolio
          ? "Net worth and allocation source is connected."
          : "Using synthetic summary until portfolio scope is available.",
        tone: portfolio ? "live" : "missing",
        href: "/dashboard",
        actionLabel: "Open dashboard",
        lastSyncedAt,
      },
      {
        id: "accounts",
        title: "Accounts",
        value: `${accountCount} source${accountCount === 1 ? "" : "s"}`,
        detail: allAccounts
          ? `${allAccounts.investment_accounts.length} investment, ${allAccounts.cash_accounts.length} cash, ${allAccounts.debt_accounts.length} debt`
          : "Portfolio accounts are not yet synced.",
        tone: allAccounts ? "live" : "missing",
        href: "/connect",
        actionLabel: "Connect account",
      },
      {
        id: "banks",
        title: "Bank links",
        value: `${bankCount} link${bankCount === 1 ? "" : "s"}`,
        detail:
          bankCount > 0
            ? "Bank connections are helping transactions flow."
            : "No bank institutions linked yet.",
        tone: bankCount > 0 ? "live" : "warning",
        href: "/connect",
        actionLabel: "Link bank",
        lastSyncedAt,
      },
      {
        id: "transactions",
        title: "Transaction stream",
        value: `${txCount} tx${txCount === 1 ? "" : "s"} in window`,
        detail:
          txCount > 0
            ? "Recent transaction stream is available."
            : "Transaction stream will improve recommendation stability.",
        tone: txCount > 0 ? "live" : "partial",
        lastSyncedAt,
      },
      {
        id: "memory",
        title: "Profile density",
        value: `${profileCompleteness}/5`,
        detail:
          profileCompleteness >= 4
            ? "Financial profile has high signal depth."
            : "Add remaining profile fields for fuller context.",
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
        id: "history",
        title: "History window",
        value: hasConsent ? `${history?.length ?? 0} points` : "No history",
        detail: history?.length
          ? "Portfolio trajectory history loaded."
          : "No historical trajectory in this window.",
        tone: history?.length ? "live" : "warning",
      },
    ];
  }, [
    allAccounts,
    connectedBanks.length,
    hasConsent,
    history,
    lastSyncedAt,
    memoryProfile,
    portfolio,
    spending,
    transactions.length,
  ]);

  const actions: ActionItem[] = [
    {
      href: "/dashboard/founder-operating-room",
      title: "Rebalance runway discipline",
      description: "Review current spend mix, cash runway, and commingling status.",
      tone: derived.runwayTone,
    },
    {
      href: "/dashboard/scenario-lab",
      title: "Stress test new assumptions",
      description: "Run upside/downside simulations for the next 12 months.",
      tone: derived.coverageTone,
    },
    {
      href: "/dashboard/progress",
      title: "Track month-by-month movement",
      description: "Watch trajectory and debt pressure over 90d and 1y windows.",
      tone: derived.reserveTone,
    },
    {
      href: "/dashboard/coverage",
      title: "Improve data depth",
      description: "Raise account/tag coverage to strengthen recommendation reliability.",
      tone: derived.debtTone,
    },
  ];

  const alerts = [
    {
      title: "Runway",
      value: formatMonthsAsYears(Math.max(0, Math.round(derived.runway))),
      tone: derived.runwayTone,
      note: derived.runway < 12 ? "Below one-year runway target." : "Runway buffer currently acceptable.",
    },
    {
      title: "Debt load",
      value: formatPercent(derived.debtCoverage),
      tone: derived.debtTone,
      note: derived.debtCoverage > 0.4 ? "Debt exposure is high versus annual income." : "Debt remains contained in your current profile.",
    },
    {
      title: "Bank/data links",
      value: `${derived.bankCount} source${derived.bankCount === 1 ? "" : "s"}`,
      tone: derived.coverageTone,
      note: derived.bankCount >= 2 ? "Strong transaction visibility for behavior analysis." : "Add another bank source for better trend confidence.",
    },
    {
      title: "Cash reserve",
      value: formatPercent(derived.reserveCoverage),
      tone: derived.reserveTone,
      note:
        derived.reserveCoverage >= 0.5
          ? "Cash reserve supports resilience through short disruptions."
          : "Consider raising the reserve target for margin.",
    },
  ];

  async function handleRefresh() {
    if (!hasSyncConsent) {
      refetchPortfolio();
      refetchAccounts();
      refetchBankAccounts();
      refetchTransactions();
      refetchSpending();
      refetchMemory();
      refetchHistory();
      if (hasConnectionsConsent) {
        refetchConnections();
      }
      return;
    }
    await syncAllConnections.mutateAsync();
    refetchPortfolio();
    refetchAccounts();
    refetchBankAccounts();
    refetchTransactions();
    refetchSpending();
    refetchMemory();
    refetchHistory();
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
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
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
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <ApiErrorState
            message="Could not load founder command center."
            error={
              portfolioErrorDetails ||
              allAccountsErrorDetails ||
              bankAccountsErrorDetails ||
              transactionsErrorDetails ||
              spendingErrorDetails ||
              memoryErrorDetails ||
              historyErrorDetails
            }
            onRetry={handleRefresh}
          />
        </main>
      </div>
    );
  }

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

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: "Dashboard", href: "/dashboard" }, { label: "Command Center" }]} />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Command center</p>
          <h1 className="mt-2 font-serif text-3xl text-slate-900 dark:text-white">Founder Command Center</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-3xl">
            The single pane for execution readiness, risk posture, and next actions before advisor decisions.
          </p>
          {usingDemoData ? (
                <p className="mt-2 text-xs text-amber-600 dark:text-amber-300 inline-flex items-center gap-2">
                  <RefreshCw className="w-3 h-3" />
                  Synthetic foundation is active until live Strata surfaces are connected.
                </p>
              ) : null}
            </motion.div>

            <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />

        <ConsentGate
          scopes={[
            "portfolio:read",
            "accounts:read",
            "transactions:read",
            "connections:read",
            "memory:read",
          ]}
          purpose="Synthesize operating posture and route high-signal execution actions."
        >
          <section className="grid lg:grid-cols-3 gap-4 mb-6">
            <article className="lg:col-span-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm text-slate-600 dark:text-slate-400">Execution health</h2>
                <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
              </div>
              <p className="mt-3 text-4xl text-slate-900 dark:text-white">{healthPercent}%</p>
              <div className="mt-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                <div className={`h-full rounded-full ${healthPercent >= 70 ? "bg-emerald-500" : healthPercent >= 45 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${healthPercent}%` }} />
              </div>
              <p className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                Based on runway, reserve posture, debt pressure, and profile completeness.
              </p>
            </article>

            <CommandCenterTrajectoryChart
              trajectory={trajectory}
              trajectoryDelta={derived.trajectoryDelta}
            />
          </section>

          <section className="grid lg:grid-cols-2 gap-4 mb-6">
            {alerts.map((alert) => {
              const style = scoreStyle(alert.tone);
              const Icon = style.icon;
              return (
                <article
                  key={alert.title}
                  className={`rounded-xl border ${style.border} bg-white dark:bg-slate-900 p-5`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                    <p className="text-sm text-slate-900 dark:text-white">{alert.title}</p>
                  </div>
                  <p className={`mt-2 text-2xl ${style.value}`}>{alert.value}</p>
                  <p className={`mt-2 text-xs ${style.value}`}>{alert.note}</p>
                  <span className={`mt-3 inline-flex text-xs rounded-full border px-2 py-1 ${style.badge}`}>
                    {alert.tone === "good" ? "Healthy" : alert.tone === "watch" ? "Watch" : "Action needed"}
                  </span>
                </article>
              );
            })}
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-slate-900 dark:text-white font-medium">Execution queue</h2>
              <Sparkles className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {actions.map((action) => {
                const tone = scoreStyle(action.tone);
                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className={`rounded-lg border ${tone.border} p-4 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900/80`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white">{action.title}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">{action.description}</p>
                      </div>
                      <span className={`text-xs rounded-full border px-2 py-1 ${tone.badge}`}>{action.tone}</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-600 dark:text-slate-400 inline-flex items-center gap-1">
                      <ArrowRight className="w-3 h-3" />
                      Open workflow
                    </p>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                  <p className="text-sm text-slate-900 dark:text-white">Connected sources</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {derived.investmentAccounts} investment account(s), {derived.cashAccounts} cash account(s),{" "}
                  {derived.debtAccounts} debt account(s), {derived.bankCount} bank source(s).
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
                  <p className="text-sm text-slate-900 dark:text-white">Financial memory</p>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  {derived.profileCompleteness}/6 fields complete. Tracked spend snapshot: {formatCurrency(derived.trackedSpend)}.
                </p>
              </div>
            </div>
          </section>

          <section className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-3 text-sm text-slate-700 dark:text-slate-300">
            <p>
              Missing a signal? Open coverage and strengthen the underlying data for better recommendations.
            </p>
            <Link
              href="/dashboard/coverage"
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-900/20 px-3 py-2 text-emerald-200"
            >
              <Flag className="w-4 h-4" />
              Improve coverage
            </Link>
          </section>
        </ConsentGate>
      </main>
    </div>
  );
}
