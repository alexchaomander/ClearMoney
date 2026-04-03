"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Plus,
  PenLine,
  Link2,
  Compass,
  FlaskConical,
  Route,
  CheckCircle2,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Coins,
  RefreshCw,
  TrendingUp,
  User,
  Shield,
  Clock,
  Briefcase,
  Gavel
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";

import {
  usePortfolioSummary,
  useAccounts,
  useHoldings,
  useAllAccounts,
  useConnections,
  useSyncAllConnections,
  usePhysicalAssetsSummary,
  useRealEstateAssetMutations,
  useVehicleAssetMutations,
  useCollectibleAssetMutations,
  usePreciousMetalAssetMutations,
  useAlternativeAssetMutations,
  useEquityPortfolio,
  useEquityProjections,
  useEquityGrantMutations,
  useCryptoPortfolio,
  useCryptoWalletMutations,
  useCashAccountMutations,
  useDebtAccountMutations,
  useConsentStatus,
  useVulnerabilityReport,
  useFinancialMemory,
  useDecisionTraces,
} from "@/lib/strata/hooks";
import type { 
  PhysicalAssetsSummary, 
  ValuationRefreshResponse,
  Connection,
  HoldingDetail,
  EquityValuation,
  DeFiPosition,
  CryptoAsset,
  InvestmentAccount,
  PortfolioHistoryPoint,
  PortfolioHistoryRange,
} from "@clearmoney/strata-sdk";

import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { PortfolioHistoryChart } from "@/components/dashboard/PortfolioHistoryChart";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { AllocationChart } from "@/components/dashboard/AllocationChart";
import { PhysicalAssetsCard } from "@/components/dashboard/PhysicalAssetsCard";
import { EquityCard } from "@/components/dashboard/EquityCard";
import { CashDebtSection } from "@/components/dashboard/CashDebtSection";
import { TaxDocumentsCard } from "@/components/dashboard/TaxDocumentsCard";
import { TaxShieldCard } from "@/components/dashboard/TaxShieldCard";
import { AccountsList } from "@/components/dashboard/AccountsList";
import { DecisionTracePanel } from "@/components/dashboard/DecisionTracePanel";
import { ConcentrationAlert } from "@/components/dashboard/ConcentrationAlert";
import { AdvisorBriefing } from "@/components/dashboard/AdvisorBriefing";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import { PhysicalAssetsDemoBanner } from "@/components/dashboard/PhysicalAssetsDemoBanner";
import { AssumptionControl } from "@/components/dashboard/AssumptionControl";
import { AddAccountModal } from "@/components/dashboard/AddAccountModal";
import { FounderManualContextDialog } from "@/components/dashboard/FounderManualContextDialog";
import { ProductTour } from "@/components/shared/ProductTour";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { AnimatedAmount } from "@/components/shared/AnimatedAmount";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { useToast } from "@/components/shared/toast";
import { captureAnalyticsEvent, readFounderFunnelSource } from "@/lib/analytics";
import {
  getFounderPriorityState,
  shouldTrackFounderDashboardUpgrade,
  type FounderManualEntryPoint,
  type FounderPriorityCta,
} from "@/lib/founder-activation";

import {
  getPreviewPortfolioSummary,
  getPreviewAccounts,
  getPreviewHoldings,
  previewHistory,
  mapHoldings,
} from "./_shared/preview-data";
import { getPreviewPhysicalAssets } from "./_shared/preview-data";
import type { FinancialMemory } from "@clearmoney/strata-sdk";

function isFounderBaselineComplete(memory?: FinancialMemory): boolean {
  return Boolean(
    memory?.entity_type != null &&
      (memory?.annual_income != null || memory?.monthly_income != null) &&
      memory?.average_monthly_expenses != null
  );
}

