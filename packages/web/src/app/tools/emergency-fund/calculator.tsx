"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, MethodologySection, SliderInput } from "@/components/shared";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/shared/formatters";
import {
  calculate,
  riskMultipliers,
} from "@/lib/calculators/emergency-fund/calculations";
import type {
  CalculatorInputs,
  RiskFactor,
} from "@/lib/calculators/emergency-fund/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  monthlyExpenses: 4000,
  jobStability: "stable",
  incomeSource: "single_stable",
  dependents: "partner",
  healthSituation: "good",
  housingSituation: "rent_normal",
};

const impactStyles = {
  increases: {
    label: "Increases",
    symbol: "↑",
    className: "text-rose-300 bg-rose-500/10 border-rose-500/30",
  },
  decreases: {
    label: "Decreases",
    symbol: "↓",
    className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
  },
  neutral: {
    label: "Neutral",
    symbol: "—",
    className: "text-neutral-300 bg-neutral-800 border-neutral-700",
  },
} as const;

const riskBadgeStyles = {
  low: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  moderate: "border-sky-500/40 bg-sky-500/10 text-sky-200",
  high: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  "very-high": "border-rose-500/40 bg-rose-500/10 text-rose-200",
} as const;

const riskLabel = {
  low: "Low Risk",
  moderate: "Moderate Risk",
  high: "High Risk",
  "very-high": "Very High Risk",
} as const;

interface RiskOption<T extends string> {
  value: T;
  label: string;
  multiplier: number;
}

interface RiskFactorSelectorProps<T extends string> {
  title: string;
  description: string;
  options: RiskOption<T>[];
  selected: T;
  onChange: (value: T) => void;
}

