"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/obbb-tax-optimizer/calculations";
import {
  FILING_STATUS_OPTIONS,
  MARGINAL_RATE_OPTIONS,
  NEW_SALT_CAP,
  OLD_SALT_CAP,
  OVERTIME_DEDUCTION_MAX,
  SALT_PHASEOUT_START,
  SENIOR_DEDUCTION_AMOUNT,
  SENIOR_DEDUCTION_PHASEOUT_RANGE,
  SENIOR_DEDUCTION_PHASEOUT_START,
  CAR_LOAN_DEDUCTION_MAX,
  CAR_LOAN_PHASEOUT_RANGE,
  CAR_LOAN_PHASEOUT_START,
  TIMELINE_YEARS,
  TIPS_DEDUCTION_MAX,
  TIPS_PHASEOUT_START,
  STANDARD_DEDUCTION_2025,
  OVERTIME_PHASEOUT_START,
  OVERTIME_PHASEOUT_RANGE,
} from "@/lib/calculators/obbb-tax-optimizer/constants";
import type {
  BreakdownItem,
  CalculatorInputs,
  FilingStatus,
} from "@/lib/calculators/obbb-tax-optimizer/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  filingStatus: "single",
  age: 40,
  spouseAge: 40,
  modifiedAGI: 75000,
  annualTips: 0,
  annualOvertime: 0,
  carLoanInterest: 0,
  saltPaid: 10000,
  otherItemized: 0,
  marginalRate: 0.22,
};

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => calculate(inputs), [inputs]);

  const breakdownItems: BreakdownItem[] = [
    {
      label: "Senior deduction",
      value: results.seniorDeduction.amount,
    },
    {
      label: "Tip income deduction",
      value: results.tipsDeduction.amount,
    },
    {
      label: "Overtime deduction",
      value: results.overtimeDeduction.amount,
    },
    {
      label: "Car loan interest",
      value: results.carLoanDeduction.amount,
    },
    {
      label: "SALT cap boost",
      value:
        results.standardVsItemized.recommendation === "Itemize"
          ? results.saltBenefit.additionalDeduction
          : 0,
    },
  ];

  const actionItems = [
    results.seniorDeduction.eligible
      ? "Gather proof of age for the senior deduction (driver’s license or SSA records)."
      : null,
    inputs.annualTips > 0
      ? "Track cash and card tips weekly so your totals align with employer statements."
      : null,
    inputs.annualOvertime > 0
      ? "Save pay stubs that separate regular vs overtime premiums."
      : null,
    inputs.carLoanInterest > 0
      ? "Keep car loan interest statements or lender summaries."
      : null,
    inputs.saltPaid > 0
      ? "Store property tax bills and state/local tax payments to support SALT itemizing."
      : null,
    results.standardVsItemized.recommendation === "Itemize"
      ? "Itemizing looks better this year—capture receipts for other deductions."
      : "Standard deduction wins—focus on above-the-line deductions and records.",
    "All OBBB deductions expire after 2028, so plan for potential sunset." ,
  ].filter(Boolean) as string[];

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 mb-4">
            Temporary 2025-2028 Deductions
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            OBBB Tax Optimizer
          </h1>
          <p className="text-lg text-neutral-400">
            Estimate how much the One Big Beautiful Bill Act could lower your tax bill
            with new deductions for seniors, tips, overtime, car loans, and SALT.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Your information
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
                  className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {FILING_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <SliderInput
                label="Your age"
                value={inputs.age}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, age: value }))
                }
                min={18}
                max={100}
                step={1}
                format="number"
              />
              {inputs.filingStatus === "married" && (
                <SliderInput
                  label="Spouse age"
                  value={inputs.spouseAge ?? 40}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, spouseAge: value }))
                  }
                  min={18}
                  max={100}
                  step={1}
                  format="number"
                />
              )}
              <SliderInput
                label="Modified AGI (MAGI)"
                value={inputs.modifiedAGI}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, modifiedAGI: value }))
                }
                min={0}
                max={700000}
                step={1000}
                format="currency"
                description="Used to calculate phase-outs for senior, tips, overtime, car loan, and SALT deductions."
              />
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Work-related deductions
            </h2>
            <div className="space-y-6">
              <SliderInput
                label="Annual tips received"
                value={inputs.annualTips}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, annualTips: value }))
                }
                min={0}
                max={100000}
                step={500}
                format="currency"
                description={`Deduct up to ${formatCurrency(TIPS_DEDUCTION_MAX, 0)} in qualified tips. Phase-out starts at ${formatCurrency(TIPS_PHASEOUT_START[inputs.filingStatus], 0)} MAGI.`}
              />
              <SliderInput
                label="Annual overtime pay"
                value={inputs.annualOvertime}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, annualOvertime: value }))
                }
                min={0}
                max={100000}
                step={500}
                format="currency"
                description={`Max deduction ${formatCurrency(
                  OVERTIME_DEDUCTION_MAX[inputs.filingStatus],
                  0
                )} before phase-out at ${formatCurrency(
                  OVERTIME_PHASEOUT_START[inputs.filingStatus],
                  0
                )}.`}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Vehicle & SALT deductions
            </h2>
            <div className="space-y-6">
              <SliderInput
                label="Car loan interest paid"
                value={inputs.carLoanInterest}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, carLoanInterest: value }))
                }
                min={0}
                max={15000}
                step={100}
                format="currency"
                description={`Deduct up to ${formatCurrency(
                  CAR_LOAN_DEDUCTION_MAX,
                  0
                )} (phase-out starts at ${formatCurrency(
                  CAR_LOAN_PHASEOUT_START[inputs.filingStatus],
                  0
                )}).`}
              />
              <SliderInput
                label="State & local taxes paid"
                value={inputs.saltPaid}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, saltPaid: value }))
                }
                min={0}
                max={100000}
                step={500}
                format="currency"
                description={`Old cap ${formatCurrency(OLD_SALT_CAP, 0)} → new cap ${formatCurrency(NEW_SALT_CAP, 0)}. Cap phases down for MAGI above ${formatCurrency(SALT_PHASEOUT_START, 0)}.`}
              />
              <SliderInput
                label="Other itemized deductions"
                value={inputs.otherItemized}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, otherItemized: value }))
                }
                min={0}
                max={50000}
                step={500}
                format="currency"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Tax bracket
            </h2>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">
                Marginal tax bracket
              </label>
              <select
                value={inputs.marginalRate}
                onChange={(event) =>
                  setInputs((prev) => ({
                    ...prev,
                    marginalRate: Number(event.target.value),
                  }))
                }
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {MARGINAL_RATE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-2">
                Use your highest federal bracket to estimate tax savings from deductions.
              </p>
            </div>
          </div>

          <ResultCard
            title="Your total tax savings"
            primaryValue={formatCurrency(results.totalTaxSavings)}
            primaryLabel="Estimated federal tax reduction"
            items={breakdownItems.map((item) => ({
              label: item.label,
              value: formatCurrency(item.value),
            }))}
            variant="emerald"
          />

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Standard vs itemized
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                {results.standardVsItemized.recommendation}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">Standard deduction</p>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.standardVsItemized.standardDeduction)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <p className="text-sm text-neutral-400">
                  Itemized (with new SALT cap)
                </p>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.standardVsItemized.itemizedWithNewSALT)}
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-400">
              The new SALT cap only increases tax savings if itemized deductions exceed
              the standard deduction for your filing status ({formatCurrency(
                STANDARD_DEDUCTION_2025[inputs.filingStatus]
              )}).
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Deduction breakdown
            </h2>
            <div className="grid gap-4">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-400">Senior deduction</p>
                  <span className="text-xs text-emerald-300">
                    {formatCurrency(SENIOR_DEDUCTION_AMOUNT, 0)} per senior
                  </span>
                </div>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.seniorDeduction.amount)}
                </p>
                {results.seniorDeduction.phaseOutApplied ? (
                  <p className="text-xs text-neutral-500 mt-2">
                    Phase-out applied: {formatCurrency(
                      results.seniorDeduction.phaseOutApplied
                    )} (starts at {formatCurrency(
                      SENIOR_DEDUCTION_PHASEOUT_START[inputs.filingStatus]
                    )}, range {formatCurrency(
                      SENIOR_DEDUCTION_PHASEOUT_RANGE
                    )}).
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-2">
                    Eligibility begins at age 65 for each spouse.
                  </p>
                )}
                <p className="text-sm text-emerald-300 mt-3">
                  Tax savings: {formatCurrency(results.seniorDeduction.taxSavings)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-400">Tip income deduction</p>
                  <span className="text-xs text-emerald-300">
                    Up to {formatCurrency(TIPS_DEDUCTION_MAX, 0)}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.tipsDeduction.amount)}
                </p>
                {results.tipsDeduction.phaseOutApplied ? (
                  <p className="text-xs text-neutral-500 mt-2">
                    Phase-out applied: {formatCurrency(
                      results.tipsDeduction.phaseOutApplied
                    )} (starts at {formatCurrency(
                      TIPS_PHASEOUT_START[inputs.filingStatus]
                    )}).
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-2">
                    Eligible for workers in occupations that customarily receive tips.
                  </p>
                )}
                <p className="text-sm text-emerald-300 mt-3">
                  Tax savings: {formatCurrency(results.tipsDeduction.taxSavings)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-400">Overtime deduction</p>
                  <span className="text-xs text-emerald-300">
                    Max {formatCurrency(OVERTIME_DEDUCTION_MAX[inputs.filingStatus], 0)}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.overtimeDeduction.amount)}
                </p>
                {results.overtimeDeduction.phaseOutApplied ? (
                  <p className="text-xs text-neutral-500 mt-2">
                    Phase-out applied: {formatCurrency(
                      results.overtimeDeduction.phaseOutApplied
                    )} (starts at {formatCurrency(
                      OVERTIME_PHASEOUT_START[inputs.filingStatus]
                    )}, range {formatCurrency(OVERTIME_PHASEOUT_RANGE)}).
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-2">
                    Based on overtime premium pay above your regular rate.
                  </p>
                )}
                <p className="text-sm text-emerald-300 mt-3">
                  Tax savings: {formatCurrency(results.overtimeDeduction.taxSavings)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-400">Car loan interest</p>
                  <span className="text-xs text-emerald-300">
                    Up to {formatCurrency(CAR_LOAN_DEDUCTION_MAX, 0)}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.carLoanDeduction.amount)}
                </p>
                {results.carLoanDeduction.phaseOutApplied ? (
                  <p className="text-xs text-neutral-500 mt-2">
                    Phase-out applied: {formatCurrency(
                      results.carLoanDeduction.phaseOutApplied
                    )} (starts at {formatCurrency(
                      CAR_LOAN_PHASEOUT_START[inputs.filingStatus]
                    )}, range {formatCurrency(CAR_LOAN_PHASEOUT_RANGE)}).
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-2">
                    Applies to interest on personal vehicle loans (not leases).
                  </p>
                )}
                <p className="text-sm text-emerald-300 mt-3">
                  Tax savings: {formatCurrency(results.carLoanDeduction.taxSavings)}
                </p>
              </div>

              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-400">SALT cap increase</p>
                  <span className="text-xs text-emerald-300">
                    {formatCurrency(OLD_SALT_CAP, 0)} → {formatCurrency(
                      NEW_SALT_CAP,
                      0
                    )}
                  </span>
                </div>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.saltBenefit.additionalDeduction)}
                </p>
                {inputs.modifiedAGI > SALT_PHASEOUT_START ? (
                  <p className="text-xs text-neutral-500 mt-2">
                    Income phase-out applied. Your effective SALT cap is{" "}
                    {formatCurrency(results.saltBenefit.newCap)} (cap reduces for
                    MAGI above {formatCurrency(SALT_PHASEOUT_START)}).
                  </p>
                ) : results.standardVsItemized.recommendation === "Itemize" ? (
                  <p className="text-xs text-neutral-500 mt-2">
                    Additional deduction from higher SALT cap: {formatCurrency(
                      results.saltBenefit.additionalDeduction
                    )}.
                  </p>
                ) : (
                  <p className="text-xs text-neutral-500 mt-2">
                    SALT benefit only applies if you itemize deductions.
                  </p>
                )}
                <p className="text-sm text-emerald-300 mt-3">
                  Tax savings: {formatCurrency(
                    results.standardVsItemized.recommendation === "Itemize"
                      ? results.saltBenefit.taxSavings
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-6">
              Action items
            </h2>
            <ul className="space-y-3 text-sm text-neutral-300">
              {actionItems.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              2025-2028 timeline
            </h2>
            <p className="text-sm text-neutral-400 mb-6">
              These deductions are temporary and scheduled to expire after 2028.
            </p>
            <div className="grid gap-3 sm:grid-cols-4">
              {TIMELINE_YEARS.map((year) => (
                <div
                  key={year}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center"
                >
                  <p className="text-lg font-semibold text-emerald-200">{year}</p>
                  <p className="text-xs text-emerald-300">Available</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <p className="text-xs text-neutral-400">
                SALT cap rises to {formatCurrency(NEW_SALT_CAP, 0)} for 2025-2028,
                then begins a 1% annual increase through 2029 before reverting to
                {formatCurrency(OLD_SALT_CAP, 0)} permanently.
              </p>
            </div>
          </div>

          <details className="rounded-2xl bg-neutral-900/50 p-6">
            <summary className="text-lg font-semibold text-white cursor-pointer">
              How we calculate this
            </summary>
            <div className="mt-4 text-neutral-400 space-y-3 text-sm">
              <p>
                We apply each OBBB deduction to your inputs and reduce them for income
                phase-outs. Seniors receive {formatCurrency(
                  SENIOR_DEDUCTION_AMOUNT,
                  0
                )} per person age 65+ until your MAGI exceeds the phase-out start for your
                filing status.
              </p>
              <p>
                Tip, overtime, and car loan deductions are capped at their maximums and
                reduced to zero across each phase-out range. The SALT benefit only counts
                when itemized deductions exceed the standard deduction for your filing
                status.
              </p>
              <p>
                Tax savings are estimated using your marginal tax bracket of
                {formatPercent(inputs.marginalRate, 0)}. Actual taxes may differ based on
                credits, state taxes, and other factors.
              </p>
            </div>
          </details>

          <div className="text-center text-xs text-neutral-500">
            This calculator is for education only and assumes 2025-2028 rules from the
            One Big Beautiful Bill Act.
          </div>
        </div>
      </section>
    </div>
  );
}
