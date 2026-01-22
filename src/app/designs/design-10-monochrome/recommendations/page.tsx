"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  Check,
  ChevronDown,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Heart,
  Home,
  PiggyBank,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  Zap,
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

// Recommendation status
type RecommendationStatus = "not_started" | "in_progress" | "completed";

// Recommendations data
const recommendations = [
  {
    id: 1,
    priority: 1,
    title: "Optimize Your Employer Match",
    subtitle: "Capture the full $3,600 benefit",
    category: "Retirement",
    icon: Shield,
    impact: "high",
    annualValue: 3600,
    status: "in_progress" as RecommendationStatus,
    rationale:
      "Your employer matches 50% of your 401(k) contributions up to 6% of your salary. At $150K income, contributing 6% ($9,000) earns you $4,500 in free money. You're currently contributing 4%, leaving $1,500 on the table annually.",
    action: "Increase your 401(k) contribution from 4% to 6% through your HR portal.",
    toolLink: "/investing/401k-contribution-calculator",
    toolName: "401(k) Contribution Calculator",
    timeToComplete: "10 minutes",
  },
  {
    id: 2,
    priority: 2,
    title: "Accelerate High-Interest Debt Reduction",
    subtitle: "Reclaim $880 annually in interest",
    category: "Debt",
    icon: CreditCard,
    impact: "high",
    annualValue: 880,
    status: "not_started" as RecommendationStatus,
    rationale:
      "Your $4,000 credit card balance at 22% APR costs you $880 per year in interest alone. Every month this debt persists, you're paying approximately $73 just to service it. This is your highest-return 'investment' available.",
    action:
      "Allocate an additional $500/month toward your credit card until eliminated. Consider a 0% balance transfer to accelerate payoff.",
    toolLink: "/debt/debt-destroyer",
    toolName: "Debt Destroyer Calculator",
    timeToComplete: "8 months to payoff",
  },
  {
    id: 3,
    priority: 3,
    title: "Fortify Your Emergency Reserves",
    subtitle: "Build to 3 months of security",
    category: "Security",
    icon: PiggyBank,
    impact: "medium",
    annualValue: 0,
    status: "not_started" as RecommendationStatus,
    rationale:
      "With monthly expenses of $6,500, your current $15,000 emergency fund covers 2.3 months. The standard recommendation is 3-6 months. Reaching $19,500 provides the baseline security blanket for unexpected events.",
    action: "Set up automatic transfers of $375/month to your high-yield savings account until you reach $19,500.",
    toolLink: "/budgeting/emergency-fund-planner",
    toolName: "Emergency Fund Planner",
    timeToComplete: "12 months",
  },
  {
    id: 4,
    priority: 4,
    title: "Unlock the Mega Backdoor Roth",
    subtitle: "Access $23K additional tax shelter",
    category: "Advanced",
    icon: TrendingUp,
    impact: "high",
    annualValue: 2300,
    status: "not_started" as RecommendationStatus,
    rationale:
      "Your employer's 401(k) plan allows after-tax contributions with in-plan Roth conversions. This lets you contribute up to $69,000 total (2026 limit) instead of just the standard $23,500. At your income level, this could shelter an additional $23K+ from future taxes.",
    action:
      "Verify your plan supports after-tax contributions and in-plan conversions. Then increase your after-tax contribution rate.",
    toolLink: "/investing/mega-backdoor-roth-calculator",
    toolName: "Mega Backdoor Roth Calculator",
    timeToComplete: "30 minutes setup",
  },
  {
    id: 5,
    priority: 5,
    title: "Maximize Your Roth IRA",
    subtitle: "Tax-free growth for decades",
    category: "Retirement",
    icon: Wallet,
    impact: "medium",
    annualValue: 1200,
    status: "completed" as RecommendationStatus,
    rationale:
      "At your income level, you're eligible for direct Roth IRA contributions. The $7,000 annual limit (2026) grows tax-free and can be withdrawn tax-free in retirement. This is particularly valuable if you expect higher tax rates later.",
    action: "You've already maxed your Roth IRA for 2026. Well done.",
    toolLink: "/investing/roth-vs-traditional-calculator",
    toolName: "Roth vs Traditional Calculator",
    timeToComplete: "Completed",
  },
  {
    id: 6,
    priority: 6,
    title: "Refinance Student Loans",
    subtitle: "Potentially save $2,400 over loan life",
    category: "Debt",
    icon: GraduationCap,
    impact: "medium",
    annualValue: 400,
    status: "not_started" as RecommendationStatus,
    rationale:
      "Your $30,000 in student loans at 5.5% could potentially be refinanced to 4.5% or lower given your strong income and credit profile. Over the remaining 6-year term, this could save approximately $2,400.",
    action: "Compare refinancing offers from at least 3 lenders. Ensure you're not giving up valuable federal loan protections.",
    toolLink: "/debt/student-loan-strategy-planner",
    toolName: "Student Loan Strategy Planner",
    timeToComplete: "2-4 weeks",
  },
  {
    id: 7,
    priority: 7,
    title: "Optimize Your HSA",
    subtitle: "Triple tax advantage for healthcare",
    category: "Tax Strategy",
    icon: Heart,
    impact: "medium",
    annualValue: 1500,
    status: "not_started" as RecommendationStatus,
    rationale:
      "If you have access to a high-deductible health plan, the HSA offers unmatched tax benefits: tax-deductible contributions, tax-free growth, and tax-free withdrawals for medical expenses. The 2026 limit is $4,300 individual.",
    action:
      "Review your health insurance options during open enrollment. If HDHP makes sense, max out your HSA contributions.",
    toolLink: "/taxes/hsa-maximization-tool",
    toolName: "HSA Maximization Tool",
    timeToComplete: "Open enrollment period",
  },
  {
    id: 8,
    priority: 8,
    title: "Establish Charitable Giving Strategy",
    subtitle: "Optimize donations for tax efficiency",
    category: "Tax Strategy",
    icon: Sparkles,
    impact: "low",
    annualValue: 500,
    status: "not_started" as RecommendationStatus,
    rationale:
      "If you plan to give to charity, donating appreciated stock instead of cash lets you avoid capital gains tax while still claiming the full fair market value deduction. Your brokerage holdings may have gains worth leveraging.",
    action: "Identify highly-appreciated positions in your brokerage account for your next charitable contribution.",
    toolLink: "/charitable-giving/appreciated-stock-donation-calculator",
    toolName: "Appreciated Stock Donation Calculator",
    timeToComplete: "When ready to give",
  },
  {
    id: 9,
    priority: 9,
    title: "Review Insurance Coverage",
    subtitle: "Ensure adequate protection",
    category: "Security",
    icon: Shield,
    impact: "low",
    annualValue: 0,
    status: "not_started" as RecommendationStatus,
    rationale:
      "As your net worth grows, ensuring adequate insurance coverage becomes increasingly important. Review your life insurance, disability insurance, and umbrella policy to protect your assets and income.",
    action:
      "Schedule a review of your current coverage. Consider term life insurance of 10-12x your income if you have dependents.",
    toolLink: null,
    toolName: null,
    timeToComplete: "1-2 weeks",
  },
  {
    id: 10,
    priority: 10,
    title: "Begin Estate Planning",
    subtitle: "Protect your legacy",
    category: "Planning",
    icon: Home,
    impact: "low",
    annualValue: 0,
    status: "not_started" as RecommendationStatus,
    rationale:
      "Even at 32, basic estate planning ensures your assets go where you intend. A will, healthcare directive, and beneficiary designations are foundational. Powers of attorney protect you if incapacitated.",
    action: "Create or update your will and ensure all account beneficiaries are correctly designated.",
    toolLink: null,
    toolName: null,
    timeToComplete: "2-4 weeks",
  },
];

