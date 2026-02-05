"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {
  AppShell,
  MethodologySection,
  ResultCard,
  SliderInput,
  VerdictCard,
} from "@/components/shared";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/stock-option-exercise/calculations";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";
import type {
  CalculatorInputs,
  ExerciseStrategy,
  FilingStatus,
  OptionType,
} from "@/lib/calculators/stock-option-exercise/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  option: {
    optionType: "iso",
    totalOptions: 10000,
    strikePrice: 5,
    currentFMV: 50,
    vestedOptions: 2500,
    grantDate: new Date("2022-01-01"),
    vestStartDate: new Date("2022-01-01"),
  },
  tax: {
    filingStatus: "single",
    annualIncome: 200000,
    stateCode: "CA",
    existingAMTPreference: 0,
  },
  scenario: {
    optionsToExercise: 2500,
    exerciseDate: new Date(),
    holdingPeriod: 12,
    expectedFMVAtSale: 75,
  },
};

const normalizeNumber = (value: unknown): number | null => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const extractEquityComp = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
};

const optionLabels: Record<OptionType, string> = {
  iso: "ISO (Incentive Stock Options)",
  nso: "NSO (Non-qualified Stock Options)",
};

const filingStatusLabels: Record<FilingStatus, string> = {
  single: "Single",
  married: "Married Filing Jointly",
  head_of_household: "Head of Household",
};

const strategyLabels: Record<ExerciseStrategy, string> = {
  exercise_and_hold: "Exercise & Hold",
  exercise_and_sell: "Exercise & Sell",
  cashless: "Cashless Exercise",
};

const STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

