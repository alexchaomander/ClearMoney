"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  X, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  Circle,
  Activity,
  Bot,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ActionIntent } from "@clearmoney/strata-sdk";
import { ExecutionSnippet } from "./ExecutionSnippet";
import { cn } from "@/lib/utils";

interface GhostSidebarProps {
  intent: ActionIntent;
  onClose: () => void;
  onComplete: () => void;
}

export function GhostSidebar({ intent, onClose, onComplete }: GhostSidebarProps) {
  const manifest = intent.execution_manifest as any;
  const steps = manifest?.steps || [];
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const toggleStep = (order: number) => {
    setCompletedSteps(prev => 
      prev.includes(order) ? prev.filter(s => s !== order) : [...prev, order]
    );
  };

  const isFullyComplete = completedSteps.length === steps.length && steps.length > 0;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed right-0 top-0 bottom-0 z-[100] w-full max-w-md bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-neutral-800 bg-emerald-950/20 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-lg text-white leading-tight">Ghost Copilot</h2>
            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Guided Execution</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-neutral-900 text-neutral-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-neutral-900 overflow-hidden">
        <motion.div 
          className="h-full bg-emerald-500"
          initial={{ width: 0 }}
          animate={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
        />
      </div>

      <div className="flex-grow overflow-y-auto p-6 space-y-8">
        {/* Intent Info */}
        <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
          <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mb-1">Active Intent</div>
          <div className="text-sm font-medium text-white mb-2">{intent.title}</div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Bot className="w-3 h-3 text-emerald-400" />
            Era 2 Bridge Enabled
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Execution Path</div>
          {steps.map((step: any, i: number) => {
            const isDone = completedSteps.includes(step.order);
            const isCurrent = !isDone && (i === 0 || completedSteps.includes(steps[i-1].order));

            return (
              <div 
                key={step.order}
                className={cn(
                  "p-5 rounded-2xl border transition-all",
                  isDone ? "bg-emerald-950/10 border-emerald-900/50 opacity-60" : 
                  isCurrent ? "bg-neutral-900 border-neutral-700 shadow-xl" : "bg-neutral-950 border-neutral-900 opacity-40"
                )}
              >
                <div className="flex items-start gap-4 mb-4">
                  <button 
                    onClick={() => toggleStep(step.order)}
                    className={cn(
                      "mt-0.5 flex-shrink-0 transition-colors",
                      isDone ? "text-emerald-400" : "text-neutral-700"
                    )}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div className="flex-grow">
                    <h4 className={cn("text-sm font-bold mb-1", isDone ? "text-emerald-100" : "text-white")}>
                      {step.label}
                    </h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {step.instruction}
                    </p>
                  </div>
                </div>

                {/* Step Action (Link) */}
                {step.url && isCurrent && (
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between w-full p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all mb-4"
                  >
                    Open Target Site
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {/* Step Snippets */}
                {step.snippets && step.snippets.length > 0 && isCurrent && (
                  <div className="grid gap-2">
                    {step.snippets.map((snippet: any, j: number) => (
                      <ExecutionSnippet 
                        key={j} 
                        label={snippet.label} 
                        value={snippet.value} 
                        copyValue={snippet.copy_value}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-neutral-800 bg-neutral-950">
        <button
          onClick={onComplete}
          disabled={!isFullyComplete}
          className={cn(
            "w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all",
            isFullyComplete 
              ? "bg-white text-neutral-950 shadow-xl shadow-white/5" 
              : "bg-neutral-900 text-neutral-600 cursor-not-allowed"
          )}
        >
          {isFullyComplete ? (
            <>
              Finalize & Trigger Verification
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            "Complete all steps to finalize"
          )}
        </button>
        <p className="text-center text-[9px] text-neutral-600 mt-4 uppercase tracking-[0.2em]">
          Verification takes 2-4 hours via Strata Sync
        </p>
      </div>
    </motion.div>
  );
}
