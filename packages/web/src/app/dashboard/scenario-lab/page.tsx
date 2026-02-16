"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Compass,
  CircleDollarSign,
  Flame,
  PlayCircle,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { DataSourceStatusStrip, type DataSourceStatusItem } from "@/components/dashboard/DataSourceStatusStrip";
import {
  FALLBACK_FINANCIAL_MEMORY,
  FALLBACK_SPENDING_SUMMARY,
  getPreviewPortfolioSummary,
} from "../_shared/preview-data";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import {
  useAccounts,
  useConsentStatus,
  useFinancialMemory,
  useConnections,
  usePortfolioSummary,
  useSpendingSummary,
  useSyncAllConnections,
} from "@/lib/strata/hooks";
import {
  Area,
  AreaChart,
  CartesianGrid,
  type TooltipProps,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ScenarioPoint {
  month: string;
  cash: number;
  debt: number;
  income: number;
  spend: number;
  debtPayment: number;
  net: number;
  runway: number;
  interest: number;
}

interface ScenarioInputs {
  growthRate: number;
  burnAdj: number;
  raiseAmount: number;
  raiseMonth: number;
  debtPaymentMultiplier: number;
}

const PRESETS = [
  {
    id: "base",
    name: "Balanced",
    growthRate: 3,
    burnAdj: 2,
    raiseAmount: 25_000,
    raiseMonth: 4,
    debtPaymentMultiplier: 1,
  },
  {
    id: "growth",
    name: "Growth",
    growthRate: 8,
    burnAdj: -4,
    raiseAmount: 65_000,
    raiseMonth: 3,
    debtPaymentMultiplier: 1.3,
  },
  {
    id: "stress",
    name: "Bear",
    growthRate: -5,
    burnAdj: 10,
    raiseAmount: 0,
    raiseMonth: 12,
    debtPaymentMultiplier: 0.7,
  },
];

function formatMonthLabel(index: number): string {
  const month = new Date();
  month.setMonth(month.getMonth() + index);
  return month.toLocaleDateString("en-US", { month: "short" });
}

function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function scenarioTooltip({ active, payload, label }: TooltipProps<number, string>) {
  const numericPayload = (payload ?? []).filter(
    (item): item is { value: number; dataKey?: string | number; name?: string } =>
      typeof item?.value === "number",
  );
  if (!active || !numericPayload.length || !label) return null;
  const labelText = String(label);
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-200">
      <p className="text-neutral-400 mb-2">{labelText}</p>
      {numericPayload.map((item) => {
        const key = String(item.dataKey ?? item.name ?? "value");
        return (
          <p key={key} className="leading-relaxed">
            {key}: {formatCurrency(item.value)}
          </p>
        );
      })}
    </div>
  );
}

