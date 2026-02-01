"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, MethodologySection, SliderInput } from "@/components/shared";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/investment-growth/calculations";
import type { CalculatorInputs } from "@/lib/calculators/investment-growth/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  initialInvestment: 10000,
  monthlyContribution: 500,
  annualReturnRate: 7,
  investmentHorizon: 20,
  inflationRate: 3,
};

export function Calculator() {
  const { defaults: memoryDefaults, preFilledFields, isLoaded: memoryLoaded } = useMemoryPreFill<CalculatorInputs>({
    monthlyContribution: ["annual_income", (v: unknown) => Math.round(Number(v) * 0.15 / 12)],
    investmentHorizon: "investment_horizon_years",
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const [showTimeline, setShowTimeline] = useState(false);

  useEffect(() => {
    if (memoryLoaded) {
      setInputs(prev => ({ ...prev, ...memoryDefaults }));
    }
  }, [memoryLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => calculate(inputs), [inputs]);

  const growthPercent =
    results.finalBalance > 0
      ? (results.totalGrowth / results.finalBalance) * 100
      : 0;
  const contributionPercent =
    results.finalBalance > 0
      ? (results.totalContributions / results.finalBalance) * 100
      : 0;

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
            Investment Growth Calculator
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            See your money compound over time.
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Project how your investments grow with regular contributions and
            compound returns, and understand the real impact of inflation.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          {/* --- Left column: Inputs --- */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Investment Details
              </h2>

              <SliderInput
                label="Initial Investment"
                value={inputs.initialInvestment}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, initialInvestment: value }))
                }
                min={0}
                max={500000}
                step={1000}
                format="currency"
              />

              <SliderInput
                label="Monthly Contribution"
                value={inputs.monthlyContribution}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, monthlyContribution: value }))
                }
                min={0}
                max={10000}
                step={50}
                format="currency"
              />
              {preFilledFields.has("monthlyContribution") && (
                <div className="-mt-4 mb-2 ml-1">
                  <MemoryBadge field="monthlyContribution" preFilledFields={preFilledFields} />
                </div>
              )}

              <SliderInput
                label="Annual Return Rate"
                value={inputs.annualReturnRate}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, annualReturnRate: value }))
                }
                min={0}
                max={15}
                step={0.5}
                format="percent"
              />

              <SliderInput
                label="Investment Horizon"
                value={inputs.investmentHorizon}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, investmentHorizon: value }))
                }
                min={1}
                max={50}
                step={1}
                format="number"
                description="Years"
              />
              {preFilledFields.has("investmentHorizon") && (
                <div className="-mt-4 mb-2 ml-1">
                  <MemoryBadge field="investmentHorizon" preFilledFields={preFilledFields} />
                </div>
              )}

              <SliderInput
                label="Inflation Rate"
                value={inputs.inflationRate}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, inflationRate: value }))
                }
                min={0}
                max={10}
                step={0.5}
                format="percent"
              />
            </div>
          </div>

          {/* --- Right column: Results --- */}
          <div className="space-y-6">
            {/* Hero result */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Projected Balance
                </p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {formatCurrency(results.finalBalance)}
                </p>
                <p className="mt-1 text-sm text-neutral-400">
                  After {formatNumber(inputs.investmentHorizon)} years at{" "}
                  {formatPercent(inputs.annualReturnRate, 1, true)} annual return
                </p>
              </div>
              <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
                <p className="text-sm text-blue-100">
                  {results.recommendation}
                </p>
              </div>
            </div>

            {/* Breakdown cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Total Contributions
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatCurrency(results.totalContributions)}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatPercent(contributionPercent, 1, true)} of final balance
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Investment Growth
                </p>
                <p className="text-2xl font-bold text-emerald-400">
                  {formatCurrency(results.totalGrowth)}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatPercent(growthPercent, 1, true)} of final balance
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Real Value (Inflation-Adjusted)
                </p>
                <p className="text-2xl font-bold text-amber-300">
                  {formatCurrency(results.realFinalBalance)}
                </p>
                <p className="text-xs text-neutral-500">
                  Purchasing power in today&apos;s dollars
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Effective Growth Rate
                </p>
                <p className="text-2xl font-bold text-white">
                  {formatPercent(results.effectiveGrowthRate, 1, true)}
                </p>
                <p className="text-xs text-neutral-500">
                  Annualized return on contributions
                </p>
              </div>
            </div>

            {/* Growth breakdown bar */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Growth Breakdown
              </h3>
              <div className="h-4 rounded-full bg-neutral-800 overflow-hidden flex">
                <div
                  className="bg-blue-500/80 transition-all"
                  style={{ width: `${contributionPercent}%` }}
                />
                <div
                  className="bg-emerald-500/80 transition-all"
                  style={{ width: `${growthPercent}%` }}
                />
              </div>
              <div className="flex items-center gap-6 text-sm text-neutral-300">
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-blue-500/80" />
                  Contributions
                </span>
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-sm bg-emerald-500/80" />
                  Growth
                </span>
              </div>
            </div>

            {/* Year-by-year timeline */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <button
                type="button"
                onClick={() => setShowTimeline((prev) => !prev)}
                className="text-sm font-semibold text-blue-300 hover:text-blue-200"
              >
                {showTimeline ? "Hide" : "Show"} year-by-year timeline
              </button>
              {showTimeline && (
                <div className="max-h-80 overflow-auto border border-neutral-800 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-neutral-900/80 text-neutral-400 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left">Year</th>
                        <th className="px-3 py-2 text-right">Contributions</th>
                        <th className="px-3 py-2 text-right">Growth</th>
                        <th className="px-3 py-2 text-right">Balance</th>
                        <th className="px-3 py-2 text-right">Real Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.timeline.map((row) => (
                        <tr
                          key={row.year}
                          className="border-t border-neutral-800 text-neutral-300"
                        >
                          <td className="px-3 py-2">{row.year}</td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(row.contributions)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(row.growth)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {formatCurrency(row.balance)}
                          </td>
                          <td className="px-3 py-2 text-right text-amber-300/80">
                            {formatCurrency(row.realBalance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <MethodologySection title="How we project investment growth">
            <p>
              We use month-by-month compound growth: each month, the existing
              balance earns interest at 1/12 of the annual return rate, then
              the monthly contribution is added. This models dollar-cost
              averaging into a portfolio with a steady average return.
            </p>
            <p>
              Inflation is applied using the same monthly compounding approach.
              The &quot;Real Value&quot; column shows what your future balance
              would be worth in today&apos;s purchasing power, helping you
              distinguish nominal growth from actual wealth creation.
            </p>
            <p>
              The effective growth rate is the compound annual growth rate
              (CAGR) of your total contributions to the final balance, giving
              you a single number to compare against benchmarks. Actual market
              returns vary year to year; this projection assumes a constant
              average return for simplicity.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