// Filter options
const filterOptions = [
  { id: "all", label: "All Recommendations" },
  { id: "high", label: "High Impact" },
  { id: "retirement", label: "Retirement" },
  { id: "debt", label: "Debt" },
  { id: "tax", label: "Tax Strategy" },
];

// Status badge component
function StatusBadge({ status }: { status: RecommendationStatus }) {
  const config = {
    not_started: { label: "Not Started", bg: emerald[900], color: emerald[500] },
    in_progress: { label: "In Progress", bg: emerald[800], color: emerald[300] },
    completed: { label: "Completed", bg: emerald[700], color: emerald[100] },
  };

  const { label, bg, color } = config[status];

  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center gap-1"
      style={{ backgroundColor: bg, color }}
    >
      {status === "completed" && <Check className="w-3 h-3" />}
      {status === "in_progress" && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Zap className="w-3 h-3" />
        </motion.div>
      )}
      {label}
    </span>
  );
}

// Impact badge component
function ImpactBadge({ impact }: { impact: string }) {
  const config = {
    high: { label: "High Impact", color: emerald[400] },
    medium: { label: "Medium Impact", color: emerald[500] },
    low: { label: "Low Impact", color: emerald[600] },
  };

  const { label, color } = config[impact as keyof typeof config];

  return (
    <span className="text-xs font-medium" style={{ color }}>
      {label}
    </span>
  );
}

