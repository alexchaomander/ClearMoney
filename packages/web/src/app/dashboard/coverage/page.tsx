"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CheckCircle,
  CircleDashed,
  Compass,
  Database,
  ShieldCheck,
  RefreshCw,
  Signal,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import {
  useConsentStatus,
  useFinancialMemory,
  useSpendingSummary,
  useAccounts,
  useBankAccounts,
  usePortfolioSummary,
  useConnections,
  useSyncAllConnections,
} from "@/lib/strata/hooks";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { FALLBACK_SPENDING_SUMMARY, getPreviewPortfolioSummary } from "../_shared/preview-data";

type CoverageStatus = "critical" | "warning" | "good";

interface CoverageItem {
  key: string;
  name: string;
  value: string;
  status: CoverageStatus;
  detail: string;
  actionLabel: string;
  actionHref: string;
}

function statusStyles(status: CoverageStatus): { icon: string; bar: string; text: string } {
  if (status === "good") {
    return {
      icon: "text-emerald-300",
      bar: "bg-emerald-500",
      text: "text-emerald-100",
    };
  }
  if (status === "warning") {
    return {
      icon: "text-amber-300",
      bar: "bg-amber-500",
      text: "text-amber-100",
    };
  }
  return {
    icon: "text-rose-300",
    bar: "bg-rose-500",
    text: "text-rose-100",
  };
}

function statusScore(items: CoverageItem[]): number {
  const points = items.reduce((acc, item) => {
    if (item.status === "good") return acc + 35;
    if (item.status === "warning") return acc + 18;
    return acc + 0;
  }, 0);
  const denominator = items.length * 35;
  return denominator > 0 ? Math.round((points / denominator) * 100) : 0;
}

function statusToneFromScore(score: number): CoverageStatus {
  if (score >= 75) return "good";
  if (score >= 45) return "warning";
  return "critical";
}

