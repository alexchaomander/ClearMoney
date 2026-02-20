"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { MethodologySection, AppShell } from "@/components/shared";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { mergeDeep } from "@/lib/shared/merge";
import { calculate } from "@/lib/calculators/subscription-audit/calculations";
import type {
  CalculatorInputs,
  SubscriptionInput,
  UsageFrequency,
} from "@/lib/calculators/subscription-audit/types";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useToolPreset } from "@/lib/strata/presets";

const USAGE_OPTIONS: { value: UsageFrequency; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "rarely", label: "Rarely" },
  { value: "never", label: "Never" },
];

const CATEGORY_OPTIONS = [
  "Entertainment",
  "Productivity",
  "Fitness",
  "News",
  "Music",
  "Cloud Storage",
  "Food Delivery",
  "Shopping",
  "Education",
  "Other",
];

const DEFAULT_SUBSCRIPTIONS: SubscriptionInput[] = [
  { name: "Netflix", monthlyCost: 15, category: "Entertainment", usageFrequency: "daily", satisfaction: 4 },
  { name: "Spotify", monthlyCost: 11, category: "Music", usageFrequency: "daily", satisfaction: 5 },
  { name: "Gym Membership", monthlyCost: 50, category: "Fitness", usageFrequency: "weekly", satisfaction: 3 },
];

const DEFAULT_INPUTS: CalculatorInputs = {
  subscriptions: DEFAULT_SUBSCRIPTIONS,
  monthlyIncome: 5000,
};

