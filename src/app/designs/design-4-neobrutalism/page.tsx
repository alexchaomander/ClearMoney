"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CreditCard,
  TrendingUp,
  Landmark,
  Receipt,
  Target,
  DollarSign,
  Heart,
  BarChart3,
  X,
  Menu,
  Eye,
  Code2,
  AlertTriangle,
  Check,
  Send,
} from "lucide-react";

// Neo-Brutalism Design System
// - Hard black borders (3-4px)
// - Offset box shadows (harsh, no blur)
// - Single accent: Chartreuse #c5f82a
// - Raw typography: Darker Grotesque + Space Mono
// - No gradients, no soft shadows
// - Visible grid, asymmetric layouts

const categories = [
  { id: "credit-cards", name: "Credit Cards", icon: CreditCard, count: 6 },
  { id: "investing", name: "Investing", icon: TrendingUp, count: 10 },
  { id: "banking", name: "Banking", icon: Landmark, count: 3 },
  { id: "taxes", name: "Taxes", icon: Receipt, count: 10 },
  { id: "debt", name: "Debt", icon: Target, count: 2 },
  { id: "budgeting", name: "Budgeting", icon: DollarSign, count: 4 },
  { id: "giving", name: "Giving", icon: Heart, count: 1 },
  { id: "credit", name: "Credit Score", icon: BarChart3, count: 1 },
];

const featuredTools = [
  {
    id: 1,
    name: "Bilt 2.0 Calculator",
    description: "Is the new Bilt card worth it for your rent?",
    category: "Credit Cards",
    hot: true,
  },
  {
    id: 2,
    name: "FIRE Calculator",
    description: "When can you tell your boss to get lost?",
    category: "Investing",
    hot: false,
  },
  {
    id: 3,
    name: "Roth vs Traditional",
    description: "Which saves more? We did the math.",
    category: "Investing",
    hot: false,
  },
  {
    id: 4,
    name: "TPG Transparency Tool",
    description: "See how affiliate $$ drives their recommendations.",
    category: "Credit Cards",
    hot: true,
  },
  {
    id: 5,
    name: "Debt Destroyer",
    description: "Snowball vs avalanche. Fight.",
    category: "Debt",
    hot: false,
  },
  {
    id: 6,
    name: "Home Affordability Reality Check",
    description: "What you can ACTUALLY afford. Banks lie.",
    category: "Budgeting",
    hot: false,
  },
  {
    id: 7,
    name: "Mega Backdoor Roth",
    description: "$46k+ extra to Roth. Legally.",
    category: "Investing",
    hot: true,
  },
  {
    id: 8,
    name: "Stock Option Exercise Tool",
    description: "ISOs, NSOs, AMT. Decoded.",
    category: "Taxes",
    hot: false,
  },
  {
    id: 9,
    name: "529-to-Roth Rollover",
    description: "New SECURE 2.0 loophole.",
    category: "Investing",
    hot: true,
  },
];

const allTools = [
  // Credit Cards
  { name: "Bilt 2.0 Calculator", category: "credit-cards" },
  { name: "Annual Fee Analyzer", category: "credit-cards" },
  { name: "Chase Trifecta Calculator", category: "credit-cards" },
  { name: "Amex Gold vs Platinum", category: "credit-cards" },
  { name: "Points Valuation Dashboard", category: "credit-cards" },
  { name: "TPG Transparency Tool", category: "credit-cards" },
  // Investing
  { name: "Roth vs Traditional", category: "investing" },
  { name: "2026 Contribution Limits", category: "investing" },
  { name: "Roth Catch-Up Planner", category: "investing" },
  { name: "Mega Backdoor Roth", category: "investing" },
  { name: "529-to-Roth Rollover", category: "investing" },
  { name: "FIRE Calculator", category: "investing" },
  { name: "Super Catch-Up Optimizer", category: "investing" },
  { name: "Equity Concentration Risk", category: "investing" },
  { name: "Dividend Income Tracker", category: "investing" },
  { name: "Total Compensation Calculator", category: "investing" },
  // Banking
  { name: "I Bond vs HYSA Comparison", category: "banking" },
  { name: "HYSA Finder", category: "banking" },
  { name: "Bank Bonus Calculator", category: "banking" },
  // Taxes
  { name: "RSU Tax Calculator", category: "taxes" },
  { name: "Crypto Cost Basis", category: "taxes" },
  { name: "Backdoor Roth Guide", category: "taxes" },
  { name: "OBBB Tax Savings", category: "taxes" },
  { name: "Stock Option Exercise Tool", category: "taxes" },
  { name: "Tax Bracket Optimizer", category: "taxes" },
  { name: "Medicare IRMAA Planner", category: "taxes" },
  { name: "Estate Tax Calculator", category: "taxes" },
  { name: "HSA Maximization Tool", category: "taxes" },
  { name: "Paycheck Calculator", category: "taxes" },
  // Debt
  { name: "Debt Destroyer", category: "debt" },
  { name: "Student Loan Strategy", category: "debt" },
  // Budgeting
  { name: "Emergency Fund Planner", category: "budgeting" },
  { name: "Home Affordability Reality Check", category: "budgeting" },
  { name: "Conscious Spending Planner", category: "budgeting" },
  { name: "Savings Goal Planner", category: "budgeting" },
  // Giving
  { name: "Appreciated Stock Donation", category: "giving" },
  // Credit
  { name: "Credit Score Simulator", category: "credit" },
];

