"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Home,
  BarChart3,
  User,
  Menu,
  X,
  Target,
  Wallet,
  DollarSign,
  CreditCard,
  TrendingUp,
  PiggyBank,
  GraduationCap,
  ShoppingCart,
  AlertTriangle,
  Zap,
  ChevronRight,
} from "lucide-react";

// Graph node data
const graphNodes = {
  center: {
    id: "you",
    label: "SARAH",
    value: "$48,500",
    subtitle: "Net Worth",
    color: "#c5f82a",
    size: "large",
  },
  nodes: [
    {
      id: "income",
      label: "INCOME",
      value: "$150K/yr",
      subtitle: "$12,500/mo",
      icon: DollarSign,
      color: "#22c55e",
      position: { top: "5%", left: "50%", transform: "translateX(-50%)" },
      flows: [{ to: "checking", amount: "$12,500/mo", label: "Paycheck" }],
    },
    {
      id: "checking",
      label: "CHECKING",
      value: "$8,400",
      subtitle: "Chase",
      icon: Wallet,
      color: "#117ACA",
      position: { top: "25%", left: "25%" },
      flows: [
        { to: "401k", amount: "$1,625/mo", label: "Auto-invest" },
        { to: "savings", amount: "$500/mo", label: "Transfer" },
        { to: "credit", amount: "$2,100/mo", label: "Payment" },
        { to: "loans", amount: "$450/mo", label: "Payment" },
        { to: "spending", amount: "$7,200/mo", label: "Living" },
      ],
    },
    {
      id: "savings",
      label: "SAVINGS",
      value: "$3,200",
      subtitle: "Emergency Fund",
      icon: PiggyBank,
      color: "#06b6d4",
      position: { top: "25%", right: "25%" },
      flows: [],
    },
    {
      id: "401k",
      label: "401(K)",
      value: "$67,000",
      subtitle: "Fidelity +Match",
      icon: TrendingUp,
      color: "#4AA74E",
      position: { bottom: "25%", left: "15%" },
      flows: [],
      badge: "50% match captured",
    },
    {
      id: "credit",
      label: "CREDIT CARD",
      value: "-$2,100",
      subtitle: "24% APR",
      icon: CreditCard,
      color: "#ef4444",
      position: { bottom: "15%", left: "40%" },
      flows: [],
      warning: true,
    },
    {
      id: "loans",
      label: "STUDENT LOANS",
      value: "-$28,000",
      subtitle: "6.5% APR",
      icon: GraduationCap,
      color: "#f97316",
      position: { bottom: "15%", right: "40%" },
      flows: [],
    },
    {
      id: "spending",
      label: "SPENDING",
      value: "$7,200/mo",
      subtitle: "Click to analyze",
      icon: ShoppingCart,
      color: "#8b5cf6",
      position: { bottom: "25%", right: "15%" },
      flows: [],
    },
  ],
};

const insights = [
  {
    id: 1,
    severity: "critical",
    title: "Your 401k match is FREE MONEY",
    description: "You're only getting 50% of it. That's $3,600/yr you're literally throwing away.",
    impact: "+$3,600/yr",
  },
  {
    id: 2,
    severity: "high",
    title: "That credit card at 24% APR is costing you $504/year",
    description: "Murder it. Every dollar there costs you 24 cents annually. That's highway robbery.",
    impact: "+$504/yr",
  },
  {
    id: 3,
    severity: "medium",
    title: "Your emergency fund covers 0.4 months",
    description: "That's not a fund, it's a snack. You need 3-6 months minimum. One bad month and you're using credit cards.",
    impact: "Security",
  },
  {
    id: 4,
    severity: "info",
    title: "You have $1,200/mo unaccounted for",
    description: "Where's it going? Ghost expenses are wealth killers. Let's track that down.",
    impact: "Find $14K/yr",
  },
];

const stats = [
  { label: "Accounts Connected", value: "5" },
  { label: "Total Assets", value: "$78,600" },
  { label: "Total Debt", value: "-$30,100" },
  { label: "Net Worth", value: "$48,500" },
  { label: "Monthly Cash Flow", value: "+$1,800" },
];

