"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AppShell,
  ComparisonCard,
  MethodologySection,
  ResultCard,
  SliderInput,
} from "@/components/shared";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { cn } from "@/lib/utils";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/medicare-irmaa/calculations";
import {
  IRMAA_BRACKETS_2026,
  LIFE_CHANGING_EVENTS,
  PROJECTION_GROWTH_RATE,
} from "@/lib/calculators/medicare-irmaa/constants";
import type {
  CalculatorInputs,
  FilingStatus,
  IRMAABracketRaw,
  LifeChangingEvent,
} from "@/lib/calculators/medicare-irmaa/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  filingStatus: "married",
  currentAge: 63,
  magi2024: 200000,
  magi2025: 200000,
  socialSecurityIncome: 40000,
  pensionIncome: 0,
  traditionalBalance: 1000000,
  plannedRothConversion: 0,
  taxExemptInterest: 0,
  lifeChangingEvent: "none",
};

const filingStatusOptions: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "married_separate", label: "Married Filing Separately" },
];

const lifeChangingEventOptions: Array<{
  value: LifeChangingEvent;
  label: string;
}> = [
  { value: "none", label: "No life-changing event" },
  ...LIFE_CHANGING_EVENTS.map((event) => ({
    value: event.code,
    label: event.description,
  })),
];

const mapFilingStatus = (value: unknown): FilingStatus | null => {
  if (value === "married_filing_separately") return "married_separate";
  if (value === "married_filing_jointly") return "married";
  if (value === "single" || value === "head_of_household") return "single";
  return null;
};

function formatRange(min: number, max: number) {
  if (!Number.isFinite(max)) {
    return `${formatCurrency(min, 0)}+`;
  }
  return `${formatCurrency(min, 0)} - ${formatCurrency(max, 0)}`;
}

function isInBracket(magi: number, bracket: IRMAABracketRaw) {
  if (!Number.isFinite(bracket.max)) {
    return magi >= bracket.min;
  }
  return magi >= bracket.min && magi <= bracket.max;
}

function BracketBar({
  brackets,
  magi,
}: {
  brackets: IRMAABracketRaw[];
  magi: number;
}) {
  const finiteMax = Math.max(
    ...brackets.filter((bracket) => Number.isFinite(bracket.max)).map((b) => b.max)
  );
  const chartMax = Math.max(finiteMax, magi) * 1.05;
  const markerPosition =
    chartMax > 0 ? Math.min(100, Math.max(0, (magi / chartMax) * 100)) : 0;

  return (
    <div className="relative">
      <div className="flex h-3 overflow-hidden rounded-full bg-neutral-800">
        {brackets.map((bracket) => {
          const bracketMax = Number.isFinite(bracket.max)
            ? Math.min(bracket.max, chartMax)
            : chartMax;
          const bracketMin = Math.min(bracket.min, chartMax);
          const width = Math.max(0, bracketMax - bracketMin);
          if (width <= 0 || chartMax <= 0) return null;
          const widthPercent = (width / chartMax) * 100;
          const isActive = isInBracket(magi, bracket);

          return (
            <div
              key={`${bracket.min}-${bracket.partBSurcharge}`}
              className={cn(
                "transition-all",
                isActive ? "bg-[#0891b2]" : "bg-[#0891b2]/30"
              )}
              style={{ width: `${widthPercent}%` }}
            />
          );
        })}
      </div>
      <div
        className="absolute -top-1 h-5 w-0.5 bg-white"
        style={{ left: `${markerPosition}%` }}
      />
    </div>
  );
}

