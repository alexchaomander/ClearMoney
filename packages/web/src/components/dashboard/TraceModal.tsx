"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Calculator, ShieldCheck, Activity, ArrowRight } from "lucide-react";
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
    data.confidenceScore >= 0.9 ? "text-emerald-400" :
    data.confidenceScore >= 0.7 ? "text-amber-400" : "text-error-400";
  
  const confidenceBg = 
    data.confidenceScore >= 0.9 ? "bg-emerald-500" :
    data.confidenceScore >= 0.7 ? "bg-amber-500" : "bg-error-500";

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
                className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm"
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
                    "w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden pointer-events-auto",
                    "ring-1 ring-white/10"
                  )}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-slate-850 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 shadow-sm shadow-emerald-900/20">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <Dialog.Title className="font-display text-2xl text-white tracking-wide">
                          Logic Trace
                        </Dialog.Title>
                        <Dialog.Description className="font-mono text-[10px] text-slate-400 uppercase tracking-widest">
                          ID: {data.metricId}
                        </Dialog.Description>
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" aria-label="Close dialog">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className={cn("p-6 space-y-6 bg-slate-900", isCompact ? "space-y-4" : "")}>
                    {/* Definition */}
                    <div>
                      <h3 className="text-sm font-medium text-slate-200 mb-1">{data.label}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed font-sans">
                        {data.description}
                      </p>
                    </div>

                    {/* Formula Visualization */}
                    <div className="relative p-5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner group">
                      <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Calculator className="w-4 h-4 text-slate-500" />
                      </div>
                      <p className="text-[9px] uppercase tracking-widest text-slate-500 mb-3 font-bold">Computed Formula</p>
                      <code className="text-lg font-mono text-emerald-400 break-words block">
                        {data.formula}
                      </code>
                    </div>

                    {/* Logic Flow (Tree-like visualization) */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-trace-500" />
                        <p className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Input Vectors</p>
                      </div>
                      
                      <div className="space-y-3 relative">
                        {/* Connecting line for tree effect */}
                        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-slate-800 z-0" />
                        
                        {data.dataPoints.map((point, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative z-10 flex items-start gap-4"
                          >
                            <div className="mt-2.5 w-2 h-2 rounded-full bg-slate-700 border-2 border-slate-900 ring-1 ring-slate-800 shrink-0 ml-4" />
                            
                            <div className="flex-1 p-3 rounded-lg bg-slate-850/50 border border-slate-800 hover:border-trace-500/30 transition-colors group">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <p className="text-xs font-medium text-slate-200 font-mono">{point.label}</p>
                                  {point.source && (
                                    <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500/50" />
                                      Source: {point.source}
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs font-mono text-trace-400 bg-trace-950/30 px-2 py-1 rounded border border-trace-900/30">
                                  {point.value}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence Footer */}
                    <div className="flex items-center justify-between pt-5 border-t border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className={cn("w-4 h-4", confidenceColor)} />
                        <span className="text-xs text-slate-400 font-medium">Signal Confidence</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((bar) => (
                            <div 
                              key={bar}
                              className={cn(
                                "w-1.5 h-3 rounded-sm transition-all",
                                (data.confidenceScore * 5) >= bar ? confidenceBg : "bg-slate-800"
                              )} 
                            />
                          ))}
                        </div>
                        <span className={cn("font-mono text-xs font-bold", confidenceColor)}>
                          {Math.round(data.confidenceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-mono">
                      TRACE_ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                    </span>
                    <button className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors">
                      View Independent Audit <ArrowRight className="w-3 h-3" />
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
