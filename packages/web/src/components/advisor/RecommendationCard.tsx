"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  ChevronRight,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
  ChevronDown,
} from "lucide-react";
import { useExecuteRecommendation } from "@/lib/strata/hooks";
import type { AdvisorRecommendation } from "@clearmoney/strata-sdk";

interface RecommendationCardProps {
  recommendation: AdvisorRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { mutate: execute, isPending, isSuccess, isError, error, data } = useExecuteRecommendation();

  const details = recommendation.details as
    | { action?: { type: string; connection_id?: string; [k: string]: unknown }; rationale?: string[] }
    | undefined;
  const action = details?.action;
  const hasAction = !!action && !!action.type;

  const handleExecute = () => {
    if (!hasAction) return;

    execute({
      recommendationId: recommendation.id,
      request: {
        action: action.type,
        payload: action,
        connection_id: action.connection_id,
      },
    });
  };

  const status = recommendation.status;
  const isExecuted = status === "accepted" || isSuccess;

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isExecuted
          ? "bg-emerald-900/10 border-emerald-800/40"
          : "bg-slate-900 border-slate-800"
      }`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 rounded-lg p-1.5 ${isExecuted ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium text-slate-100">
                {recommendation.title}
              </h3>
              <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border ${
                isExecuted 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                  : "bg-slate-800 text-slate-500 border-slate-700"
              }`}>
                {isExecuted ? "Executed" : status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {recommendation.summary}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            {isExpanded ? "Hide Details" : "Show Details"}
          </button>

          {hasAction && !isExecuted && (
            <button
              onClick={handleExecute}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Play className="w-3 h-3 fill-current" />
              )}
              Execute Action
            </button>
          )}

          {isExecuted && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Execution {isPending ? "Queued" : "Confirmed"}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-slate-800/60"
          >
            <div className="p-4 space-y-4 text-xs">
              {details?.rationale && (
                <div>
                  <p className="text-slate-500 uppercase tracking-widest text-[10px] mb-2 font-bold">Rationale</p>
                  <ul className="space-y-1.5">
                    {details.rationale?.map((step: string, i: number) => (
                      <li key={i} className="flex gap-2 text-slate-300">
                        <span className="text-emerald-500 shrink-0">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hasAction && (
                <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-3 h-3 text-sky-400" />
                    <span className="font-medium text-slate-200 uppercase tracking-wider text-[10px]">Action Payload</span>
                  </div>
                  <pre className="bg-black/40 p-2 rounded text-[10px] text-slate-400 overflow-x-auto">
                    {JSON.stringify(action, null, 2)}
                  </pre>
                </div>
              )}

              {isError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">Execution Failed</p>
                    <p className="text-[10px] opacity-80">{error instanceof Error ? error.message : "An unexpected error occurred during execution."}</p>
                  </div>
                </div>
              )}

              {isSuccess && data && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <p className="font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Success
                  </p>
                  <p className="text-[10px] opacity-80 mt-1">
                    Trace ID: {data.trace_id}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
