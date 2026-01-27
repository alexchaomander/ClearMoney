"use client";

import { useMemo, useState } from "react";
import { ComparisonCard, ResultCard } from "@/components/shared";
import {
  formatCPP,
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/shared/formatters";
import { calculate, CURRENCIES } from "@/lib/calculators/points-valuation/calculations";
import type {
  CalculatorInputs,
  PointsCurrency,
  RedemptionStyle,
} from "@/lib/calculators/points-valuation/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  holdings: {
    "chase-ur": 0,
    "amex-mr": 0,
    "citi-ty": 0,
    "capital-one": 0,
    marriott: 0,
    hilton: 0,
    hyatt: 0,
  },
  redemptionStyle: "conservative",
};

const HOLDING_FIELDS = [
  { id: "chase-ur", label: "Chase Ultimate Rewards", max: 1_000_000 },
  { id: "amex-mr", label: "Amex Membership Rewards", max: 1_000_000 },
  { id: "citi-ty", label: "Citi ThankYou", max: 1_000_000 },
  { id: "capital-one", label: "Capital One Miles", max: 1_000_000 },
  { id: "marriott", label: "Marriott Bonvoy", max: 1_000_000 },
  { id: "hilton", label: "Hilton Honors", max: 1_000_000 },
  { id: "hyatt", label: "World of Hyatt", max: 500_000 },
];

const STYLE_DETAILS: Record<
  RedemptionStyle,
  { label: string; description: string }
> = {
  conservative: {
    label: "Conservative",
    description: "Cash out or portal redemptions that most people actually use.",
  },
  moderate: {
    label: "Moderate",
    description: "A balanced mix of portals and a few strategic transfers.",
  },
  optimistic: {
    label: "Optimistic",
    description: "Transfer-heavy strategy with more planning and flexibility.",
  },
};

const formatDifference = (value: number) =>
  `${value >= 0 ? "+" : ""}${formatPercent(value, 0, true)}`;

const formatNullableCPP = (value: number | null) =>
  value === null ? "Not available" : formatCPP(value);

