"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, MethodologySection, SliderInput } from "@/components/shared";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import {
  formatCurrency,
  formatMonthsAsYears,
  formatMonthYear,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/savings-goal/calculations";
import type { CalculatorInputs } from "@/lib/calculators/savings-goal/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  goalAmount: 25000,
  currentSavings: 2000,
  monthlyContribution: 500,
  annualReturnRate: 5,
};

const milestoneLabels = ["25%", "50%", "75%", "100%"] as const;

const milestoneColors = {
  25: "bg-blue-500/30",
  50: "bg-blue-500/50",
  75: "bg-blue-500/70",
  100: "bg-blue-500",
} as const;

export function Calculator() {
  const {
    defaults: memoryDefaults,
    preFilledFields,
    isLoaded: memoryLoaded,
  } = useMemoryPreFill<CalculatorInputs>({
    monthlyContribution: "monthly_savings_target",
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  useEffect(() => {
    if (memoryLoaded) {
      setInputs((prev) => ({ ...prev, ...memoryDefaults }));
    }
  }, [memoryLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => calculate(inputs), [inputs]);

  const isReachable = Number.isFinite(results.monthsToGoal);
  const alreadyReached = inputs.currentSavings >= inputs.goalAmount;
  const progressPercent = Math.min(
    100,
    Math.max(
      0,
      inputs.goalAmount > 0
        ? (inputs.currentSavings / inputs.goalAmount) * 100
        : 0
    )
  );

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
            Savings Goal Calculator
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Map your path to any savings goal.
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            See exactly when you&apos;ll reach your target with monthly
            contributions and projected growth.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* Left column: Inputs */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Your Savings Goal
              </h2>
              <SliderInput
                label="Goal Amount"
                value={inputs.goalAmount}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, goalAmount: value }))
                }
                min={1000}
                max={500000}
                step={1000}
                format="currency"
              />
              <SliderInput
                label="Current Savings"
                value={inputs.currentSavings}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, currentSavings: value }))
                }
                min={0}
                max={500000}
                step={500}
                format="currency"
              />
              <SliderInput
                label="Monthly Contribution"
                value={inputs.monthlyContribution}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    monthlyContribution: value,
                  }))
                }
                min={0}
                max={10000}
                step={50}
                format="currency"
              />
              {preFilledFields.has("monthlyContribution") && (
                <div className="-mt-4 mb-2 ml-1">
                  <MemoryBadge
                    field="monthlyContribution"
                    preFilledFields={preFilledFields}
                  />
                </div>
              )}
              <SliderInput
                label="Annual Return Rate"
                value={inputs.annualReturnRate}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, annualReturnRate: value }))
                }
                min={0}
                max={12}
                step={0.5}
                format="percent"
              />
            </div>

            {/* Current progress bar */}
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-2">
                Current Progress
              </h3>
              <p className="text-sm text-neutral-400 mb-4">
                You&apos;re {progressPercent.toFixed(0)}% of the way to your
                goal.
              </p>
              <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-neutral-500">
                <span>{formatCurrency(inputs.currentSavings)}</span>
                <span>{formatCurrency(inputs.goalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Right column: Results */}
          <div className="space-y-6">
            {/* Primary result */}
            <div className="rounded-2xl bg-neutral-900 p-6">
              <p className="text-sm text-neutral-400">Time to Goal</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {alreadyReached
                  ? "Goal reached!"
                  : isReachable
                    ? formatMonthsAsYears(Math.ceil(results.monthsToGoal))
                    : "Not reachable"}
              </p>
              {isReachable && !alreadyReached && (
                <p className="mt-1 text-sm text-neutral-400">
                  Target date: {formatMonthYear(results.targetDate)}
                </p>
              )}
            </div>

            {/* Key metrics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Total Contributions
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(results.totalContributions)}
                </p>
                <p className="text-xs text-neutral-500">
                  Over{" "}
                  {isReachable
                    ? formatMonthsAsYears(Math.ceil(results.monthsToGoal))
                    : "---"}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Interest Earned
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(results.totalInterestEarned)}
                </p>
                <p className="text-xs text-neutral-500">
                  At {inputs.annualReturnRate}% annual return
                </p>
              </div>
            </div>

            {/* Without returns comparison */}
            {isReachable && !alreadyReached && results.monthlyNeededIfNoReturn > 0 && (
              <div className="rounded-2xl bg-neutral-900 p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Growth Impact
                </h3>
                <p className="text-sm text-neutral-400">
                  Without investment returns, you&apos;d need to save{" "}
                  <span className="font-semibold text-white">
                    {formatCurrency(Math.ceil(results.monthlyNeededIfNoReturn))}
                  </span>{" "}
                  per month to reach the same goal in the same timeframe.
                  Compound growth saves you{" "}
                  <span className="font-semibold text-emerald-300">
                    {formatCurrency(results.totalInterestEarned)}
                  </span>
                  .
                </p>
              </div>
            )}

            {/* Milestone progress */}
            {results.milestones.length > 0 && !alreadyReached && (
              <div className="rounded-2xl bg-neutral-900 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Milestones
                </h3>
                <div className="space-y-4">
                  {/* Progress bar with milestone markers */}
                  <div className="relative">
                    <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
                      {results.milestones.map((milestone) => (
                        <div
                          key={milestone.percentComplete}
                          className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                            milestoneColors[
                              milestone.percentComplete as keyof typeof milestoneColors
                            ] ?? "bg-blue-500"
                          }`}
                          style={{
                            width: `${milestone.percentComplete}%`,
                          }}
                        />
                      ))}
                    </div>
                    {/* Milestone markers */}
                    <div className="relative mt-2">
                      {milestoneLabels.map((label, index) => (
                        <div
                          key={label}
                          className="absolute -translate-x-1/2"
                          style={{ left: `${(index + 1) * 25}%` }}
                        >
                          <div className="w-px h-2 bg-neutral-600 mx-auto" />
                          <span className="text-[10px] text-neutral-500">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Milestone details */}
                  <ul className="mt-6 space-y-3">
                    {results.milestones.map((milestone) => {
                      const reached = milestone.month === 0;
                      return (
                        <li
                          key={milestone.percentComplete}
                          className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                                reached
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                  : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                              }`}
                            >
                              {milestone.percentComplete}%
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {formatCurrency(milestone.balance)}
                              </p>
                              <p className="text-xs text-neutral-400">
                                {reached
                                  ? "Already reached"
                                  : `Month ${milestone.month} (${formatMonthsAsYears(milestone.month)})`}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="rounded-2xl bg-neutral-900 p-6">
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-100">
                  {results.recommendation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <MethodologySection title="How we calculate your savings timeline">
            <p>
              We simulate monthly compounding to project when your savings will
              reach the goal. Each month, interest accrues on your current
              balance at 1/12th of the annual return rate, then your monthly
              contribution is added.
            </p>
            <p>
              Milestones are tracked at 25%, 50%, 75%, and 100% of your goal to
              give you intermediate targets to celebrate along the way.
            </p>
            <p>
              The projected return rate should reflect a realistic expectation
              for your savings vehicle. High-yield savings accounts may offer
              4-5%, while diversified index funds have historically averaged
              7-10% annually before inflation. Adjust this rate to match your
              investment strategy.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
