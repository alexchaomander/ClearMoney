"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Compass,
  Plus,
  PenLine,
  Route,
  Sparkles,
  FlaskConical,
  Link2,
  RefreshCw,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { ConcentrationAlert } from "@/components/dashboard/ConcentrationAlert";
import dynamic from "next/dynamic";

const PortfolioHistoryChart = dynamic(
  () => import("@/components/dashboard/PortfolioHistoryChart").then(m => m.PortfolioHistoryChart),
  { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> }
);
import { CashDebtSection } from "@/components/dashboard/CashDebtSection";
import { TaxDocumentsCard } from "@/components/dashboard/TaxDocumentsCard";
import { AddAccountModal } from "@/components/dashboard/AddAccountModal";
import { DecisionTracePanel } from "@/components/dashboard/DecisionTracePanel";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import { AssumptionControl } from "@/components/dashboard/AssumptionControl";
import {
  usePortfolioSummary,
  useInvestmentAccounts,
  useHoldings,
  useAccounts,
  useConnections,
  useCashAccountMutations,
  useDebtAccountMutations,
  useConsentStatus,
  useSyncAllConnections,
} from "@/lib/strata/hooks";
import { type PortfolioHistoryRange, type HoldingDetail } from "@clearmoney/strata-sdk";
import {
  getPreviewAccounts,
  getPreviewHoldings,
  getPreviewPortfolioHistory,
  getPreviewPortfolioSummary,
} from "./_shared/preview-data";

function mapHoldings(details: HoldingDetail[]) {
  return details.map((h) => ({
    id: h.id,
    ticker: h.security.ticker,
    name: h.security.name,
    security_type: h.security.security_type,
    quantity: h.quantity,
    market_value: h.market_value ?? 0,
    cost_basis: h.cost_basis,
    account_name: h.account_name,
    account_type: h.account_type,
  }));
}

