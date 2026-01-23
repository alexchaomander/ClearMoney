"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  TrendingUp,
  Shield,
  Clock,
  PiggyBank,
  Receipt,
  CreditCard,
  FileText,
  Target,
  Heart,
  Building2,
  Percent,
  Brain,
  LineChart,
  Sparkles,
} from "lucide-react";
import { tools as siteTools } from "@/lib/site-config";

// ============================================================================
// AUTONOMOUS-INSPIRED DESIGN — REFINED EDITION
// ============================================================================
// Elevated minimalist wealth advisor aesthetic with:
// - Prominent gradient mesh blobs (Linear/Stripe style)
// - Larger, more impactful typography
// - Premium feel with refined spacing
// - Subtle grain texture for depth
// ============================================================================

// Color palette - sophisticated with vivid accents
const colors = {
  bg: "#fafafa",
  bgAlt: "#ffffff",
  text: "#0a0a0a",
  textMuted: "#525252",
  textLight: "#a3a3a3",
  accent: "#2563eb",
  accentLight: "#3b82f6",
  border: "#e5e5e5",
  borderLight: "#f5f5f5",
  success: "#059669",
  successLight: "#10b981",
  warning: "#ea580c",
  warningLight: "#f97316",
  // Gradient blob colors - more saturated
  blob1: "#3b82f6", // Blue
  blob2: "#8b5cf6", // Purple
  blob3: "#06b6d4", // Cyan
  blob4: "#10b981", // Emerald
  blob5: "#f59e0b", // Amber
};

// Categories with tool counts
const categories = [
  { id: "investing", name: "Investing", icon: TrendingUp, count: 15, description: "Roth strategies, FIRE, backdoor conversions" },
  { id: "taxes", name: "Tax Strategy", icon: Receipt, count: 11, description: "Brackets, RSUs, crypto, estate planning" },
  { id: "credit-cards", name: "Credit Cards", icon: CreditCard, count: 6, description: "Annual fees, points, affiliate-free analysis" },
  { id: "budgeting", name: "Budgeting", icon: PiggyBank, count: 4, description: "Emergency funds, home affordability, goals" },
  { id: "banking", name: "Banking", icon: Building2, count: 3, description: "HYSA, I Bonds, bank bonuses" },
  { id: "debt", name: "Debt", icon: Target, count: 2, description: "Snowball vs avalanche, student loans" },
  { id: "equity", name: "Equity Comp", icon: Percent, count: 1, description: "Stock options, RSU tax planning" },
  { id: "giving", name: "Charitable", icon: Heart, count: 1, description: "Appreciated stock donations" },
];

const TOOL_NAME_ALIASES: Record<string, string> = {
  "Roth vs Traditional": "Roth vs Traditional Calculator",
  "Mega Backdoor Roth": "Mega Backdoor Roth Calculator",
  "529-to-Roth Rollover": "529-to-Roth Rollover Planner",
};

const toolHrefByName = new Map(
  siteTools.map((tool) => [tool.name.toLowerCase(), tool.href])
);

const getToolHref = (name: string) => {
  const canonical = TOOL_NAME_ALIASES[name] ?? name;
  return toolHrefByName.get(canonical.toLowerCase()) ?? "#";
};

// Featured strategies/tools
const featuredStrategies = [
  {
    title: "Roth vs Traditional",
    description: "Optimize your retirement contributions based on your actual tax situation—not generic rules of thumb.",
    category: "Tax Strategy",
  },
  {
    title: "Strategy Match Finder",
    description: "Map your risk, tax, and behavior profile to strategy archetypes.",
    category: "Investing",
  },
  {
    title: "Mega Backdoor Roth",
    description: "Contribute up to $46,000+ extra to your Roth annually. We show you exactly how.",
    category: "Investing",
  },
  {
    title: "Home Affordability Reality Check",
    description: "What you can actually afford—not what banks want you to believe.",
    category: "Budgeting",
  },
  {
    title: "Tax-Loss Harvesting Analyzer",
    description: "Identify opportunities to offset gains and reduce your tax bill legally.",
    category: "Tax Strategy",
  },
  {
    title: "529-to-Roth Rollover",
    description: "New SECURE 2.0 rules let you convert unused 529 funds to Roth. We do the math.",
    category: "Investing",
  },
  {
    title: "FIRE Calculator",
    description: "Calculate your exact path to financial independence with personalized projections.",
    category: "Investing",
  },
  {
    title: "Rebalance vs Drift Calculator",
    description: "Quantify when drift becomes riskier than rebalancing costs.",
    category: "Investing",
  },
];