export default function GraphPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

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

        .brutal-border {
          border: 3px solid #000;
        }
        .brutal-border-thick {
          border: 4px solid #000;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.02); }
        }
        .animate-pulse-node {
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes flow {
          0% { stroke-dashoffset: 20; }
          100% { stroke-dashoffset: 0; }
        }
        .animate-flow {
          animation: flow 1s linear infinite;
        }

        .brutal-grid {
          background-image:
            linear-gradient(to right, #e5e5e5 1px, transparent 1px),
            linear-gradient(to bottom, #e5e5e5 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Header */}
      <header className="brutal-border-thick border-t-0 border-l-0 border-r-0 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          <Link href="/designs/design-4-neobrutalism" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#c5f82a] brutal-border flex items-center justify-center brutal-shadow-sm group-hover:bg-black transition-colors">
              <span className="font-mono-brutal text-xl font-bold group-hover:text-[#c5f82a] transition-colors">$</span>
            </div>
            <div className="font-brutal hidden sm:block">
              <span className="text-2xl font-black tracking-tighter">CLEAR</span>
              <span className="text-2xl font-black tracking-tighter text-[#c5f82a] bg-black px-1">MONEY</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: "Home", href: "/designs/design-4-neobrutalism", icon: Home },
              { name: "Dashboard", href: "/designs/design-4-neobrutalism/dashboard", icon: BarChart3 },
              { name: "Connect", href: "/designs/design-4-neobrutalism/connect", icon: Wallet },
              { name: "Graph", href: "/designs/design-4-neobrutalism/graph", icon: Target },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Graph";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-brutal font-bold px-4 py-2 brutal-border transition-colors flex items-center gap-2 ${
                    isActive ? "bg-[#c5f82a]" : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
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
            {[
              { name: "Home", href: "/designs/design-4-neobrutalism", icon: Home },
              { name: "Dashboard", href: "/designs/design-4-neobrutalism/dashboard", icon: BarChart3 },
              { name: "Connect", href: "/designs/design-4-neobrutalism/connect", icon: Wallet },
              { name: "Graph", href: "/designs/design-4-neobrutalism/graph", icon: Target },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Graph";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 font-brutal font-bold text-xl px-6 py-4 border-b-3 border-black transition-colors ${
                    isActive ? "bg-[#c5f82a]" : "hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 md:px-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="inline-block mb-4">
            <div className="brutal-border bg-black text-[#c5f82a] px-4 py-2 font-mono-brutal text-sm rotate-[-1deg]">
              FINANCIAL STRATA
            </div>
          </div>
          <h1 className="font-brutal text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            YOUR MONEY,
            <br />
            <span className="inline-block bg-[#c5f82a] brutal-border px-2 brutal-shadow mt-2">MAPPED</span>
          </h1>
          <p className="font-brutal text-xl md:text-2xl text-gray-600 max-w-2xl">
            This is what your financial advisor sees.{" "}
            <span className="bg-black text-white px-1">Now you do too.</span>
          </p>
        </div>

        {/* Stats Bar */}
        <div className="brutal-border-thick bg-black text-white p-4 mb-8 overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col">
                <span className="font-mono-brutal text-xs text-gray-400 uppercase">{stat.label}</span>
                <span
                  className={`font-brutal text-xl md:text-2xl font-black ${
                    stat.value.startsWith("-") ? "text-red-400" : "text-[#c5f82a]"
                  }`}
                >
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Graph Visualization */}
        <div className="brutal-border-thick bg-gray-100 brutal-grid mb-8 relative" style={{ minHeight: "600px" }}>
          {/* Center Node - YOU */}
          <div
            className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <button
              onClick={() => setSelectedNode("you")}
              className={`brutal-border-thick p-6 transition-all ${
                selectedNode === "you" ? "animate-pulse-node" : ""
              }`}
              style={{ backgroundColor: graphNodes.center.color }}
            >
              <div className="text-center">
                <div className="font-mono-brutal text-xs text-black mb-1">NET WORTH</div>
                <div className="font-brutal text-4xl md:text-5xl font-black text-black">
                  {graphNodes.center.label}
                </div>
                <div className="font-mono-brutal text-lg font-bold text-black">
                  {graphNodes.center.value}
                </div>
              </div>
            </button>
          </div>

          {/* Flow Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: "600px" }}>
            {/* Income to Checking */}
            <line
              x1="50%"
              y1="15%"
              x2="30%"
              y2="30%"
              stroke="#22c55e"
              strokeWidth="3"
              strokeDasharray="10,5"
              className="animate-flow"
            />
            {/* Checking to 401k */}
            <line
              x1="25%"
              y1="35%"
              x2="20%"
              y2="65%"
              stroke="#4AA74E"
              strokeWidth="3"
              strokeDasharray="10,5"
              className="animate-flow"
            />
            {/* Checking to Savings */}
            <line
              x1="35%"
              y1="30%"
              x2="70%"
              y2="30%"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-flow"
            />
            {/* Checking to Credit */}
            <line
              x1="30%"
              y1="40%"
              x2="40%"
              y2="70%"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="10,5"
              className="animate-flow"
            />
            {/* Checking to Loans */}
            <line
              x1="35%"
              y1="40%"
              x2="60%"
              y2="70%"
              stroke="#f97316"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-flow"
            />
            {/* Checking to Spending */}
            <line
              x1="35%"
              y1="35%"
              x2="80%"
              y2="65%"
              stroke="#8b5cf6"
              strokeWidth="3"
              strokeDasharray="10,5"
              className="animate-flow"
            />
          </svg>

          {/* Graph Nodes */}
          {graphNodes.nodes.map((node) => {
            const Icon = node.icon;
            const isSelected = selectedNode === node.id;

            return (
              <div
                key={node.id}
                className="absolute"
                style={node.position as React.CSSProperties}
              >
                <button
                  onClick={() => setSelectedNode(node.id)}
                  className={`brutal-border bg-white p-3 md:p-4 transition-all brutal-shadow-sm ${
                    isSelected ? "brutal-shadow-lg scale-105" : "hover:brutal-shadow"
                  } ${node.warning ? "border-red-500" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 brutal-border flex items-center justify-center"
                      style={{ backgroundColor: node.color }}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-mono-brutal text-xs text-gray-500">{node.label}</div>
                      <div
                        className={`font-brutal text-lg md:text-xl font-black ${
                          node.value.startsWith("-") ? "text-red-600" : ""
                        }`}
                      >
                        {node.value}
                      </div>
                      <div className="font-mono-brutal text-xs text-gray-400">{node.subtitle}</div>
                    </div>
                  </div>
                  {node.badge && (
                    <div className="mt-2 brutal-border bg-yellow-100 px-2 py-1">
                      <span className="font-mono-brutal text-xs text-yellow-800">{node.badge}</span>
                    </div>
                  )}
                  {node.warning && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 brutal-border bg-red-500 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>

                {/* Flow labels */}
                {node.flows.length > 0 && isSelected && (
                  <div className="absolute top-full left-0 mt-2 z-30">
                    <div className="brutal-border bg-black text-white p-3 min-w-[200px]">
                      <div className="font-mono-brutal text-xs text-[#c5f82a] mb-2">MONEY FLOWS</div>
                      {node.flows.map((flow, idx) => (
                        <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-700 last:border-0">
                          <span className="font-brutal text-sm">{flow.label}</span>
                          <span className="font-mono-brutal text-sm text-[#c5f82a]">{flow.amount}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Graph Legend */}
          <div className="absolute bottom-4 left-4 brutal-border bg-white p-4 brutal-shadow-sm">
            <div className="font-mono-brutal text-xs text-gray-500 mb-2">LEGEND</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-green-500" style={{ borderStyle: "dashed" }} />
                <span className="font-mono-brutal text-xs">Income flow</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-red-500" style={{ borderStyle: "dashed" }} />
                <span className="font-mono-brutal text-xs">Debt payment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-1 bg-purple-500" style={{ borderStyle: "dashed" }} />
                <span className="font-mono-brutal text-xs">Spending</span>
              </div>
            </div>
          </div>

          {/* Click instruction */}
          <div className="absolute top-4 right-4 brutal-border bg-[#c5f82a] px-3 py-2">
            <span className="font-mono-brutal text-xs">Click nodes to explore</span>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 brutal-border bg-[#c5f82a] flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="font-brutal text-2xl font-black uppercase tracking-tight">
              AI INSIGHTS
            </h2>
            <div className="brutal-border bg-black text-[#c5f82a] px-3 py-1 font-mono-brutal text-xs">
              BASED ON YOUR CONNECTED DATA
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`brutal-border p-4 md:p-6 brutal-shadow-sm ${
                  insight.severity === "critical"
                    ? "bg-red-50 border-red-500"
                    : insight.severity === "high"
                    ? "bg-orange-50 border-orange-500"
                    : insight.severity === "medium"
                    ? "bg-yellow-50 border-yellow-500"
                    : "bg-blue-50 border-blue-500"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    {insight.severity === "critical" && (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <h3 className="font-brutal text-lg font-black">{insight.title}</h3>
                  </div>
                  <div
                    className={`brutal-border px-2 py-1 font-mono-brutal text-xs font-bold ${
                      insight.impact.startsWith("+")
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {insight.impact}
                  </div>
                </div>
                <p className="font-brutal text-gray-600">{insight.description}</p>
                <Link
                  href="/designs/design-4-neobrutalism/recommendations"
                  className="inline-flex items-center gap-1 font-mono-brutal text-sm font-bold mt-3 hover:text-[#c5f82a] transition-colors"
                >
                  Take action <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="brutal-border-thick bg-black text-white p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h3 className="font-brutal text-2xl md:text-3xl font-black mb-2">
                CONNECT MORE ACCOUNTS FOR{" "}
                <span className="text-[#c5f82a]">SMARTER INSIGHTS</span>
              </h3>
              <p className="font-brutal text-gray-400">
                The more data we have, the more personalized your recommendations become.
                5 accounts connected. Add more for +15% confidence.
              </p>
            </div>
            <Link
              href="/designs/design-4-neobrutalism/connect"
              className="inline-flex items-center gap-2 font-brutal font-bold text-lg px-8 py-4 bg-[#c5f82a] text-black brutal-border border-white brutal-shadow-accent brutal-shadow-hover brutal-shadow-active hover:bg-white transition-colors flex-shrink-0"
            >
              CONNECT MORE
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="brutal-border-thick border-b-0 border-l-0 border-r-0 bg-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono-brutal text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ClearMoney. See what Wall Street sees.
          </p>
          <div className="brutal-border px-3 py-1 bg-black text-[#c5f82a]">
            <span className="font-mono-brutal text-xs">YOUR DATA = YOUR POWER</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
