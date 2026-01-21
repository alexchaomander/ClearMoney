"use client";

import { useMemo, useState } from "react";

import { ResultCard } from "@/components/shared/ResultCard";
import { SliderInput } from "@/components/shared/SliderInput";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/super-catch-up/calculations";
import {
  ESTIMATED_MARGINAL_TAX_RATE,
  FILING_STATUS_OPTIONS,
  LIMITS_2026,
  SUPER_CATCH_UP_AGES,
} from "@/lib/calculators/super-catch-up/constants";
import type {
  CalculatorInputs,
  FilingStatus,
} from "@/lib/calculators/super-catch-up/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 58,
  birthDate: new Date(new Date().getFullYear() - 58, 0, 1),
  currentBalance: 500000,
  annualSalary: 150000,
  contributionRate: 15,
  employerMatchPercent: 4,
  employerMatchCap: 6,
  expectedReturn: 7,
  retirementAge: 65,
  priorYearWages: 150000,
  filingStatus: "single",
};

function formatDateInput(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getCatchUpLimit(age: number): number {
  if (age < 50) return 0;
  if (age >= 60 && age <= 63) return LIMITS_2026.superCatchUp;
  return LIMITS_2026.regularCatchUp;
}

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => calculate(inputs), [inputs]);
  const currentYear = new Date().getFullYear();

  const currentProjection = results.fourYearPlan[0];
  const currentTotalLimit = currentProjection?.totalLimit ?? 0;
  const currentEmployeeContribution = currentProjection?.yourContribution ?? 0;
  const monthlyMaxContribution = currentTotalLimit / 12;
  const monthlyShortfall = Math.max(0, (currentTotalLimit - currentEmployeeContribution) / 12);

  const eligibilityHeadline = results.eligibility.currentlyEligible
    ? "Eligible for the super catch-up right now"
    : inputs.currentAge < 60
      ? `Eligible in ${results.eligibility.yearsUntilEligible} year${
          results.eligibility.yearsUntilEligible === 1 ? "" : "s"
        }`
      : "Super catch-up window closed";

  const eligibilitySubcopy = results.eligibility.currentlyEligible
    ? "You are inside the 4-year window (ages 60-63). Max the higher limit while it lasts."
    : inputs.currentAge < 60
      ? "The enhanced limit starts the year you turn 60. Plan now to front-load contributions."
      : "Once you hit age 64, the catch-up limit drops back to the regular amount.";

  const superCatchUpPlan = results.fourYearPlan.filter(
    (projection) => projection.age >= 60 && projection.age <= 63
  );

  const calendarCards = SUPER_CATCH_UP_AGES.map((age) => {
    const year = currentYear + (age - inputs.currentAge);
    const status =
      age < inputs.currentAge
        ? "Missed"
        : age > inputs.retirementAge
          ? "Retired"
          : age >= 60 && age <= 63
            ? "Available"
            : "Upcoming";
    const isAvailable = age >= inputs.currentAge && age <= inputs.retirementAge && age >= 60;
    return { age, year, status, isAvailable };
  });

  const comparisonItems = [
    {
      label: "With super catch-up",
      value: results.comparison.withSuperCatchUp,
      highlight: true,
    },
    {
      label: "With regular catch-up",
      value: results.comparison.withRegularCatchUp,
      highlight: false,
    },
    {
      label: "No catch-up",
      value: results.comparison.withNoCatchUp,
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-400">
            Ages 60-63 only
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Super Catch-Up Contribution Optimizer
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Maximize your 4-year window to contribute up to {formatCurrency(LIMITS_2026.totalWithSuperCatchUp, 0)}
            per year and project the retirement impact.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto flex max-w-2xl flex-col gap-8">
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6">
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-200">
                Eligibility status
              </p>
              <h2 className="text-2xl font-semibold text-white">{eligibilityHeadline}</h2>
              <p className="text-sm text-amber-100/80">{eligibilitySubcopy}</p>
              <div className="mt-2 grid gap-3 text-sm text-amber-100 sm:grid-cols-3">
                <div className="rounded-xl border border-amber-400/30 bg-neutral-950/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-amber-200">Years left</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {results.eligibility.superCatchUpYears.length}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-400/30 bg-neutral-950/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-amber-200">Extra per year</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatCurrency(LIMITS_2026.superCatchUp - LIMITS_2026.regularCatchUp, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-amber-400/30 bg-neutral-950/40 p-3">
                  <p className="text-xs uppercase tracking-wide text-amber-200">Total max</p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    {formatCurrency(currentTotalLimit, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {results.rothRequirement.required && (
            <div className="rounded-2xl border border-amber-500/40 bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white">Roth catch-up required</h3>
              <p className="mt-2 text-sm text-neutral-400">{results.rothRequirement.reason}</p>
              <p className="mt-3 text-sm text-amber-300">
                Estimated lost tax deduction on catch-up contributions: {" "}
                {formatCurrency(results.rothRequirement.taxImpact, 0)}
              </p>
            </div>
          )}

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Your Information</h2>
            <div className="space-y-6">
              <SliderInput
                label="Current age"
                value={inputs.currentAge}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    currentAge: value,
                  }))
                }
                min={50}
                max={70}
                step={1}
                format="number"
              />

              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Birth date</label>
                <input
                  type="date"
                  value={formatDateInput(inputs.birthDate)}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      birthDate: new Date(event.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white"
                />
              </div>

              <SliderInput
                label="Current 401(k) balance"
                value={inputs.currentBalance}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    currentBalance: value,
                  }))
                }
                min={0}
                max={5_000_000}
                step={10_000}
                format="currency"
              />
              <SliderInput
                label="Annual salary"
                value={inputs.annualSalary}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    annualSalary: value,
                  }))
                }
                min={0}
                max={1_000_000}
                step={5_000}
                format="currency"
              />
              <SliderInput
                label="Current contribution rate"
                value={inputs.contributionRate}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    contributionRate: value,
                  }))
                }
                min={0}
                max={100}
                step={1}
                format="percent"
              />
              <SliderInput
                label="Employer match %"
                value={inputs.employerMatchPercent}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    employerMatchPercent: value,
                  }))
                }
                min={0}
                max={10}
                step={0.5}
                format="percent"
              />
              <SliderInput
                label="Employer match cap (% of salary)"
                value={inputs.employerMatchCap}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    employerMatchCap: value,
                  }))
                }
                min={0}
                max={100}
                step={1}
                format="percent"
              />
              <SliderInput
                label="Expected annual return"
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
              <SliderInput
                label="Planned retirement age"
                value={inputs.retirementAge}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    retirementAge: value,
                  }))
                }
                min={55}
                max={75}
                step={1}
                format="number"
              />
              <SliderInput
                label="Prior year W-2 wages"
                value={inputs.priorYearWages}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    priorYearWages: value,
                  }))
                }
                min={0}
                max={1_000_000}
                step={5_000}
                format="currency"
              />

              <div>
                <label className="text-sm font-medium text-neutral-300">Filing status</label>
                <select
                  className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                  value={inputs.filingStatus}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      filingStatus: event.target.value as FilingStatus,
                    }))
                  }
                >
                  {FILING_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <ResultCard
            title="Value of the super catch-up"
            primaryValue={formatCurrency(results.valueOfSuperCatchUp.totalExtraWealth, 0)}
            primaryLabel="Total extra wealth at retirement"
            items={[
              {
                label: "Extra contributions",
                value: formatCurrency(results.valueOfSuperCatchUp.extraContributionsOver4Years, 0),
              },
              {
                label: "Extra growth",
                value: formatCurrency(results.valueOfSuperCatchUp.extraGrowthByRetirement, 0),
              },
              {
                label: "Monthly income boost",
                value: formatCurrency(results.valueOfSuperCatchUp.monthlyRetirementIncomeIncrease, 0),
              },
            ]}
            variant="amber"
          />

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">4-year window calendar</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Each year from age 60 to 63 qualifies for the higher {formatCurrency(LIMITS_2026.superCatchUp, 0)}
              catch-up.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {calendarCards.map((card) => (
                <div
                  key={card.age}
                  className={`rounded-xl border p-4 ${
                    card.isAvailable
                      ? "border-amber-400/40 bg-amber-500/10"
                      : "border-neutral-800 bg-neutral-950"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-neutral-400">
                    Age {card.age}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">{card.year}</p>
                  <p className="mt-2 text-sm text-neutral-400">
                    Status: {card.status}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Contribution plan (ages 60-63)</h2>
            <p className="mt-2 text-sm text-neutral-400">
              These projections show your contributions and balance through the super catch-up window.
            </p>
            <div className="mt-6 space-y-4">
              {superCatchUpPlan.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  Your retirement age or current age means you won’t have any super catch-up years left.
                </p>
              ) : (
                superCatchUpPlan.map((projection) => (
                  <div
                    key={projection.year}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-neutral-400">
                          {projection.year} · Age {projection.age}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          Total limit {formatCurrency(projection.totalLimit, 0)}
                        </p>
                      </div>
                      <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200">
                        Super catch-up
                      </span>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm text-neutral-300 sm:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase text-neutral-500">Your contribution</p>
                        <p className="mt-1 text-white">
                          {formatCurrency(projection.yourContribution, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-neutral-500">Employer match</p>
                        <p className="mt-1 text-white">
                          {formatCurrency(projection.employerMatch, 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase text-neutral-500">Year-end balance</p>
                        <p className="mt-1 text-white">
                          {formatCurrency(projection.yearEndBalance, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Cash flow planning</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Estimate how much you need to save each month to hit the limit.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-xs uppercase text-neutral-500">Monthly max contribution</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(monthlyMaxContribution, 0)}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Based on a {formatCurrency(currentTotalLimit, 0)} annual employee limit.
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-xs uppercase text-neutral-500">Monthly gap to max</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(monthlyShortfall, 0)}
                </p>
                <p className="mt-1 text-xs text-neutral-400">
                  Increase deferrals by {formatCurrency(monthlyShortfall, 0)} to reach the limit.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Retirement impact comparison</h2>
            <p className="mt-2 text-sm text-neutral-400">
              See how the super catch-up window compares against the regular limit.
            </p>
            <div className="mt-6 space-y-4">
              {comparisonItems.map((item) => (
                <div
                  key={item.label}
                  className={`rounded-xl border p-4 ${
                    item.highlight
                      ? "border-amber-400/40 bg-amber-500/10"
                      : "border-neutral-800 bg-neutral-950/60"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(item.value.balanceAtRetirement, 0)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-neutral-400">
                    Monthly income at 4% rule: {formatCurrency(item.value.monthlyIncome4Percent, 0)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Action checklist</h2>
            <ul className="mt-4 space-y-3 text-sm text-neutral-300">
              {results.recommendations.map((recommendation) => (
                <li key={recommendation} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          <section className="rounded-2xl bg-neutral-900/50 p-6">
            <details>
              <summary className="text-lg font-semibold text-white cursor-pointer">
                How we calculate this
              </summary>
              <div className="mt-4 space-y-3 text-sm text-neutral-400">
                <p>
                  We use 2026 IRS limits: a base 401(k) limit of {formatCurrency(LIMITS_2026.base401k, 0)},
                  a regular catch-up of {formatCurrency(LIMITS_2026.regularCatchUp, 0)}, and a super catch-up
                  of {formatCurrency(LIMITS_2026.superCatchUp, 0)} for ages 60-63.
                </p>
                <p>
                  Your projected balance grows at your expected return and adds both your contribution and the
                  employer match each year until retirement age.
                </p>
                <p>
                  High earners with prior-year wages above {formatCurrency(LIMITS_2026.rothCatchUpThreshold, 0)}
                  must make catch-up contributions as Roth. We estimate the lost tax deduction using a
                  {formatPercent(ESTIMATED_MARGINAL_TAX_RATE)} marginal rate for planning purposes.
                </p>
                <p>
                  Comparison scenarios model the same savings rate with either the super catch-up, the regular
                  catch-up, or no catch-up at all. Monthly income uses the 4% rule: balance × 4% ÷ 12.
                </p>
              </div>
            </details>
          </section>

          <div className="text-xs text-neutral-500">
            <p>
              Note: This tool provides planning estimates only. Actual IRS limits and employer matching rules
              may change.
            </p>
            <p className="mt-2">
              Current age: {inputs.currentAge}, projected retirement age: {inputs.retirementAge}. Super catch-up
              years remaining: {formatNumber(results.eligibility.superCatchUpYears.length)}.
            </p>
            <p className="mt-2">
              Catch-up limit this year: {formatCurrency(getCatchUpLimit(inputs.currentAge), 0)}. Estimated Roth
              tax impact (if required): {formatCurrency(results.rothRequirement.taxImpact, 0)}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