const formatDateInput = (date: Date) =>
  new Date(date).toISOString().split("T")[0];

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("stock-option-exercise");
  const toDate = (value: unknown) =>
    typeof value === "string" ? new Date(value) : value;
  const normalizedPreset: Partial<CalculatorInputs> | undefined = preset
    ? ({
        ...preset,
        option: {
          ...preset.option,
          grantDate: toDate(preset.option?.grantDate),
          vestStartDate: toDate(preset.option?.vestStartDate),
        },
        scenario: {
          ...preset.scenario,
          exerciseDate: toDate(preset.scenario?.exerciseDate),
        },
      } as Partial<CalculatorInputs>)
    : undefined;
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    "option.optionType": [
      "equity_compensation",
      (value: unknown) => {
        const optionType = extractEquityComp(value)?.stock_option_type;
        return optionType === "iso" || optionType === "nso" ? optionType : null;
      },
    ],
    "option.totalOptions": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.stock_option_total_options) ??
        null,
    ],
    "option.strikePrice": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.stock_option_strike_price) ??
        null,
    ],
    "option.currentFMV": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.stock_option_current_fmv) ??
        null,
    ],
    "option.vestedOptions": [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.stock_option_vested_options) ??
        null,
    ],
    "tax.annualIncome": "annual_income",
    "tax.filingStatus": [
      "filing_status",
      (value: unknown) => {
        const raw = typeof value === "string" ? value : null;
        if (!raw) return null;
        const mapped =
          raw === "married_filing_jointly" || raw === "married_filing_separately"
            ? "married"
            : raw;
        return mapped === "single" ||
          mapped === "married" ||
          mapped === "head_of_household"
          ? mapped
          : null;
      },
    ],
    "tax.stateCode": [
      "state",
      (value: unknown) => {
        const state = typeof value === "string" ? value : null;
        return STATE_CODES.includes(state ?? "") ? state : null;
      },
    ],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(() =>
    mergeDeep(DEFAULT_INPUTS, normalizedPreset ?? undefined)
  );
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );


  useEffect(() => {
    if (!normalizedPreset) return;
    setInputs((prev) => mergeDeep(prev, normalizedPreset));
  }, [normalizedPreset]);

  const results = useMemo(() => calculate(inputs), [inputs]);

  const perShareSpread = Math.max(
    0,
    inputs.option.currentFMV - inputs.option.strikePrice
  );
  const inTheMoneyTotal = perShareSpread * inputs.scenario.optionsToExercise;

  const recommended = results.recommendedStrategy;
  const selectedTimeline =
    recommended === "exercise_and_hold"
      ? results.exerciseAndHold
      : recommended === "exercise_and_sell"
        ? results.exerciseAndSell
        : results.cashlessExercise;

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">
            Equity Compensation
          </p>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Stock Option Exercise Decision Tool
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Model ISO and NSO exercise scenarios to understand AMT, taxes, and
            cash requirements before you commit.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl space-y-10">
          <LoadMyDataBanner
            isLoaded={memoryLoaded}
            hasData={memoryHasDefaults}
            isApplied={preFilledFields.size > 0}
            onApply={handleLoadData}
          />
          <div className="rounded-2xl bg-neutral-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Option grant details
                </h2>
                <p className="text-sm text-neutral-400">
                  Define your grant, vesting, and current in-the-money value.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["iso", "nso"] as OptionType[]).map((optionType) => (
                  <button
                    key={optionType}
                    type="button"
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        option: { ...prev.option, optionType },
                      }))
                    }
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      inputs.option.optionType === optionType
                        ? "border-amber-400 bg-amber-500/10 text-amber-200"
                        : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
                    }`}
                  >
                    {optionType.toUpperCase()}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <MemoryBadge
                  isActive={preFilledFields.has("option.optionType")}
                  label="Memory"
                />
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <SliderInput
                  label="Total Options"
                  value={inputs.option.totalOptions}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      option: { ...prev.option, totalOptions: value },
                    }))
                  }
                  min={1}
                  max={1000000}
                  step={100}
                  format="number"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("option.totalOptions")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Vested Options"
                  value={inputs.option.vestedOptions}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      option: { ...prev.option, vestedOptions: value },
                    }))
                  }
                  min={0}
                  max={1000000}
                  step={100}
                  format="number"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("option.vestedOptions")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Strike Price"
                  value={inputs.option.strikePrice}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      option: { ...prev.option, strikePrice: value },
                    }))
                  }
                  min={0.01}
                  max={1000}
                  step={0.01}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("option.strikePrice")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Current FMV"
                  value={inputs.option.currentFMV}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      option: { ...prev.option, currentFMV: value },
                    }))
                  }
                  min={0.01}
                  max={5000}
                  step={0.01}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("option.currentFMV")}
                      label="Memory"
                    />
                  }
                />
              </div>

              <div className="space-y-6">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="text-xs uppercase tracking-widest text-amber-200">
                    In the money
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {formatCurrency(inTheMoneyTotal, 0)}
                  </p>
                  <div className="mt-2 text-sm text-amber-100/80">
                    <p>
                      Spread per share: {formatCurrency(perShareSpread, 2)}
                    </p>
                    <p>
                      Options modeled: {formatNumber(inputs.scenario.optionsToExercise)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">Grant date</label>
                  <input
                    type="date"
                    value={formatDateInput(inputs.option.grantDate)}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        option: {
                          ...prev.option,
                          grantDate: new Date(event.target.value),
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-white">
                    Vest start date
                  </label>
                  <input
                    type="date"
                    value={formatDateInput(inputs.option.vestStartDate)}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        option: {
                          ...prev.option,
                          vestStartDate: new Date(event.target.value),
                        },
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white"
                  />
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-4 text-sm text-neutral-400">
                  <p className="font-semibold text-neutral-200">Option type</p>
                  <p className="mt-2">{optionLabels[inputs.option.optionType]}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Tax profile</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Model federal, state, and AMT interactions based on your income.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">Filing status</label>
                <select
                  value={inputs.tax.filingStatus}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      tax: {
                        ...prev.tax,
                        filingStatus: event.target.value as FilingStatus,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white"
                >
                  {Object.entries(filingStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <MemoryBadge
                    isActive={preFilledFields.has("tax.filingStatus")}
                    label="Memory"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">State</label>
                <select
                  value={inputs.tax.stateCode}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      tax: {
                        ...prev.tax,
                        stateCode: event.target.value,
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white"
                >
                  {STATE_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
                <div className="mt-2">
                  <MemoryBadge
                    isActive={preFilledFields.has("tax.stateCode")}
                    label="Memory"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold text-white">
                  Annual income (W-2)
                </label>
                <div className="rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-sm text-neutral-300">
                  {formatCurrency(inputs.tax.annualIncome, 0)}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-6">
              <SliderInput
                label="Annual Income (W-2)"
                value={inputs.tax.annualIncome}
                onChange={(value) =>
                  setInputs((prev) => ({
                    ...prev,
                    tax: { ...prev.tax, annualIncome: value },
                  }))
                }
                min={0}
                max={5000000}
                step={10000}
                format="currency"
                rightSlot={
                  <MemoryBadge
                    isActive={preFilledFields.has("tax.annualIncome")}
                    label="Memory"
                  />
                }
              />
              {inputs.option.optionType === "iso" && (
                <SliderInput
                  label="Other AMT Preference Items"
                  value={inputs.tax.existingAMTPreference}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      tax: { ...prev.tax, existingAMTPreference: value },
                    }))
                  }
                  min={0}
                  max={1000000}
                  step={1000}
                  format="currency"
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Exercise scenario</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Stress test timing, expected appreciation, and your holding period.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="space-y-6">
                <SliderInput
                  label="Options to Exercise"
                  value={inputs.scenario.optionsToExercise}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      scenario: { ...prev.scenario, optionsToExercise: value },
                    }))
                  }
                  min={0}
                  max={Math.max(inputs.option.vestedOptions, 100)}
                  step={100}
                  format="number"
                />
                <SliderInput
                  label="Holding Period (months)"
                  value={inputs.scenario.holdingPeriod}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      scenario: { ...prev.scenario, holdingPeriod: value },
                    }))
                  }
                  min={0}
                  max={60}
                  step={1}
                  format="number"
                />
                <SliderInput
                  label="Expected FMV at Sale"
                  value={inputs.scenario.expectedFMVAtSale}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      scenario: { ...prev.scenario, expectedFMVAtSale: value },
                    }))
                  }
                  min={0.01}
                  max={10000}
                  step={1}
                  format="currency"
                />
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-white">
                  Planned exercise date
                </label>
                <input
                  type="date"
                  value={formatDateInput(inputs.scenario.exerciseDate)}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      scenario: {
                        ...prev.scenario,
                        exerciseDate: new Date(event.target.value),
                      },
                    }))
                  }
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm text-white"
                />

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-400">
                  <p className="text-neutral-200">Vested coverage</p>
                  <p className="mt-2">
                    Exercising {formatNumber(inputs.scenario.optionsToExercise)} of
                    {" "}
                    {formatNumber(inputs.option.vestedOptions)} vested options.
                  </p>
                  {inputs.scenario.optionsToExercise > inputs.option.vestedOptions && (
                    <p className="mt-2 text-amber-300">
                      Options to exercise exceed vested shares. Update your vesting
                      schedule or scenario.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">
              Scenario comparison
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Compare cash required, total taxes, and net outcome for each strategy.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              {[
                results.exerciseAndHold,
                results.exerciseAndSell,
                results.cashlessExercise,
              ].map((scenario) => (
                <ResultCard
                  key={scenario.strategy}
                  title={strategyLabels[scenario.strategy]}
                  primaryValue={formatCurrency(scenario.netProfit, 0)}
                  primaryLabel="Net profit"
                  variant={scenario.strategy === recommended ? "amber" : "neutral"}
                  items={[
                    {
                      label: "Cash required",
                      value: formatCurrency(scenario.exerciseCost.cashRequired, 0),
                    },
                    {
                      label: "Total tax paid",
                      value: formatCurrency(scenario.totalTaxPaid, 0),
                    },
                    {
                      label: "Effective tax rate",
                      value: formatPercent(scenario.effectiveTaxRate),
                    },
                  ]}
                />
              ))}
            </div>
          </div>

          {inputs.option.optionType === "iso" && results.amtAnalysis && (
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">AMT analysis</h2>
              <p className="mt-2 text-sm text-neutral-400">
                ISO spreads can trigger AMT even if no regular tax is due at exercise.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase text-neutral-500">Regular tax</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(results.amtAnalysis.regularTax, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase text-neutral-500">Tentative AMT</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(results.amtAnalysis.tentativeMinimumTax, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase text-neutral-500">AMT owed</p>
                  <p className="mt-2 text-lg font-semibold text-amber-200">
                    {formatCurrency(results.amtAnalysis.amtOwed, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-xs uppercase text-neutral-500">
                    Break-even spread
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {formatCurrency(results.amtAnalysis.breakEvenSpread, 0)}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-400">
                <p>
                  AMT credit generated: {formatCurrency(results.amtAnalysis.amtCreditGenerated, 0)}
                </p>
                <p className="mt-1">
                  Effective AMT rate on spread: {formatPercent(results.amtAnalysis.effectiveAMTRate)}
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Cash flow timeline</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Projected cash in and out for the recommended strategy ({strategyLabels[recommended]}).
              </p>

              <div className="mt-6 space-y-4">
                {selectedTimeline.cashFlowTimeline.map((entry, index) => (
                  <div
                    key={`${entry.event}-${index}`}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">{entry.event}</p>
                      <p className="text-xs text-neutral-400">{entry.date}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-semibold ${
                          entry.amount >= 0 ? "text-emerald-300" : "text-rose-300"
                        }`}
                      >
                        {formatCurrency(entry.amount, 0)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        Cumulative: {formatCurrency(entry.cumulative, 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                Qualifying disposition
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                ISO long-term capital gains require meeting both holding periods.
              </p>

              {results.qualifyingDispositionDate ? (
                <div className="mt-6 space-y-4">
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                    <p className="text-xs uppercase text-neutral-500">
                      Qualifying date
                    </p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {results.qualifyingDispositionDate.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                    <p className="text-xs uppercase text-neutral-500">Days remaining</p>
                    <p className="mt-2 text-lg font-semibold text-amber-200">
                      {formatNumber(results.daysUntilQualifying ?? 0)}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Must hold 2 years from grant and 1 year from exercise for ISO LTCG treatment.
                  </p>
                </div>
              ) : (
                <p className="mt-6 text-sm text-neutral-400">
                  Qualifying disposition tracking is only relevant for ISOs.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Recommendations</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Guidance based on modeled outcomes. For education only.
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <VerdictCard
                  verdict={strategyLabels[recommended]}
                  description="Recommended strategy based on modeled net profit."
                  type="neutral"
                />
              </div>
              <div className="lg:col-span-2 space-y-4">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="text-sm font-semibold text-white">Key recommendations</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-neutral-300">
                    {results.recommendations.length > 0 ? (
                      results.recommendations.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>Run multiple scenarios to compare opportunity cost.</li>
                    )}
                  </ul>
                </div>
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                  <p className="text-sm font-semibold text-amber-100">Warnings</p>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-100/90">
                    {results.warnings.length > 0 ? (
                      results.warnings.map((item) => <li key={item}>{item}</li>)
                    ) : (
                      <li>No major warnings triggered with current inputs.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <MethodologySection>
            <p>
              This tool models ISO and NSO tax treatment using 2024 federal tax
              brackets, simplified state rates, and AMT calculations. ISO spreads
              generate AMT preference income, while NSO spreads are taxed as
              ordinary income with FICA.
            </p>
            <p>
              Holding period rules follow IRS guidelines: ISOs require 2 years from
              grant and 1 year from exercise for long-term capital gains. NSOs
              qualify after 12 months.
            </p>
            <p>
              Results are estimates for educational purposes and do not replace
              personalized tax advice.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
