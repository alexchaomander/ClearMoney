"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, Percent, Home, Info, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Assumptions {
  inflation: number;
  marketReturn: number;
  mortgageRate: number;
}

const DEFAULT_ASSUMPTIONS: Assumptions = {
  inflation: 2.5,
  marketReturn: 7.0,
  mortgageRate: 6.5,
};

interface AssumptionContextType {
  assumptions: Assumptions;
  setAssumptions: (a: Assumptions) => void;
  reset: () => void;
}

const AssumptionContext = createContext<AssumptionContextType | undefined>(undefined);

export function AssumptionProvider({ children }: { children: ReactNode }) {
  const [assumptions, setAssumptions] = useState<Assumptions>(DEFAULT_ASSUMPTIONS);
  const reset = () => setAssumptions(DEFAULT_ASSUMPTIONS);

  return (
    <AssumptionContext.Provider value={{ assumptions, setAssumptions, reset }}>
      {children}
    </AssumptionContext.Provider>
  );
}

export function useAssumptions() {
  const context = useContext(AssumptionContext);
  if (!context) throw new Error("useAssumptions must be used within AssumptionProvider");
  return context;
}

export function AssumptionControl() {
  const { assumptions, setAssumptions, reset } = useAssumptions();
  const [isOpen, setIsOpen] = useState(false);

  const isDirty = JSON.stringify(assumptions) !== JSON.stringify(DEFAULT_ASSUMPTIONS);

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
          isOpen 
            ? "bg-emerald-900/20 border-emerald-800/40 text-emerald-400" 
            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
        }`}
      >
        <TrendingUp className="w-4 h-4" />
        {isOpen ? "Hide What-If Analysis" : "Analyze Scenarios (What-If)"}
        {isDirty && !isOpen && (
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 p-6 rounded-2xl bg-neutral-900 border border-neutral-800 grid sm:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    <Percent className="w-3 h-3" />
                    Inflation
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{assumptions.inflation}%</span>
                </div>
                <Slider 
                  value={[assumptions.inflation]} 
                  min={0} max={10} step={0.1}
                  onValueChange={([v]) => setAssumptions({ ...assumptions, inflation: v })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    <TrendingUp className="w-3 h-3" />
                    Market Return
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{assumptions.marketReturn}%</span>
                </div>
                <Slider 
                  value={[assumptions.marketReturn]} 
                  min={-5} max={15} step={0.5}
                  onValueChange={([v]) => setAssumptions({ ...assumptions, marketReturn: v })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-widest">
                    <Home className="w-3 h-3" />
                    Mortgage Baseline
                  </div>
                  <span className="text-sm font-bold text-emerald-400">{assumptions.mortgageRate}%</span>
                </div>
                <Slider 
                  value={[assumptions.mortgageRate]} 
                  min={2} max={12} step={0.1}
                  onValueChange={([v]) => setAssumptions({ ...assumptions, mortgageRate: v })}
                />
              </div>

              <div className="sm:col-span-3 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                  <Info className="w-3 h-3" />
                  Overrides are applied locally to all calculations on this page.
                </div>
                {isDirty && (
                  <button 
                    onClick={reset}
                    className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Defaults
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
