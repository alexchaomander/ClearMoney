"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { MemoryWizard } from "@/components/dashboard/MemoryWizard";

const ONBOARDING_KEY = "clearmoney_onboarding_complete";

export default function OnboardingPage() {
  const router = useRouter();
  const [showWizard, setShowWizard] = useState(false);

  const handleWizardClose = () => {
    setShowWizard(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_KEY, "true");
    }
    router.push("/connect");
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.18) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader />

      <main className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-16">
        <div className="mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Welcome to ClearMoney
          </div>
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl text-white">
            Let&apos;s build your financial command center
          </h1>
          <p className="mt-4 text-lg text-neutral-300 max-w-2xl mx-auto">
            We&apos;ll guide you through setting up your financial profile and connecting
            your accounts. It only takes a few minutes.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Set your financial profile",
              description: "Tell us about your goals, income, and risk tolerance so we can personalize your experience.",
            },
            {
              title: "Connect accounts securely",
              description: "Link your brokerage accounts to pull holdings and transactions.",
            },
            {
              title: "Get personalized insights",
              description: "Your agent analyzes your data surface to identify opportunities.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-2xl border border-neutral-800 bg-neutral-900/60 text-left"
            >
              <h3 className="font-serif text-xl text-emerald-100">{item.title}</h3>
              <p className="mt-2 text-sm text-neutral-400">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setShowWizard(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-neutral-500">
            You can update your financial profile any time from Settings.
          </p>
        </div>
      </main>

      <MemoryWizard isOpen={showWizard} onClose={handleWizardClose} />
    </div>
  );
}
