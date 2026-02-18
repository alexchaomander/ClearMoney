"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MetricTrace } from "./MetricTrace";
import { StreamingMetric } from "./StreamingMetric";
import { useDensity } from "@/components/layout/DensityContext";
import { useMetricHighlight } from "@/lib/strata/highlight-context";
import { ShieldCheck, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: {
    value: number; // percentage change
    direction: "up" | "down" | "neutral";
    label?: string; // e.g. "vs last month"
  };
  confidence?: number; // 0 to 1
  metricId?: string;
  intent?: "neutral" | "emerald" | "amber" | "error";
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  formatter?: (val: number) => string;
}

export function MetricCard({
  label,
  value,
  subValue,
  trend,
  confidence = 1.0,
  metricId,
  intent = "neutral",
  loading = false,
  className,
  icon,
  formatter,
}: MetricCardProps) {
  const { density } = useDensity();
  const { highlightedMetric } = useMetricHighlight();
  const isCompact = density === "compact";

  const isHighlighted = metricId && highlightedMetric === metricId;

  // Intent styles mapping
  const intentStyles = {
    neutral: "border-slate-800 bg-slate-900/50 text-slate-100",
    emerald: "border-emerald-900/50 bg-emerald-950/30 text-emerald-100",
    amber: "border-amber-900/50 bg-amber-950/30 text-amber-100",
    error: "border-error-900/50 bg-error-950/30 text-error-100",
  };

  // Confidence Heatmap visual
  const isLowConfidence = confidence < 0.8;
  const confidenceOpacity = isLowConfidence ? "opacity-80" : "opacity-100";
  
  // Real-time glow for high confidence/fresh data
  const isFresh = confidence >= 0.95;

  if (loading) {
    return (
      <div className={cn("rounded-2xl border border-slate-800 bg-slate-900 p-5 animate-pulse", className)}>
        <div className="h-4 w-24 bg-slate-800 rounded mb-4" />
        <div className="h-8 w-32 bg-slate-800 rounded mb-2" />
        <div className="h-3 w-40 bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 5 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: isHighlighted ? 1.02 : 1,
        borderColor: isHighlighted ? "var(--color-emerald-500)" : undefined,
        boxShadow: isHighlighted ? "0 0 20px rgba(16, 185, 129, 0.2)" : undefined
      }}
      className={cn(
        "relative rounded-2xl border p-5 overflow-hidden group transition-all duration-300",
        intentStyles[intent],
        isCompact ? "p-3" : "p-5",
        isFresh && !isHighlighted && "shadow-[0_0_15px_-5px_rgba(16,185,129,0.1)]", 
        isHighlighted && "z-20",
        className
      )}
    >
      {/* Background Confidence Gradient */}
      {isLowConfidence && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-500/5 to-transparent pointer-events-none" />
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2 text-slate-400">
          {icon && <div className={cn("w-4 h-4", isCompact && "w-3 h-3")}>{icon}</div>}
          <span className={cn("text-sm font-medium", isCompact && "text-xs")}>{label}</span>
        </div>
        {metricId && <MetricTrace metricId={metricId} />}
      </div>

      {/* Main Value */}
      <div className={cn("relative z-10", confidenceOpacity)}>
        <div className="flex items-baseline gap-2">
          <span className={cn("font-display font-semibold tracking-tight", isCompact ? "text-xl" : "text-3xl")}>
            {typeof value === "number" ? (
              <StreamingMetric value={value} formatter={formatter} />
            ) : (
              value
            )}
          </span>
          {subValue && (
            <span className="text-xs text-slate-500 font-mono">
              {subValue}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Trend & Confidence */}
      {(trend || confidence < 1) && (
        <div className="mt-3 flex items-center justify-between relative z-10">
          {trend ? (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded",
              trend.direction === "up" ? "text-emerald-400 bg-emerald-950/50" :
              trend.direction === "down" ? "text-error-400 bg-error-950/50" :
              "text-slate-400 bg-slate-800/50"
            )}>
              {trend.direction === "up" ? <TrendingUp className="w-3 h-3" /> :
               trend.direction === "down" ? <TrendingDown className="w-3 h-3" /> :
               <Minus className="w-3 h-3" />}
              {Math.abs(trend.value)}%
              {trend.label && <span className="text-slate-500 ml-1 font-normal hidden sm:inline">{trend.label}</span>}
            </div>
          ) : <div />}

          {/* Confidence Indicator */}
          <div className="flex items-center gap-1.5" title={`Data Confidence: ${Math.round(confidence * 100)}%`}>
            <ShieldCheck className={cn(
              "w-3 h-3",
              confidence >= 0.9 ? "text-emerald-500/50" : 
              confidence >= 0.7 ? "text-amber-500/50" : "text-error-500/50"
            )} />
            <div className="flex gap-0.5">
              {[1, 2, 3].map((bar) => (
                <div 
                  key={bar}
                  className={cn(
                    "w-1 h-2 rounded-[1px]", 
                    (confidence * 3) >= bar 
                      ? (confidence >= 0.9 ? "bg-emerald-500/30" : confidence >= 0.7 ? "bg-amber-500/30" : "bg-error-500/30")
                      : "bg-slate-800"
                  )} 
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
