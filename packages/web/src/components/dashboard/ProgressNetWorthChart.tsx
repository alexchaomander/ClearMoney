"use client";

import type { PortfolioHistoryRange } from "@clearmoney/strata-sdk";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/shared/formatters";

const RANGES: { label: string; value: PortfolioHistoryRange }[] = [
  { label: "90D", value: "90d" },
  { label: "1Y", value: "1y" },
  { label: "ALL", value: "all" },
];

interface ProgressNetWorthChartProps {
  timeline: { date: string; value: number }[];
  range: PortfolioHistoryRange;
  onRangeChange: (range: PortfolioHistoryRange) => void;
  minNetWorth: number;
  maxNetWorth: number;
}

export function ProgressNetWorthChart({ timeline, range, onRangeChange, minNetWorth, maxNetWorth }: ProgressNetWorthChartProps) {
  return (
    <section className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 mb-6">
      <div className="flex flex-wrap justify-between items-center gap-3">
        <h2 className="text-lg text-slate-900 dark:text-white font-medium">Net worth trajectory</h2>
        <div className="flex gap-1 rounded-lg bg-slate-50 dark:bg-slate-950 p-1">
          {RANGES.map((entry) => (
            <button
              type="button"
              key={entry.value}
              onClick={() => onRangeChange(entry.value)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                range === entry.value
                  ? "bg-emerald-600 text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4 h-72 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline}>
            <defs>
              <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="currentColor" className="text-slate-200 dark:text-[#262626]" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "currentColor", fontSize: 11 }} className="text-slate-400 dark:text-[#737373]" />
            <YAxis
              tickFormatter={(value) => formatCurrency(Number(value), 0)}
              tick={{ fill: "currentColor", fontSize: 11 }}
              className="text-slate-400 dark:text-[#737373]"
              width={84}
            />
            <Tooltip formatter={(value) => formatCurrency(Number(value), 2)} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#34d399"
              fill="url(#progressFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Lowest: {formatCurrency(minNetWorth)} • Highest: {formatCurrency(maxNetWorth)}
      </p>
    </section>
  );
}
