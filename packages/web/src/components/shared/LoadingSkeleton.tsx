"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { NetWorthCardSkeleton } from "@/components/dashboard/NetWorthCardSkeleton";
import { AccountsListSkeleton } from "@/components/dashboard/AccountsListSkeleton";

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <Skeleton className={className} />
  );
}

export function WarRoomLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-8">
        {/* Header area */}
        <div className="flex items-end justify-between">
          <div className="space-y-3">
            <SkeletonLine className="h-4 w-32" />
            <SkeletonLine className="h-10 w-64 rounded-xl" />
          </div>
          <div className="flex gap-3">
            <SkeletonLine className="h-20 w-32 rounded-2xl" />
            <SkeletonLine className="h-20 w-32 rounded-2xl" />
          </div>
        </div>
        {/* Filter tabs */}
        <SkeletonLine className="h-12 w-80 rounded-xl" />
        {/* Cards */}
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <SkeletonLine key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProgressLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-3">
          <SkeletonLine className="h-4 w-32" />
          <SkeletonLine className="h-10 w-48 rounded-xl" />
        </div>
        {/* Chart area */}
        <SkeletonLine className="h-72 rounded-2xl" />
        {/* Metric cards */}
        <div className="grid lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <SkeletonLine key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function FounderORLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-8">
        <div className="space-y-3">
          <SkeletonLine className="h-4 w-40" />
          <SkeletonLine className="h-10 w-56 rounded-xl" />
        </div>
        <div className="grid lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <SkeletonLine key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <SkeletonLine key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-3">
          <SkeletonLine className="h-10 w-64 rounded-xl" />
          <SkeletonLine className="h-5 w-48" />
        </div>
        <SkeletonLine className="h-12 w-40 rounded-2xl" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Net worth card */}
          <NetWorthCardSkeleton />

          {/* Chart placeholder */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <SkeletonLine className="h-6 w-40 mb-6" />
            <SkeletonLine className="h-[280px] w-full rounded-xl" />
          </div>

          {/* Holdings table */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm dark:shadow-none">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <SkeletonLine className="h-6 w-32 mb-2" />
              <SkeletonLine className="h-4 w-48" />
            </div>
            <div className="p-6 space-y-6">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <SkeletonLine className="h-10 w-10 rounded-xl" />
                  <SkeletonLine className="h-5 w-48 flex-1" />
                  <SkeletonLine className="h-5 w-24" />
                  <SkeletonLine className="h-5 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <SkeletonLine className="h-6 w-40 mb-8" />
            <div className="relative flex items-center justify-center mb-8">
              <SkeletonLine className="h-48 w-48 rounded-full" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full bg-white dark:bg-slate-900 border-8 border-[#fafafa] dark:border-slate-950" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <SkeletonLine className="h-4 w-24" />
                  <SkeletonLine className="h-4 w-16" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none">
            <div className="flex items-center justify-between mb-6">
              <SkeletonLine className="h-6 w-36" />
              <SkeletonLine className="h-4 w-12" />
            </div>
            <AccountsListSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
