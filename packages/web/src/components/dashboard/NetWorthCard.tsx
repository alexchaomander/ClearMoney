"use client";

import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/shared/formatters";
import { MetricTrace } from "./MetricTrace";

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 rounded-2xl bg-gradient-to-br from-emerald-900/50 to-neutral-900 border border-emerald-800/50"
    >
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-emerald-300">Net Worth</p>
          <MetricTrace metricId="netWorth" />
        </div>
        <h2 className="font-serif text-4xl lg:text-5xl text-white">
          {formatCurrency(netWorth)}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs text-neutral-400">Total Assets</p>
            <MetricTrace metricId="totalAssets" />
          </div>
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
