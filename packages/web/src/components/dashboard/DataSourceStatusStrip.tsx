"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleAlert,
  CircleDashed,
  Clock3,
  RefreshCw,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type DataSourceTone = "live" | "partial" | "warning" | "missing" | "error";

export interface DataSourceStatusItem {
  id: string;
  title: string;
  value: string;
  detail: string;
  tone: DataSourceTone;
  lastSyncedAt?: string | null;
  href?: string;
  actionLabel?: string;
}

interface DataSourceStatusStripProps {
  items: DataSourceStatusItem[];
  usingDemoData?: boolean;
  showIntegrationGuidance?: boolean;
}

type SyncFreshness = "fresh" | "aging" | "stale" | "missing";

const toneStyles: Record<DataSourceTone, { dot: string; badge: string; border: string }> = {
  live: {
    dot: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    border: "border-emerald-500/20",
  },
  partial: {
    dot: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    border: "border-amber-500/20",
  },
  warning: {
    dot: "text-amber-400",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    border: "border-amber-500/20",
  },
  missing: {
    dot: "text-slate-400",
    badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    border: "border-slate-500/20",
  },
  error: {
    dot: "text-rose-400",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    border: "border-rose-500/20",
  },
};

const syncStyles: Record<SyncFreshness, { text: string; label: string }> = {
  fresh: { text: "text-emerald-400", label: "Synced" },
  aging: { text: "text-sky-400", label: "Aging" },
  stale: { text: "text-amber-400", label: "Stale" },
  missing: { text: "text-slate-500", label: "Offline" },
};

function getSyncFreshness(dateString?: string | null): SyncFreshness {
  if (!dateString) return "missing";
  const parsed = Date.parse(dateString);
  if (Number.isNaN(parsed)) return "missing";
  const ageHours = Math.max(0, (Date.now() - parsed) / (1000 * 60 * 60));
  if (ageHours <= 2) return "fresh";
  if (ageHours <= 12) return "aging";
  if (ageHours <= 72) return "stale";
  return "missing";
}

export function DataSourceStatusStrip({ items, usingDemoData }: DataSourceStatusStripProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) return null;

  const connectedCount = items.filter((item) => item.tone === "live").length;
  const allLive = connectedCount === items.length;

  return (
    <div className="mb-8">
      <div 
        className={cn(
          "group relative overflow-hidden rounded-2xl border transition-all duration-300",
          allLive 
            ? "bg-emerald-500/5 border-emerald-500/20 shadow-sm" 
            : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-xl"
        )}
      >
        {/* Compact Header */}
        <div 
          className="flex items-center justify-between px-6 py-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center border transition-colors",
              allLive 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            )}>
              {allLive ? <ShieldCheck className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Financial Data Confidence
                {usingDemoData && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase tracking-tighter">
                    Synthetic Preview
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500">
                {connectedCount} of {items.length} pillars active · 
                <span className="ml-1 text-emerald-600 dark:text-emerald-500 font-medium">
                  {allLive ? "Safe to trust" : "Some inputs need attention"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex -space-x-2">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className={cn(
                    "w-3 h-3 rounded-full border-2 border-white dark:border-slate-900",
                    toneStyles[item.tone].dot.replace("text-", "bg-")
                  )}
                  title={item.title}
                />
              ))}
            </div>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 transition-colors">
              <ChevronDown className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Expandable Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-white/5">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                  {items.map((item) => {
                    const styles = toneStyles[item.tone];
                    const syncState = getSyncFreshness(item.lastSyncedAt);
                    const syncStyle = syncStyles[syncState];

                    return (
                      <div 
                        key={item.id} 
                        className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                            {item.title}
                          </span>
                          <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded border", styles.badge)}>
                            {item.value}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 leading-relaxed">
                          {item.detail}
                        </p>
                        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-100 dark:border-white/5">
                          <span className={cn("text-xs flex items-center gap-1", syncStyle.text)}>
                            <Clock3 className="w-3 h-3" />
                            {syncStyle.label}
                          </span>
                          {item.href && (
                            <Link 
                              href={item.href}
                              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors"
                            >
                              {item.actionLabel ?? "Link"} →
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {usingDemoData && (
                  <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-500">
                      <RefreshCw className="w-5 h-5 animate-spin-slow" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-900 dark:text-amber-200">Running in Synthetic Mode</p>
                      <p className="text-xs text-amber-700 dark:text-amber-500/80">Preview data is useful for orientation. Connect real sources before trusting runway, tax timing, or concentration signals.</p>
                    </div>
                    <Link 
                      href="/connect"
                      className="ml-auto px-4 py-2 rounded-lg bg-amber-600 dark:bg-amber-500 text-white dark:text-amber-950 text-xs font-bold hover:bg-emerald-500 dark:hover:bg-amber-400 transition-colors"
                    >
                      Connect Sources
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