// Recommendation card component
function RecommendationCard({
  recommendation,
  isExpanded,
  onToggle,
}: {
  recommendation: typeof recommendations[0];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${recommendation.status === "completed" ? emerald[700] : emerald[900]}`,
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-5 text-left transition-colors duration-200"
        style={{
          backgroundColor: isExpanded ? emerald[900] + "30" : "transparent",
        }}
      >
        <div className="flex items-start gap-4">
          {/* Priority number */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-serif text-lg font-medium"
            style={{
              backgroundColor: recommendation.status === "completed" ? emerald[700] : emerald[900],
              color: recommendation.status === "completed" ? emerald[100] : emerald[400],
            }}
          >
            {recommendation.status === "completed" ? (
              <Check className="w-4 h-4" />
            ) : (
              recommendation.priority
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3
                  className="font-serif text-lg font-medium"
                  style={{
                    color: recommendation.status === "completed" ? emerald[400] : emerald[100],
                    textDecoration: recommendation.status === "completed" ? "line-through" : "none",
                  }}
                >
                  {recommendation.title}
                </h3>
                <p className="text-sm" style={{ color: emerald[500] }}>
                  {recommendation.subtitle}
                </p>
              </div>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5" style={{ color: emerald[500] }} />
              </motion.div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <StatusBadge status={recommendation.status} />
              <ImpactBadge impact={recommendation.impact} />
              {recommendation.annualValue > 0 && (
                <span className="text-xs" style={{ color: emerald[400] }}>
                  ${recommendation.annualValue.toLocaleString()}/year potential
                </span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-2 ml-12">
              {/* Rationale */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2" style={{ color: emerald[300] }}>
                  Why This Matters
                </h4>
                <p className="text-sm leading-relaxed" style={{ color: emerald[400] }}>
                  {recommendation.rationale}
                </p>
              </div>

              {/* Action */}
              <div
                className="p-4 rounded-lg mb-4"
                style={{ backgroundColor: emerald[900] + "50" }}
              >
                <h4 className="text-sm font-medium mb-2" style={{ color: emerald[300] }}>
                  Recommended Action
                </h4>
                <p className="text-sm" style={{ color: emerald[200] }}>
                  {recommendation.action}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs" style={{ color: emerald[600] }}>
                  Time to complete: {recommendation.timeToComplete}
                </span>

                {recommendation.toolLink && (
                  <Link
                    href={recommendation.toolLink}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: emerald[800],
                      color: emerald[100],
                    }}
                  >
                    <Calculator className="w-4 h-4" />
                    {recommendation.toolName}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
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
              { label: "Recommendations", href: "/designs/design-10-monochrome/recommendations", active: true },
              { label: "Progress", href: "/designs/design-10-monochrome/progress" },
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

// Summary stats component
function SummaryStats() {
  const completed = recommendations.filter((r) => r.status === "completed").length;
  const inProgress = recommendations.filter((r) => r.status === "in_progress").length;
  const totalPotentialValue = recommendations
    .filter((r) => r.status !== "completed")
    .reduce((sum, r) => sum + r.annualValue, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="grid sm:grid-cols-3 gap-4 mb-8"
    >
      {[
        { label: "Completed", value: `${completed}/${recommendations.length}`, subtext: "Recommendations" },
        { label: "In Progress", value: inProgress.toString(), subtext: "Currently working" },
        { label: "Potential Value", value: `$${totalPotentialValue.toLocaleString()}`, subtext: "Annual savings" },
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
          <p className="font-serif text-2xl font-medium" style={{ color: emerald[100] }}>
            {stat.value}
          </p>
          <p className="text-xs" style={{ color: emerald[600] }}>
            {stat.subtext}
          </p>
        </div>
      ))}
    </motion.div>
  );
}

// Main recommendations page
export default function RecommendationsPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const filteredRecommendations = recommendations.filter((rec) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "high") return rec.impact === "high";
    if (activeFilter === "retirement") return rec.category === "Retirement";
    if (activeFilter === "debt") return rec.category === "Debt";
    if (activeFilter === "tax") return rec.category === "Tax Strategy";
    return true;
  });

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

        <main className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4" style={{ color: emerald[500] }} />
              <span className="text-sm" style={{ color: emerald[500] }}>
                Personalized for Sarah
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white mb-3">
              Your <span className="italic" style={{ color: emerald[400] }}>Curated</span> Recommendations
            </h1>
            <p style={{ color: emerald[400] }}>
              Prioritized actions to optimize your financial position, ordered by impact and timing.
            </p>
          </motion.div>

          {/* Summary stats */}
          <SummaryStats />

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: activeFilter === filter.id ? emerald[800] : "transparent",
                  color: activeFilter === filter.id ? emerald[100] : emerald[500],
                  border: `1px solid ${activeFilter === filter.id ? emerald[700] : emerald[900]}`,
                }}
              >
                {filter.label}
              </button>
            ))}
          </motion.div>

          {/* Recommendations list */}
          <motion.div layout className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredRecommendations.map((rec) => (
                <RecommendationCard
                  key={rec.id}
                  recommendation={rec}
                  isExpanded={expandedId === rec.id}
                  onToggle={() => setExpandedId(expandedId === rec.id ? null : rec.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 p-6 rounded-xl text-center"
            style={{
              backgroundColor: emerald[950],
              border: `1px solid ${emerald[900]}`,
            }}
          >
            <Sparkles className="w-8 h-8 mx-auto mb-4" style={{ color: emerald[500] }} />
            <h3 className="font-serif text-xl mb-2" style={{ color: emerald[100] }}>
              Questions about these recommendations?
            </h3>
            <p className="text-sm mb-4" style={{ color: emerald[400] }}>
              Each suggestion is tailored to your unique financial situation. Explore our tools for deeper analysis.
            </p>
            <Link
              href="/designs/design-10-monochrome"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200"
              style={{
                backgroundColor: emerald[800],
                color: emerald[100],
              }}
            >
              Explore All Tools <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </main>
      </div>
    </>
  );
}
