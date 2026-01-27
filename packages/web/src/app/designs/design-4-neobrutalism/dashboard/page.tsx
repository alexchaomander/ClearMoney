"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PiggyBank,
  CreditCard,
  AlertTriangle,
  Zap,
  Home,
  BarChart3,
  User,
  Menu,
  X,
  ChevronRight,
  Wallet,
  Building2,
  GraduationCap,
  CheckCircle2,
  Plus,
  Network,
  Shield,
} from "lucide-react";

// Mock user data
const mockUser = {
  name: "Sarah",
  age: 32,
  occupation: "Software Engineer",
  healthScore: 72,
  netWorth: 87400,
  income: 150000,
  savingsRate: 22,
  totalDebt: 34000,
  monthlyExpenses: 5200,
  emergencyFundMonths: 1.2,
};

// Connected accounts data
const connectedAccounts = [
  { id: 1, name: "Chase", type: "Banking", icon: Building2, color: "#117ACA", connected: true },
  { id: 2, name: "Fidelity", type: "401(k)", icon: TrendingUp, color: "#4AA74E", connected: true },
  { id: 3, name: "Amex", type: "Credit Card", icon: CreditCard, color: "#006FCF", connected: true },
  { id: 4, name: "Student Loans", type: "Debt", icon: GraduationCap, color: "#1E3A5F", connected: true },
  { id: 5, name: "Vanguard", type: "IRA", icon: Wallet, color: "#8B2332", connected: true },
];

const topActions = [
  {
    id: 1,
    priority: 1,
    title: "Max your 401k match",
    subtitle: "You're leaving $3,600 on the table",
    impact: "+$3,600/yr",
    status: "urgent",
    dataSource: "Fidelity 401(k)",
  },
  {
    id: 2,
    priority: 2,
    title: "Kill that 22% credit card",
    subtitle: "$1,400/yr in interest is theft",
    impact: "+$1,400/yr",
    status: "high",
    dataSource: "Amex Statement",
  },
  {
    id: 3,
    priority: 3,
    title: "Build emergency fund to 3 months",
    subtitle: "You have 1.2 months - risky",
    impact: "Security",
    status: "medium",
    dataSource: "Chase Savings",
  },
];

const quickStats = [
  { label: "Annual Income", value: "$150K", icon: DollarSign, trend: null },
  { label: "Savings Rate", value: "22%", icon: PiggyBank, trend: "up" },
  { label: "Total Debt", value: "$34K", icon: CreditCard, trend: "down" },
  { label: "Net Worth", value: "$87.4K", icon: TrendingUp, trend: "up" },
];

// Data-driven advisor insights
const advisorInsights = [
  {
    source: "Chase spending data",
    insight: "You spent $340 on subscriptions last month. 3 you haven't used in 60+ days.",
    action: "Cancel unused subscriptions",
    savings: "$180/yr",
  },
  {
    source: "Fidelity 401(k)",
    insight: "Your 401k is missing $3,600/yr in employer match. That's $180K over your career.",
    action: "Increase contribution to 6%",
    savings: "$180K lifetime",
  },
  {
    source: "Amex statement",
    insight: "4 recurring charges you could negotiate down: Spotify, Netflix, gym, insurance.",
    action: "Use our negotiation scripts",
    savings: "$400/yr",
  },
];

