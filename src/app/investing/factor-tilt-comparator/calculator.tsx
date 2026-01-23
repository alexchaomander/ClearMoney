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
  type TiltType,
} from "@/lib/calculators/factor-tilt-comparator/calculations";
import { formatNumber, formatPercentRaw } from "@/lib/shared/formatters";

const DEFAULT_INPUTS: CalculatorInputs = {
  baseReturn: 7,
  baseVolatility: 14,
  tiltType: "Quality",
  factorPremium: 1.5,
  addedVolatility: 2,
  timeHorizon: 10,
};

const TOOL_ID = "factor-tilt-comparator";

const TILT_OPTIONS: TiltType[] = ["Value", "Quality", "Momentum", "Small Cap"];

function SelectField({
  label,
  value,
  options,
  onChange,
  description,
}: {
  label: string;
  value: TiltType;
  options: TiltType[];
  onChange: (value: TiltType) => void;
  description?: string;
}) {
  return (
    <label className="space-y-2 text-sm text-neutral-300">
      <span className="font-medium text-white">{label}</span>
      {description && <p className="text-xs text-neutral-500">{description}</p>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TiltType)}
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

function formatRange(low: number, high: number): string {
  return `${formatPercentRaw(low, 1)} to ${formatPercentRaw(high, 1)}`;
}

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => calculate(inputs), [inputs]);
  const relatedTools = useMemo(() => getRelatedToolIds(TOOL_ID), []);

  const shareData = {
    baseReturn: inputs.baseReturn,
    baseVol: inputs.baseVolatility,
    tilt: inputs.tiltType,
    premium: inputs.factorPremium,
    addedVol: inputs.addedVolatility,
    horizon: inputs.timeHorizon,
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
              Factor Tilt Comparison
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Factor Tilt Comparator
            </h1>
            <p className="text-lg text-neutral-400">
              Compare a base portfolio to a factor tilt and see the risk and
              return tradeoffs. Educational only.
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
                    Adjust assumptions to see how the tilt changes outcomes.
                  </p>
                </div>

                <SliderInput
                  label="Base expected return"
                  value={inputs.baseReturn}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, baseReturn: value }))
                  }
                  min={2}
                  max={12}
                  step={0.5}
                  format="percent"
                />

                <SliderInput
                  label="Base volatility"
                  value={inputs.baseVolatility}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, baseVolatility: value }))
                  }
                  min={5}
                  max={25}
                  step={0.5}
                  format="percent"
                />

                <SelectField
                  label="Factor tilt"
                  value={inputs.tiltType}
                  options={TILT_OPTIONS}
                  onChange={(value) => setInputs((prev) => ({ ...prev, tiltType: value }))}
                />

                <SliderInput
                  label="Expected factor premium"
                  value={inputs.factorPremium}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, factorPremium: value }))
                  }
                  min={-1}
                  max={4}
                  step={0.25}
                  format="percent"
                  description="Premium relative to base expectations."
                />

                <SliderInput
                  label="Additional volatility from tilt"
                  value={inputs.addedVolatility}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, addedVolatility: value }))
                  }
                  min={0}
                  max={8}
                  step={0.5}
                  format="percent"
                />

                <SliderInput
                  label="Time horizon"
                  value={inputs.timeHorizon}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, timeHorizon: value }))
                  }
                  min={1}
                  max={30}
                  step={1}
                  format="number"
                  description="Used to scale the uncertainty range."
                />
              </div>

              <ShareResults
                data={shareData}
                title="My factor tilt comparison"
                description="Compare base vs factor-tilted portfolio assumptions."
              />
            </div>

            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <ResultCard
                  title="Base portfolio"
                  primaryValue={formatPercentRaw(results.baseReturn, 1)}
                  primaryLabel="Expected return"
                  variant="neutral"
                  items={[
                    {
                      label: "Volatility",
                      value: formatPercentRaw(results.baseVolatility, 1),
                    },
                    {
                      label: "Return range",
                      value: formatRange(results.baseRange.low, results.baseRange.high),
                    },
                  ]}
                />

                <ResultCard
                  title={`${inputs.tiltType} tilt`}
                  primaryValue={formatPercentRaw(results.tiltedReturn, 1)}
                  primaryLabel="Expected return"
                  variant="amber"
                  items={[
                    {
                      label: "Volatility",
                      value: formatPercentRaw(results.tiltedVolatility, 1),
                    },
                    {
                      label: "Return range",
                      value: formatRange(results.tiltedRange.low, results.tiltedRange.high),
                    },
                  ]}
                />
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
                <p className="font-semibold text-white mb-2">When the tilt helps</p>
                <p>{results.summary}</p>
                <p className="text-xs text-neutral-500 mt-3">
                  Range is a heuristic: ± volatility / √years.
                </p>
              </div>

              <div className="text-xs text-neutral-500">
                Assumes {formatNumber(inputs.timeHorizon, 0)}-year horizon. Ranges are illustrative, not forecasts.
              </div>
            </div>
          </div>
        </section>

        <MethodologySection title="How the comparison is calculated">
          <div className="space-y-3 text-sm text-neutral-300">
            <p>
              The tilted portfolio adds the factor premium to the base return and
              adds the extra volatility to the base volatility. We estimate a
              simple uncertainty band using volatility divided by the square root
              of the time horizon.
            </p>
            <ul className="space-y-2">
              <li>Tilted return = base return + factor premium</li>
              <li>Tilted volatility = base volatility + added volatility</li>
              <li>Range = return ± (volatility / √years)</li>
            </ul>
            <p>
              This tool is educational and does not predict outcomes or recommend
              allocations.
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
