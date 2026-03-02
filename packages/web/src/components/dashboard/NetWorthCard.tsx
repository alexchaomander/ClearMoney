"use client";

import { motion } from "framer-motion";
import { MetricTrace } from "./MetricTrace";
import { AnimatedAmount } from "@/components/shared/AnimatedAmount";

interface NetWorthCardProps {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  taxAdvantagedValue?: number;
  taxableValue?: number;
  vestedEquityValue?: number;
  unvestedEquityValue?: number;
}

export function NetWorthCard({
  totalAssets,
  totalLiabilities,
  netWorth,
  taxAdvantagedValue = 0,
  taxableValue = 0,
  vestedEquityValue = 0,
  unvestedEquityValue = 0,
}: NetWorthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-8 rounded-3xl bg-gradient-to-br from-emerald-600/20 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden group"
    >
      {/* Decorative glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-colors duration-700" />
      
      <div className="mb-10 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">Net Worth</p>
          <MetricTrace metricId="netWorth" />
        </div>
        <h2 className="font-serif text-5xl lg:text-6xl text-white tracking-tight">
          <AnimatedAmount value={netWorth} />
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 relative z-10">
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-500/30 transition-colors group/item">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover/item:text-emerald-400 transition-colors">Total Assets</p>
            <MetricTrace metricId="totalAssets" />
          </div>
          <p className="font-serif text-2xl text-emerald-400">
            <AnimatedAmount value={totalAssets} />
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-rose-500/30 transition-colors group/item">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover/item:text-rose-400 transition-colors mb-1">Total Liabilities</p>
          <p className="font-serif text-2xl text-rose-400">
            <AnimatedAmount value={totalLiabilities} prefix="-$" />
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Vested</p>
          <p className="text-sm font-bold text-emerald-500/80">
            <AnimatedAmount value={vestedEquityValue} />
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Unvested</p>
          <p className="text-sm font-bold text-slate-400 italic">
            <AnimatedAmount value={unvestedEquityValue} />
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Tax-Adv</p>
          <p className="text-sm font-bold text-emerald-500/80">
            <AnimatedAmount value={taxAdvantagedValue} />
          </p>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Taxable</p>
          <p className="text-sm font-bold text-slate-300">
            <AnimatedAmount value={taxableValue} />
          </p>
        </div>
      </div>
    </motion.div>
  );
}
