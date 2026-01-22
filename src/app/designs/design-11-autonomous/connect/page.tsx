"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Shield,
  Eye,
  Trash2,
  Check,
  Building2,
  CreditCard,
  TrendingUp,
  GraduationCap,
  Home,
  ArrowRight,
} from "lucide-react";
import {
  colors,
  GradientBlob,
  GlobalStyles,
  NoiseTexture,
  AppNavigation,
} from "../shared";

// ============================================================================
// CONNECT PAGE
// ============================================================================
// Clean, trustworthy account linking experience with:
// - Trust indicators (256-bit encryption, read-only access, delete anytime)
// - Account categories with mock institutions
// - Clean connection states
// - Connected accounts summary
// ============================================================================

// Format currency helper
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

// Mock institutions by category
const institutions = {
  banking: [
    { id: "chase", name: "Chase", logo: "C" },
    { id: "bofa", name: "Bank of America", logo: "B" },
    { id: "wells", name: "Wells Fargo", logo: "W" },
    { id: "capital-one", name: "Capital One", logo: "CO" },
    { id: "citi-bank", name: "Citi Bank", logo: "Ci" },
    { id: "us-bank", name: "US Bank", logo: "US" },
  ],
  creditCards: [
    { id: "amex", name: "American Express", logo: "AE" },
    { id: "chase-card", name: "Chase", logo: "C" },
    { id: "discover", name: "Discover", logo: "D" },
    { id: "citi", name: "Citi", logo: "Ci" },
    { id: "capital-one-card", name: "Capital One", logo: "CO" },
    { id: "barclays", name: "Barclays", logo: "Ba" },
  ],
  investments: [
    { id: "fidelity", name: "Fidelity", logo: "F" },
    { id: "vanguard", name: "Vanguard", logo: "V" },
    { id: "schwab", name: "Schwab", logo: "S" },
    { id: "robinhood", name: "Robinhood", logo: "R" },
    { id: "etrade", name: "E*TRADE", logo: "E" },
    { id: "td-ameritrade", name: "TD Ameritrade", logo: "TD" },
  ],
  retirement: [
    { id: "401k", name: "401(k) Plans", logo: "4K" },
    { id: "ira", name: "Traditional IRA", logo: "IR" },
    { id: "roth-ira", name: "Roth IRA", logo: "Ro" },
    { id: "403b", name: "403(b) Plans", logo: "4B" },
    { id: "pension", name: "Pension", logo: "Pe" },
  ],
  loans: [
    { id: "mortgage", name: "Mortgage", logo: "Mo" },
    { id: "student-loans", name: "Student Loans", logo: "SL" },
    { id: "auto", name: "Auto Loans", logo: "Au" },
    { id: "personal", name: "Personal Loans", logo: "PL" },
  ],
};

// Sarah's connected accounts
const connectedAccounts = [
  { id: "chase-checking", name: "Chase Checking", institution: "Chase", balance: 8400, type: "asset" },
  { id: "chase-savings", name: "Chase Savings", institution: "Chase", balance: 3200, type: "asset" },
  { id: "fidelity-401k", name: "Fidelity 401(k)", institution: "Fidelity", balance: 67000, type: "asset" },
  { id: "amex-platinum", name: "Amex Platinum", institution: "American Express", balance: -2100, type: "debt" },
  { id: "student-loans", name: "Student Loans", institution: "Navient", balance: -28000, type: "debt" },
];

// Category configuration
const categories = [
  { key: "banking", name: "Banking", icon: Building2, description: "Checking & Savings" },
  { key: "creditCards", name: "Credit Cards", icon: CreditCard, description: "All your cards" },
  { key: "investments", name: "Investments", icon: TrendingUp, description: "Brokerage accounts" },
  { key: "retirement", name: "Retirement", icon: GraduationCap, description: "401(k), IRA, Roth" },
  { key: "loans", name: "Loans", icon: Home, description: "Mortgage, Auto, Student" },
];

// ============================================================================
// TRUST BADGES COMPONENT
// ============================================================================

