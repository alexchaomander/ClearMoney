"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Wallet,
  PiggyBank,
  CreditCard,
  Sparkles,
  ChevronRight,
  Link2,
  BarChart3,
  Zap,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  colors,
  GradientBlob,
  GlobalStyles,
  NoiseTexture,
  AppNavigation,
  mockUser,
} from "../shared";
import { DataFreshnessWidget } from "../components/DataFreshnessWidget";
import { DecisionTraceDrawer } from "../components/DecisionTraceDrawer";
import { CoverageGapsCard } from "../components/CoverageGapsCard";
import {
  mockConnections,
  mockDecisionTrace,
  mockDebtPayoffTrace,
  mockRothTrace,
  mockCoverageGaps,
  MockDecisionTrace,
} from "../mocks/platform-mocks";

// ============================================================================
// DASHBOARD PAGE
// ============================================================================
// Clean financial dashboard with:
// - Financial health score (72/100)
// - Net worth display ($87,400)
// - Prioritized action cards (Top 3)
// - Key metrics: Income, Savings Rate, Debt
// - "Your advisor recommends..." section
// - Data freshness and coverage indicators
// ============================================================================

// Format currency helper
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

// Top recommendations for dashboard - now data-driven from connected accounts
const topRecommendations = [
  {
    id: 1,
    title: "Maximize your 401k match",
    description: "You're missing $3,600 in free money from your employer each year.",
    impact: "+$3,600/yr",
    priority: "high" as const,
    link: "/designs/design-11-autonomous/recommendations",
    source: "Based on your Fidelity 401(k) data",
    trace: mockRothTrace,
  },
  {
    id: 2,
    title: "Build your emergency fund",
    description: "Currently at 1.7 months. Target is 3 months of expenses.",
    impact: "+1.3 months needed",
    priority: "high" as const,
    link: "/designs/design-11-autonomous/recommendations",
    source: "Based on your Chase Savings balance",
    trace: mockDecisionTrace,
  },
  {
    id: 3,
    title: "Pay off high-interest credit card",
    description: "Your Amex card at 22% APR costs you $110/month in interest.",
    impact: "-$1,320/yr",
    priority: "medium" as const,
    link: "/designs/design-11-autonomous/recommendations",
    source: "Based on your American Express data",
    trace: mockDebtPayoffTrace,
  },
];

// Connected accounts data (for legacy section)
const connectedAccounts = [
  { id: "chase", name: "Chase", logo: "C", color: "#1a73e8", accounts: 2 },
  { id: "fidelity", name: "Fidelity", logo: "F", color: "#4a8c3c", accounts: 1 },
  { id: "amex", name: "Amex", logo: "AE", color: "#006fcf", accounts: 1 },
  { id: "navient", name: "Navient", logo: "N", color: "#003c71", accounts: 1 },
];

// Data-driven insights from connected accounts
const dataInsights = [
  {
    id: 1,
    source: "Chase transactions",
    insight: "You have $340/month in unused subscriptions",
    icon: CreditCard,
    color: colors.warning,
  },
  {
    id: 2,
    source: "Fidelity data",
    insight: "You're capturing only 50% of your employer match",
    icon: TrendingUp,
    color: colors.accent,
  },
  {
    id: 3,
    source: "Amex history",
    insight: "4 recurring charges could be negotiated",
    icon: Zap,
    color: colors.blob2,
  },
];

// ============================================================================
// FINANCIAL HEALTH SCORE COMPONENT
// ============================================================================

