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
  DollarSign,
  PiggyBank,
  Receipt,
  CreditCard,
  FileText,
  Target,
  Heart,
  Building2,
  Percent,
  BarChart3,
  Zap,
  Brain,
  LineChart,
} from "lucide-react";

// ============================================================================
// AUTONOMOUS-INSPIRED DESIGN
// ============================================================================
// Clean, minimalist wealth advisor aesthetic
// - Light gray background (#f5f5f5)
// - Large, bold sans-serif headlines
// - Generous whitespace and breathing room
// - Sophisticated yet approachable
// - Interactive fee calculator
// - FAQ accordion sections
// ============================================================================

// Color palette - minimal, sophisticated
const colors = {
  bg: "#f5f5f5",
  bgAlt: "#ffffff",
  text: "#1a1a1a",
  textMuted: "#666666",
  textLight: "#999999",
  accent: "#0066ff",
  accentHover: "#0052cc",
  border: "#e5e5e5",
  success: "#00a86b",
  warning: "#ff6b35",
  // Gradient blob colors
  blob1: "#0066ff",
  blob2: "#8b5cf6",
  blob3: "#06b6d4",
  blob4: "#10b981",
};

// ============================================================================
// GRADIENT BLOB COMPONENT
// ============================================================================
// Soft, blurred gradient shapes for visual depth (Linear/Stripe style)

