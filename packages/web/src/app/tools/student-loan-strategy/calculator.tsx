"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCurrency,
  formatNumber,
} from "@/lib/shared/formatters";
import { mergeDeep } from "@/lib/shared/merge";
import { calculate } from "@/lib/calculators/student-loan-strategy/calculations";
import {
  FILING_STATUS_OPTIONS,
  KEY_DEADLINES,
  LOAN_TYPE_OPTIONS,
  REFERENCE_YEAR,
  STANDARD_PLAN,
  STATE_OPTIONS,
} from "@/lib/calculators/student-loan-strategy/constants";
import type { CalculatorInputs } from "@/lib/calculators/student-loan-strategy/types";
import { useToolPreset } from "@/lib/strata/presets";

const DEFAULT_INPUTS: CalculatorInputs = {
  loanBalance: 50000,
  interestRate: 6.5,
  loanType: "direct",
  annualIncome: 60000,
  incomeGrowthRate: 3,
  filingStatus: "single",
  familySize: 1,
  state: "CA",
  yearsInRepayment: 0,
  pslfEligible: false,
  pslfPaymentsMade: 0,
  hasParentPlus: false,
};

const normalizeNumber = (value: unknown): number | null => {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const extractDebtProfile = (value: unknown): Record<string, unknown> | null => {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }
  return null;
};

