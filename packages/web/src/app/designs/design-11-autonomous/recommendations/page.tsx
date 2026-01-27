"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Target,
  Shield,
  PiggyBank,
  TrendingUp,
  Wallet,
  CreditCard,
  Building2,
  Heart,
} from "lucide-react";
import {
  colors,
  GradientBlob,
  GlobalStyles,
  NoiseTexture,
  AppNavigation,
} from "../shared";

// ============================================================================
// RECOMMENDATIONS PAGE
// ============================================================================
// Personalized recommendations with:
// - Priority badges
// - Why + Impact explanations
// - Tool links
// - Toggle states: Done / Working on it / Later
// ============================================================================

type RecommendationStatus = "todo" | "working" | "done" | "later";

interface Recommendation {
  id: string;
  title: string;
  why: string;
  impact: string;
  impactValue: string;
  priority: "high" | "medium" | "low";
  category: string;
  icon: typeof Target;
  toolLink?: string;
  toolName?: string;
  steps?: string[];
}

const recommendations: Recommendation[] = [
  {
    id: "1",
    title: "Maximize your 401k match",
    why: "You're currently contributing 6% to your 401k, but your employer matches 50% up to 6%. By contributing the full 6%, you're leaving $3,600 of free money on the table each year.",
    impact: "This is literally free money. Over 30 years at 7% returns, this $3,600/year turns into $340,000.",
    impactValue: "+$3,600/yr",
    priority: "high",
    category: "Retirement",
    icon: Target,
    toolLink: "/investing/401k-optimizer",
    toolName: "401k Optimizer",
    steps: [
      "Log into your employer benefits portal",
      "Increase your 401k contribution to at least 6%",
      "Verify your employer match is being applied",
    ],
  },
  {
    id: "2",
    title: "Pay off high-interest debt first",
    why: "Your student loans at 6.8% are costing you $2,312 in interest annually. Paying these off aggressively will save you thousands.",
    impact: "By paying an extra $500/month, you'll be debt-free 4 years sooner and save $8,400 in interest.",
    impactValue: "-$1,400/yr",
    priority: "high",
    category: "Debt",
    icon: CreditCard,
    toolLink: "/debt/payoff-calculator",
    toolName: "Debt Payoff Calculator",
    steps: [
      "Review your current loan interest rates",
      "Set up automatic extra payments of $500/month",
      "Consider refinancing if rates drop below 5%",
    ],
  },
  {
    id: "3",
    title: "Build your emergency fund",
    why: "You currently have 1.7 months of expenses saved ($8,500). The recommended minimum is 3 months ($13,500).",
    impact: "Having 3 months of runway protects you from using credit cards or raiding retirement accounts during emergencies.",
    impactValue: "1.3 months to go",
    priority: "high",
    category: "Savings",
    icon: Shield,
    toolLink: "/budgeting/emergency-fund",
    toolName: "Emergency Fund Calculator",
    steps: [
      "Open a high-yield savings account (current best: 4.5% APY)",
      "Set up automatic transfers of $400/month",
      "Reach 3-month target in ~13 months",
    ],
  },
  {
    id: "4",
    title: "Open a Mega Backdoor Roth",
    why: "Your employer's 401k plan allows after-tax contributions with in-plan Roth conversions. This lets you contribute up to $23,000 extra per year to tax-free growth.",
    impact: "An extra $23K/year in Roth grows tax-free. Over 30 years, this could mean $500K+ more in retirement.",
    impactValue: "+$23K tax-free",
    priority: "medium",
    category: "Retirement",
    icon: TrendingUp,
    toolLink: "/investing/mega-backdoor-roth",
    toolName: "Mega Backdoor Roth Guide",
    steps: [
      "Verify your plan allows after-tax contributions",
      "Check if in-plan Roth conversions are permitted",
      "Set up after-tax contributions above your pre-tax limit",
      "Convert to Roth immediately to minimize taxes",
    ],
  },
  {
    id: "5",
    title: "Max your Roth IRA",
    why: "You've contributed $4,500 to your Roth IRA this year. The 2024 limit is $7,000. You're missing out on $2,500 of tax-free growth.",
    impact: "That extra $2,500/year, invested over 30 years at 7%, grows to $236,000 tax-free.",
    impactValue: "+$2,500/yr",
    priority: "medium",
    category: "Retirement",
    icon: PiggyBank,
    toolLink: "/investing/roth-ira",
    toolName: "Roth IRA Calculator",
    steps: [
      "Calculate remaining contribution room ($2,500)",
      "Set up automatic monthly contributions ($208/month)",
      "Max out by December to capture full year of growth",
    ],
  },
  {
    id: "6",
    title: "Rebalance your portfolio",
    why: "Your current allocation is 90% stocks / 10% bonds. Based on your moderate-aggressive risk tolerance, a target of 80% stocks / 20% bonds may be more appropriate.",
    impact: "Proper diversification can reduce volatility by 15-20% while maintaining similar long-term returns.",
    impactValue: "Reduce risk",
    priority: "medium",
    category: "Investing",
    icon: Wallet,
    toolLink: "/investing/portfolio-analyzer",
    toolName: "Portfolio Analyzer",
    steps: [
      "Review current holdings across all accounts",
      "Sell overweight positions in taxable accounts first",
      "Buy underweight asset classes",
      "Set up automatic rebalancing if available",
    ],
  },
  {
    id: "7",
    title: "Consider tax-loss harvesting",
    why: "Your brokerage account has $1,200 in unrealized losses. Harvesting these losses can offset gains and reduce your tax bill.",
    impact: "At your marginal tax rate, this could save you $264 in taxes this year.",
    impactValue: "-$264 taxes",
    priority: "low",
    category: "Taxes",
    icon: Building2,
    toolLink: "/taxes/tax-loss-harvesting",
    toolName: "Tax-Loss Harvesting Tool",
    steps: [
      "Identify positions with unrealized losses",
      "Sell losing positions before year-end",
      "Wait 31 days before repurchasing (wash sale rule)",
      "Use losses to offset gains on your tax return",
    ],
  },
  {
    id: "8",
    title: "Optimize your I Bond allocation",
    why: "With $25,000 in savings earning 4.5% in your HYSA, consider moving $10,000 to I Bonds earning 5.27% (current rate).",
    impact: "The extra 0.77% on $10,000 is $77/year, plus I Bond interest is state tax-exempt.",
    impactValue: "+$77/yr",
    priority: "low",
    category: "Savings",
    icon: Shield,
    toolLink: "/banking/i-bond-vs-hysa",
    toolName: "I Bond vs HYSA Calculator",
    steps: [
      "Open a TreasuryDirect account",
      "Purchase up to $10,000 in I Bonds",
      "Hold for at least 1 year (5 years to avoid penalty)",
    ],
  },
  {
    id: "9",
    title: "Review your credit card strategy",
    why: "You're using a 1.5% cash back card for all spending. With $4,500/month in expenses, optimizing could earn you $500+ more per year.",
    impact: "A travel card earning 2-3x on dining and travel could net you an extra $500-800 annually in rewards.",
    impactValue: "+$500/yr",
    priority: "low",
    category: "Credit Cards",
    icon: CreditCard,
    toolLink: "/credit-cards/optimizer",
    toolName: "Card Optimizer",
    steps: [
      "Review your spending categories",
      "Apply for a card with bonus categories matching your spending",
      "Set up category cards for specific purchases",
    ],
  },
  {
    id: "10",
    title: "Donate appreciated stock instead of cash",
    why: "If you're planning charitable donations, donating appreciated stock avoids capital gains tax while still getting the full deduction.",
    impact: "On a $1,000 donation of stock with $300 in gains, you save ~$45 in capital gains tax.",
    impactValue: "Tax savings",
    priority: "low",
    category: "Giving",
    icon: Heart,
    toolLink: "/charitable-giving/stock-donation",
    toolName: "Stock Donation Calculator",
    steps: [
      "Identify appreciated shares held over 1 year",
      "Contact your charity about stock donations",
      "Transfer shares directly (don't sell first)",
    ],
  },
];