function GradientBlob({
  color,
  size = 400,
  top,
  left,
  right,
  bottom,
  opacity = 0.3,
  blur = 80,
  animate = false,
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
}) {
  return (
    <div
      className={`absolute rounded-full pointer-events-none ${animate ? "animate-blob" : ""}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        top,
        left,
        right,
        bottom,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

// Categories with tool counts
const categories = [
  { id: "investing", name: "Investing", icon: TrendingUp, count: 12, description: "Roth strategies, FIRE, backdoor conversions" },
  { id: "taxes", name: "Tax Strategy", icon: Receipt, count: 10, description: "Brackets, RSUs, crypto, estate planning" },
  { id: "credit-cards", name: "Credit Cards", icon: CreditCard, count: 6, description: "Annual fees, points, affiliate-free analysis" },
  { id: "budgeting", name: "Budgeting", icon: PiggyBank, count: 4, description: "Emergency funds, home affordability, goals" },
  { id: "banking", name: "Banking", icon: Building2, count: 3, description: "HYSA, I Bonds, bank bonuses" },
  { id: "debt", name: "Debt", icon: Target, count: 2, description: "Snowball vs avalanche, student loans" },
  { id: "equity", name: "Equity Comp", icon: Percent, count: 1, description: "Stock options, RSU tax planning" },
  { id: "giving", name: "Charitable", icon: Heart, count: 1, description: "Appreciated stock donations" },
];

// Featured strategies/tools
const featuredStrategies = [
  {
    title: "Roth vs Traditional",
    description: "Optimize your retirement contributions based on your actual tax situation—not generic rules of thumb.",
    category: "Tax Strategy",
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
];

// FAQ items
const faqItems = [
  {
    question: "How is ClearMoney different from NerdWallet or The Points Guy?",
    answer: "Those sites make money from affiliate commissions—they're incentivized to recommend products that pay them the most, not what's best for you. We don't take affiliate payments. Our tools show you the math, transparently, so you can make your own informed decisions.",
  },
  {
    question: "Is ClearMoney really free?",
    answer: "Yes. All 31+ calculators and tools are completely free with no paywalls. We believe financial literacy shouldn't cost money. We may offer premium features in the future, but our core tools will always be free.",
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
// COMPONENTS
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6">
        <nav className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: colors.accent }}
            >
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight" style={{ color: colors.text }}>
              ClearMoney
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Tools", "Methodology", "About"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium transition-colors hover:opacity-70"
                style={{ color: colors.textMuted }}
              >
                {item}
              </Link>
            ))}
            <Link
              href="#tools"
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all hover:opacity-90"
              style={{ backgroundColor: colors.accent, color: "white" }}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section
      className="min-h-screen flex items-center justify-center pt-16 relative overflow-hidden"
      style={{ backgroundColor: colors.bg }}
    >
      {/* Gradient blobs for visual depth */}
      <GradientBlob
        color={colors.blob1}
        size={600}
        top="-10%"
        right="-5%"
        opacity={0.15}
        blur={100}
        animate
      />
      <GradientBlob
        color={colors.blob2}
        size={500}
        top="30%"
        left="-10%"
        opacity={0.12}
        blur={90}
        animate
      />
      <GradientBlob
        color={colors.blob3}
        size={400}
        bottom="10%"
        right="20%"
        opacity={0.1}
        blur={80}
        animate
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
          style={{ backgroundColor: colors.bgAlt, color: colors.textMuted, border: `1px solid ${colors.border}` }}
        >
          <Zap className="w-3.5 h-3.5" style={{ color: colors.accent }} />
          31+ Free Financial Tools
        </div>

        {/* Main headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
          style={{ color: colors.text }}
        >
          Fire your financial advisor.
          <br />
          <span style={{ color: colors.textMuted }}>Become clear.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: colors.textMuted }}
        >
          The wealth strategies used by the ultra-wealthy aren't secret—they're just
          buried under affiliate-driven content and paywalled advice.
          <span className="font-medium" style={{ color: colors.text }}>
            {" "}We surface them for free.
          </span>
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#tools"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-all hover:opacity-90"
            style={{ backgroundColor: colors.accent, color: "white" }}
          >
            Explore All Tools
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#methodology"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium rounded-lg transition-all hover:bg-gray-100"
            style={{ color: colors.text }}
          >
            See Our Methodology
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          {[
            { icon: Shield, label: "No affiliate bias" },
            { icon: Calculator, label: "31+ free tools" },
            { icon: FileText, label: "Open methodology" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className="w-4 h-4" style={{ color: colors.textLight }} />
              <span className="text-sm" style={{ color: colors.textMuted }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="py-24" style={{ backgroundColor: colors.bgAlt }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-6"
            style={{ color: colors.text }}
          >
            Two options, both broken
          </h2>
          <p className="text-lg" style={{ color: colors.textMuted }}>
            Getting your finances right shouldn't require choosing between expensive mistakes or expensive advisors.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* DIY Option */}
          <div
            className="p-8 rounded-2xl"
            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ backgroundColor: `${colors.warning}15`, color: colors.warning }}
            >
              <X className="w-3.5 h-3.5" />
              Option A: DIY
            </div>
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: colors.text }}
            >
              Do It Yourself
            </h3>
            <ul className="space-y-3">
              {[
                "Accounts scattered everywhere",
                "Spreadsheets always wrong or outdated",
                "Expensive mistakes (wrong account, bad timing)",
                "SEO content buries the real answers",
                "Affiliate bias everywhere you look",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.warning }} />
                  <span className="text-sm" style={{ color: colors.textMuted }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Advisor Option */}
          <div
            className="p-8 rounded-2xl"
            style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
          >
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
              style={{ backgroundColor: `${colors.warning}15`, color: colors.warning }}
            >
              <X className="w-3.5 h-3.5" />
              Option B: Hire an Advisor
            </div>
            <h3
              className="text-xl font-semibold mb-4"
              style={{ color: colors.text }}
            >
              Traditional Wealth Manager
            </h3>
            <ul className="space-y-3">
              {[
                "1-2% of assets annually in fees",
                "Over 30 years, that's 30-40% of your wealth",
                "Quarterly meetings, not 24/7 access",
                "Cookie-cutter portfolios for most clients",
                "Misaligned incentives (AUM-based fees)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <X className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.warning }} />
                  <span className="text-sm" style={{ color: colors.textMuted }}>
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

function SolutionSection() {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Gradient blobs */}
      <GradientBlob
        color={colors.blob4}
        size={450}
        top="20%"
        right="-5%"
        opacity={0.1}
        blur={90}
      />
      <GradientBlob
        color={colors.blob1}
        size={350}
        bottom="10%"
        left="-5%"
        opacity={0.08}
        blur={80}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
            style={{ backgroundColor: `${colors.success}15`, color: colors.success }}
          >
            <Check className="w-3.5 h-3.5" />
            A Better Way
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-6"
            style={{ color: colors.text }}
          >
            Tools that respect your intelligence
          </h2>
          <p className="text-lg" style={{ color: colors.textMuted }}>
            Plug in your numbers. Get an honest answer. No affiliate-driven recommendations.
            <span className="font-medium" style={{ color: colors.text }}> Just math.</span>
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Calculator,
              title: "31+ Decision Tools",
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
              className="p-6 rounded-xl"
              style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ backgroundColor: `${colors.accent}10` }}
              >
                <item.icon className="w-5 h-5" style={{ color: colors.accent }} />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: colors.text }}
              >
                {item.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeeCalculator() {
  const [assets, setAssets] = useState(500000);
  const [years, setYears] = useState(20);
  const advisorFee = 0.01; // 1% annual fee
  const growthRate = 0.07; // 7% annual return

  // Calculate wealth with and without advisor fees
  const wealthWithFees = assets * Math.pow(1 + growthRate - advisorFee, years);
  const wealthWithoutFees = assets * Math.pow(1 + growthRate, years);
  const costOfFees = wealthWithoutFees - wealthWithFees;
  const percentLost = (costOfFees / wealthWithoutFees) * 100;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: colors.bgAlt }}>
      {/* Subtle gradient accent */}
      <GradientBlob
        color={colors.warning}
        size={300}
        top="50%"
        right="10%"
        opacity={0.06}
        blur={100}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: colors.text }}
          >
            The true cost of 1% fees
          </h2>
          <p className="text-lg" style={{ color: colors.textMuted }}>
            That "small" 1% annual fee compounds into a fortune over time.
          </p>
        </div>

        <div
          className="p-8 rounded-2xl"
          style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
        >
          {/* Sliders */}
          <div className="grid sm:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>
                Starting Portfolio: {formatCurrency(assets)}
              </label>
              <input
                type="range"
                min={100000}
                max={2000000}
                step={50000}
                value={assets}
                onChange={(e) => setAssets(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: colors.border }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: colors.textLight }}>
                <span>$100K</span>
                <span>$2M</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3" style={{ color: colors.text }}>
                Investment Horizon: {years} years
              </label>
              <input
                type="range"
                min={5}
                max={40}
                step={1}
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                style={{ backgroundColor: colors.border }}
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: colors.textLight }}>
                <span>5 years</span>
                <span>40 years</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div
            className="p-6 rounded-xl mb-6"
            style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
          >
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textMuted }}>
                  With 1% advisor fee
                </p>
                <p className="text-2xl font-bold" style={{ color: colors.text }}>
                  {formatCurrency(wealthWithFees)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textMuted }}>
                  Without fees
                </p>
                <p className="text-2xl font-bold" style={{ color: colors.success }}>
                  {formatCurrency(wealthWithoutFees)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textMuted }}>
                  Cost of fees
                </p>
                <p className="text-2xl font-bold" style={{ color: colors.warning }}>
                  {formatCurrency(costOfFees)}
                </p>
              </div>
            </div>
          </div>

          <p className="text-center text-sm" style={{ color: colors.textMuted }}>
            That 1% fee costs you{" "}
            <span className="font-semibold" style={{ color: colors.warning }}>
              {percentLost.toFixed(1)}%
            </span>{" "}
            of your potential wealth over {years} years.
            <br />
            <span style={{ color: colors.textLight }}>
              Assumes 7% annual returns. Your results may vary.
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section id="tools" className="py-24 relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Gradient blobs */}
      <GradientBlob
        color={colors.blob2}
        size={500}
        top="-10%"
        left="10%"
        opacity={0.1}
        blur={100}
      />
      <GradientBlob
        color={colors.blob3}
        size={400}
        bottom="20%"
        right="-5%"
        opacity={0.08}
        blur={80}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: colors.text }}
          >
            Every tool you need
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
            31+ calculators across 8 categories. All free. All transparent.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`#${category.id}`}
              className="group p-5 rounded-xl transition-all hover:shadow-md"
              style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${colors.accent}10` }}
                >
                  <category.icon className="w-5 h-5" style={{ color: colors.accent }} />
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{ backgroundColor: colors.bg, color: colors.textMuted }}
                >
                  {category.count} tools
                </span>
              </div>
              <h3 className="font-semibold mb-1" style={{ color: colors.text }}>
                {category.name}
              </h3>
              <p className="text-sm" style={{ color: colors.textLight }}>
                {category.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Featured strategies */}
        <div className="mb-8">
          <h3
            className="text-xl font-semibold mb-6"
            style={{ color: colors.text }}
          >
            Popular strategies
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredStrategies.map((strategy) => (
              <Link
                key={strategy.title}
                href="#"
                className="group p-5 rounded-xl transition-all hover:shadow-md"
                style={{ backgroundColor: colors.bgAlt, border: `1px solid ${colors.border}` }}
              >
                <p className="text-xs font-medium mb-2" style={{ color: colors.accent }}>
                  {strategy.category}
                </p>
                <h4
                  className="font-semibold mb-2 group-hover:underline"
                  style={{ color: colors.text }}
                >
                  {strategy.title}
                </h4>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  {strategy.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link
            href="#"
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-70"
            style={{ color: colors.accent }}
          >
            View all 31+ tools
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24" style={{ backgroundColor: colors.bgAlt }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
            style={{ color: colors.text }}
          >
            Frequently asked questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden"
              style={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}` }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="font-medium pr-4" style={{ color: colors.text }}>
                  {item.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: colors.textMuted }} />
                ) : (
                  <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: colors.textMuted }} />
                )}
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: colors.textMuted }}>
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