export function Calculator() {
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    filingStatus: ["filing_status", mapFilingStatus],
    currentAge: "age",
    magi2024: "annual_income",
    magi2025: "annual_income",
    traditionalBalance: "current_retirement_savings",
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );

  const results = useMemo(() => calculate(inputs), [inputs]);
  const brackets = IRMAA_BRACKETS_2026[inputs.filingStatus];
  const maxProjection = Math.max(
    0,
    ...results.fiveYearProjection.map((entry) => entry.projectedIRMAA)
  );
  const cliffAnalysis = results.bracketCliffAnalysis;
  const isNearCliff =
    cliffAnalysis.incomeUntilNextBracket > 0 &&
    cliffAnalysis.incomeUntilNextBracket < 10000;

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[#0891b2] mb-3">
              Medicare Planning
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Medicare IRMAA Planner
            </h1>
            <p className="text-lg text-neutral-400">
              Forecast IRMAA surcharges using the 2-year lookback and test how
              Roth conversions or income changes could affect your Medicare
              premiums.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-5xl space-y-8">
            <LoadMyDataBanner
              isLoaded={memoryLoaded}
              hasData={memoryHasDefaults}
              isApplied={preFilledFields.size > 0}
              onApply={handleLoadData}
            />
            <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-2xl bg-neutral-900 p-6">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Your Information
                </h2>
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-neutral-300">
                      Filing Status
                      <select
                        value={inputs.filingStatus}
                        onChange={(event) =>
                          setInputs((prev) => ({
                            ...prev,
                            filingStatus: event.target.value as FilingStatus,
                          }))
                        }
                        className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-[#0891b2] focus:outline-none"
                      >
                        {filingStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <SliderInput
                      label="Current Age"
                      value={inputs.currentAge}
                      onChange={(value) =>
                        setInputs((prev) => ({ ...prev, currentAge: value }))
                      }
                      min={55}
                      max={85}
                      step={1}
                      format="number"
                    />
                  </div>

                  <SliderInput
                    label="2024 MAGI (affects 2026 IRMAA)"
                    value={inputs.magi2024}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, magi2024: value }))
                    }
                    min={0}
                    max={1000000}
                    step={5000}
                    format="currency"
                    description="The 2-year lookback uses 2024 income for your 2026 Medicare premiums."
                  />

                  <SliderInput
                    label="2025 Projected MAGI (affects 2027)"
                    value={inputs.magi2025}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, magi2025: value }))
                    }
                    min={0}
                    max={1000000}
                    step={5000}
                    format="currency"
                  />

                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                      MAGI inputs for Roth conversion impact
                    </p>
                    <SliderInput
                      label="Social Security Income"
                      value={inputs.socialSecurityIncome}
                      onChange={(value) =>
                        setInputs((prev) => ({
                          ...prev,
                          socialSecurityIncome: value,
                        }))
                      }
                      min={0}
                      max={100000}
                      step={1000}
                      format="currency"
                    />
                    <SliderInput
                      label="Pension Income"
                      value={inputs.pensionIncome}
                      onChange={(value) =>
                        setInputs((prev) => ({ ...prev, pensionIncome: value }))
                      }
                      min={0}
                      max={200000}
                      step={1000}
                      format="currency"
                    />
                    <SliderInput
                      label="Tax-Exempt Interest"
                      value={inputs.taxExemptInterest}
                      onChange={(value) =>
                        setInputs((prev) => ({
                          ...prev,
                          taxExemptInterest: value,
                        }))
                      }
                      min={0}
                      max={100000}
                      step={1000}
                      format="currency"
                      description="Tax-exempt interest is included in MAGI for IRMAA."
                    />
                    <SliderInput
                      label="Planned Roth Conversion"
                      value={inputs.plannedRothConversion}
                      onChange={(value) =>
                        setInputs((prev) => ({
                          ...prev,
                          plannedRothConversion: value,
                        }))
                      }
                      min={0}
                      max={500000}
                      step={5000}
                      format="currency"
                    />
                    <SliderInput
                      label="Traditional IRA/401(k) Balance"
                      value={inputs.traditionalBalance}
                      onChange={(value) =>
                        setInputs((prev) => ({
                          ...prev,
                          traditionalBalance: value,
                        }))
                      }
                      min={0}
                      max={10000000}
                      step={50000}
                      format="currency"
                    />
                  </div>

                  <label className="text-sm text-neutral-300">
                    Life-Changing Event (appeal eligibility)
                    <select
                      value={inputs.lifeChangingEvent}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          lifeChangingEvent: event.target.value as LifeChangingEvent,
                        }))
                      }
                      className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-[#0891b2] focus:outline-none"
                    >
                      {lifeChangingEventOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <div className="space-y-6">
                <ResultCard
                  title="2026 IRMAA Impact"
                  primaryValue={formatCurrency(results.current2026.annualCost, 0)}
                  primaryLabel="Estimated annual Part B + Part D cost"
                  items={[
                    {
                      label: "MAGI used",
                      value: formatCurrency(results.current2026.magi, 0),
                    },
                    {
                      label: "Monthly Part B premium",
                      value: formatCurrency(results.current2026.monthlyPartB, 2),
                    },
                    {
                      label: "Monthly Part D surcharge",
                      value: formatCurrency(results.current2026.monthlyPartD, 2),
                    },
                    {
                      label: "Annual IRMAA surcharge",
                      value: formatCurrency(results.current2026.surchargeAmount, 0),
                      highlight: true,
                    },
                  ]}
                  variant="blue"
                />

                <ResultCard
                  title="2027 Projection"
                  primaryValue={formatCurrency(
                    results.projected2027.annualCost,
                    0
                  )}
                  primaryLabel="Estimated annual Part B + Part D cost"
                  items={[
                    {
                      label: "MAGI used",
                      value: formatCurrency(results.projected2027.magi, 0),
                    },
                    {
                      label: "Monthly Part B premium",
                      value: formatCurrency(results.projected2027.monthlyPartB, 2),
                    },
                    {
                      label: "Monthly Part D surcharge",
                      value: formatCurrency(results.projected2027.monthlyPartD, 2),
                    },
                    {
                      label: "Annual IRMAA surcharge",
                      value: formatCurrency(results.projected2027.surchargeAmount, 0),
                      highlight: true,
                    },
                  ]}
                  variant="neutral"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                2-Year Lookback Timeline
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                    2024 Tax Return
                  </p>
                  <p className="text-lg font-semibold text-white mt-2">
                    Determines 2026 IRMAA
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    MAGI: {formatCurrency(results.current2026.magi, 0)} → Monthly
                    surcharge {formatCurrency(
                      results.current2026.bracket.totalMonthlySurcharge,
                      2
                    )}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                    2025 Tax Return
                  </p>
                  <p className="text-lg font-semibold text-white mt-2">
                    Determines 2027 IRMAA
                  </p>
                  <p className="text-sm text-neutral-400 mt-2">
                    MAGI: {formatCurrency(results.projected2027.magi, 0)} →
                    Monthly surcharge {formatCurrency(
                      results.projected2027.bracket.totalMonthlySurcharge,
                      2
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-white">
                  2026 IRMAA Brackets
                </h2>
                <span className="text-xs text-neutral-400">
                  Current position highlighted
                </span>
              </div>
              <BracketBar brackets={brackets} magi={inputs.magi2024} />
              <div className="grid gap-3 sm:grid-cols-2">
                {brackets.map((bracket) => {
                  const active = isInBracket(inputs.magi2024, bracket);
                  return (
                    <div
                      key={`${bracket.min}-${bracket.partBSurcharge}`}
                      className={cn(
                        "rounded-xl border p-4 text-sm",
                        active
                          ? "border-[#0891b2]/60 bg-[#0891b2]/10"
                          : "border-neutral-800 bg-neutral-950/60"
                      )}
                    >
                      <p className="text-white font-semibold">
                        {formatRange(bracket.min, bracket.max)}
                      </p>
                      <p className="text-neutral-400 mt-1">
                        Part B surcharge: {formatCurrency(bracket.partBSurcharge, 2)}
                      </p>
                      <p className="text-neutral-400">
                        Part D surcharge: {formatCurrency(bracket.partDSurcharge, 2)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <ComparisonCard
              title="Roth Conversion Impact (Annual IRMAA)"
              leftTitle="Without conversion"
              leftValue={formatCurrency(
                results.rothConversionImpact.withoutConversion.annualIRMAA,
                0
              )}
              rightTitle="With conversion"
              rightValue={formatCurrency(
                results.rothConversionImpact.withConversion.annualIRMAA,
                0
              )}
              winner={
                results.rothConversionImpact.additionalCost > 0
                  ? "left"
                  : results.rothConversionImpact.additionalCost < 0
                    ? "right"
                    : "tie"
              }
              leftItems={[
                {
                  label: "MAGI",
                  value: formatCurrency(
                    results.rothConversionImpact.withoutConversion.magi,
                    0
                  ),
                },
              ]}
              rightItems={[
                {
                  label: "MAGI",
                  value: formatCurrency(
                    results.rothConversionImpact.withConversion.magi,
                    0
                  ),
                },
              ]}
              className="border-[#0891b2]/40"
            />

            <div
              className={cn(
                "rounded-2xl border p-6",
                isNearCliff
                  ? "border-amber-500/40 bg-amber-500/10"
                  : "border-neutral-800 bg-neutral-900"
              )}
            >
              <h2 className="text-xl font-semibold text-white mb-2">
                Bracket Cliff Alert
              </h2>
              {cliffAnalysis.incomeUntilNextBracket === 0 ? (
                <p className="text-sm text-neutral-400">
                  You are already in the top IRMAA bracket for your filing status.
                  Additional income will not increase IRMAA beyond the current level.
                </p>
              ) : (
                <div className="space-y-2 text-sm text-neutral-300">
                  <p>
                    You are {formatCurrency(cliffAnalysis.incomeUntilNextBracket, 0)}
                    away from the next IRMAA bracket.
                  </p>
                  <p>
                    Crossing that threshold adds approximately
                    {" "}
                    {formatCurrency(cliffAnalysis.costOfCrossingBracket, 0)} per
                    year in surcharges.
                  </p>
                  {isNearCliff && (
                    <p className="text-amber-200">
                      You’re within $10,000 of the next bracket—small income changes
                      can create large premium jumps.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">
                Life-Changing Event Appeal
              </h2>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm">
                <p className="text-neutral-300">
                  {results.lifeChangingEventEligibility.eligible
                    ? `Eligible event: ${results.lifeChangingEventEligibility.eventType}`
                    : "No life-changing event selected."}
                </p>
                {results.lifeChangingEventEligibility.eligible && (
                  <div className="mt-3 space-y-2 text-neutral-400">
                    <p>
                      Potential savings: {formatCurrency(
                        results.lifeChangingEventEligibility.potentialSavings,
                        0
                      )} per year
                    </p>
                    <p>{results.lifeChangingEventEligibility.howToAppeal}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Five-Year IRMAA Projection
              </h2>
              <p className="text-sm text-neutral-400 mb-4">
                Assumes MAGI grows at {formatPercent(PROJECTION_GROWTH_RATE, 0)}
                annually after 2025.
              </p>
              <div className="space-y-3">
                {results.fiveYearProjection.map((entry) => {
                  const width =
                    maxProjection > 0
                      ? Math.min(100, (entry.projectedIRMAA / maxProjection) * 100)
                      : 0;
                  return (
                    <div
                      key={entry.year}
                      className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="text-white font-semibold">
                          {entry.year}
                        </span>
                        <span className="text-neutral-400">
                          MAGI {formatCurrency(entry.projectedMAGI, 0)}
                        </span>
                        <span className="text-neutral-300">
                          IRMAA {formatCurrency(entry.projectedIRMAA, 0)} / yr
                        </span>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-neutral-800">
                        <div
                          className="h-2 rounded-full bg-[#0891b2]"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Strategy Recommendations
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                {results.strategies.map((strategy) => (
                  <div
                    key={strategy}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-300"
                  >
                    {strategy}
                  </div>
                ))}
              </div>
            </div>

            <MethodologySection>
              <p>
                This calculator uses the 2026 IRMAA bracket estimates (based on
                2024 MAGI) and applies Medicare’s two-year lookback rule. Your
                2024 income determines 2026 surcharges, and your 2025 income
                determines 2027 surcharges.
              </p>
              <p>
                Roth conversion impact is estimated using your Social Security,
                pension, tax-exempt interest, and planned conversion inputs.
                Social Security income is assumed to be 85% taxable for MAGI, and
                tax-exempt interest is fully included.
              </p>
              <p>
                The five-year projection assumes MAGI grows at
                {" "}
                {formatPercent(PROJECTION_GROWTH_RATE, 0)} annually after 2025
                and uses today’s 2026 brackets to estimate surcharges. Actual
                future brackets and premiums will change with inflation.
              </p>
              <p>
                If you experience a qualifying life-changing event, you can file
                SSA-44 to request a new IRMAA determination.
              </p>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
