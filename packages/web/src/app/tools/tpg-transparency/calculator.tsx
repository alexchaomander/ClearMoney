"use client";

import { useCallback, useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCPP,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/shared/formatters";
import {
  calculate,
  getCards,
} from "@/lib/calculators/tpg-transparency/calculations";
import type {
  CalculatorInputs,
  CreditCard,
  RedemptionStyle,
  ValueComparison,
} from "@/lib/calculators/tpg-transparency/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  selectedCard: "sapphire-preferred",
  spending: {
    dining: 400,
    travel: 200,
    groceries: 500,
    other: 1500,
  },
  redemptionStyle: "cashBack",
};

const REDEMPTION_OPTIONS: Array<{
  id: RedemptionStyle;
  label: string;
  description: string;
}> = [
  {
    id: "cashBack",
    label: "Cash Back",
    description: "1.0¢ per point baseline",
  },
  {
    id: "portal",
    label: "Travel Portal",
    description: "1.25-1.5¢ per point",
  },
  {
    id: "transfers",
    label: "Transfer Partners",
    description: "1.5-2.0¢ per point",
  },
];

const CARD_BRAND_STYLES: Record<string, { accent: string; logo: string }> = {
  Chase: { accent: "from-blue-500 to-sky-400", logo: "Chase" },
  Amex: { accent: "from-emerald-500 to-teal-400", logo: "Amex" },
  "Capital One": { accent: "from-rose-500 to-orange-400", logo: "Capital One" },
  Citi: { accent: "from-indigo-500 to-sky-400", logo: "Citi" },
};

const normalizeNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const getCategoryValue = (value: unknown, key: string) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return normalizeNumber((value as Record<string, unknown>)[key]);
};

const formatComparisonValue = (comparison: ValueComparison): string => {
  if (comparison.label === "Point Valuation") {
    return formatCPP(comparison.tpgValue);
  }
  return formatCurrency(comparison.tpgValue);
};

const formatOurComparisonValue = (comparison: ValueComparison): string => {
  if (comparison.label === "Point Valuation") {
    return formatCPP(comparison.ourValue);
  }
  return formatCurrency(comparison.ourValue);
};

const formatComparisonDifference = (comparison: ValueComparison): string => {
  if (comparison.label === "Point Valuation") {
    return formatCPP(comparison.difference);
  }
  return formatCurrency(comparison.difference);
};

const getCardBrand = (card: CreditCard) =>
  CARD_BRAND_STYLES[card.issuer] || {
    accent: "from-emerald-500 to-lime-400",
    logo: card.issuer,
  };