// ============================================================================
// STATUS TOGGLE COMPONENT
// ============================================================================

function StatusToggle({
  status,
  onChange,
}: {
  status: RecommendationStatus;
  onChange: (status: RecommendationStatus) => void;
}) {
  const options: { value: RecommendationStatus; label: string }[] = [
    { value: "todo", label: "To Do" },
    { value: "working", label: "Working on it" },
    { value: "done", label: "Done" },
    { value: "later", label: "Later" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
          style={{
            backgroundColor:
              status === option.value
                ? option.value === "done"
                  ? `${colors.success}15`
                  : option.value === "working"
                  ? `${colors.accent}15`
                  : option.value === "later"
                  ? `${colors.textLight}15`
                  : `${colors.warning}15`
                : "transparent",
            color:
              status === option.value
                ? option.value === "done"
                  ? colors.success
                  : option.value === "working"
                  ? colors.accent
                  : option.value === "later"
                  ? colors.textMuted
                  : colors.warning
                : colors.textMuted,
            border: `1px solid ${
              status === option.value ? "transparent" : colors.border
            }`,
          }}
        >
          {option.value === "done" && status === "done" && (
            <Check className="w-3 h-3 inline mr-1" />
          )}
          {option.value === "working" && status === "working" && (
            <Clock className="w-3 h-3 inline mr-1" />
          )}
          {option.label}
        </button>
      ))}
    </div>
  );
}

