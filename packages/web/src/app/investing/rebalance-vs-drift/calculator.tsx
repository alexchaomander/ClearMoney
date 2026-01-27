"use client";

import { useMemo, useState } from "react";
import {
  AppShell,
  MethodologySection,
  RelatedTools,
  ResultCard,
  ShareResults,
  VerdictCard,
  getRelatedToolIds,
} from "@/components/shared";
import { SliderInput } from "@/components/shared/SliderInput";
import {
  calculate,
  type CalculatorInputs,
  type VolatilityLevel,
} from "@/lib/calculators/rebalance-vs-drift/calculations";
import { formatCurrency, formatPercentRaw } from "@/lib/shared/formatters";

const DEFAULT_INPUTS: CalculatorInputs = {
  targetStocks: 70,
  currentStocks: 78,
  driftThreshold: 5,
  taxRate: 24,
  transactionCost: 0.2,
  volatility: "Medium",
};

const TOOL_ID = "rebalance-vs-drift";

const VOLATILITY_OPTIONS: VolatilityLevel[] = ["Low", "Medium", "High"];

function SelectField({
  label,
  value,
  options,
  onChange,
  description,
}: {
  label: string;
  value: VolatilityLevel;
  options: VolatilityLevel[];
  onChange: (value: VolatilityLevel) => void;
  description?: string;
}) {
  return (
    <label className="space-y-2 text-sm text-neutral-300">
      <span className="font-medium text-white">{label}</span>
      {description && <p className="text-xs text-neutral-500">{description}</p>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as VolatilityLevel)}
        className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const relatedTools = useMemo(() => getRelatedToolIds(TOOL_ID), []);

  const shareData = {
    target: inputs.targetStocks,
    current: inputs.currentStocks,
    threshold: inputs.driftThreshold,
    tax: inputs.taxRate,
    cost: inputs.transactionCost,
    vol: inputs.volatility,
  };

  const targetBonds = 100 - inputs.targetStocks;
  const currentBonds = 100 - inputs.currentStocks;

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400">
              Portfolio Discipline
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Rebalance vs Drift Calculator
            </h1>
            <p className="text-lg text-neutral-400">
              Compare the cost of rebalancing now against the risk drag of waiting.
              This tool is educational only and does not provide financial advice.
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
                    Adjust allocations and assumptions to see the recommendation.
                  </p>
                </div>

                <SliderInput
                  label="Target stocks allocation"
                  value={inputs.targetStocks}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, targetStocks: value }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  format="percent"
                  description={`Bonds automatically set to ${targetBonds}%.`}
                />

                <SliderInput
                  label="Current stocks allocation"
                  value={inputs.currentStocks}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, currentStocks: value }))
                  }
                  min={0}
                  max={100}
                  step={1}
                  format="percent"
                  description={`Current bonds estimate ${currentBonds}%.`}
                />

                <SliderInput
                  label="Drift threshold"
                  value={inputs.driftThreshold}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, driftThreshold: value }))
                  }
                  min={1}
                  max={15}
                  step={0.5}
                  format="percent"
                  description="When drift exceeds this level, rebalancing is considered."
                />

                <SliderInput
                  label="Estimated tax rate on gains"
                  value={inputs.taxRate}
                  onChange={(value) => setInputs((prev) => ({ ...prev, taxRate: value }))}
                  min={0}
                  max={40}
                  step={1}
                  format="percent"
                  description="Blend federal + state rates for taxable accounts."
                />

                <SliderInput
                  label="Transaction cost"
                  value={inputs.transactionCost}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, transactionCost: value }))
                  }
                  min={0}
                  max={1}
                  step={0.05}
                  format="percent"
                  description="Trading fees, spreads, or slippage estimate."
                />

                <SelectField
                  label="Expected volatility"
                  value={inputs.volatility}
                  options={VOLATILITY_OPTIONS}
                  onChange={(value) => setInputs((prev) => ({ ...prev, volatility: value }))}
                  description="Higher volatility increases the cost of drift."
                />
              </div>

              <ShareResults
                data={shareData}
                title="My rebalance vs drift inputs"
                description="See the tradeoff between tax drag and risk drag."
              />
            </div>

            <div className="space-y-6">
              <VerdictCard
                verdict={results.recommendation}
                description={`Confidence: ${results.confidence}. Drift ${formatPercentRaw(results.driftPercent, 1)} vs threshold ${formatPercentRaw(inputs.driftThreshold, 1)}.`}
                type={results.recommendation === "Rebalance now" ? "positive" : "neutral"}
              />

              <ResultCard
                title="Cost comparison (normalized to $100K)"
                primaryValue={formatCurrency(results.totalCostNow)}
                primaryLabel="Estimated cost of rebalancing now"
                variant="blue"
                items={[
                  {
                    label: "Tax drag",
                    value: formatCurrency(results.taxDrag),
                  },
                  {
                    label: "Transaction cost",
                    value: formatCurrency(results.transactionCostAmount),
                  },
                  {
                    label: "Risk drag if waiting",
                    value: formatCurrency(results.riskDrag),
                    highlight: results.riskDrag > results.totalCostNow,
                  },
                ]}
              />

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
                <p className="font-semibold text-white mb-2">Quick take</p>
                <p>
                  Drift of {formatPercentRaw(results.driftPercent, 1)} implies a
                  risk drag of {formatCurrency(results.riskDrag)} versus an
                  estimated cost now of {formatCurrency(results.totalCostNow)}.
                </p>
              </div>
            </div>
          </div>
        </section>

        <MethodologySection title="How this recommendation is calculated">
          <div className="space-y-3 text-sm text-neutral-300">
            <p>
              Drift is the maximum absolute difference between current and target
              allocations. We normalize costs to a $100,000 portfolio to keep the
              comparison intuitive.
            </p>
            <ul className="space-y-2">
              <li>Drift = max(|current stocks - target stocks|, |current bonds - target bonds|)</li>
              <li>Tax drag = $100,000 × drift × tax rate</li>
              <li>Transaction cost = $100,000 × drift × transaction cost</li>
              <li>Risk drag = $100,000 × drift × volatility coefficient</li>
              <li>Rebalance if drift ≥ threshold and risk drag exceeds total costs</li>
            </ul>
            <p>
              This tool is educational and does not account for individual
              holdings, wash sale rules, or investment objectives.
            </p>
          </div>
        </MethodologySection>

        <RelatedTools
          toolIds={relatedTools}
          currentToolId={TOOL_ID}
          title="Explore more investing tools"
          description="Keep learning with related calculators."
        />
      </div>
    </AppShell>
  );
}
