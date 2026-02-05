"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Link2, PenLine } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { ConcentrationAlert } from "@/components/dashboard/ConcentrationAlert";
import { PortfolioHistoryChart } from "@/components/dashboard/PortfolioHistoryChart";
import { CashDebtSection } from "@/components/dashboard/CashDebtSection";
import { AddAccountModal } from "@/components/dashboard/AddAccountModal";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DecisionTracePanel } from "@/components/dashboard/DecisionTracePanel";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
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
import type { HoldingDetail } from "@clearmoney/strata-sdk";

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
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasPortfolioConsent });

  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
    refetch: refetchAccounts,
  } = useInvestmentAccounts({ enabled: hasPortfolioConsent });

  const {
    data: holdingsData,
    isLoading: holdingsLoading,
    isError: holdingsError,
    refetch: refetchHoldings,
  } = useHoldings({ enabled: hasPortfolioConsent });

  const {
    data: allAccountsData,
    isLoading: allAccountsLoading,
    isError: allAccountsError,
    refetch: refetchAllAccounts,
  } = useAccounts({ enabled: hasPortfolioConsent });

  const { data: connections } = useConnections({ enabled: hasPortfolioConsent });

  const isLoading = portfolioLoading || accountsLoading || holdingsLoading || allAccountsLoading;
  const isError = portfolioError || accountsError || holdingsError || allAccountsError;

  async function handleRefresh() {
    if (hasSyncConsent) {
      await syncAllConnections.mutateAsync();
    }
    refetchPortfolio();
    refetchAccounts();
    refetchHoldings();
    refetchAllAccounts();
  }

  const hasAccounts = accounts && accounts.length > 0;
  const holdings = holdingsData ? mapHoldings(holdingsData) : [];

  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncDates = connections
      .map((c) => c.last_synced_at)
      .filter((d): d is string => !!d)
      .map((d) => new Date(d).getTime());
    if (!syncDates.length) return null;
    return new Date(Math.max(...syncDates));
  }, [connections]);

  function renderContent() {
    if (isLoading) {
      return <DashboardLoadingSkeleton />;
    }

    if (isError) {
      return (
        <ApiErrorState
          message="We couldn't load your portfolio data. Please check that the API is running and try again."
          onRetry={handleRefresh}
        />
      );
    }

    if (!hasAccounts) {
      return <EmptyState />;
    }

    return (
      <>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-serif text-3xl text-white mb-1">
              Portfolio Dashboard
            </h1>
            <p className="text-neutral-400">
              Your complete investment overview
            </p>
            {lastSyncedAt && (
              <p className="text-xs text-neutral-500 mt-1">
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
                  className="absolute right-0 mt-2 w-52 rounded-xl bg-neutral-900 border border-neutral-800 shadow-xl overflow-hidden z-20"
                >
                  <Link
                    href="/connect"
                    onClick={() => setShowAddDropdown(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
                  >
                    <Link2 className="w-4 h-4 text-emerald-400" />
                    Link Brokerage
                  </Link>
                  <button
                    onClick={() => { setShowAddDropdown(false); setShowAddModal(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-neutral-200 hover:bg-neutral-800 transition-colors"
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
                <div className="text-sm text-neutral-400">
                  Authorize access to see your portfolio.
                </div>
              </ConsentGate>
            )}
            {portfolio && (
              <NetWorthCard
                totalAssets={portfolio.total_investment_value + portfolio.total_cash_value}
                totalLiabilities={portfolio.total_debt_value}
                netWorth={portfolio.net_worth}
                taxAdvantagedValue={portfolio.tax_advantaged_value}
                taxableValue={portfolio.taxable_value}
              />
            )}

            <PortfolioHistoryChart />

            <ConsentGate
              scopes={["decision_traces:read"]}
              purpose="Display decision traces in your dashboard."
            >
              <DecisionTracePanel />
            </ConsentGate>

            {portfolio && portfolio.concentration_alerts.length > 0 && (
              <ConcentrationAlert alerts={portfolio.concentration_alerts} />
            )}

            {portfolio && (
              <HoldingsTable
                holdings={holdings}
                totalValue={portfolio.total_investment_value}
              />
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {portfolio && (
              <AllocationChart
                allocations={portfolio.allocation_by_asset_type}
                title="Asset Allocation"
              />
            )}

            {portfolio && (
              <AllocationChart
                allocations={portfolio.allocation_by_account_type}
                title="By Account Type"
              />
            )}

            {allAccountsData && (
              <CashDebtSection
                cashAccounts={allAccountsData.cash_accounts}
                debtAccounts={allAccountsData.debt_accounts}
                onDeleteCashAccount={(id) => cashMutations.remove.mutate(id)}
                onDeleteDebtAccount={(id) => debtMutations.remove.mutate(id)}
              />
            )}

            {accounts && (
              <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-xl text-neutral-100">
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
                  accounts={accounts.map((a) => ({
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
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader
        onRefresh={handleRefresh}
        isRefreshing={isLoading || syncAllConnections.isPending}
        showRefresh={!!hasAccounts}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <AddAccountModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
