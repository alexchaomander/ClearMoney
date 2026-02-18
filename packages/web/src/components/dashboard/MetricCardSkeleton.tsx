"use client";

import { cn } from "@/lib/utils";
import { useDensity } from "@/components/layout/DensityContext";

export function MetricCardSkeleton() {
  const { density } = useDensity();
  const isCompact = density === "compact";

  return (
    <div className={cn(
      "rounded-xl border border-slate-800 bg-slate-900/50 p-5 overflow-hidden animate-pulse",
      isCompact ? "p-3" : "p-5"
    )}>
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-24 bg-slate-800 rounded" />
        <div className="h-4 w-4 bg-slate-800 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className={cn("bg-slate-800 rounded", isCompact ? "h-6 w-20" : "h-8 w-32")} />
        <div className="h-3 w-16 bg-slate-800 rounded opacity-50" />
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div className="h-5 w-12 bg-slate-800 rounded" />
        <div className="flex gap-1">
          <div className="h-2 w-1 bg-slate-800 rounded" />
          <div className="h-2 w-1 bg-slate-800 rounded" />
          <div className="h-2 w-1 bg-slate-800 rounded" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>
  );
}