// FAQ items
const faqItems = [
  {
    question: "How is ClearMoney different from NerdWallet or The Points Guy?",
    answer: "Those sites make money from affiliate commissions—they're incentivized to recommend products that pay them the most, not what's best for you. We don't take affiliate payments. Our tools show you the math, transparently, so you can make your own informed decisions.",
  },
  {
    question: "Is ClearMoney really free?",
    answer: "Yes. All 37+ calculators and tools are completely free with no paywalls. We believe financial literacy shouldn't cost money. We may offer premium features in the future, but our core tools will always be free.",
  },
  {
    question: "How do you make money then?",
    answer: "We're transparent about this: currently we're building the platform and not focused on monetization. When we do monetize, it will never be through biased affiliate recommendations. We'll clearly disclose any revenue sources.",
  },
  {
    question: "Can I trust your calculations?",
    answer: "Unlike other sites that hide behind 'proprietary algorithms,' we publish our methodology. Every formula, every assumption, every data source. You can verify our math yourself—or point out if we got something wrong.",
  },
  {
    question: "Do you provide personalized financial advice?",
    answer: "We provide tools and calculations based on the numbers you input. We're not registered investment advisors and don't provide personalized advice. Think of us as a sophisticated calculator that helps you understand your options—the decisions are yours.",
  },
];

// ============================================================================
// GRADIENT BLOB COMPONENT — More visible, more dynamic
// ============================================================================

function GradientBlob({
  color,
  size = 600,
  top,
  left,
  right,
  bottom,
  opacity = 0.4,
  blur = 80,
  animate = false,
  delay = 0,
}: {
  color: string;
  size?: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  opacity?: number;
  blur?: number;
  animate?: boolean;
  delay?: number;
}) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${animate ? "animate-blob" : ""}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at center, ${color} 0%, ${color}80 25%, ${color}40 50%, transparent 70%)`,
        top,
        left,
        right,
        bottom,
        opacity,
        filter: `blur(${blur}px)`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

// ============================================================================
// NAVIGATION
// ============================================================================

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_0_0_rgba(0,0,0,0.05)]"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`,
                boxShadow: `0 4px 14px ${colors.accent}40`
              }}
            >
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
              ClearMoney
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {["Tools", "Methodology", "About"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-base font-medium transition-colors duration-200 hover:text-black"
                style={{ color: colors.textMuted }}
              >
                {item}
              </Link>
            ))}
            <Link
              href="/designs/design-11-autonomous/onboarding"
              className="px-5 py-2.5 text-base font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                color: "white",
                boxShadow: `0 4px 14px ${colors.accent}30`
              }}
            >
              Start Free
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

// ============================================================================
// HERO SECTION — Dramatic gradient blobs, larger type
// ============================================================================

