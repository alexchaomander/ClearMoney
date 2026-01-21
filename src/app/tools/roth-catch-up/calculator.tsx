"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ComparisonCard, ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection, VerdictCard } from "@/components/shared/AppShell";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/roth-catch-up/calculations";
import {
  FILING_STATUS_OPTIONS,
  LIMITS_2026,
  TAX_RATE_OPTIONS,
} from "@/lib/calculators/roth-catch-up/constants";
import type { CalculatorInputs } from "@/lib/calculators/roth-catch-up/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  priorYearW2Wages: 175000,
  currentAge: 55,
  currentBalance: 500000,
  currentMarginalRate: 32,
  retirementTaxRate: 24,
  yearsUntilRetirement: 10,
  expectedReturn: 7,
  stateTaxRate: 5,
  employerOffersRoth: true,
  filingStatus: "single",
};

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => calculate(inputs), [inputs]);

  const thresholdDelta = inputs.priorYearW2Wages - LIMITS_2026.catchUpThreshold;
  const isOverThreshold = results.subjectToMandatoryRoth;
  const thresholdLabel = isOverThreshold
    ? `${formatCurrency(Math.abs(thresholdDelta), 0)} over the threshold`
    : `${formatCurrency(Math.abs(thresholdDelta), 0)} below the threshold`;

  const canMakeCatchUp = results.planReadiness.canMakeCatchUp;
  const catchUpLabel = results.eligibleForCatchUp
    ? formatCurrency(results.catchUpAmount, 0)
    : formatCurrency(0, 0);

  const rothNetValue = results.longTermComparison.rothPath.netRetirementValue;
  const traditionalNetValue =
    results.longTermComparison.traditionalPath.netRetirementValue;
  const rothAdvantage = results.longTermComparison.rothAdvantage;
  const comparisonWinner =
    Math.abs(rothNetValue - traditionalNetValue) < 1
      ? "tie"
      : rothNetValue > traditionalNetValue
        ? "left"
        : "right";

  const totalRothRetirementValue =
    results.projectedCurrentBalance + rothNetValue;
  const totalTraditionalRetirementValue =
    results.projectedCurrentBalance + traditionalNetValue;

  const mandatoryVerdict = isOverThreshold
    ? "Mandatory Roth catch-up"
    : "Roth is optional";
  const mandatoryDescription = isOverThreshold
    ? "Your prior-year W-2 wages exceed $150k, so catch-up dollars must be Roth in 2026."
    : "You are under the $150k threshold, so you can choose Roth or Traditional catch-up contributions.";

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-pink-300 mb-3">
              2026 Roth catch-up rule
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Roth Catch-Up Requirement Planner
            </h1>
            <p className="text-lg text-neutral-400">
              See whether your catch-up must be Roth, estimate the immediate tax hit,
              and compare long-term outcomes.
            </p>
          </div>
        </section>

        <section className="px-4 pb-8">
          <div className="mx-auto max-w-3xl">
            <div
              className={`rounded-2xl border p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${
                isOverThreshold
                  ? "border-pink-500/40 bg-pink-500/10"
                  : "border-emerald-500/40 bg-emerald-500/10"
              }`}
            >
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
                  Eligibility status
                </p>
                <p
                  className={`text-2xl font-semibold mt-2 ${
                    isOverThreshold ? "text-pink-200" : "text-emerald-200"
                  }`}
                >
                  {isOverThreshold ? "Mandatory Roth" : "Roth optional"}
                </p>
                <p className="text-sm text-neutral-300 mt-1">
                  {thresholdLabel} based on prior-year W-2 wages.
                </p>
              </div>
              <div className="space-y-1 text-sm text-neutral-300">
                <p>
                  Catch-up limit: <span className="text-white">{catchUpLabel}</span>
                </p>
                <p>
                  {results.isSuperCatchUp
                    ? "Super catch-up (age 60-63)"
                    : "Standard catch-up (age 50+)"}
                </p>
                <p>
                  Plan status:{" "}
                  <span
                    className={
                      results.planReadiness.employerReady
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    {results.planReadiness.employerReady
                      ? "Roth available"
                      : "No Roth option"}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Income & eligibility inputs
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Prior year W-2 wages"
                  value={inputs.priorYearW2Wages}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, priorYearW2Wages: value }))
                  }
                  min={0}
                  max={1000000}
                  step={5000}
                  format="currency"
                  description={`$${formatNumber(
                    LIMITS_2026.catchUpThreshold
                  )} mandatory Roth threshold`}
                />

                <SliderInput
                  label="Current age"
                  value={inputs.currentAge}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, currentAge: value }))
                  }
                  min={50}
                  max={70}
                  step={1}
                  format="number"
                  description={
                    results.isSuperCatchUp
                      ? "Super catch-up applies at ages 60-63"
                      : "Catch-up eligibility starts at age 50"
                  }
                />

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-300">
                    Filing status
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {FILING_STATUS_OPTIONS.map((status) => (
                      <button
                        key={status.value}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            filingStatus: status.value,
                          }))
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                          inputs.filingStatus === status.value
                            ? "border-pink-400/60 bg-pink-500/10 text-pink-200"
                            : "border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-300">
                    Does your employer offer a Roth 401(k)?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {([true, false] as const).map((value) => (
                      <button
                        key={value ? "yes" : "no"}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({ ...prev, employerOffersRoth: value }))
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                          inputs.employerOffersRoth === value
                            ? "border-pink-400/60 bg-pink-500/10 text-pink-200"
                            : "border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        {value ? "Yes" : "No"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Tax & growth assumptions
              </h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-300">
                    Current marginal tax rate
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {TAX_RATE_OPTIONS.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({ ...prev, currentMarginalRate: rate }))
                        }
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                          inputs.currentMarginalRate === rate
                            ? "border-pink-400/60 bg-pink-500/10 text-pink-200"
                            : "border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-300">
                    Expected retirement tax rate
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {TAX_RATE_OPTIONS.map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({ ...prev, retirementTaxRate: rate }))
                        }
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                          inputs.retirementTaxRate === rate
                            ? "border-pink-400/60 bg-pink-500/10 text-pink-200"
                            : "border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>

                <SliderInput
                  label="State tax rate"
                  value={inputs.stateTaxRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, stateTaxRate: value }))
                  }
                  min={0}
                  max={13}
                  step={0.5}
                  format="percent"
                />

                <SliderInput
                  label="Expected return"
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
                  label="Years until retirement"
                  value={inputs.yearsUntilRetirement}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, yearsUntilRetirement: value }))
                  }
                  min={1}
                  max={25}
                  step={1}
                  format="number"
                />

                <SliderInput
                  label="Current 401(k) balance"
                  value={inputs.currentBalance}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, currentBalance: value }))
                  }
                  min={0}
                  max={5000000}
                  step={10000}
                  format="currency"
                />
              </div>
            </div>

            <VerdictCard
              verdict={mandatoryVerdict}
              description={mandatoryDescription}
              type={isOverThreshold ? "negative" : "positive"}
            />

            <ResultCard
              title="Immediate tax impact"
              primaryValue={formatCurrency(results.taxImpact.netImmediateCost, 0)}
              primaryLabel={
                canMakeCatchUp
                  ? "Estimated taxes due now on catch-up contributions"
                  : "No catch-up contributions allowed under current plan"
              }
              variant="purple"
              items={[
                {
                  label: "Roth catch-up tax cost",
                  value: formatCurrency(results.taxImpact.rothCatchUpTaxCost, 0),
                },
                {
                  label: "Traditional tax savings (lost)",
                  value: formatCurrency(results.taxImpact.traditionalTaxSavings, 0),
                },
                {
                  label: "Total current tax rate",
                  value: formatPercent(
                    inputs.currentMarginalRate + inputs.stateTaxRate,
                    1,
                    true
                  ),
                },
              ]}
              footer={
                !canMakeCatchUp ? (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                    Your employer plan does not offer a Roth option. Over $150k, catch-up
                    contributions are prohibited until the plan adds Roth.
                  </div>
                ) : undefined
              }
            />

            <ComparisonCard
              title="Roth vs Traditional catch-up projection"
              leftTitle="Roth (required)"
              leftValue={formatCurrency(rothNetValue, 0)}
              rightTitle="Traditional (hypothetical)"
              rightValue={formatCurrency(traditionalNetValue, 0)}
              winner={comparisonWinner}
              leftItems={[
                {
                  label: "Tax paid upfront",
                  value: formatCurrency(
                    results.longTermComparison.rothPath.taxPaidUpfront ?? 0,
                    0
                  ),
                },
                {
                  label: "Projected value",
                  value: formatCurrency(
                    results.longTermComparison.rothPath.projectedValue,
                    0
                  ),
                },
                { label: "Tax at withdrawal", value: formatCurrency(0, 0) },
              ]}
              rightItems={[
                {
                  label: "Tax savings now",
                  value: formatCurrency(
                    results.longTermComparison.traditionalPath.taxSavingsNow ?? 0,
                    0
                  ),
                },
                {
                  label: "Projected value",
                  value: formatCurrency(
                    results.longTermComparison.traditionalPath.projectedValue,
                    0
                  ),
                },
                {
                  label: "Tax at withdrawal",
                  value: formatCurrency(
                    results.longTermComparison.traditionalPath.taxAtWithdrawal,
                    0
                  ),
                },
              ]}
            />

            <ResultCard
              title="Retirement balance snapshot"
              primaryValue={formatCurrency(results.projectedCurrentBalance, 0)}
              primaryLabel="Projected value of your current 401(k) balance"
              variant="neutral"
              items={[
                {
                  label: "Projected total with Roth catch-up",
                  value: formatCurrency(totalRothRetirementValue, 0),
                },
                {
                  label: "Projected total with Traditional catch-up",
                  value: formatCurrency(totalTraditionalRetirementValue, 0),
                },
                {
                  label: "Roth advantage",
                  value: formatCurrency(rothAdvantage, 0),
                  highlight: rothAdvantage >= 0,
                },
              ]}
            />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Break-even check
              </h2>
              <p className="text-sm text-neutral-400 mb-4">
                Your break-even retirement tax rate is approximately{" "}
                <span className="text-white font-semibold">
                  {formatPercent(results.breakEvenAnalysis.breakEvenTaxRate, 1, true)}
                </span>
                .
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Current rate
                  </p>
                  <p className="text-lg font-semibold text-white mt-2">
                    {formatPercent(inputs.currentMarginalRate, 1, true)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Retirement rate
                  </p>
                  <p className="text-lg font-semibold text-white mt-2">
                    {formatPercent(inputs.retirementTaxRate, 1, true)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                    Break-even
                  </p>
                  <p className="text-lg font-semibold text-white mt-2">
                    {formatPercent(results.breakEvenAnalysis.breakEvenTaxRate, 1, true)}
                  </p>
                </div>
              </div>
              <p className="text-sm text-neutral-400 mt-4">
                {results.breakEvenAnalysis.explanation}
              </p>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Multi-year catch-up schedule
              </h2>
              {results.contributionSchedule.length === 0 ? (
                <p className="text-sm text-neutral-400">
                  No catch-up contributions are scheduled based on your current age and
                  plan setup.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    <span>Year</span>
                    <span>Contribution</span>
                    <span className="text-right">Value at retirement</span>
                  </div>
                  {results.contributionSchedule.map((item) => (
                    <div
                      key={`${item.year}-${item.age}`}
                      className="grid grid-cols-3 text-sm text-neutral-300 border-b border-neutral-800 pb-2"
                    >
                      <span>
                        Year {item.year} (age {item.age})
                      </span>
                      <span>{formatCurrency(item.contribution, 0)}</span>
                      <span className="text-right text-white">
                        {formatCurrency(item.projectedValue, 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Plan readiness & strategies
              </h2>
              <div className="space-y-3">
                <p className="text-sm text-neutral-300">
                  Employer plan readiness:{" "}
                  <span
                    className={
                      results.planReadiness.employerReady
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    {results.planReadiness.employerReady
                      ? "Roth option available"
                      : "No Roth option"}
                  </span>
                </p>
                <p className="text-sm text-neutral-300">
                  Catch-up allowed:{" "}
                  <span
                    className={
                      results.planReadiness.canMakeCatchUp
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    {results.planReadiness.canMakeCatchUp ? "Yes" : "No"}
                  </span>
                </p>
              </div>
              {results.planReadiness.alternativeStrategies.length > 0 && (
                <ul className="mt-4 list-disc list-inside text-sm text-neutral-300 space-y-1">
                  {results.planReadiness.alternativeStrategies.map((strategy) => (
                    <li key={strategy}>{strategy}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-6">
              <h2 className="text-lg font-semibold text-pink-100 mb-3">
                Recommended next steps
              </h2>
              <ul className="list-disc list-inside text-sm text-pink-100 space-y-1">
                {results.recommendations.map((recommendation) => (
                  <li key={recommendation}>{recommendation}</li>
                ))}
              </ul>
            </div>

            <MethodologySection title="How we calculate Roth catch-up impact">
              <p>
                We use the SECURE 2.0 threshold of ${formatNumber(
                  LIMITS_2026.catchUpThreshold
                )} in prior-year W-2 wages to determine mandatory Roth status.
                Catch-up limits follow the 2026 rules: $8,000 for ages 50+ and
                $11,250 for ages 60-63.
              </p>
              <p>
                Immediate tax impact assumes your marginal federal and state rates
                apply to every catch-up dollar. Long-term projections compound each
                annual catch-up contribution at your expected return until retirement.
              </p>
              <p>
                The comparison isolates catch-up contributions only. We also show the
                projected growth of your current 401(k) balance for context.
              </p>
              <p>
                Break-even analysis highlights the retirement tax rate where Roth and
                Traditional would be equal, but mandatory Roth rules override that if
                your wages exceed $150k.
              </p>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
