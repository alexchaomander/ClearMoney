"use client";

import { useState } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Check,
  Circle,
  Award,
  Calendar,
  Sparkles,
} from "lucide-react";
import {
  colors,
  GradientBlob,
  GlobalStyles,
  NoiseTexture,
  AppNavigation,
  mockUser,
} from "../shared";

// ============================================================================
// PROGRESS PAGE
// ============================================================================
// Clean progress tracking with:
// - Net worth chart (Recharts)
// - Milestones checklist with dates
// - Key metrics trending (savings rate, debt reduction)
// - Encouraging "You're making progress" section
// - Time period selector (3M, 6M, 1Y, All)
// ============================================================================

type TimePeriod = "3M" | "6M" | "1Y" | "ALL";

// Generate mock historical data
const generateNetWorthData = (months: number) => {
  const data = [];
  let netWorth = mockUser.netWorth - months * 2100; // Approximate past values

  for (let i = months; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthName = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    // Add some variance
    const variance = (Math.random() - 0.3) * 1000;
    netWorth += 2100 + variance;

    data.push({
      month: monthName,
      netWorth: Math.round(netWorth),
      assets: Math.round(netWorth * 1.5),
      debts: Math.round(netWorth * 0.5),
    });
  }

  return data;
};

const allData = generateNetWorthData(24);
const dataByPeriod: Record<TimePeriod, typeof allData> = {
  "3M": allData.slice(-4),
  "6M": allData.slice(-7),
  "1Y": allData.slice(-13),
  ALL: allData,
};

// Milestones data
const milestones = [
  {
    id: 1,
    title: "Started tracking finances",
    date: "Oct 2024",
    completed: true,
    type: "start",
  },
  {
    id: 2,
    title: "Opened high-yield savings account",
    date: "Oct 2024",
    completed: true,
    type: "action",
  },
  {
    id: 3,
    title: "Increased 401k contribution to 6%",
    date: "Nov 2024",
    completed: true,
    type: "action",
  },
  {
    id: 4,
    title: "Emergency fund reached 1 month",
    date: "Dec 2024",
    completed: true,
    type: "milestone",
  },
  {
    id: 5,
    title: "Net worth hit $80,000",
    date: "Dec 2024",
    completed: true,
    type: "milestone",
  },
  {
    id: 6,
    title: "Emergency fund reached 2 months",
    date: "Jan 2025",
    completed: false,
    type: "milestone",
    progress: 85,
  },
  {
    id: 7,
    title: "Net worth hit $100,000",
    date: "Target: Mar 2025",
    completed: false,
    type: "milestone",
    progress: 87,
  },
  {
    id: 8,
    title: "Max out Roth IRA",
    date: "Target: Dec 2025",
    completed: false,
    type: "goal",
    progress: 64,
  },
];

