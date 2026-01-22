"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Calculator,
  ChevronDown,
  Eye,
  Shield,
  Sparkles,
  CreditCard,
  PiggyBank,
  TrendingUp,
  FileText,
  Receipt,
  Heart,
  Building2,
  Percent,
  Menu,
  X,
} from "lucide-react";

// ============================================================================
// MONOCHROME LUXE - Deep Emerald
// ============================================================================
// A single-hue design system built on deep emerald (#064e3b) with tonal
// variations creating sophistication through restraint. Combined with black
// and near-black for a premium, confident aesthetic.
// ============================================================================

// Emerald color palette - single hue, multiple values
const emerald = {
  950: "#022c22", // Darkest - near black
  900: "#064e3b", // Base emerald
  800: "#065f46", // Rich emerald
  700: "#047857", // Medium emerald
  600: "#059669", // Bright emerald
  500: "#10b981", // Vibrant emerald
  400: "#34d399", // Light emerald
  300: "#6ee7b7", // Pale emerald
  200: "#a7f3d0", // Very light
  100: "#d1fae5", // Whisper
  50: "#ecfdf5",  // Near white tint
};

// Category data with emerald theming
const categories = [
  { id: "credit-cards", name: "Credit Cards", icon: CreditCard, count: 6 },
  { id: "banking", name: "Banking", icon: Building2, count: 3 },
  { id: "investing", name: "Investing", icon: TrendingUp, count: 12 },
  { id: "taxes", name: "Taxes", icon: FileText, count: 10 },
  { id: "debt", name: "Debt", icon: Receipt, count: 2 },
  { id: "budgeting", name: "Budgeting", icon: PiggyBank, count: 4 },
  { id: "equity", name: "Equity Comp", icon: Percent, count: 1 },
  { id: "giving", name: "Charitable Giving", icon: Heart, count: 1 },
];

// Featured tools - punchy, honest descriptions
const featuredTools = [
  {
    name: "Roth vs Traditional Calculator",
    description: "Which saves more? We did the math.",
    category: "investing",
  },
  {
    name: "FIRE Calculator",
    description: "When can you tell your boss to get lost?",
    category: "investing",
  },
  {
    name: "Home Affordability Reality Check",
    description: "What you can ACTUALLY afford. Banks lie.",
    category: "budgeting",
  },
  {
    name: "TPG Transparency Tool",
    description: "See how affiliate $$ drives their recommendations.",
    category: "credit-cards",
  },
  {
    name: "Debt Destroyer",
    description: "Snowball vs avalanche. Fight.",
    category: "debt",
  },
  {
    name: "Mega Backdoor Roth Calculator",
    description: "$46k+ extra to Roth. Legally.",
    category: "investing",
  },
];

// All tools organized by category
const allTools = {
  "Credit Cards": [
    "Bilt 2.0 Calculator",
    "Annual Fee Analyzer",
    "Chase Trifecta Calculator",
    "Amex Gold vs Platinum",
    "Points Valuation Dashboard",
    "TPG Transparency Tool",
  ],
  "Banking": [
    "I Bond vs HYSA Comparison",
    "High-Yield Savings Finder",
    "Bank Bonus Calculator",
  ],
  "Investing": [
    "Roth vs Traditional Calculator",
    "2026 Contribution Limits",
    "Roth Catch-Up Planner",
    "Mega Backdoor Roth Calculator",
    "529-to-Roth Rollover Planner",
    "FIRE Calculator",
    "Super Catch-Up Optimizer",
    "Equity Concentration Risk",
    "Dividend Income Tracker",
    "Compound Interest Calculator",
    "401k Contribution Calculator",
    "Total Compensation Calculator",
  ],
  "Taxes": [
    "RSU Tax Calculator",
    "Crypto Cost Basis Calculator",
    "Backdoor Roth IRA Guide",
    "OBBB Tax Savings Calculator",
    "Stock Option Exercise Tool",
    "Tax Bracket Optimizer",
    "Medicare IRMAA Planner",
    "Estate Tax Calculator",
    "HSA Maximization Tool",
    "Paycheck Calculator",
  ],
  "Debt": [
    "Debt Destroyer",
    "Student Loan Strategy Planner",
  ],
  "Budgeting": [
    "Emergency Fund Planner",
    "Home Affordability Reality Check",
    "Conscious Spending Planner",
    "Savings Goal Planner",
  ],
  "Credit Building": [
    "Credit Score Simulator",
  ],
  "Charitable Giving": [
    "Appreciated Stock Donation Calculator",
  ],
};

