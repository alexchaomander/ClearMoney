"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  ChevronRight,
  CreditCard,
  DollarSign,
  LineChart,
  Link2,
  Plus,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

// Emerald color palette
const emerald = {
  950: "#022c22",
  900: "#064e3b",
  800: "#065f46",
  700: "#047857",
  600: "#059669",
  500: "#10b981",
  400: "#34d399",
  300: "#6ee7b7",
  200: "#a7f3d0",
  100: "#d1fae5",
  50: "#ecfdf5",
};

// Mock user data
const mockUser = {
  name: "Sarah",
  age: 32,
  occupation: "Software Engineer",
  memberSince: "January 2026",
};

// Mock financial data
const mockFinancials = {
  income: 150000,
  savingsRate: 22,
  totalAssets: 121400,
  totalDebt: 34000,
  netWorth: 87400,
  healthScore: 72,
  monthlyExpenses: 6500,
  emergencyFund: 15000,
  targetEmergencyFund: 19500, // 3 months expenses
  retirement401k: 78000,
  rothIra: 18400,
  brokerage: 10000,
  creditCardDebt: 4000,
  studentLoans: 30000,
};

// Top priorities - data-driven from connected accounts
const priorities = [
  {
    id: 1,
    title: "Maximize 401(k) Match",
    description: "Your Fidelity 401(k) analysis indicates $3,600 in uncaptured employer contributions",
    impact: "high",
    category: "Investing",
    icon: Shield,
    savings: "$3,600/year",
    source: "Fidelity 401(k)",
  },
  {
    id: 2,
    title: "Accelerate Credit Card Payoff",
    description: "American Express statement review identifies 4 negotiable recurring charges",
    impact: "high",
    category: "Debt",
    icon: CreditCard,
    savings: "$880/year",
    source: "American Express",
  },
  {
    id: 3,
    title: "Optimize Recurring Expenses",
    description: "Analysis of your Chase transactions reveals $340 in dormant subscriptions",
    impact: "medium",
    category: "Savings",
    icon: Wallet,
    savings: "$340/year",
    source: "Chase Checking",
  },
];

// Connected accounts for unified view
const connectedAccounts = [
  { id: "chase", name: "Chase", logo: "C", connected: true },
  { id: "fidelity", name: "Fidelity", logo: "F", connected: true },
  { id: "amex", name: "Amex", logo: "A", connected: true },
  { id: "student-loans", name: "Student Loans", logo: "S", connected: true },
  { id: "savings", name: "Ally Savings", logo: "A", connected: true },
];

