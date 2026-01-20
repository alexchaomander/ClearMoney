"use client";

import { useMemo, useState } from "react";
import { ResultCard } from "@/components/shared/ResultCard";
import { SliderInput } from "@/components/shared/SliderInput";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/dividend-tracker/calculations";
import type {
  CalculatorInputs,
  YearlyProjection,
} from "@/lib/calculators/dividend-tracker/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  portfolioValue: 50_000,
  dividendYield: 3.0,
  monthlyContribution: 500,
  dividendGrowthRate: 6,
  reinvestDividends: true,
  monthlyExpenses: 4_000,
  yearsToProject: 20,
};

function buildLinePoints(
  projections: YearlyProjection[],
  maxValue: number,
): string {
  if (projections.length === 1) {
    const value = projections[0]?.annualDividends ?? 0;
    const y = 100 - (value / maxValue) * 100;
    return `0,${y} 100,${y}`;
  }

  return projections
    .map((projection, index) => {
      const x = (index / (projections.length - 1)) * 100;
      const y = 100 - (projection.annualDividends / maxValue) * 100;
      return `${x},${y}`;
    })
    .join(" ");
}

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = calculate(inputs);
  const annualExpenses = inputs.monthlyExpenses * 12;

  const chart = useMemo(() => {
    const maxDividends = Math.max(
      ...results.projections.map((projection) => projection.annualDividends),
      0,
    );
    const maxValue = Math.max(maxDividends, annualExpenses, 1);
    const dividendPoints = buildLinePoints(results.projections, maxValue);
    const expenseY = 100 - (annualExpenses / maxValue) * 100;
    const breakEven = results.projections.find(
      (projection) => projection.annualDividends >= annualExpenses,
    );

    return {
      dividendPoints,
      expenseY,
      maxValue,
      breakEvenYear: breakEven?.year ?? null,
    };
  }, [results.projections, annualExpenses]);

  const progress = Math.min(results.expensesCoveredNow, 100);
  const hasFullCoverage = results.yearsToFullCoverage !== null;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-green-400 mb-4">
            Dividend Snowball
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Dividend Income Tracker
          </h1>
          <p className="text-lg text-neutral-400">
            Watch your passive income grow and see when dividends cover your
            expenses.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            Inspired by Andrei Jikh&apos;s transparency
          </p>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-6">Current Dividend Pulse</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-neutral-950/60 p-4">
                <p className="text-sm text-neutral-400">Monthly dividends</p>
                <p className="text-2xl font-semibold text-green-400">
                  {formatCurrency(results.currentMonthlyDividends, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-950/60 p-4">
                <p className="text-sm text-neutral-400">Annual dividends</p>
                <p className="text-2xl font-semibold">
                  {formatCurrency(results.currentAnnualDividends, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-950/60 p-4">
                <p className="text-sm text-neutral-400">Yield on cost</p>
                <p className="text-2xl font-semibold">
                  {formatPercent(results.currentYieldOnCost / 100, 1)}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-950/60 p-4">
                <p className="text-sm text-neutral-400">Expenses covered</p>
                <p className="text-2xl font-semibold">
                  {formatPercent(results.expensesCoveredNow / 100, 1)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
                <span>Progress to 100% coverage</span>
                <span>{formatPercent(progress / 100, 0)}</span>
              </div>
              <div className="h-3 rounded-full bg-neutral-800">
                <div
                  className="h-3 rounded-full bg-green-500 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-6">Your Inputs</h2>
              <div className="space-y-6">
                <SliderInput
                  label="Current Portfolio Value"
                  value={inputs.portfolioValue}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, portfolioValue: value }))
                  }
                  min={0}
                  max={10_000_000}
                  step={1_000}
                  format="currency"
                />
                <div className="space-y-2">
                  <SliderInput
                    label="Average Dividend Yield"
                    value={inputs.dividendYield}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, dividendYield: value }))
                    }
                    min={0}
                    max={10}
                    step={0.1}
                    format="percent"
                  />
                  <p className="text-xs text-neutral-500">
                    S&amp;P 500 average ~1.5%, dividend stocks typically 2-4%.
                  </p>
                </div>
                <SliderInput
                  label="Monthly Contribution"
                  value={inputs.monthlyContribution}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, monthlyContribution: value }))
                  }
                  min={0}
                  max={10_000}
                  step={100}
                  format="currency"
                />
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Reinvest dividends (DRIP)</p>
                      <p className="text-sm text-neutral-400">
                        Reinvest dividends to accelerate compounding.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          reinvestDividends: !prev.reinvestDividends,
                        }))
                      }
                      className={`h-10 w-20 rounded-full border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 ${
                        inputs.reinvestDividends
                          ? "bg-green-500/20 border-green-500"
                          : "bg-neutral-900 border-neutral-700"
                      }`}
                      aria-pressed={inputs.reinvestDividends}
                    >
                      <span
                        className={`block h-8 w-8 rounded-full bg-white transition-transform ${
                          inputs.reinvestDividends
                            ? "translate-x-10"
                            : "translate-x-2"
                        }`}
                      />
                    </button>
                  </div>
                </div>
                <SliderInput
                  label="Monthly Expenses"
                  value={inputs.monthlyExpenses}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, monthlyExpenses: value }))
                  }
                  min={0}
                  max={30_000}
                  step={100}
                  format="currency"
                />
                <SliderInput
                  label="Years to Project"
                  value={inputs.yearsToProject}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, yearsToProject: value }))
                  }
                  min={1}
                  max={50}
                  step={1}
                  format="number"
                />
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-4">
                  <div>
                    <p className="font-semibold">Advanced assumptions</p>
                    <p className="text-sm text-neutral-400">
                      Dividend growth compounds over time as companies raise
                      payouts.
                    </p>
                  </div>
                  <SliderInput
                    label="Dividend Growth Rate"
                    value={inputs.dividendGrowthRate}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        dividendGrowthRate: value,
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
              <ResultCard
                title="Dividend Independence"
                primaryValue={
                  hasFullCoverage
                    ? results.yearsToFullCoverage === 0
                      ? "Now"
                      : `${results.yearsToFullCoverage} years`
                    : "Beyond projection"
                }
                primaryLabel="Time until dividends cover expenses"
                items={[
                  {
                    label: "Portfolio at full coverage",
                    value: results.portfolioAtFullCoverage
                      ? formatCurrency(results.portfolioAtFullCoverage, 0)
                      : "Keep compounding",
                  },
                  {
                    label: "Annual expense target",
                    value: formatCurrency(annualExpenses, 0),
                  },
                ]}
                variant="green"
              />

              <div className="rounded-2xl bg-neutral-900 p-6">
                <h3 className="text-lg font-semibold mb-4">Recommendation</h3>
                <p className="text-neutral-300">{results.recommendation}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Dividend Growth Path</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Green line shows projected annual dividends. The white line is your
              yearly expense target.
            </p>
            <div className="rounded-xl bg-neutral-950/80 p-4">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-56"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1={chart.expenseY}
                  x2="100"
                  y2={chart.expenseY}
                  stroke="#ffffff"
                  strokeDasharray="3 3"
                  strokeWidth="0.6"
                />
                <polyline
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="1.2"
                  points={chart.dividendPoints}
                />
              </svg>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-400">
              <div>
                Max value: {formatCurrency(chart.maxValue, 0)} / year
              </div>
              <div>
                {chart.breakEvenYear !== null
                  ? `Break-even year: ${chart.breakEvenYear}`
                  : "Break-even not reached in projection"}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-neutral-900 p-5">
              <p className="text-sm text-neutral-400">Monthly coffee budget</p>
              <p className="text-2xl font-semibold">
                {formatNumber(results.dailyCoffees)} cups ☕
              </p>
            </div>
            <div className="rounded-2xl bg-neutral-900 p-5">
              <p className="text-sm text-neutral-400">Monthly dinner budget</p>
              <p className="text-2xl font-semibold">
                {formatNumber(results.monthlyDinners)} dinners 🍽️
              </p>
            </div>
            <div className="rounded-2xl bg-neutral-900 p-5">
              <p className="text-sm text-neutral-400">Yearly vacation fund</p>
              <p className="text-2xl font-semibold">
                {formatCurrency(results.yearlyVacationBudget, 0)} 🏖️
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-6">Milestone Timeline</h2>
            <div className="space-y-4">
              {results.milestones.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  Keep contributing to unlock dividend milestones.
                </p>
              ) : (
                results.milestones.map((milestone) => (
                  <div
                    key={`${milestone.year}-${milestone.description}`}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-1 h-3 w-3 rounded-full bg-green-400" />
                    <div>
                      <p className="text-sm text-neutral-400">
                        Year {milestone.year}
                      </p>
                      <p className="text-white">{milestone.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <details className="rounded-2xl bg-neutral-900 p-6">
            <summary className="text-lg font-semibold cursor-pointer">
              Yearly Breakdown Table
            </summary>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-neutral-400">
                  <tr>
                    <th className="py-2 pr-4">Year</th>
                    <th className="py-2 pr-4">Portfolio</th>
                    <th className="py-2 pr-4">Annual Dividends</th>
                    <th className="py-2 pr-4">Monthly</th>
                    <th className="py-2 pr-4">% Covered</th>
                  </tr>
                </thead>
                <tbody>
                  {results.projections.map((projection) => (
                    <tr key={projection.year} className="border-t border-neutral-800">
                      <td className="py-2 pr-4">{projection.year}</td>
                      <td className="py-2 pr-4">
                        {formatCurrency(projection.portfolioValue, 0)}
                      </td>
                      <td className="py-2 pr-4">
                        {formatCurrency(projection.annualDividends, 0)}
                      </td>
                      <td className="py-2 pr-4">
                        {formatCurrency(projection.monthlyDividends, 0)}
                      </td>
                      <td className="py-2 pr-4">
                        {formatPercent(projection.expensesCovered / 100, 1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <details className="rounded-2xl bg-neutral-900/50 p-6">
            <summary className="text-lg font-semibold text-white cursor-pointer">
              How we calculate this
            </summary>
            <div className="mt-4 text-neutral-400 space-y-3">
              <p>
                Dividend income comes from owning shares that pay regular cash
                distributions. We estimate dividends using your portfolio value
                multiplied by the average dividend yield.
              </p>
              <p>
                If you enable DRIP, we reinvest each year&apos;s dividends back into
                the portfolio, compounding the snowball effect.
              </p>
              <p>
                Dividend growth assumes companies raise payouts every year. That
                increases yield on cost over time even if share prices move.
              </p>
              <p>
                Reality check: dividend independence takes time. Consistent
                contributions and patience are the biggest drivers of success.
              </p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
