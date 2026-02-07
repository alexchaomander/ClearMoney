"use client";

import { useMemo, useState } from "react";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { formatCurrency } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/founder-coverage-planner/calculations";
import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";
import { InputSection } from "./components/InputSection";

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

const METHODOLOGY_ITEMS = [
  "Entity recommendation reflects funding intent, owner role, and income thresholds; confirm with counsel.",
  "S-Corp savings compare self-employment tax vs payroll tax on a reasonable salary, minus admin costs.",
  "Election deadlines use the 2 months + 15 days IRS window from tax-year start or entity start date.",
  "Safe-harbor uses 100% (or 110% for high-income) of prior tax or 90% of projected current tax.",
  "Retirement plan limits use 2026 IRS contribution limits from the limits reference tool.",
  "Cashflow alerts flag commingling risk and missing reimbursement policies.",
  "All outputs are educational estimates and not tax or legal advice.",
];

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
            <InputSection inputs={inputs} setInputs={setInputs} />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Entity recommendation
              </h2>
              <p className="text-sm text-neutral-400 mb-4">
                {results.entity.summary}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3">
                  <p className="text-xs text-neutral-400">Recommended entity</p>
                  <p className="text-lg text-white font-semibold capitalize">
                    {results.entity.recommendedEntity.replace("_", " ")}
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
              <h2 className="text-xl font-semibold text-white mb-4">
                S-Corp savings
              </h2>
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
              <h2 className="text-xl font-semibold text-white mb-4">
                S-Corp election checklist
              </h2>
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
              <h2 className="text-xl font-semibold text-white mb-4">
                Payroll + distributions
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Distribution estimate"
                  value={formatCurrency(
                    results.payrollPlan.distributionEstimate,
                    0
                  )}
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
              <h2 className="text-xl font-semibold text-white mb-4">
                Quarterly tax plan
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Safe-harbor target"
                  value={formatCurrency(
                    results.quarterlyTaxes.safeHarborTarget,
                    0
                  )}
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
              <h2 className="text-xl font-semibold text-white mb-4">
                Retirement plan fit
              </h2>
              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Recommended plan"
                  value={results.retirement.recommendedPlan
                    .replace("_", " ")
                    .toUpperCase()}
                  helper="2026 IRS limits"
                />
                <StatCard
                  label="Employee deferral"
                  value={formatCurrency(
                    results.retirement.employeeDeferralLimit,
                    0
                  )}
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
              <h2 className="text-xl font-semibold text-white mb-4">
                Compliance checklist
              </h2>
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
              <h2 className="text-xl font-semibold text-white mb-4">
                Founder equity
              </h2>
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

            <MethodologySection title="Methodology">
              <ul className="text-sm text-neutral-400 space-y-2 list-disc pl-5">
                {METHODOLOGY_ITEMS.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </MethodologySection>
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