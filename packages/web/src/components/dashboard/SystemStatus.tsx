"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Clock,
  ExternalLink,
  Wrench
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDensity } from "@/components/layout/DensityContext";

interface ConnectionSource {
  id: string;
  name: string;
  provider: "plaid" | "snaptrade" | "manual";
  status: "healthy" | "error" | "syncing" | "stale";
  lastSync: string;
}

interface SystemStatusProps {
  sources: ConnectionSource[];
  onFix?: (id: string) => void;
  onSyncAll?: () => void;
  className?: string;
}

export function SystemStatus({
  sources,
  onFix,
  onSyncAll,
  className,
}: SystemStatusProps) {
  const { density } = useDensity();
  const isCompact = density === "compact";

  const healthyCount = sources.filter(s => s.status === "healthy").length;
  const healthPercent = sources.length > 0 ? Math.round((healthyCount / sources.length) * 100) : 0;

  return (
    <div className={cn(
      "rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Data Health</h3>
            <p className="text-[10px] text-slate-500 font-mono">{healthPercent}% Surface Integrity</p>
          </div>
        </div>
        <button 
          onClick={onSyncAll}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Force Global Sync"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Connection List */}
      <div className="divide-y divide-slate-800/50 max-h-[300px] overflow-y-auto">
        {sources.map((source) => (
          <div key={source.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors group">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full",
                source.status === "healthy" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
                source.status === "syncing" ? "bg-trace-500 animate-pulse" :
                source.status === "stale" ? "bg-amber-500" :
                "bg-error-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              )} />
              <div>
                <p className="text-sm font-medium text-slate-200">{source.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{source.provider}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700" />
                  <span className="text-[9px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {source.lastSync}
                  </span>
                </div>
              </div>
            </div>

            {source.status === "error" ? (
              <button 
                onClick={() => onFix?.(source.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-error-950/30 border border-error-900/50 text-[10px] font-bold text-error-400 hover:bg-error-900/50 transition-all"
              >
                <Wrench className="w-3 h-3" />
                Healing Required
              </button>
            ) : (
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 rounded-md text-slate-500 hover:text-slate-300">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 bg-slate-950/50 border-t border-slate-800 flex items-center gap-2">
        <ShieldAlert className="w-3 h-3 text-slate-600" />
        <p className="text-[10px] text-slate-600 leading-none">
          All links are encrypted via 256-bit Strata Vault. 
        </p>
      </div>
    </div>
  );
}
