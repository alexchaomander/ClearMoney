"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";
import {
  TrendingUp,
  Home,
  BarChart3,
  Target,
  User,
  Menu,
  X,
  Check,
  Trophy,
  Zap,
  ArrowUp,
  ArrowDown,
  Star,
  Flag,
} from "lucide-react";

// Mock data for 6 months
const netWorthData = [
  { month: "Aug", netWorth: 71200, assets: 108000, debts: 36800 },
  { month: "Sep", netWorth: 74500, assets: 111200, debts: 36700 },
  { month: "Oct", netWorth: 78100, assets: 114500, debts: 36400 },
  { month: "Nov", netWorth: 81800, assets: 117800, debts: 36000 },
  { month: "Dec", netWorth: 84200, assets: 119200, debts: 35000 },
  { month: "Jan", netWorth: 87400, assets: 122400, debts: 35000 },
];

const savingsRateData = [
  { month: "Aug", rate: 18 },
  { month: "Sep", rate: 19 },
  { month: "Oct", rate: 20 },
  { month: "Nov", rate: 21 },
  { month: "Dec", rate: 20 },
  { month: "Jan", rate: 22 },
];

const debtPaydownData = [
  { month: "Aug", creditCard: 8000, studentLoan: 31000, carLoan: 2000 },
  { month: "Sep", creditCard: 7500, studentLoan: 30500, carLoan: 1700 },
  { month: "Oct", creditCard: 7000, studentLoan: 30000, carLoan: 1400 },
  { month: "Nov", creditCard: 6500, studentLoan: 29500, carLoan: 1000 },
  { month: "Dec", creditCard: 6000, studentLoan: 29000, carLoan: 500 },
  { month: "Jan", creditCard: 5000, studentLoan: 29000, carLoan: 0 },
];

const milestones = [
  {
    id: 1,
    title: "Paid off car loan",
    date: "Jan 2026",
    completed: true,
    impact: "Freed up $350/mo",
  },
  {
    id: 2,
    title: "Hit $50K invested",
    date: "Oct 2025",
    completed: true,
    impact: "Compounding accelerates",
  },
  {
    id: 3,
    title: "Increased savings rate to 20%",
    date: "Oct 2025",
    completed: true,
    impact: "On track for FIRE",
  },
  {
    id: 4,
    title: "Started maxing 401k match",
    date: "Sep 2025",
    completed: true,
    impact: "+$3,600/yr free money",
  },
  {
    id: 5,
    title: "Pay off credit card",
    date: "Target: Mar 2026",
    completed: false,
    impact: "Save $1,100/yr interest",
  },
  {
    id: 6,
    title: "Build 3-month emergency fund",
    date: "Target: Jun 2026",
    completed: false,
    impact: "Financial security",
  },
];

