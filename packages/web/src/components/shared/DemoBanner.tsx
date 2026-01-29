"use client";

import { useDemoMode } from "@/lib/strata/demo-context";

export function DemoBanner() {
  const isDemo = useDemoMode();

  if (!isDemo) return null;

  return (
    <div className="bg-amber-500/90 text-amber-950 text-center text-sm font-medium py-1.5 px-4">
      Demo Mode — Showing sample data
    </div>
  );
}