export function Calculator() {
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    "spending.dining": [
      "spending_categories_monthly",
      (value: unknown) => getCategoryValue(value, "dining"),
    ],
    "spending.travel": [
      "spending_categories_monthly",
      (value: unknown) => getCategoryValue(value, "travel"),
    ],
    "spending.groceries": [
      "spending_categories_monthly",
      (value: unknown) => getCategoryValue(value, "groceries"),
    ],
    "spending.other": [
      "spending_categories_monthly",
      (value: unknown) => getCategoryValue(value, "other"),
    ],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );
  const cards = useMemo(() => getCards(), []);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const selectedCard = results.card;
  const totalMonthlySpend =
    inputs.spending.dining +
    inputs.spending.travel +
    inputs.spending.groceries +
    inputs.spending.other;

  const inflationPercent = results.percentageInflation;
  const inflationDisplay = formatPercent(Math.abs(inflationPercent), 0, true);
  const inflationBarValue = Math.min(Math.max(inflationPercent, 0), 150);
  const inflationBarWidth = (inflationBarValue / 150) * 100;

  const cardBrand = getCardBrand(selectedCard);

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 mb-4">
            Transparency Report
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            TPG Transparency Tool
          </h1>
          <p className="text-lg text-neutral-400">
            What affiliate sites don&apos;t tell you about credit card recommendations.
          </p>
          <p className="mt-4 text-lg font-semibold text-emerald-300">
            Follow the money.
          </p>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-3xl rounded-2xl bg-neutral-900 p-6 space-y-4">
          <h2 className="text-xl font-semibold">The Problem</h2>
          <p className="text-neutral-400">
            Affiliate marketing drives an estimated $50M+ in annual revenue for major
            credit card review sites. Payouts can reach $200-$500 per approved
            application, especially on premium cards with higher annual fees.
          </p>
          <p className="text-neutral-400">
            This creates a conflict of interest: inflated point valuations make
            high-fee cards look better, and ranking lists often align with the
            highest affiliate payouts. We show the numbers side by side so you can
            decide for yourself.
          </p>
          <div className="rounded-xl bg-neutral-800 p-4 text-sm text-neutral-200">
            <span className="font-semibold text-emerald-300">Current example:</span>{" "}
            The Points Guy earns an estimated{" "}
            <span className="font-semibold text-white">
              {formatCurrency(results.estimatedAffiliatePayout)}
            </span>{" "}
            per signup for the selected card.
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
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-6">Card to Analyze</h2>
              <div className="space-y-4">
                <label className="block text-sm text-neutral-400">
                  Card selection
                </label>
                <select
                  value={inputs.selectedCard}
                  onChange={(event) =>
                    setInputs((prev) => ({
                      ...prev,
                      selectedCard: event.target.value,
                    }))
                  }
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {cards.map((card) => (
                    <option key={card.id} value={card.id}>
                      {card.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
                <div
                  className={`rounded-2xl bg-gradient-to-br ${
                    cardBrand.accent
                  } p-[1px]`}
                >
                  <div className="rounded-[1.1rem] bg-neutral-950 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">
                          {cardBrand.logo}
                        </p>
                        <p className="text-lg font-semibold text-white">
                          {selectedCard.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-neutral-400">Annual fee</p>
                        <p className="text-lg font-semibold">
                          {formatCurrency(selectedCard.annualFee)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-300">
                      <span className="rounded-full bg-neutral-800 px-3 py-1">
                        {selectedCard.issuer}
                      </span>
                      <span className="rounded-full bg-neutral-800 px-3 py-1">
                        {formatNumber(selectedCard.signUpBonus.points)} points bonus
                      </span>
                      {selectedCard.tpgRanking ? (
                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-200">
                          TPG Rank #{selectedCard.tpgRanking}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-6">Your Spending</h2>
              <div className="space-y-6">
                <SliderInput
                  label="Monthly Dining"
                  value={inputs.spending.dining}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      spending: { ...prev.spending, dining: value },
                    }))
                  }
                  min={0}
                  max={3000}
                  step={50}
                  format="currency"
                />
                <SliderInput
                  label="Monthly Travel"
                  value={inputs.spending.travel}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      spending: { ...prev.spending, travel: value },
                    }))
                  }
                  min={0}
                  max={3000}
                  step={50}
                  format="currency"
                />
                <SliderInput
                  label="Monthly Groceries"
                  value={inputs.spending.groceries}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      spending: { ...prev.spending, groceries: value },
                    }))
                  }
                  min={0}
                  max={3000}
                  step={50}
                  format="currency"
                />
                <SliderInput
                  label="Monthly Other"
                  value={inputs.spending.other}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      spending: { ...prev.spending, other: value },
                    }))
                  }
                  min={0}
                  max={5000}
                  step={100}
                  format="currency"
                />
              </div>
              <div className="mt-6 rounded-xl bg-neutral-950 p-4 text-sm text-neutral-400">
                Total monthly spend:{" "}
                <span className="text-white font-semibold">
                  {formatCurrency(totalMonthlySpend)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-6">
              Point Redemption Style
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {REDEMPTION_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setInputs((prev) => ({
                      ...prev,
                      redemptionStyle: option.id,
                    }))
                  }
                  className={`rounded-xl border px-4 py-4 text-left transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    inputs.redemptionStyle === option.id
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-neutral-800 bg-neutral-950"
                  }`}
                >
                  <p className="text-sm font-semibold text-white">
                    {option.label}
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {option.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-6">
              Side-by-Side Comparison
            </h2>
            <div className="overflow-hidden rounded-xl border border-neutral-800">
              <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] bg-neutral-950 text-sm text-neutral-400">
                <div className="px-4 py-3">Metric</div>
                <div className="px-4 py-3">TPG Says</div>
                <div className="px-4 py-3">Reality</div>
                <div className="px-4 py-3">Difference</div>
              </div>
              {results.comparisons.map((comparison) => (
                <div
                  key={comparison.label}
                  className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-t border-neutral-800 text-sm"
                >
                  <div className="px-4 py-3 text-white">
                    {comparison.label}
                  </div>
                  <div className="px-4 py-3 text-neutral-200">
                    {formatComparisonValue(comparison)}
                  </div>
                  <div className="px-4 py-3 text-emerald-200">
                    {formatOurComparisonValue(comparison)}
                  </div>
                  <div className="px-4 py-3 text-neutral-300">
                    {formatComparisonDifference(comparison)} ({formatPercent(
                      comparison.percentInflated,
                      0,
                      true,
                    )})
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-4">Inflation Meter</h2>
              <p className="text-sm text-neutral-400 mb-6">
                {inflationPercent >= 0
                  ? `TPG's valuation is ${inflationDisplay} higher than conservative estimates.`
                  : `TPG's valuation is ${inflationDisplay} lower than conservative estimates.`}
              </p>
              <div className="h-3 w-full rounded-full bg-neutral-800">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-rose-500"
                  style={{ width: `${inflationBarWidth}%` }}
                />
              </div>
              <div className="mt-3 flex justify-between text-xs text-neutral-500">
                <span>0%</span>
                <span>75%</span>
                <span>150%+</span>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-4">Affiliate Context</h2>
              <div className="space-y-3 text-sm text-neutral-300">
                <p>
                  Estimated affiliate payout:{" "}
                  <span className="text-white font-semibold">
                    {formatCurrency(results.estimatedAffiliatePayout)}
                  </span>
                </p>
                <p>
                  As a share of the annual fee:{" "}
                  <span className="text-white font-semibold">
                    {formatPercent(results.affiliateAsPercentOfFee, 0, true)}
                  </span>
                </p>
                <p>
                  This is what the recommender earns when you sign up — not what
                  you take home.
                </p>
              </div>
              <div className="mt-4 rounded-xl bg-neutral-950 p-4 text-xs text-neutral-400">
                Disclaimer: Affiliate payouts are estimated based on public
                reporting and may vary by issuer, channel, or time.
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-4 text-rose-300">
                Red Flags
              </h2>
              <ul className="space-y-3 text-sm text-neutral-300">
                {results.redFlags.map((flag) => (
                  <li key={flag} className="flex gap-2">
                    <span className="text-rose-400">⚠️</span>
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-4 text-emerald-300">
                Key Considerations
              </h2>
              <ul className="space-y-3 text-sm text-neutral-300">
                {results.considerations.map((note) => (
                  <li key={note} className="flex gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <details className="rounded-2xl bg-neutral-900/50 p-6">
            <summary className="text-lg font-semibold text-white cursor-pointer">
              How we calculate this
            </summary>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>
                We calculate annual points based on your monthly spending and the
                card&apos;s published earn rates. We then value those points using
                three scenarios: TPG&apos;s published valuation, a conservative
                portal redemption value, and a transfer-partner value for advanced
                users.
              </p>
              <p>
                Credits are discounted by usability. For example, a $200 credit
                with 50% usability contributes $100 to your realistic value.
                Sign-up bonuses are excluded from the annual value to keep the
                comparison focused on ongoing rewards.
              </p>
              <p>
                Affiliate payouts are estimated ranges from public reporting and
                are meant to show incentives, not exact numbers.
              </p>
            </div>
          </details>

          <div className="rounded-2xl bg-neutral-900 p-6 text-sm text-neutral-300">
            <p className="font-semibold text-white mb-2">Disclaimer</p>
            <p>
              We&apos;re not saying The Points Guy is wrong — they provide valuable
              research and travel inspiration. This tool simply shows how
              different valuation assumptions and affiliate incentives can change
              the math. Always make decisions based on your own goals and
              redemption habits.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
