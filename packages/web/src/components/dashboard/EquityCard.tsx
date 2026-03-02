import React from "react";
import { TrendingUp, Calendar, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface EquityValuation {
  symbol: string;
  current_price: number;
  vested_quantity: number;
  unvested_quantity: number;
  vested_value: number;
  unvested_value: number;
  total_value: number;
  next_vest_date: string | null;
  next_vest_quantity: number | null;
}

interface EquityPortfolioSummary {
  total_vested_value: number;
  total_unvested_value: number;
  total_value: number;
  grant_valuations: EquityValuation[];
}

interface EquityCardProps {
  portfolio: EquityPortfolioSummary;
  onDeleteGrant?: (symbol: string) => void;
}

export function EquityCard({ portfolio, onDeleteGrant }: EquityCardProps) {
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl text-slate-800 dark:text-slate-100">
            Equity Compensation
          </h3>
          <p className="text-xs text-slate-500 mt-1">RSUs and Stock Options</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-slate-900 dark:text-white">
            {formatCurrency(portfolio.total_value)}
          </div>
          <p className="text-xs text-emerald-500 font-medium">
            {formatCurrency(portfolio.total_vested_value)} vested
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {portfolio.grant_valuations.map((grant) => (
          <motion.div
            key={grant.symbol}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {grant.symbol}
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase">
                    Grant
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span>{formatCurrency(grant.current_price)} / share</span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-slate-900 dark:text-white">
                  {formatCurrency(grant.total_value)}
                </div>
                <div className="text-xs text-slate-500">
                  {grant.vested_quantity + grant.unvested_quantity} shares total
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  Vested Value
                </p>
                <p className="text-sm font-medium text-emerald-500">
                  {formatCurrency(grant.vested_value)}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  Unvested Value
                </p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  {formatCurrency(grant.unvested_value)}
                </p>
              </div>
            </div>

            {grant.next_vest_date && (
              <div className="flex items-center gap-2 p-2 rounded bg-emerald-500/5 border border-emerald-500/10 text-emerald-500">
                <Calendar className="w-3 h-3" />
                <span className="text-[10px] font-medium">
                  Next Vest: {grant.next_vest_quantity} shares on{" "}
                  {new Date(grant.next_vest_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}

            {onDeleteGrant && (
              <button
                onClick={() => onDeleteGrant(grant.symbol)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ))}

        {portfolio.grant_valuations.length === 0 && (
          <div className="py-8 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No equity grants found.</p>
            <p className="text-xs text-slate-400 mt-1">
              Add your RSUs or Stock Options to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
