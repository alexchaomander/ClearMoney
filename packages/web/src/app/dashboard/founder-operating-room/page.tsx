"use client";

import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  AlertTriangle,
  CircleDollarSign,
  CircleDot,
  Compass,
  RefreshCw,
  ShieldAlert,
  Target,
  Wrench,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import {
  FALLBACK_BANK_ACCOUNTS,
  FALLBACK_BANK_TRANSACTIONS,
  FALLBACK_FINANCIAL_MEMORY,
  FALLBACK_SPENDING_SUMMARY,
  getPreviewPortfolioSummary,
} from "../_shared/preview-data";
import {
  useAccounts,
  useBankAccounts,
  useBankTransactions,
  useConsentStatus,
  useFinancialMemory,
  usePortfolioSummary,
  useConnections,
  useSpendingSummary,
  useSyncAllConnections,
} from "@/lib/strata/hooks";
import { formatCurrency, formatMonthsAsYears, formatPercent } from "@/lib/shared/formatters";

type RiskBand = "good" | "watch" | "critical";

type TxLike = {
  amount: number;
  primary_category?: string | null;
  detailed_category?: string | null;
  merchant_name?: string | null;
};

const PERSONAL_CATEGORIES = new Set([
  "FOOD_AND_DRINK",
  "SHOPPING",
  "TRANSPORTATION",
  "ENTERTAINMENT",
  "RENT_AND_UTILITIES",
  "PERSONAL_CARE",
  "GENERAL_SERVICES",
  "TRAVEL",
  "GENERAL_MERCHANDISE",
  "OTHER",
]);

const BUSINESS_KEYWORDS = [
  "stripe",
  "aws",
  "brex",
  "github",
  "plaid",
  "notion",
  "quickbooks",
  "salesforce",
  "google",
  "adobe",
  "figma",
  "shopify",
  "openai",
];

function classifyExpense(tx: TxLike): "business" | "personal" | "unknown" {
  const primary = (tx.primary_category ?? "").toUpperCase();
  const detailed = (tx.detailed_category ?? "").toUpperCase();
  const merchant = (tx.merchant_name ?? "").toLowerCase();

  if (BUSINESS_KEYWORDS.some((keyword) => merchant.includes(keyword))) {
    return "business";
  }

  if (detailed === "INCOME") {
    return "unknown";
  }

  if (PERSONAL_CATEGORIES.has(primary) || PERSONAL_CATEGORIES.has(detailed)) {
    return "personal";
  }

  return "unknown";
}

function riskTone(risk: RiskBand) {
  if (risk === "good") {
    return {
      badge: "text-emerald-200 bg-emerald-900/30 border-emerald-700",
      bar: "bg-emerald-500",
      text: "text-emerald-100",
      label: "Strong",
    };
  }
  if (risk === "watch") {
    return {
      badge: "text-amber-200 bg-amber-900/30 border-amber-700",
      bar: "bg-amber-500",
      text: "text-amber-100",
      label: "Watch",
    };
  }
  return {
    badge: "text-rose-200 bg-rose-900/30 border-rose-700",
    bar: "bg-rose-500",
    text: "text-rose-100",
    label: "Needs Action",
  };
}

function bandFromRatio(value: number, direction: "higherIsBetter" | "lowerIsBetter" = "higherIsBetter"): RiskBand {
  if (direction === "higherIsBetter") {
    if (value >= 0.75) return "good";
    if (value >= 0.35) return "watch";
    return "critical";
  }

  if (value <= 0.25) return "good";
  if (value <= 0.45) return "watch";
  return "critical";
}

function scoreWeight(risk: RiskBand): number {
  if (risk === "good") return 100;
  if (risk === "watch") return 60;
  return 20;
}

function toPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

