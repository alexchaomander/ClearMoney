"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Calculator, ShieldCheck, Activity, ArrowRight, Info, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useDensity } from "@/components/layout/DensityContext";

export interface MetricTraceData {
  metricId: string;
  label: string;
  formula: string;
  description: string;
  dataPoints: {
    label: string;
    value: string | number;
    source?: string;
  }[];
  confidenceScore: number; // 0 to 1
}

interface TraceModalProps {
  data: MetricTraceData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TraceModal({ data, open, onOpenChange }: TraceModalProps) {
  const { density } = useDensity();
  const isCompact = density === "compact";

  // Confidence styling
  const confidenceColor = 
    data.confidenceScore >= 0.9 ? "text-emerald-600 dark:text-emerald-400" :
    data.confidenceScore >= 0.7 ? "text-amber-600 dark:text-amber-400" : "text-rose-600 dark:text-rose-400";
  
  const confidenceBg = 
    data.confidenceScore >= 0.9 ? "bg-emerald-500" :
    data.confidenceScore >= 0.7 ? "bg-amber-500" : "bg-rose-500";

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-slate-950/40 dark:bg-slate-950/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className={cn(
                    "w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden pointer-events-auto",
                    "ring-1 ring-black/5 dark:ring-white/10"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-8 pt-8 pb-6 bg-slate-50 dark:bg-slate-850/50 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/50 border border-emerald-500/20 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm">
                        <Zap className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <Dialog.Title className="font-serif text-3xl text-slate-900 dark:text-white tracking-tight">
                          Decision Trace
                        </Dialog.Title>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                            ID: {data.metricId}
                          </span>
                          <span className="text-xs text-slate-400 font-medium uppercase tracking-widest flex items-center gap-1">
                            <Info className="w-3 h-3" />
                            Deterministic Math
                          </span>
                        </div>
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <button className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" aria-label="Close dialog">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className={cn("px-8 py-8 space-y-8", isCompact ? "space-y-6" : "")}>
                    {/* Definition */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/50">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-2">{data.label}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {data.description}
                      </p>
                    </div>

                    {/* Formula Visualization */}
                    <div className="relative p-6 rounded-2xl bg-slate-900 dark:bg-black border border-slate-800 shadow-xl group overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
                        <Calculator className="w-12 h-12 text-white" />
                      </div>
                      <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 mb-4 font-black">Computed Logic</p>
                      <code className="text-xl sm:text-2xl font-mono text-white break-words block tracking-tighter">
                        {data.formula}
                      </code>
                    </div>

                    {/* Interactive Logic Tree */}
                    <div>
                      <div className="flex items-center gap-2 mb-6">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 font-black">Context Graph Inputs</p>
                      </div>
                      
                      <div className="space-y-4 relative">
                        {/* The Tree "Stem" */}
                        <div className="absolute left-[23px] top-2 bottom-6 w-0.5 bg-slate-100 dark:bg-slate-800" />
                        
                        {data.dataPoints.map((point, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.1 }}
                            className="relative z-10 flex items-start gap-6"
                          >
                            {/* Tree Node */}
                            <div className="mt-3.5 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] shrink-0 ml-4" />
                            
                            {/* Node Content */}
                            <div className="flex-1 p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-all shadow-sm group">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wide">{point.label}</p>
                                  {point.source && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 flex items-center gap-1.5">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                      {point.source}
                                    </p>
                                  )}
                                </div>
                                <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/10">
                                  {point.value}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Footer */}
                    <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg bg-current opacity-10", confidenceColor)} />
                        <ShieldCheck className={cn("w-5 h-5 absolute ml-2", confidenceColor)} />
                        <div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Signal Integrity</span>
                          <span className={cn("text-xs font-bold", confidenceColor)}>Verifiable & Audited</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-950/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((bar) => (
                            <motion.div 
                              key={bar}
                              initial={{ scaleY: 0.5 }}
                              animate={{ scaleY: 1 }}
                              transition={{ duration: 0.5, delay: bar * 0.05 }}
                              className={cn(
                                "w-1.5 h-4 rounded-full transition-all origin-bottom",
                                (data.confidenceScore * 5) >= bar ? confidenceBg : "bg-slate-200 dark:bg-slate-800"
                              )} 
                            />
                          ))}
                        </div>
                        <span className={cn("font-mono text-sm font-black", confidenceColor)}>
                          {Math.round(data.confidenceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legal/Audit Link */}
                  <div className="px-8 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs text-slate-400 font-mono tracking-tighter uppercase">
                      Audit Trail: {data.metricId.slice(0, 12).toUpperCase()}
                    </span>
                    <button className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-black uppercase tracking-[0.1em] flex items-center gap-2 transition-colors">
                      Full Methodology <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
