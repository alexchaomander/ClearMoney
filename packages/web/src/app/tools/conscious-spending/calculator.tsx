"use client";

import {useCallback, useEffect, useMemo, useState} from "react";

import { SliderInput } from "@/components/shared/SliderInput";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { MemoryBadge } from "@/components/tools/MemoryBadge";
import { ResultCard } from "@/components/shared/ResultCard";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { mergeDeep } from "@/lib/shared/merge";
import { useToolPreset } from "@/lib/strata/presets";
import { calculate } from "@/lib/calculators/conscious-spending/calculations";
import type {
  CalculatorInputs,
  CategoryAnalysis,
} from "@/lib/calculators/conscious-spending/types";

const DEFAULT_INPUTS: CalculatorInputs = {
  monthlyIncome: 5000,
  fixedCosts: 2500,
  investments: 500,
  savings: 300,
  guiltFree: 700,
  moneyDials: [],
};

const MONEY_DIALS = [
  "Convenience",
  "Travel",
  "Health/Fitness",
  "Experiences",
  "Freedom",
  "Relationships",
  "Generosity",
  "Luxury",
  "Social Status",
  "Self-improvement",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Fixed Costs": "bg-rose-500",
  Investments: "bg-emerald-500",
  "Savings Goals": "bg-sky-500",
  "Guilt-Free Spending": "bg-amber-400",
};

const CATEGORY_INPUT_MAP = {
  "Fixed Costs": "fixedCosts",
  Investments: "investments",
  "Savings Goals": "savings",
  "Guilt-Free Spending": "guiltFree",
} as const;

type CategoryName = keyof typeof CATEGORY_INPUT_MAP;

const CATEGORY_MAX_MAP: Record<keyof typeof CATEGORY_INPUT_MAP, number> = {
  "Fixed Costs": 30000,
  Investments: 10000,
  "Savings Goals": 10000,
  "Guilt-Free Spending": 20000,
};

const STATUS_STYLES: Record<
  CategoryAnalysis["status"],
  { label: string; badge: string; text: string }
> = {
  under: {
    label: "Needs boost",
    badge: "bg-amber-500/15 text-amber-200 border-amber-400/40",
    text: "text-amber-200",
  },
  good: {
    label: "On target",
    badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
    text: "text-emerald-200",
  },
  over: {
    label: "High",
    badge: "bg-rose-500/15 text-rose-200 border-rose-400/40",
    text: "text-rose-200",
  },
};

const OVERALL_STYLES = {
  great: {
    label: "Great",
    badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/40",
    description: "Everything is aligned and automated.",
  },
  "almost-there": {
    label: "Almost there",
    badge: "bg-sky-500/15 text-sky-200 border-sky-400/40",
    description: "A small tweak will unlock more freedom.",
  },
  "needs-work": {
    label: "Needs work",
    badge: "bg-rose-500/15 text-rose-200 border-rose-400/40",
    description: "Adjust the dials to match the framework.",
  },
};

