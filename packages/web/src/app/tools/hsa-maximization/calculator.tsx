"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { SliderInput } from "@/components/shared/SliderInput";
import { ComparisonCard, ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCurrency,
  formatYears,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/hsa-maximization/calculations";
import type { CalculatorInputs } from "@/lib/calculators/hsa-maximization/types";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";

const DEFAULT_INPUTS: CalculatorInputs = {
  eligibility: {
    hasHDHP: true,
    coverageType: "individual",
    age: 35,
    enrolledInMedicare: false,
    monthsOfCoverage: 12, // Full year coverage by default
  },
  contribution: {
    currentContribution: 3000,
    employerContribution: 500,
    currentHSABalance: 5000,
  },
  investment: {
    expectedReturn: 7,
    yearsToRetirement: 30,
    yearsInRetirement: 25,
  },
  tax: {
    marginalTaxRate: 32,
    retirementTaxRate: 24,
    stateCode: "CA",
  },
  medical: {
    annualMedicalExpenses: 2000,
    retirementMedicalExpenses: 10000,
  },
};

const STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
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
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "District of Columbia" },
];

const ACCOUNT_COMPARISONS = [
  {
    account: "Traditional 401(k)/IRA",
    deductible: true,
    growth: true,
    withdrawals: false,
  },
  {
    account: "Roth 401(k)/IRA",
    deductible: false,
    growth: true,
    withdrawals: true,
  },
  {
    account: "Taxable Brokerage",
    deductible: false,
    growth: false,
    withdrawals: false,
  },
  {
    account: "HSA (Health Savings Account)",
    deductible: true,
    growth: true,
    withdrawals: true,
  },
];

function ToggleButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors border ${
        active
          ? "border-cyan-400 bg-cyan-500/20 text-cyan-200"
          : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("hsa-maximization");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    "eligibility.age": "age",
    "tax.marginalTaxRate": [
      "federal_tax_rate",
      (value: unknown) => (typeof value === "number" ? value * 100 : null),
    ],
    "tax.stateCode": [
      "state",
      (value: unknown) => {
        const state = typeof value === "string" ? value : null;
        return STATES.some((option) => option.code === state) ? state : null;
      },
    ],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(() =>
    mergeDeep(DEFAULT_INPUTS, preset ?? undefined)
  );
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );


  useEffect(() => {
    if (!preset) return;
    setInputs((prev) => mergeDeep(prev, preset));
  }, [preset]);

  const results = useMemo(() => calculate(inputs), [inputs]);

  const projectionData = results.projections.map((projection) => ({
    year: projection.year,
    age: projection.age,
    balance: projection.yearEndBalance,
    contributions: projection.cumulativeContributions + inputs.contribution.currentHSABalance,
  }));

  const retirementYear = results.projections[results.projections.length - 1]?.year ?? 0;

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Triple-tax advantage
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            HSA Maximization Tool
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            The only triple-tax-advantaged account—use it as a stealth retirement
            vehicle, not just a healthcare spending account.
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
          <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
            <div className="space-y-6">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Eligibility checker</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Confirm you qualify for HSA contributions and see your 2025 limit.
              </p>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    High Deductible Health Plan (HDHP)
                  </p>
                  <div className="mt-3 flex gap-3">
                    <ToggleButton
                      active={inputs.eligibility.hasHDHP}
                      label="Yes, I have an HDHP"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          eligibility: { ...prev.eligibility, hasHDHP: true },
                        }))
                      }
                    />
                    <ToggleButton
                      active={!inputs.eligibility.hasHDHP}
                      label="No"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          eligibility: { ...prev.eligibility, hasHDHP: false },
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Enrolled in Medicare
                  </p>
                  <div className="mt-3 flex gap-3">
                    <ToggleButton
                      active={!inputs.eligibility.enrolledInMedicare}
                      label="No"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          eligibility: { ...prev.eligibility, enrolledInMedicare: false },
                        }))
                      }
                    />
                    <ToggleButton
                      active={inputs.eligibility.enrolledInMedicare}
                      label="Yes"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          eligibility: { ...prev.eligibility, enrolledInMedicare: true },
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Coverage type
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <ToggleButton
                      active={inputs.eligibility.coverageType === "individual"}
                      label="Individual"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          eligibility: { ...prev.eligibility, coverageType: "individual" },
                        }))
                      }
                    />
                    <ToggleButton
                      active={inputs.eligibility.coverageType === "family"}
                      label="Family"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          eligibility: { ...prev.eligibility, coverageType: "family" },
                        }))
                      }
                    />
                  </div>
                </div>

                <SliderInput
                  label="Your Age"
                  value={inputs.eligibility.age}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      eligibility: { ...prev.eligibility, age: value },
                    }))
                  }
                  min={18}
                  max={100}
                  step={1}
                  format="number"
                />

                <SliderInput
                  label="Months of HDHP Coverage This Year"
                  value={inputs.eligibility.monthsOfCoverage}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      eligibility: { ...prev.eligibility, monthsOfCoverage: value },
                    }))
                  }
                  min={1}
                  max={12}
                  step={1}
                  format="number"
                />
              </div>

              <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Eligibility status</p>
                    <p className="text-xs text-neutral-400">
                      {results.eligibility.isEligible
                        ? "You can contribute to an HSA in 2025."
                        : "You are not eligible to contribute right now."}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      results.eligibility.isEligible
                        ? "bg-cyan-500/20 text-cyan-300"
                        : "bg-rose-500/20 text-rose-300"
                    }`}
                  >
                    {results.eligibility.isEligible ? "Eligible" : "Not eligible"}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      2025 Limit
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatCurrency(results.eligibility.maxContribution)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Prorated Limit
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatCurrency(results.eligibility.proratedMaxContribution)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Catch-up amount
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatCurrency(results.eligibility.catchUpAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Remaining room
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatCurrency(results.eligibility.remainingContributionRoom)}
                    </p>
                  </div>
                </div>

                {results.eligibility.reasons.length > 0 && (
                  <ul className="mt-4 space-y-2 text-xs text-neutral-400">
                    {results.eligibility.reasons.map((reason) => (
                      <li key={reason} className="flex gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Contribution inputs</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Enter what you contribute today, including any employer funding.
              </p>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Current Annual Contribution"
                  value={inputs.contribution.currentContribution}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      contribution: { ...prev.contribution, currentContribution: value },
                    }))
                  }
                  min={0}
                  max={10000}
                  step={100}
                  format="currency"
                />
                <SliderInput
                  label="Employer HSA Contribution"
                  value={inputs.contribution.employerContribution}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      contribution: { ...prev.contribution, employerContribution: value },
                    }))
                  }
                  min={0}
                  max={5000}
                  step={100}
                  format="currency"
                />
                <SliderInput
                  label="Current HSA Balance"
                  value={inputs.contribution.currentHSABalance}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      contribution: { ...prev.contribution, currentHSABalance: value },
                    }))
                  }
                  min={0}
                  max={500000}
                  step={1000}
                  format="currency"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Investment assumptions</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Estimate your long-term HSA growth if you invest the balance.
              </p>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Expected Annual Return"
                  value={inputs.investment.expectedReturn}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      investment: { ...prev.investment, expectedReturn: value },
                    }))
                  }
                  min={0}
                  max={15}
                  step={0.5}
                  format="percent"
                />
                <SliderInput
                  label="Years Until Retirement"
                  value={inputs.investment.yearsToRetirement}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      investment: { ...prev.investment, yearsToRetirement: value },
                    }))
                  }
                  min={1}
                  max={50}
                  step={1}
                  format="number"
                />
                <SliderInput
                  label="Years in Retirement"
                  value={inputs.investment.yearsInRetirement}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      investment: { ...prev.investment, yearsInRetirement: value },
                    }))
                  }
                  min={10}
                  max={40}
                  step={1}
                  format="number"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Tax information</h2>
              <p className="mt-2 text-sm text-neutral-400">
                HSA savings are based on your marginal tax rates and payroll tax savings.
              </p>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Current Marginal Tax Rate"
                  value={inputs.tax.marginalTaxRate}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      tax: { ...prev.tax, marginalTaxRate: value },
                    }))
                  }
                  min={10}
                  max={40}
                  step={1}
                  format="percent"
                />
                <SliderInput
                  label="Expected Retirement Tax Rate"
                  value={inputs.tax.retirementTaxRate}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      tax: { ...prev.tax, retirementTaxRate: value },
                    }))
                  }
                  min={10}
                  max={40}
                  step={1}
                  format="percent"
                />
                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    State
                  </label>
                  <select
                    value={inputs.tax.stateCode}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        tax: { ...prev.tax, stateCode: event.target.value },
                      }))
                    }
                    className="mt-3 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                  >
                    {STATES.map((state) => (
                      <option key={state.code} value={state.code}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Medical spending</h2>
              <p className="mt-2 text-sm text-neutral-400">
                The HSA hack works best when you cover current expenses out of pocket.
              </p>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Current Annual Medical Expenses"
                  value={inputs.medical.annualMedicalExpenses}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      medical: { ...prev.medical, annualMedicalExpenses: value },
                    }))
                  }
                  min={0}
                  max={50000}
                  step={500}
                  format="currency"
                />
                <SliderInput
                  label="Expected Annual Retirement Medical"
                  value={inputs.medical.retirementMedicalExpenses}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      medical: { ...prev.medical, retirementMedicalExpenses: value },
                    }))
                  }
                  min={0}
                  max={100000}
                  step={1000}
                  format="currency"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ResultCard
              title="Tax savings summary"
              primaryValue={formatCurrency(results.taxSavings.totalAnnualTaxSaved)}
              primaryLabel="Estimated annual tax savings"
              items={[
                {
                  label: "Federal tax savings",
                  value: formatCurrency(results.taxSavings.federalTaxSaved),
                },
                {
                  label: "State tax savings",
                  value: formatCurrency(results.taxSavings.stateTaxSaved),
                },
                {
                  label: "FICA tax savings",
                  value: formatCurrency(results.taxSavings.ficaTaxSaved),
                },
                {
                  label: "Lifetime tax advantage",
                  value: formatCurrency(results.taxSavings.totalLifetimeTaxAdvantage),
                  highlight: true,
                },
              ]}
              variant="blue"
            />

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">The triple tax advantage</h2>
              <p className="mt-2 text-sm text-neutral-400">
                HSAs are the only account that is deductible, grows tax-free, and can be
                withdrawn tax-free for qualified medical expenses.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  {
                    title: "Tax-deductible",
                    description: "Contributions reduce taxable income today.",
                  },
                  {
                    title: "Tax-free growth",
                    description: "Investments compound without annual taxes.",
                  },
                  {
                    title: "Tax-free withdrawals",
                    description: "Qualified medical expenses stay untaxed forever.",
                  },
                ].map((card) => (
                  <div
                    key={card.title}
                    className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4 text-sm"
                  >
                    <p className="font-semibold text-cyan-200">{card.title}</p>
                    <p className="mt-2 text-neutral-200/80">{card.description}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 overflow-hidden rounded-xl border border-neutral-800">
                <div className="grid grid-cols-4 bg-neutral-950 text-xs uppercase tracking-[0.2em] text-neutral-500">
                  <div className="px-4 py-2">Account type</div>
                  <div className="px-4 py-2 text-center">Deductible</div>
                  <div className="px-4 py-2 text-center">Tax-free growth</div>
                  <div className="px-4 py-2 text-center">Tax-free withdrawals</div>
                </div>
                {ACCOUNT_COMPARISONS.map((row) => (
                  <div
                    key={row.account}
                    className="grid grid-cols-4 items-center border-t border-neutral-800 text-sm"
                  >
                    <div className="px-4 py-3 text-neutral-200">{row.account}</div>
                    <div className="px-4 py-3 text-center">
                      {row.deductible ? "✅" : "—"}
                    </div>
                    <div className="px-4 py-3 text-center">
                      {row.growth ? "✅" : "—"}
                    </div>
                    <div className="px-4 py-3 text-center">
                      {row.withdrawals ? "✅" : "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ResultCard
              title="Retirement projection"
              primaryValue={formatCurrency(results.retirementBalance)}
              primaryLabel="Projected HSA balance at retirement"
              items={[
                {
                  label: "End-of-life balance",
                  value: formatCurrency(results.endOfLifeBalance),
                },
                {
                  label: "Receipts banked",
                  value: formatCurrency(results.receiptsBanked),
                },
                {
                  label: "Years of medical covered",
                  value: formatYears(results.yearsOfMedicalCovered),
                },
              ]}
              variant="emerald"
            />
          </div>
        </div>
      </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Growth projection</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Track how your HSA balance compounds until retirement.
            </p>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData} margin={{ left: 8, right: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="year"
                    stroke="#9ca3af"
                    tickFormatter={(value) => `Y${value}`}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    tickFormatter={(value) => formatCurrency(value, 0)}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value, 0)}
                    labelFormatter={(label) => `Year ${label}`}
                    contentStyle={{
                      background: "#0f172a",
                      borderRadius: "12px",
                      borderColor: "#1f2937",
                    }}
                  />
                  <ReferenceLine
                    x={retirementYear}
                    stroke="#22d3ee"
                    strokeDasharray="4 4"
                    label={{
                      position: "top",
                      value: "Retirement",
                      fill: "#22d3ee",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={false}
                    name="HSA Balance"
                  />
                  <Line
                    type="monotone"
                    dataKey="contributions"
                    stroke="#a5b4fc"
                    strokeWidth={2}
                    dot={false}
                    name="Total Contributions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">The HSA hack</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Pay current medical bills out of pocket, invest the HSA, and reimburse
                yourself tax-free decades later.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Receipts banked
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatCurrency(results.receiptsBanked)}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    Receipts saved for future reimbursements.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Medical coverable
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatCurrency(results.medicalExpensesCoverable)}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    Potential tax-free withdrawals in retirement.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Years covered
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {formatYears(results.yearsOfMedicalCovered)}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    Years of retirement medical expenses covered.
                  </p>
                </div>
              </div>
            </div>

            <ResultCard
              title="HSA advantage"
              primaryValue={formatCurrency(results.comparison.hsaAdvantage)}
              primaryLabel="Estimated advantage vs taxable investing"
              items={[
                {
                  label: "HSA balance",
                  value: formatCurrency(results.comparison.hsaStrategy.finalBalance),
                },
                {
                  label: "Taxable balance",
                  value: formatCurrency(
                    results.comparison.taxableAccountStrategy.finalBalance
                  ),
                },
                {
                  label: "Taxes saved",
                  value: formatCurrency(results.comparison.hsaStrategy.taxesSaved),
                },
              ]}
              variant="blue"
            />
          </div>

          <ComparisonCard
            title="HSA vs taxable account"
            leftTitle="HSA Strategy"
            leftValue={formatCurrency(results.comparison.hsaStrategy.finalBalance)}
            rightTitle="Taxable Strategy"
            rightValue={formatCurrency(results.comparison.taxableAccountStrategy.finalBalance)}
            winner="left"
            leftItems={[
              {
                label: "Total contributions",
                value: formatCurrency(results.comparison.hsaStrategy.totalContributions),
              },
              {
                label: "Total growth",
                value: formatCurrency(results.comparison.hsaStrategy.totalGrowth),
              },
              {
                label: "Taxes saved",
                value: formatCurrency(results.comparison.hsaStrategy.taxesSaved),
              },
            ]}
            rightItems={[
              {
                label: "Total contributions",
                value: formatCurrency(
                  results.comparison.taxableAccountStrategy.totalContributions
                ),
              },
              {
                label: "Total growth",
                value: formatCurrency(results.comparison.taxableAccountStrategy.totalGrowth),
              },
              {
                label: "Taxes paid",
                value: formatCurrency(results.comparison.taxableAccountStrategy.taxesPaid),
              },
            ]}
          />
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Step-by-step strategy</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Follow these steps to maximize the long-term value of your HSA.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {results.steps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-sm font-semibold text-cyan-200">
                      {step.step}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{step.title}</p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {step.description}
                      </p>
                      {step.impact && (
                        <p className="mt-2 text-xs font-semibold text-cyan-200">
                          {step.impact}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <ResultCard
              title="Maximization calculator"
              primaryValue={formatCurrency(Math.max(0, results.additionalIfMaxed))}
              primaryLabel="Additional annual contribution room"
              items={[
                {
                  label: "Potential lifetime benefit",
                  value: formatCurrency(results.maxContributionBenefit),
                  highlight: true,
                },
                {
                  label: "2025 max contribution",
                  value: formatCurrency(results.eligibility.maxContribution),
                },
              ]}
              variant="emerald"
            />
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Recommendations</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Educational insights based on your inputs (not tax advice).
              </p>
              <div className="mt-6 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Recommendations
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-neutral-200">
                    {results.recommendations.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-cyan-400">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {results.warnings.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Warnings
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-rose-200">
                      {results.warnings.map((item) => (
                        <li key={item} className="flex gap-2">
                          <span className="text-rose-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <MethodologySection title="Methodology & rules overview">
            <div className="space-y-4 text-sm text-neutral-400">
              <p>
                This calculator models the 2025 HSA contribution limits ($4,300
                individual / $8,550 family), adds a $1,000 catch-up at age 55, and
                stops contributions at 65 when Medicare eligibility begins.
              </p>
              <p>
                Tax savings include federal, state (where allowed), and employee FICA
                payroll tax savings. Growth is modeled using your expected return and
                assumes you pay current medical expenses out of pocket while saving
                receipts for future tax-free reimbursements.
              </p>
              <p>
                The comparison shows how a taxable account would perform if you invested
                the same pre-tax contribution after taxes, then paid annual tax drag on
                growth. All results are estimates for education only, not tax advice.
              </p>
              <p>
                After age 65, HSA withdrawals for non-medical expenses are treated like
                a traditional IRA (taxable, no penalty). Qualified medical withdrawals
                remain tax-free at any age.
              </p>
            </div>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