function FinancialHealthScore({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.accent;
    if (score >= 40) return colors.warning;
    return colors.warningLight;
  };

  return (
    <div
      className="p-8 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <h3 className="text-lg font-semibold mb-6" style={{ color: colors.text }}>
        Financial Health Score
      </h3>

      <div className="flex items-center gap-8">
        <div className="relative">
          <svg width="160" height="160" className="-rotate-90">
            {/* Background circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={colors.border}
              strokeWidth="12"
            />
            {/* Progress circle */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={getScoreColor(score)}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: "stroke-dashoffset 1s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold" style={{ color: colors.text }}>
              {score}
            </span>
            <span className="text-lg" style={{ color: colors.textLight }}>
              /100
            </span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-lg mb-4" style={{ color: colors.textMuted }}>
            You&apos;re doing well, but there&apos;s room to optimize your tax-advantaged accounts.
          </p>
          <div className="space-y-2">
            {[
              { label: "Savings Rate", value: "Good", color: colors.success },
              { label: "Debt Management", value: "Needs attention", color: colors.warning },
              { label: "Investment Allocation", value: "Good", color: colors.success },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: colors.textMuted }}>
                  {item.label}
                </span>
                <span className="text-sm font-medium" style={{ color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// NET WORTH CARD
// ============================================================================

function NetWorthCard() {
  const totalAssets = Object.values(mockUser.assets).reduce((a, b) => a + b, 0);
  const totalDebts = Object.values(mockUser.debts).reduce((a, b) => a + b, 0);
  const netWorth = totalAssets - totalDebts;
  const monthlyChange = 2340; // Mock monthly change

  return (
    <div
      className="p-8 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          Net Worth
        </h3>
        <div
          className="flex items-center gap-1 px-3 py-1 rounded-full"
          style={{ backgroundColor: `${colors.success}15` }}
        >
          <TrendingUp className="w-4 h-4" style={{ color: colors.success }} />
          <span className="text-sm font-medium" style={{ color: colors.success }}>
            +{formatCurrency(monthlyChange)} this month
          </span>
        </div>
      </div>

      <p className="text-5xl font-bold mb-8" style={{ color: colors.text }}>
        {formatCurrency(netWorth)}
      </p>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <p className="text-sm mb-2" style={{ color: colors.textMuted }}>
            Total Assets
          </p>
          <p className="text-2xl font-bold" style={{ color: colors.success }}>
            {formatCurrency(totalAssets)}
          </p>
        </div>
        <div>
          <p className="text-sm mb-2" style={{ color: colors.textMuted }}>
            Total Debts
          </p>
          <p className="text-2xl font-bold" style={{ color: colors.warning }}>
            {formatCurrency(totalDebts)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KEY METRICS
// ============================================================================

function KeyMetrics() {
  const metrics = [
    {
      label: "Annual Income",
      value: formatCurrency(mockUser.income),
      icon: Wallet,
      trend: null,
    },
    {
      label: "Savings Rate",
      value: `${mockUser.savingsRate}%`,
      icon: PiggyBank,
      trend: { value: "+2%", direction: "up" as const },
    },
    {
      label: "Monthly Expenses",
      value: formatCurrency(mockUser.monthlyExpenses),
      icon: CreditCard,
      trend: { value: "-$120", direction: "down" as const },
    },
    {
      label: "Total Debt",
      value: formatCurrency(
        Object.values(mockUser.debts).reduce((a, b) => a + b, 0)
      ),
      icon: Target,
      trend: { value: "-$1,200", direction: "down" as const },
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="p-6 rounded-2xl"
          style={{
            backgroundColor: colors.bgAlt,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${colors.accent}10` }}
            >
              <metric.icon className="w-5 h-5" style={{ color: colors.accent }} />
            </div>
            {metric.trend && (
              <div
                className="flex items-center gap-1"
                style={{
                  color:
                    metric.trend.direction === "up" ? colors.success : colors.success,
                }}
              >
                {metric.trend.direction === "up" ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{metric.trend.value}</span>
              </div>
            )}
          </div>
          <p className="text-sm mb-1" style={{ color: colors.textMuted }}>
            {metric.label}
          </p>
          <p className="text-2xl font-bold" style={{ color: colors.text }}>
            {metric.value}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CONNECTED ACCOUNTS SECTION
// ============================================================================

function ConnectedAccountsSection() {
  const insightAccuracy = 94;

  return (
    <div
      className="p-6 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${colors.success}10` }}
          >
            <Link2 className="w-5 h-5" style={{ color: colors.success }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
              Connected Accounts
            </h3>
            <p className="text-sm" style={{ color: colors.textMuted }}>
              5 accounts connected — your advisor has full context
            </p>
          </div>
        </div>
      </div>

      {/* Connected account icons with pulse animation */}
      <div className="flex items-center gap-3 mb-5">
        {connectedAccounts.map((account) => (
          <div key={account.id} className="relative group">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white transition-transform duration-200 group-hover:scale-110"
              style={{
                backgroundColor: account.color,
                boxShadow: `0 4px 12px ${account.color}40`,
              }}
            >
              {account.logo}
            </div>
            {/* Live indicator */}
            <div
              className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: colors.success,
                boxShadow: `0 0 8px ${colors.success}`,
              }}
            />
          </div>
        ))}
        <Link
          href="/designs/design-11-autonomous/connect"
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-black/5"
          style={{
            border: `2px dashed ${colors.border}`,
          }}
        >
          <span className="text-xl" style={{ color: colors.textLight }}>+</span>
        </Link>
      </div>

      {/* Insight Quality Indicator */}
      <div
        className="p-4 rounded-2xl mb-4"
        style={{ backgroundColor: `${colors.success}08` }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" style={{ color: colors.success }} />
            <span className="text-sm font-medium" style={{ color: colors.text }}>
              Insight Accuracy
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color: colors.success }}>
            {insightAccuracy}%
          </span>
        </div>
        <div
          className="w-full h-2 rounded-full overflow-hidden mb-2"
          style={{ backgroundColor: colors.border }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${insightAccuracy}%`,
              background: `linear-gradient(90deg, ${colors.success} 0%, ${colors.blob4} 100%)`,
            }}
          />
        </div>
        <p className="text-xs" style={{ color: colors.textMuted }}>
          Connect your mortgage to improve accuracy
        </p>
      </div>

      {/* Quick links */}
      <div className="flex gap-3">
        <Link
          href="/designs/design-11-autonomous/connect"
          className="flex-1 text-center py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-black/5"
          style={{
            border: `1px solid ${colors.border}`,
            color: colors.textMuted,
          }}
        >
          Connect more
        </Link>
        <Link
          href="/designs/design-11-autonomous/graph"
          className="flex-1 text-center py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor: `${colors.accent}10`,
            color: colors.accent,
          }}
        >
          View map
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// DATA-DRIVEN INSIGHTS SECTION
// ============================================================================

function DataDrivenInsights() {
  return (
    <div
      className="p-6 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${colors.accent}10` }}
        >
          <BarChart3 className="w-5 h-5" style={{ color: colors.accent }} />
        </div>
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          From Your Connected Data
        </h3>
      </div>

      <div className="space-y-3">
        {dataInsights.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ backgroundColor: `${item.color}08` }}
          >
            <item.icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: item.color }} />
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: item.color }}>
                {item.source}
              </p>
              <p className="text-sm font-medium" style={{ color: colors.text }}>
                {item.insight}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// RECOMMENDATIONS CARD WITH "WHY THIS?" BUTTON
// ============================================================================

function RecommendationsCard({
  onWhyThisClick,
}: {
  onWhyThisClick: (trace: MockDecisionTrace) => void;
}) {
  return (
    <div
      className="p-8 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.blob2}15 100%)`,
            }}
          >
            <Sparkles className="w-5 h-5" style={{ color: colors.accent }} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
            Your advisor recommends
          </h3>
        </div>
        <Link
          href="/designs/design-11-autonomous/recommendations"
          className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: colors.accent }}
        >
          View all
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-4">
        {topRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-5 rounded-2xl transition-all duration-200 hover:shadow-lg"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full uppercase"
                    style={{
                      backgroundColor:
                        rec.priority === "high"
                          ? `${colors.warning}15`
                          : `${colors.accent}15`,
                      color: rec.priority === "high" ? colors.warning : colors.accent,
                    }}
                  >
                    {rec.priority} priority
                  </span>
                  {/* Why this? button */}
                  <button
                    onClick={() => onWhyThisClick(rec.trace)}
                    className="text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200 hover:bg-black/5"
                    style={{ color: colors.textMuted }}
                  >
                    <HelpCircle className="w-3 h-3" />
                    Why this?
                  </button>
                </div>
                <Link href={rec.link}>
                  <h4 className="text-base font-semibold mb-1 hover:underline" style={{ color: colors.text }}>
                    {rec.title}
                  </h4>
                </Link>
                <p className="text-sm mb-2" style={{ color: colors.textMuted }}>
                  {rec.description}
                </p>
                {/* Data source indicator */}
                <p className="text-xs flex items-center gap-1" style={{ color: colors.accent }}>
                  <Link2 className="w-3 h-3" />
                  {rec.source}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span
                  className="text-lg font-bold"
                  style={{ color: colors.success }}
                >
                  {rec.impact}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// GOALS PROGRESS
// ============================================================================

function GoalsProgress() {
  return (
    <div
      className="p-8 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          Goals Progress
        </h3>
        <Link
          href="/designs/design-11-autonomous/profile"
          className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80"
          style={{ color: colors.accent }}
        >
          Edit goals
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-5">
        {mockUser.goals.map((goal) => {
          const progress = Math.round((goal.current / goal.target) * 100);
          return (
            <div key={goal.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: colors.text }}>
                  {goal.name}
                </span>
                <span className="text-sm" style={{ color: colors.textMuted }}>
                  {formatCurrency(goal.current)} / {formatCurrency(goal.target)}
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(progress, 100)}%`,
                    backgroundColor:
                      progress >= 100
                        ? colors.success
                        : progress >= 50
                        ? colors.accent
                        : colors.warning,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTrace, setSelectedTrace] = useState<MockDecisionTrace>(mockDecisionTrace);

  const handleWhyThisClick = (trace: MockDecisionTrace) => {
    setSelectedTrace(trace);
    setIsDrawerOpen(true);
  };

  const handleRefreshConnection = (connectionId: string) => {
    console.log('Refreshing connection:', connectionId);
    // In a real app, this would trigger a sync
  };

  return (
    <>
      <GlobalStyles />

      <div className="min-h-screen relative" style={{ backgroundColor: colors.bg }}>
        {/* Gradient blobs */}
        <GradientBlob
          color={colors.blob1}
          size={600}
          top="-10%"
          right="-5%"
          opacity={0.2}
          blur={100}
        />
        <GradientBlob
          color={colors.blob4}
          size={500}
          bottom="20%"
          left="-10%"
          opacity={0.15}
          blur={90}
        />

        <NoiseTexture />
        <AppNavigation currentPage="dashboard" />

        {/* Main content */}
        <main className="relative z-10 pt-28 pb-16 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold mb-3" style={{ color: colors.text }}>
                Welcome back, {mockUser.name}
              </h1>
              <p className="text-xl" style={{ color: colors.textMuted }}>
                {mockUser.age}-year-old {mockUser.occupation} building wealth with intention
              </p>
            </div>

            {/* Key Metrics */}
            <div className="mb-8">
              <KeyMetrics />
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <FinancialHealthScore score={mockUser.financialHealthScore} />
              <NetWorthCard />
            </div>

            {/* Connected Accounts & Data Insights Row */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <ConnectedAccountsSection />
              <DataDrivenInsights />
            </div>

            {/* Data Freshness & Coverage Gaps Row */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
              <DataFreshnessWidget
                connections={mockConnections}
                onRefresh={handleRefreshConnection}
              />
              <CoverageGapsCard gaps={mockCoverageGaps} />
            </div>

            {/* Secondary grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <RecommendationsCard onWhyThisClick={handleWhyThisClick} />
              </div>
              <GoalsProgress />
            </div>

            {/* Quick actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/designs/design-11-autonomous/recommendations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  color: "white",
                  boxShadow: `0 4px 14px ${colors.accent}30`,
                }}
              >
                View All Recommendations
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/designs/design-11-autonomous/progress"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 hover:bg-black/5"
                style={{
                  backgroundColor: colors.bgAlt,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                Track Progress
              </Link>
              <Link
                href="/designs/design-11-autonomous/profile"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 hover:bg-black/5"
                style={{
                  backgroundColor: colors.bgAlt,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                Update Profile
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Decision Trace Drawer */}
      <DecisionTraceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        recommendation={selectedTrace}
      />
    </>
  );
}
