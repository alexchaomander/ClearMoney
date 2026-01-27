"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { MethodologySection, AppShell } from "@/components/shared";
import {
  formatCurrency,
  formatMonthsAsYears,
  formatPercent,
  formatYears,
} from "@/lib/shared/formatters";
import {
  calculate,
  calculateYearsToTarget,
} from "@/lib/calculators/fire-calculator/calculations";
import type {
  CalculatorInputs,
  YearlySnapshot,
} from "@/lib/calculators/fire-calculator/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  annualIncome: 75000,
  annualExpenses: 45000,
  currentSavings: 50000,
  expectedReturn: 7,
  withdrawalRate: 4,
};

const savingsRateTiers = [
  { max: 10, label: "Needs work", color: "text-red-400", bar: "bg-red-500" },
  { max: 25, label: "Building", color: "text-amber-300", bar: "bg-amber-400" },
  { max: 50, label: "Strong", color: "text-green-400", bar: "bg-green-500" },
  { max: 100, label: "Elite", color: "text-amber-200", bar: "bg-amber-300" },
];

function getSavingsTier(rate: number) {
  return savingsRateTiers.find((tier) => rate < tier.max) ?? savingsRateTiers[3];
}

function formatYearsSafe(years: number) {
  if (!Number.isFinite(years)) return "Not reachable";
  return formatYears(Math.max(0, years));
}

interface SavingsRateGaugeProps {
  savingsRate: number;
}

function SavingsRateGauge({ savingsRate }: SavingsRateGaugeProps) {
  const tier = getSavingsTier(savingsRate);
  const clamped = Math.min(100, Math.max(0, savingsRate));

  return (
    <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-neutral-500">
            Savings Rate
          </p>
          <p className={`text-2xl font-bold ${tier.color}`}>
            {formatPercent(savingsRate, 1, true)}
          </p>
        </div>
        <span className={`text-sm font-semibold ${tier.color}`}>
          {tier.label}
        </span>
      </div>
      <div className="h-3 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${tier.bar} transition-all`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="text-xs text-neutral-500">
        The higher your savings rate, the fewer years to financial independence.
      </p>
    </div>
  );
}

interface TimelineChartProps {
  timeline: YearlySnapshot[];
  fireNumber: number;
}

function TimelineChart({ timeline, fireNumber }: TimelineChartProps) {
  const chartData = timeline.slice(0, 20);
  const maxValue = Math.max(
    ...chartData.map((point) => point.totalSavings),
    fireNumber
  );
  const fireLine = maxValue > 0 ? Math.min(100, (fireNumber / maxValue) * 100) : 0;

  return (
    <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Timeline</h3>
        <span className="text-sm text-neutral-400">First 20 years</span>
      </div>
      <div className="relative h-48 flex items-end gap-2">
        {chartData.map((point) => {
          const height = maxValue > 0 ? (point.totalSavings / maxValue) * 100 : 0;
          return (
            <div
              key={point.year}
              className="flex-1 flex flex-col items-center gap-2"
            >
              <div className="w-full h-40 bg-neutral-800 rounded-t-md flex items-end overflow-hidden">
                <div
                  className="w-full bg-amber-400/80"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-[10px] text-neutral-500">{point.year}</span>
            </div>
          );
        })}
        {fireNumber > 0 && fireLine <= 100 && (
          <div
            className="absolute left-0 right-0 border-t border-amber-300/60"
            style={{ bottom: `${fireLine}%` }}
          >
            <span className="absolute right-0 -top-5 text-xs text-amber-200">
              FIRE target
            </span>
          </div>
        )}
      </div>
      <p className="text-xs text-neutral-500">
        Bars show total investment balance, including growth and contributions.
      </p>
    </div>
  );
}

interface FireVariantsCardProps {
  leanFireNumber: number;
  fireNumber: number;
  fatFireNumber: number;
  leanYears: number;
  fireYears: number;
  fatYears: number;
  coastFireNumber: number;
  coastYears: number;
}