export default function DashboardPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accountsConnected = connectedAccounts.filter((a) => a.connected).length;
  const confidenceScore = 94; // Mock confidence based on connected accounts

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

        .brutal-grid {
          background-image:
            linear-gradient(to right, #e5e5e5 1px, transparent 1px),
            linear-gradient(to bottom, #e5e5e5 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(197, 248, 42, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(197, 248, 42, 0); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Header with Navigation */}
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
              { name: "Graph", href: "/designs/design-4-neobrutalism/graph", icon: Network },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Dashboard";
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
              { name: "Graph", href: "/designs/design-4-neobrutalism/graph", icon: Network },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Dashboard";
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 md:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="inline-block mb-2">
                <div className="brutal-border bg-black text-[#c5f82a] px-3 py-1 font-mono-brutal text-xs">
                  PERSONAL WEALTH ADVISOR
                </div>
              </div>
              <h1 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight">
                HEY {mockUser.name.toUpperCase()},
              </h1>
              <p className="font-brutal text-xl text-gray-600">
                {mockUser.age} / {mockUser.occupation}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/designs/design-4-neobrutalism/recommendations"
                className="inline-flex items-center gap-2 font-brutal font-bold px-6 py-3 bg-[#c5f82a] text-black brutal-border brutal-shadow-sm brutal-shadow-hover brutal-shadow-active hover:bg-black hover:text-[#c5f82a] transition-colors"
              >
                VIEW ALL ACTIONS
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* YOUR FINANCIAL NERVOUS SYSTEM - New Section */}
        <div className="brutal-border-thick bg-gray-900 text-white p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 brutal-border border-white bg-[#c5f82a] flex items-center justify-center animate-pulse-glow">
              <Network className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="font-brutal text-xl font-black uppercase tracking-tight">
                YOUR FINANCIAL NERVOUS SYSTEM
              </h2>
              <p className="font-mono-brutal text-xs text-gray-400">
                {accountsConnected} accounts connected - Full context activated
              </p>
            </div>
          </div>

          {/* Connected Accounts Icons */}
          <div className="flex flex-wrap gap-3 mb-4">
            {connectedAccounts.map((account) => {
              const Icon = account.icon;
              return (
                <div
                  key={account.id}
                  className="brutal-border border-gray-600 bg-gray-800 px-3 py-2 flex items-center gap-2"
                >
                  <div
                    className="w-8 h-8 brutal-border border-gray-500 flex items-center justify-center"
                    style={{ backgroundColor: account.color }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-brutal font-bold text-sm">{account.name}</div>
                    <div className="font-mono-brutal text-xs text-gray-500">{account.type}</div>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-500 ml-2" />
                </div>
              );
            })}
            <Link
              href="/designs/design-4-neobrutalism/connect"
              className="brutal-border border-dashed border-gray-600 bg-transparent px-3 py-2 flex items-center gap-2 hover:border-[#c5f82a] hover:text-[#c5f82a] transition-colors"
            >
              <div className="w-8 h-8 brutal-border border-gray-600 border-dashed flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-brutal font-bold text-sm">Add more</span>
            </Link>
          </div>

          {/* AI Confidence Indicator */}
          <div className="brutal-border border-gray-700 bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#c5f82a]" />
                <span className="font-mono-brutal text-sm">RECOMMENDATION CONFIDENCE</span>
              </div>
              <span className="font-brutal text-2xl font-black text-[#c5f82a]">{confidenceScore}%</span>
            </div>
            <div className="w-full bg-gray-700 h-3 brutal-border border-gray-600">
              <div
                className="bg-[#c5f82a] h-full transition-all duration-500"
                style={{ width: `${confidenceScore}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-mono-brutal text-xs text-gray-500">
                Based on {accountsConnected} connected accounts
              </span>
              <Link
                href="/designs/design-4-neobrutalism/connect"
                className="font-mono-brutal text-xs text-[#c5f82a] hover:underline"
              >
                Connect mortgage for +6% confidence
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-3 mt-4">
            <Link
              href="/designs/design-4-neobrutalism/connect"
              className="font-mono-brutal text-sm flex items-center gap-1 text-gray-400 hover:text-[#c5f82a] transition-colors"
            >
              Connect more accounts <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/designs/design-4-neobrutalism/graph"
              className="font-mono-brutal text-sm flex items-center gap-1 text-gray-400 hover:text-[#c5f82a] transition-colors"
            >
              See your money map <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Top Row - Health Score & Net Worth */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Financial Health Score */}
          <div className="brutal-border-thick bg-black text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="font-mono-brutal text-[#c5f82a] text-sm">FINANCIAL HEALTH SCORE</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-brutal text-6xl font-black text-[#c5f82a]">{mockUser.healthScore}</span>
                  <span className="font-brutal text-2xl text-gray-400">/100</span>
                </div>
              </div>
              <div className="w-24 h-24 brutal-border border-white relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#333"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#c5f82a"
                    strokeWidth="8"
                    strokeDasharray={`${(mockUser.healthScore / 100) * 251.2} 251.2`}
                  />
                </svg>
              </div>
            </div>
            <div className="w-full bg-gray-700 h-4 brutal-border border-white">
              <div
                className="bg-[#c5f82a] h-full transition-all duration-500"
                style={{ width: `${mockUser.healthScore}%` }}
              />
            </div>
            <p className="font-mono-brutal text-sm text-gray-400 mt-3">
              Room for improvement. Let&apos;s fix that.
            </p>
          </div>

          {/* Net Worth */}
          <div className="brutal-border-thick bg-[#c5f82a] p-6">
            <span className="font-mono-brutal text-black text-sm">NET WORTH</span>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="font-brutal text-5xl md:text-6xl font-black">
                ${mockUser.netWorth.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 brutal-border bg-white px-3 py-2 inline-block">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="font-mono-brutal text-sm font-bold">+$4,200 this month</span>
            </div>
            <p className="font-brutal text-sm mt-4">
              You&apos;re building wealth. Not fast enough though. Let&apos;s accelerate.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="brutal-border bg-white p-4 brutal-shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <Icon className="w-5 h-5 text-gray-600" />
                  {stat.trend && (
                    stat.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )
                  )}
                </div>
                <div className="font-brutal text-2xl md:text-3xl font-black">{stat.value}</div>
                <div className="font-mono-brutal text-xs text-gray-500 uppercase">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Top 3 Priority Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-brutal text-2xl font-black uppercase tracking-tight">
              TOP 3 PRIORITY ACTIONS
            </h2>
            <Link
              href="/designs/design-4-neobrutalism/recommendations"
              className="font-mono-brutal text-sm flex items-center gap-1 hover:text-[#c5f82a] transition-colors"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {topActions.map((action) => (
              <Link
                key={action.id}
                href="/designs/design-4-neobrutalism/recommendations"
                className="block brutal-border bg-white p-4 md:p-6 brutal-shadow-sm brutal-shadow-hover brutal-shadow-active hover:bg-gray-50 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 brutal-border flex items-center justify-center flex-shrink-0 ${
                      action.status === "urgent"
                        ? "bg-red-500 text-white"
                        : action.status === "high"
                        ? "bg-orange-500 text-white"
                        : "bg-[#c5f82a]"
                    }`}
                  >
                    <span className="font-mono-brutal text-xl font-bold">{action.priority}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {action.status === "urgent" && (
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      )}
                      <h3 className="font-brutal text-xl font-black group-hover:text-[#c5f82a] transition-colors">
                        {action.title}
                      </h3>
                    </div>
                    <p className="font-brutal text-gray-600">{action.subtitle}</p>
                    <div className="mt-1">
                      <span className="font-mono-brutal text-xs text-gray-400">
                        Source: {action.dataSource}
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-4">
                    <div className="brutal-border bg-[#c5f82a] px-3 py-1">
                      <span className="font-mono-brutal text-sm font-bold">{action.impact}</span>
                    </div>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Your Advisor Says - Updated with data-driven insights */}
        <div className="brutal-border-thick bg-black text-white p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 brutal-border border-white bg-[#c5f82a] flex items-center justify-center">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <div>
              <span className="font-mono-brutal text-[#c5f82a] text-sm">YOUR ADVISOR SAYS</span>
              <h3 className="font-brutal text-xl font-black">DATA-DRIVEN INSIGHTS FOR {mockUser.name.toUpperCase()}</h3>
            </div>
          </div>

          {/* Data-Driven Insights Cards */}
          <div className="space-y-4 mb-6">
            {advisorInsights.map((insight, index) => (
              <div key={index} className="brutal-border border-gray-700 bg-gray-900 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 brutal-border border-gray-600 bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <span className="font-mono-brutal text-[#c5f82a] text-sm font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-mono-brutal text-xs text-gray-500 mb-1">
                      Based on your {insight.source}:
                    </div>
                    <p className="font-brutal text-lg leading-relaxed mb-2">{insight.insight}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-brutal text-[#c5f82a] font-bold">{insight.action}</span>
                      <span className="brutal-border border-green-600 bg-green-900 text-green-400 px-2 py-1 font-mono-brutal text-xs">
                        Save {insight.savings}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-700 pt-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="font-brutal text-lg">
                  <span className="text-[#c5f82a]">Bottom line:</span> Your connected accounts reveal{" "}
                  <span className="bg-[#c5f82a] text-black px-1 font-bold">$4,180/yr</span> in potential savings.
                  That&apos;s what advisors charge 1% to tell you.
                </p>
              </div>
              <Link
                href="/designs/design-4-neobrutalism/recommendations"
                className="inline-flex items-center gap-2 font-brutal font-bold px-6 py-3 bg-[#c5f82a] text-black brutal-border border-white brutal-shadow-accent brutal-shadow-hover brutal-shadow-active hover:bg-white transition-colors flex-shrink-0"
              >
                ACT NOW
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="font-mono-brutal text-xs text-gray-500">
              Insights generated from {accountsConnected} connected accounts.{" "}
              <Link href="/designs/design-4-neobrutalism/connect" className="text-[#c5f82a] hover:underline">
                Connect more for deeper analysis.
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="brutal-border-thick border-b-0 border-l-0 border-r-0 bg-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono-brutal text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ClearMoney. No financial advisors were harmed.
          </p>
          <div className="brutal-border px-3 py-1 bg-white">
            <span className="font-mono-brutal text-xs">0% AFFILIATE BIAS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