export default function DashboardPage() {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const previewPortfolioSummary = useMemo(() => getPreviewPortfolioSummary(), []);
  const previewAccounts = useMemo(() => getPreviewAccounts(), []);
  const previewHoldings = useMemo(() => getPreviewHoldings(), []);
  const previewHistory = useMemo<Record<PortfolioHistoryRange, ReturnType<typeof getPreviewPortfolioHistory>>>(() => ({
    "30d": getPreviewPortfolioHistory("30d"),
    "90d": getPreviewPortfolioHistory("90d"),
    "1y": getPreviewPortfolioHistory("1y"),
    all: getPreviewPortfolioHistory("all"),
  }), []);

  const cashMutations = useCashAccountMutations();
  const debtMutations = useDebtAccountMutations();
  const syncAllConnections = useSyncAllConnections();
  const { hasConsent: hasPortfolioConsent } = useConsentStatus([
    "portfolio:read",
    "accounts:read",
    "connections:read",
  ]);
  const { hasConsent: hasSyncConsent } = useConsentStatus([
    "connections:write",
  ]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAddDropdown(false);
      }
    }
    if (showAddDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAddDropdown]);

  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorDetails,
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasPortfolioConsent });

  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
    error: accountsErrorDetails,
    refetch: refetchAccounts,
  } = useInvestmentAccounts({ enabled: hasPortfolioConsent });

  const {
    data: holdingsData,
    isLoading: holdingsLoading,
    isError: holdingsError,
    error: holdingsErrorDetails,
    refetch: refetchHoldings,
  } = useHoldings({ enabled: hasPortfolioConsent });

  const {
    data: allAccountsData,
    isLoading: allAccountsLoading,
    isError: allAccountsError,
    error: allAccountsErrorDetails,
    refetch: refetchAllAccounts,
  } = useAccounts({ enabled: hasPortfolioConsent });

  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasPortfolioConsent });

  const isLoading =
    portfolioLoading ||
    accountsLoading ||
    holdingsLoading ||
    allAccountsLoading ||
    connectionsLoading;
  const isError = portfolioError || accountsError || holdingsError || allAccountsError || connectionsError;
  const errorDetails =
    portfolioErrorDetails ||
    accountsErrorDetails ||
    holdingsErrorDetails ||
    allAccountsErrorDetails ||
    connectionsErrorDetails;

  async function handleRefresh() {
    if (hasSyncConsent) {
      await syncAllConnections.mutateAsync();
    }
    refetchPortfolio();
    refetchAccounts();
    refetchHoldings();
    refetchAllAccounts();
    if (connections) {
      refetchConnections();
    }
  }

  const usingDemoData = !portfolio || !accounts || !holdingsData || !allAccountsData;
  const effectivePortfolio = portfolio ?? previewPortfolioSummary;
  const effectiveInvestmentAccounts = accounts ?? previewAccounts.investment_accounts;
  const effectiveAllAccounts = allAccountsData ?? previewAccounts;
  const effectiveHoldingsRows = useMemo(() => mapHoldings(holdingsData ?? previewHoldings), [holdingsData, previewHoldings]);
  const hasLivePortfolio = Boolean(portfolio);
  const hasLiveAccounts = Boolean(accounts || allAccountsData);
  const hasLiveHoldings = Boolean(holdingsData);
  const accountCount =
    effectiveAllAccounts.investment_accounts.length +
    effectiveAllAccounts.cash_accounts.length +
    effectiveAllAccounts.debt_accounts.length;
  const holdingsCount = effectiveHoldingsRows.length;
  const hasAccounts = accountCount > 0;

  const intelligenceCards = [
    {
      href: "/dashboard/founder-operating-room",
      icon: Compass,
      label: "Founder Operating Room",
      description: "Monitor cash runway, founder spending discipline, and commingling risk.",
    },
    {
      href: "/dashboard/scenario-lab",
      icon: FlaskConical,
      label: "Scenario Lab",
      description: "Model market, savings, and debt assumptions across 12-month futures.",
    },
    {
      href: "/dashboard/progress",
      icon: Route,
      label: "Progress",
      description: "Track runway, savings momentum, and debt pressure over time.",
    },
    {
      href: "/dashboard/command-center",
      icon: CheckCircle2,
      label: "Command Center",
      description: "One place to reconcile readiness signals and prioritize action.",
    },
  ];

  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncDates = connections
      .map((c) => c.last_synced_at)
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d).getTime());
    if (!syncDates.length) return null;
    return new Date(Math.max(...syncDates));
  }, [connections]);

  const sourceItems = useMemo<DataSourceStatusItem[]>(() => [
    {
      id: "portfolio",
      title: "Portfolio summary",
      value: hasLivePortfolio ? "Live" : "Demo",
      detail: hasLivePortfolio
        ? "Portfolio summary is connected from Strata."
        : "Synthetic summary is active until connected.",
      tone: hasLivePortfolio ? "live" : "warning",
      href: "/dashboard/coverage",
      actionLabel: "Review coverage",
      lastSyncedAt: lastSyncedAt?.toISOString(),
    },
    {
      id: "accounts",
      title: "Accounts",
      value: `${accountCount} source${accountCount === 1 ? "" : "s"}`,
      detail: hasLiveAccounts
        ? `${effectiveAllAccounts.investment_accounts.length} investment, ${effectiveAllAccounts.cash_accounts.length} cash, ${effectiveAllAccounts.debt_accounts.length} debt`
        : "Demo account set is active while you connect live links.",
      tone: hasLiveAccounts ? "live" : "warning",
      href: "/connect",
      actionLabel: "Link accounts",
    },
    {
      id: "holdings",
      title: "Holdings",
      value: `${holdingsCount} position${holdingsCount === 1 ? "" : "s"}`,
      detail: hasLiveHoldings
        ? "Holdings stream is connected."
        : "Holdings list uses realistic preview fixtures.",
      tone: hasLiveHoldings ? "live" : "warning",
    },
    {
      id: "connections",
      title: "Connection sync",
      value: connections?.length ? `${connections.length} active` : "No active links",
      detail: connections?.length
        ? "Connector metadata is connected."
        : "No live connector metadata yet.",
      tone: connections?.length ? "live" : "warning",
      href: "/connect",
      actionLabel: "Manage links",
    },
  ], [
    accountCount,
    connections,
    effectiveAllAccounts.cash_accounts,
    effectiveAllAccounts.debt_accounts,
    effectiveAllAccounts.investment_accounts,
    hasLiveAccounts,
    hasLiveHoldings,
    hasLivePortfolio,
    holdingsCount,
    lastSyncedAt,
  ]);

  function renderContent() {
    return (
      <>
        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
        <AssumptionControl />
        {usingDemoData ? (
          <p className="mb-4 text-xs text-amber-600 dark:text-amber-300 inline-flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            Running synthetic preview data until live Strata connections are available.
          </p>
        ) : null}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-serif text-3xl text-slate-900 dark:text-white mb-1">
              Portfolio Dashboard
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Your complete investment overview
            </p>
            {lastSyncedAt && (
              <p className="text-xs text-slate-500 mt-1">
                Last synced: {lastSyncedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowAddDropdown((p) => !p)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
            <AnimatePresence>
              {showAddDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden z-20"
                >
                  <Link
                    href="/connect"
                    onClick={() => setShowAddDropdown(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Link2 className="w-4 h-4 text-emerald-400" />
                    Link Brokerage
                  </Link>
                  <button
                    onClick={() => { setShowAddDropdown(false); setShowAddModal(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <PenLine className="w-4 h-4 text-emerald-400" />
                    Add Manually
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {!hasPortfolioConsent && (
              <ConsentGate
                scopes={["portfolio:read", "accounts:read", "connections:read"]}
                purpose="Load your accounts, balances, and holdings for the dashboard."
              >
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Authorize access to see your portfolio.
                </div>
              </ConsentGate>
            )}

            <NetWorthCard
              totalAssets={effectivePortfolio.total_investment_value + effectivePortfolio.total_cash_value}
              totalLiabilities={effectivePortfolio.total_debt_value}
              netWorth={effectivePortfolio.net_worth}
              taxAdvantagedValue={effectivePortfolio.tax_advantaged_value}
              taxableValue={effectivePortfolio.taxable_value}
            />

            <PortfolioHistoryChart
              previewHistory={usingDemoData ? previewHistory : undefined}
            />

            <ConsentGate
              scopes={["decision_traces:read"]}
              purpose="Display decision traces in your dashboard."
            >
              <DecisionTracePanel />
            </ConsentGate>

            <ConcentrationAlert alerts={effectivePortfolio.concentration_alerts} />

            <HoldingsTable
              holdings={effectiveHoldingsRows}
              totalValue={effectivePortfolio.total_investment_value}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <AllocationChart
              allocations={effectivePortfolio.allocation_by_asset_type}
              title="Asset Allocation"
            />

            <AllocationChart
              allocations={effectivePortfolio.allocation_by_account_type}
              title="By Account Type"
            />

            <CashDebtSection
              cashAccounts={effectiveAllAccounts.cash_accounts}
              debtAccounts={effectiveAllAccounts.debt_accounts}
              onDeleteCashAccount={(id) => cashMutations.remove.mutate(id)}
              onDeleteDebtAccount={(id) => debtMutations.remove.mutate(id)}
            />

            <TaxDocumentsCard />

            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl text-slate-800 dark:text-slate-100">
                  Linked Accounts
                </h3>
                <Link
                  href="/connect"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  + Add
                </Link>
              </div>
              <AccountsList
                accounts={effectiveInvestmentAccounts.map((a) => ({
                  id: a.id,
                  name: a.name,
                  balance: a.balance,
                  account_type: a.account_type,
                  is_tax_advantaged: a.is_tax_advantaged,
                  last_synced_at: a.updated_at,
                  status: "active" as const,
                }))}
              />
            </div>
          </div>
        </div>
      </>
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
        onRefresh={handleRefresh}
        isRefreshing={isLoading || syncAllConnections.isPending}
        showRefresh={!!hasAccounts}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {isLoading || isError ? (
          <>
            <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
            {isLoading ? <DashboardLoadingSkeleton /> : (
              <ApiErrorState
                message="We couldn't load your portfolio data. Please check that the API is running and try again."
                error={errorDetails}
                onRetry={handleRefresh}
              />
            )}
          </>
        ) : (
          renderContent()
        )}

        {!isLoading && !isError && hasAccounts && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Intelligence Hub</p>
                <h2 className="font-serif text-2xl text-slate-900 dark:text-white mt-2">
                  Founder-first execution layers built on your data surface
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Decision-ready context
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {intelligenceCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-emerald-700 transition-colors"
                >
                  <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-emerald-300">
                    <card.icon className="w-4 h-4" />
                  </div>
                  <h3 className="mt-3 text-sm text-slate-900 dark:text-white font-medium">{card.label}</h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.description}</p>
                </Link>
              ))}
            </div>

            <Link
              href="/dashboard/coverage"
              className="inline-flex items-center gap-2 mt-4 text-sm text-emerald-300 hover:text-emerald-200"
            >
              <BarChart3 className="w-4 h-4" />
              Open data coverage map
            </Link>
          </section>
        )}
      </main>

      <AddAccountModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
