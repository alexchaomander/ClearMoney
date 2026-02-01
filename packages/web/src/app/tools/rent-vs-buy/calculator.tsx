"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, MethodologySection, SliderInput } from "@/components/shared";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { formatCurrency, formatNumber } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/rent-vs-buy/calculations";
import type { CalculatorInputs } from "@/lib/calculators/rent-vs-buy/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  monthlyRent: 2000,
  annualRentIncrease: 3,
  homePrice: 400000,
  downPaymentPercent: 20,
  mortgageRate: 6.5,
  loanTermYears: 30,
  propertyTaxRate: 1.2,
  homeAppreciationRate: 3,
  maintenanceRate: 1,
  investmentReturnRate: 7,
  timeHorizon: 10,
};

export function Calculator() {
  const {
    defaults: memoryDefaults,
    preFilledFields,
    isLoaded: memoryLoaded,
  } = useMemoryPreFill<CalculatorInputs>({
    monthlyRent: "monthly_rent",
    homePrice: "home_value",
    mortgageRate: ["mortgage_rate", (v: unknown) => Number(v) * 100],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  useEffect(() => {
    if (memoryLoaded) {
      setInputs((prev) => ({ ...prev, ...memoryDefaults }));
    }
  }, [memoryLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => calculate(inputs), [inputs]);

  const winnerLabel =
    results.winner === "buy"
      ? "Buying Wins"
      : results.winner === "rent"
        ? "Renting Wins"
        : "It's a Toss-Up";

  const winnerTone =
    results.winner === "buy"
      ? "positive"
      : results.winner === "rent"
        ? "neutral"
        : "neutral";

  const winnerColor =
    results.winner === "buy"
      ? "text-emerald-400"
      : results.winner === "rent"
        ? "text-teal-400"
        : "text-amber-400";

  const winnerBg =
    results.winner === "buy"
      ? "bg-emerald-500/10 border-emerald-500/30"
      : results.winner === "rent"
        ? "bg-teal-500/10 border-teal-500/30"
        : "bg-amber-500/10 border-amber-500/30";

  return (
    <AppShell>
      {/* Hero */}
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300 mb-3">
            Rent vs Buy Calculator
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Should You Rent or Buy?
          </h1>
          <p className="text-lg text-neutral-400">
            Compare the long-term financial impact of renting and investing the
            difference versus buying a home, year by year.
          </p>
        </div>
      </section>

      {/* Inputs */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Renting Section */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Renting
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Monthly Rent"
                  value={inputs.monthlyRent}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, monthlyRent: value }))
                  }
                  min={500}
                  max={10000}
                  step={100}
                  format="currency"
                  description="Current monthly rent payment."
                />
                {preFilledFields.has("monthlyRent") && (
                  <div className="-mt-4 mb-2 ml-1">
                    <MemoryBadge
                      field="monthlyRent"
                      preFilledFields={preFilledFields}
                    />
                  </div>
                )}
                <SliderInput
                  label="Annual Rent Increase"
                  value={inputs.annualRentIncrease}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      annualRentIncrease: value,
                    }))
                  }
                  min={0}
                  max={10}
                  step={0.5}
                  format="percent"
                  description="Expected yearly rent increase."
                />
              </div>
            </div>
          </div>

          {/* Buying Section */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">Buying</h2>
              <div className="space-y-6">
                <SliderInput
                  label="Home Price"
                  value={inputs.homePrice}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, homePrice: value }))
                  }
                  min={100000}
                  max={2000000}
                  step={10000}
                  format="currency"
                  description="Purchase price of the home."
                />
                {preFilledFields.has("homePrice") && (
                  <div className="-mt-4 mb-2 ml-1">
                    <MemoryBadge
                      field="homePrice"
                      preFilledFields={preFilledFields}
                    />
                  </div>
                )}
                <SliderInput
                  label="Down Payment"
                  value={inputs.downPaymentPercent}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      downPaymentPercent: value,
                    }))
                  }
                  min={0}
                  max={50}
                  step={1}
                  format="percent"
                  description={`${formatCurrency(inputs.homePrice * (inputs.downPaymentPercent / 100), 0)} cash down.`}
                />
                <SliderInput
                  label="Mortgage Rate"
                  value={inputs.mortgageRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, mortgageRate: value }))
                  }
                  min={2}
                  max={12}
                  step={0.125}
                  format="percent"
                  description="Fixed rate for the loan term."
                />
                {preFilledFields.has("mortgageRate") && (
                  <div className="-mt-4 mb-2 ml-1">
                    <MemoryBadge
                      field="mortgageRate"
                      preFilledFields={preFilledFields}
                    />
                  </div>
                )}
                <SliderInput
                  label="Loan Term"
                  value={inputs.loanTermYears}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, loanTermYears: value }))
                  }
                  min={10}
                  max={30}
                  step={5}
                  format="number"
                  description="Length of the mortgage in years."
                />
                <SliderInput
                  label="Property Tax Rate"
                  value={inputs.propertyTaxRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, propertyTaxRate: value }))
                  }
                  min={0}
                  max={4}
                  step={0.1}
                  format="percent"
                  description="Annual property tax as % of home value."
                />
                <SliderInput
                  label="Home Appreciation"
                  value={inputs.homeAppreciationRate}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      homeAppreciationRate: value,
                    }))
                  }
                  min={0}
                  max={10}
                  step={0.5}
                  format="percent"
                  description="Expected annual home value increase."
                />
                <SliderInput
                  label="Maintenance Cost"
                  value={inputs.maintenanceRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, maintenanceRate: value }))
                  }
                  min={0}
                  max={3}
                  step={0.25}
                  format="percent"
                  description="Annual maintenance as % of home value."
                />
              </div>
            </div>
          </div>

          {/* Assumptions Section */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Investment & Time Horizon
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Investment Return Rate"
                  value={inputs.investmentReturnRate}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      investmentReturnRate: value,
                    }))
                  }
                  min={0}
                  max={15}
                  step={0.5}
                  format="percent"
                  description="Annual return if you invest instead of buying."
                />
                <SliderInput
                  label="Time Horizon"
                  value={inputs.timeHorizon}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, timeHorizon: value }))
                  }
                  min={1}
                  max={30}
                  step={1}
                  format="number"
                  description="How many years to compare."
                />
              </div>
            </div>
          </div>

          {/* Verdict */}
          <div
            className={`rounded-xl border p-6 text-center ${winnerBg}`}
          >
            <p className={`text-2xl sm:text-3xl font-bold mb-2 ${winnerColor}`}>
              {winnerLabel}
            </p>
            <p className="text-sm text-neutral-300">
              Over {inputs.timeHorizon} year{inputs.timeHorizon !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Net Worth Comparison */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Net Worth After {inputs.timeHorizon} Year
              {inputs.timeHorizon !== 1 ? "s" : ""}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className={`rounded-xl border p-5 ${
                  results.winner === "rent"
                    ? "border-teal-500/40 bg-teal-500/5"
                    : "border-neutral-800 bg-neutral-950/60"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                  Renting + Investing
                </p>
                <p
                  className={`text-2xl font-bold ${
                    results.winner === "rent" ? "text-teal-400" : "text-white"
                  }`}
                >
                  {formatCurrency(results.rentNetWorthAtEnd, 0)}
                </p>
                <p className="text-sm text-neutral-400 mt-2">
                  Investment balance from down payment + monthly savings
                </p>
                {results.winner === "rent" && (
                  <span className="inline-block mt-3 px-2 py-1 bg-teal-500/20 text-teal-400 text-xs font-medium rounded">
                    Winner
                  </span>
                )}
              </div>
              <div
                className={`rounded-xl border p-5 ${
                  results.winner === "buy"
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-neutral-800 bg-neutral-950/60"
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-neutral-500 mb-2">
                  Buying
                </p>
                <p
                  className={`text-2xl font-bold ${
                    results.winner === "buy" ? "text-emerald-400" : "text-white"
                  }`}
                >
                  {formatCurrency(results.buyNetWorthAtEnd, 0)}
                </p>
                <p className="text-sm text-neutral-400 mt-2">
                  Home equity minus selling costs
                </p>
                {results.winner === "buy" && (
                  <span className="inline-block mt-3 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">
                    Winner
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Break-Even & Key Numbers */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">Key Numbers</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Break-even year
                </span>
                <span className="text-sm font-semibold text-white">
                  {results.breakEvenYear
                    ? `Year ${results.breakEvenYear}`
                    : `Not within ${inputs.timeHorizon} years`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Total rent paid
                </span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(results.totalRentCost, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Total buy cost (incl. down payment & closing)
                </span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(results.totalBuyCost, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Final home equity
                </span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(results.finalHomeEquity, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Renter investment balance
                </span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(results.finalInvestmentBalance, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">
                  Monthly savings if renting (year 1)
                </span>
                <span className="text-sm font-semibold text-white">
                  {formatCurrency(results.monthlySavingsIfRenting, 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Year-by-Year Timeline */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">
              Year-by-Year Comparison
            </h2>
            <div className="overflow-x-auto">
              <div className="overflow-hidden rounded-xl border border-neutral-800">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-950/70 text-neutral-400">
                    <tr>
                      <th className="px-3 py-3 text-left font-semibold">
                        Year
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Rent Cost
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Buy Cost
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Rent Net Worth
                      </th>
                      <th className="px-3 py-3 text-right font-semibold">
                        Buy Net Worth
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {results.timeline.map((row) => (
                      <tr key={row.year}>
                        <td className="px-3 py-3 text-neutral-400">
                          {row.year}
                        </td>
                        <td className="px-3 py-3 text-right text-white">
                          {formatCurrency(row.rentCost, 0)}
                        </td>
                        <td className="px-3 py-3 text-right text-white">
                          {formatCurrency(row.buyCost, 0)}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-medium ${
                            row.rentNetWorth > row.buyNetWorth
                              ? "text-teal-400"
                              : "text-neutral-300"
                          }`}
                        >
                          {formatCurrency(row.rentNetWorth, 0)}
                        </td>
                        <td
                          className={`px-3 py-3 text-right font-medium ${
                            row.buyNetWorth > row.rentNetWorth
                              ? "text-emerald-400"
                              : "text-neutral-300"
                          }`}
                        >
                          {formatCurrency(row.buyNetWorth, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Recommendation</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {results.recommendation}
            </p>
          </div>
        </div>
      </section>

      {/* Methodology */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <MethodologySection>
            <p>
              This calculator compares two scenarios: (1) renting and investing
              the difference (down payment + monthly savings) in a diversified
              portfolio, versus (2) buying a home with a fixed-rate mortgage.
            </p>
            <p>
              Buying costs include principal and interest, property taxes,
              homeowners insurance (~0.35% of value), and annual maintenance.
              Closing costs are estimated at 3% of the purchase price, and
              selling costs at 6% are subtracted from the buyer&apos;s net worth
              to reflect real-world liquidity.
            </p>
            <p>
              The renter&apos;s investment balance grows at the specified return
              rate, starting with the full down payment amount and adding monthly
              savings (the difference between annual buy cost and rent). Rent
              increases annually at the specified rate.
            </p>
            <p>
              Break-even is the first year where the buyer&apos;s net worth
              (home equity minus selling costs) exceeds the renter&apos;s
              investment balance. All figures are nominal (not inflation-adjusted).
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
