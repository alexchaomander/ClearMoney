"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, RefreshCw } from "lucide-react";
import { formatCurrency, formatTitleCase } from "@/lib/shared/formatters";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";

interface Holding {
  id: string;
  ticker: string | null;
  name: string;
  security_type: string;
  quantity: number;
  market_value: number;
  cost_basis: number | null;
  account_name: string;
  account_type: string;
}

interface Allocation {
  category: string;
  value: number;
  percentage: number;
}

interface AccountData {
  id: string;
  name: string;
  balance: number;
  account_type: string;
  is_tax_advantaged: boolean;
  institution_name: string;
  provider_account_id: string;
  holdings: Holding[];
  allocation: Allocation[];
}

interface AccountDetailProps {
  account: AccountData | null;
}

export function AccountDetail({ account }: AccountDetailProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  if (!account) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl text-white mb-2">Account Not Found</h1>
          <p className="text-neutral-400 mb-4">The account you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/dashboard"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const totalCostBasis = account.holdings.reduce(
    (sum, h) => sum + (h.cost_basis || 0),
    0
  );
  const totalGainLoss = account.balance - totalCostBasis;
  const gainLossPercent = totalCostBasis > 0
    ? (totalGainLoss / totalCostBasis) * 100
    : 0;

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
      <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-800 transition-all duration-300 group-hover:scale-105">
                <Calculator className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="font-serif text-xl tracking-tight text-white">
                Clear<span className="text-emerald-400">Money</span>
              </span>
            </Link>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 text-neutral-300" />
              </motion.div>
            </button>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Account Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center text-xl font-medium text-neutral-200">
                  {account.name.charAt(0)}
                </div>
                <div>
                  <h1 className="font-serif text-3xl text-white">
                    {account.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <span>{formatTitleCase(account.account_type)}</span>
                    <span>•</span>
                    <span>{account.institution_name}</span>
                    {account.is_tax_advantaged && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400">Tax-Advantaged</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-serif text-4xl text-white mb-1">
                {formatCurrency(account.balance)}
              </p>
              <p
                className={`text-sm font-medium ${
                  totalGainLoss >= 0 ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {totalGainLoss >= 0 ? "+" : ""}
                {formatCurrency(totalGainLoss)} ({gainLossPercent >= 0 ? "+" : ""}
                {gainLossPercent.toFixed(2)}%)
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - Holdings */}
          <div className="lg:col-span-2">
            <HoldingsTable
              holdings={account.holdings}
              totalValue={account.balance}
            />
          </div>

          {/* Right column - Allocation */}
          <div className="space-y-6">
            <AllocationChart
              allocations={account.allocation}
              title="Holdings Breakdown"
            />

            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-6 rounded-xl bg-neutral-900 border border-neutral-800"
            >
              <h3 className="font-serif text-xl text-neutral-100 mb-4">
                Account Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                  <span className="text-sm text-neutral-400">Account Type</span>
                  <span className="text-sm font-medium text-neutral-200">
                    {formatTitleCase(account.account_type)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                  <span className="text-sm text-neutral-400">Institution</span>
                  <span className="text-sm font-medium text-neutral-200">
                    {account.institution_name}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                  <span className="text-sm text-neutral-400">Tax Status</span>
                  <span
                    className={`text-sm font-medium ${
                      account.is_tax_advantaged
                        ? "text-emerald-400"
                        : "text-neutral-200"
                    }`}
                  >
                    {account.is_tax_advantaged ? "Tax-Advantaged" : "Taxable"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-neutral-800">
                  <span className="text-sm text-neutral-400">Holdings</span>
                  <span className="text-sm font-medium text-neutral-200">
                    {account.holdings.length} positions
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-neutral-400">Cost Basis</span>
                  <span className="text-sm font-medium text-neutral-200">
                    {formatCurrency(totalCostBasis)}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
