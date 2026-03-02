"use client";

import { cn } from "@/lib/utils";
import { useDensity } from "@/components/layout/DensityContext";
import { Skeleton } from "@/components/ui/skeleton";

export function MetricCardSkeleton() {
  const { density } = useDensity();
  const isCompact = density === "compact";

  return (
    <div className={cn(
      "rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-5 overflow-hidden shadow-sm dark:shadow-none",
      isCompact ? "p-3" : "p-5"
    )}>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton className={cn("rounded-lg", isCompact ? "h-6 w-20" : "h-10 w-32")} />
        <Skeleton className="h-3 w-16 opacity-50" />
      </div>
      <div className="mt-8 flex justify-between items-center">
        <Skeleton className="h-5 w-12" />
        <div className="flex gap-1.5">
          <Skeleton className="h-3 w-1 rounded-full" />
          <Skeleton className="h-3 w-1 rounded-full" />
          <Skeleton className="h-3 w-1 rounded-full" />
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
