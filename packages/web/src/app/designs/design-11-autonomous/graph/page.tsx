"use client";

import Link from "next/link";
import {
  ArrowRight,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign,
  Building2,
  PiggyBank,
  CreditCard,
  GraduationCap,
  Briefcase,
  ChevronRight,
  Link2,
} from "lucide-react";
import {
  colors,
  GradientBlob,
  GlobalStyles,
  NoiseTexture,
  AppNavigation,
} from "../shared";

// ============================================================================
// FINANCIAL GRAPH PAGE
// ============================================================================
// Clean, clear visualization of connected financial data:
// - Central net worth card
// - Connected nodes showing accounts
// - Flow lines with amounts
// - AI-powered insights
// - Quick stats summary
// ============================================================================

// Format currency helper
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

// Format compact currency
const formatCompact = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

// Financial nodes data
const financialNodes = {
  income: { label: "Income", value: 150000, icon: Briefcase, type: "income" as const },
  checking: { label: "Checking", value: 8400, icon: Building2, type: "asset" as const },
  savings: { label: "Savings", value: 3200, icon: PiggyBank, type: "asset" as const },
  retirement: { label: "401(k)", value: 67000, icon: TrendingUp, type: "asset" as const },
  credit: { label: "Credit", value: -2100, icon: CreditCard, type: "debt" as const },
  loans: { label: "Loans", value: -28000, icon: GraduationCap, type: "debt" as const },
};

// AI Insights
const insights = [
  {
    id: 1,
    type: "opportunity",
    title: "Missing 401(k) match",
    description: "You're leaving $3,600/year on the table by not maxing your 401k employer match.",
    impact: "+$3,600/yr",
    icon: TrendingUp,
  },
  {
    id: 2,
    type: "warning",
    title: "Credit card interest",
    description: "Your credit card interest is costing you $504/year. Consider paying off the balance.",
    impact: "-$504/yr",
    icon: CreditCard,
  },
  {
    id: 3,
    type: "alert",
    title: "Low emergency fund",
    description: "Your emergency fund covers 0.4 months. Aim for 3-6 months of expenses.",
    impact: "High risk",
    icon: AlertCircle,
  },
  {
    id: 4,
    type: "info",
    title: "Uncategorized spending",
    description: "There's $1,200/month in spending we can't categorize yet. Connect more accounts for clarity.",
    impact: "Improve data",
    icon: Lightbulb,
  },
];

// ============================================================================
// GRAPH NODE COMPONENT
// ============================================================================

