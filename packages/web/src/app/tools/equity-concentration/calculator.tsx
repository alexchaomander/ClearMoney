"use client";

import { useCallback, useMemo, useState } from "react";
import { AppShell, MethodologySection, SliderInput } from "@/components/shared";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCurrency,
  formatPercent,
  formatPercentRaw,
  formatYears,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/equity-concentration/calculations";
import type {
  CalculatorInputs,
  CalculatorResults,
} from "@/lib/calculators/equity-concentration/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  equity: {
    currentSharesValue: 500000,
    vestedOptionsValue: 100000,
    unvestedEquityValue: 200000,
    costBasis: 50000,
  },
  assets: {
    cashSavings: 50000,
    retirementAccounts: 200000,
    otherInvestments: 100000,
    realEstate: 300000,
    otherAssets: 0,
  },
  income: {
    annualSalary: 200000,
    annualEquityGrant: 100000,
    yearsAtCompany: 3,
  },
  tax: {
    filingStatus: "single",
    marginalTaxRate: 37,
    stateCode: "CA",
  },
};

const normalizeNumber = (value: unknown): number | null => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const extractEquityComp = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
};

const extractPortfolioSummary = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
};

const STATE_OPTIONS = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DC", name: "District of Columbia" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "IA", name: "Iowa" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "MA", name: "Massachusetts" },
  { code: "MD", name: "Maryland" },
  { code: "ME", name: "Maine" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MO", name: "Missouri" },
  { code: "MS", name: "Mississippi" },
  { code: "MT", name: "Montana" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "NE", name: "Nebraska" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NV", name: "Nevada" },
  { code: "NY", name: "New York" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VA", name: "Virginia" },
  { code: "VT", name: "Vermont" },
  { code: "WA", name: "Washington" },
  { code: "WI", name: "Wisconsin" },
  { code: "WV", name: "West Virginia" },
  { code: "WY", name: "Wyoming" },
];

const riskStyles = {
  low: {
    label: "Low",
    color: "text-emerald-300",
    ring: "from-emerald-400/40 via-emerald-500/20 to-emerald-400/40",
    badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    gauge: "#34d399",
  },
  moderate: {
    label: "Moderate",
    color: "text-amber-300",
    ring: "from-amber-400/40 via-amber-500/20 to-amber-400/40",
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-200",
    gauge: "#fbbf24",
  },
  high: {
    label: "High",
    color: "text-orange-300",
    ring: "from-orange-400/40 via-orange-500/20 to-orange-400/40",
    badge: "border-orange-500/40 bg-orange-500/10 text-orange-200",
    gauge: "#fb923c",
  },
  extreme: {
    label: "Extreme",
    color: "text-rose-300",
    ring: "from-rose-400/40 via-rose-500/20 to-rose-400/40",
    badge: "border-rose-500/40 bg-rose-500/10 text-rose-200",
    gauge: "#f43f5e",
  },
} as const;

// Net worth breakdown chart colors
const BREAKDOWN_COLORS = {
  employerStockVested: "#f43f5e",
  employerStockUnvested: "#fb7185",
  cashSavings: "#38bdf8",
  retirementAccounts: "#a78bfa",
  otherInvestments: "#34d399",
  realEstate: "#fbbf24",
  otherAssets: "#9ca3af",
} as const;

function buildDonutGradient(data: { percent: number; color: string }[]) {
  let start = 0;
  const segments = data.map((segment) => {
    const end = start + segment.percent;
    const entry = `${segment.color} ${start}% ${end}%`;
    start = end;
    return entry;
  });
  if (segments.length === 0) {
    return "conic-gradient(#1f2937 0% 100%)";
  }
  return `conic-gradient(${segments.join(", ")})`;
}

function formatTaxImpact(value: number) {
  if (value === 0) return "Varies";
  return value > 0
    ? `${formatCurrency(value)} tax cost`
    : `${formatCurrency(Math.abs(value))} tax benefit`;
}

function ResultsSummary({
  results,
  inputs,
}: {
  results: CalculatorResults;
  inputs: CalculatorInputs;
}) {
  const riskStyle = riskStyles[results.metrics.riskLevel];
  const concentration = Math.min(100, Math.max(0, results.metrics.concentrationPercent));
  const ringStyle = {
    background: `conic-gradient(${riskStyle.gauge} ${concentration}%, #1f2937 ${concentration}% 100%)`,
  };

  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl space-y-10">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
                  Concentration Risk Gauge
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Your equity concentration score
                </h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Includes vested + unvested equity so you can see your full exposure.
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${riskStyle.badge}`}
              >
                {riskStyle.label} risk
              </span>
            </div>

            <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative">
                <div
                  className={`h-44 w-44 rounded-full p-2 bg-gradient-to-br ${riskStyle.ring}`}
                >
                  <div
                    className="h-full w-full rounded-full bg-neutral-950 flex items-center justify-center"
                    style={ringStyle}
                  >
                    <div className="h-28 w-28 rounded-full bg-neutral-950 flex flex-col items-center justify-center border border-neutral-800">
                      <span className={`text-3xl font-bold ${riskStyle.color}`}>
                        {formatPercentRaw(results.metrics.concentrationPercent, 0)}
                      </span>
                      <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                        of net worth
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-sm text-neutral-400">Employer equity total</p>
                  <p className="text-xl font-semibold text-white">
                    {formatCurrency(results.metrics.employerEquityTotal)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Vested concentration: {formatPercent(results.metrics.vestedConcentrationPercent, 1, true)}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-sm text-neutral-400">Total net worth</p>
                  <p className="text-xl font-semibold text-white">
                    {formatCurrency(results.metrics.totalNetWorth)}
                  </p>
                </div>
                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-sm text-neutral-400">Excess risk multiplier</p>
                  <p className="text-xl font-semibold text-white">
                    {results.excessRiskMultiplier.toFixed(1)}x
                  </p>
                  <p className="text-xs text-neutral-500">
                    Compared to a diversified portfolio.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <NetWorthBreakdown results={results} inputs={inputs} />
        </div>
      </div>
    </section>
  );
}

function NetWorthBreakdown({
  results,
  inputs,
}: {
  results: CalculatorResults;
  inputs: CalculatorInputs;
}) {
  const total = results.metrics.totalNetWorth;
  const breakdownData = [
    {
      label: "Employer Stock (Vested)",
      value: inputs.equity.currentSharesValue + inputs.equity.vestedOptionsValue,
      color: BREAKDOWN_COLORS.employerStockVested,
    },
    {
      label: "Employer Stock (Unvested)",
      value: inputs.equity.unvestedEquityValue,
      color: BREAKDOWN_COLORS.employerStockUnvested,
    },
    {
      label: "Cash & Savings",
      value: inputs.assets.cashSavings,
      color: BREAKDOWN_COLORS.cashSavings,
    },
    {
      label: "Retirement Accounts",
      value: inputs.assets.retirementAccounts,
      color: BREAKDOWN_COLORS.retirementAccounts,
    },
    {
      label: "Other Investments",
      value: inputs.assets.otherInvestments,
      color: BREAKDOWN_COLORS.otherInvestments,
    },
    {
      label: "Real Estate",
      value: inputs.assets.realEstate,
      color: BREAKDOWN_COLORS.realEstate,
    },
    {
      label: "Other Assets",
      value: inputs.assets.otherAssets,
      color: BREAKDOWN_COLORS.otherAssets,
    },
  ];

  const donutData = breakdownData
    .filter((item) => item.value > 0)
    .map((item) => ({
      ...item,
      percent: total > 0 ? (item.value / total) * 100 : 0,
    }));

  const gradient = buildDonutGradient(
    donutData.map((item) => ({ percent: item.percent, color: item.color }))
  );

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-xl font-semibold text-white">Net worth breakdown</h3>
      <p className="mt-2 text-sm text-neutral-400">
        See how much of your wealth is tied to employer stock versus diversified assets.
      </p>
      <div className="mt-6 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto h-36 w-36">
          <div
            className="h-36 w-36 rounded-full"
            style={{ background: gradient }}
          />
          <div className="absolute inset-4 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center">
            <div className="text-center">
              <p className="text-xs uppercase text-neutral-500">Net worth</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(total)}
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {donutData.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1">
                <div className="flex justify-between text-sm text-neutral-300">
                  <span>{item.label}</span>
                  <span>{formatCurrency(item.value)}</span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-800">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
          {total === 0 && (
            <p className="text-sm text-neutral-500">Enter your assets to see a breakdown.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function DoubleExposure({ results }: { results: CalculatorResults }) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <h3 className="text-2xl font-semibold text-white">
              The double exposure problem
            </h3>
            <p className="mt-2 text-sm text-neutral-400">
              Your stock and your paycheck depend on the same company. If the company
              struggles, both can be impacted at the same time.
            </p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
                <p className="text-sm text-rose-200">Estimated human capital value</p>
                <p className="text-2xl font-semibold text-white">
                  {formatCurrency(results.metrics.humanCapitalValue)}
                </p>
                <p className="text-xs text-rose-100/70">
                  Future earnings potential tied to this employer.
                </p>
              </div>
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-sm text-neutral-400">Total exposure (stock + job)</p>
                <p className="text-2xl font-semibold text-white">
                  {formatCurrency(results.metrics.totalExposure)}
                </p>
                <p className="text-xs text-neutral-500">
                  Diversifying reduces the overlap between your income and investments.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">
              Why it matters
            </p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-300">
              <li className="flex gap-3">
                <span className="text-rose-300">●</span>
                Company-specific risk is uncompensated—you are not paid extra to take it.
              </li>
              <li className="flex gap-3">
                <span className="text-rose-300">●</span>
                Layoffs often coincide with stock drops, magnifying losses.
              </li>
              <li className="flex gap-3">
                <span className="text-rose-300">●</span>
                A gradual plan can reduce taxes without trying to time the market.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function ScenarioAnalysis({ results }: { results: CalculatorResults }) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl">
        <h3 className="text-2xl font-semibold text-white">Scenario analysis</h3>
        <p className="mt-2 text-sm text-neutral-400">
          How a stock drop impacts your net worth and years of salary lost.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {results.scenarios.map((scenario) => (
            <div
              key={scenario.scenario}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">
                  {scenario.scenario}
                </h4>
                <span className="text-sm text-rose-300">
                  {formatPercentRaw(scenario.percentNetWorthLost, 0)} lost
                </span>
              </div>
              <p className="mt-2 text-sm text-neutral-400">
                {scenario.description}
              </p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">New net worth</span>
                  <span className="text-white">
                    {formatCurrency(scenario.newNetWorth)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Equity value</span>
                  <span className="text-white">
                    {formatCurrency(scenario.newEmployerEquityValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Years of salary lost</span>
                  <span className="text-white">
                    {formatYears(scenario.yearsOfSalaryLost)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HistoricalExamples({ results }: { results: CalculatorResults }) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl">
        <h3 className="text-2xl font-semibold text-white">Historical reality check</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Even strong companies can drop sharply. Here is what those moves would
          mean for your portfolio.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {results.historicalExamples.map((example) => (
            <div
              key={example.company}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">{example.company}</h4>
                <span className="text-sm text-rose-300">
                  {formatPercentRaw(example.dropPercent, 0)} drop
                </span>
              </div>
              <p className="mt-2 text-xs text-neutral-400">{example.event}</p>
              <p className="mt-4 text-sm text-neutral-300">
                {example.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DiversificationStrategies({ results }: { results: CalculatorResults }) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl">
        <h3 className="text-2xl font-semibold text-white">Diversification strategies</h3>
        <p className="mt-2 text-sm text-neutral-400">
          Actionable pathways to reduce risk while respecting taxes and trading windows.
        </p>
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {results.strategies.map((strategy) => (
            <div
              key={strategy.strategy}
              className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">{strategy.strategy}</h4>
                {strategy.targetConcentration > 0 && (
                  <span className="text-xs font-semibold text-rose-300">
                    Target: {strategy.targetConcentration}%
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-neutral-300">{strategy.description}</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Timeframe</span>
                  <span className="text-white">{strategy.timeframe}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Value to sell</span>
                  <span className="text-white">
                    {strategy.sharesOrValueToSell > 0
                      ? formatCurrency(strategy.sharesOrValueToSell)
                      : "Strategic"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tax impact</span>
                  <span className="text-white">{formatTaxImpact(strategy.taxImpact)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TaxImpact({ results }: { results: CalculatorResults }) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-white">Tax impact analysis</h3>
            <p className="mt-2 text-sm text-neutral-400">
              Estimates assume long-term capital gains rates and your selected state.
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-300">
            <p>
              Selling immediately is rarely optimal—plan sales to match vesting and
              tax brackets.
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
            <p className="text-sm text-neutral-400">Unrealized gains</p>
            <p className="text-xl font-semibold text-white">
              {formatCurrency(results.unrealizedGain)}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
            <p className="text-sm text-neutral-400">Estimated tax on full sale</p>
            <p className="text-xl font-semibold text-white">
              {formatCurrency(results.taxOnFullSale)}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
            <p className="text-sm text-neutral-400">After-tax value (vested)</p>
            <p className="text-xl font-semibold text-white">
              {formatCurrency(results.afterTaxValue)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Recommendations({ results }: { results: CalculatorResults }) {
  return (
    <section className="px-4 pb-16">
      <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-6">
          <h3 className="text-xl font-semibold text-white">Warnings to take seriously</h3>
          {results.warnings.length === 0 ? (
            <p className="mt-3 text-sm text-neutral-200">
              No urgent warnings based on your current inputs.
            </p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm text-neutral-200">
              {results.warnings.map((warning) => (
                <li key={warning} className="flex gap-3">
                  <span className="text-rose-300">⚠</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
          <h3 className="text-xl font-semibold text-white">Personalized recommendations</h3>
          <ul className="mt-4 space-y-3 text-sm text-neutral-300">
            {results.recommendations.map((recommendation) => (
              <li key={recommendation} className="flex gap-3">
                <span className="text-emerald-300">●</span>
                <span>{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Calculator() {
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    "equity.currentSharesValue": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.current_equity_value) ?? null,
    ],
    "equity.vestedOptionsValue": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.vested_options_value) ?? null,
    ],
    "equity.unvestedEquityValue": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.unvested_equity_value) ?? null,
    ],
    "equity.costBasis": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.equity_cost_basis) ?? null,
    ],
    "assets.cashSavings": [
      "portfolio_summary",
      (value: unknown) =>
        normalizeNumber(extractPortfolioSummary(value)?.total_cash_value) ?? null,
    ],
    "assets.retirementAccounts": [
      "portfolio_summary",
      (value: unknown) =>
        normalizeNumber(extractPortfolioSummary(value)?.total_investment_value) ??
        null,
    ],
    "income.annualSalary": "annual_income",
    "income.annualEquityGrant": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.annual_equity_grant) ?? null,
    ],
    "income.yearsAtCompany": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.years_at_company) ?? null,
    ],
    "tax.filingStatus": [
      "filing_status",
      (value: unknown) => {
        const raw = typeof value === "string" ? value : null;
        if (!raw) return null;
        const mapped =
          raw === "married_filing_jointly" || raw === "married_filing_separately"
            ? "married"
            : raw;
        return mapped === "single" ||
          mapped === "married" ||
          mapped === "head_of_household"
          ? mapped
          : null;
      },
    ],
    "tax.stateCode": [
      "state",
      (value: unknown) => {
        const state = typeof value === "string" ? value : null;
        return STATE_OPTIONS.some((option) => option.code === state)
          ? state
          : null;
      },
    ],
    "tax.marginalTaxRate": [
      "federal_tax_rate",
      (value: unknown) => {
        const rate = normalizeNumber(value);
        return rate == null ? null : rate * 100;
      },
    ],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );

  const results = useMemo(() => calculate(inputs), [inputs]);

  return (
    <AppShell>
      <section className="px-4 pt-12 pb-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-300">
            Equity Concentration Risk Assessment
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            How much of your wealth is tied to one company?
          </h1>
          <p className="mt-4 text-base text-neutral-400">
            Understand the risk of concentrated employer stock, see downside scenarios, and
            explore diversification strategies—all for education, not advice.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <LoadMyDataBanner
            isLoaded={memoryLoaded}
            hasData={memoryHasDefaults}
            isApplied={preFilledFields.size > 0}
            onApply={handleLoadData}
          />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">Employer equity holdings</h2>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Current Employer Stock Value"
                  value={inputs.equity.currentSharesValue}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      equity: { ...prev.equity, currentSharesValue: value },
                    }))
                  }
                  min={0}
                  max={10000000}
                  step={10000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("equity.currentSharesValue")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Vested Options (Intrinsic Value)"
                  value={inputs.equity.vestedOptionsValue}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      equity: { ...prev.equity, vestedOptionsValue: value },
                    }))
                  }
                  min={0}
                  max={5000000}
                  step={10000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("equity.vestedOptionsValue")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Unvested RSUs/Options Value"
                  value={inputs.equity.unvestedEquityValue}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      equity: { ...prev.equity, unvestedEquityValue: value },
                    }))
                  }
                  min={0}
                  max={5000000}
                  step={10000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("equity.unvestedEquityValue")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Total Cost Basis"
                  value={inputs.equity.costBasis}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      equity: { ...prev.equity, costBasis: value },
                    }))
                  }
                  min={0}
                  max={5000000}
                  step={5000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("equity.costBasis")}
                      label="Memory"
                    />
                  }
                />
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">Other assets</h2>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Cash & Savings"
                  value={inputs.assets.cashSavings}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      assets: { ...prev.assets, cashSavings: value },
                    }))
                  }
                  min={0}
                  max={2000000}
                  step={5000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("assets.cashSavings")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Retirement Accounts (401k, IRA)"
                  value={inputs.assets.retirementAccounts}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      assets: { ...prev.assets, retirementAccounts: value },
                    }))
                  }
                  min={0}
                  max={5000000}
                  step={10000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("assets.retirementAccounts")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Other Investments (non-employer)"
                  value={inputs.assets.otherInvestments}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      assets: { ...prev.assets, otherInvestments: value },
                    }))
                  }
                  min={0}
                  max={5000000}
                  step={10000}
                  format="currency"
                />
                <SliderInput
                  label="Real Estate Equity"
                  value={inputs.assets.realEstate}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      assets: { ...prev.assets, realEstate: value },
                    }))
                  }
                  min={0}
                  max={5000000}
                  step={25000}
                  format="currency"
                />
                <SliderInput
                  label="Other Assets"
                  value={inputs.assets.otherAssets}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      assets: { ...prev.assets, otherAssets: value },
                    }))
                  }
                  min={0}
                  max={1000000}
                  step={10000}
                  format="currency"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">Income information</h2>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Annual Salary"
                  value={inputs.income.annualSalary}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      income: { ...prev.income, annualSalary: value },
                    }))
                  }
                  min={0}
                  max={2000000}
                  step={10000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("income.annualSalary")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Annual Equity Grant Value"
                  value={inputs.income.annualEquityGrant}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      income: { ...prev.income, annualEquityGrant: value },
                    }))
                  }
                  min={0}
                  max={1000000}
                  step={10000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("income.annualEquityGrant")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Years at Company"
                  value={inputs.income.yearsAtCompany}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      income: { ...prev.income, yearsAtCompany: value },
                    }))
                  }
                  min={0}
                  max={30}
                  step={1}
                  format="number"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("income.yearsAtCompany")}
                      label="Memory"
                    />
                  }
                />
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">Tax information</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <label className="text-sm font-semibold text-neutral-300">
                    Filing status
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {["single", "married"].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            tax: {
                              ...prev.tax,
                              filingStatus: status as "single" | "married",
                            },
                          }))
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                          inputs.tax.filingStatus === status
                            ? "border-rose-500/60 bg-rose-500/20 text-white"
                            : "border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        {status === "single" ? "Single" : "Married"}
                      </button>
                    ))}
                  </div>
                  <div className="mt-2">
                    <MemoryBadge
                      isActive={preFilledFields.has("tax.filingStatus")}
                      label="Memory"
                    />
                  </div>
                </div>
                <SliderInput
                  label="Marginal Tax Rate %"
                  value={inputs.tax.marginalTaxRate}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      tax: { ...prev.tax, marginalTaxRate: value },
                    }))
                  }
                  min={0}
                  max={50}
                  step={1}
                  format="percent"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("tax.marginalTaxRate")}
                      label="Memory"
                    />
                  }
                />
                <div>
                  <label className="text-sm font-semibold text-neutral-300">State</label>
                  <div className="mt-3">
                    <select
                      value={inputs.tax.stateCode}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          tax: { ...prev.tax, stateCode: event.target.value },
                        }))
                      }
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-200 focus:border-rose-400 focus:outline-none"
                    >
                      {STATE_OPTIONS.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <MemoryBadge
                        isActive={preFilledFields.has("tax.stateCode")}
                        label="Memory"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6">
              <h2 className="text-xl font-semibold text-white">Key thresholds</h2>
              <div className="mt-4 space-y-4 text-sm text-neutral-300">
                <div className="flex items-center justify-between">
                  <span>Sell to reach 10% concentration</span>
                  <span className="text-white">
                    {formatCurrency(results.amountToReach10Percent)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sell to reach 5% concentration</span>
                  <span className="text-white">
                    {formatCurrency(results.amountToReach5Percent)}
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Estimates assume selling vested equity first. Actual amounts may vary based on
                  trading windows and liquidity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </section>

      <ResultsSummary results={results} inputs={inputs} />
      <DoubleExposure results={results} />
      <ScenarioAnalysis results={results} />
      <HistoricalExamples results={results} />
      <DiversificationStrategies results={results} />
      <TaxImpact results={results} />
      <Recommendations results={results} />

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <MethodologySection title="Why this matters (read if you’re on the fence)">
            <p>
              Concentration in a single stock adds company-specific risk without increasing
              expected return. Diversification removes that idiosyncratic risk while keeping
              market exposure.
            </p>
            <p>
              Believing in your company can be motivating, but it should not require staking
              most of your net worth on one outcome. A planned, gradual diversification strategy
              can keep you invested in the company’s success while protecting your financial
              independence.
            </p>
            <p>
              This tool is for education and planning support—not individualized investment advice.
              Consider a qualified financial professional for personalized guidance.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
