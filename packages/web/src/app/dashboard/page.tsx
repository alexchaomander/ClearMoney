"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { ConcentrationAlert } from "@/components/dashboard/ConcentrationAlert";
import { CashDebtSection } from "@/components/dashboard/CashDebtSection";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import {
  usePortfolioSummary,
  useInvestmentAccounts,
  useHoldings,
  useAccounts,
  useConnections,
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
  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    refetch: refetchPortfolio,
  } = usePortfolioSummary();

  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
    refetch: refetchAccounts,
  } = useInvestmentAccounts();

  const {
    data: holdingsData,
    isLoading: holdingsLoading,
    isError: holdingsError,
    refetch: refetchHoldings,
  } = useHoldings();

  const {
    data: allAccountsData,
    isLoading: allAccountsLoading,
    refetch: refetchAllAccounts,
  } = useAccounts();

  const { data: connections } = useConnections();

  const isLoading = portfolioLoading || accountsLoading || holdingsLoading || allAccountsLoading;
  const isError = portfolioError || accountsError || holdingsError;

  function handleRefresh() {
    refetchPortfolio();
    refetchAccounts();
    refetchHoldings();
    refetchAllAccounts();
  }

  const hasAccounts = accounts && accounts.length > 0;
  const holdings = holdingsData ? mapHoldings(holdingsData) : [];

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
            {connections && connections.length > 0 && connections[0].last_synced_at && (
              <p className="text-xs text-neutral-500 mt-1">
                Last synced: {new Date(connections[0].last_synced_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            )}
          </div>
          <Link
            href="/connect"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Account
          </Link>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {portfolio && (
              <NetWorthCard
                totalAssets={portfolio.total_investment_value + portfolio.total_cash_value}
                totalLiabilities={portfolio.total_debt_value}
                netWorth={portfolio.net_worth}
                taxAdvantagedValue={portfolio.tax_advantaged_value}
                taxableValue={portfolio.taxable_value}
              />
            )}

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
        isRefreshing={isLoading}
        showRefresh={!!hasAccounts}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}
