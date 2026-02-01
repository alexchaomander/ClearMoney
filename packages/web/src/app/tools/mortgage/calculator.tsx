"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell, MethodologySection, SliderInput } from "@/components/shared";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/mortgage/calculations";
import type { CalculatorInputs } from "@/lib/calculators/mortgage/types";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  homePrice: 400000,
  downPaymentPercent: 20,
  loanTermYears: 30,
  interestRate: 6.5,
  propertyTaxRate: 1.2,
  homeInsurance: 1800,
  pmiRate: 0.5,
};

const LOAN_TERM_OPTIONS = [15, 30] as const;

export function Calculator() {
  const { defaults: memoryDefaults, preFilledFields, isLoaded: memoryLoaded } = useMemoryPreFill<CalculatorInputs>({
    homePrice: "home_value",
    interestRate: ["mortgage_rate", (v: unknown) => Number(v) * 100],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  useEffect(() => {
    if (memoryLoaded) {
      setInputs(prev => ({ ...prev, ...memoryDefaults }));
    }
  }, [memoryLoaded]); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => calculate(inputs), [inputs]);

  // Pick a few amortization highlights: year 1, year 5, year 10, midpoint, final
  const amortizationHighlights = useMemo(() => {
    const a = results.amortization;
    if (a.length === 0) return [];

    const picks = new Set([1, 5, 10, Math.ceil(inputs.loanTermYears / 2), inputs.loanTermYears]);
    return a.filter(row => picks.has(row.year));
  }, [results.amortization, inputs.loanTermYears]);

  const piRatio =
    results.monthlyPayment.total > 0
      ? (results.monthlyPayment.principal + results.monthlyPayment.interest) /
        results.monthlyPayment.total
      : 0;

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300 mb-3">
            Mortgage Calculator
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            See Your Real Monthly Mortgage Payment
          </h1>
          <p className="text-lg text-neutral-400">
            Principal, interest, taxes, insurance, and PMI -- all in one honest breakdown.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* ── Inputs Card ── */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
            {/* Home & Loan */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Home & Loan
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Home Price"
                  value={inputs.homePrice}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, homePrice: value }))
                  }
                  min={50000}
                  max={2000000}
                  step={5000}
                  format="currency"
                  description="Purchase price of the home."
                />
                {preFilledFields.has("homePrice") && (
                  <div className="-mt-4 mb-2 ml-1">
                    <MemoryBadge field="homePrice" preFilledFields={preFilledFields} />
                  </div>
                )}
                <SliderInput
                  label="Down Payment"
                  value={inputs.downPaymentPercent}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, downPaymentPercent: value }))
                  }
                  min={0}
                  max={50}
                  step={1}
                  format="percent"
                  description={`${formatCurrency(inputs.homePrice * (inputs.downPaymentPercent / 100), 0)} down`}
                />
                {inputs.downPaymentPercent < 20 && (
                  <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                    Down payment below 20% -- PMI will be added to your monthly payment.
                  </div>
                )}

                <div>
                  <label className="text-sm font-semibold text-white">
                    Loan Term
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {LOAN_TERM_OPTIONS.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            loanTermYears: term,
                          }))
                        }
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                          inputs.loanTermYears === term
                            ? "border-teal-300 bg-teal-500/20 text-teal-100"
                            : "border-neutral-700 text-neutral-300 hover:border-teal-400/60"
                        )}
                      >
                        {term} years
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rate & Costs */}
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Rate & Costs
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Interest Rate"
                  value={inputs.interestRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, interestRate: value }))
                  }
                  min={2}
                  max={12}
                  step={0.125}
                  format="percent"
                  description="Annual mortgage interest rate."
                />
                {preFilledFields.has("interestRate") && (
                  <div className="-mt-4 mb-2 ml-1">
                    <MemoryBadge field="interestRate" preFilledFields={preFilledFields} />
                  </div>
                )}
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
                  description="Annual property tax as % of home value. US average ~1.1%."
                />
                <SliderInput
                  label="Annual Home Insurance"
                  value={inputs.homeInsurance}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, homeInsurance: value }))
                  }
                  min={0}
                  max={10000}
                  step={100}
                  format="currency"
                  description="Annual homeowner's insurance premium."
                />
                {inputs.downPaymentPercent < 20 && (
                  <SliderInput
                    label="PMI Rate"
                    value={inputs.pmiRate}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, pmiRate: value }))
                    }
                    min={0.1}
                    max={2}
                    step={0.05}
                    format="percent"
                    description="Private mortgage insurance rate (annual % of loan)."
                  />
                )}
              </div>
            </div>
          </div>

          {/* ── Monthly Payment Breakdown ── */}
          <div className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-800">
              <h3 className="text-lg font-semibold text-white">
                Monthly Payment Breakdown
              </h3>
            </div>
            <div className="px-6 py-8 text-center">
              <p className="text-4xl sm:text-5xl font-bold tracking-tight text-teal-400">
                {formatCurrency(results.monthlyPayment.total)}
              </p>
              <p className="text-sm text-neutral-400 mt-2">
                Total monthly payment (PITI{results.monthlyPayment.pmi > 0 ? " + PMI" : ""})
              </p>
            </div>
            <div className="px-6 pb-6">
              <div className="bg-neutral-800/50 rounded-xl p-4 space-y-3">
                {[
                  { label: "Principal", value: results.monthlyPayment.principal },
                  { label: "Interest", value: results.monthlyPayment.interest },
                  { label: "Property Tax", value: results.monthlyPayment.propertyTax },
                  { label: "Home Insurance", value: results.monthlyPayment.insurance },
                  ...(results.monthlyPayment.pmi > 0
                    ? [{ label: "PMI", value: results.monthlyPayment.pmi }]
                    : []),
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-neutral-400">{item.label}</span>
                    <span className="font-medium text-white">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Loan Summary ── */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">Loan Summary</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Loan Amount
                </p>
                <p className="text-lg font-semibold text-white mt-2">
                  {formatCurrency(results.loanAmount, 0)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Down Payment
                </p>
                <p className="text-lg font-semibold text-white mt-2">
                  {formatCurrency(results.downPayment, 0)}
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  {formatPercent(inputs.downPaymentPercent / 100, 0)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Total Interest
                </p>
                <p className="text-lg font-semibold text-white mt-2">
                  {formatCurrency(results.totalInterest, 0)}
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  Over {inputs.loanTermYears} years
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  Total Cost
                </p>
                <p className="text-lg font-semibold text-white mt-2">
                  {formatCurrency(results.totalCost, 0)}
                </p>
                <p className="text-sm text-neutral-400 mt-1">
                  P&I + taxes + insurance + PMI
                </p>
              </div>
            </div>
          </div>

          {/* ── P&I vs Extras visual bar ── */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Payment Composition</h2>
            <div className="h-4 rounded-full bg-neutral-800 overflow-hidden flex">
              <div
                className="h-full bg-teal-500"
                style={{ width: `${piRatio * 100}%` }}
                title="Principal & Interest"
              />
              <div
                className="h-full bg-amber-500"
                style={{ width: `${(1 - piRatio) * 100}%` }}
                title="Tax, Insurance & PMI"
              />
            </div>
            <div className="flex gap-6 text-sm text-neutral-400">
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-teal-500" />
                P&I ({formatPercent(piRatio, 0)})
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
                Tax / Insurance / PMI ({formatPercent(1 - piRatio, 0)})
              </span>
            </div>
          </div>

          {/* ── Amortization Highlights ── */}
          {amortizationHighlights.length > 0 && (
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">
                Amortization Highlights
              </h2>
              <div className="overflow-hidden rounded-xl border border-neutral-800">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-950/70 text-neutral-400">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Year</th>
                      <th className="px-4 py-3 text-right font-semibold">Principal Paid</th>
                      <th className="px-4 py-3 text-right font-semibold">Interest Paid</th>
                      <th className="px-4 py-3 text-right font-semibold">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {amortizationHighlights.map((row) => (
                      <tr key={row.year}>
                        <td className="px-4 py-3 text-neutral-400">{row.year}</td>
                        <td className="px-4 py-3 text-right text-white">
                          {formatCurrency(row.principalPaid, 0)}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          {formatCurrency(row.interestPaid, 0)}
                        </td>
                        <td className="px-4 py-3 text-right text-white">
                          {formatCurrency(row.remainingBalance, 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Recommendation ── */}
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Recommendation</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              {results.recommendation}
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <MethodologySection>
            <p>
              Monthly principal and interest are calculated with the standard
              amortization formula: M = P [r(1+r)^n] / [(1+r)^n - 1], where P is
              the loan amount, r is the monthly rate, and n is the total number of
              payments.
            </p>
            <p>
              Property tax is the annual rate applied to the home price, divided by
              12. Home insurance is your annual premium divided by 12. PMI is only
              included when the down payment is below 20% and uses the annual PMI
              rate applied to the outstanding loan balance.
            </p>
            <p>
              The amortization schedule tracks how each year's payments split
              between principal and interest, showing the remaining balance at each
              milestone. Total cost includes all PITI components (and PMI when
              applicable) over the full loan term.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
