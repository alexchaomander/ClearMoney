"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { ConcentrationAlert } from "@/components/dashboard/ConcentrationAlert";
import { EmptyState } from "@/components/dashboard/EmptyState";

// Mock data for the dashboard
const mockPortfolio = {
  total_investment_value: 237000,
  total_cash_value: 15000,
  total_debt_value: 28000,
  net_worth: 224000,
  tax_advantaged_value: 170000,
  taxable_value: 67000,
  allocation_by_asset_type: [
    { category: "stock", value: 142200, percentage: 60 },
    { category: "etf", value: 47400, percentage: 20 },
    { category: "mutual_fund", value: 23700, percentage: 10 },
    { category: "bond", value: 11850, percentage: 5 },
    { category: "cash", value: 11850, percentage: 5 },
  ],
  allocation_by_account_type: [
    { category: "401k", value: 125000, percentage: 52.7 },
    { category: "brokerage", value: 67000, percentage: 28.3 },
    { category: "roth_ira", value: 45000, percentage: 19.0 },
  ],
  top_holdings: [
    { ticker: "VTI", name: "Vanguard Total Stock Market ETF", security_type: "etf", quantity: 150, market_value: 38500, cost_basis: 32000, account_name: "Fidelity 401(k)" },
    { ticker: "AAPL", name: "Apple Inc.", security_type: "stock", quantity: 100, market_value: 19200, cost_basis: 15000, account_name: "Fidelity Brokerage" },
    { ticker: "MSFT", name: "Microsoft Corporation", security_type: "stock", quantity: 50, market_value: 18900, cost_basis: 14000, account_name: "Fidelity Brokerage" },
    { ticker: "VOO", name: "Vanguard S&P 500 ETF", security_type: "etf", quantity: 40, market_value: 17600, cost_basis: 15500, account_name: "Roth IRA" },
    { ticker: "GOOGL", name: "Alphabet Inc.", security_type: "stock", quantity: 30, market_value: 4200, cost_basis: 3800, account_name: "Fidelity Brokerage" },
    { ticker: "BND", name: "Vanguard Total Bond Market ETF", security_type: "bond", quantity: 150, market_value: 11850, cost_basis: 12000, account_name: "Fidelity 401(k)" },
    { ticker: "FXAIX", name: "Fidelity 500 Index Fund", security_type: "mutual_fund", quantity: 120, market_value: 23700, cost_basis: 20000, account_name: "Fidelity 401(k)" },
  ],
  concentration_alerts: [
    { ticker: "VTI", name: "Vanguard Total Stock Market ETF", percentage: 16.2, message: "VTI represents 16.2% of your portfolio" },
  ],
};

const mockAccounts = [
  { id: "acc-1", name: "Fidelity 401(k)", balance: 125000, account_type: "401k", is_tax_advantaged: true, last_synced_at: new Date().toISOString(), status: "active" as const },
  { id: "acc-2", name: "Fidelity Brokerage", balance: 67000, account_type: "brokerage", is_tax_advantaged: false, last_synced_at: new Date().toISOString(), status: "active" as const },
  { id: "acc-3", name: "Roth IRA", balance: 45000, account_type: "roth_ira", is_tax_advantaged: true, last_synced_at: new Date().toISOString(), status: "active" as const },
];

const mockHoldings = mockPortfolio.top_holdings.map((h, i) => ({
  id: `holding-${i}`,
  ...h,
  account_type: i < 2 ? "401k" : i < 5 ? "brokerage" : "roth_ira",
}));

export default function DashboardPage() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showEmptyState, setShowEmptyState] = useState(false); // Toggle for demo

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In production, this would call the sync API
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  // In production, this would check if accounts.length === 0
  const hasAccounts = !showEmptyState;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Background gradient */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Navigation */}
      <DashboardHeader
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        showRefresh={hasAccounts}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Demo toggle - remove in production */}
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowEmptyState(!showEmptyState)}
            className="text-xs px-3 py-1.5 rounded-full bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
          >
            {showEmptyState ? "Show with data" : "Show empty state"}
          </button>
        </div>

        {!hasAccounts ? (
          <EmptyState />
        ) : (
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
          {/* Left column - Net worth and accounts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Net Worth Card */}
            <NetWorthCard
              totalAssets={mockPortfolio.total_investment_value + mockPortfolio.total_cash_value}
              totalLiabilities={mockPortfolio.total_debt_value}
              netWorth={mockPortfolio.net_worth}
              taxAdvantagedValue={mockPortfolio.tax_advantaged_value}
              taxableValue={mockPortfolio.taxable_value}
            />

            {/* Concentration Alerts */}
            <ConcentrationAlert alerts={mockPortfolio.concentration_alerts} />

            {/* Holdings Table */}
            <HoldingsTable
              holdings={mockHoldings}
              totalValue={mockPortfolio.total_investment_value}
            />
          </div>

          {/* Right column - Allocation and accounts list */}
          <div className="space-y-6">
            {/* Asset Allocation */}
            <AllocationChart
              allocations={mockPortfolio.allocation_by_asset_type}
              title="Asset Allocation"
            />

            {/* Account Type Allocation */}
            <AllocationChart
              allocations={mockPortfolio.allocation_by_account_type}
              title="By Account Type"
            />

            {/* Accounts List */}
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
              <AccountsList accounts={mockAccounts} />
            </div>
          </div>
        </div>
          </>
        )}
      </main>
    </div>
  );
}
