"use client";

import { useEffect, useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { AppShell, MethodologySection, ComparisonCard } from "@/components/shared";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { useMemoryWriteBack } from "@/hooks/useMemoryWriteBack";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import {
  formatCurrency,
  formatPercent,
  formatWithSign,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/tax-bracket-optimizer/calculations";
import type {
  BracketVisualization,
  CalculatorInputs,
  ThresholdAnalysis,
} from "@/lib/calculators/tax-bracket-optimizer/types";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  filingStatus: "single",
  income: {
    wagesIncome: 200000,
    selfEmploymentIncome: 0,
    shortTermCapitalGains: 0,
    longTermCapitalGains: 0,
    qualifiedDividends: 5000,
    ordinaryDividends: 1000,
    interestIncome: 2000,
    rentalIncome: 0,
    otherOrdinaryIncome: 0,
  },
  deductions: {
    deductionType: "standard",
    stateLocalTaxes: 10000,
    mortgageInterest: 0,
    charitableGiving: 0,
    otherItemized: 0,
    retirement401k: 23000,
    traditionalIRA: 0,
    hsaContribution: 0,
  },
  scenario: {
    rothConversionAmount: 0,
    additionalIncome: 0,
    additionalDeduction: 0,
  },
};

const filingStatusOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "head_of_household", label: "Head of Household" },
] as const;

const deductionTypeOptions = [
  { value: "standard", label: "Standard Deduction" },
  { value: "itemized", label: "Itemized Deductions" },
] as const;

function formatRange(min: number, max: number) {
  if (!Number.isFinite(max)) {
    return `${formatCurrency(min)}+`;
  }
  return `${formatCurrency(min)} - ${formatCurrency(max)}`;
}

function BracketBar({
  visualization,
  accentClass,
}: {
  visualization: BracketVisualization;
  accentClass: string;
}) {
  const finiteMax = Math.max(
    ...visualization.brackets
      .filter((bracket) => Number.isFinite(bracket.max))
      .map((bracket) => bracket.max)
  );
  const chartMax = Math.max(finiteMax, visualization.yourPosition) * 1.05;
  const markerPosition =
    chartMax > 0
      ? Math.min(100, Math.max(0, (visualization.yourPosition / chartMax) * 100))
      : 0;

  return (
    <div className="relative">
      <div className="flex h-3 overflow-hidden rounded-full bg-neutral-800">
        {visualization.brackets.map((bracket) => {
          const bracketMax = Number.isFinite(bracket.max)
            ? Math.min(bracket.max, chartMax)
            : chartMax;
          const bracketMin = Math.min(bracket.min, chartMax);
          const width = Math.max(0, bracketMax - bracketMin);
          if (width <= 0 || chartMax <= 0) return null;
          const widthPercent = (width / chartMax) * 100;
          const isActive =
            visualization.yourPosition >= bracket.min &&
            (visualization.yourPosition < bracket.max ||
              bracket.max === Infinity);

          return (
            <div
              key={`${bracket.min}-${bracket.rate}`}
              className={cn(
                "transition-all",
                isActive ? accentClass : "bg-teal-500/20"
              )}
              style={{ width: `${widthPercent}%` }}
            />
          );
        })}
      </div>
      <div
        className="absolute -top-1 h-5 w-0.5 bg-white"
        style={{ left: `${markerPosition}%` }}
      />
    </div>
  );
}

function ThresholdRow({ threshold }: { threshold: ThresholdAnalysis }) {
  const isOver = threshold.isOver;
  const distance = Math.abs(threshold.yourDistance);
  const isClose = !isOver && distance < 10000;
  const statusClass = isOver
    ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
    : isClose
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 flex flex-col gap-2",
        statusClass
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{threshold.threshold}</p>
          <p className="text-xs text-neutral-400">{threshold.impact}</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide">
          {isOver ? "Over" : isClose ? "Close" : "Below"}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-neutral-300">
          Threshold: {formatCurrency(threshold.amount)}
        </span>
        <span className="font-semibold">
          {isOver
            ? `${formatCurrency(distance)} over`
            : `${formatCurrency(distance)} under`}
        </span>
      </div>
    </div>
  );
}

