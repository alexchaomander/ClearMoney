"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { AppShell, MethodologySection } from "@/components/shared/AppShell";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
} from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/2026-limits/calculations";
import {
  KEY_DATES_2026,
  MANDATORY_ROTH_CATCHUP_INCOME,
  REFERENCE_LIMITS_2026,
} from "@/lib/calculators/2026-limits/constants";
import type {
  ContributionLimit,
  FilingStatus,
  LimitsInputs,
  ReferenceLimit,
} from "@/lib/calculators/2026-limits/types";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";

const DEFAULT_INPUTS: LimitsInputs = {
  age: 35,
  filingStatus: "single",
  annualIncome: 100000,
  accounts: {
    has401k: true,
    hasTraditionalIRA: true,
    hasRothIRA: true,
    hasHSA: true,
    hsaCoverageType: "family",
    hasFSA: false,
    hasSimpleIRA: false,
    has403b: false,
    has457b: false,
    hasSolo401k: false,
    hasSepIRA: false,
  },
};

const filingStatusOptions: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married filing jointly" },
  { value: "head_of_household", label: "Head of household" },
];

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && (
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        )}
      </div>
      <button
        type="button"
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`h-9 w-16 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 ${
          checked
            ? "border-indigo-400 bg-indigo-500/20"
            : "border-neutral-700 bg-neutral-900"
        }`}
      >
        <span
          className={`block h-7 w-7 rounded-full transition-transform ${
            checked
              ? "translate-x-7 bg-indigo-400"
              : "translate-x-1 bg-neutral-600"
          }`}
        />
      </button>
    </div>
  );
}

