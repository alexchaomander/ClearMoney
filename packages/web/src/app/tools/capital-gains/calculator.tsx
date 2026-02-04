"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { AppShell, MethodologySection, SliderInput } from "@/components/shared";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { mergeDeep } from "@/lib/shared/merge";
import {
  calculate,
  STATE_RATES,
} from "@/lib/calculators/capital-gains/calculations";
import type {
  CalculatorInputs,
  FilingStatus,
  HoldingPeriod,
} from "@/lib/calculators/capital-gains/types";
import { useToolPreset } from "@/lib/strata/presets";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  purchasePrice: 50000,
  salePrice: 80000,
  holdingPeriod: "long",
  filingStatus: "single",
  annualIncome: 85000,
  state: "CA",
};

const FILING_STATUS_OPTIONS: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married_filing_jointly", label: "Married Filing Jointly" },
  { value: "married_filing_separately", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
];

const HOLDING_PERIOD_OPTIONS: Array<{
  value: HoldingPeriod;
  label: string;
  description: string;
}> = [
  {
    value: "short",
    label: "Short-term",
    description: "Held 1 year or less. Taxed as ordinary income.",
  },
  {
    value: "long",
    label: "Long-term",
    description: "Held over 1 year. Preferential tax rates apply.",
  },
];

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

