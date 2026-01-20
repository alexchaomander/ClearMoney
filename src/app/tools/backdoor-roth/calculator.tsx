"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import { AppShell, MethodologySection, VerdictCard } from "@/components/shared/AppShell";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/backdoor-roth/calculations";
import type { CalculatorInputs } from "@/lib/calculators/backdoor-roth/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  income: 200000,
  filingStatus: "single",
  hasWorkplacePlan: true,
  traditionalIRABalance: 0,
  sepIRABalance: 0,
  simpleIRABalance: 0,
  contributionAmount: 7000,
  age: 35,
};

const ACTION_COPY = {
  direct_roth: {
    verdict: "Direct Roth works",
    description:
      "Your income is below the phase-out range. Skip the backdoor and contribute directly.",
    type: "positive" as const,
  },
  backdoor_clean: {
    verdict: "Clean backdoor setup",
    description:
      "You have no existing IRA balances, so the pro-rata rule won’t reduce your conversion.",
    type: "positive" as const,
  },
  backdoor_with_prorata: {
    verdict: "Backdoor with taxes",
    description:
      "The pro-rata rule will make part of your conversion taxable. Decide if it’s worth it.",
    type: "neutral" as const,
  },
  fix_prorata_first: {
    verdict: "Fix pro-rata first",
    description:
      "Your existing IRA balances make most of the conversion taxable. Clean up before converting.",
    type: "negative" as const,
  },
  not_eligible: {
    verdict: "Not eligible",
    description:
      "Based on your inputs, a backdoor Roth isn’t a fit right now.",
    type: "negative" as const,
  },
};

