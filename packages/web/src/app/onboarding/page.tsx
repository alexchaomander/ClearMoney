"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Sparkles, UserCircle, Target, ShieldCheck } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MemoryWizard } from "@/components/dashboard/MemoryWizard";

const ONBOARDING_KEY = "clearmoney_onboarding_complete";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showWizard, setShowWizard] = useState(false);
  
  const role = searchParams.get("role") || "Member";
  const source = searchParams.get("source") || "Direct";

  const handleWizardClose = () => {
    setShowWizard(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_KEY, "true");
    }
    // Redirect to dashboard with a tour flag
    router.push("/dashboard?tour=true");
  };

  return (
    <main className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-16">
      <div className="mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-300 text-sm font-medium border border-emerald-500/20">
          <Sparkles className="w-4 h-4" />
          Welcome, {role}
        </div>
        <h1 className="mt-6 font-serif text-4xl sm:text-6xl text-white leading-tight">
          Setting up your <br />
          <span className="text-emerald-500 italic">Financial Command Center</span>
        </h1>
        <p className="mt-6 text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          We&apos;ve saved your progress from the <span className="text-white font-bold">{source}</span>. 
          Now, let&apos;s personalize your OS to match your specific goals.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {[
          {
            icon: UserCircle,
            title: "Personalize Intelligence",
            description: "We adapt our math models to your age, income, and risk profile.",
          },
          {
            icon: ShieldCheck,
            title: "Secure Data Surface",
            description: "Connect your accounts via Plaid and SnapTrade with bank-grade encryption.",
          },
          {
            icon: Target,
            title: "Identify Maneuvers",
            description: "Our agent scans for tax-loss harvesting and rebalancing opportunities.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="p-8 rounded-[2rem] border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm text-left group hover:border-emerald-500/30 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <item.icon className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="font-serif text-xl text-white mb-2">{item.title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-6">
        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="group relative inline-flex items-center gap-3 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 bg-white text-slate-950 hover:bg-emerald-400 hover:scale-105 shadow-2xl shadow-emerald-500/10"
        >
          Start Personalization
          <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
        </button>
        <div className="flex items-center gap-2 text-[10px] text-neutral-600 uppercase font-black tracking-widest">
          <ShieldCheck className="w-3 h-3" />
          SOC2 Type II Compliant Infrastructure
        </div>
      </div>

      <MemoryWizard 
        isOpen={showWizard} 
        onClose={handleWizardClose}
      />
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.18) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader />
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-white">Loading...</div>}>
        <OnboardingContent />
      </Suspense>
    </div>
  );
}
