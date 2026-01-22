"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Calculator,
  Check,
  CreditCard,
  Lock,
  PiggyBank,
  Search,
  Shield,
  TrendingUp,
  Eye,
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

// Mock institutions by category
const institutions = {
  banking: [
    { id: "chase", name: "Chase", logo: "C" },
    { id: "bofa", name: "Bank of America", logo: "B" },
    { id: "wells", name: "Wells Fargo", logo: "W" },
    { id: "capital-one", name: "Capital One", logo: "C" },
  ],
  credit: [
    { id: "amex", name: "American Express", logo: "A" },
    { id: "chase-card", name: "Chase", logo: "C" },
    { id: "discover", name: "Discover", logo: "D" },
    { id: "citi", name: "Citi", logo: "C" },
  ],
  investments: [
    { id: "fidelity", name: "Fidelity", logo: "F" },
    { id: "vanguard", name: "Vanguard", logo: "V" },
    { id: "schwab", name: "Schwab", logo: "S" },
    { id: "robinhood", name: "Robinhood", logo: "R" },
  ],
  retirement: [
    { id: "401k", name: "Employer 401(k)", logo: "4" },
    { id: "trad-ira", name: "Traditional IRA", logo: "T" },
    { id: "roth-ira", name: "Roth IRA", logo: "R" },
  ],
  liabilities: [
    { id: "mortgage", name: "Mortgage", logo: "M" },
    { id: "student-loans", name: "Student Loans", logo: "S" },
    { id: "auto-loans", name: "Auto Loans", logo: "A" },
  ],
};

// Categories configuration
const categories = [
  { id: "banking", name: "Banking", icon: Building2, description: "Checking & Savings" },
  { id: "credit", name: "Credit", icon: CreditCard, description: "Credit Cards" },
  { id: "investments", name: "Investments", icon: TrendingUp, description: "Brokerage Accounts" },
  { id: "retirement", name: "Retirement", icon: PiggyBank, description: "401(k) & IRA" },
  { id: "liabilities", name: "Liabilities", icon: Wallet, description: "Loans & Mortgages" },
];

// Mock connected accounts for Sarah
const connectedAccounts = [
  { id: "chase-private", name: "Chase Private Client", balance: 11600, type: "banking", logo: "C" },
  { id: "fidelity-wealth", name: "Fidelity Wealth", balance: 67000, type: "investments", logo: "F" },
  { id: "amex-plat", name: "American Express", balance: -2100, type: "credit", logo: "A" },
  { id: "fed-loans", name: "Federal Student Loans", balance: -28000, type: "liabilities", logo: "S" },
];

// Security badges
const securityBadges = [
  { icon: Shield, label: "Bank-grade security", description: "256-bit encryption" },
  { icon: Eye, label: "Read-only access", description: "We can never move money" },
  { icon: Lock, label: "Your data, your control", description: "Delete anytime" },
];

// Stagger animation variants
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
              { label: "Connect", href: "/designs/design-10-monochrome/connect", active: true },
              { label: "Graph", href: "/designs/design-10-monochrome/graph" },
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

