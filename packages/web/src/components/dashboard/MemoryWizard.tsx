"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  X, 
  BrainCircuit, 
  DollarSign, 
  Target, 
  Home,
  User,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUpdateMemory, useFinancialMemory } from "@/lib/strata/hooks";
import type { FinancialMemory, FinancialMemoryUpdate } from "@clearmoney/strata-sdk";

interface Step {
  id: string;
  question: string;
  field: keyof FinancialMemory;
  type: "number" | "select" | "slider";
  icon: React.ElementType;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}

const STEPS: Step[] = [
  {
    id: "age",
    question: "How old are you?",
    field: "age",
    type: "number",
    icon: User,
    min: 18,
    max: 100
  },
  {
    id: "income",
    question: "What's your target annual household income?",
    field: "annual_income",
    type: "number",
    icon: DollarSign,
    prefix: "$",
    step: 5000
  },
  {
    id: "risk",
    question: "What's your comfort level with investment risk?",
    field: "risk_tolerance",
    type: "select",
    icon: Activity,
    options: [
      { value: "conservative", label: "Conservative (Preserve Capital)" },
      { value: "moderate", label: "Moderate (Balanced Growth)" },
      { value: "aggressive", label: "Aggressive (Maximum Growth)" }
    ]
  },
  {
    id: "retirement",
    question: "At what age do you want to achieve financial independence?",
    field: "retirement_age",
    type: "number",
    icon: Target,
    min: 30,
    max: 90
  }
];

interface MemoryWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MemoryWizard({ isOpen, onClose }: MemoryWizardProps) {
  const { data: memory } = useFinancialMemory();
  const updateMemory = useUpdateMemory();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [values, setValues] = useState<Partial<FinancialMemory>>({});

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      // Final save
      updateMemory.mutate(values as FinancialMemoryUpdate);
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStepIndex(prev => Math.max(0, prev - 1));
  };

  const updateValue = (field: keyof FinancialMemory, val: string | number | null) => {
    setValues(prev => ({ ...prev, [field]: val }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
            <motion.div 
              className="h-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
            />
          </div>

          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-2 text-emerald-400">
                <BrainCircuit className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Financial Memory Wizard</span>
              </div>
              <button onClick={onClose} className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep.id}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="min-h-[240px]"
              >
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-400 mb-4">
                    <currentStep.icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-display text-2xl text-white leading-tight">
                    {currentStep.question}
                  </h2>
                </div>

                <div className="space-y-4">
                  {currentStep.type === "number" && (
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 font-mono">
                        {currentStep.prefix}
                      </div>
                      <input
                        autoFocus
                        type="number"
                        placeholder="Enter amount..."
                        value={(values[currentStep.field] ?? memory?.[currentStep.field] ?? "") as string | number}
                        onChange={(e) => updateValue(currentStep.field, e.target.value === "" ? null : Number(e.target.value))}
                        className={cn(
                          "w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all text-xl font-mono text-white",
                          currentStep.prefix ? "pl-10" : "px-6"
                        )}
                      />
                    </div>
                  )}

                  {currentStep.type === "select" && (
                    <div className="grid gap-2">
                      {currentStep.options?.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => {
                            updateValue(currentStep.field, opt.value);
                            setTimeout(handleNext, 300); // Auto-advance select
                          }}
                          className={cn(
                            "w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between group",
                            (values[currentStep.field] ?? memory?.[currentStep.field]) === opt.value
                              ? "bg-emerald-950/20 border-emerald-500/50 text-emerald-400"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          )}
                        >
                          <span className="font-medium">{opt.label}</span>
                          {(values[currentStep.field] ?? memory?.[currentStep.field]) === opt.value && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-12 flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStepIndex === 0}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-200 transition-colors disabled:opacity-0"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-emerald-400 transition-all shadow-xl shadow-white/5"
              >
                {isLastStep ? "Complete Profile" : "Continue"}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="px-8 py-4 bg-slate-950/50 border-t border-slate-800">
            <p className="text-[10px] text-slate-600 text-center uppercase tracking-widest font-bold">
              Step {currentStepIndex + 1} of {STEPS.length} &middot; Updates Financial Context
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
