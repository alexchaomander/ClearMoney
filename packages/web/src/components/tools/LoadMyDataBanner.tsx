"use client";

import { Database, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadMyDataBannerProps {
  isLoaded: boolean;
  hasData: boolean;
  isApplied: boolean;
  onApply: () => void;
  label?: string;
  description?: string;
  className?: string;
}

export function LoadMyDataBanner({
  isLoaded,
  hasData,
  isApplied,
  onApply,
  label = "Load my data",
  description = "Pull values from your ClearMoney profile. You can edit everything after loading.",
  className,
}: LoadMyDataBannerProps) {
  const isDisabled = !isLoaded || !hasData;
  const buttonLabel = isApplied ? "Reload data" : label;

  return (
    <div
      className={cn(
        "rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-brand-500/10 p-2 text-brand-400">
          <Database className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">
            {isApplied ? "Data loaded" : "Use your saved data"}
          </p>
          <p className="text-xs text-neutral-400">{description}</p>
          {!isLoaded && (
            <p className="text-xs text-neutral-500 mt-1">Loading your data…</p>
          )}
          {isLoaded && !hasData && (
            <p className="text-xs text-neutral-500 mt-1">No saved data found yet.</p>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onApply}
        disabled={isDisabled}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors",
          isDisabled
            ? "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            : "bg-white text-neutral-950 hover:bg-neutral-100",
          isApplied && !isDisabled ? "bg-brand-400 text-neutral-950 hover:bg-brand-300" : ""
        )}
      >
        {isApplied ? <RefreshCw className="h-4 w-4" /> : <Database className="h-4 w-4" />}
        {buttonLabel}
      </button>
    </div>
  );
}

export default LoadMyDataBanner;
