"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatYears,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/529-roth-rollover/calculations";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";
import {
  ACCOUNT_AGE_REQUIREMENT_YEARS,
  CONTRIBUTION_SEASONING_YEARS,
  IRA_CONTRIBUTION_LIMIT_2026,
  IRA_CATCHUP_CONTRIBUTION_2026,
  LIFETIME_529_TO_ROTH_LIMIT,
} from "@/lib/calculators/529-roth-rollover/constants";
import type {
  CalculatorInputs,
  RolloverScheduleItem,
} from "@/lib/calculators/529-roth-rollover/types";

const buildDefaultDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 16);
  date.setMonth(0);
  date.setDate(1);
  return date;
};

const DEFAULT_INPUTS: CalculatorInputs = {
  accountBalance: 50000,
  accountOpenDate: buildDefaultDate(),
  beneficiaryAge: 22,
  earnedIncome: 40000,
  otherIRAContributions: 0,
  contributionsMade5YearsAgo: 30000,
  priorRollovers: 0,
  expectedReturn: 7,
  yearsUntilRetirement: 40,
};

const formatDateInput = (date: Date) =>
  new Date(date).toISOString().split("T")[0];

const eligibilityChecklist = [
  {
    title: `529 account age (${ACCOUNT_AGE_REQUIREMENT_YEARS}+ years)`,
    description: "Account must be open for 15 years before any rollover.",
  },
  {
    title: `Seasoned contributions (${CONTRIBUTION_SEASONING_YEARS}+ years)`,
    description: "Only contributions made at least five years ago qualify.",
  },
  {
    title: "Earned income",
    description: "Rollover amount can’t exceed beneficiary earned income.",
  },
];

const actionChecklist = [
  "Confirm your 529 has been open for 15+ years.",
  "Identify which contributions are older than five years.",
  "Verify beneficiary earned income for the rollover year.",
  "Reduce the rollover by any other IRA contributions.",
  "Execute rollovers annually until the $35,000 lifetime limit is reached.",
];

const getStatusColor = (status: boolean) =>
  status ? "text-emerald-400" : "text-rose-400";

