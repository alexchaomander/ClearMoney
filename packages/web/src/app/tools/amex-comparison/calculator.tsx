"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {
  AppShell,
  MethodologySection,
  VerdictCard,
} from "@/components/shared";
import { SliderInput } from "@/components/shared/SliderInput";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { formatCurrency, formatNumber } from "@/lib/shared/formatters";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";
import {
  calculate,
  DEFAULT_GOLD,
  DEFAULT_PLATINUM,
  type CardProfile,
} from "@/lib/calculators/amex-comparison/calculations";
import type {
  CalculatorInputs,
  CreditUsage,
  Preferences,
  SpendingInputs,
} from "@/lib/calculators/amex-comparison/types";
import { useCreditCardData, usePointsPrograms } from "@/lib/strata/hooks";
import type { CreditCardData } from "@clearmoney/strata-sdk";

const DEFAULT_INPUTS: CalculatorInputs = {
  spending: {
    dining: 500,
    groceries: 600,
    flights: 200,
    hotels: 100,
    other: 1000,
  },
  creditUsage: {
    uberCreditUsage: 80,
    diningCreditUsage: 70,
    airlineFeeUsage: 50,
    hotelCreditUsage: 50,
    entertainmentUsage: 60,
    saksUsage: 30,
  },
  preferences: {
    valuesLoungeAccess: false,
    flightsPerYear: 6,
    pointsValue: 1.2,
  },
};

const buildCardProfile = (
  card: CreditCardData | undefined,
  fallback: CardProfile,
  creditKeyMap: Record<string, string>
): CardProfile => {
  if (!card) return fallback;
  const credits: CardProfile["credits"] = {};

  card.credits.forEach((credit) => {
    const key = Object.entries(creditKeyMap).find(([label]) =>
      credit.name.toLowerCase().includes(label)
    );
    if (key) {
      credits[key[1]] = { max: credit.value };
    }
  });

  return {
    name: card.name,
    fee: card.annual_fee,
    rates: {
      dining: card.earn_rates?.dining ?? fallback.rates.dining ?? 1,
      groceries: card.earn_rates?.groceries ?? fallback.rates.groceries ?? 1,
      flights:
        card.earn_rates?.flights ??
        card.earn_rates?.travel ??
        fallback.rates.flights ??
        1,
      hotels: card.earn_rates?.hotels ?? fallback.rates.hotels ?? 1,
      other: card.earn_rates?.other ?? fallback.rates.other ?? 1,
    },
    credits: {
      ...fallback.credits,
      ...credits,
    },
    perks: fallback.perks,
  };
};

const normalizeNumber = (value: unknown): number | null => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const getCategoryValue = (value: unknown, keys: string[]): number | null => {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;
  for (const key of keys) {
    if (record[key] != null) {
      const parsed = normalizeNumber(record[key]);
      if (parsed != null) return parsed;
    }
  }
  return null;
};

const spendingFields: Array<{
  key: keyof SpendingInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  hint: string;
}> = [
  {
    key: "dining",
    label: "Dining",
    min: 0,
    max: 3000,
    step: 50,
    hint: "Gold earns 4x, Platinum earns 1x",
  },
  {
    key: "groceries",
    label: "Groceries",
    min: 0,
    max: 3000,
    step: 50,
    hint: "Gold earns 4x (up to $25k/yr)",
  },
  {
    key: "flights",
    label: "Flights",
    min: 0,
    max: 2000,
    step: 50,
    hint: "Gold earns 3x, Platinum earns 5x",
  },
  {
    key: "hotels",
    label: "Hotels",
    min: 0,
    max: 2000,
    step: 50,
    hint: "Platinum earns 5x via Amex Travel",
  },
  {
    key: "other",
    label: "Other Spending",
    min: 0,
    max: 5000,
    step: 100,
    hint: "Both earn 1x on everything else",
  },
];

