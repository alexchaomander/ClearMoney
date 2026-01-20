"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { ResultCard } from "@/components/shared/ResultCard";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/total-compensation/calculations";
import type {
  CalculatorInputs,
  YearlyBreakdown,
  VestingSchedule,
} from "@/lib/calculators/total-compensation/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  baseSalary: 180000,
  targetBonus: 15,
  expectedBonusMultiplier: 100,
  rsuGrant: {
    totalValue: 200000,
    vestingSchedule: "standard",
    vestingYears: 4,
    currentPrice: 150,
    grantPrice: 150,
  },
  signOnBonus: 0,
  signOnVestingYears: 1,
  match401k: 4,
  match401kLimit: 11600,
  esppDiscount: 15,
  esppContribution: 10000,
  hsaContribution: 500,
  annualRefresher: 50000,
  refresherVestingYears: 4,
};

const vestingOptions: Array<{
  value: VestingSchedule;
  label: string;
  description: string;
}> = [
  {
    value: "standard",
    label: "Standard 25% / year",
    description: "Equal vesting each year over the grant period.",
  },
  {
    value: "amazon",
    label: "Amazon 5/15/40/40",
    description: "Backloaded with most value in years 3-4.",
  },
  {
    value: "cliff_monthly",
    label: "1-year cliff then monthly",
    description: "No vesting year 1, then even monthly schedule.",
  },
];