function HeroSection() {
  return (
    <section
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Prominent gradient blobs */}
      <GradientBlob
        color={colors.blob1}
        size={800}
        top="-20%"
        right="-10%"
        opacity={0.35}
        blur={100}
        animate
        delay={0}
      />
      <GradientBlob
        color={colors.blob2}
        size={700}
        top="20%"
        left="-15%"
        opacity={0.3}
        blur={90}
        animate
        delay={-7}
      />
      <GradientBlob
        color={colors.blob3}
        size={500}
        bottom="0%"
        right="25%"
        opacity={0.25}
        blur={80}
        animate
        delay={-14}
      />
      <GradientBlob
        color={colors.blob4}
        size={400}
        bottom="20%"
        left="10%"
        opacity={0.2}
        blur={70}
        animate
        delay={-3}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 py-32 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-medium mb-10 backdrop-blur-sm"
          style={{
            backgroundColor: "rgba(255,255,255,0.8)",
            color: colors.text,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
          }}
        >
          <Sparkles className="w-4 h-4" style={{ color: colors.accent }} />
          37+ Free Financial Decision Tools
        </div>

        {/* Main headline — Much larger */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] mb-8"
          style={{ color: colors.text }}
        >
          Fire your financial
          <br />
          advisor.{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 50%, ${colors.blob3} 100%)`
            }}
          >
            Become clear.
          </span>
        </h1>

        {/* Subheadline — Larger, more readable */}
        <p
          className="text-xl sm:text-2xl max-w-3xl mx-auto mb-12 leading-relaxed"
          style={{ color: colors.textMuted }}
        >
          The wealth strategies used by the ultra-wealthy aren&apos;t secret—they&apos;re just
          buried under affiliate-driven content and paywalled advice.
          <span className="font-semibold" style={{ color: colors.text }}>
            {" "}We surface them for free.
          </span>
        </p>

        {/* CTA Buttons — Larger, more prominent */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/designs/design-11-autonomous/onboarding"
            className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
              color: "white",
              boxShadow: `0 8px 30px ${colors.accent}35`
            }}
          >
            Start Your Financial Clarity
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="#tools"
            className="inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:bg-black/5"
            style={{ color: colors.text }}
          >
            Explore Tools
          </Link>
        </div>

        {/* Trust indicators — Larger */}
        <div className="mt-20 flex flex-wrap items-center justify-center gap-10">
          {[
            { icon: Shield, label: "Zero affiliate bias" },
            { icon: Calculator, label: "37+ free tools" },
            { icon: FileText, label: "Open methodology" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${colors.accent}10` }}
              >
                <item.icon className="w-5 h-5" style={{ color: colors.accent }} />
              </div>
              <span className="text-base font-medium" style={{ color: colors.textMuted }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${colors.bgAlt}, transparent)`
        }}
      />
    </section>
  );
}

// ============================================================================
// PROBLEM SECTION
// ============================================================================

function ProblemSection() {
  return (
    <section className="py-32 relative" style={{ backgroundColor: colors.bgAlt }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8"
            style={{ color: colors.text }}
          >
            Two options, both broken
          </h2>
          <p className="text-xl lg:text-2xl leading-relaxed" style={{ color: colors.textMuted }}>
            Getting your finances right shouldn&apos;t require choosing between expensive mistakes or expensive advisors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* DIY Option */}
          <div
            className="p-10 rounded-3xl transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
              style={{ backgroundColor: `${colors.warning}15`, color: colors.warning }}
            >
              <X className="w-4 h-4" />
              Option A: DIY
            </div>
            <h3
              className="text-2xl lg:text-3xl font-bold mb-6"
              style={{ color: colors.text }}
            >
              Do It Yourself
            </h3>
            <ul className="space-y-4">
              {[
                "Accounts scattered everywhere",
                "Spreadsheets always wrong or outdated",
                "Expensive mistakes (wrong account, bad timing)",
                "SEO content buries the real answers",
                "Affiliate bias everywhere you look",
              ].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <X className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.warning }} />
                  <span className="text-base lg:text-lg" style={{ color: colors.textMuted }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advisor Option */}
          <div
            className="p-10 rounded-3xl transition-all duration-300 hover:shadow-lg"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`
            }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
              style={{ backgroundColor: `${colors.warning}15`, color: colors.warning }}
            >
              <X className="w-4 h-4" />
              Option B: Hire an Advisor
            </div>
            <h3
              className="text-2xl lg:text-3xl font-bold mb-6"
              style={{ color: colors.text }}
            >
              Traditional Wealth Manager
            </h3>
            <ul className="space-y-4">
              {[
                "1-2% of assets annually in fees",
                "Over 30 years, that's 30-40% of your wealth",
                "Quarterly meetings, not 24/7 access",
                "Cookie-cutter portfolios for most clients",
                "Misaligned incentives (AUM-based fees)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <X className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: colors.warning }} />
                  <span className="text-base lg:text-lg" style={{ color: colors.textMuted }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// PERSONAL WEALTH ADVISOR SECTION
// ============================================================================

function PersonalWealthAdvisorSection() {
  return (
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Gradient blobs */}
      <GradientBlob
        color={colors.blob1}
        size={700}
        top="-10%"
        right="-5%"
        opacity={0.3}
        blur={100}
        animate
        delay={-2}
      />
      <GradientBlob
        color={colors.blob2}
        size={500}
        bottom="10%"
        left="-10%"
        opacity={0.25}
        blur={90}
        animate
        delay={-8}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
              style={{ backgroundColor: `${colors.accent}15`, color: colors.accent }}
            >
              <Sparkles className="w-4 h-4" />
              Personal Wealth Advisor
            </div>
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8"
              style={{ color: colors.text }}
            >
              Your finances.
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`
                }}
              >
                Crystal clear.
              </span>
            </h2>
            <p className="text-xl lg:text-2xl leading-relaxed mb-10" style={{ color: colors.textMuted }}>
              Tell us about your financial situation once. Get personalized recommendations
              that actually make sense for{" "}
              <span className="font-semibold" style={{ color: colors.text }}>your</span> life,
              updated as your circumstances change.
            </p>

            <ul className="space-y-5 mb-10">
              {[
                "Prioritized action items based on your actual numbers",
                "See exactly how much each decision impacts you",
                "No cookie-cutter advice — everything is personalized",
                "Track your progress toward financial independence",
              ].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: `${colors.success}15` }}
                  >
                    <Check className="w-4 h-4" style={{ color: colors.success }} />
                  </div>
                  <span className="text-lg" style={{ color: colors.textMuted }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/designs/design-11-autonomous/onboarding"
              className="group inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                color: "white",
                boxShadow: `0 8px 30px ${colors.accent}35`
              }}
            >
              Start Your Financial Clarity
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Right side - Visual preview */}
          <div
            className="relative p-8 rounded-3xl"
            style={{
              backgroundColor: colors.bgAlt,
              border: `1px solid ${colors.border}`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.08)"
            }}
          >
            {/* Mock dashboard preview */}
            <div className="mb-8">
              <p className="text-sm font-medium mb-2" style={{ color: colors.textLight }}>
                Your Financial Health Score
              </p>
              <div className="flex items-end gap-4">
                <span className="text-6xl font-bold" style={{ color: colors.text }}>72</span>
                <span className="text-2xl font-medium mb-2" style={{ color: colors.textLight }}>/100</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>Net Worth</span>
                  <span className="text-lg font-bold" style={{ color: colors.success }}>$87,400</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: colors.border }}>
                  <div
                    className="h-2 rounded-full"
                    style={{ width: "45%", backgroundColor: colors.success }}
                  />
                </div>
              </div>

              <div
                className="p-4 rounded-xl"
                style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.text }}>Savings Rate</span>
                  <span className="text-lg font-bold" style={{ color: colors.accent }}>22%</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ backgroundColor: colors.border }}>
                  <div
                    className="h-2 rounded-full"
                    style={{ width: "73%", backgroundColor: colors.accent }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold" style={{ color: colors.text }}>
                Top Recommendations
              </p>
              {[
                { title: "Max your 401k match", impact: "+$3,600/yr" },
                { title: "Build emergency fund", impact: "1.8 more months" },
                { title: "Open Mega Backdoor Roth", impact: "+$23K tax-free" },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: colors.bg }}
                >
                  <span className="text-sm" style={{ color: colors.textMuted }}>{item.title}</span>
                  <span className="text-sm font-semibold" style={{ color: colors.success }}>{item.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// SOLUTION SECTION
// ============================================================================

function SolutionSection() {
  return (
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: colors.bgAlt }}>
      {/* Gradient blobs */}
      <GradientBlob
        color={colors.blob4}
        size={600}
        top="10%"
        right="-10%"
        opacity={0.25}
        blur={100}
      />
      <GradientBlob
        color={colors.blob1}
        size={500}
        bottom="5%"
        left="-10%"
        opacity={0.2}
        blur={90}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-8"
            style={{ backgroundColor: `${colors.success}15`, color: colors.success }}
          >
            <Check className="w-4 h-4" />
            A Better Way
          </div>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8"
            style={{ color: colors.text }}
          >
            Tools that respect your intelligence
          </h2>
          <p className="text-xl lg:text-2xl leading-relaxed" style={{ color: colors.textMuted }}>
            Plug in your numbers. Get an honest answer. No affiliate-driven recommendations.
            <span className="font-semibold" style={{ color: colors.text }}> Just math.</span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Calculator,
              title: "37+ Decision Tools",
              description: "Every major financial decision has a calculator. Roth conversions, FIRE planning, debt payoff, home affordability—all free.",
            },
            {
              icon: Shield,
              title: "Zero Affiliate Bias",
              description: "We don't take payments from banks or card issuers. Our recommendations are based on math, not who pays us the most.",
            },
            {
              icon: FileText,
              title: "Open Methodology",
              description: "Every formula published. Every assumption documented. You can verify our math—or tell us if we're wrong.",
            },
            {
              icon: Clock,
              title: "Answers in Seconds",
              description: "No 3,000-word articles for simple questions. Input your numbers, get your answer. Tools first, content second.",
            },
            {
              icon: Brain,
              title: "Actually Useful",
              description: "Strategies used by the wealthy: backdoor Roths, tax-loss harvesting, mega backdoor conversions. Explained simply.",
            },
            {
              icon: LineChart,
              title: "Conservative & Honest",
              description: "We don't inflate point valuations to push cards. Our projections use realistic assumptions, not best-case fantasies.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="group p-8 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: colors.bgAlt,
                border: `1px solid ${colors.border}`
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.blob2}15 100%)`
                }}
              >
                <item.icon className="w-7 h-7" style={{ color: colors.accent }} />
              </div>
              <h3
                className="text-xl lg:text-2xl font-bold mb-3"
                style={{ color: colors.text }}
              >
                {item.title}
              </h3>
              <p className="text-base lg:text-lg leading-relaxed" style={{ color: colors.textMuted }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FEE CALCULATOR
// ============================================================================

function FeeCalculator() {
  const [assets, setAssets] = useState(500000);
  const [years, setYears] = useState(20);
  const advisorFee = 0.01;
  const growthRate = 0.07;

  const wealthWithFees = assets * Math.pow(1 + growthRate - advisorFee, years);
  const wealthWithoutFees = assets * Math.pow(1 + growthRate, years);
  const costOfFees = wealthWithoutFees - wealthWithFees;
  const percentLost = (costOfFees / wealthWithoutFees) * 100;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

  return (
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: colors.bgAlt }}>
      {/* Subtle gradient accent */}
      <GradientBlob
        color={colors.blob5}
        size={500}
        top="30%"
        right="5%"
        opacity={0.15}
        blur={100}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            style={{ color: colors.text }}
          >
            The true cost of 1% fees
          </h2>
          <p className="text-xl lg:text-2xl" style={{ color: colors.textMuted }}>
            That &quot;small&quot; 1% annual fee compounds into a fortune over time.
          </p>
        </div>

        <div
          className="p-10 lg:p-12 rounded-3xl"
          style={{
            backgroundColor: colors.bg,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 4px 40px rgba(0,0,0,0.03)"
          }}
        >
          {/* Sliders */}
          <div className="grid sm:grid-cols-2 gap-10 mb-10">
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: colors.text }}>
                Starting Portfolio: <span style={{ color: colors.accent }}>{formatCurrency(assets)}</span>
              </label>
              <input
                type="range"
                min={100000}
                max={2000000}
                step={50000}
                value={assets}
                onChange={(e) => setAssets(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{ backgroundColor: colors.border }}
              />
              <div className="flex justify-between text-sm mt-2" style={{ color: colors.textLight }}>
                <span>$100K</span>
                <span>$2M</span>
              </div>
            </div>
            <div>
              <label className="block text-lg font-semibold mb-4" style={{ color: colors.text }}>
                Investment Horizon: <span style={{ color: colors.accent }}>{years} years</span>
              </label>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer"
                style={{ backgroundColor: colors.border }}
              />
              <div className="flex justify-between text-sm mt-2" style={{ color: colors.textLight }}>
                <span>5 years</span>
                <span>40 years</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div
            className="p-8 rounded-2xl mb-8"
            style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
          >
            <div className="grid sm:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-base mb-2" style={{ color: colors.textMuted }}>
                  With 1% advisor fee
                </p>
                <p className="text-3xl lg:text-4xl font-bold" style={{ color: colors.text }}>
                  {formatCurrency(wealthWithFees)}
                </p>
              </div>
              <div>
                <p className="text-base mb-2" style={{ color: colors.textMuted }}>
                  Without fees
                </p>
                <p className="text-3xl lg:text-4xl font-bold" style={{ color: colors.success }}>
                  {formatCurrency(wealthWithoutFees)}
                </p>
              </div>
              <div>
                <p className="text-base mb-2" style={{ color: colors.textMuted }}>
                  Cost of fees
                </p>
                <p className="text-3xl lg:text-4xl font-bold" style={{ color: colors.warning }}>
                  {formatCurrency(costOfFees)}
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-lg" style={{ color: colors.textMuted }}>
            That 1% fee costs you{" "}
            <span className="font-bold" style={{ color: colors.warning }}>
              {percentLost.toFixed(1)}%
            </span>{" "}
            of your potential wealth over {years} years.
            <br />
            <span className="text-base" style={{ color: colors.textLight }}>
              Assumes 7% annual returns. Your results may vary.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TOOLS SECTION
// ============================================================================

function ToolsSection() {
  return (
    <section id="tools" className="py-32 relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Gradient blobs */}
      <GradientBlob
        color={colors.blob2}
        size={600}
        top="-5%"
        left="5%"
        opacity={0.2}
        blur={100}
      />
      <GradientBlob
        color={colors.blob3}
        size={500}
        bottom="10%"
        right="-5%"
        opacity={0.18}
        blur={90}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            style={{ color: colors.text }}
          >
            Every tool you need
          </h2>
          <p className="text-xl lg:text-2xl max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
            37+ calculators across 8 categories. All free. All transparent.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`#${category.id}`}
              className="group p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                backgroundColor: colors.bgAlt,
                border: `1px solid ${colors.border}`
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.blob2}15 100%)` }}
                >
                  <category.icon className="w-6 h-6" style={{ color: colors.accent }} />
                </div>
                <span
                  className="text-sm font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: colors.bg, color: colors.textMuted }}
                >
                  {category.count} tools
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: colors.text }}>
                {category.name}
              </h3>
              <p className="text-base" style={{ color: colors.textLight }}>
                {category.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Featured strategies */}
        <div className="mb-10">
          <h3
            className="text-2xl lg:text-3xl font-bold mb-8"
            style={{ color: colors.text }}
          >
            Popular strategies
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredStrategies.map((strategy) => (
              <Link
                key={strategy.title}
                href={getToolHref(strategy.title)}
                className="group p-6 rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  backgroundColor: colors.bgAlt,
                  border: `1px solid ${colors.border}`
                }}
              >
                <p className="text-sm font-semibold mb-3" style={{ color: colors.accent }}>
                  {strategy.category}
                </p>
                <h4
                  className="text-lg font-bold mb-3 group-hover:underline"
                  style={{ color: colors.text }}
                >
                  {strategy.title}
                </h4>
                <p className="text-base" style={{ color: colors.textMuted }}>
                  {strategy.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-lg font-semibold transition-all duration-200 hover:gap-3"
            style={{ color: colors.accent }}
          >
            View all 37+ tools
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FAQ SECTION
// ============================================================================

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-32" style={{ backgroundColor: colors.bgAlt }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            style={{ color: colors.text }}
          >
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                boxShadow: openIndex === index ? "0 4px 20px rgba(0,0,0,0.05)" : "none"
              }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 lg:p-8 text-left"
              >
                <span className="text-lg lg:text-xl font-semibold pr-4" style={{ color: colors.text }}>
                  {item.question}
                </span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                  style={{ backgroundColor: openIndex === index ? `${colors.accent}15` : colors.borderLight }}
                >
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" style={{ color: colors.accent }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: colors.textMuted }} />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                  <p className="text-base lg:text-lg leading-relaxed" style={{ color: colors.textMuted }}>
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// NEWSLETTER SECTION
// ============================================================================

function NewsletterSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-32 relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Gradient blob */}
      <GradientBlob
        color={colors.blob1}
        size={700}
        top="50%"
        left="50%"
        opacity={0.15}
        blur={120}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
          style={{ color: colors.text }}
        >
          Get tools, not fluff
        </h2>
        <p className="text-xl lg:text-2xl mb-10" style={{ color: colors.textMuted }}>
          New calculator launches, methodology updates, and honest takes on financial products. Weekly max.
        </p>

        <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 px-6 py-4 rounded-xl text-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
            style={{
              backgroundColor: colors.bgAlt,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
          <button
            type="submit"
            className="px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            style={{
              background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
              color: "white",
              boxShadow: `0 4px 14px ${colors.accent}30`
            }}
          >
            Subscribe
          </button>
        </form>

        <p className="mt-6 text-sm" style={{ color: colors.textLight }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  return (
    <footer
      className="py-20"
      style={{ backgroundColor: colors.bgAlt, borderTop: `1px solid ${colors.border}` }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`
                }}
              >
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
                ClearMoney
              </span>
            </Link>
            <p className="text-base max-w-sm mb-4 leading-relaxed" style={{ color: colors.textMuted }}>
              Financial clarity for everyone. No affiliate bias. No paywalls.
              Just honest tools and transparent methodology.
            </p>
            <p className="text-sm font-medium" style={{ color: colors.textLight }}>
              Built with conviction, not VC pressure.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-lg font-bold mb-5" style={{ color: colors.text }}>
              Tools
            </h4>
            <ul className="space-y-3">
              {["Investing", "Taxes", "Credit Cards", "Budgeting"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-base transition-colors duration-200 hover:text-black"
                    style={{ color: colors.textMuted }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-5" style={{ color: colors.text }}>
              Company
            </h4>
            <ul className="space-y-3">
              {["Methodology", "About", "Privacy", "Terms"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-base transition-colors duration-200 hover:text-black"
                    style={{ color: colors.textMuted }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="pt-10 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <p className="text-sm" style={{ color: colors.textLight }}>
            &copy; {new Date().getFullYear()} ClearMoney. All rights reserved.
          </p>
          <p className="text-sm" style={{ color: colors.textLight }}>
            Not financial advice. We provide tools, you make decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AutonomousInspiredPage() {
  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Blob animation - slower, more subtle */
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 25s ease-in-out infinite;
        }

        /* Custom range slider */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }

        input[type="range"]::-webkit-slider-track {
          height: 8px;
          background: ${colors.border};
          border-radius: 9999px;
        }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%);
          border-radius: 50%;
          margin-top: -8px;
          box-shadow: 0 2px 8px ${colors.accent}40;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        input[type="range"]::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px ${colors.accent}50;
        }

        input[type="range"]::-moz-range-track {
          height: 8px;
          background: ${colors.border};
          border-radius: 9999px;
        }

        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%);
          border-radius: 50%;
          border: none;
          box-shadow: 0 2px 8px ${colors.accent}40;
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }

        /* Selection */
        ::selection {
          background: ${colors.accent}30;
          color: ${colors.text};
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <Navigation />
        <HeroSection />
        <ProblemSection />
        <PersonalWealthAdvisorSection />
        <SolutionSection />
        <FeeCalculator />
        <ToolsSection />
        <FAQSection />
        <NewsletterSection />
        <Footer />
      </div>
    </>
  );
}
