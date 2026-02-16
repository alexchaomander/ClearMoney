"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X, Info, ShieldCheck, Calculator } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { MetricTraceData } from "@/lib/strata/metrics-methodology";

interface TraceModalProps {
  data: MetricTraceData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TraceModal({ data, open, onOpenChange }: TraceModalProps) {
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
                className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[101] flex items-center justify-center p-4"
              >
                <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 bg-emerald-900/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Calculator className="w-5 h-5" />
                      </div>
                      <div>
                        <Dialog.Title className="font-serif text-xl text-white">
                          Metric Methodology
                        </Dialog.Title>
                        <Dialog.Description className="text-xs text-neutral-500">
                          ClearMoney &middot; Trace {data.metricId}
                        </Dialog.Description>
                      </div>
                    </div>
                    <Dialog.Close asChild>
                      <button className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Summary */}
                    <div>
                      <h3 className="text-sm font-medium text-neutral-100 mb-2">{data.label}</h3>
                      <p className="text-sm text-neutral-400 leading-relaxed">
                        {data.description}
                      </p>
                    </div>

                    {/* Formula */}
                    <div className="p-4 rounded-xl bg-black/40 border border-neutral-800">
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2 font-bold">Calculation Formula</p>
                      <code className="text-lg font-mono text-emerald-400">
                        {data.formula}
                      </code>
                    </div>

                    {/* Data Points */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-3 font-bold">Raw Inputs Used</p>
                      <div className="space-y-3">
                        {data.dataPoints.map((point, i) => (
                          <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                            <div>
                              <p className="text-xs font-medium text-neutral-200">{point.label}</p>
                              {point.source && (
                                <p className="text-[10px] text-neutral-500 mt-0.5">Source: {point.source}</p>
                              )}
                            </div>
                            <span className="text-xs text-neutral-400 text-right">
                              {point.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs text-neutral-300">Signal Confidence</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500" 
                            style={{ width: `${data.confidenceScore * 100}%` }} 
                          />
                        </div>
                        <span className="text-xs font-bold text-emerald-400">
                          {Math.round(data.confidenceScore * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-neutral-900/50 border-t border-neutral-800">
                    <p className="text-[10px] text-neutral-500 leading-relaxed italic text-center">
                      Methodology is audited for independence. Check the Transparency Hub for full disclosure.
                    </p>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
