"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/shared/formatters";
import {
  AGI_LIMITS,
  STATE_TAX_RATES,
  calculate,
} from "@/lib/calculators/appreciated-stock-donation/calculations";
import type {
  CalculatorInputs,
  DonationType,
  FilingStatus,
} from "@/lib/calculators/appreciated-stock-donation/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  stock: {
    stockValue: 10000,
    costBasis: 2000,
    holdingPeriod: 24,
  },
  tax: {
    filingStatus: "single",
    adjustedGrossIncome: 200000,
    marginalTaxRate: 32,
    stateCode: "CA",
    itemizesDeductions: true,
  },
  donation: {
    donationAmount: 10000,
    donationType: "public_charity",
  },
};

const STATE_OPTIONS = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "head_of_household", label: "Head of Household" },
];

const DONATION_TYPE_OPTIONS: { value: DonationType; label: string }[] = [
  { value: "public_charity", label: "Public Charity" },
  { value: "daf", label: "Donor-Advised Fund" },
  { value: "private_foundation", label: "Private Foundation" },
];

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const stateRate = STATE_TAX_RATES[inputs.tax.stateCode] || 0;

  const donationMax = Math.max(inputs.stock.stockValue, 100);
  const cashLimitUsage =
    results.cashScenario.charitableDeduction > 0
      ? Math.min(results.cashScenario.charitableDeduction / results.cashAGILimit, 1)
      : 0;
  const stockLimitUsage = Math.min(
    results.stockScenario.deductibleThisYear / results.stockAGILimit,
    1,
  );

  const savingsLabel =
    results.comparison.stockAdvantage >= 0
      ? "You save"
      : "Stock costs more";

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-green-400 mb-4">
            Charitable Giving
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Appreciated Stock Donation Calculator
          </h1>
          <p className="text-lg text-neutral-400">
            Maximize your charitable impact while minimizing taxes on
            appreciated stock.
          </p>
          <p className="mt-3 text-sm text-neutral-500">
            Educational estimates only &mdash; not tax advice.
          </p>
        </div>
      </section>

      <section className="px-4 pb-12">
        <div className="mx-auto max-w-5xl space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-6">Stock &amp; Donation</h2>
              <div className="space-y-6">
                <SliderInput
                  label="Current Market Value"
                  value={inputs.stock.stockValue}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      stock: {
                        ...prev.stock,
                        stockValue: value,
                      },
                      donation: {
                        ...prev.donation,
                        donationAmount: Math.min(prev.donation.donationAmount, value),
                      },
                    }))
                  }
                  min={100}
                  max={1_000_000}
                  step={100}
                  format="currency"
                />
                <SliderInput
                  label="Cost Basis"
                  value={inputs.stock.costBasis}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      stock: { ...prev.stock, costBasis: value },
                    }))
                  }
                  min={0}
                  max={1_000_000}
                  step={100}
                  format="currency"
                />
                <SliderInput
                  label="Holding Period (months)"
                  value={inputs.stock.holdingPeriod}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      stock: { ...prev.stock, holdingPeriod: value },
                    }))
                  }
                  min={0}
                  max={360}
                  step={1}
                  format="number"
                />
                <SliderInput
                  label="Amount to Donate"
                  value={inputs.donation.donationAmount}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      donation: { ...prev.donation, donationAmount: value },
                    }))
                  }
                  min={100}
                  max={donationMax}
                  step={100}
                  format="currency"
                />
                <div>
                  <p className="text-sm font-medium text-neutral-300 mb-2">
                    Donation Recipient
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {DONATION_TYPE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            donation: { ...prev.donation, donationType: option.value },
                          }))
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 ${
                          inputs.donation.donationType === option.value
                            ? "border-green-500 bg-green-500/10 text-green-300"
                            : "border-neutral-800 bg-neutral-950/60 text-neutral-300"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-neutral-500">
                    Public charities and DAFs qualify for the 30% AGI limit.
                    Private foundations are capped at 20%.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-6">Tax Profile</h2>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    Filing Status
                  </label>
                  <select
                    className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
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
                  >
                    {FILING_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <SliderInput
                  label="Adjusted Gross Income"
                  value={inputs.tax.adjustedGrossIncome}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      tax: { ...prev.tax, adjustedGrossIncome: value },
                    }))
                  }
                  min={0}
                  max={5_000_000}
                  step={10_000}
                  format="currency"
                />
                <SliderInput
                  label="Marginal Federal Rate"
                  value={inputs.tax.marginalTaxRate}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      tax: { ...prev.tax, marginalTaxRate: value },
                    }))
                  }
                  min={10}
                  max={37}
                  step={1}
                  format="percent"
                />
                <div>
                  <label className="text-sm font-medium text-neutral-300">
                    State
                  </label>
                  <select
                    className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
                    value={inputs.tax.stateCode}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        tax: { ...prev.tax, stateCode: event.target.value },
                      }))
                    }
                  >
                    {STATE_OPTIONS.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-neutral-500">
                    We use a simplified capital gains rate of{" "}
                    {formatPercent(stateRate, 1)} for this state.
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">Itemize deductions</p>
                      <p className="text-sm text-neutral-400">
                        Required to claim the charitable deduction.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setInputs((prev) => ({
                          ...prev,
                          tax: {
                            ...prev.tax,
                            itemizesDeductions: !prev.tax.itemizesDeductions,
                          },
                        }))
                      }
                      className={`h-10 w-20 rounded-full border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 ${
                        inputs.tax.itemizesDeductions
                          ? "border-green-500 bg-green-500/20"
                          : "border-neutral-700 bg-neutral-900"
                      }`}
                    >
                      <span
                        className={`block h-8 w-8 rounded-full bg-white transition-transform ${
                          inputs.tax.itemizesDeductions
                            ? "translate-x-10"
                            : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-6">The Big Comparison</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5">
                <p className="text-sm text-neutral-400">Sell &amp; Donate Cash</p>
                <p className="text-3xl font-semibold mt-2">
                  {formatCurrency(results.cashScenario.netCostOfDonation, 0)}
                </p>
                <p className="text-sm text-neutral-500 mt-1">Net cost to you</p>
                <div className="mt-4 text-sm text-neutral-400 space-y-1">
                  <p>
                    Capital gains tax: {formatCurrency(
                      results.cashScenario.totalCapGainsTax,
                      0,
                    )}
                  </p>
                  <p>
                    Charity receives: {formatCurrency(
                      results.cashScenario.amountAvailableToDonate,
                      0,
                    )}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border border-green-500/40 bg-green-500/10 p-5">
                <p className="text-sm text-green-200">Donate Stock Directly</p>
                <p className="text-3xl font-semibold mt-2 text-green-200">
                  {formatCurrency(results.stockScenario.netCostOfDonation, 0)}
                </p>
                <p className="text-sm text-green-200/70 mt-1">Net cost to you</p>
                <div className="mt-4 text-sm text-green-100/70 space-y-1">
                  <p>
                    Tax avoided: {formatCurrency(results.stockScenario.taxAvoided, 0)}
                  </p>
                  <p>
                    Charity receives: {formatCurrency(
                      results.stockScenario.stockValue,
                      0,
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 rounded-2xl bg-neutral-950/60 p-5 text-center">
              <p className="text-sm uppercase tracking-wide text-neutral-400">
                {savingsLabel}
              </p>
              <p className="mt-2 text-3xl font-semibold text-green-400">
                {formatCurrency(Math.abs(results.comparison.stockAdvantage), 0)}
              </p>
              <p className="mt-1 text-sm text-neutral-400">
                {formatPercent(results.comparison.percentageSavings / 100, 1)} savings vs.
                selling first
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-6">Detailed Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-neutral-400">
                    <th className="pb-3"> </th>
                    <th className="pb-3">Sell &amp; Donate Cash</th>
                    <th className="pb-3">Donate Stock</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-200">
                  {[
                    {
                      label: "Starting value",
                      cash: formatCurrency(results.cashScenario.stockSaleProceeds, 0),
                      stock: formatCurrency(results.stockScenario.stockValue, 0),
                    },
                    {
                      label: "Capital gains tax",
                      cash: `-${formatCurrency(results.cashScenario.totalCapGainsTax, 0)}`,
                      stock: formatCurrency(0, 0),
                    },
                    {
                      label: "Amount to charity",
                      cash: formatCurrency(results.cashScenario.amountAvailableToDonate, 0),
                      stock: formatCurrency(results.stockScenario.stockValue, 0),
                    },
                    {
                      label: "Tax deduction",
                      cash: formatCurrency(results.cashScenario.charitableDeduction, 0),
                      stock: formatCurrency(results.stockScenario.charitableDeduction, 0),
                    },
                    {
                      label: "Tax savings",
                      cash: formatCurrency(results.cashScenario.taxSavingsFromDeduction, 0),
                      stock: formatCurrency(results.stockScenario.taxSavingsFromDeduction, 0),
                    },
                    {
                      label: "Net cost to you",
                      cash: formatCurrency(results.cashScenario.netCostOfDonation, 0),
                      stock: formatCurrency(results.stockScenario.netCostOfDonation, 0),
                      highlight: true,
                    },
                  ].map((row) => (
                    <tr key={row.label} className="border-t border-neutral-800">
                      <td className="py-3 font-medium text-neutral-300">
                        {row.label}
                      </td>
                      <td className={`py-3 ${row.highlight ? "font-semibold" : ""}`}>
                        {row.cash}
                      </td>
                      <td
                        className={`py-3 ${
                          row.highlight ? "font-semibold text-green-300" : ""
                        }`}
                      >
                        {row.stock}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-4">Where the Money Goes</h2>
              <div className="space-y-4 text-sm text-neutral-300">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <p className="font-semibold text-neutral-200">Sell &amp; Donate Cash</p>
                  <p className="mt-2">
                    Stock &rarr; IRS (capital gains tax) &rarr; Charity
                  </p>
                  <p className="mt-1 text-neutral-500">
                    Taxes reduce the amount that reaches the charity.
                  </p>
                </div>
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4">
                  <p className="font-semibold text-green-200">Donate Stock Directly</p>
                  <p className="mt-2 text-green-100/80">
                    Stock &rarr; Charity (full market value)
                  </p>
                  <p className="mt-1 text-green-100/60">
                    No capital gains tax and a larger deduction.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-4">Charity Impact</h2>
              <div className="space-y-4">
                <div className="rounded-xl bg-neutral-950/60 p-4">
                  <p className="text-sm text-neutral-400">With cash, charity receives</p>
                  <p className="text-2xl font-semibold">
                    {formatCurrency(results.cashScenario.amountAvailableToDonate, 0)}
                  </p>
                </div>
                <div className="rounded-xl bg-green-500/10 p-4">
                  <p className="text-sm text-green-200">With stock, charity receives</p>
                  <p className="text-2xl font-semibold text-green-200">
                    {formatCurrency(results.stockScenario.stockValue, 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-green-500/30 bg-neutral-950/60 p-4">
                  <p className="text-sm text-neutral-400">Additional impact</p>
                  <p className="text-2xl font-semibold text-green-300">
                    {formatCurrency(results.comparison.additionalCharitableImpact, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold mb-6">AGI Limits Tracker</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
                  <span>Cash donation limit (60% of AGI)</span>
                  <span>
                    {formatCurrency(results.cashScenario.charitableDeduction, 0)} of{" "}
                    {formatCurrency(results.cashAGILimit, 0)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-neutral-800">
                  <div
                    className="h-3 rounded-full bg-neutral-200 transition-all"
                    style={{ width: `${cashLimitUsage * 100}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm text-neutral-400 mb-2">
                  <span>Stock donation limit ({results.stockScenario.agiLimitPercent}% of AGI)</span>
                  <span>
                    {formatCurrency(results.stockScenario.deductibleThisYear, 0)} of{" "}
                    {formatCurrency(results.stockAGILimit, 0)}
                  </span>
                </div>
                <div className="h-3 rounded-full bg-neutral-800">
                  <div
                    className="h-3 rounded-full bg-green-500 transition-all"
                    style={{ width: `${stockLimitUsage * 100}%` }}
                  />
                </div>
                {results.stockScenario.carryForward > 0 && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Carryforward: {formatCurrency(results.stockScenario.carryForward, 0)}
                    (up to 5 years).
                  </p>
                )}
              </div>
            </div>
            <p className="mt-4 text-xs text-neutral-500">
              Limits based on IRS rules for appreciated property: {formatPercent(
                AGI_LIMITS.property_public_charity,
                0,
              )} for public charities/DAFs and {formatPercent(
                AGI_LIMITS.property_private_foundation,
                0,
              )} for private foundations.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold mb-6">Steps to Donate Stock</h2>
              <div className="space-y-4">
                {results.steps.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-sm font-semibold text-green-300">
                        {step.step}
                      </span>
                      <div>
                        <p className="font-semibold text-neutral-200">{step.title}</p>
                        <p className="text-sm text-neutral-400 mt-1">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl bg-neutral-900 p-6">
                <h2 className="text-xl font-semibold mb-4">Replenish Strategy</h2>
                <p className="text-sm text-neutral-400">
                  After donating, you can buy the same stock back immediately. The IRS
                  wash sale rule does not apply to donations, so you effectively reset
                  your cost basis higher while maintaining your investment position.
                </p>
                <div className="mt-4 rounded-xl bg-neutral-950/60 p-4 text-sm text-neutral-300">
                  New cost basis estimate: {formatCurrency(inputs.donation.donationAmount, 0)}
                </div>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6">
                <h2 className="text-lg font-semibold mb-3">Warnings &amp; Recommendations</h2>
                {results.warnings.length === 0 && results.recommendations.length === 0 ? (
                  <p className="text-sm text-neutral-400">
                    Your inputs look good. Stock donations appear advantageous.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {results.warnings.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-amber-400">
                          Warnings
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-neutral-300">
                          {results.warnings.map((warning) => (
                            <li key={warning}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {results.recommendations.length > 0 && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-green-300">
                          Recommendations
                        </p>
                        <ul className="mt-2 space-y-2 text-sm text-neutral-300">
                          {results.recommendations.map((recommendation) => (
                            <li key={recommendation}>• {recommendation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-6">
          <details className="rounded-2xl bg-neutral-900/70 p-6">
            <summary className="text-lg font-semibold cursor-pointer">
              How we calculate this
            </summary>
            <div className="mt-4 text-sm text-neutral-400 space-y-4">
              <p>
                We estimate long-term capital gains taxes using IRS brackets and a
                simplified state capital gains rate. Net cost equals the donated value
                minus taxes avoided and the tax savings from the charitable deduction.
              </p>
              <p>
                Appreciated stock held longer than 12 months qualifies for a fair market
                value deduction, capped at {formatPercent(AGI_LIMITS.property_public_charity, 0)}
                of AGI ({formatPercent(AGI_LIMITS.property_private_foundation, 0)} for
                private foundations). Cash deductions are capped at {formatPercent(AGI_LIMITS.cash_public_charity, 0)}
                of AGI. Excess deductions can be carried forward for up to five years.
              </p>
              <p>
                2026 rules may introduce an AGI floor and reduce the value of deductions
                for top earners. Consider consulting a tax professional for personalized
                guidance.
              </p>
            </div>
          </details>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-sm text-neutral-400">
            <p>
              Holding period status: {results.isLongTermHolding ? "Long-term (12+ months)" : "Short-term"}. FMV deduction eligibility: {results.qualifiesForFMVDeduction ? "Yes" : "No"}.
            </p>
            <p className="mt-2">
              Your estimated total capital gains tax on a sale would be {formatCurrency(results.cashScenario.totalCapGainsTax, 0)}.
            </p>
            <p className="mt-2">
              Federal + state marginal deduction rate used: {formatPercent((inputs.tax.marginalTaxRate / 100) + stateRate, 1)}.
            </p>
            <p className="mt-2">
              Additional charitable impact: {formatCurrency(results.comparison.additionalCharitableImpact, 0)} for this donation.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