export default function NeoBrutalismHomepage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [email, setEmail] = useState("");

  const filteredTools = selectedCategory
    ? allTools.filter((t) => t.category === selectedCategory)
    : allTools;

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#c5f82a] selection:text-black">
      {/* Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        .font-brutal {
          font-family: 'Darker Grotesque', sans-serif;
        }
        .font-mono-brutal {
          font-family: 'Space Mono', monospace;
        }

        /* Harsh box shadow - offset, no blur */
        .brutal-shadow {
          box-shadow: 4px 4px 0 0 #000;
        }
        .brutal-shadow-sm {
          box-shadow: 2px 2px 0 0 #000;
        }
        .brutal-shadow-lg {
          box-shadow: 6px 6px 0 0 #000;
        }
        .brutal-shadow-accent {
          box-shadow: 4px 4px 0 0 #c5f82a;
        }
        .brutal-shadow-hover:hover {
          box-shadow: 6px 6px 0 0 #000;
          transform: translate(-2px, -2px);
        }
        .brutal-shadow-active:active {
          box-shadow: 2px 2px 0 0 #000;
          transform: translate(2px, 2px);
        }

        /* Hard borders */
        .brutal-border {
          border: 3px solid #000;
        }
        .brutal-border-thick {
          border: 4px solid #000;
        }

        /* Visible grid background */
        .brutal-grid {
          background-image:
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px);
          background-size: 40px 40px;
          background-position: -1px -1px;
        }

        /* Diagonal stripes */
        .brutal-stripes {
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            #c5f82a 10px,
            #c5f82a 20px
          );
        }

        /* Marquee animation */
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }

        /* Blink for alerts */
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        /* Shake on hover */
        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0); }
          25% { transform: translateX(-2px) rotate(-1deg); }
          75% { transform: translateX(2px) rotate(1deg); }
        }
        .hover-shake:hover {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>

      {/* HEADER - Raw, visible structure */}
      <header className="brutal-border-thick border-t-0 border-l-0 border-r-0 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#c5f82a] brutal-border flex items-center justify-center brutal-shadow-sm group-hover:bg-black transition-colors">
              <span className="font-mono-brutal text-xl font-bold group-hover:text-[#c5f82a] transition-colors">$</span>
            </div>
            <div className="font-brutal">
              <span className="text-2xl font-black tracking-tighter">CLEAR</span>
              <span className="text-2xl font-black tracking-tighter text-[#c5f82a] bg-black px-1">MONEY</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {["Tools", "Methodology", "Blog", "About"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="font-brutal font-bold text-lg px-4 py-2 brutal-border bg-white hover:bg-[#c5f82a] transition-colors brutal-shadow-hover brutal-shadow-active"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden brutal-border p-2 bg-white hover:bg-[#c5f82a] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden brutal-border-thick border-t-0 bg-white">
            {["Tools", "Methodology", "Blog", "About"].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="block font-brutal font-bold text-xl px-6 py-4 border-b-3 border-black hover:bg-[#c5f82a] transition-colors"
              >
                {item}
              </Link>
            ))}
          </nav>
        )}
      </header>

      {/* ANNOUNCEMENT BAR - Scrolling marquee */}
      <div className="bg-black text-[#c5f82a] brutal-border-thick border-t-0 border-l-0 border-r-0 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 px-4 py-2 font-mono-brutal text-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 animate-blink" />
                NO AFFILIATE BIAS
              </span>
              <span>{"///"}</span>
              <span>31+ FREE CALCULATORS</span>
              <span>{"///"}</span>
              <span className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                WE SHOW OUR MATH
              </span>
              <span>{"///"}</span>
              <span>BANKS HATE US</span>
              <span>{"///"}</span>
              <span>TOOLS &gt; CONTENT</span>
              <span>{"///"}</span>
              <span className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                OPEN METHODOLOGY
              </span>
              <span>{"///"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* HERO - Provocative, asymmetric */}
      <section className="relative brutal-grid bg-white overflow-hidden">
        {/* Diagonal accent block */}
        <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-[#c5f82a] rotate-12 brutal-border hidden lg:block" />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 lg:py-32 md:px-8">
          <div className="max-w-4xl">
            {/* Anti-tag */}
            <div className="inline-flex gap-3 mb-6 flex-wrap">
              <div className="brutal-border bg-black text-white px-4 py-2 font-mono-brutal text-sm brutal-shadow-accent rotate-[-1deg]">
                THE ANTI-NERDWALLET
              </div>
              <div className="brutal-border bg-[#c5f82a] text-black px-4 py-2 font-mono-brutal text-sm brutal-shadow rotate-[1deg]">
                YOUR PERSONAL WEALTH ADVISOR
              </div>
            </div>

            {/* Main headline */}
            <h1 className="font-brutal text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
              FIRE YOUR
              <br />
              <span className="inline-block bg-[#c5f82a] brutal-border px-2 brutal-shadow mt-2">
                FINANCIAL ADVISOR
              </span>
              <br />
              <span className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-600">
                (THEY WORK FOR WALL ST, NOT YOU)
              </span>
            </h1>

            {/* Subhead */}
            <p className="font-brutal text-xl md:text-2xl max-w-2xl mb-10 leading-relaxed">
              Get a personalized financial plan in 5 minutes.{" "}
              <span className="bg-black text-white px-1">No 1% AUM fees. No product pushing.</span>{" "}
              Just honest, math-backed advice that prioritizes YOUR wealth, not theirs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/designs/design-4-neobrutalism/onboarding"
                className="inline-flex items-center gap-2 font-brutal font-bold text-xl px-8 py-4 bg-[#c5f82a] text-black brutal-border brutal-shadow-lg brutal-shadow-hover brutal-shadow-active hover:bg-black hover:text-[#c5f82a] transition-colors"
              >
                START YOUR FINANCIAL AUDIT
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 font-brutal font-bold text-xl px-8 py-4 bg-white text-black brutal-border brutal-shadow-lg brutal-shadow-hover brutal-shadow-active hover:bg-[#c5f82a] transition-colors"
              >
                EXPLORE 31+ TOOLS
              </Link>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-6 mt-12">
              {[
                { value: "31+", label: "Free Tools" },
                { value: "$0", label: "Always Free" },
                { value: "0%", label: "Affiliate Bias" },
              ].map((stat) => (
                <div key={stat.label} className="brutal-border bg-white p-4 brutal-shadow-sm">
                  <div className="font-mono-brutal text-3xl font-bold text-[#c5f82a]">{stat.value}</div>
                  <div className="font-brutal font-bold text-sm uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PERSONAL WEALTH ADVISOR - New hero section */}
      <section className="brutal-border-thick border-l-0 border-r-0 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side */}
            <div>
              <div className="inline-block mb-6">
                <div className="brutal-border border-white bg-[#c5f82a] text-black px-4 py-2 font-mono-brutal text-sm brutal-shadow-sm">
                  NEW: PERSONAL WEALTH ADVISOR
                </div>
              </div>

              <h2 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                WALL STREET HATES THIS.
                <br />
                <span className="text-[#c5f82a]">WE LOVE THAT.</span>
              </h2>

              <p className="font-brutal text-xl text-gray-300 mb-8 leading-relaxed">
                Traditional advisors charge 1% of your assets to give you cookie-cutter advice.
                We built a system that analyzes YOUR situation and tells you exactly what to do next,
                prioritized by impact. No sales pitch. No upsells.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "5-minute financial audit",
                  "Personalized action items ranked by impact",
                  "Track your progress over time",
                  "100% free, forever",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 brutal-border border-white bg-[#c5f82a] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                    <span className="font-brutal font-bold">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/designs/design-4-neobrutalism/onboarding"
                className="inline-flex items-center gap-2 font-brutal font-bold text-lg px-8 py-4 bg-[#c5f82a] text-black brutal-border border-white brutal-shadow-accent brutal-shadow-hover brutal-shadow-active hover:bg-white transition-colors"
              >
                START YOUR FINANCIAL AUDIT
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right side - Preview cards */}
            <div className="space-y-4">
              <div className="brutal-border border-white bg-gray-900 p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono-brutal text-[#c5f82a] text-sm">FINANCIAL HEALTH SCORE</span>
                  <span className="font-brutal text-4xl font-black text-[#c5f82a]">72/100</span>
                </div>
                <div className="w-full bg-gray-700 h-4 brutal-border border-white">
                  <div className="bg-[#c5f82a] h-full" style={{ width: "72%" }} />
                </div>
              </div>

              <div className="brutal-border border-white bg-gray-900 p-6">
                <span className="font-mono-brutal text-gray-400 text-sm">TOP PRIORITY ACTION</span>
                <div className="mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 brutal-border border-white bg-[#c5f82a] flex items-center justify-center">
                      <span className="font-mono-brutal text-black font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-brutal font-bold text-lg">Max your 401k match</h4>
                      <p className="font-mono-brutal text-sm text-gray-400">You&apos;re leaving $3,600/yr on the table</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="brutal-border border-white bg-gray-900 p-6">
                <span className="font-mono-brutal text-gray-400 text-sm">YOUR ADVISOR SAYS</span>
                <p className="font-brutal text-lg mt-2 text-white">
                  &quot;That 22% APR credit card is <span className="text-[#c5f82a]">literally stealing</span> from your future self.
                  Kill it before investing another dollar.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED TOOLS - Grid with harsh aesthetics */}
      <section className="brutal-border-thick border-l-0 border-r-0 bg-[#c5f82a]">
        <div className="flex items-center justify-between px-4 py-4 md:px-8 border-b-3 border-black">
          <h2 className="font-brutal text-2xl md:text-3xl font-black uppercase tracking-tight">
            POPULAR TOOLS
          </h2>
          <span className="font-mono-brutal text-sm brutal-border bg-black text-[#c5f82a] px-3 py-1">
            UPDATED DAILY
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {featuredTools.map((tool, index) => (
            <Link
              key={tool.id}
              href="#"
              className={`group p-6 border-b-3 border-r-3 border-black bg-white hover:bg-black hover:text-white transition-colors relative ${
                index % 3 === 2 ? "lg:border-r-0" : ""
              }`}
            >
              {tool.hot && (
                <div className="absolute top-4 right-4 brutal-border bg-[#c5f82a] px-2 py-1 font-mono-brutal text-xs font-bold text-black brutal-shadow-sm">
                  HOT
                </div>
              )}
              <div className="font-mono-brutal text-xs text-gray-500 group-hover:text-gray-400 uppercase tracking-wider mb-2">
                {tool.category}
              </div>
              <h3 className="font-brutal text-xl font-black mb-2 group-hover:text-[#c5f82a] transition-colors">
                {tool.name}
              </h3>
              <p className="font-brutal text-gray-600 group-hover:text-gray-300 mb-4">
                {tool.description}
              </p>
              <div className="flex items-center gap-2 font-mono-brutal text-sm font-bold group-hover:text-[#c5f82a] transition-colors">
                LAUNCH TOOL
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CALCULATOR GALLERY - Full catalog */}
      <section id="tools" className="bg-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <h2 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
                ALL 31+ CALCULATORS
              </h2>
              <p className="font-brutal text-xl text-gray-600">
                Every tool is free. Every formula is public. No hidden agendas. Tools first, content second.
              </p>
            </div>
            <div className="brutal-border bg-black text-white px-4 py-2 font-mono-brutal text-sm">
              NO PAYWALLS. EVER.
            </div>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`font-brutal font-bold px-4 py-2 brutal-border transition-colors ${
                selectedCategory === null
                  ? "bg-black text-white"
                  : "bg-white hover:bg-[#c5f82a]"
              }`}
            >
              ALL ({allTools.length})
            </button>
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = allTools.filter((t) => t.category === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`font-brutal font-bold px-4 py-2 brutal-border transition-colors flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? "bg-black text-white"
                      : "bg-white hover:bg-[#c5f82a]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>

          {/* Tools grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredTools.map((tool, index) => (
              <Link
                key={index}
                href="#"
                className="group brutal-border bg-white p-4 brutal-shadow-sm brutal-shadow-hover brutal-shadow-active hover:bg-[#c5f82a] transition-all"
              >
                <div className="font-mono-brutal text-xs text-gray-500 uppercase tracking-wider mb-1">
                  {categories.find((c) => c.id === tool.category)?.name}
                </div>
                <div className="font-brutal font-bold text-lg group-hover:text-black transition-colors flex items-center justify-between gap-2">
                  {tool.name}
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* METHODOLOGY - "We show our math" */}
      <section className="brutal-border-thick border-l-0 border-r-0 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 md:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - text */}
            <div>
              <div className="inline-block mb-6">
                <div className="brutal-border border-white bg-[#c5f82a] text-black px-4 py-2 font-mono-brutal text-sm brutal-shadow-sm rotate-[-1deg]">
                  RADICAL TRANSPARENCY
                </div>
              </div>

              <h2 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight mb-6">
                WE SHOW
                <br />
                <span className="text-[#c5f82a]">OUR MATH.</span>
              </h2>

              <p className="font-brutal text-xl text-gray-300 mb-8 leading-relaxed">
                Unlike corporate finance sites that hide their methodology behind proprietary
                algorithms (and affiliate deals), we publish every formula, every assumption,
                every data source.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Open-source calculations you can verify",
                  "No hidden affiliate incentives",
                  "Clear disclaimers on every tool",
                  "Community-reviewed methodology",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 brutal-border border-white bg-[#c5f82a] flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-black" />
                    </div>
                    <span className="font-brutal font-bold">{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 font-brutal font-bold text-lg px-6 py-3 bg-white text-black brutal-border border-white brutal-shadow-accent brutal-shadow-hover brutal-shadow-active hover:bg-[#c5f82a] transition-colors"
              >
                READ OUR METHODOLOGY
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Right side - code block aesthetic */}
            <div className="brutal-border border-white bg-gray-900 p-6 brutal-shadow-accent">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-700">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-mono-brutal text-sm text-gray-500 ml-2">methodology.ts</span>
              </div>
              <pre className="font-mono-brutal text-sm text-gray-300 overflow-x-auto">
{`// Roth vs Traditional calculation
// No hidden variables. No black boxes.

function calculateTaxSavings(
  income: number,
  contribution: number,
  currentBracket: number,
  retirementBracket: number
): Result {

  const traditionalSavings =
    contribution * currentBracket;

  const rothFutureValue =
    calculateGrowth(contribution, years);

  const taxFreeGrowth =
    rothFutureValue * retirementBracket;

  // We show BOTH scenarios
  // You decide what's best for YOU
  return {
    traditional: traditionalSavings,
    roth: taxFreeGrowth,
    recommendation: null // No bias
  };
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* WHY WE'RE DIFFERENT - Anti-corporate manifesto */}
      <section className="bg-white brutal-grid">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
              THE CORPORATE FINANCE
              <br />
              <span className="inline-block bg-black text-white px-2">INDUSTRY IS BROKEN</span>
            </h2>
            <p className="font-brutal text-xl text-gray-600 max-w-2xl mx-auto">
              Most advice sites exist to serve advertisers, not you. Here&apos;s how we&apos;re different.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* THEM */}
            <div className="brutal-border-thick bg-gray-100 p-8">
              <div className="brutal-border bg-black text-white px-4 py-2 font-mono-brutal text-sm inline-block mb-6">
                THEM (NerdWallet, TPG, etc.)
              </div>
              <ul className="space-y-4">
                {[
                  "Affiliate commissions drive recommendations",
                  "Hide methodology behind 'proprietary algorithms'",
                  "3,000-word articles for simple questions",
                  "Inflate point valuations to push premium cards",
                  "Sponsored content disguised as advice",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="font-brutal font-bold text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* US */}
            <div className="brutal-border-thick bg-[#c5f82a] p-8">
              <div className="brutal-border bg-black text-[#c5f82a] px-4 py-2 font-mono-brutal text-sm inline-block mb-6">
                US (ClearMoney)
              </div>
              <ul className="space-y-4">
                {[
                  "Tools first, content second",
                  "Every formula published and verifiable",
                  "Plug in numbers, get an answer in seconds",
                  "Conservative valuations backed by data",
                  "Clear disclosure of any revenue sources",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-black flex-shrink-0 mt-0.5" />
                    <span className="font-brutal font-bold text-black">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER - Raw signup */}
      <section className="brutal-border-thick border-l-0 border-r-0 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 py-16 md:py-20 md:px-8 text-center">
          <div className="inline-block mb-6">
            <div className="brutal-border border-white bg-[#c5f82a] text-black px-4 py-2 font-mono-brutal text-sm brutal-shadow-sm hover-shake">
              NO SPAM. NO BS. UNSUBSCRIBE ANYTIME.
            </div>
          </div>

          <h2 className="font-brutal text-3xl md:text-4xl font-black uppercase tracking-tight mb-4">
            GET TOOLS, NOT FLUFF.
          </h2>
          <p className="font-brutal text-xl text-gray-300 mb-8 max-w-xl mx-auto">
            New calculator launches, methodology updates, and honest takes on financial products.
            Weekly max.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 font-mono-brutal px-4 py-4 brutal-border border-white bg-white text-black placeholder:text-gray-500 focus:outline-none focus:bg-[#c5f82a] transition-colors"
            />
            <button
              type="submit"
              className="font-brutal font-bold text-lg px-8 py-4 bg-[#c5f82a] text-black brutal-border border-white brutal-shadow-sm brutal-shadow-hover brutal-shadow-active hover:bg-white transition-colors flex items-center justify-center gap-2"
            >
              SUBSCRIBE
              <Send className="w-5 h-5" />
            </button>
          </form>

          <p className="font-mono-brutal text-xs text-gray-500 mt-4">
            We never sell your data. Read our{" "}
            <Link href="/privacy" className="underline hover:text-[#c5f82a]">
              privacy policy
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FOOTER - Minimal, brutalist */}
      <footer className="bg-white brutal-border-thick border-b-0 border-l-0 border-r-0">
        <div className="max-w-7xl mx-auto px-4 py-12 md:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-[#c5f82a] brutal-border flex items-center justify-center brutal-shadow-sm">
                  <span className="font-mono-brutal text-xl font-bold">$</span>
                </div>
                <div className="font-brutal">
                  <span className="text-2xl font-black tracking-tighter">CLEAR</span>
                  <span className="text-2xl font-black tracking-tighter text-[#c5f82a] bg-black px-1">MONEY</span>
                </div>
              </div>
              <p className="font-brutal text-gray-600 max-w-sm mb-4">
                Financial literacy for everyone. No corporate influence. Just math and honest opinions.
              </p>
              <div className="brutal-border inline-block px-3 py-1 bg-gray-100">
                <span className="font-mono-brutal text-sm">Built with </span>
                <span className="font-mono-brutal text-sm text-[#c5f82a] bg-black px-1">{"<3"}</span>
                <span className="font-mono-brutal text-sm"> not VC money</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-brutal font-black text-lg uppercase tracking-tight mb-4">
                RESOURCES
              </h4>
              <ul className="space-y-2">
                {["All Tools", "Methodology", "Blog", "FAQ"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="font-brutal font-bold text-gray-600 hover:text-black hover:bg-[#c5f82a] px-1 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-brutal font-black text-lg uppercase tracking-tight mb-4">
                LEGAL
              </h4>
              <ul className="space-y-2">
                {["Privacy Policy", "Terms of Service", "Disclosures", "Contact"].map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      className="font-brutal font-bold text-gray-600 hover:text-black hover:bg-[#c5f82a] px-1 transition-colors"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="brutal-border-thick border-l-0 border-r-0 border-b-0 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-mono-brutal text-sm text-gray-500">
              &copy; {new Date().getFullYear()} ClearMoney. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="font-mono-brutal text-xs text-gray-500 brutal-border px-2 py-1 bg-gray-100">
                v1.0.0
              </span>
              <span className="font-mono-brutal text-xs text-gray-500">
                Made in the USA
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating "No Bias" badge */}
      <div className="fixed bottom-4 left-4 z-40 hidden md:block">
        <div className="brutal-border bg-[#c5f82a] px-3 py-2 brutal-shadow-sm rotate-[-3deg] hover:rotate-0 transition-transform cursor-pointer">
          <span className="font-mono-brutal text-xs font-bold">0% AFFILIATE BIAS</span>
        </div>
      </div>
    </div>
  );
}
