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
import {
  calculate,
  DEFAULT_CARD_DATA,
  type CardMeta,
} from "@/lib/calculators/chase-trifecta/calculations";
import type { CalculatorInputs } from "@/lib/calculators/chase-trifecta/types";
import { useCreditCardData, usePointsPrograms } from "@/lib/strata/hooks";
import type { CreditCardData, PointsProgram } from "@clearmoney/strata-sdk";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";

const DEFAULT_INPUTS: CalculatorInputs = {
  pointsValue: 1.25,
  spending: {
    dining: 400,
    groceries: 600,
    gas: 150,
    travel: 200,
    streaming: 50,
    drugstores: 50,
    other: 1500,
  },
  cards: {
    hasSapphirePreferred: false,
    hasSapphireReserve: true,
    hasFreedomFlex: true,
    hasFreedomUnlimited: true,
  },
};

const DEFAULT_POINTS_PRESETS = [
  { label: "Cash (1¢)", value: 1.0 },
  { label: "Portal (1.25¢)", value: 1.25 },
  { label: "Transfers (1.75¢)", value: 1.75 },
];

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

const SPENDING_INPUTS = [
  { key: "dining", label: "Dining & Restaurants", icon: "🍽️", min: 0, max: 2000, step: 25 },
  { key: "groceries", label: "Groceries", icon: "🛒", min: 0, max: 2000, step: 50 },
  { key: "gas", label: "Gas Stations", icon: "⛽", min: 0, max: 500, step: 25 },
  { key: "travel", label: "Travel (Flights, Hotels)", icon: "✈️", min: 0, max: 2000, step: 50 },
  { key: "streaming", label: "Streaming Services", icon: "📺", min: 0, max: 200, step: 10 },
  { key: "drugstores", label: "Drugstores", icon: "💊", min: 0, max: 200, step: 10 },
  { key: "other", label: "Everything Else", icon: "🧾", min: 0, max: 5000, step: 100 },
];

const CARD_OPTIONS = [
  {
    key: "hasSapphireReserve",
    name: "Sapphire Reserve",
    detail: "3x dining & travel, $300 travel credit",
    annualFee: "$550 AF",
  },
  {
    key: "hasSapphirePreferred",
    name: "Sapphire Preferred",
    detail: "3x dining, streaming, groceries",
    annualFee: "$95 AF",
  },
  {
    key: "hasFreedomFlex",
    name: "Freedom Flex",
    detail: "3x dining & drugstores",
    annualFee: "$0 AF",
  },
  {
    key: "hasFreedomUnlimited",
    name: "Freedom Unlimited",
    detail: "1.5x everywhere + 3x dining",
    annualFee: "$0 AF",
  },
] as const;

const buildCardMeta = (cards: CreditCardData[] | undefined): Record<string, CardMeta> => {
  if (!cards?.length) return DEFAULT_CARD_DATA;
  const find = (id: string) => cards.find((card) => card.id === id);

  const reserve = find("chase-sapphire-reserve");
  const preferred = find("chase-sapphire-preferred");
  const flex = find("chase-freedom-flex");
  const unlimited = find("chase-freedom-unlimited");

  const travelCredit = (card?: CreditCardData) =>
    card?.credits
      .filter((credit) => credit.category === "travel")
      .reduce((sum, credit) => sum + credit.value, 0) ?? 0;

  return {
    sapphireReserve: {
      name: reserve?.name ?? DEFAULT_CARD_DATA.sapphireReserve.name,
      annualFee: reserve?.annual_fee ?? DEFAULT_CARD_DATA.sapphireReserve.annualFee,
      travelCredit: travelCredit(reserve) || DEFAULT_CARD_DATA.sapphireReserve.travelCredit,
    },
    sapphirePreferred: {
      name: preferred?.name ?? DEFAULT_CARD_DATA.sapphirePreferred.name,
      annualFee: preferred?.annual_fee ?? DEFAULT_CARD_DATA.sapphirePreferred.annualFee,
      travelCredit: travelCredit(preferred) || DEFAULT_CARD_DATA.sapphirePreferred.travelCredit,
    },
    freedomFlex: {
      name: flex?.name ?? DEFAULT_CARD_DATA.freedomFlex.name,
      annualFee: flex?.annual_fee ?? DEFAULT_CARD_DATA.freedomFlex.annualFee,
      travelCredit: travelCredit(flex) || DEFAULT_CARD_DATA.freedomFlex.travelCredit,
    },
    freedomUnlimited: {
      name: unlimited?.name ?? DEFAULT_CARD_DATA.freedomUnlimited.name,
      annualFee: unlimited?.annual_fee ?? DEFAULT_CARD_DATA.freedomUnlimited.annualFee,
      travelCredit: travelCredit(unlimited) || DEFAULT_CARD_DATA.freedomUnlimited.travelCredit,
    },
  };
};

