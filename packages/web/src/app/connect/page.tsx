"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { InstitutionCard } from "@/components/connect/InstitutionCard";
import { ConnectionProgress } from "@/components/connect/ConnectionProgress";
import { SecurityBadges } from "@/components/connect/SecurityBadges";
import { ConnectedAccountCard } from "@/components/connect/ConnectedAccountCard";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { formatCurrency } from "@/lib/shared/formatters";
import { staggerContainer } from "@/lib/shared/animations";
import { useStrataClient } from "@/lib/strata/client";
import {
  usePopularInstitutions,
  useSearchInstitutions,
  useAccounts,
  useConsentStatus,
} from "@/lib/strata/hooks";
import { ConsentGate } from "@/components/shared/ConsentGate";

export default function ConnectPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const router = useRouter();

  const client = useStrataClient();
  const { hasConsent: hasConnectionConsent } = useConsentStatus([
    "connections:read",
    "connections:write",
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const isOnboardingComplete = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("clearmoney_onboarding_complete") === "true";
  }, []);

  useEffect(() => {
    if (!isOnboardingComplete) {
      router.replace("/onboarding");
    }
  }, [isOnboardingComplete, router]);

  const isSearching = debouncedQuery.length > 0;

  const {
    data: popularInstitutions,
    isLoading: popularLoading,
    isError: popularError,
    refetch: refetchPopular,
  } = usePopularInstitutions({ enabled: hasConnectionConsent });

  const {
    data: searchResults,
    isLoading: searchLoading,
  } = useSearchInstitutions(isSearching ? debouncedQuery : undefined, { enabled: hasConnectionConsent });

  const {
    data: allAccounts,
    isLoading: accountsLoading,
  } = useAccounts({ enabled: hasConnectionConsent });

  const connectedAccounts = allAccounts?.investment_accounts ?? [];
  const totalConnected = connectedAccounts.length;
  const totalValue = connectedAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const taxAdvantagedValue = connectedAccounts
    .filter((acc) => acc.is_tax_advantaged)
    .reduce((sum, acc) => sum + acc.balance, 0);

  const institutions = isSearching ? (searchResults ?? []) : (popularInstitutions ?? []);
  const isLoadingInstitutions = isSearching ? searchLoading : popularLoading;

  const handleConnect = async (institutionId: string) => {
    setConnectingId(institutionId);
    try {
      const { redirect_url } = await client.createLinkSession({
        institution_id: institutionId,
      });
      window.location.assign(redirect_url);
    } catch {
      setConnectingId(null);
    }
  };

  if (!isOnboardingComplete) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400">
        Redirecting to onboarding...
      </div>
    );
  }

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
      <DashboardHeader />

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

        <ConsentGate
          scopes={["connections:read", "connections:write"]}
          purpose="Search and connect your financial institutions."
        >
          <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column - Institutions search + list */}
          <div className="lg:col-span-2 space-y-8">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for your bank or brokerage..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-base outline-none transition-all duration-300 bg-neutral-900 border border-neutral-800 text-neutral-100 focus:border-emerald-500 placeholder:text-neutral-500"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
            </motion.div>

            {/* Progress indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ConnectionProgress connected={totalConnected} total={10} />
            </motion.div>

            {/* Institutions grid */}
            {popularError && !isSearching ? (
              <ApiErrorState
                message="Could not load institutions. Please check that the API is running."
                onRetry={refetchPopular}
              />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSearching ? "search" : "popular"}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl text-emerald-100">
                      {isSearching
                        ? `Results for "${debouncedQuery}"`
                        : "Popular Institutions"}
                    </h2>
                    {isLoadingInstitutions && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent"
                      />
                    )}
                  </div>

                  {institutions.length === 0 && !isLoadingInstitutions ? (
                    <p className="text-neutral-500 py-8 text-center">
                      {isSearching
                        ? "No institutions found. Try a different search."
                        : "No institutions available."}
                    </p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {institutions.map((institution, index) => (
                        <motion.div
                          key={institution.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.2 + index * 0.08,
                            ease: "easeOut",
                          }}
                        >
                          <InstitutionCard
                            institution={institution}
                            isConnected={false}
                            isConnecting={connectingId === institution.id}
                            onConnect={() => handleConnect(institution.id)}
                          />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            )}
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

              {accountsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-neutral-800 animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {connectedAccounts.map((account) => (
                    <ConnectedAccountCard
                      key={account.id}
                      account={{
                        id: account.id,
                        name: account.name,
                        balance: account.balance,
                        account_type: account.account_type,
                        is_tax_advantaged: account.is_tax_advantaged,
                      }}
                    />
                  ))}
                </motion.div>
              )}

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
        </ConsentGate>
      </main>
    </div>
  );
}
