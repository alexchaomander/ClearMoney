"use client";

import { Activity } from "lucide-react";
import { useTransparencyPayload } from "@/lib/strata/hooks";

export function TransparencySignals() {
  const { data: transparency } = useTransparencyPayload();

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
      <div className="flex items-center gap-3 text-sm text-white/60">
        <Activity className="h-5 w-5 text-emerald-300" />
        Live signals
      </div>
      <div className="mt-6 space-y-4 text-sm text-white/70">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span>Affiliate payouts disclosed</span>
          <span className="text-emerald-300">100%</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <span>Methodology updates logged</span>
          <span className="text-emerald-300">Always</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Corrections published</span>
          <span className="text-emerald-300">72h SLA</span>
        </div>
      </div>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
        Last updated: {transparency?.last_updated || "---"}
      </div>
    </div>
  );
}
