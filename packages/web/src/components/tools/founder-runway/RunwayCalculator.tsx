"use client";

import React, { useState, useMemo } from "react";
import { 
  Rocket, 
  TrendingDown, 
  Calendar, 
  ShieldAlert, 
  ArrowRight,
  Info,
  Lock
} from "lucide-react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { UnifiedIntakeForm } from "@/components/shared/UnifiedIntakeForm";
import { Button } from "@/components/ui/button";

interface RunwayCalculatorProps {
  showShell?: boolean;
}

/**
 * RunwayCalculatorInner - The core logic and UI of the calculator
 */
function RunwayCalculatorInner() {
  const FUNDRAISING_RUNWAY_THRESHOLD_MONTHS = 9;
  const AVERAGE_SERIES_A_TIMELINE_MONTHS = 6.4;
  const CRITICAL_RUNWAY_THRESHOLD_MONTHS = 6;

  // Business Inputs
  const [bizCash, setBizCash] = useState(500000);
  const [bizBurn, setBizBurn] = useState(40000);
  
  // Personal Inputs
  const [personalCash, setPersonalCash] = useState(150000);
  const [personalBurn, setPersonalBurn] = useState(8000);
  
  // Conversion state
  const [unlocked, setUnlocked] = useState(false);

  // Calculations
  const bizRunway = useMemo(() => {
    if (bizBurn <= 0) return Infinity;
    return Math.floor(bizCash / bizBurn);
  }, [bizCash, bizBurn]);

  const combinedRunway = useMemo(() => {
    const totalCash = bizCash + personalCash;
    const totalBurn = bizBurn + personalBurn;
    if (totalBurn <= 0) return Infinity;
    return Math.floor(totalCash / totalBurn);
  }, [bizCash, personalCash, bizBurn, personalBurn]);

  const formatRunway = (months: number) => {
    if (months === Infinity) return "Infinite";
    return `${months} months`;
  };

  const criticalWarning = bizRunway < CRITICAL_RUNWAY_THRESHOLD_MONTHS;

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Left Col: Inputs */}
      <div className="lg:col-span-7 space-y-8">
        {/* Business Section */}
        <section className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <Rocket className="w-4 h-4" /> Startup Financials
          </h3>
          
          <div className="space-y-8">
            <SliderInput
              label="Company Cash-on-Hand"
              value={bizCash}
              onChange={setBizCash}
              min={0}
              max={2000000}
              step={10000}
              format="currency"
              description="Total liquid cash in your business accounts."
            />
            
            <SliderInput
              label="Monthly Business Burn"
              value={bizBurn}
              onChange={setBizBurn}
              min={0}
              max={150000}
              step={1000}
              format="currency"
              description="Payroll, SaaS, rent, and marketing."
            />
          </div>
        </section>

        {/* Personal Section */}
        <section className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Personal Survival
          </h3>
          
          <div className="space-y-8">
            <SliderInput
              label="Personal Liquid Assets"
              value={personalCash}
              onChange={setPersonalCash}
              min={0}
              max={1000000}
              step={5000}
              format="currency"
              description="Savings, taxable brokerage, and emergency fund."
            />
            
            <SliderInput
              label="Monthly Personal Burn"
              value={personalBurn}
              onChange={setPersonalBurn}
              min={0}
              max={30000}
              step={500}
              format="currency"
              description="Rent/mortgage, food, and lifestyle."
            />
          </div>
        </section>

        <MethodologySection
          title="How we calculate 'True Runway'"
          steps={[
            "We first calculate 'Default Alive' for the business.",
            "We then model a 'Total Collapse' scenario where personal assets are used to extend company life.",
            "The 'True Runway' assumes a 20% tax drag on liquidating personal equity or brokerage assets."
          ]}
        />
      </div>

      {/* Right Col: Results & Capture */}
      <div className="lg:col-span-5 space-y-6">
        <ResultCard
          title="Startup Runway"
          value={formatRunway(bizRunway)}
          description="Until the company bank account hits $0."
          trend={criticalWarning ? "down" : "up"}
          icon={<Calendar className="w-5 h-5" />}
          color={criticalWarning ? "#f87171" : "#10b981"}
        />

        {!unlocked ? (
          <div className="relative group">
            {/* Blurred Preview */}
            <div className="blur-sm pointer-events-none opacity-50 grayscale transition-all">
              <ResultCard
                title="True Survival Runway"
                value={formatRunway(combinedRunway)}
                description="Combined personal + company assets."
                icon={<ShieldAlert className="w-5 h-5" />}
                color="#60a5fa"
              />
            </div>

            {/* Locked Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-neutral-950 rounded-full flex items-center justify-center mb-4 border border-neutral-800 group-hover:border-brand-500 transition-colors">
                <Lock className="w-5 h-5 text-brand-400" />
              </div>
              
              <UnifiedIntakeForm 
                sourceTool="Runway & Burn Tester"
                onSuccess={() => setUnlocked(true)}
                className="w-full shadow-2xl"
              />
            </div>
          </div>
        ) : (
          <div className="animate-fade-up">
            <ResultCard
              title="True Survival Runway"
              value={formatRunway(combinedRunway)}
              description="Combined personal + company assets."
              icon={<ShieldAlert className="w-5 h-5" />}
              color="#60a5fa"
            />
            
            <div className="mt-6 p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20">
              <h4 className="text-sm font-bold text-brand-400 flex items-center gap-2 mb-2">
                <Info className="w-4 h-4" /> Decision Trace: Fundraising Trigger
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Based on your burn of <strong>${(bizBurn + personalBurn).toLocaleString()}</strong>, you are currently 
                {combinedRunway < FUNDRAISING_RUNWAY_THRESHOLD_MONTHS ? " below the safe fundraising threshold." : " in a healthy position."}
                <br /><br />
                <span className="text-white">Recommendation:</span> {combinedRunway < FUNDRAISING_RUNWAY_THRESHOLD_MONTHS 
                  ? `Start your fundraise process now. Average Series A time-to-close is ${AVERAGE_SERIES_A_TIMELINE_MONTHS} months.` 
                  : "Focus on growth. You have enough buffer to hit your next milestone."}
              </p>
              
              <Button className="w-full mt-4 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold py-4">
                Draft My Investor Deck Snapshots
                <ArrowRight className="ml-2 w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {criticalWarning && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-4">
            <ShieldAlert className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-red-400">Critical: Low Runway</p>
              <p className="text-xs text-neutral-400">
                Your startup has less than 6 months of runway. You are approaching the 'Fatal Drift' zone.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * RunwayCalculator - "Shot #1" for the Mini-Product Flywheel.
 * Targets founders with the universal anxiety: "How long until I go to zero?"
 */
export function RunwayCalculator({ showShell = true }: RunwayCalculatorProps) {
  if (!showShell) {
    return <RunwayCalculatorInner />;
  }

  return (
    <AppShell
      title="Founder Runway & Burn Tester"
      description="Is your personal burn killing your startup? See your true runway (Personal + Company)."
      category="Founder Finance"
      icon={<Rocket className="w-6 h-6 text-brand-400" />}
    >
      <RunwayCalculatorInner />
    </AppShell>
  );
}