const extractDebtType = (
  profile: Record<string, unknown> | null,
  type: string
): Record<string, unknown> | null => {
  if (!profile) return null;
  const byType = profile.by_type;
  if (typeof byType !== "object" || byType === null) return null;
  const entry = (byType as Record<string, unknown>)[type];
  if (typeof entry !== "object" || entry === null) return null;
  return entry as Record<string, unknown>;
};

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("student-loan-strategy");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    loanBalance: [
      "debt_profile",
      (value: unknown) => {
        const profile = extractDebtProfile(value);
        const studentLoan = extractDebtType(profile, "student_loan");
        return (
          normalizeNumber(studentLoan?.balance) ??
          normalizeNumber(profile?.total_balance) ??
          null
        );
      },
    ],
    interestRate: [
      "debt_profile",
      (value: unknown) => {
        const profile = extractDebtProfile(value);
        const studentLoan = extractDebtType(profile, "student_loan");
        return (
          normalizeNumber(studentLoan?.interest_rate) ??
          normalizeNumber(profile?.weighted_interest_rate) ??
          null
        );
      },
    ],
    annualIncome: "annual_income",
    incomeGrowthRate: "income_growth_rate",
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
        return STATE_OPTIONS.some((option) => option.value === state)
          ? state
          : null;
      },
    ],
    familySize: [
      "num_dependents",
      (value: unknown) => {
        const dependents = normalizeNumber(value);
        if (dependents == null) return null;
        return Math.max(1, Math.round(dependents) + 1);
      },
    ],
  });

  const [inputs, setInputs] = useState<CalculatorInputs>(() =>
    mergeDeep(DEFAULT_INPUTS, preset ?? undefined)
  );
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setInputs),
    [applyMemoryDefaults]
  );

  useEffect(() => {
    if (!preset) return;
    setInputs((prev) => mergeDeep(prev, preset));
  }, [preset]);
  const results = useMemo(() => calculate(inputs), [inputs]);

  const planEntries = Object.entries(results.plans);
  const bestPlan = results.recommendation.bestPlan;

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
            2026 Loan Strategy Update
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Student Loan Strategy Planner
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Compare IDR plans, forgiveness timelines, and tax impacts as SAVE
            sunsets and RAP launches.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-6">
            <LoadMyDataBanner
              isLoaded={memoryLoaded}
              hasData={memoryHasDefaults}
              isApplied={preFilledFields.size > 0}
              onApply={handleLoadData}
            />
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Loan Details</h2>
              <p className="mt-1 text-sm text-neutral-400">
                Update your current loan profile to see plan-specific payment
                projections.
              </p>

              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Total Federal Loan Balance"
                  value={inputs.loanBalance}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, loanBalance: value }))
                  }
                  min={0}
                  max={500000}
                  step={1000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("loanBalance")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Weighted Average Interest Rate"
                  value={inputs.interestRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, interestRate: value }))
                  }
                  min={0}
                  max={12}
                  step={0.1}
                  format="percent"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("interestRate")}
                      label="Memory"
                    />
                  }
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-300">
                    Loan Type
                  </label>
                  <select
                    value={inputs.loanType}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        loanType: event.target
                          .value as CalculatorInputs["loanType"],
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
                  >
                    {LOAN_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <SliderInput
                  label="Years in Repayment Already"
                  value={inputs.yearsInRepayment}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      yearsInRepayment: value,
                    }))
                  }
                  min={0}
                  max={25}
                  step={1}
                  format="number"
                />
                <label className="flex items-center gap-3 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={inputs.hasParentPlus}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        hasParentPlus: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-blue-500"
                  />
                  I have Parent PLUS loans in my portfolio
                </label>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                Income & Household
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                IDR plans use discretionary income. IBR/PAYE use 150% of poverty line,
                ICR uses 100%, and RAP uses AGI-based sliding scale.
              </p>

              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Annual Gross Income"
                  value={inputs.annualIncome}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, annualIncome: value }))
                  }
                  min={0}
                  max={500000}
                  step={1000}
                  format="currency"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("annualIncome")}
                      label="Memory"
                    />
                  }
                />
                <SliderInput
                  label="Expected Income Growth"
                  value={inputs.incomeGrowthRate}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      incomeGrowthRate: value,
                    }))
                  }
                  min={0}
                  max={10}
                  step={0.5}
                  format="percent"
                  rightSlot={
                    <MemoryBadge
                      isActive={preFilledFields.has("incomeGrowthRate")}
                      label="Memory"
                    />
                  }
                />
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-300">
                    Filing Status
                  </label>
                  <select
                    value={inputs.filingStatus}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        filingStatus: event.target
                          .value as CalculatorInputs["filingStatus"],
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300">
                      Family Size
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={inputs.familySize}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          familySize: Number(event.target.value),
                        }))
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
                    />
                    <div className="mt-2">
                      <MemoryBadge
                        isActive={preFilledFields.has("familySize")}
                        label="Memory"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300">
                      State of Residence
                    </label>
                    <select
                      value={inputs.state}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          state: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
                    >
                      {STATE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2">
                      <MemoryBadge
                        isActive={preFilledFields.has("state")}
                        label="Memory"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                PSLF & Employment
              </h2>
              <p className="mt-1 text-sm text-neutral-400">
                PSLF requires 120 qualifying payments with eligible public
                service employers.
              </p>

              <div className="mt-6 space-y-4">
                <label className="flex items-center gap-3 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={inputs.pslfEligible}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        pslfEligible: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-800 text-blue-500"
                  />
                  I work for a PSLF-eligible employer
                </label>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-300">
                    Qualifying PSLF Payments Made
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={inputs.pslfPaymentsMade}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        pslfPaymentsMade: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full space-y-6 lg:max-w-sm">
            <ResultCard
              title="Best Strategy"
              primaryValue={bestPlan}
              primaryLabel={results.recommendation.reasoning}
              items={[
                {
                  label: "Total projected cost",
                  value: formatCurrency(
                    Math.min(
                      ...planEntries
                        .filter(([, plan]) => plan.available)
                        .map(([, plan]) => plan.netCost)
                    )
                  ),
                },
                {
                  label: "Forgiveness tax exposure",
                  value: formatCurrency(
                    Math.max(
                      ...planEntries.map(([, plan]) => plan.taxOnForgiveness)
                    )
                  ),
                },
                {
                  label: "Debt timeline",
                  value: `${Math.max(
                    ...planEntries.map(([, plan]) =>
                      plan.forgivenessYear
                        ? plan.forgivenessYear - REFERENCE_YEAR
                        : 0
                    )
                  )} yrs max`,
                },
              ]}
              variant="blue"
            />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white">Key Deadlines</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-300">
                {KEY_DEADLINES.map((deadline) => (
                  <li key={deadline.date} className="flex gap-3">
                    <span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-200">
                      {deadline.date}
                    </span>
                    <span>{deadline.action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {results.pslfAnalysis && (
              <div className="rounded-2xl bg-neutral-900 p-6">
                <h3 className="text-lg font-semibold text-white">
                  PSLF Snapshot
                </h3>
                <div className="mt-4 space-y-2 text-sm text-neutral-300">
                  <p>
                    Payments remaining: {results.pslfAnalysis.paymentsRemaining}
                  </p>
                  <p>
                    Estimated forgiveness: {formatCurrency(
                      results.pslfAnalysis.estimatedForgivenessAmount
                    )}
                  </p>
                  <p className="text-emerald-300">
                    PSLF forgiveness remains tax-free.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Plan Comparison
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Payment calculations vary by plan: IBR/PAYE use 150% poverty line,
                  ICR uses 100%, RAP uses AGI sliding scale (1-10%).
                </p>
              </div>
              <div className="text-sm text-neutral-400">
                {formatNumber(inputs.loanBalance)} balance · {inputs.interestRate}%
                rate
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-neutral-300">
                <thead className="text-xs uppercase tracking-wider text-neutral-500">
                  <tr>
                    <th className="pb-3">Plan</th>
                    <th className="pb-3">Year 1 Payment</th>
                    <th className="pb-3">Final Payment</th>
                    <th className="pb-3">Total Paid</th>
                    <th className="pb-3">Forgiveness</th>
                    <th className="pb-3">Tax Bomb</th>
                    <th className="pb-3">Net Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {planEntries.map(([key, plan]) => (
                    <tr key={key} className={!plan.available ? "opacity-50" : ""}>
                      <td className="py-3">
                        <div className="font-semibold text-white">
                          {plan.name}
                        </div>
                        {!plan.available && (
                          <div className="text-xs text-amber-300">Not open</div>
                        )}
                        {plan.availableUntil && (
                          <div className="text-xs text-neutral-500">
                            Closes {plan.availableUntil}
                          </div>
                        )}
                        {plan.availableFrom && (
                          <div className="text-xs text-neutral-500">
                            Starts {plan.availableFrom}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        {formatCurrency(plan.monthlyPaymentYear1)}
                      </td>
                      <td className="py-3">
                        {formatCurrency(plan.monthlyPaymentFinal)}
                      </td>
                      <td className="py-3">
                        {formatCurrency(plan.totalPaid)}
                      </td>
                      <td className="py-3">
                        {plan.forgivenessAmount > 0
                          ? `${formatCurrency(plan.forgivenessAmount)}${
                              plan.forgivenessYear
                                ? ` (${plan.forgivenessYear})`
                                : ""
                            }`
                          : "-"}
                      </td>
                      <td className="py-3">
                        {plan.taxOnForgiveness > 0
                          ? formatCurrency(plan.taxOnForgiveness)
                          : "-"}
                      </td>
                      <td className="py-3 font-semibold text-white">
                        {formatCurrency(plan.netCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">
              Forgiveness & Tax Bomb Outlook
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Forgiveness after 2026 is treated as taxable income (PSLF remains
              tax-free). Use this view to plan for a tax reserve.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {planEntries.map(([key, plan]) => (
                <div
                  key={key}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4"
                >
                  <div className="text-sm font-semibold text-white">
                    {plan.name}
                  </div>
                  <div className="mt-2 text-xs text-neutral-400">
                    Forgiveness: {formatCurrency(plan.forgivenessAmount)}
                  </div>
                  <div className="text-xs text-neutral-400">
                    Tax impact: {formatCurrency(plan.taxOnForgiveness)}
                  </div>
                  <div className="mt-2 text-xs text-neutral-500">
                    Net cost: {formatCurrency(plan.netCost)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">
              Timeline at a Glance
            </h2>
            <p className="mt-1 text-sm text-neutral-400">
              Longer timelines can lower payments but increase total interest and
              tax exposure.
            </p>

            <div className="mt-6 space-y-4">
              {planEntries.map(([key, plan]) => {
                const years = plan.forgivenessYear
                  ? plan.forgivenessYear - REFERENCE_YEAR
                  : STANDARD_PLAN.termYears - inputs.yearsInRepayment;
                const barWidth = Math.min(100, Math.max(10, years * 4));
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-neutral-300">
                      <span>{plan.name}</span>
                      <span>{years > 0 ? `${years} yrs` : "0 yrs"}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-neutral-800">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <details className="rounded-2xl bg-neutral-900/50 p-6">
            <summary className="cursor-pointer text-lg font-semibold text-white">
              How we calculate this
            </summary>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>
                <strong>Discretionary income</strong> varies by plan:
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>IBR and PAYE: AGI minus 150% of federal poverty guideline</li>
                <li>ICR: AGI minus 100% of federal poverty guideline</li>
                <li>SAVE (closed): AGI minus 225% of federal poverty guideline</li>
                <li>RAP: Uses AGI directly with a 1-10% sliding scale based on income bracket, plus $50 deduction per dependent (minimum $10/month payment)</li>
              </ul>
              <p>
                <strong>Payment percentages:</strong>
              </p>
              <ul className="ml-4 list-disc space-y-1">
                <li>IBR: 15% (pre-2014 borrowers) or 10% (post-2014 borrowers)</li>
                <li>PAYE: 10% of discretionary income</li>
                <li>ICR: 20% of discretionary income or 12-year fixed adjusted</li>
                <li>RAP: 1-10% of AGI based on income bracket</li>
              </ul>
              <p>
                We project income growth annually, apply plan-specific payment
                percentages, and simulate month-by-month balances to estimate
                total paid, interest, and remaining forgiveness.
              </p>
              <p>
                Forgiveness after 2026 is treated as taxable income. We estimate
                a combined federal + state rate based on your income band and
                state.
              </p>
              <p>
                PSLF results assume you continue qualifying payments and stay in
                eligible employment. Payments made during SAVE forbearance do
                not count.
              </p>
              <p className="text-neutral-500">
                This planner provides directional guidance only. Confirm final
                eligibility and plan rules with Federal Student Aid.
              </p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