const BADGE_COLORS: Record<string, string> = {
  keep: "bg-green-500/20 text-green-300 border-green-500/30",
  review: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  cancel: "bg-red-500/20 text-red-300 border-red-500/30",
};

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("subscription-audit");
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CalculatorInputs>({
    monthlyIncome: "monthly_income",
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

  function updateSubscription(index: number, updates: Partial<SubscriptionInput>) {
    setInputs((prev) => {
      const subs = [...prev.subscriptions];
      subs[index] = { ...subs[index], ...updates };
      return { ...prev, subscriptions: subs };
    });
  }

  function addSubscription() {
    setInputs((prev) => ({
      ...prev,
      subscriptions: [
        ...prev.subscriptions,
        { name: "", monthlyCost: 10, category: "Other", usageFrequency: "monthly" as UsageFrequency, satisfaction: 3 },
      ],
    }));
  }

  function removeSubscription(index: number) {
    setInputs((prev) => ({
      ...prev,
      subscriptions: prev.subscriptions.filter((_, i) => i !== index),
    }));
  }

  const healthColor =
    results.overallHealthScore >= 60
      ? "text-green-400"
      : results.overallHealthScore >= 30
        ? "text-amber-300"
        : "text-red-400";

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Subscription Audit Scorer
            </h1>
            <p className="text-lg text-neutral-400">
              Score each subscription by ROI and find out which to keep, review,
              or cancel.
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

            {/* Income Input */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-white">Monthly Income</h2>
              <SliderInput
                label="Monthly Income"
                value={inputs.monthlyIncome}
                onChange={(v) => setInputs((p) => ({ ...p, monthlyIncome: v }))}
                min={0}
                max={50000}
                step={500}
                format="currency"
              />
            </div>

            {/* Subscription List Builder */}
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Your Subscriptions</h2>
                <button
                  type="button"
                  onClick={addSubscription}
                  className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-200 hover:bg-amber-500/20 transition-colors"
                >
                  + Add
                </button>
              </div>

              {inputs.subscriptions.map((sub, i) => (
                <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      placeholder="Subscription name"
                      value={sub.name}
                      onChange={(e) => updateSubscription(i, { name: e.target.value })}
                      className="bg-transparent text-white text-sm font-semibold border-none outline-none flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubscription(i)}
                      className="text-neutral-500 hover:text-red-400 text-sm ml-2"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Monthly Cost</label>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={sub.monthlyCost}
                        onChange={(e) =>
                          updateSubscription(i, { monthlyCost: Math.max(0, Number(e.target.value)) })
                        }
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Category</label>
                      <select
                        value={sub.category}
                        onChange={(e) => updateSubscription(i, { category: e.target.value })}
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">How Often Used</label>
                      <select
                        value={sub.usageFrequency}
                        onChange={(e) =>
                          updateSubscription(i, { usageFrequency: e.target.value as UsageFrequency })
                        }
                        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5 text-sm text-white"
                      >
                        {USAGE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Satisfaction ({sub.satisfaction}/5)
                      </label>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        value={sub.satisfaction}
                        onChange={(e) =>
                          updateSubscription(i, { satisfaction: Number(e.target.value) })
                        }
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Dashboard */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Total Monthly
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatCurrency(results.totalMonthlySpend)}
                </p>
                <p className="text-xs text-neutral-500">
                  {formatCurrency(results.totalAnnualSpend)}/year
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  % of Income
                </p>
                <p className="text-3xl font-bold text-white">
                  {formatPercent(results.percentOfIncome, 1, true)}
                </p>
              </div>
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-2">
                <p className="text-sm uppercase tracking-wide text-neutral-500">
                  Health Score
                </p>
                <p className={`text-3xl font-bold ${healthColor}`}>
                  {results.overallHealthScore}
                </p>
                <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={`h-full ${
                      results.overallHealthScore >= 60 ? "bg-green-500" :
                      results.overallHealthScore >= 30 ? "bg-amber-400" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(100, results.overallHealthScore)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Scored Subscription Cards */}
            {results.scoredSubscriptions.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Scores</h3>
                {results.scoredSubscriptions.map((sub, i) => (
                  <div key={i} className="rounded-xl bg-neutral-900 p-4 flex items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-white truncate">{sub.name || "Unnamed"}</p>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold uppercase ${BADGE_COLORS[sub.recommendation]}`}>
                          {sub.recommendation}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1">{sub.reason}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-white">{formatCurrency(sub.monthlyCost)}/mo</p>
                      <div className="mt-1 h-2 w-24 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className={`h-full ${
                            sub.roiScore >= 60 ? "bg-green-500" :
                            sub.roiScore >= 30 ? "bg-amber-400" : "bg-red-500"
                          }`}
                          style={{ width: `${Math.min(100, sub.roiScore)}%` }}
                        />
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5">ROI: {sub.roiScore}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Savings Opportunity */}
            {results.annualSavingsIfCancelled > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 space-y-2">
                <h3 className="text-lg font-semibold text-amber-100">
                  Savings Opportunity
                </h3>
                <p className="text-sm text-amber-200">
                  Cancel all flagged subscriptions to save{" "}
                  <span className="font-bold text-white">
                    {formatCurrency(results.annualSavingsIfCancelled)}/year
                  </span>
                  .
                </p>
              </div>
            )}

            {/* Category Breakdown */}
            {results.categoryBreakdown.length > 0 && (
              <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-white">By Category</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {results.categoryBreakdown.map((cat) => (
                    <div key={cat.category} className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                      <p className="text-sm font-semibold text-white">{cat.category}</p>
                      <p className="text-xs text-neutral-500">
                        {cat.count} sub{cat.count > 1 ? "s" : ""} &middot;{" "}
                        {formatCurrency(cat.monthlyCost)}/mo &middot;{" "}
                        {formatCurrency(cat.annualCost)}/yr
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
              <p className="text-sm text-amber-100">{results.recommendation}</p>
            </div>

            <MethodologySection>
              <p>
                Each subscription is scored based on usage frequency, satisfaction,
                and cost efficiency. The ROI score formula weights how often you use
                a service, how satisfied you are (1-5), and how cost-efficient it is
                per use.
              </p>
              <p>
                Scores above 60 are &quot;keep&quot;, 30-59 are &quot;review&quot;,
                and below 30 are &quot;cancel&quot; candidates. The health score is
                a cost-weighted average of all subscription ROI scores.
              </p>
            </MethodologySection>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
