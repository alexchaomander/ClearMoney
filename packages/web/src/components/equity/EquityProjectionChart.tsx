"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useEquityProjections } from "@/lib/strata/hooks";
import { formatCurrency, formatDate } from "@/lib/utils";

export function EquityProjectionChart() {
  const { data: projections, isLoading } = useEquityProjections();

  if (isLoading) {
    return (
      <div className="h-[400px] w-full bg-neutral-900 rounded-2xl border border-neutral-800 animate-pulse flex items-center justify-center">
        <p className="text-neutral-500">Calculating projections...</p>
      </div>
    );
  }

  // Transform data for recharts
  const chartData = projections?.map((p) => ({
    date: formatDate(p.date, "MMM yyyy"),
    total: Number(p.total_value),
    liquid: Number(p.liquid_value),
  })) ?? [];

  return (
    <div className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white">Equity Wealth Projection</h3>
        <p className="text-sm text-neutral-500">
          Estimated value of your vested and unvested equity over the next 24 months.
        </p>
      </div>

      <div className="h-[350px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLiquid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              minTickGap={30}
            />
            <YAxis
              stroke="#525252"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#171717",
                border: "1px solid #262626",
                borderRadius: "12px",
              }}
              itemStyle={{ fontSize: "12px" }}
              formatter={(value: number) => [formatCurrency(value), ""]}
            />
            <Legend verticalAlign="top" align="right" height={36} iconType="circle" />
            <Area
              type="monotone"
              dataKey="total"
              name="Total Potential Value"
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#colorTotal)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="liquid"
              name="Vested (Liquid) Value"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorLiquid)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
