"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Check,
  CreditCard,
  LineChart,
  PiggyBank,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";

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

// Mock net worth history data (12 months)
const netWorthData = [
  { month: "Feb 25", netWorth: 62500, assets: 95000, debt: 32500 },
  { month: "Mar 25", netWorth: 65200, assets: 97500, debt: 32300 },
  { month: "Apr 25", netWorth: 68100, assets: 100200, debt: 32100 },
  { month: "May 25", netWorth: 70800, assets: 103000, debt: 32200 },
  { month: "Jun 25", netWorth: 72400, assets: 105500, debt: 33100 },
  { month: "Jul 25", netWorth: 74900, assets: 108200, debt: 33300 },
  { month: "Aug 25", netWorth: 77600, assets: 111000, debt: 33400 },
  { month: "Sep 25", netWorth: 79300, assets: 113500, debt: 34200 },
  { month: "Oct 25", netWorth: 81800, assets: 116000, debt: 34200 },
  { month: "Nov 25", netWorth: 83500, assets: 118000, debt: 34500 },
  { month: "Dec 25", netWorth: 85060, assets: 119500, debt: 34440 },
  { month: "Jan 26", netWorth: 87400, assets: 121400, debt: 34000 },
];

// Savings rate data
const savingsRateData = [
  { month: "Feb 25", rate: 18 },
  { month: "Mar 25", rate: 19 },
  { month: "Apr 25", rate: 20 },
  { month: "May 25", rate: 19 },
  { month: "Jun 25", rate: 21 },
  { month: "Jul 25", rate: 20 },
  { month: "Aug 25", rate: 22 },
  { month: "Sep 25", rate: 21 },
  { month: "Oct 25", rate: 23 },
  { month: "Nov 25", rate: 22 },
  { month: "Dec 25", rate: 21 },
  { month: "Jan 26", rate: 22 },
];

// Milestones data
const milestones = [
  {
    id: 1,
    title: "Started Your Journey",
    description: "Completed onboarding and set your financial goals",
    date: "Jan 15, 2026",
    completed: true,
    icon: Sparkles,
  },
  {
    id: 2,
    title: "Emergency Fund Foundation",
    description: "Reached $10,000 in emergency savings",
    date: "Mar 2025",
    completed: true,
    icon: PiggyBank,
  },
  {
    id: 3,
    title: "401(k) Milestone",
    description: "Crossed $75,000 in retirement savings",
    date: "Jul 2025",
    completed: true,
    icon: TrendingUp,
  },
  {
    id: 4,
    title: "Maxed Roth IRA",
    description: "Contributed the full $7,000 for 2026",
    date: "Jan 2026",
    completed: true,
    icon: Trophy,
  },
  {
    id: 5,
    title: "Credit Card Freedom",
    description: "Eliminate all credit card debt",
    date: "Target: Sep 2026",
    completed: false,
    icon: CreditCard,
  },
  {
    id: 6,
    title: "3-Month Emergency Fund",
    description: "Reach $19,500 in emergency reserves",
    date: "Target: Jan 2027",
    completed: false,
    icon: PiggyBank,
  },
  {
    id: 7,
    title: "$100K Net Worth",
    description: "Cross the six-figure milestone",
    date: "Target: Q3 2026",
    completed: false,
    icon: Target,
  },
];

