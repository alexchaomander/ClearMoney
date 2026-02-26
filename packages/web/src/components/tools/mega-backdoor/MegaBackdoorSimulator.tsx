"use client";

import React, { useState, useMemo } from "react";
import { 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Lock,
  PiggyBank,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { UnifiedIntakeForm } from "@/components/shared/UnifiedIntakeForm";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MegaBackdoorSimulatorProps {
  showShell?: boolean;
}

/**
 * MegaBackdoorSimulator - "Shot #2" for the Viral Launch.
 * Targets high-income tech workers (HENRYs) with the FOMO of missing a massive tax loophole.
 */
export function MegaBackdoorSimulator({ showShell = true }: MegaBackdoorSimulatorProps) {
  const IRS_2026_TOTAL_LIMIT = 70000; // Placeholder for 2026, usually rises
  const IRS_2026_EMPLOYEE_LIMIT = 23500;
  
  // User Inputs
  const [salary, setSalary] = useState(250000);
  const [employeeContribution, setEmployeeContribution] = useState(23500);
  const [employerMatch, setEmployerMatch] = useState(10000);
  const [hasAfterTax, setHasAfterTax] = useState(true);
  const [hasInPlanConversion, setHasInPlanConversion] = useState(true);
  
  // Conversion state
  const [unlocked, setUnlocked] = useState(false);

  // Calculations
  const totalExistingContributions = employeeContribution + employerMatch;
  const remainingSpace = Math.max(0, IRS_2026_TOTAL_LIMIT - totalExistingContributions);
  
  // Opportunity Cost (assuming 20 years of 7% growth and 25% tax drag on gains)
  const twentyYearBenefit = useMemo(() => {
    const annualInvestment = remainingSpace;
    const rate = 0.07;
    const years = 20;
    
    // Future value if in Roth (tax-free)
    const fvRoth = annualInvestment * ((Math.pow(1 + rate, years) - 1) / rate);
    
    // Future value if in Taxable (assuming 20% effective tax on gains)
    const totalGains = fvRoth - (annualInvestment * years);
    const taxDrag = totalGains * 0.20;
    const fvTaxable = fvRoth - taxDrag;
    
    return Math.floor(fvRoth - fvTaxable);
  }, [remainingSpace]);

  const isEligible = hasAfterTax && hasInPlanConversion;

  const content = (
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Col: Inputs */}
        <div className="lg:col-span-7 space-y-8">
          {/* Plan Capability Section */}
          <section className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Plan Capabilities
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="space-y-0.5">
                  <Label className="text-white font-bold">After-Tax Contributions</Label>
                  <p className="text-xs text-neutral-500 italic">Does your plan allow non-Roth after-tax? (Standard at FAANG)</p>
                </div>
                <Switch checked={hasAfterTax} onCheckedChange={setHasAfterTax} />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800">
                <div className="space-y-0.5">
                  <Label className="text-white font-bold">In-Plan Conversion</Label>
                  <p className="text-xs text-neutral-500 italic">Can you convert after-tax to Roth instantly?</p>
                </div>
                <Switch checked={hasInPlanConversion} onCheckedChange={setHasInPlanConversion} />
              </div>
            </div>
          </section>

          {/* Contribution Section */}
          <section className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <PiggyBank className="w-4 h-4" /> Current 401(k) Setup
            </h3>
            
            <div className="space-y-8">
              <SliderInput
                label="Your Salary"
                value={salary}
                onChange={setSalary}
                min={50000}
                max={1000000}
                step={10000}
                format="currency"
              />
              
              <SliderInput
                label="Your Basic Contribution (Pre-tax/Roth)"
                value={employeeContribution}
                onChange={setEmployeeContribution}
                min={0}
                max={IRS_2026_EMPLOYEE_LIMIT}
                step={500}
                format="currency"
              />

              <SliderInput
                label="Estimated Employer Match"
                value={employerMatch}
                onChange={setEmployerMatch}
                min={0}
                max={30000}
                step={500}
                format="currency"
              />
            </div>
          </section>

          <MethodologySection
            title="The Mega-Backdoor Math"
            steps={[
              `The IRS allows a total 401(k) contribution of $${IRS_2026_TOTAL_LIMIT.toLocaleString()} in 2026.`,
              "Most people stop at the $23,500 employee limit.",
              "If your plan allows it, you can fill the remaining gap with after-tax dollars and immediately convert them to Roth.",
              "This provides tax-free growth on dollars that would otherwise be subject to 20-37% capital gains/income tax."
            ]}
          />
        </div>

        {/* Right Col: Results & Capture */}
        <div className="lg:col-span-5 space-y-6">
          <ResultCard
            title="Untapped Roth Space"
            value={`$${remainingSpace.toLocaleString()}/yr`}
            description="Total additional tax-free space available."
            trend={remainingSpace > 20000 ? "up" : "neutral"}
            icon={<Zap className="w-5 h-5" />}
            color={remainingSpace > 0 ? "#10b981" : "#64748b"}
          />

          {!unlocked ? (
            <div className="relative group">
              {/* Blurred Preview */}
              <div className="blur-sm pointer-events-none opacity-50 grayscale transition-all">
                <ResultCard
                  title="20-Year Tax Savings"
                  value={`$${twentyYearBenefit.toLocaleString()}`}
                  description="Projected gain over taxable brokerage."
                  icon={<TrendingUp className="w-5 h-5" />}
                  color="#a855f7"
                />
              </div>

              {/* Locked Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                <div className="w-12 h-12 bg-neutral-950 rounded-full flex items-center justify-center mb-4 border border-neutral-800 group-hover:border-brand-500 transition-colors">
                  <Lock className="w-5 h-5 text-brand-400" />
                </div>
                
                <UnifiedIntakeForm 
                  sourceTool="Mega Backdoor Simulator"
                  onSuccess={() => setUnlocked(true)}
                  className="w-full shadow-2xl"
                />
              </div>
            </div>
          ) : (
            <div className="animate-fade-up">
              <ResultCard
                title="20-Year Tax Savings"
                value={`$${twentyYearBenefit.toLocaleString()}`}
                description="Projected gain over taxable brokerage."
                icon={<TrendingUp className="w-5 h-5" />}
                color="#a855f7"
              />
              
              <div className="mt-6 p-6 rounded-2xl bg-brand-500/5 border border-brand-500/20">
                <h4 className="text-sm font-bold text-brand-400 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" /> Decision Trace: Optimization Strategy
                </h4>
                <div className="text-xs text-neutral-400 leading-relaxed space-y-4">
                  {!isEligible ? (
                    <p className="text-rose-400 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      Your current plan does not support the Mega Backdoor Roth. You are being forced into less efficient taxable brokerage investments.
                    </p>
                  ) : (
                    <p className="text-emerald-400 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      Your plan is eligible. You should redirect <strong>${Math.floor(remainingSpace / 12).toLocaleString()}/mo</strong> from your brokerage account to your After-Tax 401(k).
                    </p>
                  )}
                  
                  <p>
                    <span className="text-white font-bold underline">Action Item:</span> {isEligible 
                      ? "Contact HR or login to Fidelity/Vanguard to enable 'Automated In-Plan Conversion'." 
                      : "Advocate for a plan upgrade. 84% of top-tier tech companies now offer this feature."}
                  </p>
                </div>
                
                <Button className="w-full mt-6 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold py-4">
                  Draft My HR Policy Request
                  <ArrowRight className="ml-2 w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {remainingSpace > 30000 && (
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 flex gap-4">
              <Zap className="w-8 h-8 text-brand-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-brand-400">High Impact Opportunity</p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  You have a massive amount of untapped tax-free space. This is the single highest-impact move for a HENRY.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
  );

  if (!showShell) return content;

  return (
    <AppShell
      title="Mega Backdoor Roth Simulator"
      description="Are you leaving $40,000+ in tax-free space on the table? Calculate your 2026 opportunity cost."
      category="Tax Optimization"
      icon={<Zap className="w-6 h-6 text-brand-400" />}
    >
      {content}
    </AppShell>
  );
}
