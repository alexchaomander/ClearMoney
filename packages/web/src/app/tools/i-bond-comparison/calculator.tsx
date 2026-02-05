"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/i-bond-comparison/calculations";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";
import {
  CURRENT_RATES,
  I_BOND_RULES,
  TAX_BRACKETS,
} from "@/lib/calculators/i-bond-comparison/constants";
import type {
  CalculatorInputs,
  InvestmentOption,
} from "@/lib/calculators/i-bond-comparison/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  amount: 10000,
  years: 3,
  hysaRate: 4.5,
  federalBracket: 0.22,
  stateRate: 5,
  needsFullLiquidity: false,
  expectedInflation: 2.5,
  iBondFixedRate: 0.9,
  iBondInflationRate: 3.12,
};

const optionAccent: Record<string, string> = {
  "i-bond": "border-sky-500/40",
  hysa: "border-emerald-500/40",
  tips: "border-purple-500/40",
  cd: "border-amber-500/40",
};

const optionBadges: Record<string, string> = {
  "i-bond": "bg-sky-500/15 text-sky-300",
  hysa: "bg-emerald-500/15 text-emerald-300",
  tips: "bg-purple-500/15 text-purple-300",
  cd: "bg-amber-500/15 text-amber-300",
};

const formatRate = (value: number) => formatPercent(value, 2);

