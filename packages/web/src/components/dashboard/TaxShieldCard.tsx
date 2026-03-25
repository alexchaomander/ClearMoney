"use client";

import { motion } from "framer-motion";
import { ShieldCheck, TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import { useTaxShieldMetrics } from "@/lib/strata/hooks";
import { formatCurrency } from "@/lib/utils";

export function TaxShieldCard() {
  const { data: metrics, isLoading } = useTaxShieldMetrics();

  if (isLoading || !metrics) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 animate-pulse h-[340px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>
        <div className="h-24 w-full bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  const has1099Income = metrics.ytd_1099_income > 0;
  
  // Progress towards the total liability (capping at 100%)
  const progressPercent = Math.min(
    100,
    metrics.total_tax_liability_ytd > 0 
      ? (metrics.next_quarterly_payment / metrics.total_tax_liability_ytd) * 100 
      : 0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="tax-shield-card"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-6 text-white shadow-xl shadow-indigo-900/10 isolate border border-indigo-500/20"
    >
      {/* Background glow effects for premium feel */}
      <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-sm shadow-inner shadow-indigo-500/20">
            <ShieldCheck className="h-5 w-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-medium tracking-wide text-slate-100">
              Tax Shield
            </h3>
            <p className="text-xs text-indigo-300">Quarterly Estimator</p>
          </div>
        </div>
        <div className="rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-200 border border-indigo-400/30 backdrop-blur-sm uppercase">
          Q{metrics.current_quarter}
        </div>
      </div>

      {/* Main Income / Liability Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
            1099 Income
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">
            {formatCurrency(metrics.ytd_1099_income)}
          </p>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">W2 Income</p>
            <p className="text-xs font-medium text-slate-300">{formatCurrency(metrics.ytd_w2_income)}</p>
          </div>
        </div>
        
        <div className="rounded-xl bg-white/5 p-4 border border-white/10 backdrop-blur-sm transition-colors hover:bg-white/10">
          <div className="text-xs font-medium text-slate-400 mb-1 flex items-center gap-1.5 uppercase tracking-wider">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            YTD Liability
          </div>
          <p className="text-2xl font-bold tracking-tight text-white">
            {formatCurrency(metrics.total_tax_liability_ytd)}
          </p>
          <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">SE Tax (15.3%)</p>
            <p className="text-xs font-medium text-slate-300">{formatCurrency(metrics.estimated_self_employment_tax)}</p>
          </div>
        </div>
      </div>

      {/* Action / Payment Section */}
      <div className="relative z-10">
        {has1099Income && metrics.next_quarterly_payment > 0 ? (
          <div className="rounded-xl bg-gradient-to-r from-indigo-500/10 to-transparent p-5 border border-indigo-500/30 backdrop-blur-md">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-xs text-indigo-200 font-medium mb-1 uppercase tracking-wider">Next Payment Due</p>
                <p className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
                  {formatCurrency(metrics.next_quarterly_payment)}
                </p>
              </div>
              <button 
                className="group flex items-center gap-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 text-sm font-semibold transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
              >
                Draft Transfer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
            
            {/* Progress Bar indicating estimated coverage against total yearly need */}
            <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400"
              />
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-800/50 p-5 text-center border border-slate-700/50 backdrop-blur-sm">
            <p className="text-sm font-medium text-emerald-400 mb-1">You're Protected</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              No 1099 tax liability detected yet. Your W2 withholdings are assumed to cover your baseline tax obligations.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