const formatScheduleRow = (item: RolloverScheduleItem) => (
  <tr key={item.year} className="border-b border-neutral-800 last:border-none">
    <td className="py-3 text-sm text-neutral-300">{item.year}</td>
    <td className="py-3 text-sm text-white">
      {formatCurrency(item.amount, 0)}
    </td>
    <td className="py-3 text-sm text-neutral-300">
      {formatCurrency(item.cumulativeRolled, 0)}
    </td>
    <td className="py-3 text-sm text-neutral-400">
      {formatCurrency(item.remainingLifetimeLimit, 0)}
    </td>
  </tr>
);

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("529-roth-rollover");
  const presetAccountOpenDate = (preset as { accountOpenDate?: unknown })?.accountOpenDate;
  const normalizedPreset =
    preset && typeof presetAccountOpenDate === "string"
      ? {
          ...preset,
          accountOpenDate: new Date(presetAccountOpenDate),
        }
      : preset;
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    beneficiaryAge: "age",
    earnedIncome: "annual_income",
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(() =>
    mergeDeep(DEFAULT_INPUTS, normalizedPreset ?? undefined)
  );
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );


  useEffect(() => {
    if (!normalizedPreset) return;
    setInputs((prev) => mergeDeep(prev, normalizedPreset));
  }, [normalizedPreset]);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const eligibility = results.eligibility;
  const eligibleThisYear =
    eligibility.meetsAccountAgeRequirement &&
    eligibility.hasSeasonedContributions &&
    eligibility.hasEarnedIncome;

  const lifetimeRemaining = Math.max(
    0,
    LIFETIME_529_TO_ROTH_LIMIT - inputs.priorRollovers
  );
  const lifetimeUsed = LIFETIME_529_TO_ROTH_LIMIT - lifetimeRemaining;
  const lifetimeProgress = lifetimeUsed / LIFETIME_529_TO_ROTH_LIMIT;

  const projectedAnnualLimit =
    inputs.beneficiaryAge >= 50
      ? IRA_CONTRIBUTION_LIMIT_2026 + IRA_CATCHUP_CONTRIBUTION_2026
      : IRA_CONTRIBUTION_LIMIT_2026;

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-3">
              Investing Planner
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              529-to-Roth IRA Rollover Planner
            </h1>
            <p className="text-lg text-neutral-400">
              Plan your SECURE 2.0 rollover timeline, track eligibility, and
              maximize tax-free Roth growth.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-2xl space-y-8">
            <LoadMyDataBanner
              isLoaded={memoryLoaded}
              hasData={memoryHasDefaults}
              isApplied={preFilledFields.size > 0}
              onApply={handleLoadData}
            />
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Your Information
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="529 Account Balance"
                  value={inputs.accountBalance}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, accountBalance: value }))
                  }
                  min={0}
                  max={500000}
                  step={1000}
                  format="currency"
                />

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">
                    529 Account Open Date
                  </label>
                  <input
                    type="date"
                    value={formatDateInput(inputs.accountOpenDate)}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        accountOpenDate: new Date(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white"
                  />
                </div>

                <SliderInput
                  label="Beneficiary Age"
                  value={inputs.beneficiaryAge}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, beneficiaryAge: value }))
                  }
                  min={0}
                  max={65}
                  step={1}
                  format="number"
                />

                <SliderInput
                  label="Beneficiary Earned Income"
                  value={inputs.earnedIncome}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, earnedIncome: value }))
                  }
                  min={0}
                  max={200000}
                  step={1000}
                  format="currency"
                />

                <SliderInput
                  label="Other IRA Contributions This Year"
                  value={inputs.otherIRAContributions}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      otherIRAContributions: value,
                    }))
                  }
                  min={0}
                  max={projectedAnnualLimit}
                  step={100}
                  format="currency"
                  description="Counts toward the annual IRA limit."
                />

                <SliderInput
                  label="Contributions Made 5+ Years Ago"
                  value={inputs.contributionsMade5YearsAgo}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      contributionsMade5YearsAgo: value,
                    }))
                  }
                  min={0}
                  max={500000}
                  step={1000}
                  format="currency"
                />

                <SliderInput
                  label="Prior 529-to-Roth Rollovers"
                  value={inputs.priorRollovers}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, priorRollovers: value }))
                  }
                  min={0}
                  max={35000}
                  step={500}
                  format="currency"
                />

                <SliderInput
                  label="Expected Investment Return"
                  value={inputs.expectedReturn}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, expectedReturn: value }))
                  }
                  min={0}
                  max={15}
                  step={0.5}
                  format="percent"
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
                  min={5}
                  max={50}
                  step={1}
                  format="number"
                />
              </div>
            </div>

            <ResultCard
              title="Maximum Rollover This Year"
              primaryValue={formatCurrency(results.currentYearMax.maxRolloverThisYear, 0)}
              primaryLabel={
                eligibleThisYear
                  ? "Available tax-free rollover based on SECURE 2.0 limits"
                  : "Complete eligibility requirements to roll over"
              }
              items={[
                {
                  label: "Annual IRA limit",
                  value: formatCurrency(results.currentYearMax.annualIRALimit, 0),
                },
                {
                  label: "After other IRA contributions",
                  value: formatCurrency(
                    results.currentYearMax.reducedByOtherContributions,
                    0
                  ),
                },
                {
                  label: "Limited by earned income",
                  value: formatCurrency(
                    results.currentYearMax.limitedByEarnedIncome,
                    0
                  ),
                },
                {
                  label: "Seasoned contributions available",
                  value: formatCurrency(
                    results.currentYearMax.limitedBySeasonedContributions,
                    0
                  ),
                },
                {
                  label: "Lifetime limit remaining",
                  value: formatCurrency(lifetimeRemaining, 0),
                  highlight: true,
                },
              ]}
              variant="purple"
            />

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Eligibility Status
                  </h2>
                  <p className="text-sm text-neutral-400">
                    SECURE 2.0 rules you must meet to roll over funds.
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    eligibleThisYear
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {eligibleThisYear ? "Eligible" : "Not Eligible"}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {eligibilityChecklist.map((item, index) => {
                  const status =
                    index === 0
                      ? eligibility.meetsAccountAgeRequirement
                      : index === 1
                        ? eligibility.hasSeasonedContributions
                        : eligibility.hasEarnedIncome;

                  const detail =
                    index === 0
                      ? `${eligibility.accountAgeYears} years old`
                      : index === 1
                        ? `${formatCurrency(eligibility.seasonedAmount, 0)} seasoned`
                        : `${formatCurrency(inputs.earnedIncome, 0)} income`;

                  return (
                    <div
                      key={item.title}
                      className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                    >
                      <p className="text-xs uppercase tracking-widest text-neutral-500">
                        Requirement {index + 1}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        {item.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span
                          className={`text-sm font-semibold ${getStatusColor(
                            status
                          )}`}
                        >
                          {status ? "Met" : "Pending"}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {detail}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!eligibility.meetsAccountAgeRequirement && (
                <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm text-purple-100">
                  <p className="font-semibold">
                    {formatNumber(eligibility.yearsUntilEligible)} years until
                    your 529 meets the 15-year rule.
                  </p>
                  <p className="mt-2 text-xs text-purple-200/80">
                    Keep contributions in the account to continue seasoning for
                    future rollovers.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Lifetime Limit Tracker
              </h2>
              <div className="flex items-center justify-between text-sm text-neutral-400">
                <span>{formatCurrency(lifetimeUsed, 0)} used</span>
                <span>{formatCurrency(lifetimeRemaining, 0)} remaining</span>
              </div>
              <div className="h-3 rounded-full bg-neutral-800">
                <div
                  className="h-3 rounded-full bg-purple-500"
                  style={{ width: `${lifetimeProgress * 100}%` }}
                />
              </div>
              <p className="text-xs text-neutral-500">
                Lifetime rollover cap is {formatCurrency(LIFETIME_529_TO_ROTH_LIMIT, 0)} per
                beneficiary.
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Multi-Year Rollover Schedule
              </h2>
              <p className="text-sm text-neutral-400">
                Projected using the annual IRA limit of {formatCurrency(projectedAnnualLimit, 0)} and
                today’s seasoned contributions.
              </p>
              {results.rolloverSchedule.length > 0 ? (
                <div className="overflow-hidden rounded-xl border border-neutral-800">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-950 text-xs uppercase tracking-widest text-neutral-500">
                      <tr>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3">Rollover Amount</th>
                        <th className="px-4 py-3">Cumulative Rolled</th>
                        <th className="px-4 py-3">Lifetime Remaining</th>
                      </tr>
                    </thead>
                    <tbody className="px-4">
                      {results.rolloverSchedule.map(formatScheduleRow)}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-400">
                  Add seasoned contributions and meet eligibility rules to see a
                  multi-year rollover schedule.
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Tax-Free Growth Projection
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Total Rolled
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatCurrency(results.projectedBenefit.totalRolled, 0)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Over {formatYears(results.projectedBenefit.yearsOfGrowth)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Projected Roth Value
                  </p>
                  <p className="mt-2 text-2xl font-bold text-purple-300">
                    {formatCurrency(results.projectedBenefit.projectedValue, 0)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Tax-free growth: {formatCurrency(results.projectedBenefit.taxFreeGrowth, 0)}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4 text-sm text-purple-100">
                Assumes {formatPercent(inputs.expectedReturn / 100)} annual return, compounded
                yearly until retirement.
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Compare Your Exit Strategies
              </h2>
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    529 → Roth Rollover
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatCurrency(results.alternativeComparison.rolloverStrategy.netValue, 0)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Taxes paid: {formatCurrency(results.alternativeComparison.rolloverStrategy.taxPaid, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Non-Qualified Withdrawal
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatCurrency(results.alternativeComparison.nonQualifiedWithdrawal.netValue, 0)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Taxes: {formatCurrency(results.alternativeComparison.nonQualifiedWithdrawal.taxPaid, 0)}
                  </p>
                  <p className="text-xs text-neutral-500">
                    Penalty: {formatCurrency(results.alternativeComparison.nonQualifiedWithdrawal.penalty, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Keep for 529 Expenses
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatCurrency(results.alternativeComparison.keepFor529Expenses.value, 0)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {results.alternativeComparison.keepFor529Expenses.notes}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Action Checklist
              </h2>
              <ul className="space-y-3 text-sm text-neutral-400">
                {actionChecklist.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-purple-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <MethodologySection>
              <p>
                We calculate eligibility based on SECURE 2.0 Section 126 rules: the 529 must
                be open at least {ACCOUNT_AGE_REQUIREMENT_YEARS} years, only
                contributions older than {CONTRIBUTION_SEASONING_YEARS} years
                qualify, and the beneficiary must have earned income. Rollovers
                count toward the annual IRA contribution limit.
              </p>
              <p>
                Annual rollovers are limited to the IRA contribution limit
                ({formatCurrency(IRA_CONTRIBUTION_LIMIT_2026, 0)} in 2026, plus
                a {formatCurrency(IRA_CATCHUP_CONTRIBUTION_2026, 0)} catch-up
                for age 50+), reduced by any other IRA contributions made that year.
                We also enforce the {formatCurrency(LIFETIME_529_TO_ROTH_LIMIT, 0)} lifetime cap per beneficiary.
              </p>
              <p>
                Growth projections assume a constant return of {formatPercent(inputs.expectedReturn / 100)} compounded
                annually until retirement. The non-qualified withdrawal comparison estimates taxes
                at 22% plus a 10% penalty on earnings only. We estimate earnings as the difference
                between account balance and seasoned contributions.
              </p>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