const getAverageCpp = (
  currencies: PointsCurrency[],
  key: "tpg" | "conservative" | "moderate" | "optimistic"
) =>
  currencies.reduce((sum, currency) => sum + currency.valuations[key], 0) /
  currencies.length;

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const hasHoldings = results.holdings.length > 0;

  const averageOurCpp = getAverageCpp(results.currencies, inputs.redemptionStyle);
  const averageTpgCpp = getAverageCpp(results.currencies, "tpg");
  const averageDifference =
    averageOurCpp > 0
      ? ((averageTpgCpp - averageOurCpp) / averageOurCpp) * 100
      : 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-400 mb-3">
            ClearMoney Labs
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Points Valuation Dashboard
          </h1>
          <p className="text-lg text-neutral-400">
            Transparent, methodology-backed valuations. No affiliate bias.
          </p>
        </div>
      </section>

      <section className="px-4 pb-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-4">Redemption Style</h2>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(STYLE_DETAILS) as RedemptionStyle[]).map(
                  (style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() =>
                        setInputs((prev) => ({ ...prev, redemptionStyle: style }))
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-950 ${
                        inputs.redemptionStyle === style
                          ? "border-blue-500 bg-blue-500/15 text-blue-200"
                          : "border-neutral-700 text-neutral-300 hover:border-neutral-500"
                      }`}
                    >
                      {STYLE_DETAILS[style].label}
                    </button>
                  )
                )}
              </div>
              <p className="text-sm text-neutral-400 sm:max-w-md">
                {STYLE_DETAILS[inputs.redemptionStyle].description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex flex-col gap-2 text-neutral-400">
            <h2 className="text-xl font-semibold text-white">
              Currency Valuations
            </h2>
            <p className="text-sm">
              Values shown in cents per point (cpp) using your selected redemption
              style.
            </p>
          </div>

          <div className="hidden md:block rounded-2xl border border-neutral-800 bg-neutral-900/60">
            <div className="grid grid-cols-5 gap-4 border-b border-neutral-800 px-6 py-4 text-xs uppercase tracking-wide text-neutral-400">
              <div>Currency</div>
              <div>Our Value</div>
              <div>TPG Value</div>
              <div>Difference</div>
              <div>Methodology</div>
            </div>
            <div className="divide-y divide-neutral-800">
              {results.currencies.map((currency) => {
                const ourCpp = currency.valuations[inputs.redemptionStyle];
                const differencePercent =
                  ourCpp > 0
                    ? ((currency.valuations.tpg - ourCpp) / ourCpp) * 100
                    : 0;

                return (
                  <div
                    key={currency.id}
                    className="grid grid-cols-5 gap-4 px-6 py-4 text-sm"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {currency.shortName}
                      </p>
                      <p className="text-xs text-neutral-500">{currency.name}</p>
                    </div>
                    <div className="font-semibold text-blue-300">
                      {formatCPP(ourCpp)}
                    </div>
                    <div>{formatCPP(currency.valuations.tpg)}</div>
                    <div className="text-amber-300">
                      {formatDifference(differencePercent)}
                    </div>
                    <div className="text-xs text-neutral-400">
                      <details>
                        <summary className="cursor-pointer text-blue-300">
                          View methodology
                        </summary>
                        <div className="mt-2 space-y-2">
                          <p>Cash out: {formatNullableCPP(currency.methodology.cashOut)}</p>
                          <p>Portal value: {formatNullableCPP(currency.methodology.portalValue)}</p>
                          <p>{currency.methodology.transferValue}</p>
                          <div>
                            <p className="text-neutral-500">Best uses:</p>
                            <ul className="list-disc pl-4">
                              {currency.bestUses.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-neutral-500">Worst uses:</p>
                            <ul className="list-disc pl-4">
                              {currency.worstUses.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:hidden">
            {results.currencies.map((currency) => {
              const ourCpp = currency.valuations[inputs.redemptionStyle];
              const differencePercent =
                ourCpp > 0
                  ? ((currency.valuations.tpg - ourCpp) / ourCpp) * 100
                  : 0;

              return (
                <div
                  key={currency.id}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {currency.shortName}
                      </p>
                      <p className="text-xs text-neutral-500">{currency.name}</p>
                    </div>
                    <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300">
                      Our value: {formatCPP(ourCpp)}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-neutral-500">TPG value</p>
                      <p className="font-semibold">
                        {formatCPP(currency.valuations.tpg)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-neutral-500">Difference</p>
                      <p className="font-semibold text-amber-300">
                        {formatDifference(differencePercent)}
                      </p>
                    </div>
                  </div>
                  <details className="mt-4 text-xs text-neutral-400">
                    <summary className="cursor-pointer text-blue-300">
                      View methodology and uses
                    </summary>
                    <div className="mt-3 space-y-2">
                      <p>Cash out: {formatNullableCPP(currency.methodology.cashOut)}</p>
                      <p>Portal value: {formatNullableCPP(currency.methodology.portalValue)}</p>
                      <p>{currency.methodology.transferValue}</p>
                      <div>
                        <p className="text-neutral-500">Best uses:</p>
                        <ul className="list-disc pl-4">
                          {currency.bestUses.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-neutral-500">Worst uses:</p>
                        <ul className="list-disc pl-4">
                          {currency.worstUses.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-2">Your Portfolio</h2>
            <p className="text-sm text-neutral-400 mb-6">
              Optional: add your balances to see what your points are worth.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {HOLDING_FIELDS.map((field) => (
                <label key={field.id} className="text-sm text-neutral-300">
                  {field.label}
                  <input
                    type="number"
                    min={0}
                    max={field.max}
                    step={100}
                    value={inputs.holdings[field.id]}
                    onChange={(event) => {
                      const nextValue = Math.min(
                        Math.max(Number(event.target.value), 0),
                        field.max
                      );
                      setInputs((prev) => ({
                        ...prev,
                        holdings: { ...prev.holdings, [field.id]: nextValue },
                      }));
                    }}
                    className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <ResultCard
              title="Portfolio Value"
              primaryValue={
                hasHoldings
                  ? formatCurrency(results.totals.ourValue, 0)
                  : "$0"
              }
              primaryLabel={`ClearMoney (${STYLE_DETAILS[inputs.redemptionStyle].label})`}
              items={[
                {
                  label: "TPG valuation",
                  value: hasHoldings
                    ? formatCurrency(results.totals.tpgValue, 0)
                    : "$0",
                },
                {
                  label: "TPG overvaluation",
                  value: hasHoldings
                    ? `${formatCurrency(results.totals.overvaluation, 0)} (${formatDifference(
                        results.totals.percentOvervaluation
                      )})`
                    : "$0",
                  highlight: true,
                },
              ]}
              variant="blue"
            />

            {!hasHoldings && (
              <div className="rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
                Add a balance above to see totals. We only count currencies with
                points entered.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-2">
          <ComparisonCard
            title="Valuation Snapshot"
            leftTitle="TPG Average"
            leftValue={formatCPP(averageTpgCpp)}
            rightTitle={`ClearMoney (${STYLE_DETAILS[inputs.redemptionStyle].label})`}
            rightValue={formatCPP(averageOurCpp)}
            leftItems={[
              {
                label: "Avg. difference",
                value: formatDifference(averageDifference),
              },
              {
                label: "Currencies covered",
                value: formatNumber(results.currencies.length),
              },
            ]}
            rightItems={[
              {
                label: "Methodology",
                value: STYLE_DETAILS[inputs.redemptionStyle].label,
              },
              {
                label: "Bias check",
                value: "No affiliate weighting",
              },
            ]}
          />
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <h3 className="text-lg font-semibold mb-3">
              Why our valuations are different
            </h3>
            <div className="space-y-3 text-sm text-neutral-400">
              <p>
                Affiliate-driven valuations often assume premium redemptions that
                most people never book.
              </p>
              <p>
                We anchor on realistic options: cash-out baselines, portal
                redemptions, and everyday transfer partners.
              </p>
              <p className="border-l-2 border-blue-500 pl-4 text-neutral-300">
                If you would never pay $8,000 for a first-class ticket, you
                shouldn&apos;t value points as if you would.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-xl font-semibold mb-4">Methodology by Currency</h2>
          <div className="space-y-4">
            {CURRENCIES.map((currency) => (
              <details
                key={currency.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5"
              >
                <summary className="cursor-pointer text-base font-semibold text-white">
                  {currency.name}
                </summary>
                <div className="mt-4 grid gap-3 text-sm text-neutral-400 sm:grid-cols-2">
                  <div>
                    <p className="text-neutral-500">Cash-out value</p>
                    <p>{formatNullableCPP(currency.methodology.cashOut)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Portal value</p>
                    <p>{formatNullableCPP(currency.methodology.portalValue)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-neutral-500">Transfer notes</p>
                    <p>{currency.methodology.transferValue}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Best uses</p>
                    <ul className="list-disc pl-4">
                      {currency.bestUses.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-neutral-500">Worst uses</p>
                    <ul className="list-disc pl-4">
                      {currency.worstUses.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