// Institution card component
function InstitutionCard({
  institution,
  isConnected,
  isConnecting,
  onConnect,
}: {
  institution: { id: string; name: string; logo: string };
  isConnected: boolean;
  isConnecting: boolean;
  onConnect: () => void;
}) {
  return (
    <motion.button
      variants={staggerItem}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onConnect}
      disabled={isConnected || isConnecting}
      className="group p-4 rounded-xl text-left transition-all duration-300 w-full disabled:cursor-default"
      style={{
        backgroundColor: isConnected ? emerald[900] + "40" : emerald[950],
        border: `1px solid ${isConnected ? emerald[600] : emerald[900]}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-serif text-lg font-medium transition-all duration-300"
          style={{
            backgroundColor: isConnected ? emerald[700] : emerald[800],
            color: emerald[100],
          }}
        >
          {institution.logo}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-medium truncate transition-colors duration-200"
            style={{ color: isConnected ? emerald[100] : emerald[200] }}
          >
            {institution.name}
          </p>
        </div>
        {isConnected ? (
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: emerald[500] }}
          >
            <Check className="w-4 h-4" style={{ color: emerald[950] }} />
          </div>
        ) : isConnecting ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-6 h-6 rounded-full border-2 border-t-transparent"
            style={{ borderColor: emerald[500], borderTopColor: "transparent" }}
          />
        ) : (
          <ArrowRight
            className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:translate-x-1"
            style={{ color: emerald[400] }}
          />
        )}
      </div>
    </motion.button>
  );
}

// Connected account card
function ConnectedAccountCard({
  account,
}: {
  account: { id: string; name: string; balance: number; type: string; logo: string };
}) {
  const isNegative = account.balance < 0;

  return (
    <motion.div
      variants={staggerItem}
      className="p-4 rounded-xl"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${emerald[900]}`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center font-serif text-lg font-medium"
          style={{
            backgroundColor: emerald[800],
            color: emerald[100],
          }}
        >
          {account.logo}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" style={{ color: emerald[200] }}>
            {account.name}
          </p>
          <p className="text-xs" style={{ color: emerald[500] }}>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
          </p>
        </div>
        <div className="text-right">
          <p
            className="font-serif text-lg font-medium"
            style={{ color: isNegative ? "#f87171" : emerald[300] }}
          >
            {isNegative ? "-" : ""}${Math.abs(account.balance).toLocaleString()}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// Main connect page component
export default function ConnectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [connectedIds, setConnectedIds] = useState<string[]>(
    connectedAccounts.map((a) => a.id)
  );
  const [connectingId, setConnectingId] = useState<string | null>(null);

  const handleConnect = async (institutionId: string) => {
    setConnectingId(institutionId);
    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setConnectedIds((prev) => [...prev, institutionId]);
    setConnectingId(null);
  };

  const totalConnected = connectedIds.length;
  const totalToConnect = 12;

  // Filter institutions based on search and category
  const filteredInstitutions = selectedCategory
    ? { [selectedCategory]: institutions[selectedCategory as keyof typeof institutions] }
    : institutions;

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
              Unite Your <span className="italic" style={{ color: emerald[400] }}>Financial World</span>
            </h1>
            <p
              className="text-lg max-w-xl mx-auto mb-8"
              style={{ color: emerald[300] }}
            >
              A complete view enables complete clarity.
            </p>

            {/* Security badges */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {securityBadges.map((badge) => (
                <motion.div
                  key={badge.label}
                  variants={staggerItem}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: emerald[950],
                    border: `1px solid ${emerald[800]}`,
                  }}
                >
                  <badge.icon className="w-4 h-4" style={{ color: emerald[400] }} />
                  <span className="text-sm font-medium" style={{ color: emerald[200] }}>
                    {badge.label}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left column - Account categories and search */}
            <div className="lg:col-span-2 space-y-8">
              {/* Search input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="relative"
              >
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                  style={{ color: emerald[500] }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for your bank or institution..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-base outline-none transition-all duration-300"
                  style={{
                    backgroundColor: emerald[950],
                    border: `1px solid ${emerald[800]}`,
                    color: emerald[100],
                  }}
                  onFocus={(e) => (e.target.style.borderColor = emerald[500])}
                  onBlur={(e) => (e.target.style.borderColor = emerald[800])}
                />
              </motion.div>

              {/* Category filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap gap-2"
              >
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: !selectedCategory ? emerald[800] : "transparent",
                    color: !selectedCategory ? emerald[100] : emerald[400],
                    border: `1px solid ${!selectedCategory ? emerald[700] : emerald[900]}`,
                  }}
                >
                  All
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                    style={{
                      backgroundColor: selectedCategory === category.id ? emerald[800] : "transparent",
                      color: selectedCategory === category.id ? emerald[100] : emerald[400],
                      border: `1px solid ${selectedCategory === category.id ? emerald[700] : emerald[900]}`,
                    }}
                  >
                    <category.icon className="w-4 h-4" />
                    {category.name}
                  </button>
                ))}
              </motion.div>

              {/* Progress indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-4 rounded-xl"
                style={{
                  backgroundColor: emerald[900] + "40",
                  border: `1px solid ${emerald[800]}`,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium" style={{ color: emerald[200] }}>
                    Connection Progress
                  </span>
                  <span className="text-sm" style={{ color: emerald[400] }}>
                    {totalConnected} of {totalToConnect} accounts unified
                  </span>
                </div>
                <div
                  className="h-2 rounded-full overflow-hidden"
                  style={{ backgroundColor: emerald[900] }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(totalConnected / totalToConnect) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: emerald[500] }}
                  />
                </div>
              </motion.div>

              {/* Institution grids by category */}
              <AnimatePresence mode="wait">
                {Object.entries(filteredInstitutions).map(([categoryId, categoryInstitutions]) => {
                  const category = categories.find((c) => c.id === categoryId);
                  if (!category) return null;

                  const filteredBySearch = categoryInstitutions.filter((inst) =>
                    inst.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredBySearch.length === 0) return null;

                  return (
                    <motion.div
                      key={categoryId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-2">
                        <category.icon className="w-5 h-5" style={{ color: emerald[400] }} />
                        <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
                          {category.name}
                        </h2>
                        <span className="text-sm" style={{ color: emerald[500] }}>
                          - {category.description}
                        </span>
                      </div>

                      <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="grid sm:grid-cols-2 gap-3"
                      >
                        {filteredBySearch.map((institution) => (
                          <InstitutionCard
                            key={institution.id}
                            institution={institution}
                            isConnected={connectedIds.includes(institution.id)}
                            isConnecting={connectingId === institution.id}
                            onConnect={() => handleConnect(institution.id)}
                          />
                        ))}
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right column - Connected accounts summary */}
            <div className="lg:col-span-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="p-6 rounded-xl sticky top-24"
                style={{
                  backgroundColor: emerald[950],
                  border: `1px solid ${emerald[900]}`,
                }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: emerald[800] }}
                  >
                    <Check className="w-4 h-4" style={{ color: emerald[300] }} />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg" style={{ color: emerald[100] }}>
                      Connected Accounts
                    </h3>
                    <p className="text-xs" style={{ color: emerald[500] }}>
                      Sarah&apos;s unified view
                    </p>
                  </div>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {connectedAccounts.map((account) => (
                    <ConnectedAccountCard key={account.id} account={account} />
                  ))}
                </motion.div>

                {/* Net summary */}
                <div
                  className="mt-6 pt-6 border-t"
                  style={{ borderColor: emerald[900] }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm" style={{ color: emerald[400] }}>
                      Net Position
                    </span>
                    <span className="font-serif text-xl font-medium" style={{ color: emerald[300] }}>
                      $48,500
                    </span>
                  </div>

                  <Link
                    href="/designs/design-10-monochrome/graph"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-all duration-200"
                    style={{
                      backgroundColor: emerald[500],
                      color: emerald[950],
                    }}
                  >
                    View Your Financial Constellation
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