function AllocationBar({ categories }: { categories: CategoryAnalysis[] }) {
  const totalPercent = categories.reduce(
    (sum, category) => sum + category.percentage,
    0
  );
  const scale = Math.max(totalPercent, 100);
  const unallocatedPercent = Math.max(0, 100 - totalPercent);

  return (
    <div className="space-y-2">
      <div className="h-4 w-full overflow-hidden rounded-full bg-neutral-800">
        <div className="flex h-full">
          {categories.map((category) => (
            <div
              key={category.name}
              className={CATEGORY_COLORS[category.name] ?? "bg-emerald-500"}
              style={{ width: `${(category.percentage / scale) * 100}%` }}
            />
          ))}
          {unallocatedPercent > 0 && (
            <div
              className="bg-neutral-700/70"
              style={{ width: `${(unallocatedPercent / scale) * 100}%` }}
            />
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
        {categories.map((category) => (
          <div key={`${category.name}-legend`} className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                CATEGORY_COLORS[category.name] ?? "bg-emerald-500"
              }`}
            />
            <span>{category.name}</span>
          </div>
        ))}
        {unallocatedPercent > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-neutral-600" />
            <span>Unallocated</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MoneyDialGrid({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (dial: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {MONEY_DIALS.map((dial) => {
        const isSelected = selected.includes(dial);
        const selectedIndex = selected.indexOf(dial);
        return (
          <button
            key={dial}
            type="button"
            onClick={() => onToggle(dial)}
            className={`group relative flex min-h-[52px] items-center justify-between rounded-xl border px-3 py-2 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 ${
              isSelected
                ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-100"
                : "border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:border-emerald-400/40 hover:text-white"
            }`}
            aria-pressed={isSelected}
          >
            <span>{dial}</span>
            {isSelected && (
              <span className="rounded-full border border-emerald-400/60 px-2 py-0.5 text-xs text-emerald-100">
                #{selectedIndex + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function CategoryCard({ category }: { category: CategoryAnalysis }) {
  const status = STATUS_STYLES[category.status];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-400">{category.name}</p>
          <p className="text-xl font-semibold text-white">
            {formatCurrency(category.amount, 0)}
          </p>
        </div>
        <div
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${status.badge}`}
        >
          {status.label}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-300">
        <span className={status.text}>
          {formatPercent(category.percentage / 100, 1)} of income
        </span>
        <span className="text-neutral-500">
          Target {category.targetMin}-{category.targetMax}%
        </span>
      </div>
      <p className="mt-3 text-sm text-neutral-400">{category.recommendation}</p>
    </div>
  );
}

export function Calculator() {
  const { preset } = useToolPreset<CalculatorInputs>("conscious-spending");
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
  const handleLoadData = useCallback(() => applyMemoryDefaults(setInputs), [applyMemoryDefaults]);


  useEffect(() => {
    if (!preset) return;
    setInputs((prev) => mergeDeep(prev, preset));
  }, [preset]);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const allocationPercent = results.categories.reduce(
    (sum, category) => sum + category.percentage,
    0
  );
  const selectedDials = inputs.moneyDials ?? [];
  const overall = OVERALL_STYLES[results.overallStatus];

  const toggleDial = (dial: string) => {
    setInputs((prev) => {
      const current = prev.moneyDials ?? [];
      if (current.includes(dial)) {
        return { ...prev, moneyDials: current.filter((item) => item !== dial) };
      }
      if (current.length >= 3) {
        return prev;
      }
      return { ...prev, moneyDials: [...current, dial] };
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Conscious Spending Planner
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Spend extravagantly on what you love.
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Cut mercilessly on what you don&apos;t. This planner helps you build a
            guilt-free spending plan in under a minute.
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            Based on Ramit Sethi&apos;s framework
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
          <div className="rounded-2xl bg-neutral-900 p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Monthly income</h2>
            <p className="mt-2 text-sm text-neutral-400">
              After taxes, what hits your bank account each month?
            </p>
            <div className="mt-6">
              <SliderInput
                label="Monthly Take-Home Pay"
                value={inputs.monthlyIncome}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, monthlyIncome: value }))
                }
                min={0}
                max={50000}
                step={100}
                format="currency"
              />
              <MemoryBadge field="monthlyIncome" preFilledFields={preFilledFields} />
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 shadow-lg shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Spending allocation
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  See how your categories line up with the targets.
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-400">Allocated</p>
                <p className="text-lg font-semibold text-white">
                  {formatPercent(allocationPercent / 100, 0)} of income
                </p>
              </div>
            </div>

            <div className="mt-6">
              <AllocationBar categories={results.categories} />
            </div>

            <div className="mt-6 space-y-6">
              {results.categories.map((category) => (
                <div key={category.name} className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-neutral-300">
                      {category.name} · {formatCurrency(category.amount, 0)}
                    </span>
                    <span className="text-neutral-500">
                      Target {category.targetMin}-{category.targetMax}%
                    </span>
                  </div>
                  <SliderInput
                    label={category.name}
                    value={category.amount}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        [CATEGORY_INPUT_MAP[category.name as CategoryName]]: value,
                      }))
                    }
                    min={0}
                    max={CATEGORY_MAX_MAP[category.name as CategoryName]}
                    step={100}
                    format="currency"
                  />
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
                    <span
                      className={`rounded-full border px-2 py-1 ${
                        STATUS_STYLES[category.status].badge
                      }`}
                    >
                      {STATUS_STYLES[category.status].label}
                    </span>
                    <span>
                      {formatPercent(category.percentage / 100, 1)} of income
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 shadow-lg shadow-black/20">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-white">Your money dials</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  What do you want to spend extravagantly on? Pick your top three.
                </p>
              </div>
              <div className="text-sm text-neutral-500">
                {selectedDials.length}/3 selected
              </div>
            </div>
            <div className="mt-5">
              <MoneyDialGrid selected={selectedDials} onToggle={toggleDial} />
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 shadow-lg shadow-black/20">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Your results</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  {overall.description}
                </p>
              </div>
              <div
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${overall.badge}`}
              >
                {overall.label}
              </div>
            </div>

            {results.primaryIssue && (
              <p className="mt-4 text-sm text-neutral-300">
                Primary focus: <span className="text-white">{results.primaryIssue}</span>
              </p>
            )}

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              <ResultCard
                title="Guilt-free spending power"
                primaryValue={formatCurrency(inputs.guiltFree, 0)}
                primaryLabel="Monthly guilt-free budget"
                items={[
                  {
                    label: "Daily",
                    value: formatCurrency(results.guiltFreeDaily, 0),
                  },
                  {
                    label: "Weekly",
                    value: formatCurrency(results.guiltFreeWeekly, 0),
                  },
                  {
                    label: "Unallocated",
                    value:
                      results.unallocated >= 0
                        ? formatCurrency(results.unallocated, 0)
                        : `-${formatCurrency(Math.abs(results.unallocated), 0)}`,
                  },
                ]}
                variant="green"
              />
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
                <p className="text-sm text-neutral-400">Budget check</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(results.totalAllocated, 0)} allocated
                </p>
                <p
                  className={`mt-2 text-sm ${
                    results.unallocated < 0
                      ? "text-rose-300"
                      : "text-emerald-200"
                  }`}
                >
                  {results.unallocated < 0
                    ? `You are ${formatCurrency(
                        Math.abs(results.unallocated),
                        0
                      )} over budget.`
                    : `You have ${formatCurrency(
                        results.unallocated,
                        0
                      )} left to assign.`}
                </p>
                <p className="mt-3 text-sm text-neutral-500">
                  Balanced plans keep each category within the target ranges.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {results.categories.map((category) => (
                <CategoryCard key={`${category.name}-card`} category={category} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 shadow-lg shadow-black/20">
            <h2 className="text-xl font-semibold text-white">Suggestions</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Tiny shifts add up quickly. Start with one move that feels doable.
            </p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-300">
              {results.suggestions.length === 0 ? (
                <li className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-100">
                  Your plan is dialed in. Keep automating and enjoy the guilt-free
                  spending.
                </li>
              ) : (
                results.suggestions.map((suggestion) => (
                  <li
                    key={suggestion}
                    className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                  >
                    {suggestion}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <details className="rounded-2xl bg-neutral-900/60 p-6">
            <summary className="cursor-pointer text-lg font-semibold text-white">
              How we calculate this
            </summary>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>
                The Conscious Spending Plan is an alternative to traditional
                50/30/20 budgets. It prioritizes fixed costs (50-60%), investments
                (10-15%), savings goals (5-10%), and guilt-free spending (20-35%).
              </p>
              <p>
                If your percentages don&apos;t fit the ranges, the fix is simple: lower
                fixed costs, boost income, or adjust other categories. The goal is
                to automate the essentials so you can enjoy what you love without
                stress.
              </p>
              <p>
                Learn more about the philosophy from{" "}
                <a
                  href="https://www.iwillteachyoutoberich.com/conscious-spending/"
                  className="text-emerald-300 underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ramit Sethi
                </a>
                .
              </p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
