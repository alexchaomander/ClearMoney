"use client";

import React, { useState, useMemo } from "react";
import { 
  Sparkles, 
  Rocket, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Bot, 
  Wallet, 
  CheckCircle2,
  Lock,
  Globe,
  Database,
  Info,
  ChevronRight,
  Activity,
  ArrowDownRight,
  Fingerprint,
  Layers,
  Search,
  Plus
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  useActionIntents, 
  useDownloadIntentManifest,
  useUpdateActionIntent,
  useExportFinancialPassport 
} from "@/lib/strata/hooks";
import { ActionIntent } from "@clearmoney/strata-sdk";

interface MockIntent {
  id: string;
  title: string;
  description: string;
  impact: string;
  status: string;
  icon: any;
  type: string;
  isReal?: boolean;
  logic: {
    rule: string;
    reasoning: string;
    dataPoints: Record<string, string>;
    steps: string[];
  };
}

const MOCK_INTENTS: MockIntent[] = [
  {
    id: "intent_yield_001",
    title: "Optimize Cash Yield",
    description: "Move $12,450 from Bank of America Checking (0.01%) to Strata-Native HYSA (4.50%).",
    impact: "+$560.25/year",
    status: "DRAFT",
    icon: Zap,
    type: "CASH_OPTIMIZATION",
    logic: {
      rule: "Yield Threshold > 3.0%",
      reasoning: "Current liquidity in low-yield checking exceeds 3-month burn buffer by $12,450. Relocating to a High-Yield Savings Account (HYSA) provides risk-free arbitrage.",
      dataPoints: {
        "Source Rate": "0.01% APY",
        "Target Rate": "4.50% APY",
        "Excess Liquidity": "$12,450",
        "Burn Buffer": "$24,000 (3 mo)"
      },
      steps: [
        "Initiate ACH Pull from BoA Checking ending in *4592",
        "Establish internal ledger entry for User Cash Vault",
        "Generate daily interest accrual event"
      ]
    }
  },
  {
    id: "intent_tax_002",
    title: "Commingling Reconciliation",
    description: "Reconcile $4,210 in 'Personal Spend on Business Credit' to preserve the corporate veil.",
    impact: "Legal Compliance",
    status: "DRAFT",
    icon: ShieldCheck,
    type: "COMPLIANCE",
    logic: {
      rule: "Corporate Veil Integrity Check",
      reasoning: "Detected 12 transactions on Mercury Visa (Business) categorized as 'Personal/Home'. To maintain limited liability, these must be treated as a shareholder distribution or reimbursed.",
      dataPoints: {
        "Affected Entity": "ClearMoney Inc.",
        "Total Breach": "$4,210.50",
        "Audit Risk": "High",
        "Recommended Action": "Shareholder Reimbursement"
      },
      steps: [
        "Flag 12 transactions as 'Reimbursed'",
        "Generate Corporate Resolution PDF",
        "Initiate $4,210.50 transfer from Personal to Business"
      ]
    }
  },
  {
    id: "intent_rebalance_003",
    title: "Portfolio Rebalance",
    description: "Your equity exposure is at 82%. Rebalance to your 75% target by shifting to Bond ETFs.",
    impact: "Risk Reduction",
    status: "DRAFT",
    icon: Rocket,
    type: "REBALANCE",
    logic: {
      rule: "Drift Tolerance > 5%",
      reasoning: "Market appreciation in NVDA and AAPL has caused equity drift beyond the 75% target. Harvesting gains now locks in returns and returns the risk profile to 'Moderate'.",
      dataPoints: {
        "Target Allocation": "75% Equity",
        "Current Allocation": "82.4% Equity",
        "Drift Delta": "+7.4%",
        "Estimated Tax Impact": "$420.00"
      },
      steps: [
        "Sell $8,200 of VTI (Vanguard Total Stock)",
        "Buy $8,200 of BND (Vanguard Total Bond)",
        "Update Portfolio Context Graph"
      ]
    }
  }
];