// Stagger animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1 as const,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// Navigation component
function Navigation() {
  return (
    <header
      className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b"
      style={{ borderColor: emerald[900] + "60" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/designs/design-10-monochrome" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{ backgroundColor: emerald[800] }}
            >
              <Calculator className="w-4 h-4 text-emerald-100" />
            </div>
            <span className="font-serif text-xl tracking-tight text-white">
              Clear<span style={{ color: emerald[400] }}>Money</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {[
              { label: "Dashboard", href: "/designs/design-10-monochrome/dashboard", active: true },
              { label: "Connect", href: "/designs/design-10-monochrome/connect" },
              { label: "Graph", href: "/designs/design-10-monochrome/graph" },
              { label: "Recommendations", href: "/designs/design-10-monochrome/recommendations" },
              { label: "Profile", href: "/designs/design-10-monochrome/profile" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  color: item.active ? emerald[100] : emerald[400],
                  backgroundColor: item.active ? emerald[900] + "60" : "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

// Animated health score ring
function HealthScoreRing({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score);
    }, 500);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="relative w-52 h-52">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        {/* Background ring */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={emerald[900]}
          strokeWidth="12"
        />
        {/* Progress ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          fill="none"
          stroke={emerald[500]}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-center"
        >
          <span
            className="font-serif text-5xl font-medium"
            style={{ color: emerald[100] }}
          >
            {animatedScore}
          </span>
          <span className="text-2xl" style={{ color: emerald[500] }}>
            /100
          </span>
          <p className="text-sm mt-1" style={{ color: emerald[400] }}>
            Financial Health
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Net worth display with animation
function NetWorthDisplay({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="text-center"
    >
      <p className="text-sm font-medium mb-2" style={{ color: emerald[400] }}>
        Net Worth
      </p>
      <div className="flex items-baseline justify-center gap-1">
        <span className="text-sm" style={{ color: emerald[500] }}>
          $
        </span>
        <span
          className="font-serif text-4xl sm:text-5xl font-medium"
          style={{ color: emerald[100] }}
        >
          {displayValue.toLocaleString()}
        </span>
      </div>
      <div className="flex items-center justify-center gap-1 mt-2">
        <ArrowUpRight className="w-4 h-4" style={{ color: emerald[400] }} />
        <span className="text-sm font-medium" style={{ color: emerald[400] }}>
          +$2,340 this month
        </span>
      </div>
    </motion.div>
  );
}

// Stat card component
function StatCard({
  label,
  value,
  subtext,
  icon: Icon,
}: {
  label: string;
  value: string;
  subtext?: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  return (
    <motion.div
      variants={staggerItem}
      className="p-5 rounded-xl"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: emerald[900] }}
        >
          <Icon className="w-5 h-5" style={{ color: emerald[400] }} />
        </div>
      </div>
      <p className="text-sm mb-1" style={{ color: emerald[500] }}>
        {label}
      </p>
      <p className="font-serif text-2xl font-medium" style={{ color: emerald[100] }}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs mt-1" style={{ color: emerald[600] }}>
          {subtext}
        </p>
      )}
    </motion.div>
  );
}

// Priority card component
function PriorityCard({ priority }: { priority: typeof priorities[0] }) {
  const Icon = priority.icon;
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.02 }}
      className="group p-5 rounded-xl transition-all duration-300"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: emerald[900] }}
        >
          <Icon className="w-6 h-6" style={{ color: emerald[400] }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium" style={{ color: emerald[100] }}>
              {priority.title}
            </h3>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: priority.impact === "high" ? emerald[800] : emerald[900],
                color: priority.impact === "high" ? emerald[300] : emerald[400],
              }}
            >
              {priority.impact === "high" ? "High Impact" : "Medium Impact"}
            </span>
          </div>
          <p className="text-sm mb-3" style={{ color: emerald[400] }}>
            {priority.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium" style={{ color: emerald[500] }}>
                {priority.savings}
              </span>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: emerald[900], color: emerald[500] }}>
                via {priority.source}
              </span>
            </div>
            <Link
              href="/designs/design-10-monochrome/recommendations"
              className="flex items-center gap-1 text-sm font-medium transition-all duration-200 opacity-0 group-hover:opacity-100"
              style={{ color: emerald[400] }}
            >
              View details <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Connected Intelligence Section - Your Unified Financial View
function ConnectedIntelligenceSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.15 }}
      className="p-5 rounded-xl mb-6"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5" style={{ color: emerald[400] }} />
          <h2 className="font-serif text-lg" style={{ color: emerald[100] }}>
            Your Unified Financial View
          </h2>
        </div>
        <span className="text-xs" style={{ color: emerald[500] }}>
          5 accounts unified
        </span>
      </div>

      {/* Connected account icons with animated data flow */}
      <div className="relative py-4">
        <div className="flex items-center justify-center gap-2">
          {connectedAccounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
              className="relative"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-serif text-sm font-medium"
                style={{
                  backgroundColor: emerald[800],
                  color: emerald[100],
                  border: `1px solid ${emerald[600]}`,
                }}
              >
                {account.logo}
              </div>
              {/* Pulse animation for connected status */}
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ backgroundColor: emerald[500] }}
                animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Animated connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
          <motion.line
            x1="20%"
            y1="50%"
            x2="80%"
            y2="50%"
            stroke={emerald[500]}
            strokeWidth="2"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          />
        </svg>
      </div>

      <div className="flex items-center justify-center gap-1 mb-4">
        <span className="text-sm" style={{ color: emerald[400] }}>
          Complete context achieved
        </span>
        <Sparkles className="w-3 h-3" style={{ color: emerald[500] }} />
      </div>

      {/* Links */}
      <div className="flex items-center justify-center gap-4 pt-4 border-t" style={{ borderColor: emerald[900] }}>
        <Link
          href="/designs/design-10-monochrome/connect"
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: emerald[400] }}
        >
          <Plus className="w-4 h-4" />
          Expand your view
        </Link>
        <Link
          href="/designs/design-10-monochrome/graph"
          className="flex items-center gap-1 text-sm font-medium"
          style={{ color: emerald[400] }}
        >
          Explore constellation
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}

// Insight Precision Indicator
function InsightPrecisionIndicator() {
  const precision = 94;
  const accountsConnected = 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="p-4 rounded-xl"
      style={{
        backgroundColor: emerald[900] + "40",
        border: `1px solid ${emerald[800]}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium" style={{ color: emerald[200] }}>
          Insight Precision
        </span>
        <span className="text-sm font-medium" style={{ color: emerald[400] }}>
          {precision}%
        </span>
      </div>

      {/* Precision meter */}
      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ backgroundColor: emerald[900] }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${precision}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.7 }}
          className="h-full rounded-full"
          style={{ backgroundColor: emerald[500] }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: emerald[500] }}>
          {accountsConnected} accounts unified
        </span>
        <Link
          href="/designs/design-10-monochrome/connect"
          className="text-xs flex items-center gap-1"
          style={{ color: emerald[400] }}
        >
          Add mortgage for enhanced accuracy
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}

// Path forward section
function PathForwardSection() {
  const guidance = [
    {
      step: 1,
      title: "Capture Full Employer Match",
      description: "Your Fidelity 401(k) analysis indicates $3,600 in uncaptured employer contributions annually.",
      source: "Fidelity 401(k)",
    },
    {
      step: 2,
      title: "Eliminate High-Interest Debt",
      description: "American Express statement review identifies 4 negotiable recurring charges totaling $340/year.",
      source: "American Express",
    },
    {
      step: 3,
      title: "Optimize Dormant Subscriptions",
      description: "Analysis of your Chase transactions reveals $340 in dormant subscriptions over the past 90 days.",
      source: "Chase Checking",
    },
    {
      step: 4,
      title: "Accelerate Wealth Building",
      description: "Once fundamentals are secured, explore Mega Backdoor Roth and taxable investing strategies.",
      source: "Combined Analysis",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="p-6 rounded-xl"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Target className="w-5 h-5" style={{ color: emerald[400] }} />
        <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
          Your Path Forward
        </h2>
      </div>

      <div className="space-y-4">
        {guidance.map((item, index) => (
          <div key={item.step} className="flex gap-4">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium text-sm"
              style={{
                backgroundColor: emerald[900],
                color: emerald[400],
              }}
            >
              {item.step}
            </div>
            <div className="flex-1 pb-4" style={{ borderBottom: index < guidance.length - 1 ? `1px solid ${emerald[900]}` : "none" }}>
              <h3 className="font-medium mb-1" style={{ color: emerald[200] }}>
                {item.title}
              </h3>
              <p className="text-sm mb-2" style={{ color: emerald[500] }}>
                {item.description}
              </p>
              <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: emerald[900], color: emerald[500] }}>
                Source: {item.source}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/designs/design-10-monochrome/recommendations"
        className="mt-6 flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-all duration-200"
        style={{
          backgroundColor: emerald[800],
          color: emerald[100],
        }}
      >
        View All Recommendations <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}

// Main dashboard component
export default function DashboardPage() {
  return (
    <>
      {/* Custom fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

        .font-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="min-h-screen bg-black">
        {/* Background */}
        <div
          className="fixed inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${emerald[900]}40 0%, transparent 60%)`,
          }}
        />

        <Navigation />

        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
          {/* Welcome header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: emerald[500] }} />
              <span className="text-sm" style={{ color: emerald[500] }}>
                Welcome back
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white mb-2">
              Good evening, <span className="italic" style={{ color: emerald[400] }}>{mockUser.name}</span>
            </h1>
            <p style={{ color: emerald[400] }}>
              {mockUser.occupation}, {mockUser.age} | Member since {mockUser.memberSince}
            </p>
          </motion.div>

          {/* Main grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left column - Health score and net worth */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="p-6 rounded-xl flex flex-col items-center"
                style={{
                  backgroundColor: emerald[950],
                  border: `1px solid ${emerald[900]}`,
                }}
              >
                <HealthScoreRing score={mockFinancials.healthScore} />
                <div className="mt-6 w-full pt-6 border-t" style={{ borderColor: emerald[900] }}>
                  <NetWorthDisplay value={mockFinancials.netWorth} />
                </div>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-4"
              >
                <StatCard
                  label="Annual Income"
                  value={`$${(mockFinancials.income / 1000).toFixed(0)}K`}
                  icon={DollarSign}
                />
                <StatCard
                  label="Savings Rate"
                  value={`${mockFinancials.savingsRate}%`}
                  subtext="Above average"
                  icon={TrendingUp}
                />
                <StatCard
                  label="Total Assets"
                  value={`$${(mockFinancials.totalAssets / 1000).toFixed(0)}K`}
                  icon={Wallet}
                />
                <StatCard
                  label="Total Debt"
                  value={`$${(mockFinancials.totalDebt / 1000).toFixed(0)}K`}
                  icon={CreditCard}
                />
              </motion.div>
            </div>

            {/* Right column - Connected Intelligence, Priorities and path forward */}
            <div className="lg:col-span-2 space-y-6">
              {/* Connected Intelligence Section */}
              <ConnectedIntelligenceSection />

              {/* Top priorities */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
                    Top Priorities
                  </h2>
                  <Link
                    href="/designs/design-10-monochrome/recommendations"
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{ color: emerald[400] }}
                  >
                    View all <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-4"
                >
                  {priorities.map((priority) => (
                    <PriorityCard key={priority.id} priority={priority} />
                  ))}
                </motion.div>
              </motion.div>

              {/* Insight Precision Indicator */}
              <InsightPrecisionIndicator />

              {/* Path forward */}
              <PathForwardSection />
            </div>
          </div>

          {/* Account breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 p-6 rounded-xl"
            style={{
              backgroundColor: emerald[950],
              border: `1px solid ${emerald[900]}`,
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              <LineChart className="w-5 h-5" style={{ color: emerald[400] }} />
              <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
                Account Overview
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "401(k)", value: mockFinancials.retirement401k, type: "asset" },
                { label: "Roth IRA", value: mockFinancials.rothIra, type: "asset" },
                { label: "Brokerage", value: mockFinancials.brokerage, type: "asset" },
                { label: "Emergency Fund", value: mockFinancials.emergencyFund, type: "asset" },
              ].map((account) => (
                <div
                  key={account.label}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: emerald[900] + "40" }}
                >
                  <p className="text-sm mb-1" style={{ color: emerald[500] }}>
                    {account.label}
                  </p>
                  <p className="font-serif text-xl font-medium" style={{ color: emerald[200] }}>
                    ${account.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t" style={{ borderColor: emerald[900] }}>
              <p className="text-sm mb-3" style={{ color: emerald[500] }}>
                Outstanding Debts
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: "Student Loans", value: mockFinancials.studentLoans, rate: "5.5%" },
                  { label: "Credit Cards", value: mockFinancials.creditCardDebt, rate: "22.0%" },
                ].map((debt) => (
                  <div
                    key={debt.label}
                    className="p-4 rounded-lg flex items-center justify-between"
                    style={{ backgroundColor: emerald[900] + "30", border: `1px solid ${emerald[800]}40` }}
                  >
                    <div>
                      <p className="text-sm" style={{ color: emerald[400] }}>
                        {debt.label}
                      </p>
                      <p className="font-serif text-lg font-medium" style={{ color: emerald[200] }}>
                        ${debt.value.toLocaleString()}
                      </p>
                    </div>
                    <div
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{ backgroundColor: emerald[900], color: emerald[400] }}
                    >
                      {debt.rate} APR
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
