"use client";

import { useMemo, useState } from "react";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { SliderInput } from "@/components/shared/SliderInput";
import { formatCurrency } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/founder-coverage-planner/calculations";
import type {
  CalculatorInputs,
  EntityType,
  FundingPlan,
  OwnerRole,
} from "@/lib/calculators/founder-coverage-planner/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  annualNetIncome: 180000,
  ownersCount: 1,
  employeesCount: 0,
  entityType: "llc",
  fundingPlan: "bootstrapped",
  ownerRole: "operator",
  marketSalary: 120000,
  plannedSalary: 90000,
  payrollAdminCosts: 2500,
  statePayrollTaxRate: 2.5,
  ssWageBase: 170000,
  filingStatus: "single",
  priorYearTax: 35000,
  projectedCurrentTax: 42000,
  federalWithholding: 6000,
  estimatedPayments: 9000,
  currentQuarter: 3,
  entityStartDate: "2025-01-01",
  taxYearStartDate: "2026-01-01",
  usesSorpElection: true,
  payrollCadence: "biweekly",
  businessAccounts: 1,
  personalAccounts: 2,
  mixedTransactionsPerMonth: 2,
  reimbursementPolicy: "accountable",
  hasEquityGrants: true,
  daysSinceGrant: 18,
  vestingYears: 4,
  cliffMonths: 12,
  strikePrice: 1.25,
  fairMarketValue: 5,
  sharesGranted: 100000,
  exerciseWindowMonths: 90,
  isQualifiedBusiness: true,
  assetsAtIssuance: 12000000,
  expectedHoldingYears: 5,
};

const ENTITY_LABELS: Record<EntityType, string> = {
  sole_prop: "Sole Proprietor",
  llc: "LLC",
  s_corp: "S-Corp",
  c_corp: "C-Corp",
};

const FUNDING_LABELS: Record<FundingPlan, string> = {
  bootstrapped: "Bootstrapped",
  vc: "VC-Backed",
  undecided: "Undecided",
};