function FireVariantsCard({
  leanFireNumber,
  fireNumber,
  fatFireNumber,
  leanYears,
  fireYears,
  fatYears,
  coastFireNumber,
  coastYears,
}: FireVariantsCardProps) {
  const variantRows = [
    {
      label: "Lean FIRE",
      amount: formatCurrency(leanFireNumber),
      years: formatYearsSafe(leanYears),
    },
    {
      label: "Regular FIRE",
      amount: formatCurrency(fireNumber),
      years: formatYearsSafe(fireYears),
    },
    {
      label: "Fat FIRE",
      amount: formatCurrency(fatFireNumber),
      years: formatYearsSafe(fatYears),
    },
  ];

  return (
    <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">FIRE Variants</h3>
      <div className="space-y-3">
        {variantRows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-neutral-300">{row.label}</span>
            <span className="text-neutral-400">
              {row.amount} · {row.years}
            </span>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <p className="text-sm text-amber-100">
          Coast FIRE: Need {formatCurrency(coastFireNumber)} invested today, then
          coast for {formatYearsSafe(coastYears)}.
        </p>
      </div>
    </div>
  );
}

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const returnRate = inputs.expectedReturn / 100;

  const leanYears = useMemo(
    () =>
      calculateYearsToTarget(
        inputs.currentSavings,
        results.annualSavings,
        returnRate,
        results.leanFireNumber
      ),
    [
      inputs.currentSavings,
      results.annualSavings,
      returnRate,
      results.leanFireNumber,
    ]
  );
  const fatYears = useMemo(
    () =>
      calculateYearsToTarget(
        inputs.currentSavings,
        results.annualSavings,
        returnRate,
        results.fatFireNumber
      ),
    [
      inputs.currentSavings,
      results.annualSavings,
      returnRate,
      results.fatFireNumber,
    ]
  );

  const targetSavingsRate = Math.min(100, results.savingsRate + 10);
  const targetAnnualSavings =
    inputs.annualIncome > 0
      ? (targetSavingsRate / 100) * inputs.annualIncome
      : results.annualSavings;
  const improvedYears = calculateYearsToTarget(
    inputs.currentSavings,
    targetAnnualSavings,
    returnRate,
    results.fireNumber
  );
  const yearsSaved =
    Number.isFinite(results.yearsToFI) && Number.isFinite(improvedYears)
      ? results.yearsToFI - improvedYears
      : null;

  const progressPercent = Math.min(100, Math.max(0, results.percentToFI));
  const savingsTier = getSavingsTier(results.savingsRate);
  const timelineRows = results.timeline;
  const runwayLabel = Number.isFinite(results.monthsOfRunway)
    ? formatMonthsAsYears(Math.round(results.monthsOfRunway))
    : "Unlimited";

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              FIRE Calculator
            </h1>
            <p className="text-lg text-neutral-400">
              When can you reach Financial Independence? Let&apos;s find out.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Your Financial Snapshot
              </h2>
              <SliderInput
                label="Annual Income"
                value={inputs.annualIncome}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, annualIncome: value }))
                }
                min={0}
                max={500000}
                step={1000}
                format="currency"
              />
              <SliderInput
                label="Annual Expenses"
                value={inputs.annualExpenses}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, annualExpenses: value }))
                }
                min={0}
                max={300000}
                step={1000}
                format="currency"
              />
              <SliderInput
                label="Current Investments"
                value={inputs.currentSavings}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, currentSavings: value }))
                }
                min={0}
                max={5000000}
                step={5000}
                format="currency"
              />
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800/60 px-4 py-3 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                {showAdvanced ? "Hide" : "Show"} advanced assumptions
              </button>
              {showAdvanced && (
                <div className="space-y-6">
                  <SliderInput
                    label="Expected Return"
                    value={inputs.expectedReturn}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, expectedReturn: value }))
                    }
                    min={0}
                    max={12}
                    step={0.5}
                    format="percent"
                  />
                  <SliderInput
                    label="Safe Withdrawal Rate"
                    value={inputs.withdrawalRate}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, withdrawalRate: value }))
                    }
                    min={3}
                    max={5}
                    step={0.25}
                    format="percent"
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Savings Rate
                </p>
                <p className={`text-3xl font-bold ${savingsTier.color}`}>
                  {formatPercent(results.savingsRate, 1, true)}
                </p>
                <p className="text-xs text-neutral-500">
                  Annual savings: {formatCurrency(results.annualSavings)}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  FIRE Number
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(results.fireNumber)}
                </p>
                <p className="text-xs text-neutral-500">
                  Based on {formatPercent(inputs.withdrawalRate, 2, true)}
                  withdrawal rate
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Years to FI
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatYearsSafe(results.yearsToFI)}
                </p>
                <p className="text-xs text-neutral-500">
                  Expected return: {formatPercent(inputs.expectedReturn, 1, true)}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-3">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Current Progress
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatPercent(progressPercent, 1, true)}
                </p>
                <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-neutral-500">
                  {runwayLabel} of expenses covered
                </p>
              </div>
            </div>

            <SavingsRateGauge savingsRate={results.savingsRate} />

            <TimelineChart
              timeline={timelineRows}
              fireNumber={results.fireNumber}
            />
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <button
                type="button"
                onClick={() => setShowTimeline((prev) => !prev)}
                className="text-sm font-semibold text-amber-200 hover:text-amber-100"
              >
                {showTimeline ? "Hide" : "Show"} detailed year-by-year timeline
              </button>
              {showTimeline && (
                <div className="max-h-72 overflow-auto border border-neutral-800 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-900/80 text-neutral-400">
                      <tr>
                        <th className="px-3 py-2 text-left">Year</th>
                        <th className="px-3 py-2 text-right">Contrib.</th>
                        <th className="px-3 py-2 text-right">Growth</th>
                        <th className="px-3 py-2 text-right">Total</th>
                        <th className="px-3 py-2 text-right">Progress</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timelineRows.map((row) => (
                        <tr
                          key={row.year}
                          className="border-t border-neutral-800 text-neutral-300"
                        >
                          <td className="px-3 py-2">{row.year}</td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(row.contribution)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(row.growth)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(row.totalSavings)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatPercent(row.progress, 1, true)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <FireVariantsCard
              leanFireNumber={results.leanFireNumber}
              fireNumber={results.fireNumber}
              fatFireNumber={results.fatFireNumber}
              leanYears={leanYears}
              fireYears={results.yearsToFI}
              fatYears={fatYears}
              coastFireNumber={results.coastFireNumber}
              coastYears={results.coastFireYears}
            />

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Savings Rate Impact
              </h3>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-sm text-neutral-300">
                  If you increased your savings rate by 10 percentage points to{" "}
                  <span className="font-semibold text-amber-200">
                    {formatPercent(targetSavingsRate, 1, true)}
                  </span>
                  , your FI timeline could shift to{" "}
                  <span className="font-semibold text-white">
                    {formatYearsSafe(improvedYears)}
                  </span>
                  .
                </p>
                {yearsSaved !== null && Number.isFinite(yearsSaved) && (
                  <p className="mt-2 text-xs text-neutral-500">
                    That&apos;s roughly {formatYears(Math.abs(yearsSaved))}{" "}
                    {yearsSaved > 0 ? "faster" : "slower"} than your current plan.
                  </p>
                )}
                {!Number.isFinite(results.yearsToFI) &&
                  Number.isFinite(improvedYears) && (
                    <p className="mt-2 text-xs text-amber-200">
                      Boosting your savings rate could make FI attainable for the
                      first time.
                    </p>
                  )}
              </div>
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-100">{results.recommendation}</p>
              </div>
            </div>

            <MethodologySection>
              <p>
                We use the 4% rule from the Trinity Study, which suggests
                withdrawing roughly 4% of your portfolio each year. That implies
                you need about 25x your annual expenses to retire. Adjust the
                withdrawal rate to see how the target changes.
              </p>
              <p>
                Expected return is modeled as an inflation-adjusted rate (often
                7%). Actual market returns vary, and sequence of returns risk can
                affect early retirement success.
              </p>
              <p>
                Inspired by{" "}
                <a
                  href="https://www.mrmoneymustache.com/"
                  className="text-amber-200 underline hover:text-amber-100"
                  target="_blank"
                  rel="noreferrer"
                >
                  Mr. Money Mustache
                </a>{" "}
                and the broader FIRE movement. Read more on the{" "}
                <a
                  href="https://en.wikipedia.org/wiki/Trinity_study"
                  className="text-amber-200 underline hover:text-amber-100"
                  target="_blank"
                  rel="noreferrer"
                >
                  Trinity Study
                </a>{" "}
                and consider professional advice for personalized planning.
              </p>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
