"use client";

import { CalendarClock } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { formatCurrency } from "@/lib/shared/formatters";

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const numericPayload = (payload ?? []).filter(
    (point): point is { value: number; dataKey?: string | number; name?: string } =>
      typeof point?.value === "number",
  );
  if (!active || !numericPayload.length || !label) return null;
  const labelText = String(label);
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
      <p className="text-slate-500 dark:text-slate-400 mb-1">{labelText}</p>
      {numericPayload.map((point) => {
        const key = String(point.dataKey ?? point.name ?? "value");
        return (
          <p key={key} className="leading-relaxed">
            {point.dataKey === "value" ? "Net worth" : key}:{" "}
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
              point.value,
            )}
          </p>
        );
      })}
    </div>
  );
}

interface CommandCenterTrajectoryChartProps {
  trajectory: { date: string; value: number }[];
  trajectoryDelta: number;
}

export function CommandCenterTrajectoryChart({ trajectory, trajectoryDelta }: CommandCenterTrajectoryChartProps) {
  return (
    <article className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-slate-900 dark:text-white">Net worth trajectory</h2>
        <CalendarClock className="w-4 h-4 text-emerald-500 dark:text-emerald-300" />
      </div>
      <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">Last 90d baseline</p>
      <div className="mt-4 h-44 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trajectory}>
            <defs>
              <linearGradient id="commandFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
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
            <Tooltip content={ChartTooltip} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#34d399"
              fill="url(#commandFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Trend delta:{" "}
        <span className={trajectoryDelta >= 0 ? "text-emerald-600 dark:text-emerald-300" : "text-rose-600 dark:text-rose-300"}>
          {formatCurrency(Math.abs(trajectoryDelta))}
        </span>
        {trajectoryDelta >= 0 ? " gain" : " loss"} over this window.
      </p>
    </article>
  );
}
