"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { MethodologySection, AppShell } from "@/components/shared";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { mergeDeep } from "@/lib/shared/merge";
import { calculate } from "@/lib/calculators/roth-conversion/calculations";
import type { CalculatorInputs, FilingStatus } from "@/lib/calculators/roth-conversion/types";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useToolPreset } from "@/lib/strata/presets";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
  { value: "married_separate", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
];

const DEFAULT_INPUTS: CalculatorInputs = {
  currentAge: 45,
  retirementAge: 65,
  traditionalIraBalance: 500000,
  conversionAmount: 50000,
  currentTaxableIncome: 100000,
  filingStatus: "single",
  state: "CA",
  expectedReturnRate: 7,
  currentTaxRate: 24,
  retirementTaxRate: 22,
};

const FILING_STATUS_MAP: Record<string, FilingStatus> = {
  single: "single",
  married_filing_jointly: "married",
  married_filing_separately: "married_separate",
  head_of_household: "head_of_household",
};

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("roth-conversion");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    currentAge: "age",
    retirementAge: "retirement_age",
    filingStatus: ["filing_status", (v) => FILING_STATUS_MAP[String(v)] ?? "single"],
    state: "state",
    currentTaxableIncome: "annual_income",
    currentTaxRate: ["federal_tax_rate", (v) => Number(v) * 100],
    traditionalIraBalance: "current_retirement_savings",
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

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Roth Conversion Analyzer
            </h1>
            <p className="text-lg text-neutral-400">
              Should you convert traditional IRA funds to Roth? See the tax
              impact, break-even age, and IRMAA consequences.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-3xl space-y-8">
            <LoadMyDataBanner
              isLoaded={memoryLoaded}
              hasData={memoryHasDefaults}
              isApplied={preFilledFields.size > 0}
              onApply={handleLoadData}
            />

            {/* Input Card */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">Your Details</h2>

              <SliderInput
                label="Current Age"
                value={inputs.currentAge}
                onChange={(v) => setInputs((p) => ({ ...p, currentAge: v }))}
                min={18}
                max={80}
                step={1}
              />
              {preFilledFields.has("currentAge") && (
                <div className="-mt-4 mb-2 ml-1">
                  <MemoryBadge field="currentAge" preFilledFields={preFilledFields} />
                </div>
              )}

              <SliderInput
                label="Retirement Age"
                value={inputs.retirementAge}
                onChange={(v) => setInputs((p) => ({ ...p, retirementAge: v }))}
                min={50}
                max={80}
                step={1}
              />

              <SliderInput
                label="Traditional IRA Balance"
                value={inputs.traditionalIraBalance}
                onChange={(v) => setInputs((p) => ({ ...p, traditionalIraBalance: v }))}
                min={0}
                max={5000000}
                step={10000}
                format="currency"
              />
              {preFilledFields.has("traditionalIraBalance") && (
                <div className="-mt-4 mb-2 ml-1">
                  <MemoryBadge field="traditionalIraBalance" preFilledFields={preFilledFields} />
                </div>
              )}

              <SliderInput
                label="Conversion Amount"
                value={inputs.conversionAmount}
                onChange={(v) => setInputs((p) => ({ ...p, conversionAmount: v }))}
                min={0}
                max={Math.max(inputs.traditionalIraBalance, 100000)}
                step={5000}
                format="currency"
              />

              <SliderInput
                label="Current Taxable Income"
                value={inputs.currentTaxableIncome}
                onChange={(v) => setInputs((p) => ({ ...p, currentTaxableIncome: v }))}
                min={0}
                max={1000000}
                step={5000}
                format="currency"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">Filing Status</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.filingStatus}
                    onChange={(e) =>
                      setInputs((p) => ({ ...p, filingStatus: e.target.value as FilingStatus }))
                    }
                  >
                    {FILING_STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1">State</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                    value={inputs.state}
                    onChange={(e) => setInputs((p) => ({ ...p, state: e.target.value }))}
                  >
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <SliderInput
                label="Expected Return Rate"
                value={inputs.expectedReturnRate}
                onChange={(v) => setInputs((p) => ({ ...p, expectedReturnRate: v }))}
                min={0}
                max={12}
                step={0.5}
                format="percent"
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <SliderInput
                  label="Current Marginal Tax Rate"
                  value={inputs.currentTaxRate}
                  onChange={(v) => setInputs((p) => ({ ...p, currentTaxRate: v }))}
                  min={0}
                  max={50}
                  step={1}
                  format="percent"
                />
                <SliderInput
                  label="Retirement Tax Rate"
                  value={inputs.retirementTaxRate}
                  onChange={(v) => setInputs((p) => ({ ...p, retirementTaxRate: v }))}
                  min={0}
                  max={50}
                  step={1}
                  format="percent"
                />
              </div>
            </div>

            {/* Results Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Conversion Tax Cost
                </p>
                <p className="text-3xl font-bold text-violet-400">
                  {formatCurrency(results.conversionTaxCost)}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Break-Even Age
                </p>
                <p className="text-3xl font-bold text-white">
                  {results.breakEvenAge ?? "N/A"}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Lifetime Savings
                </p>
                <p className={`text-3xl font-bold ${results.lifetimeSavings >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {results.lifetimeSavings >= 0 ? "+" : ""}{formatCurrency(results.lifetimeSavings)}
                </p>
                <p className="text-xs text-neutral-500">By age 90</p>
              </div>
            </div>

            {/* IRMAA Impact Card */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Medicare IRMAA Impact
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-neutral-400">MAGI Before Conversion</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(results.irmaaImpact.magiBefore)}
                  </p>
                  <p className="text-xs text-neutral-500">{results.irmaaImpact.bracketBefore}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-400">MAGI After Conversion</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(results.irmaaImpact.magiAfter)}
                  </p>
                  <p className="text-xs text-neutral-500">{results.irmaaImpact.bracketAfter}</p>
                </div>
              </div>
              {results.irmaaImpact.crossesBracket ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-200">
                    This conversion pushes you into a higher IRMAA bracket, adding{" "}
                    <span className="font-semibold">
                      {formatCurrency(results.irmaaImpact.annualSurchargeDelta)}/year
                    </span>{" "}
                    in Medicare surcharges.
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">
                  <p className="text-sm text-green-200">
                    This conversion does not push you into a higher IRMAA bracket.
                  </p>
                </div>
              )}
            </div>

            {/* Year-by-Year Projection */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Year-by-Year Projection
              </h3>
              <div className="max-h-72 overflow-auto border border-neutral-800 rounded-xl">
                <table className="w-full text-sm">
                  <thead className="bg-neutral-900/80 text-neutral-400 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left">Age</th>
                      <th className="px-3 py-2 text-right">No Convert</th>
                      <th className="px-3 py-2 text-right">Convert</th>
                      <th className="px-3 py-2 text-right">Advantage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.yearByYear
                      .filter((_, i) => i % 5 === 0 || results.yearByYear[i]?.isBreakEven)
                      .map((row) => (
                      <tr
                        key={row.age}
                        className={`border-t border-neutral-800 ${
                          row.isBreakEven
                            ? "bg-violet-500/10 text-violet-200"
                            : "text-neutral-300"
                        }`}
                      >
                        <td className="px-3 py-2">
                          {row.age}
                          {row.isBreakEven && (
                            <span className="ml-2 text-xs font-semibold text-violet-400">
                              BREAK-EVEN
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(row.traditionalBalance)}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {formatCurrency(row.rothBalance)}
                        </td>
                        <td className={`px-3 py-2 text-right ${
                          row.cumulativeTaxSaved >= 0 ? "text-green-400" : "text-red-400"
                        }`}>
                          {row.cumulativeTaxSaved >= 0 ? "+" : ""}
                          {formatCurrency(row.cumulativeTaxSaved)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Factors & Recommendation */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Key Factors</h3>
              <ul className="space-y-2">
                {results.factors.map((factor, i) => (
                  <li key={i} className="flex gap-2 text-sm text-neutral-300">
                    <span className="text-violet-400 shrink-0">&#x2022;</span>
                    {factor}
                  </li>
                ))}
              </ul>
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
                <p className="text-sm text-violet-100">{results.recommendation}</p>
              </div>
            </div>

            <MethodologySection>
              <p>
                This calculator compares two scenarios: keeping funds in a traditional
                IRA (taxed at your retirement rate upon withdrawal) versus converting
                to Roth now (taxed at your current rate, then growing tax-free).
              </p>
              <p>
                The break-even age is when the Roth scenario&apos;s after-tax value
                exceeds the traditional scenario. IRMAA impact uses 2026 CMS brackets
                based on your MAGI.
              </p>
              <p>
                This is a simplified model. Consult a tax professional for personalized
                advice, especially regarding state taxes, RMDs, and estate planning.
              </p>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
