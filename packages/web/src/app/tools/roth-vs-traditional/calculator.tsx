"use client";

import {useCallback, useEffect, useState} from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";
import { calculate } from "@/lib/calculators/roth-vs-traditional/calculations";
import type {
  CalculatorInputs,
  CalculatorResults,
} from "@/lib/calculators/roth-vs-traditional/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  annualContribution: 7000,
  currentTaxRate: 22,
  retirementTaxRate: 22,
  yearsUntilRetirement: 30,
  expectedReturn: 7,
};

const TAX_BRACKETS = [
  "10%: $0 - $11,600",
  "12%: $11,601 - $47,150",
  "22%: $47,151 - $100,525",
  "24%: $100,526 - $191,950",
  "32%: $191,951 - $243,725",
  "35%: $243,726 - $609,350",
  "37%: Over $609,350",
];

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("roth-vs-traditional");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    annualContribution: [
      "monthly_retirement_contribution",
      (value: unknown) => (typeof value === "number" ? value * 12 : null),
    ],
    currentTaxRate: [
      "federal_tax_rate",
      (value: unknown) => (typeof value === "number" ? value * 100 : null),
    ],
    retirementTaxRate: [
      "federal_tax_rate",
      (value: unknown) => (typeof value === "number" ? value * 100 : null),
    ],
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
  const [showRetirementHelp, setShowRetirementHelp] = useState(false);

  const results: CalculatorResults = calculate(inputs);
  const hasContribution = inputs.annualContribution > 0;
  const differenceValue = formatCurrency(Math.abs(results.difference), 0);

  const winnerTitle = hasContribution
    ? results.winner === "tie"
      ? "It’s a tie!"
      : results.winner === "roth"
        ? `Roth wins by ${differenceValue}`
        : `Traditional wins by ${differenceValue}`
    : "Add a contribution to compare";

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-purple-400 mb-3">
              Roth vs Traditional
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Roth vs Traditional Calculator
            </h1>
            <p className="text-lg text-neutral-400">
              Should you pay taxes now or later? See which saves you more over
              time.
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
                Your Inputs
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Annual Contribution"
                  value={inputs.annualContribution}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, annualContribution: value }))
                  }
                  min={0}
                  max={23000}
                  step={500}
                  format="currency"
                  description="IRA limit $7,000 • 401(k) limit $23,000"
                />

                <div className="space-y-4">
                  <SliderInput
                    label="Current Marginal Tax Rate"
                    value={inputs.currentTaxRate}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, currentTaxRate: value }))
                    }
                    min={0}
                    max={37}
                    step={1}
                    format="percent"
                  />
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                    <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wide mb-2">
                      2024 Federal Tax Brackets (Single)
                    </p>
                    <ul className="text-xs text-neutral-400 space-y-1">
                      {TAX_BRACKETS.map((bracket) => (
                        <li key={bracket}>{bracket}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                  <SliderInput
                    label="Expected Retirement Tax Rate"
                    value={inputs.retirementTaxRate}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        retirementTaxRate: value,
                      }))
                    }
                    min={0}
                    max={37}
                    step={1}
                    format="percent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRetirementHelp((prev) => !prev)}
                    className="text-sm text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    I don’t know my retirement rate
                  </button>
                  {showRetirementHelp && (
                    <p className="text-sm text-neutral-400">
                      If you’re unsure, start with your current rate and test a
                      few scenarios (higher and lower) to see how sensitive the
                      outcome is.
                    </p>
                  )}
                </div>

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
                    setInputs((prev) => ({ ...prev, expectedReturn: value }))
                  }
                  min={0}
                  max={12}
                  step={0.5}
                  format="percent"
                  description="7% reflects a long-term inflation-adjusted average"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                  Pay taxes later
                </p>
                <h3 className="text-xl font-semibold text-white mt-2 mb-4">
                  Traditional
                </h3>
                <div className="space-y-3 text-sm text-neutral-300">
                  <div className="flex justify-between">
                    <span>Contribute (pre-tax)</span>
                    <span>{formatCurrency(results.traditional.contribution, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grows to</span>
                    <span>{formatCurrency(results.traditional.futureValue, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After taxes</span>
                    <span className="text-white">
                      {formatCurrency(results.traditional.afterTaxValue, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Taxes paid in retirement</span>
                    <span>{formatCurrency(results.traditional.taxesPaid, 0)}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/40 bg-neutral-900 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-purple-300">
                  Pay taxes now
                </p>
                <h3 className="text-xl font-semibold text-white mt-2 mb-4">
                  Roth
                </h3>
                <div className="space-y-3 text-sm text-neutral-300">
                  <div className="flex justify-between">
                    <span>Contribute (after tax)</span>
                    <span>{formatCurrency(results.roth.contribution, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Grows to</span>
                    <span>{formatCurrency(results.roth.futureValue, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>After taxes</span>
                    <span className="text-white">
                      {formatCurrency(results.roth.afterTaxValue, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Taxes paid now</span>
                    <span>{formatCurrency(results.roth.taxesPaidNow, 0)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-6 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-purple-200 mb-2">
                Winner
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">
                {winnerTitle}
              </h3>
              <p className="text-sm text-purple-100 max-w-xl mx-auto">
                {results.recommendation}
              </p>
              {hasContribution && (
                <p className="text-xs text-purple-200 mt-3">
                  Difference of {formatCurrency(results.difference, 0)} (~
                  {formatPercent(results.percentageDifference / 100, 1)}) in
                  after-tax value.
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Break-even analysis
              </h3>
              <p className="text-sm text-neutral-400">
                At your current {formatPercent(inputs.currentTaxRate / 100, 0)}
                rate, they’re equal if retirement tax rate is also{" "}
                {formatPercent(results.breakEvenTaxRate / 100, 0)}.
              </p>
              <div className="relative mt-6 h-2 rounded-full bg-neutral-800">
                <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-purple-400 shadow-lg" />
              </div>
              <div className="mt-3 flex justify-between text-xs text-neutral-500">
                <span>Lower rates favor Traditional</span>
                <span>Higher rates favor Roth</span>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Factors to consider
              </h3>
              {results.factors.length > 0 ? (
                <ul className="space-y-2 text-sm text-neutral-300">
                  {results.factors.map((factor) => (
                    <li key={factor} className="flex gap-2">
                      <span className="text-purple-300">•</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-neutral-400">
                  Adjust the inputs to see the factors that influence the
                  outcome.
                </p>
              )}
            </div>

            <MethodologySection>
              <p>
                We compare the future value of equal annual contributions under
                two strategies: Traditional (pre-tax contributions taxed in
                retirement) and Roth (after-tax contributions with tax-free
                withdrawals). The math uses a standard annuity future value
                formula and assumes a constant annual return.
              </p>
              <p>
                This simplified model ignores state taxes, employer matches,
                contribution limits by plan type, required minimum distributions,
                and changes in tax law. Use it for directional guidance rather
                than precise tax planning.
              </p>
              <p className="text-neutral-300 font-semibold">
                This is for educational purposes. Consult a tax professional.
              </p>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