const FAQS = [
  {
    question: "Is the backdoor Roth legal?",
    answer:
      "Yes. The IRS has acknowledged that Roth conversions are legal, and Congress effectively endorsed the strategy by keeping it available in recent tax law updates.",
  },
  {
    question: "What if I have a SEP-IRA?",
    answer:
      "SEP and SIMPLE IRAs are included in the pro-rata calculation. Their balances count when determining how much of your conversion is taxable.",
  },
  {
    question: "Can I do this every year?",
    answer:
      "Yes. As long as you make a non-deductible Traditional IRA contribution and file Form 8606 each year, you can repeat the strategy annually.",
  },
  {
    question: "What about the step transaction doctrine?",
    answer:
      "The IRS has not challenged backdoor Roth contributions on this basis when properly documented. Many taxpayers convert soon after contributing without issue.",
  },
];

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const actionCopy = ACTION_COPY[results.recommendedAction];

  const eligibilityLabel = results.eligibility.canContributeDirectlyToRoth
    ? "Direct Roth eligible"
    : "Above Roth income limits";

  const contributionLimitLabel = results.catchUpEligible
    ? `Includes $${results.contributionLimit - 7000} catch-up`
    : "Standard limit";

  const taxFreePercent = formatPercent(results.proRata.taxFreePercentage, 0, true);
  const taxablePercent = formatPercent(results.proRata.taxablePercentage, 0, true);

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-300 mb-3">
              Backdoor Roth IRA Guide
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Backdoor Roth IRA Guide
            </h1>
            <p className="text-lg text-neutral-400">
              High income? You can still contribute to a Roth IRA. Here’s how.
            </p>
          </div>
        </section>

        <section className="px-4 pb-16">
          <div className="mx-auto max-w-2xl space-y-8">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Eligibility check
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Annual Income (MAGI)"
                  value={inputs.income}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, income: value }))
                  }
                  min={0}
                  max={1000000}
                  step={1000}
                  format="currency"
                  description={`Roth phase-out: ${formatCurrency(
                    results.eligibility.rothPhaseOutStart,
                    0
                  )} - ${formatCurrency(results.eligibility.rothPhaseOutEnd, 0)}`}
                />

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-300">
                    Filing status
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {(["single", "married"] as const).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          setInputs((prev) => ({
                            ...prev,
                            filingStatus: status,
                          }))
                        }
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                          inputs.filingStatus === status
                            ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                            : "border-neutral-800 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        {status === "single" ? "Single" : "Married"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-neutral-300">
                    Workplace retirement plan?
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {["Yes", "No"].map((label) => {
                      const value = label === "Yes";
                      return (
                        <button
                          key={label}
                          type="button"
                          onClick={() =>
                            setInputs((prev) => ({
                              ...prev,
                              hasWorkplacePlan: value,
                            }))
                          }
                          className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                            inputs.hasWorkplacePlan === value
                              ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-200"
                              : "border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <VerdictCard
                  verdict={eligibilityLabel}
                  description={
                    results.eligibility.needsBackdoor
                      ? "You’re in or above the phase-out range. A backdoor Roth is likely required."
                      : "You’re below the income limits for direct Roth contributions."
                  }
                  type={
                    results.eligibility.needsBackdoor ? "neutral" : "positive"
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Contribution details
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Contribution Amount"
                  value={inputs.contributionAmount}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      contributionAmount: value,
                    }))
                  }
                  min={0}
                  max={results.contributionLimit}
                  step={100}
                  format="currency"
                  description={`${formatCurrency(results.contributionLimit, 0)} max (${contributionLimitLabel})`}
                />

                <SliderInput
                  label="Age"
                  value={inputs.age}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, age: value }))
                  }
                  min={18}
                  max={100}
                  step={1}
                  format="number"
                  description={
                    results.catchUpEligible
                      ? "Catch-up eligible (age 50+)"
                      : "Catch-up begins at age 50"
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Current IRA balances (pro-rata rule)
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Traditional IRA Balance"
                  value={inputs.traditionalIRABalance}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      traditionalIRABalance: value,
                    }))
                  }
                  min={0}
                  max={1000000}
                  step={1000}
                  format="currency"
                />

                <SliderInput
                  label="SEP-IRA Balance"
                  value={inputs.sepIRABalance}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, sepIRABalance: value }))
                  }
                  min={0}
                  max={1000000}
                  step={1000}
                  format="currency"
                />

                <SliderInput
                  label="SIMPLE IRA Balance"
                  value={inputs.simpleIRABalance}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      simpleIRABalance: value,
                    }))
                  }
                  min={0}
                  max={500000}
                  step={1000}
                  format="currency"
                />

                <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
                  <div className="flex items-center justify-between text-sm text-neutral-300 mb-3">
                    <span>Tax-free portion</span>
                    <span className="text-emerald-300">{taxFreePercent}</span>
                  </div>
                  <div className="h-3 rounded-full bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${Math.min(100, results.proRata.taxFreePercentage)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-400 mt-3">
                    <span>Taxable portion</span>
                    <span className="text-rose-300">{taxablePercent}</span>
                  </div>
                </div>

                {results.proRata.hasProRataIssue ? (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                    You have {formatCurrency(results.proRata.totalIRABalance, 0)} in
                    pre-tax IRA balances. The pro-rata rule will tax a portion of
                    your conversion.
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                    No pre-tax IRA balances detected. Your conversion should be
                    nearly tax-free.
                  </div>
                )}
              </div>
            </div>

            <VerdictCard
              verdict={actionCopy.verdict}
              description={actionCopy.description}
              type={actionCopy.type}
            />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Step-by-step instructions
              </h2>
              <div className="space-y-4">
                {results.steps.map((step) => (
                  <div
                    key={step.step}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="h-8 w-8 rounded-full bg-emerald-500/20 text-emerald-200 flex items-center justify-center font-semibold">
                        {step.step}
                      </span>
                      <h3 className="text-base font-semibold text-white">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-sm text-neutral-400">
                      {step.description}
                    </p>
                    {step.warning && (
                      <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
                        {step.warning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <ResultCard
              title="Tax impact summary"
              primaryValue={formatCurrency(results.taxImpact, 0)}
              primaryLabel="Estimated tax cost at 32% marginal rate"
              variant="emerald"
              items={[
                {
                  label: "Taxable portion",
                  value: formatCurrency(results.proRata.taxableAmount, 0),
                },
                {
                  label: "Tax-free portion",
                  value: formatCurrency(results.proRata.taxFreeAmount, 0),
                },
                {
                  label: "Taxable percentage",
                  value: taxablePercent,
                },
                {
                  label: "Tax-free percentage",
                  value: taxFreePercent,
                },
              ]}
              footer={
                results.warnings.length > 0 ? (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                    <p className="font-semibold mb-2">Key warnings</p>
                    <ul className="list-disc list-inside space-y-1">
                      {results.warnings.map((warning) => (
                        <li key={warning}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                ) : undefined
              }
            />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                Action items checklist
              </h2>
              <div className="space-y-3">
                {[
                  "Open a Traditional IRA (if you don’t already have one)",
                  "Make your non-deductible contribution by the tax deadline",
                  "Request the Roth conversion",
                  "Track the contribution on IRS Form 8606",
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-300"
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-emerald-500"
                      readOnly
                    />
                    <span>{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">FAQ</h2>
              <div className="space-y-3">
                {FAQS.map((faq) => (
                  <details
                    key={faq.question}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-sm text-neutral-300"
                  >
                    <summary className="cursor-pointer font-semibold text-white">
                      {faq.question}
                    </summary>
                    <p className="mt-2 text-neutral-400">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>

            <MethodologySection title="Methodology & IRS considerations">
              <p>
                We use 2025 income phase-out limits to determine whether direct
                Roth contributions are allowed. If you’re above the phase-out
                range, a backdoor contribution is typically required.
              </p>
              <p>
                The pro-rata rule treats all Traditional, SEP, and SIMPLE IRA
                balances as one combined account. Tax-free percentage =
                contribution ÷ (existing IRA balances + contribution).
              </p>
              <p>
                All non-deductible contributions should be tracked on IRS Form
                8606. This tool is for education only—confirm details with a tax
                professional.
              </p>
            </MethodologySection>

            {results.tips.length > 0 && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6">
                <h2 className="text-lg font-semibold text-emerald-100 mb-3">
                  Tips for smoother conversions
                </h2>
                <ul className="list-disc list-inside space-y-1 text-sm text-emerald-100">
                  {results.tips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