export function Calculator() {
  const { defaults: memoryDefaults, preFilledFields, isLoaded: memoryLoaded } = useMemoryPreFill<CalculatorInputs>({
    filingStatus: ["filing_status", (v: unknown) => {
      const s = String(v);
      if (s === "married_filing_jointly") return "married";
      if (s === "head_of_household") return "head_of_household";
      return "single";
    }],
    "income.wagesIncome": "annual_income",
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  useEffect(() => {
    if (memoryLoaded && Object.keys(memoryDefaults).length > 0) {
      setInputs(prev => ({
        ...prev,
        ...(memoryDefaults.filingStatus != null ? { filingStatus: memoryDefaults.filingStatus } : {}),
        income: {
          ...prev.income,
          ...((memoryDefaults as Record<string, unknown>).income as Record<string, unknown> ?? {}),
        },
      }));
    }
  }, [memoryLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => calculate(inputs), [inputs]);

  const writeBack = useMemoryWriteBack();

  const updateIncome = <K extends keyof CalculatorInputs["income"]>(
    key: K,
    value: number
  ) => {
    setInputs((prev) => ({
      ...prev,
      income: {
        ...prev.income,
        [key]: value,
      },
    }));
  };

  const updateDeductions = <K extends keyof CalculatorInputs["deductions"]>(
    key: K,
    value: CalculatorInputs["deductions"][K]
  ) => {
    setInputs((prev) => ({
      ...prev,
      deductions: {
        ...prev.deductions,
        [key]: value,
      },
    }));
  };

  const updateScenario = <K extends keyof CalculatorInputs["scenario"]>(
    key: K,
    value: number
  ) => {
    setInputs((prev) => ({
      ...prev,
      scenario: {
        ...prev.scenario,
        [key]: value,
      },
    }));
  };

  const showItemized = inputs.deductions.deductionType === "itemized";
  const roomInBracket = results.ordinaryBrackets.roomInCurrentBracket;
  const nextBracketStart = results.ordinaryBrackets.nextBracketStarts;
  const bracketRoomLabel =
    roomInBracket > 0
      ? `${formatCurrency(roomInBracket)} of headroom`
      : "Top bracket";

  const scenarioWinner =
    results.modifiedScenario.totalTax < results.baselineScenario.totalTax
      ? "right"
      : results.modifiedScenario.totalTax > results.baselineScenario.totalTax
        ? "left"
        : "tie";

  const zeroBracketMax = results.capitalGainsBrackets.brackets[0]?.max ?? 0;
  const capGainsZeroRoom = Math.max(
    0,
    zeroBracketMax - results.capitalGainsAnalysis.ordinaryIncome
  );

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950 text-white">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-300">
              Tax Planning Toolkit
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Tax Bracket Optimizer
            </h1>
            <p className="text-lg text-neutral-400">
              Visualize how every dollar lands in the federal brackets and map
              smarter moves around NIIT, IRMAA, and capital gains thresholds.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <div className="space-y-6">
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Income</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Add your major income sources to see how they stack into the
                    brackets.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-neutral-300">
                    Filing Status
                  </label>
                  <select
                    value={inputs.filingStatus}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        filingStatus: event.target.value as CalculatorInputs["filingStatus"],
                      }))
                    }
                    className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white"
                  >
                    {filingStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {preFilledFields.has("filingStatus") && (
                    <div className="-mt-4 mb-2 ml-1">
                      <MemoryBadge field="filingStatus" preFilledFields={preFilledFields} />
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                    Earned Income
                  </h3>
                  <SliderInput
                    label="W-2 Wages"
                    value={inputs.income.wagesIncome}
                    onChange={(value) => updateIncome("wagesIncome", value)}
                    min={0}
                    max={5000000}
                    step={5000}
                    format="currency"
                  />
                  {preFilledFields.has("income.wagesIncome") && (
                    <div className="-mt-4 mb-2 ml-1">
                      <MemoryBadge field="income.wagesIncome" preFilledFields={preFilledFields} />
                    </div>
                  )}
                  <SliderInput
                    label="Self-Employment Income"
                    value={inputs.income.selfEmploymentIncome}
                    onChange={(value) => updateIncome("selfEmploymentIncome", value)}
                    min={0}
                    max={2000000}
                    step={5000}
                    format="currency"
                  />
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                    Investments
                  </h3>
                  <SliderInput
                    label="Short-Term Capital Gains"
                    value={inputs.income.shortTermCapitalGains}
                    onChange={(value) => updateIncome("shortTermCapitalGains", value)}
                    min={-500000}
                    max={2000000}
                    step={1000}
                    format="currency"
                  />
                  <SliderInput
                    label="Long-Term Capital Gains"
                    value={inputs.income.longTermCapitalGains}
                    onChange={(value) => updateIncome("longTermCapitalGains", value)}
                    min={-500000}
                    max={2000000}
                    step={1000}
                    format="currency"
                  />
                  <SliderInput
                    label="Qualified Dividends"
                    value={inputs.income.qualifiedDividends}
                    onChange={(value) => updateIncome("qualifiedDividends", value)}
                    min={0}
                    max={500000}
                    step={1000}
                    format="currency"
                  />
                  <SliderInput
                    label="Ordinary Dividends"
                    value={inputs.income.ordinaryDividends}
                    onChange={(value) => updateIncome("ordinaryDividends", value)}
                    min={0}
                    max={500000}
                    step={1000}
                    format="currency"
                  />
                  <SliderInput
                    label="Interest Income"
                    value={inputs.income.interestIncome}
                    onChange={(value) => updateIncome("interestIncome", value)}
                    min={0}
                    max={500000}
                    step={1000}
                    format="currency"
                  />
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                    Other Income
                  </h3>
                  <SliderInput
                    label="Rental Income (Net)"
                    value={inputs.income.rentalIncome}
                    onChange={(value) => updateIncome("rentalIncome", value)}
                    min={-100000}
                    max={500000}
                    step={1000}
                    format="currency"
                  />
                  <SliderInput
                    label="Other Ordinary Income"
                    value={inputs.income.otherOrdinaryIncome}
                    onChange={(value) => updateIncome("otherOrdinaryIncome", value)}
                    min={0}
                    max={1000000}
                    step={1000}
                    format="currency"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Deductions</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Toggle between standard and itemized deductions, plus
                    pre-tax contributions.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {deductionTypeOptions.map((option) => {
                    const isActive = inputs.deductions.deductionType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateDeductions("deductionType", option.value)}
                        className={cn(
                          "rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide border transition-colors",
                          isActive
                            ? "border-teal-400 bg-teal-500/20 text-teal-200"
                            : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-white"
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-5">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                    Pre-tax contributions
                  </h3>
                  <SliderInput
                    label="401(k) Contributions"
                    value={inputs.deductions.retirement401k}
                    onChange={(value) => updateDeductions("retirement401k", value)}
                    min={0}
                    max={30500}
                    step={500}
                    format="currency"
                  />
                  <SliderInput
                    label="Traditional IRA Contribution"
                    value={inputs.deductions.traditionalIRA}
                    onChange={(value) => updateDeductions("traditionalIRA", value)}
                    min={0}
                    max={8000}
                    step={500}
                    format="currency"
                  />
                  <SliderInput
                    label="HSA Contribution"
                    value={inputs.deductions.hsaContribution}
                    onChange={(value) => updateDeductions("hsaContribution", value)}
                    min={0}
                    max={8300}
                    step={100}
                    format="currency"
                  />
                </div>

                {showItemized && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">
                      Itemized breakdown
                    </h3>
                    <SliderInput
                      label="State & Local Taxes"
                      value={inputs.deductions.stateLocalTaxes}
                      onChange={(value) => updateDeductions("stateLocalTaxes", value)}
                      min={0}
                      max={50000}
                      step={1000}
                      format="currency"
                      description="Capped at $10K for federal SALT."
                    />
                    <SliderInput
                      label="Mortgage Interest"
                      value={inputs.deductions.mortgageInterest}
                      onChange={(value) => updateDeductions("mortgageInterest", value)}
                      min={0}
                      max={100000}
                      step={1000}
                      format="currency"
                    />
                    <SliderInput
                      label="Charitable Contributions"
                      value={inputs.deductions.charitableGiving}
                      onChange={(value) => updateDeductions("charitableGiving", value)}
                      min={0}
                      max={500000}
                      step={1000}
                      format="currency"
                    />
                    <SliderInput
                      label="Other Itemized Deductions"
                      value={inputs.deductions.otherItemized}
                      onChange={(value) => updateDeductions("otherItemized", value)}
                      min={0}
                      max={100000}
                      step={1000}
                      format="currency"
                    />
                  </div>
                )}
              </div>

              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Scenario Modeler</h2>
                  <p className="text-sm text-neutral-400 mt-1">
                    Model a Roth conversion, extra income, or a deduction boost to
                    see the impact.
                  </p>
                </div>

                <SliderInput
                  label="Roth Conversion Amount"
                  value={inputs.scenario.rothConversionAmount}
                  onChange={(value) => updateScenario("rothConversionAmount", value)}
                  min={0}
                  max={500000}
                  step={5000}
                  format="currency"
                />
                <SliderInput
                  label="Additional Income (what-if)"
                  value={inputs.scenario.additionalIncome}
                  onChange={(value) => updateScenario("additionalIncome", value)}
                  min={0}
                  max={1000000}
                  step={5000}
                  format="currency"
                />
                <SliderInput
                  label="Additional Deduction (what-if)"
                  value={inputs.scenario.additionalDeduction}
                  onChange={(value) => updateScenario("additionalDeduction", value)}
                  min={0}
                  max={200000}
                  step={1000}
                  format="currency"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-teal-500/40 bg-gradient-to-br from-teal-500/10 via-neutral-900 to-neutral-900 p-6 space-y-6">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-teal-200">
                    The Big Picture
                  </p>
                  <h2 className="text-3xl font-bold text-white mt-2">
                    {formatCurrency(results.totalFederalTax)}
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Estimated total federal tax liability.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="rounded-xl bg-neutral-900/70 border border-neutral-800 p-4">
                    <p className="text-xs uppercase tracking-widest text-neutral-500">
                      Effective Rate
                    </p>
                    <p className="text-2xl font-semibold text-teal-200">
                      {formatPercent(results.effectiveRate, 1)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Total tax divided by total income.
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-900/70 border border-neutral-800 p-4">
                    <p className="text-xs uppercase tracking-widest text-neutral-500">
                      Marginal Ordinary Rate
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {formatPercent(results.marginalOrdinaryRate, 0)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Rate on your next ordinary income dollar.
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-900/70 border border-neutral-800 p-4">
                    <p className="text-xs uppercase tracking-widest text-neutral-500">
                      Marginal Capital Gains Rate
                    </p>
                    <p className="text-2xl font-semibold text-white">
                      {formatPercent(results.marginalCapGainsRate, 1)}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Includes NIIT if applicable.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-neutral-900/70 border border-neutral-800 p-3">
                    <p className="text-xs text-neutral-500">Gross Income</p>
                    <p className="text-base font-semibold text-white">
                      {formatCurrency(results.grossIncome)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-900/70 border border-neutral-800 p-3">
                    <p className="text-xs text-neutral-500">Taxable Income</p>
                    <p className="text-base font-semibold text-white">
                      {formatCurrency(results.taxableIncome)}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-neutral-900/70 border border-neutral-800 p-4 text-sm text-neutral-400">
                  Ordinary tax: {formatCurrency(results.ordinaryIncomeTax)} ·
                  Capital gains tax: {formatCurrency(results.capitalGainsTax)} ·
                  NIIT: {formatCurrency(results.niitTax)} · Self-employment tax:
                  {" "}
                  {formatCurrency(results.selfEmploymentTax)}
                </div>
              </div>

              <ComparisonCard
                title="Scenario Comparison"
                leftTitle="Baseline"
                leftValue={formatCurrency(results.baselineScenario.totalTax)}
                rightTitle="With Scenario"
                rightValue={formatCurrency(results.modifiedScenario.totalTax)}
                winner={scenarioWinner}
                leftItems={[
                  {
                    label: "Taxable income",
                    value: formatCurrency(results.baselineScenario.taxableIncome),
                  },
                  {
                    label: "Effective rate",
                    value: formatPercent(results.baselineScenario.effectiveRate, 1),
                  },
                ]}
                rightItems={[
                  {
                    label: "Taxable income",
                    value: formatCurrency(results.modifiedScenario.taxableIncome),
                  },
                  {
                    label: "Effective rate",
                    value: formatPercent(results.modifiedScenario.effectiveRate, 1),
                  },
                  {
                    label: "Difference",
                    value: formatWithSign(results.modifiedScenario.difference, formatCurrency),
                    highlight: results.modifiedScenario.difference < 0,
                  },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Ordinary Income Brackets
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  See how your ordinary income stacks through the federal
                  brackets.
                </p>
              </div>

              <BracketBar
                visualization={results.ordinaryBrackets}
                accentClass="bg-teal-400"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-neutral-800/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Room in current bracket
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {bracketRoomLabel}
                  </p>
                </div>
                <div className="rounded-xl bg-neutral-800/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Next bracket begins
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {nextBracketStart > 0
                      ? formatCurrency(nextBracketStart)
                      : "Top bracket"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {results.ordinaryBrackets.brackets.map((bracket) => (
                  <div
                    key={`ordinary-${bracket.min}`}
                    className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">
                        {formatRange(bracket.min, bracket.max)}
                      </span>
                      <span className="font-semibold text-white">
                        {formatPercent(bracket.rate, 0)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-neutral-800 overflow-hidden">
                      <div
                        className="h-full bg-teal-400/70"
                        style={{
                          width: `${
                            bracket.max === bracket.min
                              ? 0
                              : Math.min(
                                  100,
                                  (bracket.yourIncomeInBracket /
                                    (bracket.max === Infinity
                                      ? bracket.yourIncomeInBracket || 1
                                      : bracket.max - bracket.min)) *
                                    100
                                )
                          }%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      {formatCurrency(bracket.yourTaxInBracket)} paid in this
                      bracket.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Capital Gains Analysis
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Long-term gains and qualified dividends stack on top of ordinary
                  income.
                </p>
              </div>

              <BracketBar
                visualization={results.capitalGainsBrackets}
                accentClass="bg-sky-400"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-neutral-800/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Qualified Income
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(results.capitalGainsAnalysis.qualifiedIncome)}
                  </p>
                </div>
                <div className="rounded-xl bg-neutral-800/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Capital gains rate
                  </p>
                  <p className="text-lg font-semibold text-white">
                    {formatPercent(results.capitalGainsAnalysis.capitalGainsRate, 0)}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-sm text-neutral-300 space-y-2">
                <div className="flex justify-between">
                  <span>Capital gains tax</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(results.capitalGainsTax)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>NIIT applied</span>
                  <span className="font-semibold text-white">
                    {results.capitalGainsAnalysis.niitApplies ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>NIIT amount</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(results.capitalGainsAnalysis.niitAmount)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4 text-sm text-sky-100">
                <p className="font-semibold">0% bracket opportunity</p>
                <p className="text-xs text-sky-100/80 mt-1">
                  You can realize about {formatCurrency(Math.max(0, capGainsZeroRoom))} in long-term
                  gains before leaving the 0% capital gains bracket.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Threshold Tracker</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Monitor cliff zones where marginal rates spike (NIIT, IRMAA, and
                  high tax brackets).
                </p>
              </div>

              <div className="space-y-3">
                {results.thresholds.map((threshold) => (
                  <ThresholdRow key={threshold.threshold} threshold={threshold} />
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Optimization Opportunities
                </h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Actionable moves based on your inputs and bracket positioning.
                </p>
              </div>

              {results.opportunities.length === 0 ? (
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm text-neutral-400">
                  No obvious optimization moves right now. Try adjusting your
                  scenario inputs to see new opportunities.
                </div>
              ) : (
                <div className="space-y-4">
                  {results.opportunities.map((opportunity) => (
                    <div
                      key={opportunity.strategy}
                      className="rounded-xl border border-teal-500/20 bg-neutral-900/60 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {opportunity.strategy}
                          </p>
                          <p className="text-xs text-neutral-400 mt-1">
                            {opportunity.description}
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-teal-200 bg-teal-500/20 px-2 py-1 rounded-full">
                          Save ~{formatCurrency(opportunity.potentialSavings)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 mt-3">
                        Next step: {opportunity.action}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-6xl">
            <MethodologySection title="How we calculate this">
              <div className="space-y-3 text-sm">
                <p>
                  We compute ordinary taxable income after above-the-line
                  deductions and the larger of standard or itemized deductions.
                  Ordinary brackets are applied to that portion, while long-term
                  capital gains and qualified dividends stack on top to determine
                  their rate.
                </p>
                <p>
                  Effective tax rate is total federal tax divided by total gross
                  income. Marginal rates show the tax on your next dollar of
                  ordinary income or capital gains, including NIIT where
                  applicable.
                </p>
                <p>
                  Threshold tracking highlights NIIT and IRMAA cliff zones plus
                  higher ordinary brackets. Scenario modeling compares a baseline
                  case with your what-if inputs applied.
                </p>
                <p className="text-xs text-neutral-500">
                  This tool provides estimates only and does not replace
                  professional tax advice.
                </p>
              </div>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