const STATE_OPTIONS = Object.keys(STATE_NAMES)
  .map((code) => ({
    code,
    name: STATE_NAMES[code],
    rate: STATE_RATES[code] ?? 0,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("capital-gains");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    annualIncome: "annual_income",
    filingStatus: [
      "filing_status",
      (v: unknown) => {
        const s = String(v);
        if (s === "married_filing_jointly") return "married_filing_jointly";
        if (s === "married_filing_separately")
          return "married_filing_separately";
        if (s === "head_of_household") return "head_of_household";
        return "single";
      },
    ],
    state: "state",
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(() =>
    mergeDeep(DEFAULT_INPUTS, preset ?? undefined)
  );
  const handleLoadData = useCallback(
    () =>
      applyMemoryDefaults(setInputs, (prev, defaults) => ({
        ...prev,
        ...(defaults.annualIncome != null ? { annualIncome: defaults.annualIncome } : {}),
        ...(defaults.filingStatus != null ? { filingStatus: defaults.filingStatus } : {}),
        ...(defaults.state != null ? { state: defaults.state } : {}),
      })),
    [applyMemoryDefaults]
  );

  useEffect(() => {
    if (!preset) return;
    setInputs((prev) => mergeDeep(prev, preset));
  }, [preset]);

  const results = useMemo(() => calculate(inputs), [inputs]);

  const capitalGain = Math.max(0, inputs.salePrice - inputs.purchasePrice);
  const hasGain = capitalGain > 0;
  const activeBd =
    inputs.holdingPeriod === "long" ? results.longTerm : results.shortTerm;
  const stateRate = STATE_RATES[inputs.state] ?? 0;
  const isHighTaxState = stateRate >= 0.1;

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300 mb-3">
            Capital Gains Tax Calculator
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            See how capital gains taxes eat into your profits
          </h1>
          <p className="text-lg text-neutral-400">
            Compare short-term vs. long-term holding and see the federal, state,
            and NIIT breakdown for your situation.
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
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* ---- Inputs column ---- */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Investment details
                </h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Purchase price"
                    value={inputs.purchasePrice}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, purchasePrice: value }))
                    }
                    min={0}
                    max={1000000}
                    step={1000}
                    format="currency"
                    description="Original cost basis of the investment"
                  />
                  <SliderInput
                    label="Sale price"
                    value={inputs.salePrice}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, salePrice: value }))
                    }
                    min={0}
                    max={2000000}
                    step={1000}
                    format="currency"
                    description="Expected or actual sale proceeds"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-neutral-400 mb-3">
                  Holding period
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {HOLDING_PERIOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          holdingPeriod: option.value,
                        }))
                      }
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left text-sm transition",
                        inputs.holdingPeriod === option.value
                          ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-200"
                          : "border-neutral-800 text-neutral-300 hover:border-emerald-400/60"
                      )}
                    >
                      <p className="font-semibold">{option.label}</p>
                      <p className="text-xs text-neutral-400 mt-1">
                        {option.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Income & filing status
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <label className="block text-sm text-neutral-400">
                        Filing status
                      </label>
                      {preFilledFields.has("filingStatus") && (
                        <MemoryBadge
                          field="filingStatus"
                          preFilledFields={preFilledFields}
                        />
                      )}
                    </div>
                    <select
                      value={inputs.filingStatus}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          filingStatus: event.target.value as FilingStatus,
                        }))
                      }
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {FILING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <SliderInput
                      label="Annual income (excluding this gain)"
                      value={inputs.annualIncome}
                      onChange={(value) =>
                        setInputs((prev) => ({
                          ...prev,
                          annualIncome: value,
                        }))
                      }
                      min={0}
                      max={1000000}
                      step={5000}
                      format="currency"
                      description="Used to determine your marginal tax bracket and NIIT applicability"
                    />
                    {preFilledFields.has("annualIncome") && (
                      <div className="mt-1 ml-1">
                        <MemoryBadge
                          field="annualIncome"
                          preFilledFields={preFilledFields}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <label className="block text-sm text-neutral-400">
                      State of residence
                    </label>
                    {preFilledFields.has("state") && (
                      <MemoryBadge
                        field="state"
                        preFilledFields={preFilledFields}
                      />
                    )}
                  </div>
                  {isHighTaxState && (
                    <span className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-full">
                      High-tax state
                    </span>
                  )}
                </div>
                <select
                  value={inputs.state}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      state: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {STATE_OPTIONS.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.name} ({formatPercent(option.rate, 1)})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-neutral-500 mt-2">
                  State taxes are simplified using the top marginal rate.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-sm text-neutral-300">
              <p className="font-semibold text-emerald-200 mb-2">
                Why holding period matters
              </p>
              <p className="text-neutral-400">
                Short-term gains (assets held one year or less) are taxed at
                your ordinary income rate, which can be as high as 37%. Long-term
                gains qualify for preferential rates of 0%, 15%, or 20%
                depending on your income.
              </p>
            </div>
          </div>

          {/* ---- Results column ---- */}
          <div className="space-y-6">
            {/* Primary result - selected holding period */}
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 via-neutral-900 to-neutral-900 p-6 space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-widest text-emerald-200">
                  {inputs.holdingPeriod === "long"
                    ? "Long-Term"
                    : "Short-Term"}{" "}
                  Result
                </p>
                <h2 className="text-3xl font-bold text-white mt-2">
                  {formatCurrency(activeBd.netProceeds, 0)}
                </h2>
                <p className="text-sm text-neutral-400">
                  Net proceeds after estimated taxes
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Capital gain</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(activeBd.capitalGain, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Total taxes</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(activeBd.totalTax, 0)} (
                    {formatPercent(activeBd.effectiveRate, 1)})
                  </span>
                </div>
                <div className="h-px bg-neutral-800" />
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Federal tax</span>
                  <span className="text-white">
                    {formatCurrency(activeBd.federalTax, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">State tax</span>
                  <span className="text-white">
                    {formatCurrency(activeBd.stateTax, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">NIIT (3.8%)</span>
                  <span className="text-white">
                    {formatCurrency(activeBd.niitTax, 0)}
                  </span>
                </div>
              </div>

              {hasGain && (
                <div className="space-y-3">
                  <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${Math.min(
                          (activeBd.netProceeds / inputs.salePrice) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Net proceeds</span>
                    <span>Sale price: {formatCurrency(inputs.salePrice, 0)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Short-term vs Long-term comparison */}
            {hasGain && (
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-5">
                <h3 className="text-lg font-semibold text-white">
                  Short-term vs. Long-term
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={cn(
                      "rounded-xl border p-4 space-y-2",
                      inputs.holdingPeriod === "short"
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-neutral-800"
                    )}
                  >
                    <p className="text-xs uppercase tracking-widest text-neutral-500">
                      Short-term
                    </p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(results.shortTerm.totalTax, 0)}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatPercent(results.shortTerm.effectiveRate, 1)}{" "}
                      effective
                    </p>
                    <div className="h-px bg-neutral-800" />
                    <div className="text-xs text-neutral-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Federal</span>
                        <span>{formatPercent(results.shortTerm.federalRate, 1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State</span>
                        <span>
                          {formatPercent(results.shortTerm.stateTaxRate, 1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>NIIT</span>
                        <span>
                          {formatCurrency(results.shortTerm.niitTax, 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={cn(
                      "rounded-xl border p-4 space-y-2",
                      inputs.holdingPeriod === "long"
                        ? "border-emerald-500/40 bg-emerald-500/5"
                        : "border-neutral-800"
                    )}
                  >
                    <p className="text-xs uppercase tracking-widest text-neutral-500">
                      Long-term
                    </p>
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(results.longTerm.totalTax, 0)}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {formatPercent(results.longTerm.effectiveRate, 1)}{" "}
                      effective
                    </p>
                    <div className="h-px bg-neutral-800" />
                    <div className="text-xs text-neutral-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Federal</span>
                        <span>{formatPercent(results.longTerm.federalRate, 1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>State</span>
                        <span>
                          {formatPercent(results.longTerm.stateTaxRate, 1)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>NIIT</span>
                        <span>
                          {formatCurrency(results.longTerm.niitTax, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {results.taxSavingsFromLongTerm > 0 && (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                    <p className="font-semibold text-emerald-200">
                      Long-term saves you{" "}
                      {formatCurrency(results.taxSavingsFromLongTerm, 0)}
                    </p>
                    <p className="text-xs text-emerald-100/70 mt-1">
                      That&apos;s{" "}
                      {formatPercent(
                        results.taxSavingsFromLongTerm /
                          (results.shortTerm.totalTax || 1),
                        0
                      )}{" "}
                      less in total taxes compared to selling short-term.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendation */}
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Recommendation
              </h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {results.recommendation}
              </p>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Tax breakdown table */}
      {hasGain && (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Full tax breakdown
              </h2>
              <div className="overflow-hidden rounded-xl border border-neutral-800">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-950 text-neutral-400">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">
                        Tax component
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Short-term
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Long-term
                      </th>
                      <th className="px-4 py-3 text-right font-medium">
                        Savings
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    <tr>
                      <td className="px-4 py-3 text-neutral-300">
                        Federal tax
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatCurrency(results.shortTerm.federalTax, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatCurrency(results.longTerm.federalTax, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-300">
                        {formatCurrency(
                          results.shortTerm.federalTax -
                            results.longTerm.federalTax,
                          0
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-300">State tax</td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatCurrency(results.shortTerm.stateTax, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatCurrency(results.longTerm.stateTax, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-400">
                        {formatCurrency(
                          results.shortTerm.stateTax -
                            results.longTerm.stateTax,
                          0
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-300">
                        NIIT (3.8%)
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatCurrency(results.shortTerm.niitTax, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatCurrency(results.longTerm.niitTax, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-400">
                        {formatCurrency(
                          results.shortTerm.niitTax - results.longTerm.niitTax,
                          0
                        )}
                      </td>
                    </tr>
                    <tr className="bg-neutral-950">
                      <td className="px-4 py-3 font-semibold text-white">
                        Total tax
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white">
                        {formatCurrency(results.shortTerm.totalTax, 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white">
                        {formatCurrency(results.longTerm.totalTax, 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-300">
                        {formatCurrency(results.taxSavingsFromLongTerm, 0)}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-300">
                        Effective rate
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatPercent(results.shortTerm.effectiveRate, 1)}
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatPercent(results.longTerm.effectiveRate, 1)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-300">
                        {formatPercent(
                          results.shortTerm.effectiveRate -
                            results.longTerm.effectiveRate,
                          1
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-300">
                        Net proceeds
                      </td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatCurrency(results.shortTerm.netProceeds, 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-200">
                        {formatCurrency(results.longTerm.netProceeds, 0)}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-300">
                        +
                        {formatCurrency(
                          results.longTerm.netProceeds -
                            results.shortTerm.netProceeds,
                          0
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <MethodologySection title="Capital gains tax education">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Short-term vs. long-term capital gains
                </h3>
                <p>
                  The IRS treats gains on assets held for one year or less as
                  ordinary income (short-term), taxed at your marginal federal
                  rate of 10% to 37%. Assets held for longer than one year
                  qualify for preferential long-term rates of 0%, 15%, or 20%
                  depending on your taxable income and filing status.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Net Investment Income Tax (NIIT)
                </h3>
                <p>
                  An additional 3.8% surtax applies to investment income when
                  your adjusted gross income exceeds $200,000 (single) or
                  $250,000 (married filing jointly). This applies to both short
                  and long-term gains. The NIIT is calculated on the lesser of
                  your net investment income or the amount your AGI exceeds the
                  threshold.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  State capital gains taxes
                </h3>
                <p>
                  Most states tax capital gains as ordinary income. A few states
                  like Florida, Texas, Nevada, and Washington have no state
                  income tax. California taxes capital gains at the highest rate
                  in the country (13.3%). This calculator uses the top marginal
                  state rate as a simplified estimate.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Tax-loss harvesting
                </h3>
                <p>
                  If you have investments with unrealized losses, you can sell
                  them to offset capital gains and reduce your tax bill. You can
                  deduct up to $3,000 in net capital losses against ordinary
                  income each year, with excess losses carried forward.
                </p>
              </div>
              <p className="text-xs text-neutral-500">
                This tool provides estimates only and does not replace
                professional tax advice. Tax brackets and thresholds are based
                on 2024/2025 figures.
              </p>
            </div>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
