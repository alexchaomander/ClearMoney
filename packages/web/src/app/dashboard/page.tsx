"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  CheckCircle2,
  Compass,
  Plus,
  PenLine,
  Route,
  Sparkles,
  FlaskConical,
  Link2,
  RefreshCw,
  ShieldCheck,
  Coins,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { ConcentrationAlert } from "@/components/dashboard/ConcentrationAlert";
import dynamic from "next/dynamic";

const PortfolioHistoryChart = dynamic(
  () => import("@/components/dashboard/PortfolioHistoryChart").then(m => m.PortfolioHistoryChart),
  { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> }
);
import { CashDebtSection } from "@/components/dashboard/CashDebtSection";
import { TaxDocumentsCard } from "@/components/dashboard/TaxDocumentsCard";
import { AddAccountModal } from "@/components/dashboard/AddAccountModal";
import { DecisionTracePanel } from "@/components/dashboard/DecisionTracePanel";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ProductTour } from "@/components/shared";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import { AssumptionControl } from "@/components/dashboard/AssumptionControl";
import {
  usePortfolioSummary,
  useInvestmentAccounts,
  useHoldings,
  useAccounts,
  useConnections,
  useCashAccountMutations,
  useDebtAccountMutations,
  useEquityPortfolio,
  useEquityProjections,
  useEquityGrantMutations,
  useConsentStatus,
  useSyncAllConnections,
  useCryptoPortfolio,
  useCryptoWalletMutations,
  usePhysicalAssetsSummary,
  useRealEstateAssetMutations,
  useVehicleAssetMutations,
  useCollectibleAssetMutations,
  usePreciousMetalAssetMutations,
} from "@/lib/strata/hooks";
import { EquityCard } from "@/components/dashboard/EquityCard";
import { PhysicalAssetsCard } from "@/components/dashboard/PhysicalAssetsCard";
import { PhysicalAssetsDemoBanner } from "@/components/dashboard/PhysicalAssetsDemoBanner";
import { type PortfolioHistoryRange, type HoldingDetail, type PhysicalAssetsSummary, type ValuationRefreshResponse } from "@clearmoney/strata-sdk";
import { useToast } from "@/components/shared/toast";
import {
  getPreviewAccounts,
  getPreviewHoldings,
  getPreviewPortfolioHistory,
  getPreviewPortfolioSummary,
  getPreviewPhysicalAssets,
} from "./_shared/preview-data";
import { AnimatedAmount } from "@/components/shared/AnimatedAmount";

function mapHoldings(details: HoldingDetail[]) {
  return details.map((h) => ({
    id: h.id,
    ticker: h.security.ticker,
    name: h.security.name,
    security_type: h.security.security_type,
    quantity: h.quantity,
    market_value: h.market_value ?? 0,
    cost_basis: h.cost_basis,
    account_name: h.account_name,
    account_type: h.account_type,
  }));
}