const buildPointsPresets = (programs: PointsProgram[] | undefined) => {
  const chase = programs?.find((p) => p.id === "chase-ur");
  if (!chase) return DEFAULT_POINTS_PRESETS;
  return [
    { label: "Cash (1¢)", value: 1.0 },
    { label: `Portal (${chase.valuations.conservative}¢)`, value: chase.valuations.conservative },
    { label: `Transfers (${chase.valuations.optimistic}¢)`, value: chase.valuations.optimistic },
  ];
};

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("chase-trifecta");
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
    "spending.gas": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["gas", "gasoline", "fuel"]),
    ],
    "spending.travel": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["travel", "flights", "airfare", "hotels"]),
    ],
    "spending.streaming": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["streaming"]),
    ],
    "spending.drugstores": [
      "spending_categories_monthly",
      (v: unknown) => getCategoryValue(v, ["drugstores", "pharmacy"]),
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
  const [sapphireWarning, setSapphireWarning] = useState("");

  const cardMeta = useMemo(() => buildCardMeta(creditCardData), [creditCardData]);
  const pointsPresets = useMemo(
    () => buildPointsPresets(pointsPrograms),
    [pointsPrograms]
  );

  useEffect(() => {
    if (!pointsPresets.length) return;
    setInputs((prev) => ({
      ...prev,
      pointsValue: prev.pointsValue || pointsPresets[1]?.value || prev.pointsValue,
    }));
  }, [pointsPresets]);

  const results = useMemo(() => calculate(inputs, cardMeta), [inputs, cardMeta]);

  const handleToggle = (key: (typeof CARD_OPTIONS)[number]["key"]) => {
    setInputs((prev) => {
      const nextCards = { ...prev.cards };
      const currentValue = nextCards[key];
      const nextValue = !currentValue;

      if (key === "hasSapphireReserve" && nextValue) {
        if (nextCards.hasSapphirePreferred) {
          setSapphireWarning("You can only have one Sapphire card. We switched you to Sapphire Reserve.");
        }
        nextCards.hasSapphirePreferred = false;
      }

      if (key === "hasSapphirePreferred" && nextValue) {
        if (nextCards.hasSapphireReserve) {
          setSapphireWarning("You can only have one Sapphire card. We switched you to Sapphire Preferred.");
        }
        nextCards.hasSapphireReserve = false;
      }

      nextCards[key] = nextValue;

      if (
        key !== "hasSapphireReserve" &&
        key !== "hasSapphirePreferred" &&
        sapphireWarning
      ) {
        setSapphireWarning("");
      }

      return { ...prev, cards: nextCards };
    });
  };

  const netValueLabel = results.totals.netValue >= 0 ? "Net annual value" : "Net annual cost";

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Chase Trifecta Calculator
          </h1>
          <p className="text-lg text-neutral-400">
            Optimize your Chase cards to maximize every swipe.
          </p>
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
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Select your cards</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Choose the Chase cards you currently have. You can only hold one Sapphire card.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {CARD_OPTIONS.map((card) => {
                const selected = inputs.cards[card.key];
                return (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => handleToggle(card.key)}
                    className={`rounded-2xl border px-4 py-4 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#005EB8] ${
                      selected
                        ? "border-[#005EB8] bg-[#005EB8]/10"
                        : "border-neutral-800 bg-neutral-950/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-white font-semibold">{card.name}</span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          selected
                            ? "bg-[#005EB8] text-white"
                            : "bg-neutral-800 text-neutral-300"
                        }`}
                      >
                        {selected ? "Selected" : "Off"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-400">{card.detail}</p>
                    <p className="mt-2 text-xs text-neutral-500">{card.annualFee}</p>
                  </button>
                );
              })}
            </div>
            {sapphireWarning ? (
              <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                {sapphireWarning}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Points value</h2>
            <p className="text-sm text-neutral-400 mb-6">
              How do you typically redeem? Conservative redemptions start around 1.25¢.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {pointsPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setInputs((prev) => ({ ...prev, pointsValue: preset.value }))}
                  className={`rounded-lg border px-3 py-2 text-sm transition ${
                    inputs.pointsValue === preset.value
                      ? "border-[#005EB8] bg-[#005EB8]/20 text-white"
                      : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <SliderInput
              label="Points Value (cpp)"
              value={inputs.pointsValue}
              onChange={(value) => setInputs((prev) => ({ ...prev, pointsValue: value }))}
              min={0.5}
              max={2}
              step={0.05}
              format="number"
            />
            <p className="mt-3 text-xs text-neutral-500">
              Portal redemptions are typically 1.25¢ (CSP) or 1.5¢ (CSR). Transfers vary by partner.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Monthly spending</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {SPENDING_INPUTS.map((input) => (
                <div key={input.key}>
                  <SliderInput
                    label={`${input.icon} ${input.label}`}
                    value={inputs.spending[input.key as keyof typeof inputs.spending]}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        spending: { ...prev.spending, [input.key]: value },
                      }))
                    }
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    format="currency"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Which card to use</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-neutral-300">
                  <thead className="text-xs uppercase text-neutral-500">
                    <tr>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4">Use this card</th>
                      <th className="py-2 pr-4">Earn rate</th>
                      <th className="py-2 pr-4">Annual points</th>
                      <th className="py-2">Annual value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {results.categories.map((category) => (
                      <tr key={category.category}>
                        <td className="py-3 pr-4 text-white">{category.category}</td>
                        <td className="py-3 pr-4">{category.bestCard}</td>
                        <td className="py-3 pr-4">{category.earnRate.toFixed(1)}x</td>
                        <td className="py-3 pr-4">{formatNumber(Math.round(category.annualPoints))}</td>
                        <td className="py-3">{formatCurrency(category.annualValue, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <ResultCard
              title="Annual totals"
              primaryValue={formatCurrency(results.totals.netValue, 0)}
              primaryLabel={netValueLabel}
              items={[
                {
                  label: "Total annual spending",
                  value: formatCurrency(results.totals.annualSpending, 0),
                },
                {
                  label: "Total annual points",
                  value: formatNumber(Math.round(results.totals.annualPoints)),
                },
                {
                  label: "Point value",
                  value: formatCurrency(results.totals.annualValue, 0),
                },
                {
                  label: "Annual fees",
                  value: formatCurrency(results.totals.annualFees, 0),
                },
                {
                  label: "Annual credits",
                  value: formatCurrency(results.totals.annualCredits, 0),
                },
                {
                  label: "Effective return rate",
                  value: formatPercent(results.totals.effectiveRate / 100, 1),
                },
                {
                  label: "2% cash back baseline",
                  value: formatCurrency(results.totals.cashBackEquivalent, 0),
                },
                {
                  label: "Advantage vs 2%",
                  value: formatCurrency(results.totals.advantageVsCashBack, 0),
                },
              ]}
              variant="blue"
            />
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Card usage summary</h2>
            {results.cardUsage.length ? (
              <div className="space-y-4">
                {results.cardUsage.map((card) => (
                  <div
                    key={card.card}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-white font-semibold">{card.card}</h3>
                      <span className="text-sm text-neutral-300">
                        {formatNumber(Math.round(card.annualPoints))} pts
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-400">
                      {card.categories.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">
                Select at least one card to see a category recommendation.
              </p>
            )}
          </div>

          <div
            className={`rounded-2xl border px-6 py-5 ${
              results.recommendation.isWorthIt
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-amber-500/40 bg-amber-500/10"
            }`}
          >
            <h2 className="text-lg font-semibold text-white mb-2">
              {results.recommendation.isWorthIt ? "Worth it" : "Maybe not"}
            </h2>
            <p className="text-sm text-neutral-200">{results.recommendation.message}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <details className="rounded-2xl bg-neutral-900/50 p-6">
            <summary className="text-lg font-semibold text-white cursor-pointer">
              How we calculate this
            </summary>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>
                We compare each spending category against the cards you selected and choose the
                highest earn rate available. Freedom Flex 5x rotating categories are excluded to keep
                the estimate conservative.
              </p>
              <p>
                Points are valued based on your cents-per-point input. Sapphire Reserve includes its
                $300 annual travel credit, while Sapphire Preferred does not include a credit.
              </p>
              <p>
                The 2% cash back baseline assumes a flat-rate card with no annual fee. Effective
                return is calculated as net value divided by annual spending.
              </p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
