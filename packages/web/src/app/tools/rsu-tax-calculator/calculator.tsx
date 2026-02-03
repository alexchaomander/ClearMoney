"use client";

import { useCallback, useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ComparisonCard, ResultCard } from "@/components/shared/ResultCard";
import {
  AppShell,
  MethodologySection,
  VerdictCard,
} from "@/components/shared/AppShell";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/shared/formatters";
import {
  calculate,
  STATE_RATES,
} from "@/lib/calculators/rsu-tax-calculator/calculations";
import type {
  CalculatorInputs,
  FilingStatus,
  WithholdingMethod,
} from "@/lib/calculators/rsu-tax-calculator/types";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  sharesVesting: 100,
  stockPrice: 150,
  filingStatus: "single",
  annualSalary: 200000,
  otherIncome: 0,
  state: "CA",
  withholdingMethod: "sell_to_cover",
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

const FILING_STATUS_OPTIONS: Array<{ value: FilingStatus; label: string }> = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "head_of_household", label: "Head of Household" },
];

const WITHHOLDING_METHODS: Array<{
  value: WithholdingMethod;
  label: string;
  description: string;
}> = [
  {
    value: "sell_to_cover",
    label: "Sell to cover",
    description: "Company sells shares at vesting to cover withholding.",
  },
  {
    value: "net_settlement",
    label: "Net settlement",
    description: "Company keeps some shares, you receive the net shares.",
  },
  {
    value: "cash",
    label: "Cash withholding",
    description: "You pay the withholding in cash and keep all shares.",
  },
];

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  DC: "District of Columbia",
};