function RiskFactorSelector<T extends string>({
  title,
  description,
  options,
  selected,
  onChange,
}: RiskFactorSelectorProps<T>) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-white">{title}</legend>
      <p className="text-sm text-neutral-400">{description}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const impact =
            option.multiplier > 1
              ? "increases"
              : option.multiplier < 1
                ? "decreases"
                : "neutral";
          const impactStyle = impactStyles[impact];
          const isActive = selected === option.value;

          return (
            <label
              key={option.value}
              className={`relative flex h-full cursor-pointer flex-col gap-3 rounded-xl border px-4 py-3 transition focus-within:ring-2 focus-within:ring-blue-500/60 ${
                isActive
                  ? "border-blue-500/70 bg-blue-500/10"
                  : "border-neutral-800 bg-neutral-950/60 hover:border-neutral-700"
              }`}
            >
              <input
                type="radio"
                name={title}
                value={option.value}
                checked={isActive}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-semibold text-white">
                  {option.label}
                </span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${impactStyle.className}`}
                >
                  <span aria-hidden>{impactStyle.symbol}</span>
                  <span>{impactStyle.label}</span>
                </span>
              </div>
              <div className="text-xs text-neutral-400">
                Multiplier: {option.multiplier.toFixed(1)}x
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

interface RangeVisualizationProps {
  minimumAmount: number;
  targetAmount: number;
  comfortAmount: number;
}

function RangeVisualization({
  minimumAmount,
  targetAmount,
  comfortAmount,
}: RangeVisualizationProps) {
  const maxAmount = Math.max(comfortAmount, 1);
  const minPosition = Math.min(100, (minimumAmount / maxAmount) * 100);
  const targetPosition = Math.min(100, (targetAmount / maxAmount) * 100);
  const comfortPosition = 100;

  return (
    <div className="rounded-2xl bg-neutral-900 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Safety Range</h3>
      <div className="relative h-3 rounded-full bg-neutral-800">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-blue-500/60"
          style={{ width: `${targetPosition}%` }}
        />
        <div
          className="absolute -top-2 h-7 w-1 rounded-full bg-neutral-300"
          style={{ left: `${minPosition}%` }}
          aria-hidden
        />
        <div
          className="absolute -top-2 h-7 w-1 rounded-full bg-blue-400"
          style={{ left: `${targetPosition}%` }}
          aria-hidden
        />
        <div
          className="absolute -top-2 h-7 w-1 rounded-full bg-neutral-500"
          style={{ left: `${comfortPosition}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-3">
        <div>
          <p className="text-neutral-500">Minimum</p>
          <p className="font-semibold text-white">
            {formatCurrency(minimumAmount)}
          </p>
        </div>
        <div>
          <p className="text-neutral-500">Target</p>
          <p className="font-semibold text-white">
            {formatCurrency(targetAmount)}
          </p>
        </div>
        <div>
          <p className="text-neutral-500">Comfort</p>
          <p className="font-semibold text-white">
            {formatCurrency(comfortAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}

function RiskBreakdown({ factors }: { factors: RiskFactor[] }) {
  return (
    <div className="rounded-2xl bg-neutral-900 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Risk Breakdown
      </h3>
      <ul className="space-y-3">
        {factors.map((factor) => {
          const impactStyle = impactStyles[factor.impact];
          return (
            <li
              key={factor.name}
              className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  {factor.name}
                </p>
                <p className="text-xs text-neutral-400">{factor.value}</p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs ${impactStyle.className}`}
              >
                <span aria-hidden>{impactStyle.symbol}</span>
                {impactStyle.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Calculator() {
  const { defaults: memoryDefaults, preFilledFields, isLoaded: memoryLoaded } = useMemoryPreFill<CalculatorInputs>({
    monthlyExpenses: "monthly_income",
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [currentSavings, setCurrentSavings] = useState<number>(8000);

  useEffect(() => {
    if (memoryLoaded) {
      setInputs(prev => ({ ...prev, ...memoryDefaults }));
    }
  }, [memoryLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => calculate(inputs), [inputs]);

  const progressPercent = Math.min(
    1,
    Math.max(0, currentSavings / Math.max(results.targetAmount, 1))
  );
  const remaining = Math.max(0, results.targetAmount - currentSavings);

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
            Emergency Fund Planner
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Not everyone needs “3–6 months.”
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Calculate your personalized emergency fund target based on the
            stability, responsibilities, and expenses that shape your real-life
            risk profile.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Monthly Expenses
              </h2>
              <p className="text-sm text-neutral-400 mb-6">
                Include rent, utilities, food, insurance, and minimum debt
                payments.
              </p>
              <SliderInput
                label="Essential Monthly Expenses"
                value={inputs.monthlyExpenses}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, monthlyExpenses: value }))
                }
                min={500}
                max={20000}
                step={100}
                format="currency"
              />
              <MemoryBadge field="monthlyExpenses" preFilledFields={preFilledFields} />
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
              <h2 className="text-xl font-semibold text-white">Risk Factors</h2>

              <RiskFactorSelector
                title="Job Stability"
                description="How predictable is your employment income?"
                options={Object.entries(riskMultipliers.jobStability).map(
                  ([value, option]) => ({
                    value: value as CalculatorInputs["jobStability"],
                    label: option.label,
                    multiplier: option.value,
                  })
                )}
                selected={inputs.jobStability}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, jobStability: value }))
                }
              />

              <RiskFactorSelector
                title="Income Sources"
                description="How many reliable income streams support you?"
                options={Object.entries(riskMultipliers.incomeSource).map(
                  ([value, option]) => ({
                    value: value as CalculatorInputs["incomeSource"],
                    label: option.label,
                    multiplier: option.value,
                  })
                )}
                selected={inputs.incomeSource}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, incomeSource: value }))
                }
              />

              <RiskFactorSelector
                title="Dependents"
                description="Who relies on your income to feel secure?"
                options={Object.entries(riskMultipliers.dependents).map(
                  ([value, option]) => ({
                    value: value as CalculatorInputs["dependents"],
                    label: option.label,
                    multiplier: option.value,
                  })
                )}
                selected={inputs.dependents}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, dependents: value }))
                }
              />

              <RiskFactorSelector
                title="Health Situation"
                description="Health stability can change how much buffer you need."
                options={Object.entries(riskMultipliers.healthSituation).map(
                  ([value, option]) => ({
                    value: value as CalculatorInputs["healthSituation"],
                    label: option.label,
                    multiplier: option.value,
                  })
                )}
                selected={inputs.healthSituation}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, healthSituation: value }))
                }
              />

              <RiskFactorSelector
                title="Housing"
                description="Housing costs and surprise repairs add risk."
                options={Object.entries(riskMultipliers.housingSituation).map(
                  ([value, option]) => ({
                    value: value as CalculatorInputs["housingSituation"],
                    label: option.label,
                    multiplier: option.value,
                  })
                )}
                selected={inputs.housingSituation}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, housingSituation: value }))
                }
              />
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Progress Tracker
              </h2>
              <p className="text-sm text-neutral-400 mb-6">
                Track how close you are to your personalized target.
              </p>
              <label className="text-sm font-medium text-neutral-300">
                Current savings
              </label>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-lg text-neutral-400">$</span>
                <input
                  type="number"
                  min={0}
                  value={currentSavings}
                  onChange={(event) =>
                    setCurrentSavings(Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <span>{formatPercent(progressPercent, 0)}</span>
                  <span>{formatCurrency(remaining)} to go</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-neutral-800">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${progressPercent * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  You&apos;re {formatPercent(progressPercent, 0)} of the way there.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-neutral-400">Your Target</p>
                  <p className="mt-2 text-3xl font-bold text-white">
                    {formatCurrency(results.targetAmount)}
                  </p>
                  <p className="mt-1 text-sm text-neutral-400">
                    {results.adjustedMonths} months of expenses
                  </p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    riskBadgeStyles[results.overallRisk]
                  }`}
                >
                  {riskLabel[results.overallRisk]}
                </span>
              </div>
              <div className="mt-4 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-100">
                  {results.recommendation}
                </p>
              </div>
            </div>

            <RangeVisualization
              minimumAmount={results.minimumAmount}
              targetAmount={results.targetAmount}
              comfortAmount={results.comfortAmount}
            />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Range Details
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-400">
                <span className="rounded-full border border-neutral-800 px-3 py-1">
                  Minimum: {formatNumber(results.baselineMonths)} months
                </span>
                <span className="rounded-full border border-neutral-800 px-3 py-1">
                  Target: {formatNumber(results.adjustedMonths)} months
                </span>
                <span className="rounded-full border border-neutral-800 px-3 py-1">
                  Comfort: {formatNumber(results.adjustedMonths + 1)} months
                </span>
              </div>
            </div>

            <RiskBreakdown factors={results.riskFactors} />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <MethodologySection title="How we set your emergency fund target">
            <p>
              We start with a baseline of three months of essential expenses,
              then adjust the number of months based on five real-life risk
              factors: job stability, income sources, dependents, health
              considerations, and housing. Each factor nudges the target up or
              down with a multiplier.
            </p>
            <p>
              This approach builds on the popular “3–6 months” rule (including
              Dave Ramsey&apos;s Baby Step guidance) while recognizing that modern
              households have very different levels of risk.
            </p>
            <p>
              Your final target is capped between 3 and 12 months to keep the
              recommendation realistic while still preparing you for setbacks.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
