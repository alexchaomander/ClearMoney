"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, 
  Rocket, 
  Bot, 
  ShieldCheck, 
  ArrowRight, 
  Loader2, 
  CheckCircle2, 
  Clock,
  Fingerprint,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDensity } from "@/components/layout/DensityContext";

export type ActionStatus = "draft" | "analyzing" | "ready" | "executing" | "completed" | "failed";

interface ActionIntentCardProps {
  id: string;
  title: string;
  description: string;
  type: "ach_transfer" | "rebalance" | "tax_optimization" | "compliance" | string;
  status: ActionStatus;
  impact?: string;
  confidence?: number;
  onReview?: () => void;
  onExecute?: () => void;
  onDownload?: () => void;
  className?: string;
}

export function ActionIntentCard({
  id,
  title,
  description,
  type,
  status,
  impact,
  confidence = 1.0,
  onReview,
  onExecute,
  onDownload,
  className,
}: ActionIntentCardProps) {
  const { density } = useDensity();
  const isCompact = density === "compact";

  const icons = {
    ach_transfer: Zap,
    rebalance: Rocket,
    tax_optimization: ShieldCheck,
    compliance: ShieldCheck,
    default: Bot,
  };

  const Icon = icons[type as keyof typeof icons] || icons.default;

  const statusConfig = {
    draft: { label: "Agent Draft", color: "text-slate-400", bg: "bg-slate-800/50", border: "border-slate-800" },
    analyzing: { label: "Analyzing", color: "text-trace-400", bg: "bg-trace-950/30", border: "border-trace-800/50" },
    ready: { label: "Ready for Review", color: "text-emerald-400", bg: "bg-emerald-950/30", border: "border-emerald-800/50" },
    executing: { label: "Executing", color: "text-amber-400", bg: "bg-amber-950/30", border: "border-amber-800/50" },
    completed: { label: "Executed", color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-800/20" },
    failed: { label: "Failed", color: "text-error-400", bg: "bg-error-950/30", border: "border-error-800/50" },
  };

  const currentStatus = statusConfig[status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "group relative rounded-2xl border transition-all duration-300",
        currentStatus.border,
        currentStatus.bg,
        isCompact ? "p-4" : "p-6",
        "hover:shadow-lg hover:shadow-black/20",
        className
      )}
    >
      {/* Accent Glow */}
      <div className={cn(
        "absolute top-0 left-0 w-1 h-full rounded-l-2xl",
        status === "ready" ? "bg-emerald-500" : 
        status === "executing" ? "bg-amber-500" : "bg-slate-700"
      )} />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2.5 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110",
            status === "ready" ? "bg-emerald-900/40 border-emerald-800/50 text-emerald-400" : "bg-slate-850 border-slate-800 text-slate-400"
          )}>
            <Icon className={cn(isCompact ? "w-4 h-4" : "w-5 h-5")} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={cn("text-[10px] font-bold uppercase tracking-widest", currentStatus.color)}>
                {currentStatus.label}
              </span>
              {status === "analyzing" && <Loader2 className="w-2.5 h-2.5 animate-spin text-trace-400" />}
            </div>
            <h3 className={cn("font-display text-white mt-0.5", isCompact ? "text-lg" : "text-xl")}>
              {title}
            </h3>
          </div>
        </div>
        
        <div className="text-right">
          <span className="text-[9px] font-mono text-slate-500 uppercase">INTENT_{id.split('-')[0].toUpperCase()}</span>
          {confidence < 0.95 && (
            <div className="flex items-center gap-1 mt-1 justify-end text-[10px] text-amber-500/70">
              <Info className="w-3 h-3" />
              <span>Low Confidence</span>
            </div>
          )}
        </div>
      </div>

      <p className={cn("text-slate-400 leading-relaxed mb-6", isCompact ? "text-xs" : "text-sm")}>
        {description}
      </p>

      <div className="flex items-center justify-between pt-5 border-t border-slate-800/50">
        <div>
          {impact && (
            <>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block mb-0.5">Estimated Impact</span>
              <span className="text-emerald-400 font-mono font-bold">{impact}</span>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {onDownload && (status === "ready" || status === "executing" || status === "completed") && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-850 text-slate-300 text-xs font-bold hover:bg-slate-800 transition-colors border border-slate-700"
              title={type.includes('transfer') ? "Download PDF Switch Kit" : "Download Action Manifest"}
            >
              <Info className="w-3.5 h-3.5" />
              Switch Kit
            </button>
          )}

          {status === "ready" && (
            <button
              onClick={onReview}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Review Logic
            </button>
          )}
          
          {(status === "ready" || status === "draft") && (
            <button
              onClick={onExecute}
              disabled={status === "draft"}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all",
                status === "ready" 
                  ? "bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-900/20" 
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              )}
            >
              {status === "ready" ? (
                <>
                  Execute Action
                  <Fingerprint className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  Awaiting Logic
                  <Clock className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          )}

          {status === "executing" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-950/30 text-amber-400 text-xs font-bold border border-amber-800/50">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Processing...
            </div>
          )}

          {status === "completed" && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-900/30 text-emerald-400 text-xs font-bold border border-emerald-800/50">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirmed
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
