"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/mega-backdoor-roth/calculations";
import type {
  CalculatorInputs,
  ContributionType,
} from "@/lib/calculators/mega-backdoor-roth/types";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  age: 35,
  annualIncome: 250000,
  plan: {
    allowsAfterTax: false,
    allowsInPlanConversion: false,
    allowsInServiceDistribution: false,
    employeeContribution: 23000,
    employeeContributionType: "traditional",
    employerMatch: 10000,
    afterTaxContributionLimit: 0,
  },
  currentRothBalance: 50000,
  yearsUntilRetirement: 25,
  expectedReturn: 7,
};

const TOGGLE_OPTIONS = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

const CONTRIBUTION_TYPES: { value: ContributionType; label: string }[] = [
  { value: "traditional", label: "Traditional" },
  { value: "roth", label: "Roth" },
  { value: "mixed", label: "Mixed" },
];

const PLAN_GRADE_STYLES: Record<
  string,
  { label: string; className: string; description: string }
> = {
  A: {
    label: "A",
    className: "border-violet-400/60 text-violet-200 bg-violet-500/20",
    description: "Full mega backdoor access with both conversion options.",
  },
  B: {
    label: "B",
    className: "border-violet-400/40 text-violet-200 bg-violet-500/10",
    description: "You can do it, but only one conversion option is available.",
  },
  C: {
    label: "C",
    className: "border-amber-400/50 text-amber-200 bg-amber-500/10",
    description:
      "After-tax contributions allowed, but conversion is missing. Gains are taxable.",
  },
  F: {
    label: "F",
    className: "border-rose-400/60 text-rose-200 bg-rose-500/10",
    description: "Plan does not allow after-tax contributions or conversions.",
  },
};

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);

  const monthlyAmount = Math.round(results.maxMegaBackdoorAmount / 12);
  const perPaycheckAmount = Math.round(results.maxMegaBackdoorAmount / 26);
  const eligible = results.eligibility.canDoMegaBackdoor;
  const grade = PLAN_GRADE_STYLES[results.eligibility.planGrade];

  const chartData = results.projectedGrowth.slice(0, 15);
  const withoutMegaData = chartData.map((point) => {
    const balance =
      inputs.currentRothBalance *
      Math.pow(1 + inputs.expectedReturn / 100, point.year);
    return { year: point.year, balance: Math.round(balance) };
  });
  const maxBalance = Math.max(
    ...chartData.map((point) => point.balance),
    ...withoutMegaData.map((point) => point.balance),
    1
  );

  const chartPoints = (data: { balance: number }[]) =>
    data
      .map((point, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100;
        const y = 100 - (point.balance / maxBalance) * 90 - 5;
        return `${x},${y}`;
      })
      .join(" ");

  const totalLimit = results.contributionSpace.totalLimit;
  const employeePercent =
    (results.contributionSpace.employeeContribution / totalLimit) * 100;
  const employerPercent =
    (results.contributionSpace.employerMatch / totalLimit) * 100;
  const availablePercent =
    (results.contributionSpace.irsMaxAvailable / totalLimit) * 100;

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-400 mb-3">
            Mega Backdoor Roth Analyzer
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Supercharge your Roth contributions
          </h1>
          <p className="text-lg text-neutral-400">
            Find out if your 401(k) plan can unlock up to $46,000+ in extra Roth
            space every year.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Basic information
                </h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Your Age"
                    value={inputs.age}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, age: value }))
                    }
                    min={18}
                    max={100}
                    step={1}
                    format="number"
                    description="Catch-up contributions start at age 50."
                  />
                  <SliderInput
                    label="Annual Income"
                    value={inputs.annualIncome}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, annualIncome: value }))
                    }
                    min={0}
                    max={5000000}
                    step={10000}
                    format="currency"
                    description="Income does not limit mega backdoor eligibility."
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  401(k) plan eligibility
                </h2>
                <div className="space-y-5">
                  {[
                    {
                      key: "allowsAfterTax" as const,
                      label: "Allows after-tax (non-Roth) contributions",
                    },
                    {
                      key: "allowsInPlanConversion" as const,
                      label: "Allows in-plan Roth conversions",
                    },
                    {
                      key: "allowsInServiceDistribution" as const,
                      label: "Allows in-service distributions",
                    },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <p className="text-sm font-semibold text-neutral-200">
                        {item.label}
                      </p>
                      <div className="flex gap-3">
                        {TOGGLE_OPTIONS.map((option) => (
                          <button
                            key={option.label}
                            type="button"
                            onClick={() =>
                              setInputs((prev) => ({
                                ...prev,
                                plan: {
                                  ...prev.plan,
                                  [item.key]: option.value,
                                },
                              }))
                            }
                            className={cn(
                              "rounded-lg border px-4 py-2 text-sm font-semibold transition",
                              inputs.plan[item.key] === option.value
                                ? "border-violet-400/70 bg-violet-500/20 text-violet-200"
                                : "border-neutral-700 text-neutral-300 hover:border-violet-400/60"
                            )}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Contribution details
                </h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Your Employee Contribution"
                    value={inputs.plan.employeeContribution}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        plan: { ...prev.plan, employeeContribution: value },
                      }))
                    }
                    min={0}
                    max={30500}
                    step={500}
                    format="currency"
                    description="Includes traditional + Roth 401(k) contributions."
                  />
                  <div>
                    <p className="text-sm font-semibold text-neutral-200 mb-2">
                      Contribution Type
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {CONTRIBUTION_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setInputs((prev) => ({
                              ...prev,
                              plan: {
                                ...prev.plan,
                                employeeContributionType: type.value,
                              },
                            }))
                          }
                          className={cn(
                            "rounded-lg border px-4 py-2 text-sm font-semibold transition",
                            inputs.plan.employeeContributionType === type.value
                              ? "border-violet-400/70 bg-violet-500/20 text-violet-200"
                              : "border-neutral-700 text-neutral-300 hover:border-violet-400/60"
                          )}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <SliderInput
                    label="Annual Employer Match"
                    value={inputs.plan.employerMatch}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        plan: { ...prev.plan, employerMatch: value },
                      }))
                    }
                    min={0}
                    max={50000}
                    step={500}
                    format="currency"
                    description="Employer contributions reduce available mega space."
                  />
                  <SliderInput
                    label="Plan After-Tax Limit"
                    value={inputs.plan.afterTaxContributionLimit}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        plan: {
                          ...prev.plan,
                          afterTaxContributionLimit: value,
                        },
                      }))
                    }
                    min={0}
                    max={50000}
                    step={500}
                    format="currency"
                    description="Leave at $0 if your plan allows up to the IRS maximum."
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-4">
                  Current retirement snapshot
                </h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Current Roth Balance"
                    value={inputs.currentRothBalance}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        currentRothBalance: value,
                      }))
                    }
                    min={0}
                    max={10000000}
                    step={5000}
                    format="currency"
                    description="Combined Roth IRA and Roth 401(k) balance."
                  />
                  <SliderInput
                    label="Years Until Retirement"
                    value={inputs.yearsUntilRetirement}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        yearsUntilRetirement: value,
                      }))
                    }
                    min={1}
                    max={50}
                    step={1}
                    format="number"
                  />
                  <SliderInput
                    label="Expected Annual Return"
                    value={inputs.expectedReturn}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        expectedReturn: value,
                      }))
                    }
                    min={0}
                    max={15}
                    step={0.5}
                    format="percent"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Plan eligibility
                  </h3>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      grade.className
                    )}
                  >
                    Grade {grade.label}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-sm",
                    eligible ? "text-violet-200" : "text-rose-200"
                  )}
                >
                  {eligible
                    ? "Eligible for mega backdoor Roth contributions"
                    : "Not currently eligible for mega backdoor Roth"}
                </p>
                <p className="text-xs text-neutral-500">{grade.description}</p>
                {results.eligibility.missingRequirements.length > 0 && (
                  <ul className="text-xs text-neutral-400 space-y-2">
                    {results.eligibility.missingRequirements.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-rose-400">●</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {eligible && (
                  <div className="rounded-lg bg-neutral-800/60 p-3 text-xs text-neutral-300">
                    Conversion method: {results.eligibility.conversionMethod}
                  </div>
                )}
              </div>

              <ResultCard
                title="Your Mega Backdoor Space"
                primaryValue={formatCurrency(results.maxMegaBackdoorAmount, 0)}
                primaryLabel="Annual after-tax contribution capacity"
                items={[
                  {
                    label: "Monthly contribution",
                    value: formatCurrency(monthlyAmount, 0),
                  },
                  {
                    label: "Bi-weekly per paycheck",
                    value: formatCurrency(perPaycheckAmount, 0),
                  },
                  {
                    label: "IRS max available",
                    value: formatCurrency(
                      results.contributionSpace.irsMaxAvailable,
                      0
                    ),
                  },
                  {
                    label: "Plan after-tax cap",
                    value:
                      inputs.plan.afterTaxContributionLimit > 0
                        ? formatCurrency(
                            results.contributionSpace.planMaxAvailable,
                            0
                          )
                        : "IRS max",
                  },
                ]}
                variant="purple"
              />

              <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Contribution space breakdown
                </h3>
                <div className="space-y-3 text-sm text-neutral-400">
                  <div className="flex justify-between">
                    <span>Total IRS limit</span>
                    <span className="text-white">
                      {formatCurrency(totalLimit, 0)}
                    </span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden flex">
                    <div
                      className="bg-violet-500/70"
                      style={{ width: `${employeePercent}%` }}
                      aria-label="Employee contributions"
                    />
                    <div
                      className="bg-sky-500/70"
                      style={{ width: `${employerPercent}%` }}
                      aria-label="Employer match"
                    />
                    <div
                      className="bg-emerald-400/70"
                      style={{ width: `${availablePercent}%` }}
                      aria-label="Remaining space"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-violet-200">
                        Employee contributions
                      </span>
                      <span>
                        {formatCurrency(
                          results.contributionSpace.employeeContribution,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sky-200">Employer match</span>
                      <span>
                        {formatCurrency(
                          results.contributionSpace.employerMatch,
                          0
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-200">Remaining space</span>
                      <span>
                        {formatCurrency(
                          results.contributionSpace.irsMaxAvailable,
                          0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Roth growth projection
                </h3>
                <span className="text-xs text-neutral-500">
                  {inputs.yearsUntilRetirement} years
                </span>
              </div>
              <div className="relative h-48">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <polyline
                    fill="none"
                    stroke="rgba(139,92,246,0.9)"
                    strokeWidth="2"
                    points={chartPoints(chartData)}
                  />
                  <polyline
                    fill="none"
                    stroke="rgba(94,234,212,0.6)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    points={chartPoints(withoutMegaData)}
                  />
                </svg>
                <div className="absolute bottom-2 left-2 text-xs text-neutral-500">
                  With mega backdoor (solid) vs. without (dashed)
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-400">Projected balance</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(results.retirementBalance, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400">Tax-free savings</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(results.taxFreeSavings, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400">Total contributions</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(results.totalContributed, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-400">Total growth</p>
                  <p className="text-white font-semibold">
                    {formatCurrency(results.totalGrowth, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                10-year comparison
              </h3>
              <div className="space-y-3 text-sm text-neutral-400">
                {[
                  {
                    label: "Total contributions",
                    with: results.comparison.withMegaBackdoor.totalContributions,
                    without: results.comparison.withoutMegaBackdoor
                      .totalContributions,
                    advantage: null,
                  },
                  {
                    label: "Final balance",
                    with: results.comparison.withMegaBackdoor.finalBalance,
                    without: results.comparison.withoutMegaBackdoor.finalBalance,
                    advantage: results.comparison.advantageAmount,
                  },
                  {
                    label: "Taxes paid",
                    with: 0,
                    without: results.comparison.withoutMegaBackdoor.taxesPaid,
                    advantage: -results.comparison.withoutMegaBackdoor.taxesPaid,
                  },
                ].map((row) => (
                  <div key={row.label} className="space-y-1">
                    <div className="flex justify-between text-neutral-300">
                      <span>{row.label}</span>
                      <span className="text-xs text-neutral-500">Advantage</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="rounded-lg bg-neutral-800/80 p-2 text-center text-white">
                        {formatCurrency(row.with, 0)}
                      </div>
                      <div className="rounded-lg bg-neutral-800/40 p-2 text-center">
                        {formatCurrency(row.without, 0)}
                      </div>
                      <div className="rounded-lg bg-violet-500/10 p-2 text-center text-violet-200">
                        {row.advantage === null
                          ? "—"
                          : formatCurrency(row.advantage, 0)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Step-by-step guide
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {results.steps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/20 text-sm font-semibold text-violet-200">
                      {step.step}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {step.title}
                      </p>
                      {step.timing && (
                        <p className="text-xs text-neutral-500">
                          {step.timing}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Recommendations
              </h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                {results.recommendations.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-emerald-400">●</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Warnings</h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                {results.warnings.length > 0 ? (
                  results.warnings.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-amber-400">●</span>
                      <span>{item}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-neutral-500">
                    No warnings based on your inputs.
                  </li>
                )}
              </ul>
            </div>
          </div>

          <MethodologySection title="How the mega backdoor Roth works">
            <div className="space-y-4 text-sm text-neutral-400">
              <p>
                The IRS caps total 401(k) contributions. Once you subtract your
                employee contributions and employer match, the remaining space
                can be filled with after-tax dollars.
              </p>
              <div className="rounded-xl bg-neutral-950/80 border border-neutral-800 p-4">
                <div className="flex flex-col gap-3 text-xs text-neutral-400">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-500/20 px-3 py-1 text-violet-200">
                      After-tax 401(k)
                    </span>
                    <span className="text-neutral-500">→</span>
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">
                      Roth 401(k) conversion
                    </span>
                    <span className="text-neutral-500">or</span>
                    <span className="rounded-full bg-sky-500/20 px-3 py-1 text-sky-200">
                      Roth IRA rollover
                    </span>
                  </div>
                  <p>
                    Converting quickly minimizes taxable gains, keeping growth
                    tax-free.
                  </p>
                </div>
              </div>
              <p>
                This calculator assumes 2024 IRS limits and uses a simple
                after-tax vs. Roth comparison to estimate tax savings. Results
                are educational estimates, not financial advice.
              </p>
            </div>
          </MethodologySection>

          <MethodologySection title="FAQ">
            <div className="space-y-4 text-sm text-neutral-400">
              <div>
                <p className="text-white font-semibold">Is this legal?</p>
                <p>
                  Yes. The IRS allows after-tax 401(k) contributions and Roth
                  conversions. The strategy is simply using both provisions
                  together.
                </p>
              </div>
              <div>
                <p className="text-white font-semibold">
                  How do I know if my plan allows it?
                </p>
                <p>
                  Check your Summary Plan Description or ask HR specifically
                  about after-tax contributions and in-plan conversions or
                  in-service rollovers.
                </p>
              </div>
              <div>
                <p className="text-white font-semibold">
                  What is the difference vs. regular backdoor Roth?
                </p>
                <p>
                  The regular backdoor uses a $7,000 IRA contribution. The mega
                  backdoor uses the much larger 401(k) total limit.
                </p>
              </div>
              <div>
                <p className="text-white font-semibold">
                  What if I change jobs?
                </p>
                <p>
                  You can roll your Roth 401(k) or Roth IRA into a new plan or
                  keep it in an IRA. The strategy is repeatable at new employers
                  if the plan supports it.
                </p>
              </div>
            </div>
          </MethodologySection>

          <div className="rounded-2xl bg-neutral-900/60 border border-neutral-800 p-6 text-sm text-neutral-400">
            <p>
              Quick summary: With a{" "}
              {formatCurrency(results.contributionSpace.totalLimit, 0)} IRS
              limit, you have used{" "}
              {formatCurrency(results.contributionSpace.usedSpace, 0)} so far.
              Your remaining space is{" "}
              {formatCurrency(
                results.contributionSpace.irsMaxAvailable,
                0
              )}, and your plan cap is{" "}
              {inputs.plan.afterTaxContributionLimit > 0
                ? formatCurrency(results.contributionSpace.planMaxAvailable, 0)
                : "IRS max"}.
            </p>
            <p className="mt-2 text-xs text-neutral-500">
              Employee contribution type: {inputs.plan.employeeContributionType}
              . Expected return: {formatPercent(inputs.expectedReturn, 0, true)}.
            </p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
