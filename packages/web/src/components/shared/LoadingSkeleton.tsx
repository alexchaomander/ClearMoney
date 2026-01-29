"use client";

import { motion } from "framer-motion";

function SkeletonLine({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`rounded-lg bg-neutral-800 ${className}`}
      animate={{ opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

export function DashboardLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <SkeletonLine className="h-8 w-64" />
          <SkeletonLine className="h-4 w-48" />
        </div>
        <SkeletonLine className="h-10 w-32 rounded-lg" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Net worth card */}
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
            <SkeletonLine className="h-5 w-32 mb-4" />
            <SkeletonLine className="h-10 w-48 mb-6" />
            <div className="grid grid-cols-3 gap-4">
              <SkeletonLine className="h-16" />
              <SkeletonLine className="h-16" />
              <SkeletonLine className="h-16" />
            </div>
          </div>

          {/* Holdings table */}
          <div className="rounded-xl bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <SkeletonLine className="h-6 w-24 mb-2" />
              <SkeletonLine className="h-4 w-40" />
            </div>
            <div className="p-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <SkeletonLine className="h-8 w-8 rounded-lg" />
                  <SkeletonLine className="h-5 w-32 flex-1" />
                  <SkeletonLine className="h-5 w-20" />
                  <SkeletonLine className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
            <SkeletonLine className="h-6 w-36 mb-4" />
            <SkeletonLine className="h-40 w-40 rounded-full mx-auto mb-4" />
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <SkeletonLine className="h-4 w-20" />
                  <SkeletonLine className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-xl bg-neutral-900 border border-neutral-800">
            <SkeletonLine className="h-6 w-36 mb-4" />
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonLine className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 space-y-1">
                    <SkeletonLine className="h-4 w-32" />
                    <SkeletonLine className="h-3 w-20" />
                  </div>
                  <SkeletonLine className="h-5 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
