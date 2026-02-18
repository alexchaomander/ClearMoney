"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BrainCircuit, 
  Check, 
  X, 
  ArrowRight, 
  Sparkles,
  DollarSign,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Inference {
  id: string;
  field: string;
  value: string;
  confidence: number;
  reasoning: string;
}

interface InferenceConfirmProps {
  inference: Inference;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  className?: string;
}

export function InferenceConfirm({
  inference,
  onConfirm,
  onReject,
  className,
}: InferenceConfirmProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "relative rounded-2xl border border-trace-800/50 bg-trace-950/20 p-5 overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-trace-900/50 text-trace-400 border border-trace-800/50">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-trace-400 uppercase tracking-widest">System Inference</span>
              <span className="px-1.5 py-0.5 rounded bg-trace-900/50 text-trace-500 text-[8px] font-mono">
                {Math.round(inference.confidence * 100)}% Match
              </span>
            </div>
            <h4 className="text-sm font-medium text-white mt-0.5">
              Confirm {inference.field}
            </h4>
          </div>
        </div>
        <Sparkles className="w-3 h-3 text-trace-500 animate-pulse" />
      </div>

      <div className="bg-slate-950/50 rounded-xl border border-slate-800 p-3 mb-4">
        <p className="text-lg font-mono text-emerald-400 font-bold">{inference.value}</p>
        <p className="text-[10px] text-slate-500 mt-1 italic leading-relaxed">
          &quot;{inference.reasoning}&quot;
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onConfirm(inference.id)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-900/20"
        >
          <Check className="w-3.5 h-3.5" />
          Confirm
        </button>
        <button
          onClick={() => onReject(inference.id)}
          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}
