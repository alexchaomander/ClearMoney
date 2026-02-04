"use client";

import { useCallback, useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection, VerdictCard } from "@/components/shared/AppShell";
import { formatCurrency, formatPercent, formatNumber } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/home-affordability/calculations";
import {
  CREDIT_SCORE_OPTIONS,
  DOWN_PAYMENT_OPTIONS,
  RISK_TOLERANCE_OPTIONS,
  STATE_OPTIONS,
} from "@/lib/calculators/home-affordability/constants";
import type { CalculatorInputs } from "@/lib/calculators/home-affordability/types";
import { cn } from "@/lib/utils";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { MemoryBadge } from "@/components/tools/MemoryBadge";

const DEFAULT_INPUTS: CalculatorInputs = {
  annualIncome: 100000,
  monthlyDebt: 500,
  downPaymentSaved: 50000,
  targetDownPaymentPercent: 20,
  creditScore: "good",
  state: "default",
  currentRent: 2000,
  mortgageRate: 6,
  propertyTaxRate: 1.2,
  hoa: 0,
  riskTolerance: "moderate",
};

const selectStyles =
  "mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 text-sm text-white focus:border-teal-400 focus:outline-none";

const normalizeNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const extractObject = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

export function Calculator() {
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    annualIncome: "annual_income",
    monthlyDebt: [
      "debt_profile",
      (value: unknown) => {
        const profile = extractObject(value);
        return normalizeNumber(profile?.total_minimum_payment) ?? null;
      },
    ],
    downPaymentSaved: [
      "portfolio_summary",
      (value: unknown) => {
        const summary = extractObject(value);
        return normalizeNumber(summary?.total_cash_value) ?? null;
      },
    ],
    currentRent: "monthly_rent",
    mortgageRate: ["mortgage_rate", (v: unknown) => Number(v) * 100],
    riskTolerance: "risk_tolerance",
    state: "state",
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const handleLoadData = useCallback(() => applyMemoryDefaults(setInputs), [applyMemoryDefaults]);

  const results = useMemo(() => calculate(inputs), [inputs]);


  const dtiTone =
    results.dtiAnalysis.status === "comfortable"
      ? "positive"
      : results.dtiAnalysis.status === "stretching"
        ? "neutral"
        : "negative";

  const dtiLabel =
    results.dtiAnalysis.status === "comfortable"
      ? "Comfortable"
      : results.dtiAnalysis.status === "stretching"
        ? "Stretching"
        : "Risky";

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-teal-300 mb-3">
            Home Affordability Reality Check
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            What You Can Actually Afford (Not Just What You Can Get Approved For)
          </h1>
          <p className="text-lg text-neutral-400">
            Honest math using the 28/36 rule, true monthly housing costs, and the
            hidden expenses lenders skip.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl space-y-8">
          <LoadMyDataBanner
            isLoaded={memoryLoaded}
            hasData={memoryHasDefaults}
            isApplied={preFilledFields.size > 0}
            onApply={handleLoadData}
          />
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Income & Debt
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Annual Gross Income"
                  value={inputs.annualIncome}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, annualIncome: value }))
                  }
                  min={20000}
                  max={500000}
                  step={5000}
                  format="currency"
                  description="Income before taxes and deductions."
                />
                {preFilledFields.has("annualIncome") && (
                  <div className="-mt-4 mb-2 ml-1">
                    <MemoryBadge field="annualIncome" preFilledFields={preFilledFields} />
                  </div>
                )}
                <SliderInput
                  label="Monthly Debt Payments"
                  value={inputs.monthlyDebt}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, monthlyDebt: value }))
                  }
                  min={0}
                  max={10000}
                  step={50}
                  format="currency"
                  description="Credit cards, car loans, student loans, etc."
                />
                <div>
                  <label className="text-sm font-semibold text-white">
                    Risk Tolerance
                  </label>
                  <p className="text-xs text-neutral-400 mt-1">
                    How strict should we be with the 28/36 rule?
                  </p>
                  <select
                    className={selectStyles}
                    value={inputs.riskTolerance}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        riskTolerance: event.target
                          .value as CalculatorInputs["riskTolerance"],
                      }))
                    }
                  >
                    {RISK_TOLERANCE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} — {option.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Down Payment & Credit
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Down Payment Saved"
                  value={inputs.downPaymentSaved}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, downPaymentSaved: value }))
                  }
                  min={0}
                  max={500000}
                  step={5000}
                  format="currency"
                  description="Cash you have available for the down payment."
                />
                <div>
                  <label className="text-sm font-semibold text-white">
                    Target Down Payment %
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {DOWN_PAYMENT_OPTIONS.map((percent) => (
                      <button
                        key={percent}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            targetDownPaymentPercent: percent,
                          }))
                        }
                        className={cn(
                          "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                          inputs.targetDownPaymentPercent === percent
                            ? "border-teal-300 bg-teal-500/20 text-teal-100"
                            : "border-neutral-700 text-neutral-300 hover:border-teal-400/60"
                        )}
                      >
                        {percent}% down
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-white">
                    Credit Score Range
                  </label>
                  <select
                    className={selectStyles}
                    value={inputs.creditScore}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        creditScore: event.target
                          .value as CalculatorInputs["creditScore"],
                      }))
                    }
                  >
                    {CREDIT_SCORE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                {inputs.targetDownPaymentPercent <= 5 && (
                  <div className="rounded-xl border border-teal-500/40 bg-teal-500/10 px-4 py-3 text-sm text-teal-100">
                    You may qualify for first-time buyer programs with 3-5% down,
                    but expect PMI and stricter underwriting.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Market Details
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Current Monthly Rent"
                  value={inputs.currentRent}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, currentRent: value }))
                  }
                  min={0}
                  max={10000}
                  step={100}
                  format="currency"
                  description="Used for rent vs buy comparison."
                />
                {preFilledFields.has("currentRent") && (
                  <div className="-mt-4 mb-2 ml-1">
                    <MemoryBadge field="currentRent" preFilledFields={preFilledFields} />
                  </div>
                )}
                <SliderInput
                  label="Mortgage Rate"
                  value={inputs.mortgageRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, mortgageRate: value }))
                  }
                  min={3}
                  max={10}
                  step={0.125}
                  format="percent"
                  description="Estimated 30-year fixed rate."
                />
                {preFilledFields.has("mortgageRate") && (
                  <div className="-mt-4 mb-2 ml-1">
                    <MemoryBadge field="mortgageRate" preFilledFields={preFilledFields} />
                  </div>
                )}
                <SliderInput
                  label="Property Tax Rate"
                  value={inputs.propertyTaxRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, propertyTaxRate: value }))
                  }
                  min={0}
                  max={3}
                  step={0.1}
                  format="percent"
                  description="Typical US range: 0.5%-2.5%."
                />
                <SliderInput
                  label="HOA (if applicable)"
                  value={inputs.hoa}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, hoa: value }))
                  }
                  min={0}
                  max={1000}
                  step={25}
                  format="currency"
                  description="Monthly HOA dues or condo fees."
                />
                <div>
                  <label className="text-sm font-semibold text-white">
                    State / Location
                  </label>
                  <select
                    className={selectStyles}
                    value={inputs.state}
                    onChange={(event) =>
                      setInputs((prev) => ({ ...prev, state: event.target.value }))
                    }
                  >
                    {STATE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {results.warnings.length > 0 && (
            <div className="space-y-3">
              {results.warnings.map((warning) => (
                <div
                  key={warning}
                  className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                >
                  {warning}
                </div>
              ))}
            </div>
          )}

          <ResultCard
            title="Your Comfortable Home Price"
            primaryValue={formatCurrency(results.comfortableAmount, 0)}
            primaryLabel="Based on your income, debt, and target down payment"
          items={[
              {
                label: "Stretch price (still risky)",
                value: formatCurrency(results.stretchAmount, 0),
              },
              {
                label: "Max lender approval (do not target)",
                value: formatCurrency(results.maxApprovalAmount, 0),
              },
            ]}
            variant="emerald"
          />

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">
              True Monthly Cost (PITI + Everything Else)
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Principal", value: results.monthlyBreakdown.principal },
                { label: "Interest", value: results.monthlyBreakdown.interest },
                { label: "Property Tax", value: results.monthlyBreakdown.propertyTax },
                { label: "Home Insurance", value: results.monthlyBreakdown.homeInsurance },
                { label: "PMI", value: results.monthlyBreakdown.pmi },
                { label: "HOA", value: results.monthlyBreakdown.hoa },
                { label: "Maintenance", value: results.monthlyBreakdown.maintenance },
                { label: "Utilities", value: results.monthlyBreakdown.utilities },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-400">{item.label}</span>
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-400">Total monthly cost</span>
                <span className="text-lg font-bold text-teal-200">
                  {formatCurrency(results.monthlyBreakdown.totalMonthly)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">DTI Reality Check</h2>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  dtiTone === "positive"
                    ? "bg-emerald-500/20 text-emerald-300"
                    : dtiTone === "neutral"
                      ? "bg-amber-500/20 text-amber-300"
                      : "bg-rose-500/20 text-rose-300"
                )}
              >
                {dtiLabel}
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-neutral-400 mb-2">
                  <span>Front-end DTI (housing)</span>
                  <span>
                    {formatPercent(results.dtiAnalysis.frontEndDTI, 1)} / Max {" "}
                    {formatPercent(results.dtiAnalysis.maxFrontEnd, 0)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-800">
                  <div
                    className="h-2 rounded-full bg-teal-400"
                    style={{
                      width: `${Math.min(results.dtiAnalysis.frontEndDTI / results.dtiAnalysis.maxFrontEnd, 1) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm text-neutral-400 mb-2">
                  <span>Back-end DTI (total debt)</span>
                  <span>
                    {formatPercent(results.dtiAnalysis.backEndDTI, 1)} / Max {" "}
                    {formatPercent(results.dtiAnalysis.maxBackEnd, 0)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-neutral-800">
                  <div
                    className="h-2 rounded-full bg-teal-400"
                    style={{
                      width: `${Math.min(results.dtiAnalysis.backEndDTI / results.dtiAnalysis.maxBackEnd, 1) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <VerdictCard
            verdict={`${formatCurrency(results.monthlyBreakdown.totalMonthly)} / month`}
            description={`True monthly ownership cost vs ${formatCurrency(inputs.currentRent)} rent.`}
            type={dtiTone}
          />

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">Down Payment Scenarios</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  With {inputs.targetDownPaymentPercent}% down
                </p>
                <p className="text-lg font-semibold text-white mt-2">
                  {formatCurrency(results.downPaymentAnalysis.atTargetPercent.homePrice, 0)}
                </p>
                <p className="text-sm text-neutral-400 mt-2">
                  PMI: {formatCurrency(results.downPaymentAnalysis.atTargetPercent.pmi)} / month
                </p>
                <p className="text-sm text-neutral-400">
                  Total cost: {formatCurrency(results.downPaymentAnalysis.atTargetPercent.totalCost)} / month
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-xs uppercase tracking-wide text-neutral-500">
                  With 20% down (no PMI)
                </p>
                <p className="text-lg font-semibold text-white mt-2">
                  {formatCurrency(results.downPaymentAnalysis.at20Percent.homePrice, 0)}
                </p>
                <p className="text-sm text-neutral-400 mt-2">
                  PMI: {formatCurrency(results.downPaymentAnalysis.at20Percent.pmi)} / month
                </p>
                <p className="text-sm text-neutral-400">
                  Total cost: {formatCurrency(results.downPaymentAnalysis.at20Percent.totalCost)} / month
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-400">
              To avoid PMI entirely, you need roughly {formatCurrency(results.downPaymentAnalysis.pmiBreakeven, 0)} as
              the home price with your current savings.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-white">Rent vs Buy (5-Year View)</h2>
            <div className="overflow-hidden rounded-xl border border-neutral-800">
              <table className="w-full text-sm">
                <thead className="bg-neutral-950/70 text-neutral-400">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Metric</th>
                    <th className="px-4 py-3 text-right font-semibold">Buying</th>
                    <th className="px-4 py-3 text-right font-semibold">Renting</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  <tr>
                    <td className="px-4 py-3 text-neutral-400">Monthly cost</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.rentVsBuy.monthlyOwnership)}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.rentVsBuy.monthlyRent)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-neutral-400">5-year outlay</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.rentVsBuy.fiveYearComparison.buyingCost, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.rentVsBuy.fiveYearComparison.rentingCost, 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-neutral-400">Estimated equity</td>
                    <td className="px-4 py-3 text-right text-white">
                      {formatCurrency(results.rentVsBuy.fiveYearComparison.equity, 0)}
                    </td>
                    <td className="px-4 py-3 text-right text-white">$0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-neutral-400">
              Break-even: about {formatNumber(results.rentVsBuy.breakEvenYears)} years before buying beats renting.
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white">Hidden Upfront Costs</h2>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li className="flex items-center justify-between">
                <span>Closing costs</span>
                <span className="text-white">{formatCurrency(results.hiddenCosts.closingCosts, 0)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Move-in & setup</span>
                <span className="text-white">{formatCurrency(results.hiddenCosts.moveInCosts, 0)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span>First-year maintenance reserve</span>
                <span className="text-white">
                  {formatCurrency(results.hiddenCosts.firstYearMaintenance, 0)}
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span>3-month emergency fund</span>
                <span className="text-white">{formatCurrency(results.hiddenCosts.emergencyFund, 0)}</span>
              </li>
            </ul>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-neutral-400">Total upfront cash needed</span>
              <span className="text-lg font-bold text-teal-200">
                {formatCurrency(results.hiddenCosts.totalUpfront, 0)}
              </span>
            </div>
          </div>

          {results.recommendations.length > 0 && (
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h2 className="text-xl font-semibold text-white">Recommendations</h2>
              <ul className="space-y-3 text-sm text-neutral-400">
                {results.recommendations.map((recommendation) => (
                  <li key={recommendation} className="flex gap-2">
                    <span className="text-teal-300">•</span>
                    <span>{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <MethodologySection>
            <p>
              We apply the 28/36 debt-to-income rule to estimate a sustainable housing payment. That payment is then
              converted into a home price using your mortgage rate and down payment.
            </p>
            <p>
              Monthly costs include principal, interest, property taxes, insurance, HOA dues, maintenance (1% of home
              value annually), and higher utility costs. PMI is added when you put less than 20% down.
            </p>
            <p>
              Rent vs buy compares total cash outlay over five years with rent rising 3% annually and home values
              appreciating at 3% annually. Equity assumes ~5% of the loan balance is paid down in five years.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
