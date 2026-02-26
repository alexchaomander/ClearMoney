"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ChevronRight, 
  Zap, 
  Target, 
  ShieldCheck, 
  BrainCircuit,
  LayoutDashboard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetId: string;
  icon: React.ElementType;
  position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: TourStep[] = [
  {
    id: "command-center",
    title: "Command Center",
    description: "Your prioritized action list. Our agent scans your data surface daily to find moves that save you money.",
    targetId: "command-center-trigger",
    icon: LayoutDashboard,
    position: "bottom"
  },
  {
    id: "decision-traces",
    title: "Strategy Math",
    description: "Hover over any number to see the Logic Trace. We show you the inputs and formulas so you can verify the math.",
    targetId: "net-worth-card",
    icon: BrainCircuit,
    position: "bottom"
  },
  {
    id: "war-room",
    title: "The War Room",
    description: "When you're ready to make a move, we draft the paperwork here. Review, authorize, and execute with one click.",
    targetId: "war-room-nav",
    icon: ShieldCheck,
    position: "right"
  }
];

export function ProductTour() {
  const [active, setActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "true") {
      setActive(true);
      // Clean up URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const handleNext = () => {
    if (currentStepIndex === TOUR_STEPS.length - 1) {
      setActive(false);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  if (!active) return null;

  const step = TOUR_STEPS[currentStepIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] pointer-events-none">
        {/* Overlay with a hole for the target */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] pointer-events-auto"
          onClick={() => setActive(false)}
        />

        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={cn(
            "fixed z-[210] w-full max-w-sm pointer-events-auto",
            "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" // For prototype, centering it
          )}
        >
          <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl shadow-emerald-500/10 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full" />
            
            <div className="relative">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-emerald-400">
                  <step.icon className="w-5 h-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">Platform Tour</span>
                </div>
                <button onClick={() => setActive(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-2xl font-serif text-white mb-3">{step.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-8">
                {step.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {TOUR_STEPS.map((_, i) => (
                    <div 
                      key={i} 
                      className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all",
                        i === currentStepIndex ? "bg-emerald-500 w-4" : "bg-slate-800"
                      )} 
                    />
                  ))}
                </div>

                <Button 
                  onClick={handleNext}
                  className="bg-white text-slate-950 hover:bg-emerald-400 font-bold px-6"
                >
                  {currentStepIndex === TOUR_STEPS.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
