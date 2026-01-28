"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Calculator } from "lucide-react";
import { InstitutionSearch } from "@/components/connect/InstitutionSearch";
import { InstitutionCard } from "@/components/connect/InstitutionCard";
import { ConnectionProgress } from "@/components/connect/ConnectionProgress";
import { SecurityBadges } from "@/components/connect/SecurityBadges";
import { ConnectedAccountCard } from "@/components/connect/ConnectedAccountCard";
import { formatCurrency } from "@/lib/shared/formatters";

// Mock institutions by category (in production, these would come from the API)
const mockInstitutions = {
  investments: [
    { id: "fidelity", name: "Fidelity", logo_url: null },
    { id: "vanguard", name: "Vanguard", logo_url: null },
    { id: "schwab", name: "Charles Schwab", logo_url: null },
    { id: "robinhood", name: "Robinhood", logo_url: null },
    { id: "etrade", name: "E*TRADE", logo_url: null },
    { id: "td-ameritrade", name: "TD Ameritrade", logo_url: null },
    { id: "merrill", name: "Merrill Edge", logo_url: null },
    { id: "interactive-brokers", name: "Interactive Brokers", logo_url: null },
  ],
  retirement: [
    { id: "401k-fidelity", name: "401(k) - Fidelity", logo_url: null },
    { id: "401k-vanguard", name: "401(k) - Vanguard", logo_url: null },
    { id: "ira-schwab", name: "IRA - Schwab", logo_url: null },
    { id: "roth-ira-fidelity", name: "Roth IRA - Fidelity", logo_url: null },
  ],
  banking: [
    { id: "chase", name: "Chase", logo_url: null },
    { id: "bofa", name: "Bank of America", logo_url: null },
    { id: "wells", name: "Wells Fargo", logo_url: null },
    { id: "citi", name: "Citi", logo_url: null },
  ],
  credit: [
    { id: "amex", name: "American Express", logo_url: null },
    { id: "chase-card", name: "Chase Credit Cards", logo_url: null },
    { id: "discover", name: "Discover", logo_url: null },
    { id: "capital-one", name: "Capital One", logo_url: null },
  ],
  liabilities: [
    { id: "mortgage", name: "Mortgage Lender", logo_url: null },
    { id: "student-loans", name: "Student Loan Servicer", logo_url: null },
    { id: "auto-loans", name: "Auto Loan", logo_url: null },
  ],
};

// Category metadata
const categoryMeta: Record<string, { name: string; description: string }> = {
  investments: { name: "Investments", description: "Brokerage Accounts" },
  retirement: { name: "Retirement", description: "401(k) & IRA" },
  banking: { name: "Banking", description: "Checking & Savings" },
  credit: { name: "Credit", description: "Credit Cards" },
  liabilities: { name: "Liabilities", description: "Loans & Mortgages" },
};

// Mock connected accounts
const mockConnectedAccounts = [
  { id: "acc-1", name: "Fidelity Brokerage", balance: 67000, account_type: "brokerage", is_tax_advantaged: false },
  { id: "acc-2", name: "401(k) - Fidelity", balance: 125000, account_type: "401k", is_tax_advantaged: true },
  { id: "acc-3", name: "Roth IRA", balance: 45000, account_type: "roth_ira", is_tax_advantaged: true },
];

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

export default function ConnectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>("investments");
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState(mockConnectedAccounts);

  // Calculate totals
  const totalConnected = accounts.length;
  const totalValue = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const taxAdvantagedValue = accounts
    .filter((acc) => acc.is_tax_advantaged)
    .reduce((sum, acc) => sum + acc.balance, 0);

  const handleConnect = async (institutionId: string) => {
    setConnectingId(institutionId);

    // In production, this would:
    // 1. Call strataClient.createLinkSession()
    // 2. Redirect user to the returned URL
    // For demo, we simulate a connection
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate adding a new account
    const institution = Object.values(mockInstitutions)
      .flat()
      .find((i) => i.id === institutionId);

    if (institution) {
      const newAccount = {
        id: `acc-${Date.now()}`,
        name: institution.name,
        balance: Math.floor(Math.random() * 50000) + 10000,
        account_type: selectedCategory === "retirement" ? "401k" : "brokerage",
        is_tax_advantaged: selectedCategory === "retirement",
      };
      setAccounts((prev) => [...prev, newAccount]);
    }

    setConnectedIds((prev) => [...prev, institutionId]);
    setConnectingId(null);
  };

  // Filter institutions based on search and category
  const filteredInstitutions = selectedCategory
    ? { [selectedCategory]: mockInstitutions[selectedCategory as keyof typeof mockInstitutions] }
    : mockInstitutions;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Background gradient */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-800/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-800 transition-all duration-300 group-hover:scale-105">
                <Calculator className="w-4 h-4 text-emerald-100" />
              </div>
              <span className="font-serif text-xl tracking-tight text-white">
                Clear<span className="text-emerald-400">Money</span>
              </span>
            </Link>

            <div className="flex items-center gap-1">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Connect", href: "/connect", active: true },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    item.active
                      ? "text-emerald-100 bg-emerald-900/60"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
            Connect Your{" "}
            <span className="italic text-emerald-400">Investment Accounts</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto mb-8 text-neutral-300">
            Get a complete view of your portfolio across all your accounts.
          </p>

          <SecurityBadges />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Account categories and search */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search and filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <InstitutionSearch
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </motion.div>

            {/* Progress indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ConnectionProgress connected={totalConnected} total={10} />
            </motion.div>

            {/* Institution grids by category */}
            <AnimatePresence mode="wait">
              {Object.entries(filteredInstitutions).map(([categoryId, categoryInstitutions]) => {
                const meta = categoryMeta[categoryId];
                if (!meta) return null;

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
                      <h2 className="font-serif text-xl text-emerald-100">
                        {meta.name}
                      </h2>
                      <span className="text-sm text-neutral-500">
                        - {meta.description}
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
              className="p-6 rounded-xl sticky top-24 bg-neutral-900 border border-neutral-800"
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-800">
                  <Check className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-emerald-100">
                    Connected Accounts
                  </h3>
                  <p className="text-xs text-neutral-500">
                    {totalConnected} accounts linked
                  </p>
                </div>
              </div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="space-y-3"
              >
                {accounts.map((account) => (
                  <ConnectedAccountCard key={account.id} account={account} />
                ))}
              </motion.div>

              {/* Summary */}
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      Total Investment Value
                    </span>
                    <span className="font-serif text-xl font-medium text-emerald-300">
                      {formatCurrency(totalValue)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">
                      Tax-Advantaged
                    </span>
                    <span className="font-medium text-emerald-400">
                      {formatCurrency(taxAdvantagedValue)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-lg font-medium transition-all duration-200 bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                >
                  View Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
