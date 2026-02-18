"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Briefcase, 
  RefreshCw,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { formatCurrency, formatMonthsAsYears } from "@/lib/shared/formatters";

// Types for our scenario inputs
interface ScenarioInputs {
  monthlyBurnAdjustment: number; // +/- $ amount
  portfolioReturnAdjustment: number; // +/- % return
  revenueGrowthAdjustment: number; // +/- % growth
  inflationAdjustment: number; // +/- % inflation
}

interface ScenarioLabProps {
  baseMonthlyBurn: number;
  baseTotalLiquid: number;
  baseRevenue: number; // For entity runway
  className?: string;
}

export function ScenarioLab({
  baseMonthlyBurn,
  baseTotalLiquid,
  baseRevenue,
  className
}: ScenarioLabProps) {
  const [inputs, setInputs] = useState<ScenarioInputs>({
    monthlyBurnAdjustment: 0,
    portfolioReturnAdjustment: 0,
    revenueGrowthAdjustment: 0,
    inflationAdjustment: 0
  });

  const [isSimulating, setIsSimulating] = useState(false);

  // Derived Metrics (Client-side Approximation for instant feedback)
  const projected = useMemo(() => {
    const adjustedBurn = Math.max(1000, baseMonthlyBurn + inputs.monthlyBurnAdjustment);
    const adjustedLiquid = baseTotalLiquid * (1 + inputs.portfolioReturnAdjustment / 100);
    const adjustedRevenue = baseRevenue * (1 + inputs.revenueGrowthAdjustment / 100);
    
    // Simple Runway Calc
    // Net Burn = Burn - Revenue
    const netBurn = Math.max(1, adjustedBurn - adjustedRevenue);
    const runwayMonths = adjustedLiquid / netBurn;

    return {
      runwayMonths,
      monthlyBurn: adjustedBurn,
      totalLiquid: adjustedLiquid,
      netBurn
    };
  }, [baseMonthlyBurn, baseTotalLiquid, baseRevenue, inputs]);

  const handleReset = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setInputs({
        monthlyBurnAdjustment: 0,
        portfolioReturnAdjustment: 0,
        revenueGrowthAdjustment: 0,
        inflationAdjustment: 0
      });
      setIsSimulating(false);
    }, 500);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-950/30 text-purple-400 border border-purple-900/50">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display text-xl text-white">Scenario Lab</h2>
            <p className="text-xs text-slate-400">Stress-test your runway under different operating conditions.</p>
          </div>
        </div>
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors border border-slate-700"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", isSimulating && "animate-spin")} />
          Reset Baseline
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="space-y-6">
            {/* Burn Slider */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" />
                  Monthly Spend
                </label>
                <span className={cn(
                  "text-xs font-mono font-medium",
                  inputs.monthlyBurnAdjustment > 0 ? "text-amber-400" : 
                  inputs.monthlyBurnAdjustment < 0 ? "text-emerald-400" : "text-slate-500"
                )}>
                  {inputs.monthlyBurnAdjustment > 0 ? "+" : ""}{formatCurrency(inputs.monthlyBurnAdjustment)}
                </span>
              </div>
              <Slider
                value={[inputs.monthlyBurnAdjustment]}
                min={-20000}
                max={50000}
                step={1000}
                onValueChange={(val) => setInputs(p => ({ ...p, monthlyBurnAdjustment: val[0] }))}
                className="py-2"
              />
              <p className="text-[10px] text-slate-500 mt-2">
                Simulate hiring (+$) or cost-cutting (-$).
              </p>
            </div>

            {/* Portfolio Return Slider */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Market Impact
                </label>
                <span className={cn(
                  "text-xs font-mono font-medium",
                  inputs.portfolioReturnAdjustment > 0 ? "text-emerald-400" : 
                  inputs.portfolioReturnAdjustment < 0 ? "text-amber-400" : "text-slate-500"
                )}>
                  {inputs.portfolioReturnAdjustment > 0 ? "+" : ""}{inputs.portfolioReturnAdjustment}%
                </span>
              </div>
              <Slider
                value={[inputs.portfolioReturnAdjustment]}
                min={-40}
                max={40}
                step={1}
                onValueChange={(val) => setInputs(p => ({ ...p, portfolioReturnAdjustment: val[0] }))}
                className="py-2"
              />
              <p className="text-[10px] text-slate-500 mt-2">
                Simulate a correction (-%) or bull market (+%).
              </p>
            </div>

            {/* Revenue Growth Slider */}
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5" />
                  Revenue Growth
                </label>
                <span className={cn(
                  "text-xs font-mono font-medium",
                  inputs.revenueGrowthAdjustment > 0 ? "text-emerald-400" : 
                  inputs.revenueGrowthAdjustment < 0 ? "text-amber-400" : "text-slate-500"
                )}>
                  {inputs.revenueGrowthAdjustment > 0 ? "+" : ""}{inputs.revenueGrowthAdjustment}%
                </span>
              </div>
              <Slider
                value={[inputs.revenueGrowthAdjustment]}
                min={-50}
                max={100}
                step={5}
                onValueChange={(val) => setInputs(p => ({ ...p, revenueGrowthAdjustment: val[0] }))}
                className="py-2"
              />
            </div>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4 auto-rows-min">
          <MetricCard
            label="Projected Runway"
            value={formatMonthsAsYears(projected.runwayMonths)}
            subValue={projected.runwayMonths >= 12 ? "Solid Buffer" : "Critical Zone"}
            intent={projected.runwayMonths >= 18 ? "emerald" : projected.runwayMonths >= 6 ? "amber" : "error"}
            confidence={0.9} // Simulation confidence
            icon={<Zap className="w-4 h-4" />}
            className="sm:col-span-2 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800"
          />
          
          <MetricCard
            label="Adjusted Net Burn"
            value={projected.netBurn}
            formatter={(v) => formatCurrency(v)}
            intent="neutral"
            icon={<TrendingDown className="w-4 h-4" />}
          />

          <MetricCard
            label="Scenario Liquidity"
            value={projected.totalLiquid}
            formatter={(v) => formatCurrency(v)}
            intent="neutral"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
}
