"use client";

import { useMemo, useState } from "react";
import {
  AppShell,
  MethodologySection,
  RelatedTools,
  ResultCard,
  ShareResults,
  getRelatedToolIds,
} from "@/components/shared";
import { SliderInput } from "@/components/shared/SliderInput";
import {
  calculate,
  type CalculatorInputs,
} from "@/lib/calculators/tax-aware-rebalance/calculations";
import { formatCurrency, formatPercentRaw } from "@/lib/shared/formatters";

const DEFAULT_INPUTS: CalculatorInputs = {
  portfolioValue: 250000,
  allocationToSell: 15,
  costBasisPercent: 70,
  shortTermRate: 32,
  longTermRate: 15,
  shortTermPortion: 40,
};

const TOOL_ID = "tax-aware-rebalance";

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => calculate(inputs), [inputs]);
  const relatedTools = useMemo(() => getRelatedToolIds(TOOL_ID), []);

  const shareData = {
    value: inputs.portfolioValue,
    sell: inputs.allocationToSell,
    basis: inputs.costBasisPercent,
    stRate: inputs.shortTermRate,
    ltRate: inputs.longTermRate,
    stPortion: inputs.shortTermPortion,
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
              Tax-Aware Rebalancing
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Tax-Aware Rebalance Impact
            </h1>
            <p className="text-lg text-neutral-400">
              Estimate the taxes triggered by a rebalance and the drift level
              needed to justify it. Educational only.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl grid gap-10 lg:grid-cols-[1.05fr_1.4fr]">
            <div className="space-y-6">
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">Your inputs</h2>
                  <p className="text-sm text-neutral-400">
                    Enter portfolio and tax assumptions to estimate impact.
                  </p>
                </div>

                <SliderInput
                  label="Portfolio value"
                  value={inputs.portfolioValue}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, portfolioValue: value }))
                  }
                  min={25000}
                  max={1000000}
                  step={5000}
                  format="currency"
                />

                <SliderInput
                  label="Allocation to sell"
                  value={inputs.allocationToSell}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, allocationToSell: value }))
                  }
                  min={0}
                  max={50}
                  step={1}
                  format="percent"
                />

                <SliderInput
                  label="Cost basis (% of current value)"
                  value={inputs.costBasisPercent}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, costBasisPercent: value }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  format="percent"
                  description="Lower cost basis means larger taxable gains."
                />

                <SliderInput
                  label="Short-term tax rate"
                  value={inputs.shortTermRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, shortTermRate: value }))
                  }
                  min={0}
                  max={50}
                  step={1}
                  format="percent"
                />

                <SliderInput
                  label="Long-term tax rate"
                  value={inputs.longTermRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, longTermRate: value }))
                  }
                  min={0}
                  max={30}
                  step={1}
                  format="percent"
                />

                <SliderInput
                  label="Portion of gains that are short-term"
                  value={inputs.shortTermPortion}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, shortTermPortion: value }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  format="percent"
                />
              </div>

              <ShareResults
                data={shareData}
                title="My tax-aware rebalance inputs"
                description="Estimate the tax impact of a rebalance."
              />
            </div>

            <div className="space-y-6">
              <ResultCard
                title="Estimated tax impact"
                primaryValue={formatCurrency(results.totalTax)}
                primaryLabel="Total taxes owed"
                variant="emerald"
                items={[
                  {
                    label: "Value sold",
                    value: formatCurrency(results.valueSold),
                  },
                  {
                    label: "Total gains",
                    value: formatCurrency(results.totalGains),
                  },
                  {
                    label: "Short-term tax",
                    value: formatCurrency(results.shortTermTax),
                  },
                  {
                    label: "Long-term tax",
                    value: formatCurrency(results.longTermTax),
                  },
                  {
                    label: "After-tax proceeds",
                    value: formatCurrency(results.afterTaxProceeds),
                    highlight: true,
                  },
                ]}
              />

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
                <p className="font-semibold text-white mb-2">Breakeven drift</p>
                <p>
                  You would need about {formatPercentRaw(results.breakevenDriftPercent, 2)}
                  of portfolio drift to justify these taxes on a pure cost basis.
                </p>
              </div>
            </div>
          </div>
        </section>

        <MethodologySection title="How we calculate the tax impact">
          <div className="space-y-3 text-sm text-neutral-300">
            <p>
              We estimate gains based on the portion sold and your cost basis.
              Then we split gains into short-term and long-term buckets to apply
              the tax rates you provided.
            </p>
            <ul className="space-y-2">
              <li>Value sold = portfolio value × allocation to sell</li>
              <li>Gains = value sold × (1 - cost basis)</li>
              <li>Short-term gains = gains × short-term portion</li>
              <li>Taxes = short-term gains × short-term rate + long-term gains × long-term rate</li>
              <li>Breakeven drift = total taxes / portfolio value</li>
            </ul>
            <p>
              This tool is educational and does not account for wash sales or
              individual lot selection.
            </p>
          </div>
        </MethodologySection>

        <RelatedTools
          toolIds={relatedTools}
          currentToolId={TOOL_ID}
          title="Explore more tax tools"
          description="Keep learning with related calculators."
        />
      </div>
    </AppShell>
  );
}