const STATE_OPTIONS = Object.keys(STATE_NAMES)
  .map((code) => ({
    code,
    name: STATE_NAMES[code],
    rate: STATE_RATES[code] ?? 0,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

export function Calculator() {
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    sharesVesting: [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.rsu_shares_vesting) ?? null,
    ],
    stockPrice: [
      "equity_compensation",
      (value: unknown) =>
        normalizeNumber(extractEquityComp(value)?.rsu_grant_current_price) ?? null,
    ],
    annualSalary: "annual_income",
    filingStatus: [
      "filing_status",
      (value: unknown) => {
        const raw = typeof value === "string" ? value : null;
        if (!raw) return null;
        const mapped =
          raw === "married_filing_jointly" || raw === "married_filing_separately"
            ? "married"
            : raw;
        return FILING_STATUS_OPTIONS.some((option) => option.value === mapped)
          ? mapped
          : null;
      },
    ],
    state: [
      "state",
      (value: unknown) => {
        const state = typeof value === "string" ? value : null;
        return STATE_OPTIONS.some((option) => option.code === state)
          ? state
          : null;
      },
    ],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );

  const results = useMemo(() => calculate(inputs), [inputs]);
  const taxRate = results.actualTax.total / results.grossValue;
  const gapAbsolute = Math.abs(results.withholdingGap);
  const isSmallGap = gapAbsolute < 250;
  const stateRate = STATE_RATES[inputs.state] ?? 0;
  const isHighTaxState = stateRate >= 0.1;

  const verdictType = results.isUnderwithheld
    ? "negative"
    : isSmallGap
      ? "neutral"
      : "positive";

  const verdictTitle = results.isUnderwithheld
    ? "Underwithheld"
    : isSmallGap
      ? "Close match"
      : "Overwithheld";

  const verdictDescription = results.isUnderwithheld
    ? `Set aside ${formatCurrency(gapAbsolute, 0)} for tax time to avoid surprises.`
    : isSmallGap
      ? "Your withholding is close to your estimated tax bill."
      : `Expect a refund around ${formatCurrency(gapAbsolute, 0)} if this is your only RSU vest.`;

  const withholdingGapLabel = results.isUnderwithheld
    ? "Additional tax due"
    : "Expected refund";

  const withholdingGapFooter = results.isUnderwithheld
    ? "Most companies only withhold at the 22% supplemental rate."
    : "Overwithholding can happen if your marginal rate is below 22%.";

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-300 mb-3">
            RSU Tax Calculator
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Understand exactly how your RSUs are taxed
          </h1>
          <p className="text-lg text-neutral-400">
            Estimate the withholding gap so you can plan ahead and avoid tax-time
            surprises.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <LoadMyDataBanner
            isLoaded={memoryLoaded}
            hasData={memoryHasDefaults}
            isApplied={preFilledFields.size > 0}
            onApply={handleLoadData}
          />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  RSU details
                </h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Shares vesting"
                    value={inputs.sharesVesting}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, sharesVesting: value }))
                    }
                    min={1}
                    max={10000}
                    step={1}
                    format="number"
                    description="Total RSUs scheduled to vest in this event"
                    rightSlot={
                      <MemoryBadge
                        isActive={preFilledFields.has("sharesVesting")}
                        label="Memory"
                      />
                    }
                  />
                  <SliderInput
                    label="Stock price at vest"
                    value={inputs.stockPrice}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, stockPrice: value }))
                    }
                    min={1}
                    max={5000}
                    step={1}
                    format="currency"
                    description="Fair market value per share at vesting"
                    rightSlot={
                      <MemoryBadge
                        isActive={preFilledFields.has("stockPrice")}
                        label="Memory"
                      />
                    }
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Income & filing status
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">
                      Filing status
                    </label>
                    <select
                      value={inputs.filingStatus}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          filingStatus: event.target.value as FilingStatus,
                        }))
                      }
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {FILING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <MemoryBadge
                        isActive={preFilledFields.has("filingStatus")}
                        label="Memory"
                      />
                    </div>
                  </div>
                  <SliderInput
                    label="Annual base salary"
                    value={inputs.annualSalary}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, annualSalary: value }))
                    }
                    min={0}
                    max={1000000}
                    step={5000}
                    format="currency"
                    description="Used to estimate your marginal federal tax bracket"
                    rightSlot={
                      <MemoryBadge
                        isActive={preFilledFields.has("annualSalary")}
                        label="Memory"
                      />
                    }
                  />
                  <SliderInput
                    label="Other income"
                    value={inputs.otherIncome}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, otherIncome: value }))
                    }
                    min={0}
                    max={500000}
                    step={5000}
                    format="currency"
                    description="Bonuses, side income, or other taxable earnings"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Location & withholding
                </h2>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-neutral-400">
                        State of residence
                      </label>
                      {isHighTaxState && (
                        <span className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 px-2 py-1 rounded-full">
                          High-tax state
                        </span>
                      )}
                    </div>
                    <select
                      value={inputs.state}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          state: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {STATE_OPTIONS.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.name} ({formatPercent(option.rate, 1)})
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <MemoryBadge
                        isActive={preFilledFields.has("state")}
                        label="Memory"
                      />
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                      State taxes are simplified using the top marginal rate.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm text-neutral-400 mb-3">
                      Withholding method
                    </label>
                    <div className="grid gap-3 sm:grid-cols-3">
                      {WITHHOLDING_METHODS.map((method) => (
                        <button
                          key={method.value}
                          type="button"
                          onClick={() =>
                            setInputs((prev) => ({
                              ...prev,
                              withholdingMethod: method.value,
                            }))
                          }
                          className={cn(
                            "rounded-xl border px-3 py-3 text-left text-sm transition",
                            inputs.withholdingMethod === method.value
                              ? "border-indigo-400/70 bg-indigo-500/10 text-indigo-200"
                              : "border-neutral-800 text-neutral-300 hover:border-indigo-400/60"
                          )}
                        >
                          <p className="font-semibold">{method.label}</p>
                          <p className="text-xs text-neutral-400 mt-2">
                            {method.description}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6 text-sm text-neutral-300">
              <p className="font-semibold text-indigo-200 mb-2">
                Why this matters
              </p>
              <p className="text-neutral-400">
                Most RSU withholding uses the 22% federal supplemental rate. If your
                marginal tax rate is higher, you owe the difference at tax time.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <ResultCard
              title="The big picture"
              primaryValue={formatCurrency(results.netValue, 0)}
              primaryLabel="Net value after estimated taxes"
              items={[
                {
                  label: "Gross RSU value",
                  value: formatCurrency(results.grossValue, 0),
                },
                {
                  label: "Total taxes",
                  value: `${formatCurrency(results.actualTax.total, 0)} (${formatPercent(taxRate, 1)})`,
                  highlight: true,
                },
                {
                  label: "Marginal federal bracket",
                  value: formatPercent(results.marginalBracket, 0),
                },
                {
                  label: "State tax rate",
                  value: formatPercent(results.actualTax.stateRate, 1),
                },
              ]}
              variant="purple"
              footer={
                <div className="space-y-3">
                  <div className="h-3 w-full rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${Math.min(taxRate * 100, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <span>Taxes</span>
                    <span>Net RSU value</span>
                  </div>
                </div>
              }
            />

            <VerdictCard
              verdict={verdictTitle}
              description={verdictDescription}
              type={verdictType}
            />

            <ResultCard
              title="Withholding gap"
              primaryValue={formatCurrency(gapAbsolute, 0)}
              primaryLabel={withholdingGapLabel}
              items={[
                {
                  label: "Company withholding",
                  value: formatCurrency(results.withholding.totalWithheld, 0),
                },
                {
                  label: "Actual tax on RSU",
                  value: formatCurrency(results.actualTax.total, 0),
                  highlight: results.isUnderwithheld,
                },
              ]}
              variant={results.isUnderwithheld ? "red" : "green"}
              footer={
                <div className="rounded-xl bg-neutral-800/60 p-4 text-xs text-neutral-300">
                  {withholdingGapFooter}
                </div>
              }
            />
          </div>
        </div>
      </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Tax breakdown
            </h2>
            <div className="overflow-hidden rounded-xl border border-neutral-800">
              <table className="w-full text-sm">
                <thead className="bg-neutral-950 text-neutral-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Tax type</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 text-right font-medium">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  <tr>
                    <td className="px-4 py-3 text-neutral-300">Federal income</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.actualTax.federalIncome, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">
                      {formatPercent(results.actualTax.federalRate, 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-neutral-300">State income</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.actualTax.stateIncome, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">
                      {formatPercent(results.actualTax.stateRate, 1)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-neutral-300">Social Security</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.actualTax.socialSecurity, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">6.2%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-neutral-300">Medicare</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.actualTax.medicare, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">1.45%</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-neutral-300">Add&apos;l Medicare</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.actualTax.additionalMedicare, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-neutral-400">0.9%</td>
                  </tr>
                  <tr className="bg-neutral-950">
                    <td className="px-4 py-3 font-semibold text-white">Total</td>
                    <td className="px-4 py-3 text-right font-semibold text-white">
                      {formatCurrency(results.actualTax.total, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-indigo-200">
                      {formatPercent(results.actualTax.effectiveRate, 1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            {inputs.withholdingMethod === "sell_to_cover" && (
              <ResultCard
                title="Shares breakdown"
                primaryValue={formatNumber(results.withholding.sharesReceived)}
                primaryLabel="Shares you receive"
                items={[
                  {
                    label: "Shares vesting",
                    value: formatNumber(inputs.sharesVesting),
                  },
                  {
                    label: "Shares sold for taxes",
                    value: formatNumber(results.withholding.sharesWithheld),
                    highlight: true,
                  },
                ]}
                variant="purple"
              />
            )}

            <ComparisonCard
              title="Withholding vs. liability"
              leftTitle="Company withholding"
              leftValue={formatCurrency(results.withholding.totalWithheld, 0)}
              rightTitle="Actual tax"
              rightValue={formatCurrency(results.actualTax.total, 0)}
              winner={results.isUnderwithheld ? "right" : "left"}
              leftItems={[
                {
                  label: "Federal",
                  value: formatCurrency(results.withholding.federalWithheld, 0),
                },
                {
                  label: "State",
                  value: formatCurrency(results.withholding.stateWithheld, 0),
                },
              ]}
              rightItems={[
                {
                  label: "FICA",
                  value: formatCurrency(results.actualTax.medicare + results.actualTax.socialSecurity + results.actualTax.additionalMedicare, 0),
                },
                {
                  label: "Effective rate",
                  value: formatPercent(results.actualTax.effectiveRate, 1),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Personalized recommendations
            </h2>
            <ul className="space-y-3 text-sm text-neutral-300">
              {results.recommendations.map((recommendation) => (
                <li key={recommendation} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          <MethodologySection title="RSU tax education">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  Why is withholding insufficient?
                </h3>
                <p>
                  Companies usually withhold RSU income at the federal supplemental
                  rate (22%). If your marginal bracket is higher, the IRS expects
                  you to pay the difference when you file.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  What is my new cost basis?
                </h3>
                <p>
                  Your cost basis resets to the fair market value on the vest date.
                  Any future gains above {formatCurrency(results.newCostBasis, 2)}
                  per share are taxed as capital gains when you sell.
                </p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-white mb-2">
                  RSUs vs. stock options
                </h3>
                <p>
                  RSUs are taxed as ordinary income when they vest. Stock options
                  may have capital gains treatment if you meet holding requirements,
                  but they can also trigger AMT. This calculator focuses on RSUs.
                </p>
              </div>
            </div>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