export default function ScenarioLabPage() {
  const { hasConsent, isLoading: consentLoading } = useConsentStatus([
    "portfolio:read",
    "accounts:read",
    "memory:read",
  ]);
  const { hasConsent: hasSyncConsent } = useConsentStatus(["connections:write"]);
  const syncAllConnections = useSyncAllConnections();

  const {
    data: portfolio,
    isLoading: portfolioLoading,
    isError: portfolioError,
    error: portfolioErrorDetails,
    refetch: refetchPortfolio,
  } = usePortfolioSummary({ enabled: hasConsent });

  const {
    data: accounts,
    isLoading: accountsLoading,
    isError: accountsError,
    error: accountsErrorDetails,
    refetch: refetchAccounts,
  } = useAccounts({ enabled: hasConsent });

  const {
    data: memory,
    isLoading: memoryLoading,
    isError: memoryError,
    error: memoryErrorDetails,
    refetch: refetchMemory,
  } = useFinancialMemory({ enabled: hasConsent });

  const {
    data: spending,
    isLoading: spendingLoading,
    isError: spendingError,
    error: spendingErrorDetails,
    refetch: refetchSpending,
  } = useSpendingSummary(3, { enabled: hasConsent });
  const { hasConsent: hasConnectionsConsent, isLoading: connectionsConsentLoading } = useConsentStatus(["connections:read"]);
  const {
    data: connections,
    isLoading: connectionsLoading,
    isError: connectionsError,
    error: connectionsErrorDetails,
    refetch: refetchConnections,
  } = useConnections({ enabled: hasConnectionsConsent });

  const [selectedPreset, setSelectedPreset] = useState(PRESETS[0].id);
  const [inputs, setInputs] = useState<ScenarioInputs>({
    growthRate: PRESETS[0].growthRate,
    burnAdj: PRESETS[0].burnAdj,
    raiseAmount: PRESETS[0].raiseAmount,
    raiseMonth: PRESETS[0].raiseMonth,
    debtPaymentMultiplier: PRESETS[0].debtPaymentMultiplier,
  });

  const summary = portfolio ?? getPreviewPortfolioSummary();
  const profile = memory ?? FALLBACK_FINANCIAL_MEMORY;
  const spendingSummary = spending ?? FALLBACK_SPENDING_SUMMARY;
  const accountCount =
    (accounts?.investment_accounts?.length ?? 0) +
    (accounts?.cash_accounts?.length ?? 0) +
    (accounts?.debt_accounts?.length ?? 0);

  const debtAccounts = accounts?.debt_accounts ?? [];
  const debtBalance = debtAccounts.length > 0
    ? debtAccounts.reduce((sum, debt) => sum + (debt.balance ?? 0), 0)
    : summary.total_debt_value;
  const debtPayment = Math.max(
    0,
    debtAccounts.length
      ? debtAccounts.reduce((sum, debt) => sum + (debt.minimum_payment ?? 0), 0)
      : summary.total_debt_value * 0.01,
  );
  const debtRate = debtAccounts.length > 0
    ? debtAccounts.reduce((sum, debt, _, arr) => {
      const rate = Math.max(0, debt.interest_rate ?? 0);
      return sum + rate / arr.length;
    }, 0)
    : 7.5;

  const projected = useMemo<ScenarioPoint[]>(() => {
    const points: ScenarioPoint[] = [];
    let cash = Math.max(0, summary.total_cash_value);
    let debt = Math.max(0, debtBalance);
    const baseIncome = profile.monthly_income ?? 1;
    const baselineSpend = spendingSummary.monthly_average > 0 ? spendingSummary.monthly_average : 1_800;

    for (let month = 1; month <= 12; month++) {
      const growth = 1 + inputs.growthRate / 100;
      const burn = 1 + inputs.burnAdj / 100;
      const income = baseIncome * Math.pow(growth, (month - 1) / 12);
      const spend = baselineSpend * Math.pow(burn, (month - 1) / 12);
      const raise = month === inputs.raiseMonth ? inputs.raiseAmount : 0;
      const minPayment = Math.max(0, debtPayment * inputs.debtPaymentMultiplier);
      const interest = debt * (debtRate / 100 / 12);
      const net = income + raise - spend - interest - minPayment;

      cash += net;
      debt = Math.max(0, debt + interest - minPayment);

      points.push({
        month: formatMonthLabel(month),
        cash,
        debt,
        income,
        spend,
        debtPayment: minPayment,
        net,
        runway: spend > 0 ? cash / spend : Number.POSITIVE_INFINITY,
        interest,
      });
    }

    return points;
  }, [debtBalance, debtPayment, debtRate, inputs, profile.monthly_income, spendingSummary.monthly_average, summary.total_cash_value]);

  const finalCash = projected[projected.length - 1]?.cash ?? summary.total_cash_value;
  const finalDebt = projected[projected.length - 1]?.debt ?? debtBalance;
  const burnOutMonth = projected.findIndex((point) => point.cash <= 0);
  const worstCash = projected.reduce((acc, point) => Math.min(acc, point.cash), summary.total_cash_value);
  const minRunway = projected.reduce((acc, point) => Math.min(acc, point.runway), Number.POSITIVE_INFINITY);

  const minRunwayPoint = projected.reduce<{ month: string; runway: number }>(
    (acc, point) => (point.runway < acc.runway ? { month: point.month, runway: point.runway } : acc),
    { month: projected[0]?.month ?? "", runway: Number.POSITIVE_INFINITY },
  );

  const usingDemoData =
    !portfolio || !accounts || !memory || !spending;
  const moneyLoading = memoryLoading || spendingLoading;
  const isLoading =
    consentLoading ||
    connectionsConsentLoading ||
    connectionsLoading ||
    portfolioLoading ||
    accountsLoading ||
    moneyLoading;

  const isError = portfolioError || accountsError || memoryError || spendingError || connectionsError;

  const lastSyncedAt = useMemo(() => {
    if (!connections?.length) return null;
    const syncTimes = connections
      .map((connection) => connection.last_synced_at)
      .filter((date): date is string => Boolean(date))
      .map((date) => new Date(date).getTime())
      .filter((timestamp) => !Number.isNaN(timestamp));
    if (!syncTimes.length) return null;
    return new Date(Math.max(...syncTimes)).toISOString();
  }, [connections]);

  const sourceItems = useMemo<DataSourceStatusItem[]>(() => {
    const accountCount =
      (accounts?.investment_accounts?.length ?? 0) +
      (accounts?.cash_accounts?.length ?? 0) +
      (accounts?.debt_accounts?.length ?? 0);
    const profileCompleteness = [
      profile.monthly_income,
      profile.monthly_savings_target,
      profile.risk_tolerance,
      profile.annual_income,
      profile.emergency_fund_target_months,
    ].filter((value) => value !== null && value !== undefined).length;

    return [
      {
        id: "portfolio",
        title: "Portfolio summary",
        value: portfolio ? "Live" : "Fallback",
        detail: portfolio
          ? "Net worth and cash balance are connected."
          : "Using synthetic portfolio preview in the scenario.",
        tone: portfolio ? "live" : "warning",
        href: "/dashboard",
        actionLabel: "Open dashboard",
        lastSyncedAt,
      },
      {
        id: "accounts",
        title: "Accounts",
        value: `${accountCount} source${accountCount === 1 ? "" : "s"}`,
        detail: accounts
          ? "Account set is available for scenario inputs."
          : "Connect accounts for better debt/cash realism.",
        tone: accounts ? "live" : "warning",
      },
      {
        id: "spending",
        title: "Spend signal",
        value: spending ? `${spendingSummary.months_analyzed} months` : "Fallback",
        detail:
          spendingSummary.months_analyzed > 0
            ? `${spendingSummary.categories.length} category buckets in signal.`
            : "Running on synthetic spending assumptions.",
        tone: spending ? "live" : "partial",
      },
      {
        id: "profile",
        title: "Profile depth",
        value: `${profileCompleteness}/5`,
        detail:
          profileCompleteness >= 4
            ? "Profile inputs support stronger scenario validity."
            : "Add remaining profile traits for better forecast quality.",
        tone: profileCompleteness >= 4 ? "live" : profileCompleteness >= 2 ? "partial" : "warning",
        href: "/profile",
        actionLabel: "Update profile",
      },
      {
        id: "connections",
        title: "Connection freshness",
        value: connections?.length ? `${connections.length} active` : "No active links",
        detail: connections?.length
          ? "Connection layer is synced."
          : "No active connection metadata yet.",
        tone: connections?.length ? "live" : "warning",
      },
    ];
  }, [
    accountCount,
    connections?.length,
    lastSyncedAt,
    portfolio,
    spending,
    spendingSummary.categories.length,
    spendingSummary.months_analyzed,
    profile,
    accounts,
  ]);

  function handlePresetSelect(presetId: string) {
    const preset = PRESETS.find((entry) => entry.id === presetId);
    if (!preset) return;
    setSelectedPreset(preset.id);
    setInputs({
      growthRate: preset.growthRate,
      burnAdj: preset.burnAdj,
      raiseAmount: preset.raiseAmount,
      raiseMonth: preset.raiseMonth,
      debtPaymentMultiplier: preset.debtPaymentMultiplier,
    });
  }

  async function handleRefresh() {
    if (!hasSyncConsent) {
      refetchPortfolio();
      refetchAccounts();
      refetchMemory();
      refetchSpending();
      if (hasConnectionsConsent) {
        refetchConnections();
      }
      return;
    }
    await syncAllConnections.mutateAsync();
    refetchPortfolio();
    refetchAccounts();
    refetchMemory();
    refetchSpending();
    if (hasConnectionsConsent) {
      refetchConnections();
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <DashboardHeader
          showRefresh={hasSyncConsent}
          isRefreshing={syncAllConnections.isPending}
          onRefresh={handleRefresh}
        />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <DashboardLoadingSkeleton />
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <DashboardHeader
          showRefresh={hasSyncConsent}
          isRefreshing={syncAllConnections.isPending}
          onRefresh={handleRefresh}
        />
        <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />
          <ApiErrorState
            message="Could not load scenario lab inputs."
            error={
              portfolioErrorDetails ||
              accountsErrorDetails ||
              memoryErrorDetails ||
              spendingErrorDetails ||
              connectionsErrorDetails
            }
            onRetry={handleRefresh}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader
        showRefresh={hasSyncConsent}
        isRefreshing={syncAllConnections.isPending}
        onRefresh={handleRefresh}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">Scenario lab</p>
          <h1 className="mt-2 font-serif text-3xl text-white">Scenario Lab</h1>
          <p className="mt-2 text-neutral-400 max-w-3xl">
            Stress-test runway and debt behavior over 12 months with live inputs and scenario presets.
          </p>
          {usingDemoData ? (
            <p className="mt-2 text-xs text-amber-300 inline-flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Synthetic baseline is active until live Strata data is connected.
            </p>
          ) : null}
        </motion.div>

        <DataSourceStatusStrip items={sourceItems} usingDemoData={usingDemoData} />

        <ConsentGate
          scopes={[
            "portfolio:read",
            "accounts:read",
            "memory:read",
          ]}
          purpose="Run scenario simulations using your live monthly income, spend, and debt inputs"
        >
          <section className="grid xl:grid-cols-3 gap-4 mb-6">
            <article className="xl:col-span-1 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-white font-medium">Assumptions</h2>
                <Flame className="w-4 h-4 text-emerald-300" />
              </div>

              <div className="mt-4 space-y-5">
                <div>
                  <label className="text-xs text-neutral-300">Revenue growth (annualized)</label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={inputs.growthRate}
                      onChange={(e) => setInputs((current) => ({ ...current, growthRate: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="w-14 text-right text-sm text-neutral-300">{inputs.growthRate}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-300">Burn trajectory shift (monthly trend)</label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="-15"
                      max="20"
                      value={inputs.burnAdj}
                      onChange={(e) => setInputs((current) => ({ ...current, burnAdj: Number(e.target.value) }))}
                      className="w-full"
                    />
                    <span className="w-14 text-right text-sm text-neutral-300">{inputs.burnAdj}%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-300">Debt payoff aggressiveness</label>
                  <div className="mt-2 flex items-center gap-3">
                    <input
                      type="range"
                      min="0.3"
                      max="2"
                      step="0.1"
                      value={inputs.debtPaymentMultiplier}
                      onChange={(e) =>
                        setInputs((current) => ({
                          ...current,
                          debtPaymentMultiplier: Number(e.target.value),
                        }))
                      }
                      className="w-full"
                    />
                    <span className="w-14 text-right text-sm text-neutral-300">
                      {inputs.debtPaymentMultiplier.toFixed(1)}x
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-neutral-300">Raise month / amount</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={inputs.raiseMonth}
                      onChange={(e) =>
                        setInputs((current) => ({
                          ...current,
                          raiseMonth: clamp(Number(e.target.value), 1, 12),
                        }))
                      }
                      className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white"
                    />
                    <input
                      type="number"
                      min="0"
                      value={inputs.raiseAmount}
                      onChange={(e) =>
                        setInputs((current) => ({
                          ...current,
                          raiseAmount: clamp(Number(e.target.value), 0, 400000),
                        }))
                      }
                      className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white"
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    Raise {formatCurrency(inputs.raiseAmount)} in month {inputs.raiseMonth}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`rounded-lg border px-3 py-2 text-xs transition-colors ${
                      selectedPreset === preset.id
                        ? "border-emerald-400 bg-emerald-900/30 text-emerald-100"
                        : "border-neutral-700 text-neutral-300 hover:border-emerald-800"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}

                <button
                  type="button"
                  className="w-full rounded-lg border border-neutral-700 text-neutral-300 px-3 py-2 text-xs hover:border-emerald-800 transition-colors"
                  onClick={() =>
                    setInputs({
                      growthRate: inputs.growthRate,
                      burnAdj: inputs.burnAdj,
                      raiseAmount: inputs.raiseAmount,
                      raiseMonth: inputs.raiseMonth,
                      debtPaymentMultiplier: inputs.debtPaymentMultiplier,
                    })
                  }
                >
                  <RotateCcw className="w-3 h-3 inline mr-1" />
                  Recompute scenario
                </button>
              </div>
            </article>

            <article className="xl:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg text-white font-medium">12-month runway forecast</h2>
                <PlayCircle className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="mt-1 text-sm text-neutral-400">
                Based on live monthly income, spend, and debt balances.
              </p>
              <div className="mt-4 h-72 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projected}>
                    <defs>
                      <linearGradient id="cashFlowFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#262626" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: "#737373", fontSize: 11 }} />
                    <YAxis tickFormatter={(value) => formatCurrency(Number(value), 0)} tick={{ fill: "#737373", fontSize: 11 }} />
                    <Tooltip content={scenarioTooltip} />
                    <Area
                      type="monotone"
                      dataKey="cash"
                      stroke="#34d399"
                      fill="url(#cashFlowFill)"
                    />
                    <Line
                      type="monotone"
                      dataKey="debt"
                      stroke="#f87171"
                      strokeWidth={2}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-neutral-400">Final cash</p>
                  <p className="mt-2 text-white">{formatCurrency(finalCash)}</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-neutral-400">Final debt</p>
                  <p className="mt-2 text-white">{formatCurrency(finalDebt)}</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                  <p className="text-neutral-400">Worst runway</p>
                  <p className="mt-2 text-white">
                    {Number.isFinite(minRunway) ? `${minRunway.toFixed(1)} mo` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-neutral-700 px-3 py-1 text-neutral-200">
                  Lowest runway in {minRunwayPoint.month}
                </span>
                {burnOutMonth >= 0 ? (
                  <span className="rounded-full border border-rose-700 text-rose-200 px-3 py-1">
                    Runway breach around month {burnOutMonth + 1}
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-700 text-emerald-200 px-3 py-1">
                    Keeps positive through month 12
                  </span>
                )}
                <span className="rounded-full border border-neutral-700 text-neutral-300 px-3 py-1">
                  Lowest cash: {formatCurrency(worstCash)}
                </span>
              </div>
            </article>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-white font-medium">Month-by-month assumptions</h2>
              <CircleDollarSign className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-neutral-400 border-b border-neutral-800">
                  <tr>
                    <th className="pb-3 pr-4">Month</th>
                    <th className="pb-3 pr-4">Income</th>
                    <th className="pb-3 pr-4">Spend</th>
                    <th className="pb-3 pr-4">Debt pay</th>
                    <th className="pb-3 pr-4">Debt interest</th>
                    <th className="pb-3 pr-4">Net</th>
                    <th className="pb-3 pr-4">Cash</th>
                    <th className="pb-3">Runway</th>
                  </tr>
                </thead>
                <tbody>
                  {projected.map((point) => (
                    <tr
                      key={`${point.month}-${point.cash}`}
                      className="border-b border-neutral-800 last:border-b-0 text-neutral-200"
                    >
                      <td className="py-3 pr-4 text-neutral-300">{point.month}</td>
                      <td className="py-3 pr-4">{formatCurrency(point.income)}</td>
                      <td className="py-3 pr-4">{formatCurrency(point.spend)}</td>
                      <td className="py-3 pr-4">{formatCurrency(point.debtPayment)}</td>
                      <td className="py-3 pr-4">{formatCurrency(point.interest)}</td>
                      <td className={`py-3 pr-4 ${point.net >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                        {formatCurrency(point.net)}
                      </td>
                      <td className="py-3 pr-4">{formatCurrency(point.cash)}</td>
                      <td className="py-3">{Number.isFinite(point.runway) ? `${point.runway.toFixed(1)}m` : "∞"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg text-white font-medium">Next move</h2>
              <AlertTriangle className="w-4 h-4 text-emerald-300" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard/progress"
                className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-4 py-2 text-neutral-200 hover:bg-neutral-800"
              >
                Track this scenario over time
              </Link>
              <Link
                href="/dashboard/command-center"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-900/20 px-4 py-2 text-emerald-200 hover:bg-emerald-900/30"
              >
                <Compass className="w-3 h-3" />
                Return to command center
              </Link>
              <Link
                href="/dashboard/decision-narrative"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-800 bg-emerald-900/20 px-4 py-2 text-emerald-200 hover:bg-emerald-900/30"
              >
                Validate in decision narrative
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          <p className="mt-4 text-xs text-neutral-500">
            Key signal: runway stays above 2 months for
            {minRunway < 2 ? " only" : " at least"} baseline duration.
            Net growth versus debt stress is currently{" "}
            <span className={isError ? "text-rose-300" : "text-emerald-300"}>
              {formatPercent(inputs.growthRate > 0 ? Math.max(0.05, inputs.growthRate / 100 + 0.15) : 0.04, 1)}
            </span>
            {` scenario-implied margin proxy.`}
          </p>
        </ConsentGate>
      </main>
    </div>
  );
}