function LimitsTable({
  title,
  subtitle,
  limits,
}: {
  title: string;
  subtitle?: string;
  limits: ContributionLimit[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {subtitle && <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>}
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
          Personalized
        </span>
      </div>

      {limits.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No accounts selected in this category.</p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-neutral-500">
              <tr>
                <th className="pb-3">Account</th>
                <th className="pb-3">Base</th>
                <th className="pb-3">Catch-up</th>
                <th className="pb-3">Total</th>
                <th className="pb-3">Your limit</th>
                <th className="pb-3">Monthly</th>
              </tr>
            </thead>
            <tbody className="text-neutral-200">
              {limits.map((limit) => {
                const isVariableLimit = limit.accountType === "529 Plan";
                return (
                  <tr key={limit.accountType} className="border-t border-neutral-800">
                    <td className="py-4 pr-4">
                      <div className="font-medium text-white">{limit.accountType}</div>
                      {limit.incomePhaseOut && (
                        <div className="mt-2 text-xs text-neutral-400">
                          IRA phase-out status:{" "}
                          <span className="capitalize">{limit.incomePhaseOut.yourStatus}</span>
                        </div>
                      )}
                      {limit.notes.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-neutral-500">
                          {limit.notes.map((note, index) => (
                            <li key={`${limit.accountType}-note-${index}`}>• {note}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="py-4 pr-4">
                      {isVariableLimit ? "Varies" : formatCurrency(limit.baseLimit)}
                    </td>
                    <td className="py-4 pr-4">
                      {limit.catchUpLimit > 0 ? formatCurrency(limit.catchUpLimit) : "—"}
                    </td>
                    <td className="py-4 pr-4">
                      {isVariableLimit ? "Varies" : formatCurrency(limit.totalLimit)}
                    </td>
                    <td className="py-4 pr-4 font-semibold text-indigo-300">
                      {isVariableLimit ? "Varies" : formatCurrency(limit.yourLimit)}
                    </td>
                    <td className="py-4 pr-4">
                      {isVariableLimit ? "Varies" : formatCurrency(limit.monthlyToMax)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReferenceTable({
  title,
  limits,
}: {
  title: string;
  limits: ReferenceLimit[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[520px] w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="pb-3">Account</th>
              <th className="pb-3">Base</th>
              <th className="pb-3">Catch-up 50+</th>
              <th className="pb-3">Catch-up 60-63</th>
            </tr>
          </thead>
          <tbody className="text-neutral-200">
            {limits.map((limit) => (
              <tr key={limit.accountType} className="border-t border-neutral-800">
                <td className="py-4 pr-4">
                  <div className="font-medium text-white">{limit.accountType}</div>
                  {limit.notes && (
                    <p className="mt-2 text-xs text-neutral-500">{limit.notes}</p>
                  )}
                </td>
                <td className="py-4 pr-4">
                  {limit.baseLimit === 0
                    ? "Varies"
                    : formatCurrency(limit.baseLimit)}
                </td>
                <td className="py-4 pr-4">
                  {limit.catchUp50 ? formatCurrency(limit.catchUp50) : "—"}
                </td>
                <td className="py-4 pr-4">
                  {limit.catchUp60 ? formatCurrency(limit.catchUp60) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Calculator() {
  const { preset } = useToolPreset<LimitsInputs>("2026-limits");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<LimitsInputs>({
    age: "age",
    annualIncome: "annual_income",
    filingStatus: [
      "filing_status",
      (value: unknown) => {
        const raw = typeof value === "string" ? value : null;
        if (!raw) return null;
        if (raw === "married_filing_jointly" || raw === "married_filing_separately") {
          return "married";
        }
        return raw === "head_of_household" ? "head_of_household" : "single";
      },
    ],
  });

  const [inputs, setInputs] = useState<LimitsInputs>(() =>
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
  const totalAccounts =
    results.limits.retirement.length +
    results.limits.health.length +
    results.limits.education.length;

  const selectedAccounts = Object.entries(inputs.accounts).filter(
    ([, value]) => typeof value === "boolean" && value
  ).length;

  const retirementHeader = `Retirement accounts included: ${formatNumber(
    results.limits.retirement.length
  )}`;
  const healthHeader = `Health accounts included: ${formatNumber(
    results.limits.health.length
  )}`;

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
            2026 reference dashboard
          </span>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">
            2026 Contribution Limits Dashboard
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Everything you need to max out retirement, health, and education accounts in
            2026—personalized by age, income, and the benefits you have access to.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-6">
          <LoadMyDataBanner
            isLoaded={memoryLoaded}
            hasData={memoryHasDefaults}
            isApplied={preFilledFields.size > 0}
            onApply={handleLoadData}
          />
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-8">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Your profile</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Tailor the 2026 limits based on your age, income, and benefit access.
              </p>

              <div className="mt-6 space-y-6">
                <SliderInput
                  label="Current age"
                  value={inputs.age}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      age: value,
                    }))
                  }
                  min={18}
                  max={80}
                  step={1}
                  format="number"
                />

                <div>
                  <label className="text-sm font-medium text-white">Filing status</label>
                  <select
                    className="mt-2 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.filingStatus}
                    onChange={(event) =>
                      setInputs((prev) => ({
                        ...prev,
                        filingStatus: event.target.value as FilingStatus,
                      }))
                    }
                  >
                    {filingStatusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <SliderInput
                  label="Annual income"
                  value={inputs.annualIncome}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      annualIncome: value,
                    }))
                  }
                  min={0}
                  max={1000000}
                  step={5000}
                  format="currency"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">Account access</h2>
              <p className="mt-2 text-sm text-neutral-400">
                Toggle the plans you have available to see a personalized max-out plan.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <ToggleRow
                  label="401(k)"
                  description="Employer-sponsored plan"
                  checked={inputs.accounts.has401k}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, has401k: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="403(b)"
                  description="Non-profit & education"
                  checked={inputs.accounts.has403b}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, has403b: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="457(b)"
                  description="Government plans"
                  checked={inputs.accounts.has457b}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, has457b: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="Traditional IRA"
                  description="Personal retirement account"
                  checked={inputs.accounts.hasTraditionalIRA}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, hasTraditionalIRA: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="Roth IRA"
                  description="After-tax retirement account"
                  checked={inputs.accounts.hasRothIRA}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, hasRothIRA: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="SIMPLE IRA"
                  description="Small business plan"
                  checked={inputs.accounts.hasSimpleIRA}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, hasSimpleIRA: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="Solo 401(k)"
                  description="Self-employed plan"
                  checked={inputs.accounts.hasSolo401k}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, hasSolo401k: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="SEP IRA"
                  description="Self-employed plan"
                  checked={inputs.accounts.hasSepIRA}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, hasSepIRA: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="HSA"
                  description="Health Savings Account"
                  checked={inputs.accounts.hasHSA}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, hasHSA: checked },
                    }))
                  }
                />
                <ToggleRow
                  label="FSA"
                  description="Flexible Spending Account"
                  checked={inputs.accounts.hasFSA}
                  onChange={(checked) =>
                    setInputs((prev) => ({
                      ...prev,
                      accounts: { ...prev.accounts, hasFSA: checked },
                    }))
                  }
                />
              </div>

              {inputs.accounts.hasHSA && (
                <div className="mt-6">
                  <label className="text-sm font-medium text-white">
                    HSA coverage type
                  </label>
                  <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                    {(["self", "family"] as const).map((coverage) => (
                      <button
                        key={coverage}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            accounts: { ...prev.accounts, hsaCoverageType: coverage },
                          }))
                        }
                        className={`flex-1 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                          inputs.accounts.hsaCoverageType === coverage
                            ? "border-indigo-400 bg-indigo-500/20 text-indigo-200"
                            : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {coverage === "self" ? "Self-only" : "Family"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <ResultCard
              title="Your 2026 max-out total"
              primaryValue={formatCurrency(results.totalMaxContributions)}
              primaryLabel="Annual contributions across selected accounts"
              items={[
                {
                  label: "Monthly to max all",
                  value: formatCurrency(results.monthlyToMaxAll),
                },
                {
                  label: "Selected accounts",
                  value: formatNumber(selectedAccounts),
                },
                {
                  label: "All reference accounts",
                  value: formatNumber(totalAccounts),
                },
              ]}
              variant="purple"
            />

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white">2026 strategy snapshot</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-300">
                {results.personalizedStrategy.map((item, index) => (
                  <li key={`strategy-${index}`} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-xs text-indigo-100">
                Mandatory Roth catch-up applies above {formatCurrency(
                  MANDATORY_ROTH_CATCHUP_INCOME
                )} of wages.
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white">2026 key dates</h3>
              <ul className="mt-4 space-y-3 text-sm text-neutral-400">
                {KEY_DATES_2026.map((item) => (
                  <li key={item.date} className="flex items-start justify-between gap-4">
                    <span className="font-medium text-white">{item.date}</span>
                    <span className="text-right text-neutral-400">{item.description}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => window.print()}
                className="mt-6 w-full rounded-lg border border-indigo-500/40 bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-100 transition-colors hover:bg-indigo-500/30"
              >
                Print / save this reference
              </button>
            </div>
          </div>
        </div>
      </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <LimitsTable
            title="Retirement plan limits"
            subtitle={retirementHeader}
            limits={results.limits.retirement}
          />
          <LimitsTable
            title="Health account limits"
            subtitle={healthHeader}
            limits={results.limits.health}
          />
          <LimitsTable
            title="Education account limits"
            subtitle="Coverdell and 529 reference caps"
            limits={results.limits.education}
          />
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">2025 → 2026 changes</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Year-over-year increases for the biggest accounts.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
                Updated limits
              </span>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-[560px] w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-neutral-500">
                  <tr>
                    <th className="pb-3">Account</th>
                    <th className="pb-3">2025</th>
                    <th className="pb-3">2026</th>
                    <th className="pb-3">Change</th>
                    <th className="pb-3">Percent</th>
                  </tr>
                </thead>
                <tbody className="text-neutral-200">
                  {results.yearOverYear.map((entry) => {
                    return (
                      <tr key={entry.accountType} className="border-t border-neutral-800">
                        <td className="py-4 pr-4 font-medium text-white">
                          {entry.accountType}
                        </td>
                        <td className="py-4 pr-4">{formatCurrency(entry.limit2025)}</td>
                        <td className="py-4 pr-4">{formatCurrency(entry.limit2026)}</td>
                        <td className="py-4 pr-4 text-indigo-300">
                          {formatCurrency(entry.change)}
                        </td>
                        <td className="py-4 pr-4">
                          {formatPercent(entry.percentChange)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ReferenceTable
              title="Retirement plan reference limits"
              limits={REFERENCE_LIMITS_2026.retirement}
            />
            <ReferenceTable
              title="Health plan reference limits"
              limits={REFERENCE_LIMITS_2026.health}
            />
          </div>
          <ReferenceTable
            title="Education plan reference limits"
            limits={REFERENCE_LIMITS_2026.education}
          />
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <MethodologySection>
            <p>
              This dashboard combines IRS-announced 2026 limits for retirement, health,
              and education accounts with your age and income to surface personalized
              catch-up eligibility, IRA phase-outs, and monthly contribution targets.
            </p>
            <p>
              Retirement plans use the employee deferral limits shown in IRS guidance. HSA
              limits depend on self-only versus family coverage, and IRA limits adjust
              when your income falls within the phase-out ranges for your filing status.
            </p>
            <p>
              Year-over-year comparisons highlight the largest IRS updates published for
              2026. For self-employed plans (SEP and Solo 401(k)), limits can be further
              constrained by compensation and employer contribution formulas.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
