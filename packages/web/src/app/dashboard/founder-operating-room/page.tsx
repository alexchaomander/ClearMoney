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
  Percent,
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
import { MetricTrace } from "@/components/dashboard/MetricTrace";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { MetricCardSkeleton } from "@/components/dashboard/MetricCardSkeleton";
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
  useVulnerabilityReport,
  useRunwayMetrics,
  useTaxShieldMetrics,
  useSubscriptions,
} from "@/lib/strata/hooks";
import { 
  ActionCapability,
  AllAccountsResponse,
  CashAccount,
  DebtAccount,
  InvestmentAccount,
  SubscriptionSummary,
  Subscription,
} from "@clearmoney/strata-sdk";
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
      badge: "text-emerald-700 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700",
      bar: "bg-emerald-500",
      text: "text-emerald-600 dark:text-emerald-400",
      icon: "text-emerald-500",
      label: "Strong",
    };
  }
  if (risk === "watch") {
    return {
      badge: "text-amber-700 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700",
      bar: "bg-amber-500",
      text: "text-amber-600 dark:text-amber-400",
      icon: "text-amber-500",
      label: "Watch",
    };
  }
  return {
    badge: "text-rose-700 dark:text-rose-200 bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700",
    bar: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    icon: "text-rose-500",
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
    data: vulnerabilityReport,
    isLoading: vulnerabilityLoading,
    refetch: refetchVulnerability,
  } = useVulnerabilityReport({ enabled: hasConsent });
  const {
    data: runwayMetrics,
    isLoading: runwayLoading,
    refetch: refetchRunway,
  } = useRunwayMetrics({ enabled: hasConsent });
  const {
    data: taxShield,
    isLoading: taxShieldLoading,
    refetch: refetchTaxShield,
  } = useTaxShieldMetrics({ enabled: hasConsent });
  const {
    data: subscriptionData,
    isLoading: subscriptionsLoading,
    refetch: refetchSubscriptions,
  } = useSubscriptions({ enabled: hasConsent });
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
    spendingLoading ||
    vulnerabilityLoading ||
    runwayLoading ||
    taxShieldLoading ||
    subscriptionsLoading;

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

    // Use backend report if available
    const riskScore = vulnerabilityReport?.risk_score as number ?? 100;
    const comminglingBand: RiskBand = (vulnerabilityReport?.status as RiskBand) || bandFromRatio(Math.min(1, personalShare), "lowerIsBetter");

    const debtRatio = totalDebt / totalAssets;
    const runwayBand = bandFromRatio(Math.min(1, runway / 12), "higherIsBetter");
    const savingsBand = bandFromRatio(Math.min(1, savingsRate), "higherIsBetter");
    const debtBand = bandFromRatio(debtRatio, "lowerIsBetter");

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
        riskScore * 0.15 +
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
    vulnerabilityReport?.risk_score,
    vulnerabilityReport?.status,
  ]);

  const usingDemoData = !portfolio || !allAccounts || !bankAccounts || !transactionPage || !memory || !spending;
  
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
    connections,
    connectedBanks.length,
    lastSyncedAt,
    portfolio,
    connectedBanks,
    transactions,
  ]);

  const personalRunway = runwayMetrics?.personal.runway_months ?? derived.runway;
  const entityRunway = runwayMetrics?.entity.runway_months ?? 0;

  const metricConfigs = useMemo(() => [
    {
      id: "personalRunway",
      label: "Personal Runway",
      value: formatMonthsAsYears(Math.max(0, Math.round(personalRunway))),
      subValue: personalRunway >= 12 ? "Over 1 year buffer" : "Under 1 year runway",
      intent: derived.runwayBand === "good" ? "emerald" as const : derived.runwayBand === "watch" ? "amber" as const : "error" as const,
      confidence: derived.confidence / 100,
      metricId: "personalRunway",
    },
    {
      id: "entityRunway",
      label: "Entity Runway",
      value: formatMonthsAsYears(Math.max(0, Math.round(entityRunway))),
      subValue: entityRunway >= 12 ? "Solid business runway" : entityRunway > 0 ? "Monitor burn closely" : "No business accounts",
      intent: entityRunway >= 12 ? "emerald" as const : entityRunway > 3 ? "amber" as const : "error" as const,
      confidence: derived.confidence / 100,
    },
    {
      id: "savingsRate",
      label: "Burn Surplus",
      value: formatPercent(derived.savingsRate, 1),
      subValue: derived.savingsRate > 0.2 ? "Healthy cash generation" : "Tight margins",
      intent: derived.savingsBand === "good" ? "emerald" as const : derived.savingsBand === "watch" ? "amber" as const : "error" as const,
      confidence: derived.confidence / 100,
      metricId: "savingsRate",
    },
    {
      id: "debtLoad",
      label: "Debt Load",
      value: formatPercent(derived.debtRatio, 1),
      subValue: derived.debtRatio > 0.45 ? "High leverage" : "Controlled debt",
      intent: derived.debtBand === "good" ? "emerald" as const : derived.debtBand === "watch" ? "amber" as const : "error" as const,
      confidence: derived.confidence / 100,
      metricId: "netWorth",
    },
  ], [personalRunway, entityRunway, derived]);

  const comminglingTone = riskTone(derived.comminglingBand);
  const comminglingBar = toPercent(1 - derived.personalShare);

  async function handleRefresh() {
    if (!hasSyncConsent) {
      refetchPortfolio();
      refetchAccounts();
      refetchBankAccounts();
      refetchTransactions();
      refetchMemory();
      refetchSpending();
      refetchVulnerability();
      refetchRunway();
      refetchTaxShield();
      refetchSubscriptions();
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
            message="Could not load founder operating room data."
            error={errorDetails}
            onRetry={handleRefresh}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 transition-colors duration-500">
      <div
        className="fixed inset-0 opacity-10 dark:opacity-30 pointer-events-none"
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
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 font-bold">Founder command center</p>
          <h1 className="mt-2 font-serif text-3xl text-slate-900 dark:text-white">Founder Operating Room</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-3xl">
            A founder-first cockpit for runway, burn, and financial discipline.
          </p>
          {usingDemoData ? (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-300 inline-flex items-center gap-2 font-bold">
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
            {isLoading ? (
              <>
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
                <MetricCardSkeleton />
              </>
            ) : (
              <>
                {metricConfigs.map((config) => (
                  <MetricCard
                    key={config.id}
                    label={config.label}
                    value={config.value}
                    subValue={config.subValue}
                    intent={config.intent}
                    confidence={config.confidence}
                    metricId={config.metricId}
                  />
                ))}
                <MetricCard
                  label="Execution Confidence"
                  value={`${derived.confidence}%`}
                  subValue="Signal reliability"
                  intent={derived.confidence >= 72 ? "emerald" : derived.confidence >= 48 ? "amber" : "error"}
                  confidence={1.0}
                />
              </>
            )}
          </section>

          <section className="grid lg:grid-cols-3 gap-4 mb-6">
            <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-slate-900 dark:text-white font-medium">Subscription audit</h2>
                <div className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40 text-[10px] font-bold">
                  { subscriptionData?.subscription_count ?? 0 } ACTIVE
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Monthly burn from recurring SaaS and services.
              </p>
              <p className="mt-3 text-2xl text-slate-900 dark:text-white font-display">
                {formatCurrency(subscriptionData?.total_monthly_subscription_burn ?? 0)}/mo
              </p>
              <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-2">
                {(subscriptionData?.subscriptions ?? []).slice(0, 5).map((s: Subscription) => (
                  <div key={s.merchant} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-700 dark:text-neutral-200 truncate">{s.merchant}</p>
                      <p className="text-[10px] text-slate-400 dark:text-neutral-500 uppercase">{s.frequency}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-neutral-300 font-mono">
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                ))}
                {(!subscriptionData || subscriptionData.subscriptions.length === 0) && (
                  <p className="text-xs text-slate-400 dark:text-neutral-600 italic">No recurring patterns detected.</p>
                )}
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-slate-900 dark:text-white font-medium">Tax shield posture</h2>
                <Percent className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Estimated quarterly tax liability based on YTD business income.
              </p>
              <p className="mt-3 text-2xl text-slate-900 dark:text-white font-display">
                {formatCurrency(taxShield?.next_quarterly_payment as number ?? 0)}
              </p>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-neutral-300">
                <p>YTD Biz Income: {formatCurrency(taxShield?.ytd_business_income as number ?? 0)}</p>
                <p>Combined Rate: {formatPercent(taxShield?.estimated_combined_tax_rate as number ?? 0.31, 1)}</p>
                <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                  taxShield?.safe_harbor_met 
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40" 
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/40"
                }`}>
                  {taxShield?.safe_harbor_met ? "Safe Harbor Met" : "Action Recommended"}
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-slate-900 dark:text-white font-medium">Commingling signal</h2>
                <ShieldAlert className={`w-4 h-4 ${comminglingTone.icon}`} />
              </div>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Personal spend share across observed transactions.
              </p>
              <p className={`mt-3 text-2xl font-display ${comminglingTone.text}`}>
                {vulnerabilityReport?.risk_score as number ?? toPercent(1 - derived.personalShare)}%
              </p>
              <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full ${comminglingTone.bar}`}
                  style={{ width: `${vulnerabilityReport?.risk_score as number ?? comminglingBar}%` }}
                />
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-neutral-300">
                <p>Personal spend: {formatCurrency(vulnerabilityReport?.commingled_amount as number ?? derived.personalSpend)}</p>
                <p>Total analyzed: {vulnerabilityReport?.total_analyzed as number ?? transactions.length} txns</p>
                <p>Alerts: {vulnerabilityReport?.commingled_count as number ?? 0}</p>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-slate-900 dark:text-white font-medium">Account posture</h2>
                <CircleDot className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-neutral-300">
                <p>{derived.investmentAccounts} investment account(s)</p>
                <p>{derived.cashAccounts} cash account(s)</p>
                <p>{derived.debtAccounts} debt account(s)</p>
                <p>{derived.connectedBankCount} bank source(s)</p>
                <p>Monthly spend observed: {formatCurrency(derived.monthlySpend)}</p>
              </div>
            </article>

            <article className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-slate-900 dark:text-white font-medium">Priority actions</h2>
                <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div className="mt-4 space-y-3">
                <Link
                  href="/dashboard/scenario-lab"
                  className="rounded-lg border border-slate-100 dark:border-slate-700 p-3 block hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <p className="text-sm text-slate-900 dark:text-neutral-100 flex items-center gap-2 font-bold">
                    <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />Run 12-month scenarios
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                    Stress-test runway and debt strategy under upside and downside paths.
                  </p>
                </Link>

                <Link
                  href="/dashboard/progress"
                  className="rounded-lg border border-slate-100 dark:border-slate-700 p-3 block hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <p className="text-sm text-slate-900 dark:text-neutral-100 flex items-center gap-2 font-bold">
                    <CircleDollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />Track founder progress
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                    Watch trajectory with trend and milestone cards.
                  </p>
                </Link>

                <Link
                  href="/dashboard/coverage"
                  className="rounded-lg border border-emerald-100 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/15 p-3 block hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 transition-colors shadow-sm"
                >
                  <p className="text-sm text-emerald-800 dark:text-emerald-100 flex items-center gap-2 font-bold">
                    <AlertTriangle className="w-4 h-4 text-emerald-600 dark:text-emerald-200" />
                    Strengthen data quality
                  </p>
                  <p className="text-xs text-emerald-700/70 dark:text-emerald-100/70 mt-1">
                    Fill profile and account gaps to improve recommendation strength.
                  </p>
                </Link>
                <Link
                  href="/dashboard/command-center"
                  className="rounded-lg border border-slate-100 dark:border-slate-700 p-3 block hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                >
                  <p className="text-sm text-slate-900 dark:text-neutral-100 flex items-center gap-2 font-bold">
                    <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
                    Return to command center
                  </p>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                    Consolidate operating posture and route the highest-priority execution action.
                  </p>
                </Link>
              </div>
            </article>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-colors duration-500">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg text-slate-900 dark:text-white">Execution bridge</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Connect this operating posture to concrete founder-level decisions.
                </p>
              </div>
              <Link
                href="/dashboard/decision-narrative"
                className="inline-flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-900/25 px-3 py-2 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all shadow-sm"
              >
                Review decision rationale
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="mt-4 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Current portfolio cash: <span className="text-slate-900 dark:text-white font-mono font-bold">{formatCurrency(derived.totalCash)}</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Current debt: <span className="text-slate-900 dark:text-white font-mono font-bold">{formatCurrency(derived.totalDebt)}</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Monthly income: <span className="text-slate-900 dark:text-white font-mono font-bold">{formatCurrency(derived.monthlyIncome)}</span>
              </p>
            </div>
          </section>
        </ConsentGate>
      </main>
    </div>
  );
}
