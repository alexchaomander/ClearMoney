"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Activity,
  ChevronRight,
  ChevronLeft,
  Database,
  Lock,
  Globe,
  ArrowUpRight,
  Cpu,
  Fingerprint,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Home,
  Briefcase,
  Flame,
  PiggyBank,
  DollarSign,
  BarChart3,
  Heart
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { VALUATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { captureAnalyticsEvent, rememberFounderFunnelSource } from "@/lib/analytics";

// --- Sub-components for Polish ---

function ProductWindow({ children, title }: { children: React.ReactNode, title: string }) {
  return (
    <div className="relative group/window">
      <div className="absolute -inset-0.5 bg-gradient-to-b from-slate-200 to-transparent dark:from-slate-800 dark:to-transparent rounded-[2rem] blur-sm opacity-50" />
      <div className="relative rounded-[1.8rem] border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl overflow-hidden shadow-slate-200/50 dark:shadow-black/50">
        <div className="h-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center px-4 justify-between">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-bold">{title}</span>
          <div className="w-10" />
        </div>
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  );
}

// VALUATIONS imported from @/lib/constants

// --- Persona Carousel Data ---

const PERSONAS = [
  {
    persona: "Founder",
    painPoint: "I don't know how long my cash will actually last.",
    tool: "Cash Runway Planner.",
    description: "See how long your cash can last across personal and business spending, with live account data and clear assumptions.",
    href: "/tools/founder-runway",
    icon: Briefcase,
    previewTitle: "Cash Runway",
    preview: {
      metric: "14.2",
      unit: "mo",
      label: "Estimated Runway",
      detail: "Best Fundraising Window: Aug 2026",
      barWidth: "70%",
    },
  },
  {
    persona: "New Grad",
    painPoint: "I have student loans, a new salary, and no idea where to start.",
    tool: "Student Loan Payoff Strategy.",
    description: "Compare repayment plans, see how extra payments shorten your timeline, and find the fastest path to debt-free.",
    href: "/tools/student-loan-strategy",
    icon: GraduationCap,
    previewTitle: "Loan Payoff",
    preview: {
      metric: "$847",
      unit: "/mo",
      label: "Optimal Payment",
      detail: "Debt-Free by: Mar 2031",
      barWidth: "45%",
    },
  },
  {
    persona: "First-Time Buyer",
    painPoint: "Can I actually afford a home, or am I fooling myself?",
    tool: "Home Affordability Check.",
    description: "Get a realistic picture of what you can afford based on your real income, debt, and savings — not a lender's maximum.",
    href: "/tools/home-affordability",
    icon: Home,
    previewTitle: "Affordability",
    preview: {
      metric: "$485K",
      unit: "",
      label: "Comfortable Range",
      detail: "DTI Ratio: 28% (Healthy)",
      barWidth: "62%",
    },
  },
  {
    persona: "Tech Employee",
    painPoint: "My RSUs vest soon and I have no idea what the tax hit will be.",
    tool: "RSU Tax Planner.",
    description: "Model your vesting schedule, see projected tax liability, and plan sell-vs-hold decisions with real numbers.",
    href: "/tools/rsu-tax-calculator",
    icon: BarChart3,
    previewTitle: "RSU Taxes",
    preview: {
      metric: "$32K",
      unit: "tax",
      label: "Est. Tax on Next Vest",
      detail: "Optimal Sell Window: Q2 2026",
      barWidth: "55%",
    },
  },
  {
    persona: "Early Retiree",
    painPoint: "I want to retire early but I'm not sure my math adds up.",
    tool: "FIRE Calculator.",
    description: "See your projected retirement date, safe withdrawal rate, and how market scenarios affect your independence timeline.",
    href: "/tools/fire-calculator",
    icon: Flame,
    previewTitle: "FIRE Projection",
    preview: {
      metric: "2034",
      unit: "",
      label: "Projected FIRE Date",
      detail: "Safe Withdrawal: $6,200/mo",
      barWidth: "78%",
    },
  },
  {
    persona: "New Parent",
    painPoint: "Everything costs more now and I need to actually plan ahead.",
    tool: "Conscious Spending Plan.",
    description: "Build a spending plan that reflects your new priorities — childcare, savings, and the things that matter most.",
    href: "/tools/conscious-spending",
    icon: Heart,
    previewTitle: "Spending Plan",
    preview: {
      metric: "68%",
      unit: "",
      label: "Essential Coverage",
      detail: "Emergency Fund: 4.2 Months",
      barWidth: "68%",
    },
  },
];

// --- Main Page ---

export default function LandingPage() {
  const [personaIndex, setPersonaIndex] = useState(0);
  const goNext = useCallback(() => setPersonaIndex((i) => (i + 1) % PERSONAS.length), []);
  const goPrev = useCallback(() => setPersonaIndex((i) => (i - 1 + PERSONAS.length) % PERSONAS.length), []);
  const persona = PERSONAS[personaIndex];

  useEffect(() => {
    captureAnalyticsEvent("founder_funnel_landing_viewed", {
      primary_persona: PERSONAS[0]?.persona ?? "Founder",
      founder_tool_href: "/tools/founder-runway",
    });
  }, []);

  const trackLandingCta = (cta: string, destination: string) => {
    rememberFounderFunnelSource(cta);
    captureAnalyticsEvent("founder_funnel_cta_clicked", {
      cta,
      destination,
      active_persona: persona.persona,
    });
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Pillars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid opacity-20 dark:opacity-10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
      </div>

      {/* Nav */}
      <nav className="relative z-50 flex items-center justify-between h-20 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-2xl tracking-tight text-slate-900 dark:text-white">
            Clear<span className="text-emerald-600 dark:text-emerald-400">Money</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/transparency"
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/blog"
            className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
          >
            Insights
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <ThemeToggle />
          <Link
            href="/invite"
            onClick={() => trackLandingCta("nav_founder_beta", "/invite")}
            className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 text-sm font-bold hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all"
          >
            Founder Beta
          </Link>
        </div>
      </nav>

      {/* Ticker */}
      <div className="relative z-40 border-y border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md overflow-hidden whitespace-nowrap h-10 flex items-center">
        <div className="animate-marquee-slow flex gap-12 items-center px-6">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400 flex items-center gap-2 shrink-0">
            <Activity className="w-3 h-3" /> Live Card Point Values
          </span>
          {[...VALUATIONS, ...VALUATIONS].map((v, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <span className="text-xs font-bold text-slate-400">{v.program}</span>
              <span className="font-mono text-sm font-bold">{v.value}</span>
              <span className={cn(
                "text-xs font-bold",
                v.delta.startsWith("+") ? "text-emerald-500" : v.delta.startsWith("-") ? "text-rose-500" : "text-slate-500"
              )}>{v.delta}</span>
            </div>
          ))}
        </div>
      </div>

      <main className="relative z-10">
        {/* Hero */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-40 text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 shadow-sm"
          >
            <Activity className="w-3 h-3 animate-pulse" />
            Founder Beta, See The Math
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-6xl md:text-8xl lg:text-9xl font-display text-slate-900 dark:text-white leading-[0.85] tracking-tight mb-10"
          >
            Know your runway. <br />
            <span className="text-emerald-600 dark:text-emerald-400 italic">Trust every recommendation.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-lg md:text-2xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-12 font-medium"
          >
            ClearMoney is a founder-first financial operating system for runway, tax pressure, and money decisions you can actually audit before you act.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/tools/founder-runway"
              onClick={() => trackLandingCta("hero_founder_runway", "/tools/founder-runway")}
              className="group w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white font-bold text-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 shadow-2xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-3"
            >
              Try Founder Runway
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/invite"
              onClick={() => trackLandingCta("hero_founder_beta", "/invite")}
              className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
            >
              Enter Founder Beta
            </Link>
          </motion.div>

          {/* Founder Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-32"
          >
            <div className="flex flex-wrap justify-center items-center gap-6">
              {[
                { icon: Briefcase, label: "Founder-first workflow" },
                { icon: ShieldCheck, label: "Transparent recommendations" },
                { icon: Database, label: "Connected account context" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-sm font-bold">
                  <item.icon className="w-3.5 h-3.5 text-emerald-500" />
                  {item.label}
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Featured Tool — Persona Carousel */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-40">
          <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-emerald-500/20 to-transparent dark:from-emerald-500/10 dark:to-transparent">
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl rounded-[2.4rem] p-8 md:p-12 border border-slate-200 dark:border-slate-800 overflow-hidden">
              {/* Header row with badge and arrows */}
              <div className="flex items-center justify-between mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
                  <Zap className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-brand-400">Start Here</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Dot indicators */}
                  <div className="hidden sm:flex items-center gap-1.5 mr-3">
                    {PERSONAS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setPersonaIndex(i)}
                        aria-label={`Go to ${p.persona}`}
                        aria-current={i === personaIndex ? "true" : undefined}
                        className={cn(
                          "w-1.5 h-1.5 rounded-full transition-all duration-300",
                          i === personaIndex
                            ? "bg-emerald-500 w-4"
                            : "bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600"
                        )}
                      />
                    ))}
                  </div>
                  <button
                    onClick={goPrev}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                    aria-label="Previous persona"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={goNext}
                    className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
                    aria-label="Next persona"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Carousel content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={personaIndex}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="flex flex-col md:flex-row items-center gap-10"
                >
                  <div className="flex-1 min-w-0">
                    {/* Persona icon + pain point */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center">
                        <persona.icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic font-medium">
                        &ldquo;{persona.painPoint}&rdquo;
                      </p>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-display text-slate-900 dark:text-white mb-6 leading-tight">
                      {persona.persona} <br />
                      <span className="text-emerald-600 dark:text-emerald-400 italic">{persona.tool}</span>
                    </h2>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 max-w-xl leading-relaxed">
                      {persona.description}
                    </p>
                    <Link
                      href={persona.href}
                      onClick={() => trackLandingCta(`persona_${persona.persona.toLowerCase()}`, persona.href)}
                      className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:gap-3 transition-all"
                    >
                      Open the founder-first tool
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>

                  <div className="w-full md:w-[400px] shrink-0">
                    <ProductWindow title={`Live Preview: ${persona.previewTitle}`}>
                      <div className="p-8 space-y-6">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-1">{persona.preview.label}</p>
                            <p className="text-5xl font-mono text-emerald-600 dark:text-emerald-400 font-bold tracking-tighter">
                              {persona.preview.metric}{persona.preview.unit ? <span className="text-2xl ml-1">{persona.preview.unit}</span> : null}
                            </p>
                          </div>
                          <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <TrendingUp className="w-6 h-6 text-emerald-500" />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: persona.preview.barWidth }}
                              transition={{ duration: 1.2, delay: 0.3 }}
                              className="h-full bg-emerald-500"
                            />
                          </div>
                          <p className="text-xs text-slate-400 dark:text-slate-500 text-center uppercase tracking-widest font-bold">{persona.preview.detail}</p>
                        </div>
                      </div>
                    </ProductWindow>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>

        {/* The Product Hook Section (Scroll Triggered) */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-40">
          <div className="grid lg:grid-cols-12 gap-20 items-center">
            <div className="lg:col-span-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-8 border border-emerald-200 dark:border-emerald-900 shadow-sm">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h2 className="font-display text-5xl md:text-6xl text-slate-900 dark:text-white mb-8 leading-[1.1]">
                  See the reason <br />
                  <span className="text-emerald-600 dark:text-emerald-400 italic">behind each recommendation.</span>
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                  Every suggestion shows the inputs used and the math behind the
                  result, so you can verify it before taking action.
                </p>
                
                <div className="space-y-6">
                  {[
                    { title: "Math, not guesswork", desc: "Recommendations use calculation models you can review." },
                    { title: "One connected view", desc: "Banking, investing, and manual data in one place." },
                    { title: "Transparent incentives", desc: "You can always see how we make money." }
                  ].map((f, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0 group-hover:scale-150 transition-transform" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">{f.title}</h4>
                        <p className="text-slate-500 dark:text-slate-500 text-base leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-7">
              <ProductWindow title="Live Recommendation Preview">
                <div className="p-8 lg:p-12 space-y-8">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-inner"
                  >
                    <p className="text-xs text-slate-400 uppercase font-black tracking-widest mb-4">How It Is Calculated</p>
                    <div className="flex flex-col md:flex-row gap-6 items-baseline justify-between">
                      <code className="text-2xl font-mono text-emerald-600 dark:text-emerald-400 font-bold leading-none tracking-tighter">
                        (Cash + Invest) / Burn
                      </code>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-black border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED
                      </div>
                    </div>
                  </motion.div>
                  
                  <div className="grid gap-4">
                    {[
                      { label: "Liquid Cash", val: "$12,450", source: "Plaid" },
                      { label: "Brokerage", val: "$142,000", source: "SnapTrade" },
                      { label: "Monthly Spending", val: "$8,200", source: "Observed" }
                    ].map((item, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 rounded-xl bg-white dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm"
                      >
                        <div>
                          <p className="text-xs text-slate-400 uppercase font-bold">{item.label}</p>
                          <p className="text-xs text-slate-500">Source: {item.source}</p>
                        </div>
                        <span className="text-lg font-mono text-slate-900 dark:text-emerald-400 font-bold">{item.val}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="pt-8 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Confidence</p>
                      <p className="text-5xl font-display text-emerald-600 dark:text-emerald-400 leading-none">94.2%</p>
                    </div>
                    <Link href="/dashboard" className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all shadow-xl inline-flex items-center gap-2 text-sm font-bold">
                      Get Started
                      <ArrowRight className="w-6 h-6" />
                    </Link>
                  </motion.div>
                </div>
              </ProductWindow>
            </div>
          </div>
        </section>

        {/* The Action Layer - Dark Focused Bento */}
        <section className="bg-slate-900 dark:bg-[#020617] py-40 border-y border-slate-800 transition-colors duration-500">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 mb-24 items-end">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                >
                  <h2 className="font-display text-5xl md:text-7xl text-white mb-8 leading-[0.9]">
                    Take action <br />
                    <span className="text-emerald-400 italic">in minutes.</span>
                  </h2>
                  <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                    ClearMoney not only shows insights, it lines up practical next
                    steps you can review and approve in one place.
                  </p>
                </motion.div>
              </div>
              <div className="flex justify-end">
                <Link href="/dashboard/war-room" className="group px-8 py-4 rounded-2xl bg-white text-slate-950 font-bold text-lg hover:bg-emerald-400 transition-all flex items-center gap-3">
                  Review Your Next Steps
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Zap, 
                  title: "Suggested Actions", 
                  desc: "Get concrete recommendations for transfers, rebalancing, and tax moves." 
                },
                { 
                  icon: Lock, 
                  title: "Approval Center", 
                  desc: "Review every recommendation before anything changes in your accounts." 
                },
                { 
                  icon: Fingerprint, 
                  title: "Secure Sign-Off", 
                  desc: "Sensitive actions require device-level verification for extra protection." 
                }
              ].map((f, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all group/card shadow-2xl shadow-black/50">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-emerald-400 mb-8 border border-slate-800 group-hover/card:scale-110 transition-transform">
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-3xl text-white mb-4">{f.title}</h3>
                  <p className="text-slate-500 text-base leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scenario Lab Interactive Animation */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-40">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="order-2 lg:order-1 relative">
              <ProductWindow title="Interactive Scenario Tool">
                <div className="p-8 lg:p-12 space-y-12">
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <span>MARKET DROP</span>
                        <span className="text-rose-500 font-mono">-20%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "100%" }}
                          whileInView={{ width: "25%" }}
                          transition={{ duration: 2, delay: 0.5 }}
                          className="h-full bg-rose-500" 
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        <span>MONTHLY SPENDING</span>
                        <span className="text-emerald-500 font-mono">+$5,000</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: "0%" }}
                          whileInView={{ width: "75%" }}
                          transition={{ duration: 2, delay: 0.5 }}
                          className="h-full bg-emerald-500" 
                        />
                      </div>
                    </div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-center shadow-inner"
                  >
                    <p className="text-xs text-slate-400 uppercase font-black tracking-[0.3em] mb-4">Runway After Changes</p>
                    <div className="flex items-center justify-center gap-3">
                      <p className="text-7xl font-display text-slate-900 dark:text-white leading-none">14.2</p>
                      <p className="text-xl font-display text-slate-400 italic">Months</p>
                    </div>
                  </motion.div>
                </div>
              </ProductWindow>
              
              {/* Floating Badge */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-6 -right-6 p-4 rounded-2xl bg-purple-600 text-white shadow-2xl z-30"
              >
                <Target className="w-6 h-6" />
              </motion.div>
            </div>

            <div className="order-1 lg:order-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-8 border border-purple-200 dark:border-purple-900 shadow-sm">
                  <Target className="w-6 h-6" />
                </div>
                <h2 className="font-display text-5xl md:text-6xl text-slate-900 dark:text-white mb-8 leading-[1.1]">
                  Test what-if <br />
                  <span className="text-purple-600 dark:text-purple-400 italic">scenarios.</span>
                </h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                  Try different market changes and spending plans to see how your
                  runway and risk profile shift before you commit.
                </p>
                <Link href="/dashboard/scenario-lab" className="group text-slate-900 dark:text-white font-bold text-lg flex items-center gap-2 hover:gap-3 transition-all">
                  Try Scenario Tool
                  <ArrowRight className="w-5 h-5 text-emerald-500" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* The Anti-Points Guy Section */}
        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-40 border-t border-slate-200 dark:border-slate-900 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-slate-200 dark:from-slate-800 to-transparent" />
          
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl md:text-8xl font-display text-slate-900 dark:text-white mb-10 leading-[0.9]"
            >
              Advice without <br />
              <span className="text-emerald-600 dark:text-emerald-400 italic">product hype.</span>
            </motion.h2>
            <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 leading-relaxed mb-16 max-w-3xl mx-auto font-medium">
              Most finance sites push products. We focus on what is best for you,
              and we publish clear disclosures so you can judge for yourself.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/transparency" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xl hover:bg-emerald-600 dark:hover:bg-emerald-400 transition-all shadow-2xl">
                See How We Make Money
              </Link>
              <Link href="/blog" className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                Read Our Research
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-950 pt-32 pb-16 border-t border-slate-200 dark:border-slate-900 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-16 mb-24">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <Cpu className="w-8 h-8 text-emerald-600 dark:text-emerald-500" />
                <span className="font-display text-3xl text-slate-900 dark:text-white">ClearMoney</span>
              </div>
              <p className="text-slate-500 text-lg max-w-sm leading-relaxed mb-8">
                Straightforward financial guidance and tools built to help you make
                better money decisions.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-emerald-500 cursor-pointer transition-colors">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-emerald-500 cursor-pointer transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-[0.2em] mb-8">Platform</h4>
              <ul className="space-y-5 text-sm text-slate-500 font-bold">
                <li><Link href="/dashboard" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Dashboard</Link></li>
                <li><Link href="/dashboard/war-room" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Action Center</Link></li>
                <li><Link href="/advisor" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Money Assistant</Link></li>
                <li><Link href="/tools" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-[0.2em] mb-8">Learn</h4>
              <ul className="space-y-5 text-sm text-slate-500 font-bold">
                <li><Link href="/blog" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Latest Research</Link></li>
                <li><Link href="/transparency" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How We Stay Unbiased</Link></li>
                <li><Link href="/methodology" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">How Calculations Work</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-xs text-slate-400 dark:text-slate-600 uppercase font-black tracking-[0.3em]">
              &copy; 2026 ClearMoney Inc &middot; Privacy-first by design
            </p>
            <div className="flex gap-10 text-xs text-slate-400 dark:text-slate-600 uppercase font-black tracking-[0.3em]">
              <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Style for Marquee */}
      <style jsx global>{`
        @keyframes marquee-slow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-slow {
          display: flex;
          animation: marquee-slow 60s linear infinite;
        }
      `}</style>
    </div>
  );
}