function ProfileProgressCard({ memory }: { memory?: FinancialMemory }) {
  const completeness = useMemo(() => {
    if (!memory) return 0;
    const fields = [
      'age', 'risk_tolerance', 'retirement_age',
      'employer_name', 'employer_industry', 'life_insurance_benefit',
      'disability_insurance_benefit', 'umbrella_policy_limit',
      'has_will', 'has_trust', 'has_poa', 'entity_type'
    ];
    const completedBaseFields = fields.filter((f) => (memory as any)[f] != null).length;
    const completedIncomeField = memory.annual_income != null || memory.monthly_income != null ? 1 : 0;
    const completedExpenseField = memory.average_monthly_expenses != null ? 1 : 0;
    const totalFields = fields.length + 2;
    return Math.round(((completedBaseFields + completedIncomeField + completedExpenseField) / totalFields) * 100);
  }, [memory]);

  if (completeness === 100) return null;

  const founderBaselineComplete = isFounderBaselineComplete(memory);
  const incompleteFields = [
    {
      id: 'founder-baseline',
      label: 'Founder baseline',
      done: founderBaselineComplete,
      icon: Briefcase,
    },
    { id: 'profile-employment', label: 'Employment', done: memory?.employer_name != null, icon: Briefcase },
    { id: 'profile-insurance', label: 'Insurance', done: memory?.life_insurance_benefit != null, icon: Shield },
    { id: 'profile-estate', label: 'Estate & Legal', done: memory?.has_will != null, icon: Gavel },
  ].filter(f => !f.done);

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] pointer-events-none group-hover:rotate-12 transition-transform duration-700">
        <Sparkles className="w-16 h-16" />
      </div>
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <h3 className="font-serif text-xl text-slate-800 dark:text-slate-100">Context Clarity</h3>
        <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{completeness}%</span>
      </div>

      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mb-6 overflow-hidden">
        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${completeness}%` }} />
      </div>

      <div className="space-y-1 relative z-10">
        {incompleteFields.map(f => (
          <Link key={f.id} href={`/settings?tab=profile#${f.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 group/item transition-colors">
            <div className="flex items-center gap-2">
              <f.icon className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-emerald-500 transition-colors" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">{f.label}</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 opacity-0 group-hover/item:opacity-100 transition-opacity">Setup →</span>
          </Link>
        ))}
        {incompleteFields.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-2">All context layers active</p>
        )}
      </div>
    </div>
  );
}

