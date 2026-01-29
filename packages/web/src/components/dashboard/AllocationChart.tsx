"use client";

import { motion } from "framer-motion";
import { formatCurrency, formatPercent, formatTitleCase } from "@/lib/shared/formatters";

interface Allocation {
  category: string;
  value: number;
  percentage: number;
}

interface AllocationChartProps {
  allocations: Allocation[];
  title?: string;
}

const COLORS = [
  "#10b981",
  "#34d399",
  "#6ee7b7",
  "#a7f3d0",
  "#d1fae5",
  "#f0fdf4",
];

export function AllocationChart({
  allocations,
  title = "Asset Allocation",
}: AllocationChartProps) {
  const sortedAllocations = [...allocations].sort((a, b) => b.value - a.value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-6 rounded-xl bg-neutral-900 border border-neutral-800"
    >
      <h3 className="font-serif text-xl text-neutral-100 mb-6">{title}</h3>

      {/* Stacked bar */}
      <div className="h-4 rounded-full overflow-hidden flex mb-6 bg-neutral-800">
        {sortedAllocations.map((allocation, index) => (
          <motion.div
            key={allocation.category}
            initial={{ width: 0 }}
            animate={{ width: `${allocation.percentage}%` }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
            className="h-full first:rounded-l-full last:rounded-r-full"
            title={`${formatTitleCase(allocation.category)}: ${formatPercent(allocation.percentage / 100)}`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {sortedAllocations.map((allocation, index) => (
          <motion.div
            key={allocation.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-neutral-300">
                {formatTitleCase(allocation.category)}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-neutral-100">
                {formatCurrency(allocation.value)}
              </span>
              <span className="text-sm text-neutral-500 w-12 text-right">
                {allocation.percentage.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
