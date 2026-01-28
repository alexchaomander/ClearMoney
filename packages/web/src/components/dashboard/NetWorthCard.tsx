"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/shared/formatters";

interface NetWorthCardProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  taxAdvantagedValue?: number;
  taxableValue?: number;
}

export function NetWorthCard({
  totalAssets,
  totalLiabilities,
  netWorth,
  taxAdvantagedValue = 0,
  taxableValue = 0,
}: NetWorthCardProps) {
  // Calculate change (mock for now - would come from historical data)
  const changePercent = 2.3;
  const changeValue = netWorth * (changePercent / 100);
  const isPositive = changePercent > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/50 to-neutral-900 border border-emerald-800/50"
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-sm font-medium text-emerald-300 mb-1">Net Worth</p>
          <h2 className="font-serif text-4xl lg:text-5xl text-white">
            {formatCurrency(netWorth)}
          </h2>
        </div>
        <div
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
            isPositive
              ? "bg-emerald-500/20 text-emerald-300"
              : "bg-red-500/20 text-red-300"
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4" />
          ) : (
            <TrendingDown className="w-4 h-4" />
          )}
          {isPositive ? "+" : ""}
          {changePercent.toFixed(1)}%
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <p className="text-xs text-neutral-400 mb-1">Total Assets</p>
          <p className="font-serif text-xl text-emerald-300">
            {formatCurrency(totalAssets)}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <p className="text-xs text-neutral-400 mb-1">Total Liabilities</p>
          <p className="font-serif text-xl text-red-300">
            -{formatCurrency(totalLiabilities)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 rounded-lg bg-neutral-800/50">
          <p className="text-xs text-neutral-400 mb-1">Tax-Advantaged</p>
          <p className="font-medium text-emerald-400">
            {formatCurrency(taxAdvantagedValue)}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-neutral-800/50">
          <p className="text-xs text-neutral-400 mb-1">Taxable</p>
          <p className="font-medium text-neutral-200">
            {formatCurrency(taxableValue)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
