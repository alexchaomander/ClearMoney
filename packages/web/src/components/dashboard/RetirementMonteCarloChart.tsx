"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { useRetirementMonteCarlo, useFinancialMemory } from "@/lib/strata/hooks";
import { Loader2, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react";

export function RetirementMonteCarloChart() {
  const { data: memory } = useFinancialMemory();
  
  const params = useMemo(() => ({
    current_savings: Number(memory?.current_retirement_savings ?? 100000),
    monthly_contribution: Number(memory?.monthly_retirement_contribution ?? 2000),
    years_to_retirement: Math.max(1, (memory?.retirement_age ?? 65) - (memory?.age ?? 35)),
    retirement_duration_years: 30,
    desired_annual_income: Number(memory?.desired_retirement_income ?? 80000),
  }), [memory]);

  const { data: simulation, isLoading, isError } = useRetirementMonteCarlo(params);

  const chartData = useMemo(() => {
    if (!simulation) return [];
    
    const percentiles = simulation.percentiles as any;
    const years = simulation.years as number[];
    
    return years.map((year, i) => ({
      year: year,
      p10: percentiles.p10[i],
      p50: percentiles.p50[i],
      p90: percentiles.p90[i],
    }));
  }, [simulation]);

  if (isLoading) {
    return (
      <div className="h-80 flex flex-col items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-sm text-neutral-400">Running 1,000 retirement simulations...</p>
      </div>
    );
  }

  if (isError || !simulation) {
    return (
      <div className="h-80 flex flex-col items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 p-8 text-center">
        <AlertCircle className="w-8 h-8 text-rose-500 mb-4" />
        <p className="text-sm text-neutral-400">
          We need more profile data to run the retirement simulation. 
          Update your income and savings goals in your Profile.
        </p>
      </div>
    );
  }

  const successRate = simulation.success_rate as number;
  const status = successRate >= 0.8 ? "strong" : successRate >= 0.5 ? "moderate" : "critical";

  return (
    <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-serif text-xl text-white">Retirement Success Probability</h3>
          <p className="text-xs text-neutral-500 mt-1">Probabilistic outcome based on 1,000 market iterations</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Success Rate</p>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${
              status === "strong" ? "text-emerald-400" : status === "moderate" ? "text-amber-400" : "text-rose-400"
            }`}>
              {formatPercent(successRate)}
            </span>
            {status === "strong" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorP50" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis 
              dataKey="year" 
              stroke="#525252" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              label={{ value: 'Years from now', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#525252' }}
            />
            <YAxis 
              stroke="#525252" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(val) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#171717", border: "1px solid #262626", borderRadius: "8px" }}
              itemStyle={{ fontSize: "12px" }}
              labelStyle={{ fontSize: "12px", marginBottom: "4px", color: "#a3a3a3" }}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
            {/* Range between P10 and P90 */}
            <Area
              type="monotone"
              dataKey="p90"
              stroke="transparent"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={0}
            />
            <Area
              type="monotone"
              dataKey="p10"
              stroke="transparent"
              fill="#000"
              fillOpacity={0.2}
              strokeWidth={0}
            />
            {/* Median line */}
            <Area
              type="monotone"
              dataKey="p50"
              stroke="#10b981"
              fill="url(#colorP50)"
              strokeWidth={2}
            />
            <ReferenceLine y={0} stroke="#404040" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-neutral-800 pt-6">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Optimistic (P90)</p>
          <p className="text-sm text-neutral-200">{formatCurrency(chartData[chartData.length - 1]?.p90 ?? 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Median (P50)</p>
          <p className="text-sm text-white font-semibold">{formatCurrency(chartData[chartData.length - 1]?.p50 ?? 0)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold mb-1">Conservative (P10)</p>
          <p className="text-sm text-neutral-200">{formatCurrency(chartData[chartData.length - 1]?.p10 ?? 0)}</p>
        </div>
      </div>
    </div>
  );
}