export default function DashboardPage() {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [demoPhysicalAssets, setDemoPhysicalAssets] = useState<PhysicalAssetsSummary | null>(null);
  const { pushToast } = useToast();

  const previewPortfolioSummary = useMemo(() => getPreviewPortfolioSummary(), []);
  const previewAccounts = useMemo(() => getPreviewAccounts(), []);
  const previewHoldings = useMemo(() => getPreviewHoldings(), []);
  const previewHistory = useMemo<Record<PortfolioHistoryRange, ReturnType<typeof getPreviewPortfolioHistory>>>(() => ({
    "30d": getPreviewPortfolioHistory("30d"),
    "90d": getPreviewPortfolioHistory("90d"),
    "1y": getPreviewPortfolioHistory("1y"),
    all: getPreviewPortfolioHistory("all"),
  }), []);

  const cashMutations = useCashAccountMutations();
  const debtMutations = useDebtAccountMutations();
  const cryptoMutations = useCryptoWalletMutations();
  const syncAllConnections = useSyncAllConnections();
  const { hasConsent: hasPortfolioConsent } = useConsentStatus([
    "portfolio:read",
    "accounts:read",
    "connections:read",
  ]);
  const { hasConsent: hasSyncConsent } = useConsentStatus([
    "connections:write",
  ]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowAddDropdown(false);
      }
    }
    if (showAddDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAddDropdown]);

  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorDetails,
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasPortfolioConsent });

  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
    error: accountsErrorDetails,
    refetch: refetchAccounts,
  } = useInvestmentAccounts({ enabled: hasPortfolioConsent });

  const {
    data: holdingsData,
    isLoading: holdingsLoading,
    isError: holdingsError,
    error: holdingsErrorDetails,
    refetch: refetchHoldings,
  } = useHoldings({ enabled: hasPortfolioConsent });

  const {
    data: allAccountsData,
    isLoading: allAccountsLoading,
    isError: allAccountsError,
    error: allAccountsErrorDetails,
    refetch: refetchAllAccounts,
  } = useAccounts({ enabled: hasPortfolioConsent });

  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasPortfolioConsent });

  const {
    data: equityPortfolio,
    isLoading: equityLoading,
  } = useEquityPortfolio({ enabled: hasPortfolioConsent });

  const {
    data: equityProjections,
    isLoading: projectionsLoading,
  } = useEquityProjections({ enabled: hasPortfolioConsent });

  const {
    data: cryptoPortfolio,
    isLoading: cryptoLoading,
    refetch: refetchCryptoPortfolio,
  } = useCryptoPortfolio({ enabled: hasPortfolioConsent });

  const {
    data: physicalAssets,
    isLoading: physicalAssetsLoading,
    refetch: refetchPhysicalAssets,
  } = usePhysicalAssetsSummary({ enabled: hasPortfolioConsent });

  const effectivePhysicalAssets = demoPhysicalAssets ?? physicalAssets;

  const equityMutations = useEquityGrantMutations();
  const realEstateMutations = useRealEstateAssetMutations();
  const vehicleMutations = useVehicleAssetMutations();
  const collectibleMutations = useCollectibleAssetMutations();
  const metalMutations = usePreciousMetalAssetMutations();

  const startPhysicalDemo = () => {
    setDemoPhysicalAssets(getPreviewPhysicalAssets());
  };

  // Clear demo data when real assets exist
  useEffect(() => {
    if (physicalAssets && physicalAssets.total_value > 0 && demoPhysicalAssets) {
      setDemoPhysicalAssets(null);
    }
  }, [physicalAssets, demoPhysicalAssets]);

  const handleRefreshValuation = async (fn: () => Promise<ValuationRefreshResponse>) => {
    try {
      const result = await fn();
      if (result.status === "updated") {
        pushToast({ title: "Valuation Updated", variant: "success" });
      } else if (result.status === "unchanged") {
        pushToast({ title: "No Change", message: "Value is unchanged", variant: "default" });
      } else if (result.status === "failed") {
        pushToast({ title: "Valuation Failed", message: result.message ?? undefined, variant: "error" });
      }
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      const message = (err as { message?: string })?.message;
      if (status === 429) {
        pushToast({ title: "Too Soon", message: message ?? "Please wait before refreshing again", variant: "error" });
      } else {
        pushToast({ title: "Refresh Failed", message: message ?? "An error occurred", variant: "error" });
      }
    }
  };

  const handleDeleteAsset = async (fn: () => Promise<void>) => {
    try {
      await fn();
      pushToast({ title: "Asset Removed", variant: "success" });
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message;
      pushToast({ title: "Delete Failed", message: message ?? "An error occurred", variant: "error" });
    }
  };

  const isLoading =
    portfolioLoading ||
    accountsLoading ||
    holdingsLoading ||
    allAccountsLoading ||
    connectionsLoading ||
    equityLoading ||
    projectionsLoading ||
    cryptoLoading ||
    physicalAssetsLoading;
  const isError = portfolioError || accountsError || holdingsError || allAccountsError || connectionsError;
  const errorDetails =
    portfolioErrorDetails ||
    accountsErrorDetails ||
    holdingsErrorDetails ||
    allAccountsErrorDetails ||
    connectionsErrorDetails;

  async function handleRefresh() {
    if (hasSyncConsent) {
      await syncAllConnections.mutateAsync();
    }
    refetchPortfolio();
    refetchAccounts();
    refetchHoldings();
    refetchAllAccounts();
    refetchCryptoPortfolio();
    refetchPhysicalAssets();
    if (connections) {
      refetchConnections();
    }
  }

  const usingDemoData = !portfolio || !accounts || !holdingsData || !allAccountsData;
  const effectivePortfolio = portfolio ?? previewPortfolioSummary;
  const effectiveInvestmentAccounts = accounts ?? previewAccounts.investment_accounts;
  const effectiveAllAccounts = allAccountsData ?? previewAccounts;
  const effectiveHoldingsRows = useMemo(() => mapHoldings(holdingsData ?? previewHoldings), [holdingsData, previewHoldings]);
  const hasLivePortfolio = Boolean(portfolio);
  const hasLiveAccounts = Boolean(accounts || allAccountsData);
  const hasLiveHoldings = Boolean(holdingsData);
  const accountCount =
    effectiveAllAccounts.investment_accounts.length +
    effectiveAllAccounts.cash_accounts.length +
    effectiveAllAccounts.debt_accounts.length;
  const holdingsCount = effectiveHoldingsRows.length;
  const hasAccounts = accountCount > 0;

  const intelligenceCards = [
    {
      href: "/dashboard/founder-operating-room",
      icon: Compass,
      label: "Founder Operating Room",
      description: "Monitor cash runway, founder spending discipline, and commingling risk.",
    },
    {
      href: "/dashboard/scenario-lab",
      icon: FlaskConical,
      label: "Scenario Lab",
      description: "Model market, savings, and debt assumptions across 12-month futures.",
    },
    {
      href: "/dashboard/progress",
      icon: Route,
      label: "Progress",
      description: "Track runway, savings momentum, and debt pressure over time.",
    },
    {
      href: "/dashboard/command-center",
      icon: CheckCircle2,
      label: "Command Center",
      description: "One place to reconcile readiness signals and prioritize action.",
    },
  ];

  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncDates = connections
      .map((c) => c.last_synced_at)
      .filter((d): d is string => Boolean(d))
      .map((d) => new Date(d).getTime());
    if (!syncDates.length) return null;
    return new Date(Math.max(...syncDates));
  }, [connections]);

  const sourceItems = useMemo<DataSourceStatusItem[]>(() => [
    {
      id: "portfolio",
      title: "Portfolio summary",
      value: hasLivePortfolio ? "Live" : "Demo",
      detail: hasLivePortfolio
        ? "Portfolio summary is connected from Strata."
        : "Synthetic summary is active until connected.",
      tone: hasLivePortfolio ? "live" : "warning",
      href: "/dashboard/coverage",
      actionLabel: "Review coverage",
      lastSyncedAt: lastSyncedAt?.toISOString(),
    },
    {
      id: "accounts",
      title: "Accounts",
      value: `${accountCount} source${accountCount === 1 ? "" : "s"}`,
      detail: hasLiveAccounts
        ? `${effectiveAllAccounts.investment_accounts.length} investment, ${effectiveAllAccounts.cash_accounts.length} cash, ${effectiveAllAccounts.debt_accounts.length} debt`
        : "Demo account set is active while you connect live links.",
      tone: hasLiveAccounts ? "live" : "warning",
      href: "/connect",
      actionLabel: "Link accounts",
    },
    {
      id: "holdings",
      title: "Holdings",
      value: `${holdingsCount} position${holdingsCount === 1 ? "" : "s"}`,
      detail: hasLiveHoldings
        ? "Holdings stream is connected."
        : "Holdings list uses realistic preview fixtures.",
      tone: hasLiveHoldings ? "live" : "warning",
    },
    {
      id: "connections",
      title: "Connection sync",
      value: connections?.length ? `${connections.length} active` : "No active links",
      detail: connections?.length
        ? "Connector metadata is connected."
        : "No live connector metadata yet.",
      tone: connections?.length ? "live" : "warning",
      href: "/connect",
      actionLabel: "Manage links",
    },
  ], [
    accountCount,
    connections,
    effectiveAllAccounts.cash_accounts,
    effectiveAllAccounts.debt_accounts,
    effectiveAllAccounts.investment_accounts,
    hasLiveAccounts,
    hasLiveHoldings,
    hasLivePortfolio,
    holdingsCount,
    lastSyncedAt,
  ]);

  function renderContent() {
    const totalCryptoValue = Number(cryptoPortfolio?.total_value_usd ?? 0);
    const totalPhysicalValue = Number(effectivePhysicalAssets?.total_value ?? 0);
    const backendPhysicalValue = effectivePortfolio.total_physical_asset_value ?? 0;
    // When demo is active, replace backend physical value with demo value to avoid double-counting
    const adjustedNetWorth = effectivePortfolio.net_worth + totalCryptoValue + (demoPhysicalAssets ? totalPhysicalValue - backendPhysicalValue : 0);
    const totalAssetsValue =
      effectivePortfolio.total_investment_value +
      effectivePortfolio.total_cash_value +
      (effectivePortfolio.total_equity_vested_value ?? 0) +
      totalCryptoValue +
      (demoPhysicalAssets ? totalPhysicalValue : backendPhysicalValue);

    return (
      <>
        <PhysicalAssetsDemoBanner onStartDemo={startPhysicalDemo} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="font-serif text-4xl text-slate-900 dark:text-white mb-2">
              Portfolio Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg">
              Your complete economic digital twin
            </p>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowAddDropdown((p) => !p)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-5 h-5" />
              Add Account
            </button>
            <AnimatePresence>
              {showAddDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-20 p-1"
                >
                  <Link
                    href="/connect"
                    onClick={() => setShowAddDropdown(false)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Link2 className="w-4 h-4 text-emerald-500" />
                    Link Brokerage
                  </Link>
                  <button
                    onClick={() => { setShowAddDropdown(false); setShowAddModal(true); }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <PenLine className="w-4 h-4 text-emerald-500" />
                    Add Manually
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
        
        <div className="mb-10">
          <AssumptionControl />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-10">
            <div id="net-worth-card">
              <NetWorthCard
                totalAssets={totalAssetsValue}
                totalLiabilities={effectivePortfolio.total_debt_value}
                netWorth={adjustedNetWorth}
                taxAdvantagedValue={effectivePortfolio.tax_advantaged_value}
                // Simplification: all crypto treated as taxable for now
                taxableValue={effectivePortfolio.taxable_value + totalCryptoValue}
                vestedEquityValue={effectivePortfolio.total_equity_vested_value}
                unvestedEquityValue={effectivePortfolio.total_equity_unvested_value}
              />
            </div>

            {!hasPortfolioConsent && (
              <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Authorize Data Context</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">To generate decision traces and rebalancing intents, Strata needs read-access to your linked accounts.</p>
                <ConsentGate
                  scopes={["portfolio:read", "accounts:read", "connections:read"]}
                  purpose="Load your accounts, balances, and holdings for the dashboard."
                >
                  <div className="hidden" />
                </ConsentGate>
              </div>
            )}

            <PortfolioHistoryChart
              previewHistory={usingDemoData ? previewHistory : undefined}
            />

            <ConsentGate
              scopes={["decision_traces:read"]}
              purpose="Display decision traces in your dashboard."
            >
              <DecisionTracePanel />
            </ConsentGate>

            <ConcentrationAlert alerts={effectivePortfolio.concentration_alerts} />

            <HoldingsTable
              holdings={effectiveHoldingsRows}
              totalValue={effectivePortfolio.total_investment_value}
            />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <AllocationChart
              allocations={effectivePortfolio.allocation_by_asset_type}
              title="Asset Allocation"
            />

            <AllocationChart
              allocations={effectivePortfolio.allocation_by_account_type}
              title="By Account Type"
            />

            {cryptoLoading && (
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm animate-pulse">
                <div className="flex items-center justify-between mb-6">
                  <div className="space-y-2">
                    <div className="h-5 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-40 rounded bg-slate-100 dark:bg-slate-800/50" />
                  </div>
                  <div className="space-y-2 flex flex-col items-end">
                    <div className="h-5 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-16 rounded bg-slate-100 dark:bg-slate-800/50" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-2">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div className="space-y-1">
                          <div className="h-3 w-12 rounded bg-slate-200 dark:bg-slate-800" />
                          <div className="h-2 w-16 rounded bg-slate-100 dark:bg-slate-800/50" />
                        </div>
                      </div>
                      <div className="space-y-1 flex flex-col items-end">
                        <div className="h-3 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-2 w-12 rounded bg-slate-100 dark:bg-slate-800/50" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!cryptoLoading && cryptoPortfolio && cryptoPortfolio.wallets.length > 0 && (
              <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
                  <Coins className="w-24 h-24" />
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <h3 className="font-serif text-xl text-slate-900 dark:text-slate-100">Crypto Assets</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Multi-Chain Web3 Surface</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      <AnimatedAmount value={Number(cryptoPortfolio.total_value_usd)} />
                    </p>
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{cryptoPortfolio.assets.length} Assets</p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  {cryptoPortfolio.assets.slice(0, 4).map((asset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {asset.logo_url ? (
                          <img src={asset.logo_url} alt={asset.name} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">{asset.symbol[0]}</div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{asset.symbol}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{asset.chain}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                          <AnimatedAmount value={Number(asset.balance_usd)} />
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">{Number(asset.balance).toFixed(4)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {cryptoPortfolio.defi_positions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">DeFi Positions</p>
                      {cryptoPortfolio.defi_positions.map((pos) => (
                        <div key={pos.protocol_name} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <div className="flex items-center gap-2">
                            {pos.protocol_logo && <img src={pos.protocol_logo} alt="" className="w-4 h-4 rounded-sm" />}
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{pos.protocol_name}</span>
                          </div>
                          <p className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                            <AnimatedAmount value={Number(pos.value_usd)} />
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => cryptoMutations.removeAll.mutate()}
                    className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    Disconnect Wallets
                  </button>
                </div>
              </div>
            )}

            {effectivePhysicalAssets && (
              <PhysicalAssetsCard
                summary={effectivePhysicalAssets}
                onRefreshRealEstate={(id) => handleRefreshValuation(() => realEstateMutations.refresh.mutateAsync(id))}
                onRefreshVehicle={(id) => handleRefreshValuation(() => vehicleMutations.refresh.mutateAsync(id))}
                onRefreshCollectible={(id) => handleRefreshValuation(() => collectibleMutations.refresh.mutateAsync(id))}
                onRefreshMetal={(id) => handleRefreshValuation(() => metalMutations.refresh.mutateAsync(id))}
                onDeleteRealEstate={(id) => handleDeleteAsset(() => realEstateMutations.remove.mutateAsync(id))}
                onDeleteVehicle={(id) => handleDeleteAsset(() => vehicleMutations.remove.mutateAsync(id))}
                onDeleteCollectible={(id) => handleDeleteAsset(() => collectibleMutations.remove.mutateAsync(id))}
                onDeleteMetal={(id) => handleDeleteAsset(() => metalMutations.remove.mutateAsync(id))}
                onAddAsset={() => setShowAddModal(true)}
              />
            )}

            {equityPortfolio && (
              <EquityCard
                portfolio={equityPortfolio}
                projections={equityProjections}
                onDeleteGrant={(symbol) => {
                  // Find the grant ID by symbol (simplified for demo)
                  const grant = equityPortfolio.grant_valuations.find(v => v.symbol === symbol);
                  if (grant) {
                    // This is a bit hacky, normally we'd pass IDs but valuations only have symbols
                    // In a real app, EquityCard would handle this with full objects
                  }
                }}
              />
            )}

            <CashDebtSection
              cashAccounts={effectiveAllAccounts.cash_accounts}
              debtAccounts={effectiveAllAccounts.debt_accounts}
              onDeleteCashAccount={(id) => cashMutations.remove.mutate(id)}
              onDeleteDebtAccount={(id) => debtMutations.remove.mutate(id)}
            />

            <TaxDocumentsCard />

            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl text-slate-800 dark:text-slate-100">
                  Linked Accounts
                </h3>
                <Link
                  href="/connect"
                  className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  + Add
                </Link>
              </div>
              <AccountsList
                accounts={effectiveInvestmentAccounts.map((a) => ({
                  id: a.id,
                  name: a.name,
                  balance: a.balance,
                  account_type: a.account_type,
                  is_tax_advantaged: a.is_tax_advantaged,
                  last_synced_at: a.updated_at,
                  status: "active" as const,
                }))}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 transition-colors duration-500">
      <div
        className="fixed inset-0 opacity-0 dark:opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader
        onRefresh={handleRefresh}
        isRefreshing={isLoading || syncAllConnections.isPending}
        showRefresh={!!hasAccounts}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {isLoading || isError ? (
          <>
            <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
            {isLoading ? <DashboardLoadingSkeleton /> : (
              <ApiErrorState
                message="We couldn't load your portfolio data. Please check that the API is running and try again."
                error={errorDetails}
                onRetry={handleRefresh}
              />
            )}
          </>
        ) : (
          renderContent()
        )}

        {!isLoading && !isError && hasAccounts && (
          <section className="mt-8" id="command-center-trigger">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Intelligence Hub</p>
                <h2 className="font-serif text-2xl text-slate-900 dark:text-white mt-2">
                  Founder-first execution layers built on your data surface
                </h2>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Decision-ready context
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              {intelligenceCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-emerald-700 transition-colors"
                >
                  <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 p-2 text-emerald-300">
                    <card.icon className="w-4 h-4" />
                  </div>
                  <h3 className="mt-3 text-sm text-slate-900 dark:text-white font-medium">{card.label}</h3>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{card.description}</p>
                </Link>
              ))}
            </div>

            <Link
              href="/dashboard/coverage"
              className="inline-flex items-center gap-2 mt-4 text-sm text-emerald-300 hover:text-emerald-200"
            >
              <BarChart3 className="w-4 h-4" />
              Open data coverage map
            </Link>
          </section>
        )}
      </main>

      <AddAccountModal open={showAddModal} onOpenChange={setShowAddModal} />
      <ProductTour />
    </div>
  );
}
