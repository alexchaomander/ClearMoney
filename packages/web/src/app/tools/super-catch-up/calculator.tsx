"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
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
  formatNumber,
  formatPercent,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/super-catch-up/calculations";
import {
  LIMITS_2026,
  SUPER_CATCH_UP_AGES,
} from "@/lib/calculators/super-catch-up/constants";
import type { CalculatorInputs } from "@/lib/calculators/super-catch-up/types";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";

const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 58,
  birthDate: "",
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

const FILING_STATUS_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head_of_household", label: "Head of household" },
] as const;

const mapFilingStatus = (
  value: unknown
): CalculatorInputs["filingStatus"] | null => {
  if (value === "married_filing_jointly" || value === "married_filing_separately") {
    return "married";
  }
  if (value === "single" || value === "head_of_household") return value;
  return null;
};

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("super-catch-up");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    currentAge: "age",
    annualSalary: "annual_income",
    currentBalance: "current_retirement_savings",
    priorYearWages: "annual_income",
    retirementAge: "retirement_age",
    employerMatchPercent: [
      "employer_match_pct",
      (value: unknown) => (typeof value === "number" ? value * 100 : null),
    ],
    filingStatus: ["filing_status", mapFilingStatus],
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

  const currentYear = new Date().getFullYear();
  const projections = results.projections.superCatchUp;
  const retirementYear = projections[projections.length - 1]?.year ?? currentYear;

  const chartData = projections.map((projection, index) => ({
    year: projection.year,
    super: projection.yearEndBalance,
    regular: results.projections.regularCatchUp[index]?.yearEndBalance ?? 0,
    none: results.projections.noCatchUp[index]?.yearEndBalance ?? 0,
  }));

  const eligibilityLabel = results.eligibility.currentlyEligible
    ? "Eligible now"
    : results.eligibility.yearsUntilEligible > 0
    ? `${results.eligibility.yearsUntilEligible} year${
        results.eligibility.yearsUntilEligible === 1 ? "" : "s"
      } until eligible`
    : "Window passed";

  const comparisonWinner =
    results.comparison.withSuperCatchUp.balanceAtRetirement >=
    results.comparison.withRegularCatchUp.balanceAtRetirement
      ? "left"
      : "right";

  const maxBalance = Math.max(
    results.comparison.withSuperCatchUp.balanceAtRetirement,
    results.comparison.withRegularCatchUp.balanceAtRetirement,
    results.comparison.withNoCatchUp.balanceAtRetirement
  );

  const superCatchUpWindow = SUPER_CATCH_UP_AGES.map((age) => {
    const projection = results.fourYearPlan.find((item) => item.age === age);
    const projectedYear = currentYear + (age - results.eligibility.effectiveAge);
    const isMissed = age < results.eligibility.effectiveAge;
    const isRetired = age > inputs.retirementAge;
    const status = isRetired
      ? "Retired"
      : isMissed
      ? "Missed"
      : projection
      ? "Available"
      : "Upcoming";

    return {
      age,
      year: projection?.year ?? projectedYear,
      totalLimit: projection?.totalLimit ?? LIMITS_2026.base401k,
      catchUpLimit: projection?.catchUpLimit ?? 0,
      status,
    };
  });

  const retirementIncomeComparison = [
    {
      label: "Super catch-up",
      value: results.comparison.withSuperCatchUp.balanceAtRetirement,
      income: results.comparison.withSuperCatchUp.monthlyIncome4Percent,
      highlight:
        results.comparison.withSuperCatchUp.balanceAtRetirement === maxBalance,
    },
    {
      label: "Regular catch-up",
      value: results.comparison.withRegularCatchUp.balanceAtRetirement,
      income: results.comparison.withRegularCatchUp.monthlyIncome4Percent,
      highlight:
        results.comparison.withRegularCatchUp.balanceAtRetirement === maxBalance,
    },
    {
      label: "No catch-up",
      value: results.comparison.withNoCatchUp.balanceAtRetirement,
      income: results.comparison.withNoCatchUp.monthlyIncome4Percent,
      highlight: results.comparison.withNoCatchUp.balanceAtRetirement === maxBalance,
    },
  ];

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            4-year opportunity window
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            Super Catch-Up Optimizer (Ages 60-63)
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Plan ahead to maximize the SECURE 2.0 super catch-up limit and capture
            every extra dollar available in the 4-year window.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[1.2fr,1fr]">
          <div className="space-y-6">
            <LoadMyDataBanner
              isLoaded={memoryLoaded}
              hasData={memoryHasDefaults}
              isApplied={preFilledFields.size > 0}
              onApply={handleLoadData}
            />
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Eligibility snapshot</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Eligibility is based on your age at the end of the calendar year.
              </p>

              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Current Age"
                  value={inputs.currentAge}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, currentAge: value }))
                  }
                  min={50}
                  max={70}
                  step={1}
                  format="number"
                />

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Birth date
                  </label>
                  <input
                    type="date"
                    value={inputs.birthDate}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        birthDate: event.target.value,
                      }))
                    }
                    className="mt-3 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                  />
                  <p className="mt-2 text-xs text-neutral-500">
                    Optional—enter to auto-calculate age for eligibility.
                  </p>
                </div>

                <SliderInput
                  label="Planned Retirement Age"
                  value={inputs.retirementAge}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, retirementAge: value }))
                  }
                  min={55}
                  max={75}
                  step={1}
                  format="number"
                />

                <div>
                  <label className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                    Filing status
                  </label>
                  <select
                    value={inputs.filingStatus}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        filingStatus: event.target.value as CalculatorInputs["filingStatus"],
                      }))
                    }
                    className="mt-3 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                  >
                    {FILING_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Eligibility status
                    </p>
                    <p className="text-xs text-neutral-400">
                      Effective age used for calculations: {results.eligibility.effectiveAge}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      results.eligibility.currentlyEligible
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-neutral-800 text-neutral-300"
                    }`}
                  >
                    {eligibilityLabel}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Super catch-up years left
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatNumber(results.eligibility.superCatchUpYears.length)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Years missed
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      {formatNumber(results.eligibility.missedYears.length)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Contribution inputs</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Estimate contributions, match, and growth to project your retirement
                outcome.
              </p>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Current 401(k) Balance"
                  value={inputs.currentBalance}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, currentBalance: value }))
                  }
                  min={0}
                  max={5000000}
                  step={10000}
                  format="currency"
                />
                <SliderInput
                  label="Annual Salary"
                  value={inputs.annualSalary}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, annualSalary: value }))
                  }
                  min={0}
                  max={1000000}
                  step={5000}
                  format="currency"
                />
                <SliderInput
                  label="Current Contribution Rate"
                  value={inputs.contributionRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, contributionRate: value }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  format="percent"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Employer match</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Capture the match to maximize total retirement contributions.
              </p>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Employer Match %"
                  value={inputs.employerMatchPercent}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, employerMatchPercent: value }))
                  }
                  min={0}
                  max={10}
                  step={0.5}
                  format="percent"
                />
                <SliderInput
                  label="Employer Match Cap"
                  value={inputs.employerMatchCap}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, employerMatchCap: value }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  format="percent"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Assumptions</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Expected return and prior-year wages affect eligibility and growth.
              </p>
              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Expected Return"
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
                  label="Prior Year W-2 Wages"
                  value={inputs.priorYearWages}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, priorYearWages: value }))
                  }
                  min={0}
                  max={1000000}
                  step={5000}
                  format="currency"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <ResultCard
              title="Super catch-up value"
              primaryValue={formatCurrency(results.valueOfSuperCatchUp.totalExtraWealth)}
              primaryLabel="Estimated extra wealth at retirement"
              items={[
                {
                  label: "Extra contributions",
                  value: formatCurrency(
                    results.valueOfSuperCatchUp.extraContributionsOver4Years
                  ),
                },
                {
                  label: "Extra growth",
                  value: formatCurrency(results.valueOfSuperCatchUp.extraGrowthByRetirement),
                },
                {
                  label: "Monthly income boost",
                  value: formatCurrency(
                    results.valueOfSuperCatchUp.monthlyRetirementIncomeIncrease
                  ),
                  highlight: true,
                },
              ]}
              variant="amber"
            />

            <ResultCard
              title="Retirement balance (super catch-up)"
              primaryValue={formatCurrency(
                results.comparison.withSuperCatchUp.balanceAtRetirement
              )}
              primaryLabel="Projected balance at retirement"
              items={[
                {
                  label: "Monthly income (4% rule)",
                  value: formatCurrency(
                    results.comparison.withSuperCatchUp.monthlyIncome4Percent
                  ),
                },
                {
                  label: "Employer match (year 1)",
                  value: formatCurrency(results.cashFlow.employerMatchPerYear),
                },
                {
                  label: "Monthly needed to max limit",
                  value: formatCurrency(results.cashFlow.monthlyEmployeeMax),
                  highlight: true,
                },
              ]}
              variant="emerald"
            />

            <div
              className={`rounded-2xl border p-6 ${
                results.rothRequirement.required
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-neutral-800 bg-neutral-900"
              }`}
            >
              <h3 className="text-lg font-semibold text-white">Roth catch-up rule</h3>
              <p className="mt-2 text-sm text-neutral-400">
                {results.rothRequirement.reason}
              </p>
              {results.rothRequirement.required && (
                <div className="mt-4 rounded-lg bg-neutral-950/70 p-3 text-xs text-amber-200">
                  High earners must route catch-up dollars to Roth accounts—plan for
                  after-tax contributions.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">4-year super catch-up map</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Ages 60-63 are your only years to capture the enhanced catch-up limit.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {superCatchUpWindow.map((window) => (
                <div
                  key={window.age}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Age {window.age}</p>
                    <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs text-amber-200">
                      {window.status}
                    </span>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    {window.year}
                  </p>
                  <p className="mt-3 text-lg font-semibold text-white">
                    {formatCurrency(window.totalLimit)}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    Catch-up: {formatCurrency(window.catchUpLimit)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Balance projection</h2>
              <p className="mt-2 text-sm text-neutral-400">
                See how super catch-up contributions grow your 401(k) balance versus
                regular or no catch-up contributions.
              </p>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ left: 8, right: 24 }}>
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
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{
                        position: "top",
                        value: "Retirement",
                        fill: "#f59e0b",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="super"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      dot={false}
                      name="Super catch-up"
                    />
                    <Line
                      type="monotone"
                      dataKey="regular"
                      stroke="#38bdf8"
                      strokeWidth={2}
                      dot={false}
                      name="Regular catch-up"
                    />
                    <Line
                      type="monotone"
                      dataKey="none"
                      stroke="#64748b"
                      strokeWidth={2}
                      dot={false}
                      name="No catch-up"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <h2 className="text-xl font-semibold text-white">Contribution limits</h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Compare the regular and super catch-up limits for 2026.
                </p>
                <div className="mt-6 space-y-3 text-sm text-neutral-300">
                  <div className="flex justify-between">
                    <span>Base 401(k) limit</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(LIMITS_2026.base401k)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular catch-up (50+)</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(LIMITS_2026.regularCatchUp)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Super catch-up (60-63)</span>
                    <span className="font-semibold text-amber-300">
                      {formatCurrency(LIMITS_2026.superCatchUp)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-800 pt-3">
                    <span>Total with super catch-up</span>
                    <span className="font-semibold text-white">
                      {formatCurrency(LIMITS_2026.totalWithSuperCatchUp)}
                    </span>
                  </div>
                </div>
              </div>

              <ComparisonCard
                title="Retirement balance comparison"
                leftTitle="Super catch-up"
                leftValue={formatCurrency(
                  results.comparison.withSuperCatchUp.balanceAtRetirement
                )}
                rightTitle="Regular catch-up"
                rightValue={formatCurrency(
                  results.comparison.withRegularCatchUp.balanceAtRetirement
                )}
                winner={comparisonWinner}
                leftItems={[
                  {
                    label: "Monthly income",
                    value: formatCurrency(
                      results.comparison.withSuperCatchUp.monthlyIncome4Percent
                    ),
                  },
                ]}
                rightItems={[
                  {
                    label: "Monthly income",
                    value: formatCurrency(
                      results.comparison.withRegularCatchUp.monthlyIncome4Percent
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Scenario outcomes</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Compare balances and retirement income across all three contribution
              strategies.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {retirementIncomeComparison.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    {item.label}
                  </p>
                  <p
                    className={`mt-2 text-2xl font-semibold ${
                      item.highlight ? "text-amber-300" : "text-white"
                    }`}
                  >
                    {formatCurrency(item.value)}
                  </p>
                  <p className="mt-2 text-xs text-neutral-400">
                    Monthly income: {formatCurrency(item.income)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr,1fr]">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Action checklist</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Use this checklist to stay on track through the 4-year window.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-neutral-200">
                {results.recommendations.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="text-amber-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <ResultCard
              title="Regular vs super catch-up"
              primaryValue={formatCurrency(
                results.valueOfSuperCatchUp.extraContributionsOver4Years
              )}
              primaryLabel="Extra contributions available"
              items={[
                {
                  label: "Extra per year",
                  value: formatCurrency(
                    LIMITS_2026.superCatchUp - LIMITS_2026.regularCatchUp
                  ),
                },
                {
                  label: "Projected total extra wealth",
                  value: formatCurrency(results.valueOfSuperCatchUp.totalExtraWealth),
                },
                {
                  label: "Expected return assumption",
                  value: formatPercent(inputs.expectedReturn / 100, 1),
                },
              ]}
              variant="amber"
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <MethodologySection title="Methodology & SECURE 2.0 rules">
            <div className="space-y-4 text-sm text-neutral-400">
              <p>
                The calculator applies the 2026 SECURE 2.0 limits: $24,500 base
                401(k) deferral, $8,000 regular catch-up (age 50+), and $11,250
                super catch-up for ages 60-63. It assumes your eligibility is based
                on your age at the end of each calendar year.
              </p>
              <p>
                Contributions are capped at the applicable employee limit each year.
                Employer match is estimated on your deferral rate up to the match
                cap. Balances grow annually using your expected return assumption.
              </p>
              <p>
                The &quot;value of super catch-up&quot; uses the $3,250 annual difference
                between regular and super catch-up limits and compounds that extra
                amount to retirement using the midpoint of ages 60-63.
              </p>
              <p>
                Roth catch-up requirements apply when prior-year W-2 wages exceed
                $150,000, meaning catch-up dollars must be Roth starting in 2026.
                This tool is educational only and not tax advice.
              </p>
            </div>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