function NewsletterSection() {
  const [email, setEmail] = useState("");

  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
      {/* Gradient blob */}
      <GradientBlob
        color={colors.blob1}
        size={500}
        top="50%"
        left="50%"
        opacity={0.08}
        blur={120}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 text-center">
        <h2
          className="text-3xl sm:text-4xl font-bold tracking-tight mb-4"
          style={{ color: colors.text }}
        >
          Get tools, not fluff
        </h2>
        <p className="text-lg mb-8" style={{ color: colors.textMuted }}>
          New calculator launches, methodology updates, and honest takes on financial products. Weekly max.
        </p>

        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="flex-1 px-4 py-3 rounded-lg text-base outline-none focus:ring-2"
            style={{
              backgroundColor: colors.bgAlt,
              border: `1px solid ${colors.border}`,
              color: colors.text,
            }}
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg text-base font-medium transition-all hover:opacity-90"
            style={{ backgroundColor: colors.accent, color: "white" }}
          >
            Subscribe
          </button>
        </form>

        <p className="mt-4 text-xs" style={{ color: colors.textLight }}>
          No spam. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="py-16"
      style={{ backgroundColor: colors.bgAlt, borderTop: `1px solid ${colors.border}` }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: colors.accent }}
              >
                <Calculator className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold tracking-tight" style={{ color: colors.text }}>
                ClearMoney
              </span>
            </Link>
            <p className="text-sm max-w-xs mb-4" style={{ color: colors.textMuted }}>
              Financial clarity for everyone. No affiliate bias. No paywalls.
              Just honest tools and transparent methodology.
            </p>
            <p className="text-xs" style={{ color: colors.textLight }}>
              Built with conviction, not VC pressure.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: colors.text }}>
              Tools
            </h4>
            <ul className="space-y-2">
              {["Investing", "Taxes", "Credit Cards", "Budgeting"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm transition-colors hover:opacity-70"
                    style={{ color: colors.textMuted }}
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: colors.text }}>
              Company
            </h4>
            <ul className="space-y-2">
              {["Methodology", "About", "Privacy", "Terms"].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm transition-colors hover:opacity-70"
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
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <p className="text-xs" style={{ color: colors.textLight }}>
            &copy; {new Date().getFullYear()} ClearMoney. All rights reserved.
          </p>
          <p className="text-xs" style={{ color: colors.textLight }}>
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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* Blob animation */
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -30px) scale(1.05);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(30px, 10px) scale(1.02);
          }
        }

        .animate-blob {
          animation: blob 20s ease-in-out infinite;
        }

        .animate-blob:nth-child(2) {
          animation-delay: -5s;
        }

        .animate-blob:nth-child(3) {
          animation-delay: -10s;
        }

        /* Custom range slider */
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          background: ${colors.accent};
          border-radius: 50%;
          cursor: pointer;
        }

        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: ${colors.accent};
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
        <Navigation />
        <HeroSection />
        <ProblemSection />
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