export default function CoveragePage() {
  const { hasConsent, isLoading: consentLoading } = useConsentStatus([
    "portfolio:read",
    "accounts:read",
    "connections:read",
    "transactions:read",
    "memory:read",
  ]);

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
    error: accountsErrorDetails,
    refetch: refetchAccounts,
  } = useAccounts({ enabled: hasConsent });

  const {
    data: bankAccounts,
    isLoading: bankAccountsLoading,
    isError: bankAccountsError,
    refetch: refetchBankAccounts,
  } = useBankAccounts({ enabled: hasConsent });

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

  const { hasConsent: hasSyncConsent } = useConsentStatus(["connections:write"]);
  const { hasConsent: hasConnectionsConsent, isLoading: connectionsConsentLoading } = useConsentStatus(["connections:read"]);
  const syncAllConnections = useSyncAllConnections();

  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasConnectionsConsent });

  const isLoading =
    consentLoading ||
    connectionsConsentLoading ||
    connectionsLoading ||
    portfolioLoading ||
    accountsLoading ||
    bankAccountsLoading ||
    spendingLoading ||
    memoryLoading;

  const isError =
    portfolioError ||
    accountsError ||
    bankAccountsError ||
    spendingError ||
    memoryError ||
    connectionsError;
  const summary = portfolio ?? getPreviewPortfolioSummary();
  const spendingSummary = spending ?? FALLBACK_SPENDING_SUMMARY;

  const usingDemoData = !portfolio || !allAccounts || !bankAccounts || !spending || !memory;
  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncTimes = connections
      .map((entry) => entry.last_synced_at)
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).getTime())
      .filter((value) => !Number.isNaN(value));
    if (!syncTimes.length) return null;
    return new Date(Math.max(...syncTimes)).toISOString();
  }, [connections]);

  const sourceItems = useMemo<DataSourceStatusItem[]>(() => {
    const investmentAccounts = allAccounts?.investment_accounts?.length ?? 0;
    const cashAccounts = allAccounts?.cash_accounts?.length ?? 0;
    const debtAccounts = allAccounts?.debt_accounts?.length ?? 0;
    const totalAccounts = investmentAccounts + cashAccounts + debtAccounts;
    const bankConnectionCount = bankAccounts?.length ?? 0;
    const profileCompleteness = [
      memory?.annual_income,
      memory?.monthly_income,
      memory?.risk_tolerance,
      memory?.monthly_savings_target,
      memory?.emergency_fund_target_months,
    ].filter((value) => value !== null && value !== undefined).length;
    const profileText = `${profileCompleteness}/5`;

    return [
      {
        id: "portfolio",
        title: "Portfolio summary",
        value: portfolio ? "Live" : "Demo",
        detail: portfolio
          ? "Net worth, allocation, and holdings summary are loading from Strata."
          : "Portfolio source still using synthetic fallback.",
        tone: portfolio ? "live" : "missing",
        href: "/dashboard",
        actionLabel: "Open dashboard",
        lastSyncedAt,
      },
      {
        id: "accounts",
        title: "Accounts",
        value: `${totalAccounts} source${totalAccounts === 1 ? "" : "s"}`,
        detail: `${investmentAccounts} investment, ${cashAccounts} cash, ${debtAccounts} debt source(s).`,
        tone: allAccounts ? "live" : "missing",
        href: "/connect",
        actionLabel: "Connect account",
        lastSyncedAt,
      },
      {
        id: "banking",
        title: "Bank links",
        value: `${bankConnectionCount} link${bankConnectionCount === 1 ? "" : "s"}`,
        detail:
          bankConnectionCount > 0
            ? "Bank connections are available for transaction visibility."
            : "No active bank connectors yet.",
        tone: bankConnectionCount > 0 ? "live" : "warning",
        href: "/connect",
        actionLabel: "Link bank",
        lastSyncedAt,
      },
      {
        id: "spending",
        title: "Spend trend",
        value: spendingSummary.months_analyzed > 0 ? `${spendingSummary.months_analyzed} months` : "No trend",
        detail:
          spendingSummary.categories.length > 0
            ? `${spendingSummary.categories.length} category buckets visible.`
            : "Category breakdown has not been returned yet.",
        tone: spending ? "live" : "missing",
        href: "/dashboard/graph",
        actionLabel: "Review graph",
        lastSyncedAt,
      },
      {
        id: "profile",
        title: "Profile completeness",
        value: profileText,
        detail:
          profileCompleteness >= 4
            ? "Profile depth supports stronger recommendation confidence."
            : "Add profile fields to improve advisor signal quality.",
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
        value: connections?.length ? `${connections.length} active` : "No active connections",
        detail:
          connections?.length
            ? "Strata integrations are connected and syncable."
            : "No connected data integrations available.",
        tone: connections?.length ? "live" : "warning",
        href: "/connect",
        actionLabel: "Manage links",
      },
    ];
  }, [
    allAccounts,
    bankAccounts?.length,
    connections?.length,
    hasConsent,
    lastSyncedAt,
    memory,
    portfolio,
    spendingSummary,
  ]);

  async function handleRefresh() {
    if (!hasSyncConsent) {
      refetchPortfolio();
      refetchAccounts();
      refetchBankAccounts();
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
    refetchBankAccounts();
    refetchSpending();
    refetchMemory();
    if (hasConnectionsConsent) {
      refetchConnections();
    }
  }

  const errorDetails =
    portfolioErrorDetails ||
    accountsErrorDetails ||
    spendingErrorDetails ||
    memoryErrorDetails ||
    connectionsErrorDetails;

  const checks = useMemo<CoverageItem[]>(() => {
    const investmentAccounts = allAccounts?.investment_accounts?.length ?? 0;
    const cashAccounts = allAccounts?.cash_accounts?.length ?? 0;
    const debtAccounts = allAccounts?.debt_accounts?.length ?? 0;
    const connectedBankCount = bankAccounts?.length ?? 0;

    const profileCompleteness = [
      memory?.annual_income,
      memory?.monthly_income,
      memory?.risk_tolerance,
      memory?.monthly_savings_target,
      memory?.emergency_fund_target_months,
    ].filter((value) => value !== null && value !== undefined).length;

    const debtRatio = summary.total_debt_value / Math.max(1, summary.net_worth);
    const hasCoverageForDecision =
      investmentAccounts >= 1 && connectedBankCount >= 1 && spendingSummary.categories.length >= 4;

    return [
      {
        key: "accounts",
        name: "Investment & cash coverage",
        value: `${investmentAccounts + cashAccounts + debtAccounts} connected accounts`,
        status: investmentAccounts >= 2 ? "good" : investmentAccounts === 1 ? "warning" : "critical",
        detail: `${investmentAccounts} investment, ${cashAccounts} cash, ${debtAccounts} debt source(s).`,
        actionLabel: "Connect more accounts",
        actionHref: "/connect",
      },
      {
        key: "bank-depth",
        name: "Bank transaction visibility",
        value: `${connectedBankCount} connected bank institution(s)`,
        status: connectedBankCount >= 1 ? "good" : "critical",
        detail: `${spendingSummary.months_analyzed}-month span with ${spendingSummary.total_spending ? formatCurrency(spendingSummary.total_spending) : "$0"} spend total.`,
        actionLabel: "Add bank account",
        actionHref: "/connect",
      },
      {
        key: "debt",
        name: "Debt intelligence",
        value: formatPercent(debtRatio, 1),
        status:
          debtRatio <= 0.2 ? "good" : debtRatio <= 0.35 ? "warning" : "critical",
        detail: `Debt is ${Math.round(debtRatio * 100)}% of your reported net worth.`,
        actionLabel: "Review debt priority",
        actionHref: "/dashboard/progress",
      },
      {
        key: "profile",
        name: "Profile completeness",
        value: `${profileCompleteness}/5 profile points`,
        status:
          profileCompleteness >= 4 ? "good" : profileCompleteness >= 2 ? "warning" : "critical",
        detail:
          profileCompleteness >= 4
            ? "Profile fields are sufficient for dependable advisor output."
            : "Add more profile inputs to unlock stronger recommendations.",
        actionLabel: "Update profile",
        actionHref: "/profile",
      },
      {
        key: "coverage",
        name: "Decision readiness",
        value: hasCoverageForDecision ? "Good" : "Needs data",
        status: hasCoverageForDecision ? "good" : "warning",
        detail: hasCoverageForDecision
          ? "Scope alignment supports trace generation and scenario testing."
          : "Add transaction and account breadth to improve recommendation confidence.",
        actionLabel: "Open advisor",
        actionHref: "/advisor",
      },
    ];
  }, [allAccounts, bankAccounts, summary, spendingSummary, memory]);

  const overallScore = statusScore(checks);
  const overallStatus = statusToneFromScore(overallScore);
  const overallStatusStyles = statusStyles(overallStatus);

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
            message="Could not load coverage intelligence."
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
        showRefresh={hasSyncConsent}
        isRefreshing={syncAllConnections.isPending}
        onRefresh={handleRefresh}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Coverage</p>
          <h1 className="mt-2 font-serif text-3xl text-white">Data Coverage Hub</h1>
          <p className="mt-2 text-neutral-400 max-w-3xl">
            See where your financial signal is strong, where it is thin, and exactly what to connect
            next to unlock higher-confidence recommendations.
          </p>
          {usingDemoData ? (
            <p className="mt-2 text-xs text-amber-300 inline-flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Synthetic coverage data is active until live account, spend, and profile sources are connected.
            </p>
          ) : null}
        </motion.div>

        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />

        <ConsentGate
          scopes={[
            "portfolio:read",
            "accounts:read",
            "connections:read",
            "transactions:read",
            "memory:read",
          ]}
          purpose="Load your connected financial profile and transaction coverage for a complete analysis"
        >
          <section className="grid lg:grid-cols-3 gap-6 mb-8">
            <article className="lg:col-span-1 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-400">Coverage score</p>
                <span className={`rounded-full px-3 py-1 text-xs ${overallStatusStyles.text} ${overallStatusStyles.bar} bg-opacity-25`}>
                  {overallStatus}
                </span>
              </div>
              <p className="mt-4 text-4xl font-semibold text-white">{overallScore}%</p>
              <p className="mt-2 text-sm text-neutral-400">
                Your confidence layer across all advisor-grade inputs.
              </p>
              <div className="mt-4 h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full ${overallStatusStyles.bar}`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
            </article>

            <article className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-lg text-white font-medium mb-3 flex items-center gap-2">
                <Signal className="w-4 h-4 text-emerald-300" />
                Top blockers to better recommendations
              </h2>
              <ul className="space-y-3">
                {checks
                  .filter((item) => item.status !== "good")
                  .map((item) => {
                    const st = statusStyles(item.status);
                    return (
                      <li
                        key={item.key}
                        className={`rounded-lg border border-neutral-800 bg-neutral-950 p-3 flex items-center justify-between gap-4 ${st.text}`}
                      >
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-neutral-400 mt-1">{item.detail}</p>
                        </div>
                        <Link
                          href={item.actionHref}
                          className={`text-xs rounded-full px-3 py-1 ${st.text} ${st.bar} ${st.bar === "bg-emerald-500" ? "bg-emerald-900/30" : st.bar === "bg-amber-500" ? "bg-amber-900/30" : "bg-rose-900/30"}`}
                        >
                          {item.actionLabel}
                        </Link>
                      </li>
                    );
                  })}
              </ul>
              {checks.every((item) => item.status === "good") && (
                <p className="text-sm text-emerald-300 flex items-center gap-2 mt-2">
                  <CheckCircle className="w-4 h-4" />
                  All key data dimensions are live.
                </p>
              )}
            </article>
          </section>

          <section className="grid lg:grid-cols-2 gap-6">
            {checks.map((item) => {
              const st = statusStyles(item.status);
              return (
                <article
                  key={item.key}
                  className={`rounded-xl border border-neutral-800 bg-neutral-900 p-5 ${item.status === "good" ? "" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className={`text-sm font-semibold ${st.text}`}>{item.name}</h3>
                      <p className="text-xs text-neutral-400 mt-1">{item.detail}</p>
                    </div>
                    <span
                      className={`rounded-full text-xs px-2 py-1 ${st.text} ${st.bar} bg-opacity-20`}
                    >
                      {item.value}
                    </span>
                  </div>

                  <div className="mt-4 h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className={`h-full ${st.bar}`}
                      style={{
                        width: `${item.status === "good" ? 100 : item.status === "warning" ? 62 : 30}%`,
                      }}
                    />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      className="text-xs rounded-lg border border-neutral-700 px-3 py-2 text-neutral-200 hover:bg-neutral-800 transition-colors"
                      type="button"
                    >
                      Learn more
                    </button>
                    <Link
                      href={item.actionHref}
                      className="text-xs rounded-lg border border-emerald-800 bg-emerald-900/30 px-3 py-2 text-emerald-200 hover:bg-emerald-900/50 transition-colors"
                    >
                      {item.actionLabel}
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-lg text-white mb-4 font-medium">Recommended buildout path</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/dashboard/command-center"
                className="rounded-xl border border-neutral-800 p-4 bg-neutral-950 hover:border-emerald-700 transition-colors"
              >
                <Compass className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-white text-sm">Open command center</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Get an execution summary and action-ready readiness recommendations.
                </p>
              </Link>
              <Link
                href="/connect"
                className="rounded-xl border border-neutral-800 p-4 bg-neutral-950 hover:border-emerald-700 transition-colors"
              >
                <Database className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-white text-sm">Add another connected bank</p>
                <p className="text-xs text-neutral-400 mt-1">Expands transaction and category coverage.</p>
              </Link>
              <Link
                href="/dashboard/scenario-lab"
                className="rounded-xl border border-neutral-800 p-4 bg-neutral-950 hover:border-emerald-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-white text-sm">Run scenario simulations</p>
                <p className="text-xs text-neutral-400 mt-1">Stress-test runway and debt under future assumptions.</p>
              </Link>
              <Link
                href="/profile"
                className="rounded-xl border border-neutral-800 p-4 bg-neutral-950 hover:border-emerald-700 transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-white text-sm">Complete profile fields</p>
                <p className="text-xs text-neutral-400 mt-1">Increases advisor signal reliability.</p>
              </Link>
              <Link
                href="/dashboard/decision-narrative"
                className="rounded-xl border border-neutral-800 p-4 bg-neutral-950 hover:border-emerald-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 text-emerald-400 mb-2" />
                <p className="text-white text-sm">Review recent traces</p>
                <p className="text-xs text-neutral-400 mt-1">Validate what your current recommendations are seeing.</p>
              </Link>
            </div>
          </section>
        </ConsentGate>
      </main>
    </div>
  );
}