// Key metrics with trends
const keyMetrics = [
  {
    label: "Net Worth",
    current: mockUser.netWorth,
    previous: mockUser.netWorth - 2340,
    change: 2340,
    changePercent: 2.7,
    format: "currency",
  },
  {
    label: "Savings Rate",
    current: mockUser.savingsRate,
    previous: mockUser.savingsRate - 2,
    change: 2,
    changePercent: 10,
    format: "percent",
  },
  {
    label: "Total Debt",
    current: Object.values(mockUser.debts).reduce((a, b) => a + b, 0),
    previous: Object.values(mockUser.debts).reduce((a, b) => a + b, 0) + 1200,
    change: -1200,
    changePercent: -2.5,
    format: "currency",
    invertColors: true,
  },
  {
    label: "401k Balance",
    current: mockUser.assets["401k"],
    previous: mockUser.assets["401k"] - 1850,
    change: 1850,
    changePercent: 2.8,
    format: "currency",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

// ============================================================================
// CHART TOOLTIP
// ============================================================================

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; dataKey: string }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-4 rounded-xl shadow-lg"
        style={{
          backgroundColor: colors.bgAlt,
          border: `1px solid ${colors.border}`,
        }}
      >
        <p className="text-sm font-medium mb-2" style={{ color: colors.text }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <p
            key={index}
            className="text-sm"
            style={{
              color:
                entry.dataKey === "netWorth"
                  ? colors.accent
                  : entry.dataKey === "assets"
                  ? colors.success
                  : colors.warning,
            }}
          >
            {entry.dataKey === "netWorth"
              ? "Net Worth"
              : entry.dataKey === "assets"
              ? "Assets"
              : "Debts"}
            : {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// ============================================================================
// MAIN PROGRESS PAGE
// ============================================================================

export default function ProgressPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("1Y");
  const chartData = dataByPeriod[timePeriod];

  const netWorthChange = chartData[chartData.length - 1].netWorth - chartData[0].netWorth;
  const netWorthChangePercent = (netWorthChange / chartData[0].netWorth) * 100;

  return (
    <>
      <GlobalStyles />

      <div className="min-h-screen relative" style={{ backgroundColor: colors.bg }}>
        {/* Gradient blobs */}
        <GradientBlob
          color={colors.blob4}
          size={600}
          top="-5%"
          right="-10%"
          opacity={0.2}
          blur={100}
        />
        <GradientBlob
          color={colors.blob1}
          size={500}
          bottom="15%"
          left="-10%"
          opacity={0.15}
          blur={90}
        />

        <NoiseTexture />
        <AppNavigation currentPage="progress" />

        {/* Main content */}
        <main className="relative z-10 pt-28 pb-16 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: colors.text }}>
                Your Progress
              </h1>
              <p className="text-xl" style={{ color: colors.textMuted }}>
                Track your journey to financial independence
              </p>
            </div>

            {/* Encouragement card */}
            <div
              className="p-8 rounded-3xl mb-8"
              style={{
                background: `linear-gradient(135deg, ${colors.accent}10 0%, ${colors.blob4}10 100%)`,
                border: `1px solid ${colors.accent}30`,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`,
                  }}
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                    You&apos;re making great progress, {mockUser.name}!
                  </h2>
                  <p className="text-lg" style={{ color: colors.textMuted }}>
                    Your net worth has increased by{" "}
                    <span className="font-semibold" style={{ color: colors.success }}>
                      {formatCurrency(netWorthChange)}
                    </span>{" "}
                    ({netWorthChangePercent.toFixed(1)}%) over the selected period.
                    Keep up the momentum!
                  </p>
                </div>
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {keyMetrics.map((metric) => {
                const isPositive = metric.invertColors
                  ? metric.change < 0
                  : metric.change > 0;
                return (
                  <div
                    key={metric.label}
                    className="p-6 rounded-2xl"
                    style={{
                      backgroundColor: colors.bgAlt,
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm" style={{ color: colors.textMuted }}>
                        {metric.label}
                      </p>
                      <div
                        className="flex items-center gap-1 px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: isPositive
                            ? `${colors.success}15`
                            : `${colors.warning}15`,
                        }}
                      >
                        {isPositive ? (
                          <TrendingUp
                            className="w-3 h-3"
                            style={{ color: colors.success }}
                          />
                        ) : (
                          <TrendingDown
                            className="w-3 h-3"
                            style={{ color: colors.warning }}
                          />
                        )}
                        <span
                          className="text-xs font-semibold"
                          style={{
                            color: isPositive ? colors.success : colors.warning,
                          }}
                        >
                          {metric.changePercent > 0 ? "+" : ""}
                          {metric.changePercent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: colors.text }}>
                      {metric.format === "currency"
                        ? formatCurrency(metric.current)
                        : `${metric.current}%`}
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.textLight }}>
                      {metric.change > 0 ? "+" : ""}
                      {metric.format === "currency"
                        ? formatCurrency(metric.change)
                        : `${metric.change}%`}{" "}
                      this month
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Charts grid */}
            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Net Worth Chart */}
              <div
                className="lg:col-span-2 p-8 rounded-3xl"
                style={{
                  backgroundColor: colors.bgAlt,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                      Net Worth Over Time
                    </h3>
                    <p className="text-sm" style={{ color: colors.textMuted }}>
                      Assets minus debts
                    </p>
                  </div>

                  {/* Time period selector */}
                  <div className="flex gap-1 p-1 rounded-lg" style={{ backgroundColor: colors.bg }}>
                    {(["3M", "6M", "1Y", "ALL"] as TimePeriod[]).map((period) => (
                      <button
                        key={period}
                        onClick={() => setTimePeriod(period)}
                        className="px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200"
                        style={{
                          backgroundColor:
                            timePeriod === period ? colors.bgAlt : "transparent",
                          color: timePeriod === period ? colors.text : colors.textMuted,
                          boxShadow:
                            timePeriod === period
                              ? "0 1px 3px rgba(0,0,0,0.1)"
                              : "none",
                        }}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={colors.accent} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={colors.border}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: colors.textMuted, fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: colors.border }}
                      />
                      <YAxis
                        tick={{ fill: colors.textMuted, fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="netWorth"
                        stroke={colors.accent}
                        strokeWidth={3}
                        fill="url(#netWorthGradient)"
                        dot={false}
                        activeDot={{
                          r: 6,
                          fill: colors.accent,
                          stroke: colors.bgAlt,
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Milestones */}
              <div
                className="p-8 rounded-3xl"
                style={{
                  backgroundColor: colors.bgAlt,
                  border: `1px solid ${colors.border}`,
                }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${colors.success}15` }}
                  >
                    <Award className="w-5 h-5" style={{ color: colors.success }} />
                  </div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                    Milestones
                  </h3>
                </div>

                <div className="space-y-4">
                  {milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: milestone.completed
                              ? colors.success
                              : `${colors.accent}15`,
                            border: milestone.completed
                              ? "none"
                              : `2px solid ${colors.accent}`,
                          }}
                        >
                          {milestone.completed ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : (
                            <Circle
                              className="w-3 h-3"
                              style={{ color: colors.accent }}
                            />
                          )}
                        </div>
                        {index < milestones.length - 1 && (
                          <div
                            className="w-0.5 h-8 mt-1"
                            style={{
                              backgroundColor: milestone.completed
                                ? colors.success
                                : colors.border,
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p
                          className={`font-medium ${
                            milestone.completed ? "" : ""
                          }`}
                          style={{
                            color: milestone.completed
                              ? colors.text
                              : colors.text,
                          }}
                        >
                          {milestone.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar
                            className="w-3 h-3"
                            style={{ color: colors.textLight }}
                          />
                          <span
                            className="text-sm"
                            style={{ color: colors.textMuted }}
                          >
                            {milestone.date}
                          </span>
                        </div>
                        {!milestone.completed && milestone.progress && (
                          <div className="mt-2">
                            <div
                              className="w-full h-1.5 rounded-full overflow-hidden"
                              style={{ backgroundColor: colors.border }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${milestone.progress}%`,
                                  backgroundColor: colors.accent,
                                }}
                              />
                            </div>
                            <p
                              className="text-xs mt-1"
                              style={{ color: colors.textLight }}
                            >
                              {milestone.progress}% complete
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Savings breakdown */}
            <div
              className="p-8 rounded-3xl"
              style={{
                backgroundColor: colors.bgAlt,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                    Savings Breakdown
                  </h3>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    How your money is allocated across accounts
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    Total Assets
                  </p>
                  <p className="text-2xl font-bold" style={{ color: colors.success }}>
                    {formatCurrency(
                      Object.values(mockUser.assets).reduce((a, b) => a + b, 0)
                    )}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(mockUser.assets).map(([key, value]) => {
                  const total = Object.values(mockUser.assets).reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  const labels: Record<string, string> = {
                    checking: "Checking",
                    savings: "Savings / HYSA",
                    "401k": "401(k)",
                    rothIra: "Roth IRA",
                    brokerage: "Brokerage",
                    crypto: "Crypto",
                  };
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-xl"
                      style={{ backgroundColor: colors.bg }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: colors.text }}>
                          {labels[key] || key}
                        </span>
                        <span className="text-sm" style={{ color: colors.textMuted }}>
                          {percentage}%
                        </span>
                      </div>
                      <p className="text-xl font-bold" style={{ color: colors.text }}>
                        {formatCurrency(value)}
                      </p>
                      <div
                        className="w-full h-1.5 rounded-full mt-2 overflow-hidden"
                        style={{ backgroundColor: colors.border }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: colors.accent,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