// ============================================================================
// RECOMMENDATION CARD
// ============================================================================

function RecommendationCard({
  recommendation,
  status,
  onStatusChange,
}: {
  recommendation: Recommendation;
  status: RecommendationStatus;
  onStatusChange: (status: RecommendationStatus) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = recommendation.icon;

  return (
    <div
      className={`rounded-3xl transition-all duration-300 ${
        status === "done" ? "opacity-60" : ""
      }`}
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      {/* Header */}
      <div className="p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.blob2}15 100%)`,
            }}
          >
            <Icon className="w-6 h-6" style={{ color: colors.accent }} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase"
                style={{
                  backgroundColor:
                    recommendation.priority === "high"
                      ? `${colors.warning}15`
                      : recommendation.priority === "medium"
                      ? `${colors.accent}15`
                      : `${colors.textLight}15`,
                  color:
                    recommendation.priority === "high"
                      ? colors.warning
                      : recommendation.priority === "medium"
                      ? colors.accent
                      : colors.textMuted,
                }}
              >
                {recommendation.priority} priority
              </span>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  backgroundColor: colors.bg,
                  color: colors.textMuted,
                }}
              >
                {recommendation.category}
              </span>
            </div>

            <h3
              className={`text-xl font-bold mb-2 ${
                status === "done" ? "line-through" : ""
              }`}
              style={{ color: colors.text }}
            >
              {recommendation.title}
            </h3>

            <p className="text-base mb-4" style={{ color: colors.textMuted }}>
              {recommendation.why}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ backgroundColor: `${colors.success}10` }}
              >
                <span className="text-sm" style={{ color: colors.textMuted }}>
                  Impact:
                </span>
                <span
                  className="text-lg font-bold"
                  style={{ color: colors.success }}
                >
                  {recommendation.impactValue}
                </span>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: colors.accent }}
              >
                {isExpanded ? "Show less" : "Show details"}
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="mt-6 pt-6" style={{ borderTop: `1px solid ${colors.border}` }}>
            <div className="mb-6">
              <h4 className="text-sm font-semibold mb-2" style={{ color: colors.text }}>
                Why this matters
              </h4>
              <p className="text-base" style={{ color: colors.textMuted }}>
                {recommendation.impact}
              </p>
            </div>

            {recommendation.steps && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3" style={{ color: colors.text }}>
                  Action steps
                </h4>
                <ol className="space-y-2">
                  {recommendation.steps.map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold"
                        style={{
                          backgroundColor: `${colors.accent}15`,
                          color: colors.accent,
                        }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-base" style={{ color: colors.textMuted }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {recommendation.toolLink && (
              <Link
                href={recommendation.toolLink}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 hover:shadow-md"
                style={{
                  backgroundColor: `${colors.accent}10`,
                  color: colors.accent,
                }}
              >
                Open {recommendation.toolName}
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Status toggle */}
      <div
        className="px-6 sm:px-8 py-4 rounded-b-3xl"
        style={{ backgroundColor: colors.bg, borderTop: `1px solid ${colors.border}` }}
      >
        <StatusToggle status={status} onChange={onStatusChange} />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN RECOMMENDATIONS PAGE
// ============================================================================

export default function RecommendationsPage() {
  const [statuses, setStatuses] = useState<Record<string, RecommendationStatus>>(
    Object.fromEntries(recommendations.map((r) => [r.id, "todo"]))
  );
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const updateStatus = (id: string, status: RecommendationStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: status }));
  };

  const filteredRecommendations = recommendations.filter(
    (r) => filter === "all" || r.priority === filter
  );

  const completedCount = Object.values(statuses).filter((s) => s === "done").length;
  const workingCount = Object.values(statuses).filter((s) => s === "working").length;

  return (
    <>
      <GlobalStyles />

      <div className="min-h-screen relative" style={{ backgroundColor: colors.bg }}>
        {/* Gradient blobs */}
        <GradientBlob
          color={colors.blob2}
          size={600}
          top="-5%"
          right="-10%"
          opacity={0.2}
          blur={100}
        />
        <GradientBlob
          color={colors.blob3}
          size={500}
          bottom="10%"
          left="-15%"
          opacity={0.15}
          blur={90}
        />

        <NoiseTexture />
        <AppNavigation currentPage="recommendations" />

        {/* Main content */}
        <main className="relative z-10 pt-28 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: colors.text }}>
                Your Personalized Recommendations
              </h1>
              <p className="text-xl" style={{ color: colors.textMuted }}>
                {recommendations.length} actions tailored to your financial situation.
                Start with high-priority items for the biggest impact.
              </p>
            </div>

            {/* Progress summary */}
            <div
              className="p-6 rounded-2xl mb-8 flex items-center justify-between flex-wrap gap-4"
              style={{
                backgroundColor: colors.bgAlt,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    Completed
                  </p>
                  <p className="text-2xl font-bold" style={{ color: colors.success }}>
                    {completedCount} / {recommendations.length}
                  </p>
                </div>
                <div
                  className="w-px h-10"
                  style={{ backgroundColor: colors.border }}
                />
                <div>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    In Progress
                  </p>
                  <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                    {workingCount}
                  </p>
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                {(["all", "high", "medium", "low"] as const).map((priority) => (
                  <button
                    key={priority}
                    onClick={() => setFilter(priority)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor:
                        filter === priority ? colors.text : "transparent",
                      color: filter === priority ? "white" : colors.textMuted,
                      border: `1px solid ${
                        filter === priority ? colors.text : colors.border
                      }`,
                    }}
                  >
                    {priority === "all"
                      ? "All"
                      : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Recommendations list */}
            <div className="space-y-6">
              {filteredRecommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  recommendation={recommendation}
                  status={statuses[recommendation.id]}
                  onStatusChange={(status) => updateStatus(recommendation.id, status)}
                />
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 text-center">
              <p className="text-lg mb-4" style={{ color: colors.textMuted }}>
                Want to track your progress over time?
              </p>
              <Link
                href="/designs/design-11-autonomous/progress"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  color: "white",
                  boxShadow: `0 4px 14px ${colors.accent}30`,
                }}
              >
                View Progress Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