const BarRow = ({ option, maxRate }: { option: InvestmentOption; maxRate: number }) => {
  const safeMax = maxRate <= 0 ? 0.01 : maxRate;
  const width = Math.max(0, option.afterTaxRate) / safeMax;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-300">{option.name}</span>
        <span className="text-white font-medium">{formatRate(option.afterTaxRate)}</span>
      </div>
      <div className="h-2 rounded-full bg-neutral-800">
        <div
          className="h-2 rounded-full bg-sky-500"
          style={{ width: `${Math.min(1, width) * 100}%` }}
        />
      </div>
    </div>
  );
};

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("i-bond-comparison");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    federalBracket: [
      "federal_tax_rate",
      (value: unknown) => (typeof value === "number" ? value : null),
    ],
    stateRate: [
      "state_tax_rate",
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

  const results = useMemo(() => calculate(inputs), [inputs]);
  const bestOption = results.options.find((option) => option.id === results.bestOption);
  const sortedOptions = [...results.options].sort((a, b) => b.netValue - a.netValue);
  const maxAfterTaxRate = Math.max(...results.options.map((option) => option.afterTaxRate));

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-400 mb-3">
            Banking • Safe Money
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            I Bond vs HYSA vs TIPS vs CD Comparison
          </h1>
          <p className="text-lg text-neutral-400">
            See which safe-money option delivers the highest after-tax yield while still fitting
            your liquidity needs.
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
            <h2 className="text-xl font-semibold text-white mb-6">Your Information</h2>
            <div className="space-y-6">
              <SliderInput
                label="Amount to invest"
                value={inputs.amount}
                onChange={(value) => setInputs((prev) => ({ ...prev, amount: value }))}
                min={1000}
                max={100000}
                step={1000}
                format="currency"
              />
              <SliderInput
                label="Investment timeline (years)"
                value={inputs.years}
                onChange={(value) => setInputs((prev) => ({ ...prev, years: value }))}
                min={1}
                max={10}
                step={0.5}
              />
              <SliderInput
                label="Current HYSA rate"
                value={inputs.hysaRate}
                onChange={(value) => setInputs((prev) => ({ ...prev, hysaRate: value }))}
                min={0}
                max={7}
                step={0.1}
                format="percent"
              />
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-300">
                  Federal tax bracket
                </label>
                <select
                  value={inputs.federalBracket}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      federalBracket: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-lg bg-neutral-800 border border-neutral-700 text-white px-3 py-2"
                >
                  {TAX_BRACKETS.map((bracket) => (
                    <option key={bracket.value} value={bracket.value}>
                      {bracket.label}
                    </option>
                  ))}
                </select>
              </div>
              <SliderInput
                label="State tax rate"
                value={inputs.stateRate}
                onChange={(value) => setInputs((prev) => ({ ...prev, stateRate: value }))}
                min={0}
                max={13}
                step={0.5}
                format="percent"
              />
              <SliderInput
                label="Expected inflation"
                value={inputs.expectedInflation}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, expectedInflation: value }))
                }
                min={0}
                max={6}
                step={0.1}
                format="percent"
              />
              <SliderInput
                label="I Bond fixed rate"
                value={inputs.iBondFixedRate}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, iBondFixedRate: value }))
                }
                min={0}
                max={2}
                step={0.05}
                format="percent"
                description="Current fixed rate is 0.90%"
              />
              <SliderInput
                label="I Bond inflation rate (annualized)"
                value={inputs.iBondInflationRate}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, iBondInflationRate: value }))
                }
                min={0}
                max={6}
                step={0.1}
                format="percent"
                description="Current annualized inflation rate is 3.12% (1.56% semiannual)"
              />
              <label className="flex items-center justify-between text-sm font-semibold text-neutral-300 bg-neutral-800 rounded-lg px-3 py-3">
                <span>Need full liquidity within 12 months?</span>
                <input
                  type="checkbox"
                  checked={inputs.needsFullLiquidity}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      needsFullLiquidity: event.target.checked,
                    }))
                  }
                  className="h-5 w-5 rounded border-neutral-600 bg-neutral-900 text-sky-500 focus:ring-sky-500"
                />
              </label>
            </div>
          </div>

          {bestOption && (
            <ResultCard
              title="Best after-tax outcome"
              primaryValue={formatCurrency(bestOption.netValue, 0)}
              primaryLabel={`Net value after ${inputs.years} years`}
              items={sortedOptions.map((option) => ({
                label: option.name,
                value: formatCurrency(option.netValue, 0),
                highlight: option.id === results.bestOption,
              }))}
              variant="blue"
              footer={
                <div className="text-sm text-neutral-400">
                  Based on after-tax dollars, {bestOption.name} leads with a
                  {" "}
                  {formatRate(bestOption.afterTaxRate)} annualized after-tax return.
                </div>
              }
            />
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">Side-by-side comparison</h2>
            <div className="grid gap-4">
              {results.options.map((option) => (
                <div
                  key={option.id}
                  className={`rounded-2xl border ${optionAccent[option.id]} bg-neutral-900 p-5 space-y-4`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">{option.name}</h3>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${optionBadges[option.id]}`}>
                      {option.id === results.bestOption ? "Top After-Tax" : "Option"}
                    </span>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-neutral-300">
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Nominal rate</p>
                      <p className="text-white font-semibold">{formatRate(option.nominalRate)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-neutral-500">After-tax rate</p>
                      <p className="text-white font-semibold">{formatRate(option.afterTaxRate)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Real return</p>
                      <p className="text-white font-semibold">{formatRate(option.realReturn)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Tax paid</p>
                      <p className="text-white font-semibold">{formatCurrency(option.taxPaid, 0)}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 text-sm text-neutral-400">
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Pros</p>
                      <ul className="list-disc list-inside space-y-1">
                        {option.pros.map((pro) => (
                          <li key={pro}>{pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Cons</p>
                      <ul className="list-disc list-inside space-y-1">
                        {option.cons.map((con) => (
                          <li key={con}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">After-tax yield ranking</h2>
              <span className="text-xs text-neutral-500">Higher is better</span>
            </div>
            <div className="space-y-4">
              {results.options.map((option) => (
                <BarRow key={option.id} option={option} maxRate={maxAfterTaxRate} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Liquidity trade-offs</h2>
            <div className="space-y-4">
              {results.options.map((option) => (
                <div key={option.id} className="space-y-2">
                  <div className="flex justify-between text-sm text-neutral-300">
                    <span>{option.name}</span>
                    <span className="text-white font-medium">
                      {option.liquidityScore}/10 liquidity
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800">
                    <div
                      className="h-2 rounded-full bg-sky-400"
                      style={{ width: `${(option.liquidityScore / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-5">
            <h2 className="text-xl font-semibold text-white">Optimal allocation</h2>
            <p className="text-sm text-neutral-400">
              {results.recommendation.primary === "Split"
                ? "Split funds to maximize after-tax yield while keeping liquidity."
                : `Primary recommendation: ${results.recommendation.primary}.`}
            </p>
            <div className="space-y-4">
              {results.recommendation.allocation.map((allocation) => (
                <div key={allocation.option} className="space-y-2">
                  <div className="flex justify-between text-sm text-neutral-300">
                    <span>{allocation.option}</span>
                    <span className="text-white font-medium">
                      {formatNumber(allocation.percent)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800">
                    <div
                      className="h-2 rounded-full bg-sky-500"
                      style={{ width: `${allocation.percent}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500">{allocation.reason}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Emergency fund strategy</h2>
            <p className="text-sm text-neutral-400">
              Total safe cash needed: {formatCurrency(results.emergencyFundStrategy.totalNeeded, 0)}.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div className="rounded-xl bg-neutral-800/60 p-4">
                <p className="text-neutral-400">In I Bonds</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(results.emergencyFundStrategy.inIBonds, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-800/60 p-4">
                <p className="text-neutral-400">In HYSA</p>
                <p className="text-lg font-semibold text-white">
                  {formatCurrency(results.emergencyFundStrategy.inHYSA, 0)}
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-500">
              {results.emergencyFundStrategy.reasoning}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <details className="rounded-2xl bg-neutral-900/50 p-6">
            <summary className="text-lg font-semibold text-white cursor-pointer">
              How we calculate this
            </summary>
            <div className="mt-4 text-neutral-400 space-y-3 text-sm">
              <p>
                I Bond returns use the Treasury composite rate formula (fixed + 2×inflation +
                fixed×inflation) compounded semi-annually. We apply the 3-month interest penalty
                when holdings are under five years and only federal tax since I Bonds are exempt
                from state taxes.
              </p>
              <p>
                HYSA and CD returns compound annually with taxes deducted each year at your federal
                and state rates. TIPS are modeled with the current real yield plus expected
                inflation, and we apply only federal taxes because Treasury interest is state-tax
                exempt.
              </p>
              <p>
                Liquidity scores reflect accessibility: HYSAs score highest, I Bonds are locked for
                12 months, and CDs/TIPS are less liquid due to early withdrawal penalties or market
                price swings.
              </p>
              <p>
                Current reference rates: I Bond composite rate {formatRate(CURRENT_RATES.iBond.compositeRate)};
                5-year TIPS real yield {formatRate(CURRENT_RATES.tips.realYield)}; 1-year CD rate
                {formatRate(CURRENT_RATES.cd.nominalRate)}. I Bonds are capped at {formatCurrency(I_BOND_RULES.annualLimit, 0)}
                per person annually.
              </p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