function FounderPriorityCard({
  usingDemoData,
  hasAccounts,
  hasFounderBaseline,
  hasDecisionTraces,
  connectionStatusState,
  onOpenManual,
}: {
  usingDemoData: boolean;
  hasAccounts: boolean;
  hasFounderBaseline: boolean;
  hasDecisionTraces: boolean;
  connectionStatusState: { tone: "live" | "partial" | "warning" | "missing" | "error"; value: string; detail: string };
  onOpenManual: () => void;
}) {
  const state = getFounderPriorityState({
    usingDemoData,
    hasAccounts,
    hasFounderBaseline,
    hasDecisionTraces,
    connectionTone: connectionStatusState.tone,
  });
  const source = readFounderFunnelSource() ?? "unknown";

  const trackUpgradeClick = (cta: FounderPriorityCta) => {
    if (!shouldTrackFounderDashboardUpgrade(state.stage, cta)) {
      return;
    }

    captureAnalyticsEvent("founder_dashboard_upgrade_clicked", {
      source,
      stage: state.stage,
      cta,
      using_demo_data: usingDemoData,
      has_accounts: hasAccounts,
      connection_tone: connectionStatusState.tone,
    });
  };

  return (
    <div
      className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 via-white to-white p-6 shadow-sm dark:from-emerald-500/10 dark:via-slate-900 dark:to-slate-900 dark:border-emerald-900/50"
      data-testid="founder-priority-card"
    >
      <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-400">
        {state.eyebrow}
      </p>
      <h2 className="mt-3 font-serif text-2xl text-slate-900 dark:text-white">
        {state.title}
      </h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
        {state.summary}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={state.primaryHref}
          onClick={() => trackUpgradeClick("primary")}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-600 dark:bg-white dark:text-slate-950 dark:hover:bg-emerald-400"
        >
          {state.primaryLabel}
        </Link>
        <Link
          href={state.secondaryHref}
          onClick={() => trackUpgradeClick("secondary")}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
        >
          {state.secondaryLabel}
        </Link>
        {state.allowManualFallback ? (
          <button
            type="button"
            onClick={() => {
              trackUpgradeClick("manual_fallback");
              onOpenManual();
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
          >
            Add founder context now
          </button>
        ) : null}
      </div>

      {state.whyNow?.length ? (
        <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/30">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {state.whyNowTitle}
          </p>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {state.whyNow.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
        </div>
      ) : null}

      {state.penaltyTitle || state.unlockTitle ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {state.penalties?.length ? (
            <div className="rounded-2xl border border-rose-200/70 bg-rose-50/60 p-4 dark:border-rose-950/50 dark:bg-rose-950/20">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-700 dark:text-rose-300">
                {state.penaltyTitle}
              </p>
              <div className="mt-3 space-y-2 text-sm text-rose-900 dark:text-rose-100">
                {state.penalties.map((penalty) => (
                  <p key={penalty}>{penalty}</p>
                ))}
              </div>
            </div>
          ) : null}
          {state.unlocks?.length ? (
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 dark:border-emerald-950/50 dark:bg-emerald-950/20">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
                {state.unlockTitle}
              </p>
              <div className="mt-3 space-y-2 text-sm text-emerald-950 dark:text-emerald-100">
                {state.unlocks.map((unlock) => (
                  <p key={unlock}>{unlock}</p>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function DashboardPage() {
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFounderManualDialog, setShowFounderManualDialog] = useState(false);
  const [manualEntryPoint, setManualEntryPoint] =
    useState<FounderManualEntryPoint>("dashboard_menu");
  const [demoPhysicalAssets, setDemoPhysicalAssets] = useState<PhysicalAssetsSummary | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { pushToast } = useToast();

  const { hasConsent: hasPortfolioConsent } = useConsentStatus(["portfolio:read"]);
  const { hasConsent: hasSyncConsent } = useConsentStatus(["connections:sync"]);

  // Fetch all dashboard data
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
  } = useAccounts({ enabled: hasPortfolioConsent });

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
  } = useAllAccounts({ enabled: hasPortfolioConsent });

  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasPortfolioConsent });

  const syncAllConnections = useSyncAllConnections();

  const {
    data: equityPortfolio,
    isLoading: equityLoading,
    refetch: refetchEquity,
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

  const cryptoMutations = useCryptoWalletMutations();
  const cashMutations = useCashAccountMutations();
  const debtMutations = useDebtAccountMutations();

  const {
    data: physicalAssets,
    isLoading: physicalAssetsLoading,
    refetch: refetchPhysicalAssets,
  } = usePhysicalAssetsSummary({ enabled: hasPortfolioConsent });

  const effectivePhysicalAssets = demoPhysicalAssets ?? physicalAssets;

  const realEstateMutations = useRealEstateAssetMutations();
  const vehicleMutations = useVehicleAssetMutations();
  const collectibleMutations = useCollectibleAssetMutations();
  const metalMutations = usePreciousMetalAssetMutations();
  const alternativeMutations = useAlternativeAssetMutations();

  const startPhysicalDemo = () => {
    setDemoPhysicalAssets(getPreviewPhysicalAssets());
  };

  // Clear demo data when real assets exist
  useEffect(() => {
    if (physicalAssets && (physicalAssets.total_value > 0 || physicalAssets.real_estate.length > 0) && demoPhysicalAssets) {
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

  const handleDeleteAsset = async (fn: () => Promise<void | unknown>) => {
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
    refetchEquity();
    if (connections) {
      refetchConnections();
    }
  }

  const usingDemoData = !portfolio || !accounts || !holdingsData || !allAccountsData;
  const effectivePortfolio = portfolio ?? getPreviewPortfolioSummary();
  const effectiveInvestmentAccounts = useMemo(() => {
    if (!accounts && !allAccountsData) return getPreviewAccounts().investment_accounts;
    if (Array.isArray(accounts)) return accounts;
    return allAccountsData?.investment_accounts ?? [];
  }, [accounts, allAccountsData]);
  
  const { data: memory, isFetched: memoryFetched } = useFinancialMemory();
  const { hasConsent: hasDecisionTraceConsent } = useConsentStatus(["decision_traces:read"]);
  const { data: traces, isFetched: tracesFetched } = useDecisionTraces(undefined, { enabled: hasDecisionTraceConsent });

  const effectiveAllAccounts = allAccountsData ?? getPreviewAccounts();
  const effectiveHoldingsRows = useMemo(() => mapHoldings(holdingsData ?? getPreviewHoldings()), [holdingsData]);
  const hasLivePortfolio = Boolean(portfolio);
  const hasLiveAccounts = Boolean(accounts || allAccountsData);
  const hasLiveHoldings = Boolean(holdingsData);
  const accountCount =
    effectiveAllAccounts.investment_accounts.length +
    effectiveAllAccounts.cash_accounts.length +
    effectiveAllAccounts.debt_accounts.length;
  const holdingsCount = effectiveHoldingsRows.length;
  const hasAccounts = accountCount > 0;
  const hasFounderBaseline = isFounderBaselineComplete(memory);
  const hasDecisionTraces = (traces?.length ?? 0) > 0;

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
    {
      href: "/profile",
      icon: User,
      label: "Profile Setup",
      description: "Complete your advisor context to unlock higher-order skills.",
    },
  ];

  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncDates = connections
      .map((c: Connection) => c.last_synced_at)
      .filter((d: string | null): d is string => Boolean(d))
      .map((d: string) => new Date(d).getTime());
    if (!syncDates.length) return null;
    return new Date(Math.max(...syncDates));
  }, [connections]);

  const connectionStatusState = useMemo(() => {
    if (!connections?.length) return { tone: "warning" as const, value: "No active links", detail: "No live connector metadata yet." };
    
    if (connections.some(c => c.continuity_status === "revoked")) {
      return { tone: "error" as const, value: "Action Required", detail: "A source was revoked. Runway and tax guidance may now miss recent activity." };
    }
    if (connections.some(c => c.continuity_status === "degraded")) {
      return { tone: "partial" as const, value: "Degraded", detail: "A source is partially failing. Use caution before trusting precise recommendations." };
    }
    if (connections.some(c => c.continuity_status === "stale")) {
      return { tone: "warning" as const, value: "Stale Data", detail: "Some balances are aging. Freshness may be too weak for founder-critical decisions." };
    }
    
    return { tone: "live" as const, value: `${connections.length} active`, detail: "Your live sources are fresh enough to drive founder-level guidance." };
  }, [connections]);
  const founderPriorityState = useMemo(
    () =>
      getFounderPriorityState({
        usingDemoData,
        hasAccounts,
        hasFounderBaseline,
        hasDecisionTraces,
        connectionTone: connectionStatusState.tone,
      }),
    [
      connectionStatusState.tone,
      hasAccounts,
      hasDecisionTraces,
      hasFounderBaseline,
      usingDemoData,
    ]
  );

  const sourceItems = useMemo<DataSourceStatusItem[]>(() => [
    {
      id: "portfolio",
      title: "Portfolio summary",
      value: hasLivePortfolio ? "Live" : "Demo",
      detail: hasLivePortfolio
        ? "Net worth and allocation cards are using live connected data."
        : "Preview data is active. Connect real sources before trusting this summary.",
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
        ? `${effectiveAllAccounts.investment_accounts.length} investment, ${effectiveAllAccounts.cash_accounts.length} cash, ${effectiveAllAccounts.debt_accounts.length} debt feeding your plan`
        : "No live sources yet. Add one account to tighten runway and tax context.",
      tone: hasLiveAccounts ? "live" : "warning",
      href: "/connect",
      actionLabel: "Link accounts",
    },
    {
      id: "holdings",
      title: "Holdings",
      value: `${holdingsCount} position${holdingsCount === 1 ? "" : "s"}`,
      detail: hasLiveHoldings
        ? "Exposure and concentration checks can use connected positions."
        : "Holdings are still synthetic preview fixtures.",
      tone: hasLiveHoldings ? "live" : "warning",
    },
    {
      id: "connections",
      title: "Connection sync",
      value: connectionStatusState.value,
      detail: connectionStatusState.detail,
      tone: connectionStatusState.tone,
      href: "/data-health",
      actionLabel: "Open health",
    },
  ], [
    accountCount,
    connectionStatusState,
    effectiveAllAccounts.cash_accounts,
    effectiveAllAccounts.debt_accounts,
    effectiveAllAccounts.investment_accounts,
    hasLiveAccounts,
    hasLiveHoldings,
    hasLivePortfolio,
    holdingsCount,
    lastSyncedAt,
  ]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      isLoading ||
      !memoryFetched ||
      (hasDecisionTraceConsent && !tracesFetched)
    ) {
      return;
    }

    const trackedKey = "cm_founder_dashboard_arrival_tracked";
    if (window.sessionStorage.getItem(trackedKey) === "true") {
      return;
    }

    captureAnalyticsEvent("founder_dashboard_arrived", {
      source: readFounderFunnelSource() ?? "unknown",
      using_demo_data: usingDemoData,
      has_accounts: hasAccounts,
      has_founder_baseline: hasFounderBaseline,
      has_decision_traces: hasDecisionTraces,
      connection_tone: connectionStatusState.tone,
    });
    window.sessionStorage.setItem(trackedKey, "true");
  }, [
    connectionStatusState.tone,
    hasAccounts,
    hasDecisionTraceConsent,
    hasDecisionTraces,
    hasFounderBaseline,
    isLoading,
    memoryFetched,
    tracesFetched,
    usingDemoData,
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
                    onClick={() => {
                      setShowAddDropdown(false);
                      setManualEntryPoint("dashboard_menu");
                      setShowFounderManualDialog(true);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <PenLine className="w-4 h-4 text-emerald-500" />
                    Add Founder Context
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
        
        <div className="mb-8 grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
          <FounderPriorityCard
            usingDemoData={usingDemoData}
            hasAccounts={hasAccounts}
            hasFounderBaseline={hasFounderBaseline}
            hasDecisionTraces={hasDecisionTraces}
            connectionStatusState={connectionStatusState}
            onOpenManual={() => {
              setManualEntryPoint("priority_card");
              setShowFounderManualDialog(true);
            }}
          />
          <AdvisorBriefing />
          <ProfileProgressCard memory={memory} />
        </div>

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

            <TaxShieldCard />

            <ConsentGate
              scopes={["decision_traces:read"]}
              purpose="Display decision traces in your dashboard."
            >
              <DecisionTracePanel />
            </ConsentGate>

            <PortfolioHistoryChart
              previewHistory={usingDemoData ? (previewHistory as Partial<Record<PortfolioHistoryRange, PortfolioHistoryPoint[]>>) : undefined}
            />

            <ConcentrationAlert alerts={effectivePortfolio.concentration_alerts} />

            <HoldingsTable
              holdings={effectiveHoldingsRows as any}
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
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Multi-Chain Web3 Surface</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">
                      <AnimatedAmount value={Number(cryptoPortfolio.total_value_usd)} />
                    </p>
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{cryptoPortfolio.assets.length} Assets</p>
                  </div>
                </div>

                <div className="space-y-3 relative z-10">
                  {cryptoPortfolio.assets.slice(0, 4).map((asset: CryptoAsset) => (
                    <div key={asset.symbol} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {asset.logo_url ? (
                          <img src={asset.logo_url} alt={asset.name} className="w-6 h-6 rounded-full" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">{asset.symbol[0]}</div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">{asset.symbol}</p>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">{asset.chain}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-700 dark:text-slate-200">
                          <AnimatedAmount value={Number(asset.balance_usd)} />
                        </p>
                        <p className="text-xs text-slate-400 font-mono">{Number(asset.balance).toFixed(4)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {cryptoPortfolio.defi_positions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-3 ml-1">DeFi Positions</p>
                      {cryptoPortfolio.defi_positions.map((pos: DeFiPosition) => (
                        <div key={pos.protocol_name} className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                          <div className="flex items-center gap-2">
                            {pos.protocol_logo && <img src={pos.protocol_logo} alt="" className="w-4 h-4 rounded-sm" />}
                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">{pos.protocol_name}</span>
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
                    onClick={() => cryptoMutations.remove.mutate(cryptoPortfolio.wallets[0].id)} // Simplified
                    className="w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                  >
                    Disconnect Wallets
                  </button>
                </div>
              </div>
            )}

            {effectivePhysicalAssets && (
              <PhysicalAssetsCard
                summary={effectivePhysicalAssets}
                onRefreshRealEstate={(id) => handleRefreshValuation(() => realEstateMutations.refresh.mutateAsync(id) as Promise<ValuationRefreshResponse>)}
                onRefreshVehicle={(id) => handleRefreshValuation(() => vehicleMutations.refresh.mutateAsync(id) as Promise<ValuationRefreshResponse>)}
                onRefreshCollectible={(id) => handleRefreshValuation(() => collectibleMutations.refresh.mutateAsync(id) as Promise<ValuationRefreshResponse>)}
                onRefreshMetal={(id) => handleRefreshValuation(() => metalMutations.refresh.mutateAsync(id) as Promise<ValuationRefreshResponse>)}
                onDeleteRealEstate={(id) => handleDeleteAsset(() => realEstateMutations.remove.mutateAsync(id))}
                onDeleteVehicle={(id) => handleDeleteAsset(() => vehicleMutations.remove.mutateAsync(id))}
                onDeleteCollectible={(id) => handleDeleteAsset(() => collectibleMutations.remove.mutateAsync(id))}
                onDeleteMetal={(id) => handleDeleteAsset(() => metalMutations.remove.mutateAsync(id))}
                onDeleteAlternative={(id) => handleDeleteAsset(() => alternativeMutations.remove.mutateAsync(id))}
                onAddAsset={() => setShowAddModal(true)}
              />
            )}

            {equityPortfolio && (
              <EquityCard
                portfolio={equityPortfolio}
                projections={equityProjections ?? []}
                onDeleteGrant={(symbol) => {
                  const grant = equityPortfolio.grant_valuations.find((v: EquityValuation) => v.symbol === symbol);
                  if (grant) {
                    // Logic to handle grant deletion
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
                accounts={effectiveInvestmentAccounts.map((a: InvestmentAccount) => ({
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

      <DashboardPageHeader
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

      <FounderManualContextDialog
        open={showFounderManualDialog}
        onOpenChange={setShowFounderManualDialog}
        stage={founderPriorityState.stage}
        entryPoint={manualEntryPoint}
      />
      <AddAccountModal open={showAddModal} onOpenChange={setShowAddModal} />
      <ProductTour />
    </div>
  );
}

function DashboardPageHeader({ onRefresh, isRefreshing, showRefresh }: { onRefresh: () => void, isRefreshing: boolean, showRefresh: boolean }) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-serif text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            ClearMoney
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-emerald-500">Dashboard</Link>
            <Link href="/dashboard/war-room" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">War Room</Link>
            <Link href="/dashboard/scenario-lab" className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Scenarios</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {showRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-emerald-500 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}
