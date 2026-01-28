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
import { formatNumber } from "@/lib/shared/formatters";
import {
  ARCHETYPES,
  SCORE_WEIGHTS,
  calculate,
  type CalculatorInputs,
  type RiskTolerance,
  type Sensitivity,
  type Stability,
  type TimeHorizon,
} from "@/lib/calculators/strategy-match-finder/calculations";

const RISK_OPTIONS: RiskTolerance[] = [
  "Conservative",
  "Moderate",
  "Aggressive",
];
const HORIZON_OPTIONS: TimeHorizon[] = [
  "1-3 years",
  "3-7 years",
  "7-15 years",
  "15+ years",
];
const SENSITIVITY_OPTIONS: Sensitivity[] = ["Low", "Medium", "High"];
const STABILITY_OPTIONS: Stability[] = ["Low", "Medium", "High"];

const DEFAULT_INPUTS: CalculatorInputs = {
  riskTolerance: "Moderate",
  timeHorizon: "7-15 years",
  taxSensitivity: "Medium",
  incomeStability: "Medium",
  drawdownTolerance: "Medium",
};

const TOOL_ID = "strategy-match-finder";

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
  description,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (value: T) => void;
  description?: string;
}) {
  return (
    <label className="space-y-2 text-sm text-neutral-300">
      <span className="font-medium text-white">{label}</span>
      {description && <p className="text-xs text-neutral-500">{description}</p>}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
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
    risk: inputs.riskTolerance,
    horizon: inputs.timeHorizon,
    tax: inputs.taxSensitivity,
    income: inputs.incomeStability,
    drawdown: inputs.drawdownTolerance,
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <p className="text-sm uppercase tracking-[0.3em] text-violet-400">
              Investing Strategy Fit
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Strategy Match Finder
            </h1>
            <p className="text-lg text-neutral-400">
              Translate your preferences into a transparent, educational ranking
              of strategy archetypes. This tool is for learning only and is not
              financial advice.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl grid gap-10 lg:grid-cols-[1.05fr_1.4fr]">
            <div className="space-y-6">
              <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Your inputs
                  </h2>
                  <p className="text-sm text-neutral-400">
                    Adjust each input to see how the strategy ranking changes.
                  </p>
                </div>

                <SelectField
                  label="Risk tolerance"
                  value={inputs.riskTolerance}
                  options={RISK_OPTIONS}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, riskTolerance: value }))
                  }
                />

                <SelectField
                  label="Time horizon"
                  value={inputs.timeHorizon}
                  options={HORIZON_OPTIONS}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, timeHorizon: value }))
                  }
                  description="Longer horizons can support higher volatility."
                />

                <SelectField
                  label="Tax sensitivity"
                  value={inputs.taxSensitivity}
                  options={SENSITIVITY_OPTIONS}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, taxSensitivity: value }))
                  }
                  description="Higher sensitivity rewards tax-efficient strategies."
                />

                <SelectField
                  label="Income stability"
                  value={inputs.incomeStability}
                  options={STABILITY_OPTIONS}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, incomeStability: value }))
                  }
                  description="Stability guides how much complexity is comfortable."
                />

                <SelectField
                  label="Drawdown tolerance"
                  value={inputs.drawdownTolerance}
                  options={STABILITY_OPTIONS}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, drawdownTolerance: value }))
                  }
                  description="Lower tolerance prefers lower volatility."
                />
              </div>

              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 text-sm text-violet-100">
                <p className="font-semibold text-white mb-2">Fit summary</p>
                <p className="text-neutral-200">{results.fitSummary}</p>
                <p className="text-xs text-neutral-300 mt-3">
                  Always evaluate real-world constraints and consult a
                  professional for personalized guidance.
                </p>
              </div>

              <ShareResults
                data={shareData}
                title="My Strategy Match Finder results"
                description="See how my preferences map to strategy archetypes."
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Top 3 strategy matches
                </h2>
                <p className="text-xs text-neutral-500">
                  Scores are normalized to 0-100.
                </p>
              </div>

              <div className="grid gap-6">
                {results.topStrategies.map((strategy, index) => (
                  <ResultCard
                    key={strategy.archetype.id}
                    title={`${index + 1}. ${strategy.archetype.name}`}
                    primaryValue={`${formatNumber(strategy.score, 1)}`}
                    primaryLabel="Match score"
                    variant={index === 0 ? "purple" : "neutral"}
                    items={[
                      {
                        label: "Profile",
                        value: strategy.archetype.shortDescription,
                      },
                      {
                        label: "Best for",
                        value: strategy.archetype.bestFor.join(", "),
                      },
                      {
                        label: "Tradeoffs",
                        value: strategy.archetype.tradeoffs.join(", "),
                      },
                    ]}
                    footer={
                      <div className="px-6 pb-6 text-xs text-neutral-500">
                        Traits: risk {strategy.archetype.riskProfile}, turnover {" "}
                        {strategy.archetype.turnover}, tax efficiency {" "}
                        {strategy.archetype.taxEfficiency}.
                      </div>
                    }
                  />
                ))}
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-300">
                <p className="font-semibold text-white mb-2">
                  Full archetype list
                </p>
                <ul className="grid gap-2 text-xs text-neutral-400">
                  {ARCHETYPES.map((archetype) => (
                    <li key={archetype.id} className="flex justify-between">
                      <span>{archetype.name}</span>
                      <span className="text-neutral-500">
                        Risk {archetype.riskProfile} • Tax {archetype.taxEfficiency}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <MethodologySection title="How the scoring works">
          <div className="space-y-4 text-sm text-neutral-300">
            <p>
              Each archetype is tagged with risk, turnover, tax efficiency,
              volatility, and complexity levels. Your inputs map to target levels
              and earn a match score of 1.0 for an exact match, 0.6 for a
              one-step difference, and 0.2 for a two-step difference.
            </p>
            <ul className="space-y-2">
              <li>
                Risk tolerance weight: {formatNumber(SCORE_WEIGHTS.riskTolerance * 100, 0)}%
              </li>
              <li>
                Drawdown tolerance weight: {formatNumber(SCORE_WEIGHTS.drawdownTolerance * 100, 0)}%
              </li>
              <li>
                Time horizon weight: {formatNumber(SCORE_WEIGHTS.timeHorizon * 100, 0)}%
              </li>
              <li>
                Tax efficiency weight: {formatNumber(SCORE_WEIGHTS.taxEfficiency * 100, 0)}%
              </li>
              <li>
                Turnover weight: {formatNumber(SCORE_WEIGHTS.turnover * 100, 0)}%
              </li>
              <li>
                Complexity weight: {formatNumber(SCORE_WEIGHTS.complexity * 100, 0)}%
              </li>
            </ul>
            <p>
              The weighted total is normalized to a 0-100 scale, then ranked. If
              two strategies tie, the list uses a stable sort by ID to keep the
              top three consistent. This is purely educational and not financial
              advice.
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