function TrustBadges() {
  const badges = [
    { icon: Shield, text: "256-bit encryption" },
    { icon: Eye, text: "Read-only access" },
    { icon: Trash2, text: "Delete anytime" },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {badges.map((badge) => (
        <div
          key={badge.text}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            backgroundColor: `${colors.success}10`,
            border: `1px solid ${colors.success}30`,
          }}
        >
          <badge.icon className="w-4 h-4" style={{ color: colors.success }} />
          <span className="text-sm font-medium" style={{ color: colors.success }}>
            {badge.text}
          </span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// INSTITUTION CARD COMPONENT
// ============================================================================

function InstitutionCard({
  institution,
  isConnected,
  onConnect,
}: {
  institution: { id: string; name: string; logo: string };
  isConnected: boolean;
  onConnect: () => void;
}) {
  return (
    <button
      onClick={onConnect}
      className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 text-left w-full"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${isConnected ? colors.accent : colors.border}`,
        boxShadow: isConnected ? `0 0 0 2px ${colors.accent}20` : undefined,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-bold"
          style={{
            background: isConnected
              ? `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`
              : `linear-gradient(135deg, ${colors.border} 0%, ${colors.borderLight} 100%)`,
            color: isConnected ? "white" : colors.textMuted,
          }}
        >
          {isConnected ? <Check className="w-5 h-5" /> : institution.logo}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold truncate"
            style={{ color: colors.text }}
          >
            {institution.name}
          </p>
          <p className="text-sm" style={{ color: isConnected ? colors.accent : colors.textLight }}>
            {isConnected ? "Connected" : "Tap to connect"}
          </p>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// CONNECTED ACCOUNTS SUMMARY
// ============================================================================

function ConnectedAccountsSummary() {
  const totalAssets = connectedAccounts
    .filter((a) => a.type === "asset")
    .reduce((sum, a) => sum + a.balance, 0);
  const totalDebts = connectedAccounts
    .filter((a) => a.type === "debt")
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  return (
    <div
      className="p-6 rounded-3xl"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
          Connected Accounts
        </h3>
        <span
          className="text-sm font-medium px-3 py-1 rounded-full"
          style={{
            backgroundColor: `${colors.accent}10`,
            color: colors.accent,
          }}
        >
          {connectedAccounts.length} accounts
        </span>
      </div>

      <div className="space-y-3 mb-6">
        {connectedAccounts.map((account) => (
          <div
            key={account.id}
            className="flex items-center justify-between py-2"
            style={{ borderBottom: `1px solid ${colors.borderLight}` }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  backgroundColor: account.type === "asset" ? `${colors.success}10` : `${colors.warning}10`,
                }}
              >
                {account.type === "asset" ? (
                  <Building2 className="w-4 h-4" style={{ color: colors.success }} />
                ) : (
                  <CreditCard className="w-4 h-4" style={{ color: colors.warning }} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: colors.text }}>
                  {account.name}
                </p>
                <p className="text-xs" style={{ color: colors.textLight }}>
                  {account.institution}
                </p>
              </div>
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: account.type === "asset" ? colors.success : colors.warning }}
            >
              {formatCurrency(account.balance)}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
        <div>
          <p className="text-xs mb-1" style={{ color: colors.textLight }}>
            Total Assets
          </p>
          <p className="text-xl font-bold" style={{ color: colors.success }}>
            {formatCurrency(totalAssets)}
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: colors.textLight }}>
            Total Debts
          </p>
          <p className="text-xl font-bold" style={{ color: colors.warning }}>
            {formatCurrency(totalDebts)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN CONNECT PAGE
// ============================================================================

export default function ConnectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("banking");
  const [connectedIds, setConnectedIds] = useState<string[]>([
    "chase",
    "fidelity",
    "amex",
    "student-loans",
  ]);

  const handleConnect = (id: string) => {
    setConnectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const currentInstitutions = institutions[selectedCategory as keyof typeof institutions] || [];
  const filteredInstitutions = searchQuery
    ? currentInstitutions.filter((inst) =>
        inst.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentInstitutions;

  const totalConnected = connectedIds.length;

  return (
    <>
      <GlobalStyles />

      <div className="min-h-screen relative" style={{ backgroundColor: colors.bg }}>
        {/* Gradient blobs */}
        <GradientBlob
          color={colors.blob1}
          size={700}
          top="-15%"
          left="-10%"
          opacity={0.25}
          blur={100}
          animate
        />
        <GradientBlob
          color={colors.blob2}
          size={500}
          top="30%"
          right="-15%"
          opacity={0.2}
          blur={90}
          animate
          delay={5}
        />
        <GradientBlob
          color={colors.blob3}
          size={400}
          bottom="10%"
          left="20%"
          opacity={0.2}
          blur={80}
          animate
          delay={10}
        />

        <NoiseTexture />
        <AppNavigation currentPage="connect" />

        {/* Main content */}
        <main className="relative z-10 pt-28 pb-16 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h1
                className="text-4xl sm:text-5xl font-bold mb-4"
                style={{ color: colors.text }}
              >
                Connect Your Accounts
              </h1>
              <p className="text-xl max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
                See your complete financial picture in one place.
              </p>
              <TrustBadges />
            </div>

            {/* Progress indicator */}
            <div className="max-w-md mx-auto mb-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: colors.textMuted }}>
                  Connection progress
                </span>
                <span className="text-sm font-semibold" style={{ color: colors.accent }}>
                  {totalConnected} of 12 accounts connected
                </span>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.border }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${(totalConnected / 12) * 100}%`,
                    background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.blob2} 100%)`,
                  }}
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left column - Institution selection */}
              <div className="lg:col-span-2">
                {/* Search */}
                <div className="mb-6">
                  <div
                    className="relative"
                    style={{
                      backgroundColor: colors.bgAlt,
                      borderRadius: "16px",
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Search
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                      style={{ color: colors.textLight }}
                    />
                    <input
                      type="text"
                      placeholder="Search for your bank or institution..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-transparent outline-none text-base"
                      style={{ color: colors.text }}
                    />
                  </div>
                </div>

                {/* Category tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => setSelectedCategory(category.key)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200"
                      style={{
                        backgroundColor:
                          selectedCategory === category.key
                            ? colors.accent
                            : colors.bgAlt,
                        color:
                          selectedCategory === category.key
                            ? "white"
                            : colors.textMuted,
                        border: `1px solid ${
                          selectedCategory === category.key
                            ? colors.accent
                            : colors.border
                        }`,
                      }}
                    >
                      <category.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{category.name}</span>
                    </button>
                  ))}
                </div>

                {/* Institutions grid */}
                <div
                  className="p-6 rounded-3xl"
                  style={{
                    backgroundColor: colors.bgAlt,
                    border: `1px solid ${colors.border}`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: colors.text }}>
                      {categories.find((c) => c.key === selectedCategory)?.name}
                    </h3>
                    <span className="text-sm" style={{ color: colors.textLight }}>
                      {categories.find((c) => c.key === selectedCategory)?.description}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {filteredInstitutions.map((institution) => (
                      <InstitutionCard
                        key={institution.id}
                        institution={institution}
                        isConnected={connectedIds.includes(institution.id)}
                        onConnect={() => handleConnect(institution.id)}
                      />
                    ))}
                  </div>

                  {filteredInstitutions.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-lg" style={{ color: colors.textMuted }}>
                        No institutions found matching &quot;{searchQuery}&quot;
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column - Connected summary */}
              <div className="space-y-6">
                <ConnectedAccountsSummary />

                {/* CTA */}
                <Link
                  href="/designs/design-11-autonomous/graph"
                  className="flex items-center justify-between w-full p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 group"
                  style={{
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`,
                    boxShadow: `0 4px 20px ${colors.accent}30`,
                  }}
                >
                  <div>
                    <p className="text-white text-lg font-semibold mb-1">
                      View Your Financial Map
                    </p>
                    <p className="text-white/80 text-sm">
                      See how your money flows
                    </p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                {/* Security note */}
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    backgroundColor: `${colors.success}08`,
                    border: `1px solid ${colors.success}20`,
                  }}
                >
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.success }} />
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: colors.success }}>
                        Your data is secure
                      </p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        We use bank-level 256-bit encryption and never store your credentials.
                        You can disconnect any account at any time.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