function YearlyChart({ breakdowns }: { breakdowns: YearlyBreakdown[] }) {
  const chartData = breakdowns.slice(0, 4);
  const maxValue = Math.max(...chartData.map((row) => row.totalCompensation), 0);

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Year-by-Year Totals</h3>
        <span className="text-xs text-neutral-400">First 4 years</span>
      </div>
      <div className="grid grid-cols-4 gap-3 items-end h-48">
        {chartData.map((row) => {
          const height = maxValue > 0 ? (row.totalCompensation / maxValue) * 100 : 0;
          return (
            <div
              key={row.year}
              className="flex flex-col items-center gap-2"
              title={`Year ${row.year}: ${formatCurrency(row.totalCompensation)}`}
            >
              <div className="w-full h-40 bg-neutral-800 rounded-xl flex items-end overflow-hidden">
                <div
                  className="w-full bg-blue-500/80"
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="text-xs text-neutral-400">Year {row.year}</span>
              <span className="text-[11px] text-neutral-500">
                {formatCurrency(row.totalCompensation)}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-neutral-500">
        Bars represent total annual compensation after vesting, bonuses, and
        benefits.
      </p>
    </div>
  );
}

function BreakdownTable({ breakdowns }: { breakdowns: YearlyBreakdown[] }) {
  const rows = breakdowns.slice(0, 4);
  const totalRefreshers = rows.reduce((sum, row) => sum + row.refresherValue, 0);
  const totalSignOn = rows.reduce((sum, row) => sum + row.signOnPortion, 0);
  const totalMatch = rows.reduce((sum, row) => sum + row.match401k, 0);
  const totalEspp = rows.reduce((sum, row) => sum + row.esppBenefit, 0);
  const totalHsa = rows.reduce((sum, row) => sum + row.hsaContribution, 0);

  const breakdownRows = [
    {
      label: "Base salary",
      values: rows.map((row) => row.baseSalary),
      total: rows.reduce((sum, row) => sum + row.baseSalary, 0),
    },
    {
      label: "Bonus",
      values: rows.map((row) => row.bonus),
      total: rows.reduce((sum, row) => sum + row.bonus, 0),
    },
    {
      label: "RSUs",
      values: rows.map((row) => row.rsuValue),
      total: rows.reduce((sum, row) => sum + row.rsuValue, 0),
    },
    {
      label: "Sign-on bonus",
      values: rows.map((row) => row.signOnPortion),
      total: totalSignOn,
    },
    {
      label: "401(k) match",
      values: rows.map((row) => row.match401k),
      total: totalMatch,
    },
    {
      label: "ESPP benefit",
      values: rows.map((row) => row.esppBenefit),
      total: totalEspp,
    },
    {
      label: "HSA contribution",
      values: rows.map((row) => row.hsaContribution),
      total: totalHsa,
    },
    {
      label: "Refreshers",
      values: rows.map((row) => row.refresherValue),
      total: totalRefreshers,
    },
  ];

  return (
    <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Comp Breakdown</h3>
        <span className="text-xs text-neutral-400">Year 1-4</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-neutral-500 border-b border-neutral-800">
              <th className="py-2 text-left font-semibold">Component</th>
              {rows.map((row) => (
                <th key={row.year} className="py-2 text-right font-semibold">
                  Y{row.year}
                </th>
              ))}
              <th className="py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {breakdownRows.map((row) => (
              <tr key={row.label} className="border-b border-neutral-800/60">
                <td className="py-3 text-neutral-300 font-medium">{row.label}</td>
                {row.values.map((value, index) => (
                  <td key={index} className="py-3 text-right text-neutral-400">
                    {formatCurrency(value)}
                  </td>
                ))}
                <td className="py-3 text-right text-white font-semibold">
                  {formatCurrency(row.total)}
                </td>
              </tr>
            ))}
            <tr className="bg-blue-500/10">
              <td className="py-3 text-blue-200 font-semibold">Total comp</td>
              {rows.map((row) => (
                <td key={row.year} className="py-3 text-right text-blue-200">
                  {formatCurrency(row.totalCompensation)}
                </td>
              ))}
              <td className="py-3 text-right text-blue-200 font-semibold">
                {formatCurrency(
                  rows.reduce((sum, row) => sum + row.totalCompensation, 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const yearlyRows = results.yearlyBreakdowns.slice(0, 4);
  const fourYearTotal = yearlyRows.reduce(
    (sum, row) => sum + row.totalCompensation,
    0
  );

  return (
    <AppShell>
      <div className="px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl space-y-12">
          <section className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-sm text-blue-300">
              Total Compensation Calculator
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Total Compensation Calculator
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto">
              Understand your true pay—base, bonus, RSUs, and everything else.
              Compare offers with realistic vesting and benefit assumptions.
            </p>
          </section>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-8">
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Base Pay</h2>
                  <p className="text-sm text-neutral-400">
                    Salary and bonus expectations for this role.
                  </p>
                </div>
                <SliderInput
                  label="Base Salary"
                  value={inputs.baseSalary}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, baseSalary: value }))
                  }
                  min={0}
                  max={1_000_000}
                  step={5000}
                  format="currency"
                />
                <SliderInput
                  label="Target Bonus %"
                  value={inputs.targetBonus}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, targetBonus: value }))
                  }
                  min={0}
                  max={100}
                  step={5}
                  format="percent"
                />
                <SliderInput
                  label="Expected Bonus Multiplier"
                  value={inputs.expectedBonusMultiplier}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, expectedBonusMultiplier: value }))
                  }
                  min={0}
                  max={200}
                  step={10}
                  format="percent"
                  description="100% means you expect to hit target bonus."
                />
              </div>

              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Equity</h2>
                  <p className="text-sm text-neutral-400">
                    RSU grant details and vesting assumptions.
                  </p>
                </div>
                <SliderInput
                  label="Total RSU Grant Value"
                  value={inputs.rsuGrant.totalValue}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      rsuGrant: { ...prev.rsuGrant, totalValue: value },
                    }))
                  }
                  min={0}
                  max={2_000_000}
                  step={10_000}
                  format="currency"
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-300">
                    Vesting Schedule
                  </label>
                  <select
                    value={inputs.rsuGrant.vestingSchedule}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        rsuGrant: {
                          ...prev.rsuGrant,
                          vestingSchedule: event.target.value as VestingSchedule,
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  >
                    {vestingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-neutral-500">
                    {
                      vestingOptions.find(
                        (option) => option.value === inputs.rsuGrant.vestingSchedule
                      )?.description
                    }
                  </p>
                </div>
                <SliderInput
                  label="Vesting Period (years)"
                  value={inputs.rsuGrant.vestingYears}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      rsuGrant: { ...prev.rsuGrant, vestingYears: value },
                    }))
                  }
                  min={1}
                  max={5}
                  step={1}
                  format="number"
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <SliderInput
                    label="Current Stock Price"
                    value={inputs.rsuGrant.currentPrice}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        rsuGrant: { ...prev.rsuGrant, currentPrice: value },
                      }))
                    }
                    min={1}
                    max={5000}
                    step={1}
                    format="currency"
                  />
                  <SliderInput
                    label="Grant Stock Price"
                    value={inputs.rsuGrant.grantPrice}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        rsuGrant: { ...prev.rsuGrant, grantPrice: value },
                      }))
                    }
                    min={1}
                    max={5000}
                    step={1}
                    format="currency"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Sign-On</h2>
                  <p className="text-sm text-neutral-400">
                    Upfront bonus and how long it is amortized.
                  </p>
                </div>
                <SliderInput
                  label="Sign-On Bonus"
                  value={inputs.signOnBonus}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, signOnBonus: value }))
                  }
                  min={0}
                  max={500_000}
                  step={5000}
                  format="currency"
                />
                <SliderInput
                  label="Sign-On Amortization Years"
                  value={inputs.signOnVestingYears}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, signOnVestingYears: value }))
                  }
                  min={1}
                  max={4}
                  step={1}
                  format="number"
                />
              </div>

              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Benefits</h2>
                  <p className="text-sm text-neutral-400">
                    Common benefits that meaningfully add to total comp.
                  </p>
                </div>
                <SliderInput
                  label="401(k) Match %"
                  value={inputs.match401k}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, match401k: value }))
                  }
                  min={0}
                  max={10}
                  step={1}
                  format="percent"
                />
                <SliderInput
                  label="401(k) Match Limit"
                  value={inputs.match401kLimit}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, match401kLimit: value }))
                  }
                  min={0}
                  max={50_000}
                  step={500}
                  format="currency"
                />
                <SliderInput
                  label="ESPP Discount %"
                  value={inputs.esppDiscount}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, esppDiscount: value }))
                  }
                  min={0}
                  max={15}
                  step={1}
                  format="percent"
                />
                <SliderInput
                  label="Annual ESPP Contribution"
                  value={inputs.esppContribution}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, esppContribution: value }))
                  }
                  min={0}
                  max={25_000}
                  step={500}
                  format="currency"
                />
                <SliderInput
                  label="Employer HSA Contribution"
                  value={inputs.hsaContribution}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, hsaContribution: value }))
                  }
                  min={0}
                  max={5000}
                  step={100}
                  format="currency"
                />
              </div>

              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Refreshers</h2>
                  <p className="text-sm text-neutral-400">
                    Optional annual equity grants that stack on top of the
                    original grant.
                  </p>
                </div>
                <SliderInput
                  label="Expected Annual Refresher"
                  value={inputs.annualRefresher}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, annualRefresher: value }))
                  }
                  min={0}
                  max={250_000}
                  step={5000}
                  format="currency"
                />
                <SliderInput
                  label="Refresher Vesting Years"
                  value={inputs.refresherVestingYears}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, refresherVestingYears: value }))
                  }
                  min={1}
                  max={4}
                  step={1}
                  format="number"
                />
              </div>
            </div>

            <div className="space-y-6">
              <ResultCard
                title="The Big Picture"
                primaryValue={formatCurrency(results.averageAnnual)}
                primaryLabel="Average annual compensation (4-year avg)"
                items={[
                  {
                    label: "Year 1",
                    value: formatCurrency(results.year1Total),
                  },
                  {
                    label: "Year 2",
                    value: formatCurrency(results.year2Total),
                  },
                  {
                    label: "Year 3",
                    value: formatCurrency(results.year3Total),
                  },
                  {
                    label: "Year 4",
                    value: formatCurrency(results.year4Total),
                  },
                  {
                    label: "4-year total",
                    value: formatCurrency(fourYearTotal),
                    highlight: true,
                  },
                ]}
                variant="blue"
              />

              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">Insights</h3>
                <div className="space-y-4">
                  <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      RSU share of comp
                    </p>
                    <p className="text-2xl font-semibold text-blue-200">
                      {formatPercent(results.rsuPercentOfComp, 1, true)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Higher equity concentration means more stock price risk.
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Year 1 vs Year 4
                    </p>
                    <p className="text-2xl font-semibold text-blue-200">
                      {formatCurrency(results.year1VsYear4Difference)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Shows how much backloading changes your pay trajectory.
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-4">
                    <p className="text-xs uppercase tracking-wide text-neutral-500">
                      Effective hourly rate
                    </p>
                    <p className="text-2xl font-semibold text-blue-200">
                      {formatCurrency(results.effectiveHourlyRate, 2)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Based on a 2,080-hour working year.
                    </p>
                  </div>
                </div>
              </div>

              {results.warnings.length > 0 && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-amber-100">
                    Watchouts
                  </h3>
                  <ul className="space-y-2 text-sm text-amber-100">
                    {results.warnings.map((warning, index) => (
                      <li key={index} className="flex gap-2">
                        <span>⚠️</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <YearlyChart breakdowns={yearlyRows} />
            <BreakdownTable breakdowns={yearlyRows} />
          </section>

          <section className="space-y-6">
            <MethodologySection>
              <div className="space-y-4 text-sm">
                <p>
                  We calculate total compensation by adding base salary, bonus,
                  vested RSU value, and benefits for each year. Stock grants are
                  adjusted by the ratio of current price to grant price so you can
                  model price changes.
                </p>
                <p>
                  Vesting schedules follow common patterns: standard 25% per year,
                  Amazon&apos;s 5/15/40/40 backload, or a 1-year cliff with even
                  monthly vesting after the cliff. Refreshers assume a new annual
                  grant that vests evenly over the selected period.
                </p>
                <p>
                  ESPP benefit assumes an immediate sale at the discount (15%
                  discount ≈ 17.6% gain). 401(k) match is capped at the limit you
                  provide.
                </p>
              </div>
            </MethodologySection>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
