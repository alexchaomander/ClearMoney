"use client";

import { motion } from "framer-motion";
import { FlaskConical, ArrowLeft, Target, TrendingUp, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { RetirementMonteCarloChart } from "@/components/dashboard/RetirementMonteCarloChart";
import { AssumptionControl } from "@/components/dashboard/AssumptionControl";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ScenarioLab } from "@/components/dashboard/ScenarioLab";
import { usePortfolioSummary, useRunwayMetrics } from "@/lib/strata/hooks";

export default function ScenarioLabPage() {
  const { data: portfolio } = usePortfolioSummary();
  const { data: runwayMetrics } = useRunwayMetrics();

  // Fallbacks for demo
  const baseMonthlyBurn = runwayMetrics?.personal.monthly_spend ?? 12000;
  const baseTotalLiquid = (portfolio?.total_cash_value ?? 0) + (portfolio?.total_investment_value ?? 0) || 150000;
  const baseRevenue = runwayMetrics?.entity.monthly_revenue ?? 0;

  return (
    <div className="min-h-screen bg-slate-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader />

      <main className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-900/30 text-emerald-400">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-serif text-3xl text-white">Scenario Lab</h1>
              <p className="text-slate-400">Stress-test your financial future under different market paths.</p>
            </div>
          </div>
        </div>

        <ConsentGate
          scopes={["portfolio:read", "memory:read", "agent:read"]}
          purpose="Run advanced simulations using your portfolio and profile data."
        >
          <div className="grid gap-12">
            
            <section>
              <ScenarioLab 
                baseMonthlyBurn={baseMonthlyBurn}
                baseTotalLiquid={baseTotalLiquid}
                baseRevenue={baseRevenue}
              />
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h2 className="font-display text-xl text-white">Retirement Probability</h2>
              </div>
              <AssumptionControl />
              <RetirementMonteCarloChart />
            </section>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-serif text-lg text-white">Simulation Parameters</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  We run 1,000 iterations of your retirement path, injecting random market volatility and inflation 
                  fluctuations at every step. This gives you a probability-based success rate rather than a single static number.
                </p>
                <Link 
                  href="/profile" 
                  className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Edit profile assumptions
                  <TrendingUp className="w-4 h-4" />
                </Link>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-900/10 border border-emerald-800/20">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-serif text-lg text-white">Institutional Grade</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  This model uses standard normal distribution for annual returns (7% mean, 15% volatility) 
                  and incorporates decumulation glide-paths where risk is automatically reduced during retirement years.
                </p>
                <div className="p-3 rounded-lg bg-black/20 text-[10px] font-mono text-slate-500">
                  Model: RET-MC-V1 &middot; Iterations: 1,000 &middot; Confidence: 95%
                </div>
              </div>
            </div>
          </div>
        </ConsentGate>
      </main>
    </div>
  );
}
