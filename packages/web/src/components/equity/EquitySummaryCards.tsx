"use client";

import React from "react";
import { TrendingUp, Clock, Landmark, DollarSign } from "lucide-react";
import { useEquityPortfolio } from "@/lib/strata/hooks";
import { formatCurrency } from "@/lib/utils";

export function EquitySummaryCards() {
  const { data: summary, isLoading } = useEquityPortfolio();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-neutral-900 rounded-xl border border-neutral-800" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: "Total Vested Value",
      value: formatCurrency(summary?.total_vested_value ?? 0),
      icon: <Landmark className="w-5 h-5 text-emerald-400" />,
      color: "text-emerald-400",
    },
    {
      label: "Total Unvested Value",
      value: formatCurrency(summary?.total_unvested_value ?? 0),
      icon: <Clock className="w-5 h-5 text-blue-400" />,
      color: "text-blue-400",
    },
    {
      label: "Total Equity Value",
      value: formatCurrency(summary?.total_value ?? 0),
      icon: <TrendingUp className="w-5 h-5 text-brand-400" />,
      color: "text-brand-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/50 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-neutral-800 flex-shrink-0">
            {card.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500">{card.label}</p>
            <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
