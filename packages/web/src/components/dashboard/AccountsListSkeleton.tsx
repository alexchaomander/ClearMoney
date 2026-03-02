"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function AccountsListSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((group) => (
        <div key={group} className="space-y-3">
          <Skeleton className="h-4 w-32 mx-1" />
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div 
                key={item} 
                className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800"
              >
                <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