function GraphNode({
  node,
  position,
  isCenter = false,
}: {
  node: {
    label: string;
    value: number;
    icon: React.ElementType;
    type: "income" | "asset" | "debt";
  };
  position: { top?: string; left?: string; right?: string; bottom?: string };
  isCenter?: boolean;
}) {
  const getNodeColor = (type: string) => {
    switch (type) {
      case "income":
        return colors.blob2;
      case "asset":
        return colors.success;
      case "debt":
        return colors.warning;
      default:
        return colors.accent;
    }
  };

  const nodeColor = getNodeColor(node.type);

  if (isCenter) {
    return (
      <div
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
        style={{ top: "50%", left: "50%" }}
      >
        <div
          className="w-40 h-40 rounded-3xl flex flex-col items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`,
            boxShadow: `0 8px 32px ${colors.accent}40`,
          }}
        >
          <span className="text-white/80 text-sm font-medium mb-1">Net Worth</span>
          <span className="text-white text-3xl font-bold">{formatCompact(node.value)}</span>
          <span className="text-white/60 text-xs mt-1">You</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
      style={position}
    >
      <div
        className="px-5 py-4 rounded-2xl transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
        style={{
          backgroundColor: colors.bgAlt,
          border: `2px solid ${nodeColor}40`,
          boxShadow: `0 4px 20px ${nodeColor}15`,
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${nodeColor}15` }}
          >
            <node.icon className="w-5 h-5" style={{ color: nodeColor }} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: colors.textLight }}>
              {node.label}
            </p>
            <p
              className="text-lg font-bold"
              style={{ color: node.type === "debt" ? colors.warning : colors.text }}
            >
              {formatCompact(Math.abs(node.value))}
              {node.type === "income" && <span className="text-xs font-normal">/yr</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FLOW LINE COMPONENT
// ============================================================================

function FlowLine({
  from,
  to,
  amount,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  amount: number;
}) {
  // Calculate midpoint for label
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;

  // Calculate angle for arrow
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const arrowLength = 8;

  return (
    <g>
      {/* Main line */}
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={colors.accent}
        strokeWidth="2"
        strokeOpacity="0.4"
        strokeDasharray="6 4"
      />
      {/* Arrow head */}
      <polygon
        points={`
          ${to.x},${to.y}
          ${to.x - arrowLength * Math.cos(angle - Math.PI / 6)},${to.y - arrowLength * Math.sin(angle - Math.PI / 6)}
          ${to.x - arrowLength * Math.cos(angle + Math.PI / 6)},${to.y - arrowLength * Math.sin(angle + Math.PI / 6)}
        `}
        fill={colors.accent}
        fillOpacity="0.6"
      />
      {/* Label background */}
      <rect
        x={midX - 45}
        y={midY - 12}
        width="90"
        height="24"
        rx="12"
        fill={colors.bgAlt}
        stroke={colors.border}
        strokeWidth="1"
      />
      {/* Label text */}
      <text
        x={midX}
        y={midY + 4}
        textAnchor="middle"
        fontSize="11"
        fontWeight="500"
        fill={colors.textMuted}
      >
        {formatCompact(amount)}/mo
      </text>
    </g>
  );
}

// ============================================================================
// FINANCIAL GRAPH VISUALIZATION
// ============================================================================

function FinancialGraph() {
  // Node positions (percentages)
  const nodePositions = {
    income: { top: "12%", left: "50%" },
    checking: { top: "50%", left: "20%" },
    savings: { top: "50%", left: "80%" },
    retirement: { top: "85%", left: "25%" },
    credit: { top: "85%", left: "75%" },
    loans: { top: "85%", left: "50%" },
  };

  // SVG flow coordinates (matching node positions for 600x500 viewBox)
  const flowCoords: Record<string, { x: number; y: number }> = {
    income: { x: 300, y: 80 },
    center: { x: 300, y: 250 },
    checking: { x: 120, y: 250 },
    savings: { x: 480, y: 250 },
    retirement: { x: 150, y: 420 },
    credit: { x: 450, y: 420 },
    loans: { x: 300, y: 420 },
  };

  const totalAssets = 8400 + 3200 + 67000;
  const totalDebts = 2100 + 28000;
  const netWorth = totalAssets - totalDebts;

  return (
    <div
      className="relative w-full rounded-3xl overflow-hidden"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
        minHeight: "500px",
      }}
    >
      {/* SVG Flow Lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 600 500"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Income to Center */}
        <FlowLine
          from={flowCoords.income}
          to={{ x: 300, y: 180 }}
          amount={12500}
        />
        {/* Center to Checking */}
        <FlowLine
          from={{ x: 230, y: 250 }}
          to={flowCoords.checking}
          amount={0}
        />
        {/* Center to Savings */}
        <FlowLine
          from={{ x: 370, y: 250 }}
          to={flowCoords.savings}
          amount={500}
        />
        {/* Checking to 401k */}
        <FlowLine
          from={flowCoords.checking}
          to={flowCoords.retirement}
          amount={1625}
        />
        {/* Center to Credit */}
        <FlowLine
          from={{ x: 350, y: 300 }}
          to={flowCoords.credit}
          amount={2100}
        />
        {/* Center to Loans */}
        <FlowLine
          from={{ x: 300, y: 320 }}
          to={flowCoords.loans}
          amount={450}
        />
      </svg>

      {/* Center Node - Net Worth */}
      <GraphNode
        node={{ label: "Net Worth", value: netWorth, icon: DollarSign, type: "asset" }}
        position={{}}
        isCenter
      />

      {/* Income Node */}
      <GraphNode
        node={financialNodes.income}
        position={nodePositions.income}
      />

      {/* Asset Nodes */}
      <GraphNode
        node={financialNodes.checking}
        position={nodePositions.checking}
      />
      <GraphNode
        node={financialNodes.savings}
        position={nodePositions.savings}
      />
      <GraphNode
        node={financialNodes.retirement}
        position={nodePositions.retirement}
      />

      {/* Debt Nodes */}
      <GraphNode
        node={financialNodes.credit}
        position={nodePositions.credit}
      />
      <GraphNode
        node={financialNodes.loans}
        position={nodePositions.loans}
      />
    </div>
  );
}

// ============================================================================
// INSIGHT CARD COMPONENT
// ============================================================================

function InsightCard({
  insight,
}: {
  insight: {
    id: number;
    type: string;
    title: string;
    description: string;
    impact: string;
    icon: React.ElementType;
  };
}) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "opportunity":
        return colors.success;
      case "warning":
        return colors.warning;
      case "alert":
        return colors.warningLight;
      case "info":
        return colors.accent;
      default:
        return colors.accent;
    }
  };

  const typeColor = getTypeColor(insight.type);

  return (
    <div
      className="p-5 rounded-2xl transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${typeColor}15` }}
        >
          <insight.icon className="w-5 h-5" style={{ color: typeColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-base font-semibold" style={{ color: colors.text }}>
              {insight.title}
            </h4>
            <span
              className="text-sm font-bold flex-shrink-0"
              style={{ color: typeColor }}
            >
              {insight.impact}
            </span>
          </div>
          <p className="text-sm" style={{ color: colors.textMuted }}>
            {insight.description}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// QUICK STATS COMPONENT
// ============================================================================

function QuickStats() {
  const stats = [
    { label: "Connected", value: "5 accounts", icon: Link2 },
    { label: "Assets", value: formatCurrency(78600), icon: TrendingUp },
    { label: "Debts", value: formatCurrency(30100), icon: TrendingDown },
    { label: "Net Worth", value: formatCurrency(48500), icon: DollarSign },
    { label: "Cash Flow", value: "+$1,800/mo", icon: Briefcase },
  ];

  return (
    <div
      className="p-6 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
        Quick Stats
      </h3>
      <div className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between py-2"
            style={{ borderBottom: `1px solid ${colors.borderLight}` }}
          >
            <div className="flex items-center gap-3">
              <stat.icon className="w-4 h-4" style={{ color: colors.textLight }} />
              <span className="text-sm" style={{ color: colors.textMuted }}>
                {stat.label}
              </span>
            </div>
            <span className="text-sm font-semibold" style={{ color: colors.text }}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN GRAPH PAGE
// ============================================================================

export default function GraphPage() {
  return (
    <>
      <GlobalStyles />

      <div className="min-h-screen relative" style={{ backgroundColor: colors.bg }}>
        {/* Gradient blobs */}
        <GradientBlob
          color={colors.blob3}
          size={600}
          top="-5%"
          right="-10%"
          opacity={0.25}
          blur={100}
          animate
        />
        <GradientBlob
          color={colors.blob4}
          size={500}
          bottom="10%"
          left="-10%"
          opacity={0.2}
          blur={90}
          animate
          delay={7}
        />
        <GradientBlob
          color={colors.blob5}
          size={400}
          top="40%"
          left="30%"
          opacity={0.15}
          blur={80}
          animate
          delay={3}
        />

        <NoiseTexture />
        <AppNavigation currentPage="graph" />

        {/* Main content */}
        <main className="relative z-10 pt-28 pb-16 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1
                className="text-4xl sm:text-5xl font-bold mb-4"
                style={{ color: colors.text }}
              >
                Your Financial Map
              </h1>
              <p className="text-xl max-w-2xl" style={{ color: colors.textMuted }}>
                This is how your money flows. Understanding it is the first step to optimizing it.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main graph - spans 2 columns */}
              <div className="lg:col-span-2">
                <FinancialGraph />
              </div>

              {/* Right sidebar */}
              <div className="space-y-6">
                <QuickStats />

                {/* Connect more CTA */}
                <Link
                  href="/designs/design-11-autonomous/connect"
                  className="flex items-center justify-between p-4 rounded-2xl transition-all duration-200 hover:bg-black/5"
                  style={{
                    backgroundColor: colors.bgAlt,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${colors.accent}10` }}
                    >
                      <Link2 className="w-5 h-5" style={{ color: colors.accent }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: colors.text }}>
                        Connect more accounts
                      </p>
                      <p className="text-xs" style={{ color: colors.textLight }}>
                        Improve insight accuracy
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5" style={{ color: colors.textLight }} />
                </Link>
              </div>
            </div>

            {/* Insights Section */}
            <div className="mt-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${colors.accent}15 0%, ${colors.blob2}15 100%)`,
                    }}
                  >
                    <Lightbulb className="w-5 h-5" style={{ color: colors.accent }} />
                  </div>
                  <h2 className="text-2xl font-bold" style={{ color: colors.text }}>
                    AI-Powered Insights
                  </h2>
                </div>
                <Link
                  href="/designs/design-11-autonomous/recommendations"
                  className="text-sm font-medium flex items-center gap-1 transition-colors hover:opacity-80"
                  style={{ color: colors.accent }}
                >
                  View all recommendations
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/designs/design-11-autonomous/recommendations"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                  color: "white",
                  boxShadow: `0 4px 14px ${colors.accent}30`,
                }}
              >
                Get Personalized Recommendations
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/designs/design-11-autonomous/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-all duration-200 hover:bg-black/5"
                style={{
                  backgroundColor: colors.bgAlt,
                  border: `1px solid ${colors.border}`,
                  color: colors.text,
                }}
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