const creditFields: Array<{
  key: keyof CreditUsage;
  label: string;
  min: number;
  max: number;
  note: string;
}> = [
  {
    key: "uberCreditUsage",
    label: "Uber Credit Usage",
    min: 0,
    max: 100,
    note: "Gold + Platinum",
  },
  {
    key: "diningCreditUsage",
    label: "Dining Credit Usage (Gold)",
    min: 0,
    max: 100,
    note: "Gold only",
  },
  {
    key: "airlineFeeUsage",
    label: "Airline Fee Credit Usage",
    min: 0,
    max: 100,
    note: "Platinum only",
  },
  {
    key: "hotelCreditUsage",
    label: "Hotel Credit Usage",
    min: 0,
    max: 100,
    note: "Platinum only",
  },
  {
    key: "entertainmentUsage",
    label: "Digital Entertainment Usage",
    min: 0,
    max: 100,
    note: "Platinum only",
  },
  {
    key: "saksUsage",
    label: "Saks Credit Usage",
    min: 0,
    max: 100,
    note: "Platinum only",
  },
];

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("amex-comparison");
  const { data: creditCardData } = useCreditCardData();
  const { data: pointsPrograms } = usePointsPrograms();
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    "spending.dining": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["dining", "restaurants"]),
    ],
    "spending.groceries": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["groceries", "grocery"]),
    ],
    "spending.flights": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["flights", "airfare", "travel"]),
    ],
    "spending.hotels": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["hotels", "lodging", "travel"]),
    ],
    "spending.other": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["other", "misc"]),
    ],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(() =>
    mergeDeep(DEFAULT_INPUTS, preset ?? undefined)
  );
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );

  const goldCard = useMemo(
    () => creditCardData?.find((card) => card.id === "amex-gold"),
    [creditCardData]
  );
  const platinumCard = useMemo(
    () => creditCardData?.find((card) => card.id === "amex-platinum"),
    [creditCardData]
  );

  const goldProfile = useMemo(
    () =>
      buildCardProfile(goldCard, DEFAULT_GOLD, {
        uber: "uber",
        dining: "dining",
      }),
    [goldCard]
  );
  const platinumProfile = useMemo(
    () =>
      buildCardProfile(platinumCard, DEFAULT_PLATINUM, {
        uber: "uber",
        airline: "airline",
        hotel: "hotel",
        entertainment: "entertainment",
        saks: "saks",
      }),
    [platinumCard]
  );

  useEffect(() => {
    const program = pointsPrograms?.find((p) => p.id === "amex-mr");
    if (!program) return;
    setInputs((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        pointsValue: prev.preferences.pointsValue || program.valuations.conservative,
      },
    }));
  }, [pointsPrograms]);

  const results = useMemo(
    () => calculate(inputs, goldProfile, platinumProfile),
    [inputs, goldProfile, platinumProfile]
  );

  const annualSpend = useMemo(() => {
    const { spending } = inputs;
    return (
      spending.dining +
      spending.groceries +
      spending.flights +
      spending.hotels +
      spending.other
    ) * 12;
  }, [inputs]);

  const winnerCopy =
    results.winner === "gold"
      ? "Gold wins"
      : results.winner === "platinum"
        ? "Platinum wins"
        : "It\'s a tie";

  const winnerVariant = results.winner === "tie" ? "neutral" : "positive";

  const comparisonRows = [
    {
      label: "Annual Fee",
      gold: formatCurrency(results.gold.annualFee, 0),
      platinum: formatCurrency(results.platinum.annualFee, 0),
    },
    {
      label: "Points Earned",
      gold: formatNumber(Math.round(results.gold.pointsEarned)),
      platinum: formatNumber(Math.round(results.platinum.pointsEarned)),
    },
    {
      label: "Points Value",
      gold: formatCurrency(results.gold.pointsValue, 0),
      platinum: formatCurrency(results.platinum.pointsValue, 0),
    },
    {
      label: "Credits Value",
      gold: formatCurrency(results.gold.creditsValue, 0),
      platinum: formatCurrency(results.platinum.creditsValue, 0),
    },
    {
      label: "Perks Value",
      gold: formatCurrency(results.gold.perksValue, 0),
      platinum: formatCurrency(results.platinum.perksValue, 0),
    },
    {
      label: "Net Value",
      gold: formatCurrency(results.gold.netValue, 0),
      platinum: formatCurrency(results.platinum.netValue, 0),
      highlight: true,
    },
    {
      label: "Effective Fee",
      gold: formatCurrency(results.gold.effectiveAnnualFee, 0),
      platinum: formatCurrency(results.platinum.effectiveAnnualFee, 0),
    },
  ];

  const verdictLine =
    results.winner === "tie"
      ? "It's a tie"
      : `${winnerCopy} by ${formatCurrency(Math.abs(results.difference), 0)}/year`;

  const updateSpending = (key: keyof SpendingInputs, value: number) => {
    setInputs((prev) => ({
      ...prev,
      spending: {
        ...prev.spending,
        [key]: value,
      },
    }));
  };

  const updateCreditUsage = (key: keyof CreditUsage, value: number) => {
    setInputs((prev) => ({
      ...prev,
      creditUsage: {
        ...prev.creditUsage,
        [key]: value,
      },
    }));
  };

  const updatePreferences = (key: keyof Preferences, value: number | boolean) => {
    setInputs((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-[#d4a017]">
              Premium Card Comparison
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-3 mb-4">
              Amex Gold vs Platinum
            </h1>
            <p className="text-lg text-neutral-400">
              Which premium Amex is right for you? Honest comparison based on
              what you actually spend and use.
            </p>
          </div>
        </section>

        <section className="px-4 pb-12">
          <div className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-20 rounded-xl bg-gradient-to-br from-[#f7d47a] via-[#d4a017] to-[#8c6a00]" />
                  <div>
                    <p className="text-sm text-neutral-400">Amex Gold</p>
                    <p className="text-xl font-semibold text-white">$250 fee</p>
                  </div>
                </div>
                <div className="text-center text-sm font-semibold text-neutral-400">
                  VS
                </div>
                <div className="flex items-center gap-4 sm:justify-end">
                  <div>
                    <p className="text-sm text-neutral-400">Amex Platinum</p>
                    <p className="text-xl font-semibold text-white">$695 fee</p>
                  </div>
                  <div className="h-14 w-20 rounded-xl bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-600" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl space-y-8">
            <LoadMyDataBanner
              isLoaded={memoryLoaded}
              hasData={memoryHasDefaults}
              isApplied={preFilledFields.size > 0}
              onApply={handleLoadData}
            />
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl bg-neutral-900 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Monthly spending
                  </h2>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                      Annual total
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {formatCurrency(annualSpend, 0)}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {spendingFields.map((field) => (
                    <SliderInput
                      key={field.key}
                      label={field.label}
                      value={inputs.spending[field.key]}
                      onChange={(value) => updateSpending(field.key, value)}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      format="currency"
                      description={field.hint}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-2xl bg-neutral-900 p-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Credit usage
                  </h2>
                  <p className="text-sm text-neutral-400 mb-6">
                    Be honest—what percentage of these credits will you actually
                    use?
                  </p>
                  <div className="space-y-6">
                    {creditFields.map((field) => (
                      <SliderInput
                        key={field.key}
                        label={field.label}
                        value={inputs.creditUsage[field.key]}
                        onChange={(value) => updateCreditUsage(field.key, value)}
                        min={field.min}
                        max={field.max}
                        step={5}
                        format="percent"
                        description={field.note}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-neutral-900 p-6">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Travel preferences
                  </h2>
                  <div className="space-y-6">
                    <label className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Values lounge access
                        </p>
                        <p className="text-xs text-neutral-500">
                          Centurion + Priority Pass value
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[#d4a017]"
                        checked={inputs.preferences.valuesLoungeAccess}
                        onChange={(event) =>
                          updatePreferences(
                            "valuesLoungeAccess",
                            event.target.checked
                          )
                        }
                      />
                    </label>
                    <SliderInput
                      label="Flights per year"
                      value={inputs.preferences.flightsPerYear}
                      onChange={(value) =>
                        updatePreferences("flightsPerYear", value)
                      }
                      min={0}
                      max={20}
                      step={1}
                      format="number"
                    />
                    <SliderInput
                      label="Points value (cpp)"
                      value={inputs.preferences.pointsValue}
                      onChange={(value) =>
                        updatePreferences("pointsValue", value)
                      }
                      min={0.8}
                      max={2}
                      step={0.1}
                      format="number"
                      description="We use a conservative 1.2¢ default."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900">
              <div className="px-6 py-4 border-b border-neutral-800">
                <h2 className="text-xl font-semibold text-white">
                  Head-to-head comparison
                </h2>
              </div>
              <div className="grid grid-cols-[1.2fr_1fr_1fr] text-sm">
                <div className="px-6 py-4 text-neutral-500">Metric</div>
                <div
                  className={`px-6 py-4 text-center font-semibold ${
                    results.winner === "gold" ? "text-[#d4a017]" : "text-white"
                  }`}
                >
                  Gold
                </div>
                <div
                  className={`px-6 py-4 text-center font-semibold ${
                    results.winner === "platinum"
                      ? "text-emerald-300"
                      : "text-white"
                  }`}
                >
                  Platinum
                </div>
              </div>
              <div className="divide-y divide-neutral-800">
                {comparisonRows.map((row) => (
                  <div
                    key={row.label}
                    className={`grid grid-cols-[1.2fr_1fr_1fr] items-center px-6 py-4 text-sm ${
                      row.highlight ? "bg-neutral-900/80" : ""
                    }`}
                  >
                    <span className="text-neutral-400">{row.label}</span>
                    <span
                      className={`text-center ${
                        row.highlight
                          ? "text-[#d4a017] font-semibold"
                          : "text-white"
                      }`}
                    >
                      {row.gold}
                    </span>
                    <span
                      className={`text-center ${
                        row.highlight
                          ? "text-emerald-300 font-semibold"
                          : "text-white"
                      }`}
                    >
                      {row.platinum}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <VerdictCard
              verdict={verdictLine}
              description={results.recommendation}
              type={winnerVariant}
            />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Things to consider
              </h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                {results.considerations.map((item, index) => (
                  <li key={index} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#d4a017]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <details className="rounded-2xl bg-neutral-900/50 border border-neutral-800 overflow-hidden">
              <summary className="px-6 py-4 text-lg font-semibold text-white cursor-pointer">
                Points earning breakdown
              </summary>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 text-xs uppercase tracking-[0.2em] text-neutral-500 py-3 border-b border-neutral-800">
                  <span>Category</span>
                  <span className="text-center">Gold</span>
                  <span className="text-center">Platinum</span>
                </div>
                {results.gold.breakdown.map((row) => {
                  const platinumRow = results.platinum.breakdown.find(
                    (entry) => entry.category === row.category
                  );
                  return (
                    <div
                      key={row.category}
                      className="grid grid-cols-[1.2fr_1fr_1fr] gap-4 py-4 border-b border-neutral-800 last:border-b-0 text-sm"
                    >
                      <div>
                        <p className="text-white font-medium">{row.category}</p>
                        <p className="text-xs text-neutral-500">
                          {formatCurrency(row.spend, 0)} · {row.multiplier}x
                        </p>
                      </div>
                      <p className="text-center text-white">
                        {formatNumber(Math.round(row.points))}
                      </p>
                      <p className="text-center text-white">
                        {formatNumber(Math.round(platinumRow?.points ?? 0))}
                      </p>
                    </div>
                  );
                })}
              </div>
            </details>

            <MethodologySection title="Methodology & assumptions">
              <p>
                We multiply your monthly spend by 12, then apply each card&apos;s
                earning rates to estimate annual points. We value points at the
                cents-per-point number you select, not inflated marketing rates.
              </p>
              <p>
                Credits are discounted by the percentage you say you&apos;ll use. For
                Platinum lounge access, we estimate $50 per visit and multiply
                by your flights per year when you say lounge access is valuable.
              </p>
              <p>
                Net value equals points value + credits + perks minus the annual
                fee. Effective fee shows the remaining cost after credits and
                lounge value.
              </p>
              <p className="text-sm text-neutral-500">
                These are estimates meant to help you compare honestly—many
                people hold both cards for different strengths.
              </p>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