export default function ProgressPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const netWorthChange = netWorthData[netWorthData.length - 1].netWorth - netWorthData[0].netWorth;
  const netWorthChangePercent = ((netWorthChange / netWorthData[0].netWorth) * 100).toFixed(1);
  const debtPaidOff =
    debtPaydownData[0].creditCard +
    debtPaydownData[0].studentLoan +
    debtPaydownData[0].carLoan -
    (debtPaydownData[debtPaydownData.length - 1].creditCard +
      debtPaydownData[debtPaydownData.length - 1].studentLoan +
      debtPaydownData[debtPaydownData.length - 1].carLoan);
  const milestonesCompleted = milestones.filter((m) => m.completed).length;

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
              { name: "Recommendations", href: "/designs/design-4-neobrutalism/recommendations", icon: Target },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
              { name: "Progress", href: "/designs/design-4-neobrutalism/progress", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Progress";
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
              { name: "Recommendations", href: "/designs/design-4-neobrutalism/recommendations", icon: Target },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
              { name: "Progress", href: "/designs/design-4-neobrutalism/progress", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Progress";
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
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block mb-2">
            <div className="brutal-border bg-black text-[#c5f82a] px-3 py-1 font-mono-brutal text-xs">
              LAST 6 MONTHS
            </div>
          </div>
          <h1 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">
            YOUR PROGRESS
          </h1>
          <p className="font-brutal text-xl text-gray-600">
            Watching your wealth grow is better than Netflix. Here&apos;s the proof.
          </p>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="brutal-border bg-[#c5f82a] p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowUp className="w-5 h-5" />
              <span className="font-mono-brutal text-xs">NET WORTH GROWTH</span>
            </div>
            <div className="font-brutal text-3xl font-black">+${(netWorthChange / 1000).toFixed(1)}K</div>
            <div className="font-mono-brutal text-sm">+{netWorthChangePercent}%</div>
          </div>
          <div className="brutal-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowDown className="w-5 h-5 text-green-600" />
              <span className="font-mono-brutal text-xs">DEBT PAID OFF</span>
            </div>
            <div className="font-brutal text-3xl font-black text-green-600">${(debtPaidOff / 1000).toFixed(1)}K</div>
            <div className="font-mono-brutal text-sm text-gray-500">Crushing it</div>
          </div>
          <div className="brutal-border bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="font-mono-brutal text-xs">SAVINGS RATE</span>
            </div>
            <div className="font-brutal text-3xl font-black">22%</div>
            <div className="font-mono-brutal text-sm text-gray-500">+4% from Aug</div>
          </div>
          <div className="brutal-border bg-black text-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-[#c5f82a]" />
              <span className="font-mono-brutal text-xs text-[#c5f82a]">MILESTONES</span>
            </div>
            <div className="font-brutal text-3xl font-black text-[#c5f82a]">{milestonesCompleted}/{milestones.length}</div>
            <div className="font-mono-brutal text-sm text-gray-400">Completed</div>
          </div>
        </div>

        {/* Net Worth Chart */}
        <section className="mb-8">
          <div className="brutal-border-thick bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-brutal text-2xl font-black uppercase">NET WORTH OVER TIME</h2>
              <div className="brutal-border bg-[#c5f82a] px-3 py-1">
                <span className="font-mono-brutal text-sm font-bold">$87,400</span>
              </div>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontFamily: "Space Mono", fontSize: 12 }}
                    stroke="#000"
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    tick={{ fontFamily: "Space Mono", fontSize: 12 }}
                    stroke="#000"
                  />
                  <Tooltip
                    contentStyle={{
                      border: "3px solid #000",
                      borderRadius: 0,
                      fontFamily: "Space Mono",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Area
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#000"
                    strokeWidth={3}
                    fill="#c5f82a"
                    name="Net Worth"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="font-mono-brutal text-sm text-gray-500 mt-4">
              Your net worth has grown {netWorthChangePercent}% in 6 months. Keep this up and you&apos;ll be a millionaire before you know it.
            </p>
          </div>
        </section>

        {/* Two Column Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Savings Rate */}
          <div className="brutal-border bg-white p-6">
            <h3 className="font-brutal text-xl font-black uppercase mb-4">SAVINGS RATE TREND</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={savingsRateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontFamily: "Space Mono", fontSize: 10 }}
                    stroke="#000"
                  />
                  <YAxis
                    tickFormatter={(value) => `${value}%`}
                    tick={{ fontFamily: "Space Mono", fontSize: 10 }}
                    stroke="#000"
                    domain={[15, 25]}
                  />
                  <Tooltip
                    contentStyle={{
                      border: "3px solid #000",
                      borderRadius: 0,
                      fontFamily: "Space Mono",
                    }}
                    formatter={(value: number) => [`${value}%`, "Savings Rate"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="rate"
                    stroke="#c5f82a"
                    strokeWidth={4}
                    dot={{ fill: "#000", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 brutal-border bg-gray-100 p-3">
              <p className="font-brutal text-sm">
                <span className="font-bold">Target: 25%</span> - You&apos;re 3% away from optimal.
                Cut one subscription and you&apos;re there.
              </p>
            </div>
          </div>

          {/* Debt Paydown */}
          <div className="brutal-border bg-white p-6">
            <h3 className="font-brutal text-xl font-black uppercase mb-4">DEBT PAYDOWN</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={debtPaydownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontFamily: "Space Mono", fontSize: 10 }}
                    stroke="#000"
                  />
                  <YAxis
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
                    tick={{ fontFamily: "Space Mono", fontSize: 10 }}
                    stroke="#000"
                  />
                  <Tooltip
                    contentStyle={{
                      border: "3px solid #000",
                      borderRadius: 0,
                      fontFamily: "Space Mono",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                  />
                  <Bar dataKey="creditCard" stackId="a" fill="#ef4444" name="Credit Card" />
                  <Bar dataKey="studentLoan" stackId="a" fill="#f97316" name="Student Loan" />
                  <Bar dataKey="carLoan" stackId="a" fill="#eab308" name="Car Loan" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 brutal-border" />
                <span className="font-mono-brutal">CC</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 brutal-border" />
                <span className="font-mono-brutal">Student</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 brutal-border" />
                <span className="font-mono-brutal">Car</span>
              </div>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <section className="mb-8">
          <h2 className="font-brutal text-2xl font-black uppercase mb-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-[#c5f82a]" />
            MILESTONES
          </h2>
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={`brutal-border p-4 flex items-center gap-4 ${
                  milestone.completed ? "bg-[#c5f82a]" : "bg-white"
                }`}
              >
                <div
                  className={`w-10 h-10 brutal-border flex items-center justify-center flex-shrink-0 ${
                    milestone.completed ? "bg-black text-[#c5f82a]" : "bg-white"
                  }`}
                >
                  {milestone.completed ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Flag className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-brutal font-bold text-lg">{milestone.title}</h3>
                  <p className="font-mono-brutal text-sm text-gray-600">{milestone.date}</p>
                </div>
                <div className="hidden md:block brutal-border bg-white px-3 py-1">
                  <span className="font-mono-brutal text-sm">{milestone.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Motivational Section */}
        <div className="brutal-border-thick bg-black text-white p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-16 h-16 brutal-border border-white bg-[#c5f82a] flex items-center justify-center">
              <Star className="w-8 h-8 text-black" />
            </div>
            <div>
              <span className="font-mono-brutal text-[#c5f82a] text-sm">THE TRUTH</span>
              <h3 className="font-brutal text-3xl font-black">YOUR WEALTH IS GROWING</h3>
            </div>
          </div>

          <div className="space-y-4 font-brutal text-lg leading-relaxed">
            <p>
              In 6 months, you&apos;ve grown your net worth by <span className="text-[#c5f82a] font-bold">${netWorthChange.toLocaleString()}</span>.
              That&apos;s <span className="text-[#c5f82a] font-bold">${Math.round(netWorthChange / 6).toLocaleString()}/month</span>.
            </p>
            <p>
              You paid off your car loan. You increased your savings rate by 4%.
              You&apos;re not just dreaming about financial independence - you&apos;re building it.
            </p>
            <p>
              <span className="text-[#c5f82a]">Next milestone:</span> Crush that credit card debt by March.
              At this rate, you&apos;ll save another $1,100/year in interest alone.
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="font-mono-brutal text-sm text-gray-400">
              Most people go backwards. You&apos;re going forward. That&apos;s not nothing.
            </p>
            <Link
              href="/designs/design-4-neobrutalism/recommendations"
              className="inline-flex items-center gap-2 font-brutal font-bold px-6 py-3 bg-[#c5f82a] text-black brutal-border border-white brutal-shadow-accent brutal-shadow-hover brutal-shadow-active hover:bg-white transition-colors"
            >
              <Zap className="w-5 h-5" />
              KEEP THE MOMENTUM
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="brutal-border-thick border-b-0 border-l-0 border-r-0 bg-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono-brutal text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ClearMoney. Building wealth, one decision at a time.
          </p>
          <div className="brutal-border px-3 py-1 bg-white">
            <span className="font-mono-brutal text-xs">0% AFFILIATE BIAS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
