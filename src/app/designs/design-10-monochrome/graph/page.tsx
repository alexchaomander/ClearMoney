"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Calculator,
  CreditCard,
  DollarSign,
  GraduationCap,
  Lightbulb,
  Link2,
  PiggyBank,
  Plus,
  Sparkles,
  TrendingUp,
  User,
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

// Mock data for Sarah's financial constellation
const centralNode = {
  name: "Sarah",
  netWorth: 48500,
  healthScore: 72,
};

// Node types
type NodeType = "income" | "asset" | "liability";

interface FinancialNode {
  id: string;
  name: string;
  value: number;
  type: NodeType;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  ring: number; // 1 = inner, 2 = middle, 3 = outer
  angle: number; // Position angle in degrees
}

const financialNodes: FinancialNode[] = [
  // Inner ring - Income
  { id: "income", name: "Primary Income", value: 150000, type: "income", icon: Briefcase, ring: 1, angle: 90 },

  // Middle ring - Assets
  { id: "checking", name: "Checking", value: 11600, type: "asset", icon: Wallet, ring: 2, angle: 45 },
  { id: "savings", name: "Emergency Fund", value: 5000, type: "asset", icon: PiggyBank, ring: 2, angle: 135 },
  { id: "401k", name: "401(k)", value: 45000, type: "asset", icon: TrendingUp, ring: 2, angle: 225 },
  { id: "investments", name: "Investments", value: 17000, type: "asset", icon: DollarSign, ring: 2, angle: 315 },

  // Outer ring - Liabilities
  { id: "credit-card", name: "Credit Card", value: -2100, type: "liability", icon: CreditCard, ring: 3, angle: 0 },
  { id: "student-loans", name: "Student Loans", value: -28000, type: "liability", icon: GraduationCap, ring: 3, angle: 180 },
];

// Money flows
interface MoneyFlow {
  from: string;
  to: string;
  amount: number;
  frequency: string;
}

const moneyFlows: MoneyFlow[] = [
  { from: "income", to: "checking", amount: 12500, frequency: "/mo" },
  { from: "checking", to: "investments", amount: 1625, frequency: "/mo" },
  { from: "checking", to: "savings", amount: 500, frequency: "/mo" },
  { from: "checking", to: "credit-card", amount: 500, frequency: "/mo" },
  { from: "checking", to: "student-loans", amount: 450, frequency: "/mo" },
];

// AI insights
const insights = [
  {
    id: 1,
    title: "Employer Match Opportunity",
    description: "$3,600 annual benefit remains uncaptured. Increasing 401(k) contribution by 3% captures full employer match.",
    impact: "high",
    icon: Sparkles,
  },
  {
    id: 2,
    title: "High-Interest Debt",
    description: "$504 annual cost at current rates. Prioritizing credit card payoff yields 22% guaranteed return.",
    impact: "high",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Reserve Optimization",
    description: "Current coverage at 0.4 months. Building to 3 months provides essential financial security.",
    impact: "medium",
    icon: PiggyBank,
  },
  {
    id: 4,
    title: "Cash Flow Analysis",
    description: "$1,200 monthly variance identified. Subscription audit reveals potential optimization opportunities.",
    impact: "medium",
    icon: DollarSign,
  },
];

// Summary stats
const summaryStats = [
  { label: "Unified Accounts", value: "5" },
  { label: "Total Assets", value: "$78,600" },
  { label: "Total Liabilities", value: "$30,100" },
  { label: "Net Position", value: "$48,500" },
  { label: "Monthly Surplus", value: "$1,800" },
];

// Stagger animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
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
              { label: "Dashboard", href: "/designs/design-10-monochrome/dashboard" },
              { label: "Connect", href: "/designs/design-10-monochrome/connect" },
              { label: "Graph", href: "/designs/design-10-monochrome/graph", active: true },
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