export default function FounderOperatingRoomPage() {
  const { hasConsent, isLoading: consentLoading } = useConsentStatus([
    "portfolio:read",
    "accounts:read",
    "transactions:read",
    "connections:read",
    "memory:read",
  ]);
  const { hasConsent: hasSyncConsent, isLoading: syncConsentLoading } = useConsentStatus(["connections:write"]);

  const syncAllConnections = useSyncAllConnections();
  const { hasConsent: hasConnectionsConsent, isLoading: connectionsConsentLoading } = useConsentStatus(["connections:read"]);

  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorDetails,
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasConsent });

  const {
    data: allAccounts,
    isLoading: allAccountsLoading,
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
  } = useBankTransactions({ page: 1, page_size: 250 }, { enabled: hasConsent });

  const {
    data: memory,
    isLoading: memoryLoading,
    isError: memoryError,
    error: memoryErrorDetails,
    refetch: refetchMemory,
  } = useFinancialMemory({ enabled: hasConsent });

  const {
    data: spending,
    isLoading: spendingLoading,
    isError: spendingError,
    error: spendingErrorDetails,
    refetch: refetchSpending,
  } = useSpendingSummary(3, { enabled: hasConsent });
  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasConnectionsConsent });

  const isLoading =
    consentLoading ||
    syncConsentLoading ||
    connectionsConsentLoading ||
    connectionsLoading ||
    portfolioLoading ||
    allAccountsLoading ||
    bankAccountsLoading ||
    transactionsLoading ||
    memoryLoading ||
    spendingLoading;

  const isError =
    portfolioError ||
    accountsError ||
    bankAccountsError ||
    transactionsError ||
    memoryError ||
    spendingError ||
    connectionsError;

  const errorDetails =
    portfolioErrorDetails ||
    allAccountsErrorDetails ||
    bankAccountsErrorDetails ||
    transactionsErrorDetails ||
    memoryErrorDetails ||
    spendingErrorDetails ||
    connectionsErrorDetails;

  const summary = portfolio ?? getPreviewPortfolioSummary();
  const profile = memory ?? FALLBACK_FINANCIAL_MEMORY;
  const spendingSummary = spending ?? FALLBACK_SPENDING_SUMMARY;
  const transactions = transactionPage?.transactions ?? FALLBACK_BANK_TRANSACTIONS.transactions;
  const connectedBanks = bankAccounts ?? FALLBACK_BANK_ACCOUNTS;

  const derived = useMemo(() => {
    const investmentAccounts = allAccounts?.investment_accounts?.length ?? 0;
    const cashAccounts = allAccounts?.cash_accounts?.length ?? 0;
    const debtAccounts = allAccounts?.debt_accounts?.length ?? 0;
    const totalCash = summary.total_cash_value;
    const totalAssets = Math.max(1, summary.total_cash_value + summary.total_investment_value);
    const totalDebt = summary.total_debt_value;

    const monthlyIncome = profile.monthly_income ?? 0;
    const observedMonthlySpend =
      spendingSummary.monthly_average > 0 ? spendingSummary.monthly_average : 1;

    const monthlySpend = Math.max(1, observedMonthlySpend);
    const runway = totalCash / monthlySpend;
    const savingsRate = monthlyIncome > 0
      ? Math.max(0, (monthlyIncome - monthlySpend) / Math.max(1, monthlyIncome))
      : 0;

    const trackedSpend = transactions
      .filter((tx) => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const personalSpend = transactions
      .filter((tx) => tx.amount < 0)
      .reduce(
        (sum, tx) =>
          classifyExpense(tx) === "personal" ? sum + Math.abs(tx.amount) : sum,
        0,
      );

    const businessSpend = transactions
      .filter((tx) => tx.amount < 0)
      .reduce(
        (sum, tx) =>
          classifyExpense(tx) === "business" ? sum + Math.abs(tx.amount) : sum,
        0,
      );

    const unknownSpend = Math.max(0, trackedSpend - personalSpend - businessSpend);
    const personalShare = trackedSpend > 0 ? personalSpend / trackedSpend : 0;

    const debtRatio = totalDebt / totalAssets;
    const runwayBand = bandFromRatio(Math.min(1, runway / 12), "higherIsBetter");
    const savingsBand = bandFromRatio(Math.min(1, savingsRate), "higherIsBetter");
    const debtBand = bandFromRatio(debtRatio, "lowerIsBetter");
    const comminglingBand = bandFromRatio(Math.min(1, personalShare), "lowerIsBetter");

    const profileCompleteness = [
      profile.monthly_income,
      profile.monthly_savings_target,
      profile.risk_tolerance,
      profile.annual_income,
      profile.emergency_fund_target_months,
      profile.investment_horizon_years,
    ].filter((value) => value !== null && value !== undefined).length;

    const confidence = Math.round(
      (scoreWeight(runwayBand) * 0.3 +
        scoreWeight(savingsBand) * 0.2 +
        scoreWeight(debtBand) * 0.2 +
        scoreWeight(comminglingBand) * 0.15 +
        (profileCompleteness / 6) * 100 * 0.15),
    );

    return {
      investmentAccounts,
      cashAccounts,
      debtAccounts,
      connectedBankCount: connectedBanks.length,
      totalCash,
      totalDebt,
      monthlyIncome,
      monthlySpend,
      runway,
      savingsRate,
      runwayBand,
      savingsBand,
      debtBand,
      debtRatio,
      comminglingBand,
      personalShare,
      personalSpend,
      businessSpend,
      unknownSpend,
      confidence,
    };
  }, [
    allAccounts,
    connectedBanks.length,
    profile.monthly_income,
    profile.monthly_savings_target,
    profile.risk_tolerance,
    profile.annual_income,
    profile.emergency_fund_target_months,
    profile.investment_horizon_years,
    summary.total_cash_value,
    summary.total_debt_value,
    summary.total_investment_value,
    spendingSummary.monthly_average,
    transactions,
  ]);

  const usingDemoData = !portfolio || !allAccounts || !bankAccounts || !transactionPage || !memory || !spending;
  const runwayTone = riskTone(derived.runwayBand);
  const savingsTone = riskTone(derived.savingsBand);
  const debtTone = riskTone(derived.debtBand);
  const comminglingTone = riskTone(derived.comminglingBand);

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
    const txCount = transactions.length;
    return [
      {
        id: "portfolio",
        title: "Portfolio summary",
        value: portfolio ? "Live" : "Demo",
        detail: portfolio
          ? "Portfolio totals are loaded from Strata."
          : "Founder operating room is using synthetic summary.",
        tone: portfolio ? "live" : "warning",
        href: "/dashboard",
        actionLabel: "Open dashboard",
        lastSyncedAt,
      },
      {
        id: "accounts",
        title: "Accounts",
        value: `${connectedBanks.length} bank source${connectedBanks.length === 1 ? "" : "s"}`,
        detail: connectedBanks.length > 0
          ? `${connectedBanks.length} linked bank source(s) detected.`
          : "No bank sources are linked yet.",
        tone: connectedBanks.length > 0 ? "live" : "warning",
        href: "/connect",
        actionLabel: "Link accounts",
      },
      {
        id: "transactions",
        title: "Transaction stream",
        value: `${txCount} txn${txCount === 1 ? "" : "s"}`,
        detail: txCount > 0 ? "Recent transactions are available." : "Transaction flow is using preview fixtures.",
        tone: txCount > 0 ? "live" : "warning",
      },
      {
        id: "connections",
        title: "Connection status",
        value: connections?.length ? `${connections.length} active` : "No active links",
        detail: connections?.length ? "Connector metadata is active." : "No connector metadata yet.",
        tone: connections?.length ? "live" : "warning",
      },
    ];
  }, [
    connections?.length,
    connectedBanks.length,
    lastSyncedAt,
    portfolio,
    transactions.length,
  ]);

  const runwayBar = toPercent(derived.runway / 12);
  const savingsBar = toPercent(derived.savingsRate);
  const debtBar = toPercent(1 - Math.min(0.9, derived.debtRatio));
  const comminglingBar = toPercent(1 - derived.personalShare);

  const summaryCards = [
    {
      label: "Runway",
      value: formatMonthsAsYears(Math.max(0, Math.round(derived.runway))),
      tone: runwayTone,
      bar: runwayBar,
      detail:
        derived.runway >= 12
          ? "Over 1 year buffer"
          : "Under 1 year runway; watch spend discipline",
    },
    {
      label: "Burn surplus",
      value: formatPercent(derived.savingsRate, 1),
      tone: savingsTone,
      bar: savingsBar,
      detail:
        derived.savingsRate > 0.2 ? "Cash generation is healthy" : "Improve pricing or expense control",
    },
    {
      label: "Debt load",
      value: formatPercent(derived.debtRatio, 1),
      tone: debtTone,
      bar: debtBar,
      detail:
        derived.debtRatio > 0.45
          ? "Debt is materially impacting risk posture"
          : "Debt remains controlled at current snapshot",
    },
    {
      label: "Execution confidence",
      value: `${derived.confidence}%`,
      tone: riskTone(derived.confidence >= 72 ? "good" : derived.confidence >= 48 ? "watch" : "critical"),
      bar: Math.max(12, derived.confidence),
      detail: "Signal reliability across accounts, memory, and transactions",
    },
  ];

  async function handleRefresh() {
    if (!hasSyncConsent) {
      refetchPortfolio();
      refetchAccounts();
      refetchBankAccounts();
      refetchTransactions();
      refetchMemory();
      refetchSpending();
      if (hasConnectionsConsent) {
        refetchConnections();
      }
      return;
    }

    await syncAllConnections.mutateAsync();
    refetchPortfolio();
    refetchAccounts();
    refetchTransactions();
    refetchBankAccounts();
    refetchMemory();
    refetchSpending();
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
            message="Could not load founder operating room data."
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
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Founder command center</p>
          <h1 className="mt-2 font-serif text-3xl text-white">Founder Operating Room</h1>
          <p className="mt-2 text-neutral-400 max-w-3xl">
            A founder-first cockpit for runway, burn, and financial discipline.
          </p>
          {usingDemoData ? (
            <p className="mt-2 text-xs text-amber-300 inline-flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Synthetic founder snapshot is active until live Strata data is connected.
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
          purpose="Analyze founder runway, operating discipline, and commingling risk with connected data"
        >
          <section className="grid lg:grid-cols-4 gap-4 mb-6">
            {summaryCards.map((item) => (
              <article
                key={item.label}
                className="rounded-xl border border-neutral-800 bg-neutral-900 p-5"
              >
                <p className="text-sm text-neutral-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                <p className={`mt-2 text-xs ${item.tone.text}`}>{item.tone.label}</p>
                <div className="mt-3 h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div className={`h-full ${item.tone.bar}`} style={{ width: `${item.bar}%` }} />
                </div>
                <p className="mt-3 text-xs text-neutral-500">{item.detail}</p>
              </article>
            ))}
          </section>

          <section className="grid lg:grid-cols-3 gap-4 mb-6">
            <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-white font-medium">Commingling signal</h2>
                <ShieldAlert className={`w-4 h-4 ${comminglingTone.text}`} />
              </div>
              <p className="mt-2 text-sm text-neutral-400">
                Personal spend share across observed transactions.
              </p>
              <p className={`mt-3 text-2xl ${comminglingTone.text}`}>
                {formatPercent(derived.personalShare, 1)}
              </p>
              <div className="mt-3 h-2 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className={`h-full ${comminglingTone.bar}`}
                  style={{ width: `${comminglingBar}%` }}
                />
              </div>
              <div className="mt-4 space-y-2 text-sm text-neutral-300">
                <p>Personal spend: {formatCurrency(derived.personalSpend)}</p>
                <p>Business spend: {formatCurrency(derived.businessSpend)}</p>
                <p>Unclassified: {formatCurrency(derived.unknownSpend)}</p>
              </div>
            </article>

            <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-white font-medium">Account posture</h2>
                <CircleDot className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="mt-4 space-y-2 text-sm text-neutral-300">
                <p>{derived.investmentAccounts} investment account(s)</p>
                <p>{derived.cashAccounts} cash account(s)</p>
                <p>{derived.debtAccounts} debt account(s)</p>
                <p>{derived.connectedBankCount} bank source(s)</p>
                <p>Monthly spend observed: {formatCurrency(derived.monthlySpend)}</p>
              </div>
            </article>

            <article className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-white font-medium">Priority actions</h2>
                <Wrench className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="mt-4 space-y-3">
                <Link
                  href="/dashboard/scenario-lab"
                  className="rounded-lg border border-neutral-700 p-3 block hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-sm text-neutral-100 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-300" />Run 12-month scenarios
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Stress-test runway and debt strategy under upside and downside paths.
                  </p>
                </Link>

                <Link
                  href="/dashboard/progress"
                  className="rounded-lg border border-neutral-700 p-3 block hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-sm text-neutral-100 flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4 text-emerald-300" />Track founder progress
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Watch trajectory with trend and milestone cards.
                  </p>
                </Link>

                <Link
                  href="/dashboard/coverage"
                  className="rounded-lg border border-emerald-800 bg-emerald-900/15 p-3 block hover:bg-emerald-900/30 transition-colors"
                >
                  <p className="text-sm text-emerald-100 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-emerald-200" />
                    Strengthen data quality
                  </p>
                  <p className="text-xs text-emerald-100/70 mt-1">
                    Fill profile and account gaps to improve recommendation strength.
                  </p>
                </Link>
                <Link
                  href="/dashboard/command-center"
                  className="rounded-lg border border-neutral-700 p-3 block hover:bg-neutral-800 transition-colors"
                >
                  <p className="text-sm text-neutral-100 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-300" />
                    Return to command center
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Consolidate operating posture and route the highest-priority execution action.
                  </p>
                </Link>
              </div>
            </article>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg text-white">Execution bridge</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Connect this operating posture to concrete founder-level decisions.
                </p>
              </div>
              <Link
                href="/dashboard/decision-narrative"
                className="inline-flex items-center gap-2 text-sm text-emerald-200 border border-emerald-900 bg-emerald-900/25 px-3 py-2 rounded-lg"
              >
                Review decision rationale
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-sm text-neutral-400">
                Current portfolio cash: <span className="text-white">{formatCurrency(derived.totalCash)}</span>
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Current debt: <span className="text-white">{formatCurrency(derived.totalDebt)}</span>
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Monthly income: <span className="text-white">{formatCurrency(derived.monthlyIncome)}</span>
              </p>
            </div>
          </section>
        </ConsentGate>
      </main>
    </div>
  );
}
