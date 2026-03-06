"use client";

import React from "react";
import { TrendingUp, Calendar, AlertCircle, Trash2, LineChart } from "lucide-react";
import { motion } from "framer-motion";
import { EquityVestChart } from "./EquityVestChart";
import type { EquityPortfolioSummary, EquityProjection } from "@clearmoney/strata-sdk";

interface EquityCardProps {
  portfolio: EquityPortfolioSummary;
  projections?: EquityProjection[];
  onDeleteGrant?: (symbol: string) => void;
}

export function EquityCard({ portfolio, projections, onDeleteGrant }: EquityCardProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <TrendingUp className="w-64 h-64 rotate-12" />
      </div>

      <div className="flex items-center justify-between mb-10 relative z-10">
        <div>
          <h3 className="font-serif text-3xl text-slate-900 dark:text-slate-100 tracking-tight">
            Equity Compensation
          </h3>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-[0.2em] font-black">Context Graph: Ownership</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(portfolio.total_value)}
          </div>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-[0.15em] mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
            {formatCurrency(portfolio.total_vested_value)} Liquid
          </p>
        </div>
      </div>

      {projections && projections.length > 0 && (
        <div className="mb-12 relative z-10 bg-slate-50/50 dark:bg-slate-950/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <LineChart className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Wealth Vesting Schedule (24mo)</span>
          </div>
          <EquityVestChart data={projections} />
        </div>
      )}

      <div className="space-y-4 relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Active Stock Grants</span>
        </div>
        
        {portfolio.grant_valuations.map((grant) => (
          <motion.div
            key={grant.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative p-6 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all shadow-sm"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {grant.symbol}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 uppercase tracking-widest">
                    Common Stock
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500 font-bold uppercase tracking-tight">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{formatCurrency(grant.current_price)} market price</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(grant.total_value)}
                </div>
                <div className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1">
                  {grant.vested_quantity + grant.unvested_quantity} shares
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-600/70 dark:text-emerald-400/70 font-black mb-1">
                  Liquid (Vested)
                </p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(grant.vested_value)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black mb-1">
                  Projected (Unvested)
                </p>
                <p className="text-lg font-black text-slate-400">
                  {formatCurrency(grant.unvested_value)}
                </p>
              </div>
            </div>

            {grant.next_vest_date && (
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900 dark:bg-black text-white border border-slate-800 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500 block">Upcoming Vest</span>
                    <span className="text-xs font-bold text-slate-300">
                      {new Date(grant.next_vest_date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-emerald-400">+{grant.next_vest_quantity} shares</span>
                </div>
              </div>
            )}

            {onDeleteGrant && (
              <button
                onClick={() => onDeleteGrant(grant.symbol)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}

        {portfolio.grant_valuations.length === 0 && (
          <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">No equity grants</p>
            <p className="text-xs text-slate-500 mt-2 max-w-[200px] mx-auto">
              Link your cap table or add manual RSU/Option grants to track future wealth.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