// ============================================================================
// ANIMATED COMPONENTS
// ============================================================================

// Subtle floating animation for decorative elements
const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    initial={{ y: 0 }}
    animate={{ y: [-5, 5, -5] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: "easeInOut" }}
  >
    {children}
  </motion.div>
);

// Staggered reveal animation
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const }
  },
};

// ============================================================================
// NAVIGATION
// ============================================================================

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-black/90 backdrop-blur-xl border-b border-emerald-900/30"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                  style={{ backgroundColor: emerald[800] }}
                >
                  <Calculator className="w-5 h-5 text-emerald-100" />
                </div>
                <div
                  className="absolute -inset-1 rounded-xl opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300"
                  style={{ backgroundColor: emerald[500] }}
                />
              </div>
              <span className="font-serif text-2xl tracking-tight text-white">
                Clear<span style={{ color: emerald[400] }}>Money</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {["Tools", "Methodology", "About"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-sm font-medium text-emerald-100/60 hover:text-emerald-100 transition-colors duration-200"
                >
                  {item}
                </Link>
              ))}
              <Link
                href="#newsletter"
                className="px-5 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: emerald[800],
                  color: emerald[100],
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = emerald[700];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = emerald[800];
                }}
              >
                Subscribe
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-emerald-100/60 hover:text-emerald-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-xl md:hidden pt-24"
          >
            <div className="flex flex-col items-center gap-8 p-8">
              {["Tools", "Methodology", "About", "Subscribe"].map((item) => (
                <Link
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-2xl font-serif text-emerald-100/80 hover:text-emerald-100 transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Subtle gradient background */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${emerald[900]}40 0%, transparent 60%)`,
        }}
      />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left emerald glow */}
        <FloatingElement delay={0}>
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: emerald[800] }}
          />
        </FloatingElement>

        {/* Bottom right emerald glow */}
        <FloatingElement delay={2}>
          <div
            className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full blur-3xl opacity-15"
            style={{ backgroundColor: emerald[700] }}
          />
        </FloatingElement>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${emerald[500]} 1px, transparent 1px), linear-gradient(90deg, ${emerald[500]} 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
        >
          {/* Tagline */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-12"
            style={{
              backgroundColor: `${emerald[900]}80`,
              color: emerald[300],
              border: `1px solid ${emerald[800]}`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Your Personal Wealth Advisor</span>
          </div>

          {/* Main headline */}
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-8xl tracking-tight text-white leading-[0.95] mb-8">
            Financial clarity
            <br />
            <span
              className="italic"
              style={{ color: emerald[400] }}
            >
              without the noise
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed mb-12"
            style={{ color: emerald[200] + "99" }}
          >
            A refined approach to personal finance. Receive curated guidance tailored to your unique circumstances.
            <span className="font-medium" style={{ color: emerald[100] }}> No affiliates. No agenda.</span>
            {" "}Simply clarity.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/designs/design-10-monochrome/onboarding">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-3 px-8 py-4 text-base font-medium rounded-lg transition-all duration-300 cursor-pointer"
                style={{
                  backgroundColor: emerald[500],
                  color: emerald[950],
                }}
              >
                Begin Your Journey
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.div>
            </Link>

            <motion.a
              href="#tools"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 px-8 py-4 text-base font-medium rounded-lg transition-all duration-300"
              style={{
                border: `1px solid ${emerald[700]}`,
                color: emerald[100],
              }}
            >
              Explore Tools
            </motion.a>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
          className="mt-20 flex flex-wrap items-center justify-center gap-x-12 gap-y-6"
        >
          {[
            { label: "Free Tools", value: "31+" },
            { label: "Always Free", value: "$0" },
            { label: "Affiliate Bias", value: "0%" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-3xl font-serif font-medium mb-1"
                style={{ color: emerald[300] }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-medium tracking-wider uppercase"
                style={{ color: emerald[500] }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown
              className="w-6 h-6"
              style={{ color: emerald[600] }}
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// PERSONAL WEALTH ADVISOR SECTION
// ============================================================================

function WealthAdvisorSection() {
  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${emerald[900]}30 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          {/* Section label */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider uppercase mb-8"
            style={{
              backgroundColor: `${emerald[900]}80`,
              color: emerald[300],
              border: `1px solid ${emerald[800]}`,
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Guidance</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-6 leading-tight">
            Your Personal <span className="italic" style={{ color: emerald[400] }}>Wealth Advisor</span>
          </h2>
          <p
            className="max-w-2xl mx-auto text-lg leading-relaxed mb-12"
            style={{ color: emerald[300] }}
          >
            Beyond calculators and tools, discover a refined approach to financial planning.
            Share your circumstances, receive curated recommendations tailored precisely to your journey.
          </p>

          {/* Features */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            {[
              {
                title: "Personalized Analysis",
                description: "Your income, assets, and aspirations inform every recommendation",
              },
              {
                title: "Prioritized Guidance",
                description: "Understand which actions will have the greatest impact first",
              },
              {
                title: "Progress Tracking",
                description: "Visualize your wealth journey with elegant milestones",
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: emerald[950],
                  border: `1px solid ${emerald[900]}`,
                }}
              >
                <h3
                  className="font-serif text-xl mb-3"
                  style={{ color: emerald[100] }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: emerald[400] }}
                >
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <Link href="/designs/design-10-monochrome/onboarding">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex items-center gap-3 px-8 py-4 text-base font-medium rounded-lg transition-all duration-300 cursor-pointer"
              style={{
                backgroundColor: emerald[500],
                color: emerald[950],
              }}
            >
              Begin Your Journey
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// CATEGORIES SECTION
// ============================================================================

function CategoriesSection() {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <section id="tools" className="relative py-32 bg-black overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${emerald[950]}30 0%, transparent 50%, ${emerald[950]}30 100%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-6">
            Tools first, <span style={{ color: emerald[400] }}>content second</span>
          </h2>
          <p
            className="max-w-xl mx-auto text-lg"
            style={{ color: emerald[300] + "99" }}
          >
            Every tool is free. Every formula is public. No hidden agendas.
          </p>
        </motion.div>

        {/* Category grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {categories.map((category) => (
            <motion.div
              key={category.id}
              variants={staggerItem}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className="group relative"
            >
              <Link
                href={`#${category.id}`}
                className="block p-6 rounded-xl transition-all duration-300"
                style={{
                  backgroundColor: hoveredCategory === category.id ? emerald[900] + "60" : "transparent",
                  border: `1px solid ${hoveredCategory === category.id ? emerald[700] : emerald[900]}`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: hoveredCategory === category.id ? emerald[800] : emerald[900],
                    }}
                  >
                    <category.icon
                      className="w-6 h-6 transition-colors duration-300"
                      style={{ color: hoveredCategory === category.id ? emerald[300] : emerald[500] }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: emerald[900],
                      color: emerald[400],
                    }}
                  >
                    {category.count} tools
                  </span>
                </div>
                <h3
                  className="font-medium text-lg transition-colors duration-300"
                  style={{ color: hoveredCategory === category.id ? emerald[100] : emerald[200] }}
                >
                  {category.name}
                </h3>
                <div
                  className="mt-3 flex items-center gap-2 text-sm font-medium transition-all duration-300"
                  style={{
                    color: emerald[500],
                    opacity: hoveredCategory === category.id ? 1 : 0,
                    transform: hoveredCategory === category.id ? "translateX(0)" : "translateX(-10px)",
                  }}
                >
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FEATURED TOOLS SECTION
// ============================================================================

function FeaturedToolsSection() {
  return (
    <section className="relative py-32 bg-black overflow-hidden">
      {/* Decorative line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${emerald[700]} 100%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-16"
        >
          <div>
            <p
              className="text-xs font-medium tracking-wider uppercase mb-3"
              style={{ color: emerald[500] }}
            >
              Most Popular
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-white">
              Featured <span className="italic" style={{ color: emerald[400] }}>Tools</span>
            </h2>
          </div>
          <Link
            href="#all-tools"
            className="mt-4 sm:mt-0 flex items-center gap-2 text-sm font-medium transition-colors duration-200"
            style={{ color: emerald[400] }}
          >
            View all tools <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Featured tools grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featuredTools.map((tool) => (
            <motion.div
              key={tool.name}
              variants={staggerItem}
              className="group"
            >
              <Link
                href="#"
                className="block relative p-6 rounded-xl transition-all duration-500 overflow-hidden"
                style={{
                  backgroundColor: emerald[950],
                  border: `1px solid ${emerald[900]}`,
                }}
              >
                {/* Hover gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `linear-gradient(135deg, ${emerald[900]}60 0%, transparent 60%)`,
                  }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className="text-xs font-medium tracking-wider uppercase"
                      style={{ color: emerald[600] }}
                    >
                      {tool.category.replace("-", " ")}
                    </span>
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                      style={{ backgroundColor: emerald[800] }}
                    >
                      <Calculator className="w-5 h-5" style={{ color: emerald[300] }} />
                    </div>
                  </div>

                  <h3
                    className="font-serif text-xl mb-2 transition-colors duration-300 group-hover:text-white"
                    style={{ color: emerald[100] }}
                  >
                    {tool.name}
                  </h3>
                  <p
                    className="text-sm leading-relaxed mb-6"
                    style={{ color: emerald[400] }}
                  >
                    {tool.description}
                  </p>

                  <div
                    className="flex items-center gap-2 text-sm font-medium transition-all duration-300"
                    style={{ color: emerald[500] }}
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      Try it now
                    </span>
                    <ArrowRight className="w-4 h-4 transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                </div>

                {/* Decorative corner */}
                <div
                  className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 100% 0%, ${emerald[700]}30 0%, transparent 70%)`,
                  }}
                />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// ALL TOOLS GALLERY
// ============================================================================

function AllToolsSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const categoryList = ["All", ...Object.keys(allTools)];

  const filteredTools = activeCategory === "All"
    ? Object.entries(allTools).flatMap(([cat, tools]) => tools.map(t => ({ name: t, category: cat })))
    : (allTools[activeCategory as keyof typeof allTools] || []).map(t => ({ name: t, category: activeCategory }));

  return (
    <section id="all-tools" className="relative py-32 bg-black overflow-hidden">
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(${emerald[500]} 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-4xl sm:text-5xl text-white mb-6">
            All <span style={{ color: emerald[400] }}>31+</span> Decision Tools
          </h2>
          <p
            className="max-w-xl mx-auto text-lg"
            style={{ color: emerald[300] + "99" }}
          >
            Every tool is free. Every formula is public. No paywalls, ever.
          </p>
        </motion.div>

        {/* Category filter */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-16">
          {categoryList.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
              style={{
                backgroundColor: activeCategory === category ? emerald[800] : "transparent",
                color: activeCategory === category ? emerald[100] : emerald[500],
                border: `1px solid ${activeCategory === category ? emerald[700] : emerald[900]}`,
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tools grid */}
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3"
        >
          <AnimatePresence mode="popLayout">
            {filteredTools.map((tool, index) => (
              <motion.div
                key={tool.name}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
              >
                <Link
                  href="#"
                  className="group block p-4 rounded-lg transition-all duration-300"
                  style={{
                    backgroundColor: emerald[950],
                    border: `1px solid ${emerald[900]}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = emerald[700];
                    e.currentTarget.style.backgroundColor = emerald[900] + "40";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = emerald[900];
                    e.currentTarget.style.backgroundColor = emerald[950];
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-sm font-medium truncate transition-colors duration-300 group-hover:text-white"
                        style={{ color: emerald[200] }}
                      >
                        {tool.name}
                      </h3>
                      <p
                        className="text-xs mt-1"
                        style={{ color: emerald[600] }}
                      >
                        {tool.category}
                      </p>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 flex-shrink-0 ml-2 transition-all duration-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
                      style={{ color: emerald[500] }}
                    />
                  </div>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// METHODOLOGY / TRANSPARENCY SECTION
// ============================================================================

function MethodologySection() {
  const principles = [
    {
      icon: Shield,
      title: "No Corporate Influence",
      description: "We serve you, not banks or card issuers. Our advice is based on math, not who pays us.",
    },
    {
      icon: Eye,
      title: "Radical Transparency",
      description: "Open-source calculations you can verify. Every formula published and verifiable.",
    },
    {
      icon: Calculator,
      title: "Tools First",
      description: "Plug in numbers, get an answer in seconds. No 3,000-word articles for simple questions.",
    },
  ];

  const themVsUs = {
    them: [
      "Affiliate commissions drive recommendations",
      "Hide methodology behind 'proprietary algorithms'",
      "3,000-word articles for simple questions",
      "Inflate point valuations to push premium cards",
    ],
    us: [
      "Tools first, content second",
      "Every formula published and verifiable",
      "Plug in numbers, get an answer in seconds",
      "Conservative valuations backed by data",
    ],
  };

  return (
    <section id="methodology" className="relative py-32 overflow-hidden" style={{ backgroundColor: emerald[950] }}>
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${emerald[900]}30 0%, transparent 50%, ${emerald[900]}30 100%)`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <p
              className="text-xs font-medium tracking-wider uppercase mb-4"
              style={{ color: emerald[500] }}
            >
              Our Approach
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-white mb-6 leading-tight">
              We show our <span className="italic" style={{ color: emerald[400] }}>math</span>
            </h2>
            <p
              className="text-lg leading-relaxed mb-8"
              style={{ color: emerald[300] }}
            >
              The financial advice industry is broken. Most &quot;advice&quot; sites exist to serve banks
              and advertisers, not you. They&apos;re paid to push products, inflate valuations, and
              bury the real math under walls of SEO content.
            </p>
            <p
              className="text-lg leading-relaxed font-medium"
              style={{ color: emerald[100] }}
            >
              We&apos;re building something different. A platform that serves people, not corporations.
            </p>

            {/* Them vs Us Comparison */}
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${emerald[900]}40`, border: `1px solid ${emerald[800]}` }}
              >
                <p className="text-xs font-medium tracking-wider uppercase mb-3" style={{ color: emerald[600] }}>
                  Them (NerdWallet, TPG)
                </p>
                <ul className="space-y-2">
                  {themVsUs.them.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: emerald[400] }}>
                      <span style={{ color: "#ef4444" }}>✕</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `${emerald[800]}30`, border: `1px solid ${emerald[600]}` }}
              >
                <p className="text-xs font-medium tracking-wider uppercase mb-3" style={{ color: emerald[400] }}>
                  Us (ClearMoney)
                </p>
                <ul className="space-y-2">
                  {themVsUs.us.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: emerald[200] }}>
                      <span style={{ color: emerald[400] }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-10">
              <Link
                href="#"
                className="inline-flex items-center gap-3 text-base font-medium transition-colors duration-200"
                style={{ color: emerald[400] }}
              >
                Read our full methodology
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          {/* Right column - Principles */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="space-y-6"
          >
            {principles.map((principle) => (
              <motion.div
                key={principle.title}
                variants={staggerItem}
                className="p-6 rounded-xl"
                style={{
                  backgroundColor: emerald[900] + "30",
                  border: `1px solid ${emerald[800]}`,
                }}
              >
                <div className="flex items-start gap-5">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: emerald[800] }}
                  >
                    <principle.icon className="w-6 h-6" style={{ color: emerald[300] }} />
                  </div>
                  <div>
                    <h3
                      className="font-serif text-xl mb-2"
                      style={{ color: emerald[100] }}
                    >
                      {principle.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: emerald[400] }}
                    >
                      {principle.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// NEWSLETTER SECTION
// ============================================================================

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section id="newsletter" className="relative py-32 bg-black overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: emerald[800] }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-8"
            style={{
              backgroundColor: emerald[900],
              border: `1px solid ${emerald[800]}`,
            }}
          >
            <Sparkles className="w-8 h-8" style={{ color: emerald[400] }} />
          </div>

          <h2 className="font-serif text-4xl sm:text-5xl text-white mb-6">
            Get tools, <span className="italic" style={{ color: emerald[400] }}>not fluff</span>
          </h2>
          <p
            className="text-lg mb-10 max-w-md mx-auto"
            style={{ color: emerald[300] }}
          >
            New calculator launches, methodology updates, and honest takes on financial products. Weekly max.
          </p>

          {/* Email form */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-5 py-4 rounded-lg text-base outline-none transition-all duration-300"
              style={{
                backgroundColor: emerald[950],
                border: `1px solid ${emerald[800]}`,
                color: emerald[100],
              }}
            />
            <button
              type="submit"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="px-8 py-4 rounded-lg text-base font-medium transition-all duration-300"
              style={{
                backgroundColor: isHovered ? emerald[400] : emerald[500],
                color: emerald[950],
              }}
            >
              Subscribe
            </button>
          </form>

          <p
            className="mt-6 text-xs"
            style={{ color: emerald[600] }}
          >
            No spam. Unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

function Footer() {
  const footerLinks = {
    Tools: ["Credit Cards", "Investing", "Taxes", "Budgeting"],
    Company: ["About", "Methodology", "Transparency", "Blog"],
    Legal: ["Privacy", "Terms", "Disclosures"],
  };

  return (
    <footer
      className="relative py-20"
      style={{
        backgroundColor: emerald[950],
        borderTop: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: emerald[800] }}
              >
                <Calculator className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="font-serif text-2xl tracking-tight text-white">
                Clear<span style={{ color: emerald[400] }}>Money</span>
              </span>
            </Link>
            <p
              className="text-sm leading-relaxed max-w-xs mb-3"
              style={{ color: emerald[500] }}
            >
              Financial literacy for everyone. No corporate influence.
              Just honest tools and transparent advice.
            </p>
            <p
              className="text-xs px-3 py-1.5 rounded-full inline-block"
              style={{ backgroundColor: emerald[900], color: emerald[400], border: `1px solid ${emerald[800]}` }}
            >
              Built with love, not VC money
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-xs font-medium tracking-wider uppercase mb-4"
                style={{ color: emerald[600] }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm transition-colors duration-200"
                      style={{ color: emerald[400] }}
                      onMouseEnter={(e) => e.currentTarget.style.color = emerald[200]}
                      onMouseLeave={(e) => e.currentTarget.style.color = emerald[400]}
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: `1px solid ${emerald[900]}` }}
        >
          <p
            className="text-xs"
            style={{ color: emerald[700] }}
          >
            &copy; {new Date().getFullYear()} ClearMoney. All rights reserved.
          </p>
          <p
            className="text-xs text-center"
            style={{ color: emerald[700] }}
          >
            We may earn affiliate commissions from some links.
            <Link
              href="#"
              className="underline ml-1"
              style={{ color: emerald[600] }}
            >
              See our transparency page.
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function MonochromeLuxePage() {
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

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: ${emerald[950]};
        }
        ::-webkit-scrollbar-thumb {
          background: ${emerald[800]};
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: ${emerald[700]};
        }

        /* Selection */
        ::selection {
          background: ${emerald[700]}80;
          color: ${emerald[100]};
        }

        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="min-h-screen bg-black text-white antialiased">
        <Navigation />
        <HeroSection />
        <WealthAdvisorSection />
        <CategoriesSection />
        <FeaturedToolsSection />
        <AllToolsSection />
        <MethodologySection />
        <NewsletterSection />
        <Footer />
      </div>
    </>
  );
}