const ROLE_LABELS: Record<OwnerRole, string> = {
  operator: "Operator",
  investor: "Investor",
};

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-400 mb-3">
              Founder Coverage
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Founder Coverage Planner
            </h1>
            <p className="text-lg text-neutral-400">
              Evaluate entity choice, S-Corp savings, payroll planning, and compliance
              checkpoints with a single founder workflow.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-4xl space-y-10">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Founder snapshot</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">Current entity</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.entityType}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        entityType: event.target.value as EntityType,
                      }))
                    }
                  >
                    {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">Funding plan</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.fundingPlan}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        fundingPlan: event.target.value as FundingPlan,
                      }))
                    }
                  >
                    {Object.entries(FUNDING_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">Owner role</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.ownerRole}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        ownerRole: event.target.value as OwnerRole,
                      }))
                    }
                  >
                    {Object.entries(ROLE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">Filing status</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.filingStatus}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        filingStatus: event.target.value as "single" | "married",
                      }))
                    }
                  >
                    <option value="single">Single</option>
                    <option value="married">Married Filing Jointly</option>
                  </select>
                </div>

                <SliderInput
                  label="Annual net business income"
                  value={inputs.annualNetIncome}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, annualNetIncome: value }))
                  }
                  min={20000}
                  max={500000}
                  step={5000}
                  format="currency"
                />

                <SliderInput
                  label="Owner market salary (benchmark)"
                  value={inputs.marketSalary}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, marketSalary: value }))
                  }
                  min={40000}
                  max={300000}
                  step={5000}
                  format="currency"
                />

                <SliderInput
                  label="Planned W-2 salary"
                  value={inputs.plannedSalary}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, plannedSalary: value }))
                  }
                  min={0}
                  max={300000}
                  step={5000}
                  format="currency"
                />

                <SliderInput
                  label="Payroll admin costs (annual)"
                  value={inputs.payrollAdminCosts}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, payrollAdminCosts: value }))
                  }
                  min={0}
                  max={10000}
                  step={250}
                  format="currency"
                />

                <SliderInput
                  label="State payroll tax rate"
                  value={inputs.statePayrollTaxRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, statePayrollTaxRate: value }))
                  }
                  min={0}
                  max={10}
                  step={0.25}
                  format="percent"
                />

                <SliderInput
                  label="Social Security wage base"
                  value={inputs.ssWageBase}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, ssWageBase: value }))
                  }
                  min={100000}
                  max={250000}
                  step={1000}
                  format="currency"
                  description="Update annually based on SSA wage-base limits."
                />

                <SliderInput
                  label="Owners"
                  value={inputs.ownersCount}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, ownersCount: value }))
                  }
                  min={1}
                  max={5}
                  step={1}
                  format="number"
                />

                <SliderInput
                  label="Employees (excluding owners)"
                  value={inputs.employeesCount}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, employeesCount: value }))
                  }
                  min={0}
                  max={200}
                  step={1}
                  format="number"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Entity + election</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">
                    Entity start date
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.entityStartDate}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        entityStartDate: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">
                    Tax year start
                  </label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.taxYearStartDate}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        taxYearStartDate: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">
                    Filing S-Corp election?
                  </label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.usesSorpElection ? "yes" : "no"}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        usesSorpElection: event.target.value === "yes",
                      }))
                    }
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Tax planning</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <SliderInput
                  label="Prior year total tax"
                  value={inputs.priorYearTax}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, priorYearTax: value }))
                  }
                  min={0}
                  max={200000}
                  step={1000}
                  format="currency"
                />
                <SliderInput
                  label="Projected current-year tax"
                  value={inputs.projectedCurrentTax}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, projectedCurrentTax: value }))
                  }
                  min={0}
                  max={250000}
                  step={1000}
                  format="currency"
                />
                <SliderInput
                  label="Federal withholding to date"
                  value={inputs.federalWithholding}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, federalWithholding: value }))
                  }
                  min={0}
                  max={150000}
                  step={500}
                  format="currency"
                />
                <SliderInput
                  label="Estimated payments to date"
                  value={inputs.estimatedPayments}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, estimatedPayments: value }))
                  }
                  min={0}
                  max={150000}
                  step={500}
                  format="currency"
                />
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">Current quarter</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.currentQuarter}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        currentQuarter: Number(event.target.value) as 1 | 2 | 3 | 4,
                      }))
                    }
                  >
                    <option value={1}>Q1</option>
                    <option value={2}>Q2</option>
                    <option value={3}>Q3</option>
                    <option value={4}>Q4</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Cashflow hygiene</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <SliderInput
                  label="Business accounts"
                  value={inputs.businessAccounts}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, businessAccounts: value }))
                  }
                  min={0}
                  max={5}
                  step={1}
                  format="number"
                />
                <SliderInput
                  label="Personal accounts"
                  value={inputs.personalAccounts}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, personalAccounts: value }))
                  }
                  min={0}
                  max={5}
                  step={1}
                  format="number"
                />
                <SliderInput
                  label="Mixed transactions per month"
                  value={inputs.mixedTransactionsPerMonth}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, mixedTransactionsPerMonth: value }))
                  }
                  min={0}
                  max={30}
                  step={1}
                  format="number"
                />
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">
                    Reimbursement policy
                  </label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.reimbursementPolicy}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        reimbursementPolicy: event.target.value as
                          | "none"
                          | "manual"
                          | "accountable",
                      }))
                    }
                  >
                    <option value="none">None</option>
                    <option value="manual">Manual reimbursements</option>
                    <option value="accountable">Accountable plan</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">
                    Payroll cadence
                  </label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.payrollCadence}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        payrollCadence: event.target.value as
                          | "monthly"
                          | "biweekly"
                          | "weekly",
                      }))
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Equity signals</h2>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">Equity grants issued?</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.hasEquityGrants ? "yes" : "no"}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        hasEquityGrants: event.target.value === "yes",
                      }))
                    }
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <SliderInput
                  label="Days since grant (for 83(b))"
                  value={inputs.daysSinceGrant}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, daysSinceGrant: value }))
                  }
                  min={0}
                  max={60}
                  step={1}
                  format="number"
                />
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-200">Qualified business?</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.isQualifiedBusiness ? "yes" : "no"}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        isQualifiedBusiness: event.target.value === "yes",
                      }))
                    }
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <SliderInput
                  label="Assets at issuance"
                  value={inputs.assetsAtIssuance}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, assetsAtIssuance: value }))
                  }
                  min={100000}
                  max={60000000}
                  step={500000}
                  format="currency"
                />
                <SliderInput
                  label="Expected holding years"
                  value={inputs.expectedHoldingYears}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, expectedHoldingYears: value }))
                  }
                  min={1}
                  max={10}
                  step={1}
                  format="number"
                />
                <SliderInput
                  label="Vesting years"
                  value={inputs.vestingYears}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, vestingYears: value }))
                  }
                  min={1}
                  max={6}
                  step={1}
                  format="number"
                />
                <SliderInput
                  label="Cliff months"
                  value={inputs.cliffMonths}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, cliffMonths: value }))
                  }
                  min={0}
                  max={24}
                  step={1}
                  format="number"
                />
                <SliderInput
                  label="Strike price"
                  value={inputs.strikePrice}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, strikePrice: value }))
                  }
                  min={0.01}
                  max={50}
                  step={0.25}
                  format="currency"
                />
                <SliderInput
                  label="Fair market value (409A)"
                  value={inputs.fairMarketValue}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, fairMarketValue: value }))
                  }
                  min={0.01}
                  max={100}
                  step={0.25}
                  format="currency"
                />
                <SliderInput
                  label="Shares granted"
                  value={inputs.sharesGranted}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, sharesGranted: value }))
                  }
                  min={1000}
                  max={1000000}
                  step={1000}
                  format="number"
                />
                <SliderInput
                  label="Exercise window (months)"
                  value={inputs.exerciseWindowMonths}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, exerciseWindowMonths: value }))
                  }
                  min={1}
                  max={120}
                  step={1}
                  format="number"
                />
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Entity recommendation</h2>
              <p className="text-sm text-neutral-400 mb-4">{results.entity.summary}</p>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <p className="text-xs text-neutral-400">Recommended entity</p>
                  <p className="text-lg text-white font-semibold">
                    {ENTITY_LABELS[results.entity.recommendedEntity]}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 flex-1">
                  <p className="text-xs text-neutral-400 mb-2">Why</p>
                  <ul className="text-sm text-neutral-200 space-y-1">
                    {results.entity.reasons.map((reason) => (
                      <li key={reason}>• {reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">S-Corp savings</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Recommended salary"
                  value={formatCurrency(results.sCorp.recommendedSalary, 0)}
                  helper={`Range ${formatCurrency(results.sCorp.salaryRange.min, 0)} - ${formatCurrency(results.sCorp.salaryRange.max, 0)}`}
                />
                <StatCard
                  label="Payroll tax estimate"
                  value={formatCurrency(results.sCorp.payrollTax, 0)}
                  helper="Includes employee + employer FICA + state payroll"
                />
                <StatCard
                  label="Estimated net savings"
                  value={formatCurrency(results.sCorp.estimatedSavings, 0)}
                  helper="After payroll admin costs"
                />
              </div>
              {results.sCorp.warnings.length > 0 && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
                  <p className="font-semibold mb-2">Watchouts</p>
                  <ul className="space-y-1">
                    {results.sCorp.warnings.map((warning) => (
                      <li key={warning}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">S-Corp election checklist</h2>
              {results.electionChecklist.status === "not-applicable" ? (
                <p className="text-sm text-neutral-400">
                  {results.electionChecklist.items[0]}
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <StatCard
                      label="Election deadline"
                      value={results.electionChecklist.deadlineDate}
                    />
                    <StatCard
                      label="Days remaining"
                      value={`${results.electionChecklist.daysRemaining} days`}
                    />
                    <StatCard
                      label="Status"
                      value={results.electionChecklist.status.replace("-", " ")}
                    />
                  </div>
                  <ul className="text-sm text-neutral-300 space-y-1">
                    {results.electionChecklist.items.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Payroll + distributions</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Distribution estimate"
                  value={formatCurrency(results.payrollPlan.distributionEstimate, 0)}
                  helper="Net income minus W-2 salary"
                />
                <StatCard
                  label="Payroll tax"
                  value={formatCurrency(results.payrollPlan.payrollTax, 0)}
                  helper="Based on wage base + state payroll"
                />
                <StatCard
                  label="Recommended salary"
                  value={formatCurrency(results.payrollPlan.recommendedSalary, 0)}
                />
              </div>
              <ul className="mt-4 text-sm text-neutral-300 space-y-1">
                {results.payrollPlan.guidance.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Quarterly tax plan</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Safe-harbor target"
                  value={formatCurrency(results.quarterlyTaxes.safeHarborTarget, 0)}
                  helper={`Based on ${results.quarterlyTaxes.safeHarborType.replace("-", " ")}`}
                />
                <StatCard
                  label="Remaining due"
                  value={formatCurrency(results.quarterlyTaxes.remainingNeeded, 0)}
                  helper={`${results.quarterlyTaxes.quartersRemaining} quarters left`}
                />
                <StatCard
                  label="Per-quarter payment"
                  value={formatCurrency(results.quarterlyTaxes.perQuarterAmount, 0)}
                />
              </div>
              <ul className="mt-4 text-sm text-neutral-300 space-y-1">
                {results.quarterlyTaxes.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Retirement plan fit</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Recommended plan"
                  value={results.retirement.recommendedPlan.replace("_", " ").toUpperCase()}
                  helper="2026 IRS limits"
                />
                <StatCard
                  label="Employee deferral"
                  value={formatCurrency(results.retirement.employeeDeferralLimit, 0)}
                />
                <StatCard
                  label="Total limit"
                  value={formatCurrency(results.retirement.totalLimit, 0)}
                />
              </div>
              <ul className="mt-4 text-sm text-neutral-300 space-y-1">
                {results.retirement.notes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Compliance checklist</h2>
              <ul className="text-sm text-neutral-300 space-y-1">
                {results.complianceChecklist.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              <div className="mt-4 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
                  Document vault reminders
                </p>
                <ul className="text-sm text-neutral-300 space-y-1">
                  {results.complianceReminders.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Business vs personal cashflow
              </h2>
              <ul className="text-sm text-neutral-300 space-y-1">
                {results.cashflowSeparationTips.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
              {results.cashflowAlerts.length > 0 && (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">
                  <p className="font-semibold mb-2">Commingling alerts</p>
                  <ul className="space-y-1">
                    {results.cashflowAlerts.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Founder equity</h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="83(b) status"
                  value={results.equityChecklist.deadlineStatus.replace("-", " ")}
                />
                <StatCard
                  label="QSBS status"
                  value={results.equityChecklist.qsbsStatus}
                />
                <StatCard
                  label="Holding years"
                  value={`${inputs.expectedHoldingYears} yrs`}
                />
              </div>
              <ul className="mt-4 text-sm text-neutral-300 space-y-1">
                {results.equityChecklist.items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>

            <MethodologySection
              title="Methodology"
              items={[
                "Entity recommendation reflects funding intent, owner role, and income thresholds; confirm with counsel.",
                "S-Corp savings compare self-employment tax vs payroll tax on a reasonable salary, minus admin costs.",
                "Election deadlines use the 2 months + 15 days IRS window from tax-year start or entity start date.",
                "Safe-harbor uses 100% (or 110% for high-income) of prior tax or 90% of projected current tax.",
                "Retirement plan limits use 2026 IRS contribution limits from the limits reference tool.",
                "Cashflow alerts flag commingling risk and missing reimbursement policies.",
                "All outputs are educational estimates and not tax or legal advice.",
              ]}
            />
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-lg text-white font-semibold">{value}</p>
      {helper && <p className="text-xs text-neutral-500 mt-1">{helper}</p>}
    </div>
  );
}