export default function ActionLabPage() {
  const [activeIntent, setActiveIntent] = useState<MockIntent | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Real Data Integration
  const { data: realIntents, isLoading: isLoadingIntents } = useActionIntents();
  const downloadManifest = useDownloadIntentManifest();
  const updateIntent = useUpdateActionIntent();
  const exportPassport = useExportFinancialPassport();

  const allIntents = useMemo(() => {
    const formattedReal: MockIntent[] = (realIntents || []).map(ri => ({
      id: ri.id,
      title: ri.title,
      description: ri.description || "",
      impact: Object.values(ri.impact_summary)[0]?.toString() || "Calculating...",
      status: ri.status.toUpperCase(),
      icon: ri.intent_type === 'ach_transfer' ? Zap : ri.intent_type === 'rebalance' ? Rocket : Bot,
      type: ri.intent_type,
      isReal: true,
      logic: {
        rule: "Strata Intent v1",
        reasoning: ri.description || "Autonomous recommendation based on current data surface.",
        dataPoints: Object.entries(ri.payload).reduce((acc, [k, v]) => ({ ...acc, [k]: v?.toString() }), {}),
        steps: ["Draft Manifest", "Review Details", "Biometric Confirmation"]
      }
    }));

    return [...formattedReal, ...MOCK_INTENTS];
  }, [realIntents]);

  const handleExecute = async () => {
    if (!activeIntent) return;
    
    setIsExecuting(true);
    
    if (activeIntent.isReal) {
      // For real intents, actually download the PDF Switch Kit
      try {
        await downloadManifest.mutateAsync(activeIntent.id);
        await updateIntent.mutateAsync({ 
          id: activeIntent.id, 
          data: { status: 'pending_approval' } 
        });
      } catch (err) {
        console.error("Failed to execute real intent:", err);
      }
    }

    setTimeout(() => {
      setIsExecuting(false);
      setActiveIntent(null);
      // Trigger waitlist focus
      const el = document.getElementById("waitlist-section");
      el?.scrollIntoView({ behavior: "smooth" });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: "radial-gradient(circle at 50% -20%, rgba(16, 185, 129, 0.2) 0%, transparent 70%)",
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      </div>

      <DashboardHeader />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-4"
            >
              <Activity className="w-3 h-3" />
              Strata Autonomous Action Layer (SAL)
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif text-white mb-4"
            >
              The <span className="text-emerald-400 italic">Action Lab</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-neutral-400 leading-relaxed"
            >
              Experience Era 3 of Strata. Below are live "Action Intents" drafted by your agent based on your current data surface. 
              Review the logic, see the math, and join the waitlist for autonomous execution.
            </motion.p>
          </div>

          <div className="flex items-center gap-4 bg-neutral-900/50 border border-neutral-800 p-4 rounded-2xl">
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Agent Status</p>
              <p className="text-sm font-medium text-emerald-400 flex items-center gap-2 justify-end">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Active Optimization
              </p>
            </div>
            <div className="w-px h-8 bg-neutral-800" />
            <div className="text-right">
              <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Drafted Intents</p>
              <p className="text-sm font-medium text-white">3 Pending</p>
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-24">
          {isLoadingIntents ? (
            <div className="col-span-3 py-20 text-center text-neutral-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
              Loading your data surface...
            </div>
          ) : (
            allIntents.map((intent, i) => (
              <motion.div
                key={intent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-b from-emerald-500/20 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-500" />
                <div className="relative p-6 rounded-2xl bg-neutral-900 border border-neutral-800 group-hover:border-emerald-500/50 transition-all flex flex-col h-full">
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-xl bg-neutral-800 text-emerald-400 group-hover:scale-110 transition-transform">
                      <intent.icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-neutral-800 text-emerald-400 border border-emerald-900">
                        {intent.status}
                      </span>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-tighter">
                        {intent.isReal ? "REAL INTENT" : `MOCK ID: ${intent.id}`}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif text-white mb-2">{intent.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed mb-6 flex-grow">
                    {intent.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-neutral-800">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-neutral-500 uppercase font-bold tracking-wider">Est. Impact</span>
                      <span className="text-emerald-400 font-bold">{intent.impact}</span>
                    </div>
                    <button
                      onClick={() => setActiveIntent(intent)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-neutral-950 text-xs font-bold hover:bg-emerald-400 transition-colors"
                    >
                      Review Intent
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Feature Teasers */}
        <div className="grid md:grid-cols-2 gap-12 mb-32">
          <div className="space-y-8">
            <h2 className="text-3xl font-serif text-white">The Future is <span className="text-emerald-400">Agent-Native</span></h2>
            <div className="grid gap-6">
              {[
                { icon: Wallet, title: "Programmable Accounts", desc: "Your agent gets a secure Smart Account (Safe) to execute actions instantly without waiting for banking hours." },
                { 
                  icon: Globe, 
                  title: "Financial Data Passports", 
                  desc: "Move your entire financial history and context between any AI agent with a single thumbprint.",
                  action: {
                    label: exportPassport.isPending ? "Generating..." : "Export Passport (FPP v1)",
                    onClick: () => exportPassport.mutate(undefined, {
                      onError: (error) => console.error("Passport export failed:", error)
                    }),
                    disabled: exportPassport.isPending
                  }
                },
                { icon: Fingerprint, title: "Biometric Verification", desc: "No passwords. High-value agent actions are verified via FaceID or TouchID directly on your device." }
              ].map((f, i) => (
                <motion.div 
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-4 p-4 rounded-xl hover:bg-neutral-900/50 transition-colors group/teaser"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-950/50 flex items-center justify-center text-emerald-400 border border-emerald-900/50">
                    <f.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-neutral-200">{f.title}</h4>
                    <p className="text-sm text-neutral-400 mt-1 leading-relaxed">{f.desc}</p>
                    {f.action && (
                      <button
                        onClick={f.onClick}
                        disabled={f.disabled}
                        className="mt-3 text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {f.label}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-900 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
            <div className="relative h-full rounded-3xl bg-neutral-900 border border-neutral-800 p-8 flex flex-col justify-center">
              <div className="p-3 rounded-full bg-emerald-900/20 text-emerald-400 w-fit mb-8">
                <Bot className="w-10 h-10" />
              </div>
              <p className="text-2xl font-serif text-neutral-200 leading-snug mb-8">
                "I stopped managing my money and started <span className="text-emerald-400">managing my agent</span>. ClearMoney doesn't just show me a graph; it shows me an exit strategy for my legacy high-fee accounts."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-emerald-900" />
                <div>
                  <div className="font-medium">Justin Chen</div>
                  <div className="text-xs text-neutral-500">Early Beta Tester · Stealth Fintech Founder</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Waitlist Section */}
        <div id="waitlist-section" className="max-w-2xl mx-auto text-center py-20 border-t border-neutral-900">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="inline-flex rounded-full bg-emerald-900/20 text-emerald-400 px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-6">
                  Join the Era 2 Waitlist
                </div>
                <h2 className="text-4xl font-serif mb-6 text-white">Ready for <span className="italic">One-Click</span> Autonomy?</h2>
                <p className="text-neutral-400 mb-10 leading-relaxed text-lg">
                  We are building the Action Layer in the open. Join our early access list to help shape the roadmap. 
                  Tell us which actions you want your agent to handle first.
                </p>
                {/* TODO: Replace YOUR_GOOGLE_FORM_ID and field IDs with real production values before beta launch */}
                <form 
                  action="https://docs.google.com/forms/d/e/YOUR_GOOGLE_FORM_ID/formResponse" 
                  method="POST"
                  target="_blank"
                  onSubmit={(e) => {
                    if (!email) {
                      e.preventDefault();
                    } else {
                      setIsSubmitted(true);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-emerald-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                    <input
                      type="email"
                      name="emailAddress" // Map this to your Google Form's email field entry ID
                      placeholder="Enter your email"
                      required
                      className="relative w-full px-6 py-4 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-lg"
                    />
                  </div>
                  
                  <div className="relative group">
                    <textarea
                      name="entry.YOUR_FEEDBACK_FIELD_ID" // Map this to your Google Form's textarea field entry ID
                      placeholder="What would you like to see from this product direction? (Optional)"
                      rows={3}
                      className="w-full px-6 py-4 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-12 py-4 rounded-xl bg-white text-neutral-950 font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 mx-auto"
                  >
                    Get Early Access
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-neutral-600 mt-6 uppercase tracking-[0.2em]">
                  Your feedback directly influences our Era 2 deployment priority.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-12 rounded-3xl bg-emerald-950/20 border border-emerald-800/50"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-900/40 flex items-center justify-center mx-auto mb-8 text-emerald-400">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-serif mb-4 text-white">You're in.</h2>
                <p className="text-neutral-400 text-lg">
                  We'll notify you when the first **Action Intents** are ready for your data surface. 
                  Welcome to the future of sovereign finance.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Action Intent Review Drawer */}
      <AnimatePresence>
        {activeIntent && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isExecuting && setActiveIntent(null)}
              className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm cursor-zoom-out"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-[70] w-full max-w-2xl bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Action Intent Review</span>
                    <div className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span className="text-[10px] font-mono text-neutral-500">{activeIntent.id}</span>
                  </div>
                  <h2 className="text-2xl font-serif text-white">{activeIntent.title}</h2>
                </div>
                <button
                  disabled={isExecuting}
                  onClick={() => setActiveIntent(null)}
                  className="p-2 rounded-lg hover:bg-neutral-900 text-neutral-500 hover:text-white transition-colors disabled:opacity-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-8 space-y-8">
                {/* Reasoning Section */}
                <section>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">
                    <Bot className="w-3 h-3" />
                    Agent Reasoning
                  </div>
                  <div className="p-6 rounded-2xl bg-neutral-900 border border-neutral-800">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-900">
                        {activeIntent.logic.rule}
                      </div>
                      <div className="text-[10px] text-neutral-500">Deterministic Confidence: 99.8%</div>
                    </div>
                    <p className="text-neutral-300 leading-relaxed italic">
                      "{activeIntent.logic.reasoning}"
                    </p>
                  </div>
                </section>

                {/* Data Surface Section */}
                <section>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">
                    <Database className="w-3 h-3" />
                    Data Surface Inputs
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(activeIntent.logic.dataPoints).map(([k, v]) => (
                      <div key={k} className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/50">
                        <div className="text-[10px] text-neutral-500 mb-1">{k}</div>
                        <div className="text-sm font-medium text-white">{v}</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Execution Plan Section */}
                <section>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-4">
                    <Layers className="w-3 h-3" />
                    Planned Execution Steps
                  </div>
                  <div className="space-y-3">
                    {activeIntent.logic.steps.map((step, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-neutral-900/30 border border-neutral-800/30">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400">
                          {i + 1}
                        </div>
                        <div className="text-sm text-neutral-300">{step}</div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Action Footer */}
              <div className="p-8 border-t border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 font-bold">Total Est. Annual Impact</div>
                    <div className="text-2xl font-bold text-emerald-400">{activeIntent.impact}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-neutral-500 uppercase tracking-widest mb-1 font-bold">Status</div>
                    <div className="flex items-center gap-2 text-sm text-amber-400 font-bold">
                      <Lock className="w-3 h-3" />
                      Locked for Beta
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={handleExecute}
                  disabled={isExecuting}
                  className={cn(
                    "w-full py-5 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-3 relative overflow-hidden",
                    isExecuting 
                      ? "bg-neutral-800 text-neutral-500 cursor-wait" 
                      : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/20"
                  )}
                >
                  {isExecuting ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <RefreshCw className="w-5 h-5" />
                      </motion.div>
                      Processing on Ledger...
                    </>
                  ) : (
                    <>
                      Execute Action Intent
                      <Fingerprint className="w-5 h-5" />
                    </>
                  )}
                  {isExecuting && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-emerald-400"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5 }}
                    />
                  )}
                </button>
                <p className="text-center text-[10px] text-neutral-600 mt-4 uppercase tracking-widest font-bold">
                  Requires Biometric Confirmation
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const RefreshCw = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