// Achievements data
const achievements = [
  {
    title: "Consistent Saver",
    description: "Maintained 20%+ savings rate for 6 months",
    icon: PiggyBank,
    earned: true,
  },
  {
    title: "Retirement Focused",
    description: "Maximized employer 401(k) match",
    icon: TrendingUp,
    earned: true,
  },
  {
    title: "Roth Champion",
    description: "Maxed out Roth IRA contribution",
    icon: Trophy,
    earned: true,
  },
  {
    title: "Debt Slayer",
    description: "Paid off a debt account completely",
    icon: CreditCard,
    earned: false,
  },
];

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; dataKey: string }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-4 py-3 rounded-lg shadow-lg"
        style={{
          backgroundColor: emerald[900],
          border: `1px solid ${emerald[700]}`,
        }}
      >
        <p className="text-sm font-medium mb-1" style={{ color: emerald[300] }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: emerald[100] }}>
            {entry.dataKey === "netWorth" && "Net Worth: "}
            {entry.dataKey === "rate" && "Savings Rate: "}
            {entry.dataKey === "assets" && "Assets: "}
            {entry.dataKey === "debt" && "Debt: "}
            {entry.dataKey === "rate" ? `${entry.value}%` : `$${entry.value.toLocaleString()}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

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
              { label: "Dashboard", href: "/designs/design-10-monochrome/dashboard" },
              { label: "Recommendations", href: "/designs/design-10-monochrome/recommendations" },
              { label: "Progress", href: "/designs/design-10-monochrome/progress", active: true },
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

// Net worth chart component
function NetWorthChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="p-6 rounded-xl"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl mb-1" style={{ color: emerald[100] }}>
            Net Worth Trajectory
          </h2>
          <p className="text-sm" style={{ color: emerald[500] }}>
            12-month historical view
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpRight className="w-5 h-5" style={{ color: emerald[400] }} />
          <span className="font-medium" style={{ color: emerald[400] }}>
            +$24,900 (39.8%)
          </span>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={netWorthData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={emerald[500]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={emerald[500]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={emerald[900]} />
            <XAxis
              dataKey="month"
              stroke={emerald[700]}
              tick={{ fill: emerald[500], fontSize: 12 }}
              tickLine={{ stroke: emerald[800] }}
            />
            <YAxis
              stroke={emerald[700]}
              tick={{ fill: emerald[500], fontSize: 12 }}
              tickLine={{ stroke: emerald[800] }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="netWorth"
              stroke={emerald[500]}
              strokeWidth={2}
              fill="url(#netWorthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t" style={{ borderColor: emerald[900] }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emerald[500] }} />
          <span className="text-sm" style={{ color: emerald[400] }}>
            Net Worth
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Savings rate chart component
function SavingsRateChart() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="p-6 rounded-xl"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-xl mb-1" style={{ color: emerald[100] }}>
            Savings Rate
          </h2>
          <p className="text-sm" style={{ color: emerald[500] }}>
            Percentage of income saved
          </p>
        </div>
        <div
          className="px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: emerald[800], color: emerald[200] }}
        >
          Current: 22%
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={savingsRateData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={emerald[900]} />
            <XAxis
              dataKey="month"
              stroke={emerald[700]}
              tick={{ fill: emerald[500], fontSize: 12 }}
              tickLine={{ stroke: emerald[800] }}
            />
            <YAxis
              stroke={emerald[700]}
              tick={{ fill: emerald[500], fontSize: 12 }}
              tickLine={{ stroke: emerald[800] }}
              tickFormatter={(value) => `${value}%`}
              domain={[15, 25]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={emerald[400]}
              strokeWidth={2}
              dot={{ fill: emerald[400], strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: emerald[300] }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

// Milestone timeline component
function MilestoneTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="p-6 rounded-xl"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-5 h-5" style={{ color: emerald[400] }} />
        <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
          Milestones
        </h2>
      </div>

      <div className="space-y-0">
        {milestones.map((milestone, index) => {
          const Icon = milestone.icon;
          const isLast = index === milestones.length - 1;

          return (
            <motion.div
              key={milestone.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Timeline line */}
              {!isLast && (
                <div
                  className="absolute left-5 top-12 w-0.5 h-full -ml-px"
                  style={{
                    backgroundColor: milestone.completed ? emerald[700] : emerald[900],
                  }}
                />
              )}

              {/* Icon */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10"
                style={{
                  backgroundColor: milestone.completed ? emerald[700] : emerald[900],
                  border: `2px solid ${milestone.completed ? emerald[500] : emerald[800]}`,
                }}
              >
                {milestone.completed ? (
                  <Check className="w-5 h-5" style={{ color: emerald[200] }} />
                ) : (
                  <Icon className="w-5 h-5" style={{ color: emerald[600] }} />
                )}
              </div>

              {/* Content */}
              <div className={`flex-1 pb-8 ${isLast ? "pb-0" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className="font-medium mb-1"
                      style={{
                        color: milestone.completed ? emerald[200] : emerald[400],
                      }}
                    >
                      {milestone.title}
                    </h3>
                    <p className="text-sm" style={{ color: emerald[600] }}>
                      {milestone.description}
                    </p>
                  </div>
                  <span
                    className="text-xs font-medium flex-shrink-0"
                    style={{
                      color: milestone.completed ? emerald[500] : emerald[600],
                    }}
                  >
                    {milestone.date}
                  </span>
                </div>

                {milestone.completed && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="mt-2"
                  >
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: emerald[800], color: emerald[300] }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Achieved
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Achievements component
function AchievementsSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="p-6 rounded-xl"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5" style={{ color: emerald[400] }} />
        <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
          Achievements
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
              className="p-4 rounded-lg flex items-start gap-3"
              style={{
                backgroundColor: achievement.earned ? emerald[800] + "30" : emerald[900] + "40",
                border: `1px solid ${achievement.earned ? emerald[700] : emerald[900]}`,
                opacity: achievement.earned ? 1 : 0.6,
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: achievement.earned ? emerald[700] : emerald[900],
                }}
              >
                <Icon className="w-5 h-5" style={{ color: achievement.earned ? emerald[200] : emerald[600] }} />
              </div>
              <div>
                <h3 className="font-medium mb-0.5" style={{ color: achievement.earned ? emerald[200] : emerald[500] }}>
                  {achievement.title}
                </h3>
                <p className="text-xs" style={{ color: emerald[600] }}>
                  {achievement.description}
                </p>
              </div>
              {achievement.earned && (
                <Check className="w-4 h-4 flex-shrink-0 ml-auto" style={{ color: emerald[400] }} />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// Wealth journey narrative
function WealthJourneySection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="p-6 rounded-xl"
      style={{
        backgroundColor: emerald[900] + "40",
        border: `1px solid ${emerald[800]}`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <LineChart className="w-5 h-5" style={{ color: emerald[400] }} />
        <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
          Your Wealth Journey
        </h2>
      </div>

      <div className="space-y-4">
        <p style={{ color: emerald[300] }}>
          Over the past year, you&apos;ve made remarkable progress on your financial journey. Your net worth has grown by{" "}
          <span className="font-medium" style={{ color: emerald[200] }}>
            $24,900
          </span>
          , representing a{" "}
          <span className="font-medium" style={{ color: emerald[200] }}>
            39.8% increase
          </span>
          .
        </p>

        <p style={{ color: emerald[400] }}>
          Your consistent savings rate of 22% places you well above the national average of 4.6%. At this pace, combined
          with market returns, you&apos;re on track to reach{" "}
          <span className="font-medium" style={{ color: emerald[300] }}>
            $100,000 net worth
          </span>{" "}
          by Q3 2026.
        </p>

        <div
          className="p-4 rounded-lg mt-4"
          style={{ backgroundColor: emerald[950], border: `1px solid ${emerald[900]}` }}
        >
          <h4 className="text-sm font-medium mb-2" style={{ color: emerald[300] }}>
            Next Milestones
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm" style={{ color: emerald[400] }}>
              <Target className="w-4 h-4" style={{ color: emerald[500] }} />
              Credit card debt elimination: ~8 months
            </li>
            <li className="flex items-center gap-2 text-sm" style={{ color: emerald[400] }}>
              <Target className="w-4 h-4" style={{ color: emerald[500] }} />
              3-month emergency fund: ~12 months
            </li>
            <li className="flex items-center gap-2 text-sm" style={{ color: emerald[400] }}>
              <Target className="w-4 h-4" style={{ color: emerald[500] }} />
              $100K net worth: ~8 months
            </li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

// Main progress page
export default function ProgressPage() {
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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4" style={{ color: emerald[500] }} />
              <span className="text-sm" style={{ color: emerald[500] }}>
                Your Progress
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white mb-3">
              Your <span className="italic" style={{ color: emerald[400] }}>Wealth</span> Journey
            </h1>
            <p style={{ color: emerald[400] }}>
              Track your financial growth, celebrate milestones, and visualize your path to financial freedom.
            </p>
          </motion.div>

          {/* Summary stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="grid sm:grid-cols-4 gap-4 mb-8"
          >
            {[
              {
                label: "Current Net Worth",
                value: "$87,400",
                change: "+$24,900 (12mo)",
                positive: true,
              },
              {
                label: "Savings Rate",
                value: "22%",
                change: "+4% vs avg",
                positive: true,
              },
              {
                label: "Debt Reduced",
                value: "$2,500",
                change: "This year",
                positive: true,
              },
              {
                label: "Milestones",
                value: "4/7",
                change: "Completed",
                positive: true,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: emerald[950],
                  border: `1px solid ${emerald[900]}`,
                }}
              >
                <p className="text-sm mb-1" style={{ color: emerald[500] }}>
                  {stat.label}
                </p>
                <p className="font-serif text-2xl font-medium mb-1" style={{ color: emerald[100] }}>
                  {stat.value}
                </p>
                <div className="flex items-center gap-1">
                  {stat.positive ? (
                    <ArrowUpRight className="w-3.5 h-3.5" style={{ color: emerald[400] }} />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                  )}
                  <span className="text-xs" style={{ color: stat.positive ? emerald[400] : "#ef4444" }}>
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Charts grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <NetWorthChart />
            <SavingsRateChart />
          </div>

          {/* Milestones and achievements */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            <MilestoneTimeline />
            <div className="space-y-6">
              <AchievementsSection />
              <WealthJourneySection />
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="p-6 rounded-xl text-center"
            style={{
              backgroundColor: emerald[950],
              border: `1px solid ${emerald[900]}`,
            }}
          >
            <Trophy className="w-8 h-8 mx-auto mb-4" style={{ color: emerald[500] }} />
            <h3 className="font-serif text-xl mb-2" style={{ color: emerald[100] }}>
              Keep building momentum
            </h3>
            <p className="text-sm mb-4" style={{ color: emerald[400] }}>
              You&apos;re making excellent progress. Review your recommendations to accelerate your journey.
            </p>
            <Link
              href="/designs/design-10-monochrome/recommendations"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                backgroundColor: emerald[500],
                color: emerald[950],
              }}
            >
              View Recommendations <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </main>
      </div>
    </>
  );
}
