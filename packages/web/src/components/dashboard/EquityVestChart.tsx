"use client";

import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from "recharts";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/shared/formatters";
import type { EquityProjection } from "@clearmoney/strata-sdk";

interface EquityVestChartProps {
  data: EquityProjection[];
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl ring-1 ring-black/5">
        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
          {format(new Date(label), "MMMM yyyy")}
        </p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs text-slate-500 font-medium">Total Value</span>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {formatCurrency(payload[0].value || 0)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-xs text-emerald-500 font-medium">Vested (Liquid)</span>
            <span className="text-sm font-bold text-emerald-500">
              {formatCurrency(payload[1].value || 0)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function EquityVestChart({ data }: EquityVestChartProps) {
  const parsedData = useMemo(() => {
    return data.map(point => ({
      ...point,
      total_value: typeof point.total_value === 'string' ? parseFloat(point.total_value) : point.total_value,
      liquid_value: typeof point.liquid_value === 'string' ? parseFloat(point.liquid_value) : point.liquid_value,
    }));
  }, [data]);

  return (
    <div className="h-[300px] w-full mt-8">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={parsedData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorVested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="#e2e8f0" 
            className="dark:stroke-slate-800" 
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tickFormatter={(str) => format(new Date(str), "MMM yy")}
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `$${val / 1000}k`}
            tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="total_value"
            stroke="#94a3b8"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
          <Area
            type="monotone"
            dataKey="liquid_value"
            stroke="#10b981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVested)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