// Financial constellation graph visualization
function ConstellationGraph() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Ring radii (in viewport units relative to container)
  const ringRadii = {
    1: 100, // Inner
    2: 180, // Middle
    3: 260, // Outer
  };

  // Calculate node positions
  const getNodePosition = (node: FinancialNode) => {
    const radius = ringRadii[node.ring as keyof typeof ringRadii];
    const angleRad = (node.angle * Math.PI) / 180;
    return {
      x: Math.cos(angleRad) * radius,
      y: Math.sin(angleRad) * radius,
    };
  };

  // Get color based on node type
  const getNodeColor = (type: NodeType) => {
    switch (type) {
      case "income":
        return emerald[400];
      case "asset":
        return emerald[500];
      case "liability":
        return "#f87171";
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-2xl mx-auto">
      {/* SVG for connection lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="-300 -300 600 600">
        {/* Orbital rings */}
        {[1, 2, 3].map((ring) => (
          <motion.circle
            key={ring}
            cx="0"
            cy="0"
            r={ringRadii[ring as keyof typeof ringRadii]}
            fill="none"
            stroke={emerald[900]}
            strokeWidth="1"
            strokeDasharray="4 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 1, delay: ring * 0.2 }}
          />
        ))}

        {/* Connection lines with glow */}
        {moneyFlows.map((flow) => {
          const fromNode = flow.from === "center" ? { x: 0, y: 0 } : getNodePosition(financialNodes.find((n) => n.id === flow.from)!);
          const toNode = getNodePosition(financialNodes.find((n) => n.id === flow.to)!);

          return (
            <g key={`${flow.from}-${flow.to}`}>
              {/* Glow effect */}
              <motion.line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={emerald[500]}
                strokeWidth="6"
                strokeLinecap="round"
                opacity="0.2"
                filter="blur(4px)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.2 }}
                transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
              />
              {/* Main line */}
              <motion.line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={emerald[500]}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.5 + index * 0.1 }}
              />
              {/* Animated flow dots */}
              <motion.circle
                r="4"
                fill={emerald[400]}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  cx: [fromNode.x, toNode.x],
                  cy: [fromNode.y, toNode.y],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut",
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* Central node (Sarah) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
      >
        <div
          className="relative w-28 h-28 rounded-full flex flex-col items-center justify-center cursor-pointer"
          style={{
            backgroundColor: emerald[900],
            border: `3px solid ${emerald[500]}`,
            boxShadow: `0 0 40px ${emerald[500]}40`,
          }}
        >
          <User className="w-6 h-6 mb-1" style={{ color: emerald[300] }} />
          <span className="font-serif text-lg font-medium" style={{ color: emerald[100] }}>
            {centralNode.name}
          </span>
          <span className="text-xs" style={{ color: emerald[400] }}>
            ${centralNode.netWorth.toLocaleString()}
          </span>
          {/* Pulse animation */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: `2px solid ${emerald[500]}` }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      {/* Financial nodes */}
      {financialNodes.map((node) => {
        const position = getNodePosition(node);
        const Icon = node.icon;
        const isHovered = hoveredNode === node.id;

        return (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            className="absolute z-10"
            style={{
              left: `calc(50% + ${position.x}px)`,
              top: `calc(50% + ${position.y}px)`,
              transform: "translate(-50%, -50%)",
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <motion.div
              animate={{ scale: isHovered ? 1.1 : 1 }}
              className="relative flex flex-col items-center cursor-pointer"
            >
              {/* Node circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: emerald[950],
                  border: `2px solid ${getNodeColor(node.type)}`,
                  boxShadow: isHovered ? `0 0 20px ${getNodeColor(node.type)}60` : "none",
                }}
              >
                <Icon className="w-6 h-6" style={{ color: getNodeColor(node.type) }} />
              </div>
              {/* Label */}
              <div className="mt-2 text-center">
                <p className="text-xs font-medium whitespace-nowrap" style={{ color: emerald[200] }}>
                  {node.name}
                </p>
                <p
                  className="text-xs font-medium"
                  style={{ color: node.value < 0 ? "#f87171" : emerald[400] }}
                >
                  {node.value < 0 ? "-" : ""}${Math.abs(node.value).toLocaleString()}
                </p>
              </div>

              {/* Hover tooltip */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full mt-4 px-3 py-2 rounded-lg whitespace-nowrap z-30"
                  style={{
                    backgroundColor: emerald[900],
                    border: `1px solid ${emerald[700]}`,
                  }}
                >
                  <p className="text-xs" style={{ color: emerald[300] }}>
                    {node.type === "income" && "Annual Income"}
                    {node.type === "asset" && "Current Balance"}
                    {node.type === "liability" && "Outstanding Balance"}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        );
      })}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-0 left-0 flex items-center gap-4 text-xs"
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emerald[400] }} />
          <span style={{ color: emerald[400] }}>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: emerald[500] }} />
          <span style={{ color: emerald[400] }}>Assets</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#f87171" }} />
          <span style={{ color: emerald[400] }}>Liabilities</span>
        </div>
      </motion.div>
    </div>
  );
}

// Insight card component
function InsightCard({ insight }: { insight: typeof insights[0] }) {
  const Icon = insight.icon;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.02 }}
      className="p-5 rounded-xl transition-all duration-300"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${insight.impact === "high" ? emerald[700] : emerald[900]}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: insight.impact === "high" ? emerald[800] : emerald[900] }}
        >
          <Icon
            className="w-5 h-5"
            style={{ color: insight.impact === "high" ? emerald[300] : emerald[400] }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium" style={{ color: emerald[100] }}>
              {insight.title}
            </h3>
            <span
              className="text-xs font-medium px-2 py-1 rounded-full flex-shrink-0"
              style={{
                backgroundColor: insight.impact === "high" ? emerald[800] : emerald[900],
                color: insight.impact === "high" ? emerald[300] : emerald[400],
              }}
            >
              {insight.impact === "high" ? "High Impact" : "Medium Impact"}
            </span>
          </div>
          <p className="text-sm" style={{ color: emerald[400] }}>
            {insight.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Main graph page component
export default function GraphPage() {
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

        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
              Your Financial <span className="italic" style={{ color: emerald[400] }}>Constellation</span>
            </h1>
            <p
              className="text-lg max-w-xl mx-auto"
              style={{ color: emerald[300] }}
            >
              Every connection illuminates new possibilities.
            </p>
          </motion.div>

          {/* Summary stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12 p-4 rounded-xl flex flex-wrap items-center justify-center gap-6 sm:gap-10"
            style={{
              backgroundColor: emerald[950],
              border: `1px solid ${emerald[900]}`,
            }}
          >
            {summaryStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-serif text-xl sm:text-2xl font-medium" style={{ color: emerald[200] }}>
                  {stat.value}
                </p>
                <p className="text-xs" style={{ color: emerald[500] }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left column - Graph visualization */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <ConstellationGraph />
            </motion.div>

            {/* Right column - Insights panel */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <Lightbulb className="w-5 h-5" style={{ color: emerald[400] }} />
                  <h2 className="font-serif text-2xl" style={{ color: emerald[100] }}>
                    Connected Insights
                  </h2>
                </div>
                <p className="text-sm mb-6" style={{ color: emerald[400] }}>
                  AI-generated recommendations powered by your unified financial data.
                </p>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </motion.div>

              {/* Expand connections CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="p-5 rounded-xl"
                style={{
                  backgroundColor: emerald[900] + "40",
                  border: `1px solid ${emerald[800]}`,
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <Plus className="w-5 h-5" style={{ color: emerald[400] }} />
                  <h3 className="font-medium" style={{ color: emerald[200] }}>
                    Expand Your Constellation
                  </h3>
                </div>
                <p className="text-sm mb-4" style={{ color: emerald[400] }}>
                  Connect additional accounts to unlock deeper insights and more personalized recommendations.
                </p>
                <Link
                  href="/designs/design-10-monochrome/connect"
                  className="inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: emerald[300] }}
                >
                  Add more connections <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Flow indicators section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16 p-6 rounded-xl"
            style={{
              backgroundColor: emerald[950],
              border: `1px solid ${emerald[900]}`,
            }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Link2 className="w-5 h-5" style={{ color: emerald[400] }} />
              <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
                Money Flow Analysis
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {moneyFlows.map((flow) => (
                <div
                  key={`${flow.from}-${flow.to}`}
                  className="p-4 rounded-lg flex items-center gap-3"
                  style={{ backgroundColor: emerald[900] + "40" }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: emerald[800] }}
                  >
                    <ArrowRight className="w-4 h-4" style={{ color: emerald[300] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate" style={{ color: emerald[200] }}>
                      {flow.from.charAt(0).toUpperCase() + flow.from.slice(1).replace("-", " ")}
                      {" "}&rarr;{" "}
                      {flow.to.charAt(0).toUpperCase() + flow.to.slice(1).replace("-", " ")}
                    </p>
                    <p className="text-xs" style={{ color: emerald[500] }}>
                      ${flow.amount.toLocaleString()}{flow.frequency}
                    </p>
                  </div>
                  {/* Animated indicator */}
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: emerald[500] }}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
