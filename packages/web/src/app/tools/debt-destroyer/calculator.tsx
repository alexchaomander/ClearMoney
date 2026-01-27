"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/debt-destroyer/calculations";
import type {
  CalculatorInputs,
  Debt,
  MethodResult,
  PayoffEvent,
} from "@/lib/calculators/debt-destroyer/types";

const DEFAULT_DEBTS: Debt[] = [
  {
    id: "debt-1",
    name: "Credit Card",
    balance: 5200,
    interestRate: 22.9,
    minimumPayment: 145,
  },
  {
    id: "debt-2",
    name: "Car Loan",
    balance: 14000,
    interestRate: 6.2,
    minimumPayment: 275,
  },
];

const DEFAULT_INPUTS: CalculatorInputs = {
  debts: DEFAULT_DEBTS,
  extraPayment: 500,
};

const DEBT_LIMITS = {
  min: 2,
  max: 10,
};

const FIELD_LIMITS = {
  balance: { min: 1, max: 500000 },
  interestRate: { min: 0, max: 30 },
  minimumPayment: { min: 10, max: 50000 },
};

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const totalMinimums = useMemo(
    () => inputs.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0),
    [inputs.debts]
  );

  const results = useMemo(() => calculate(inputs), [inputs]);
  const maxMonths = Math.max(
    results.snowball.totalMonths,
    results.avalanche.totalMonths
  );

  const handleDebtChange = <K extends keyof Debt>(
    id: string,
    key: K,
    value: Debt[K]
  ) => {
    setInputs((prev) => ({
      ...prev,
      debts: prev.debts.map((debt) =>
        debt.id === id ? { ...debt, [key]: value } : debt
      ),
    }));
  };

  const addDebt = () => {
    if (inputs.debts.length >= DEBT_LIMITS.max) {
      return;
    }

    const nextId = `debt-${Date.now()}`;
    setInputs((prev) => ({
      ...prev,
      debts: [
        ...prev.debts,
        {
          id: nextId,
          name: "New Debt",
          balance: 2500,
          interestRate: 12.5,
          minimumPayment: 75,
        },
      ],
    }));
  };

  const removeDebt = (id: string) => {
    if (inputs.debts.length <= DEBT_LIMITS.min) {
      return;
    }

    setInputs((prev) => ({
      ...prev,
      debts: prev.debts.filter((debt) => debt.id !== id),
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-red-400">
            Debt Strategy Showdown
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Debt Destroyer
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            Snowball vs Avalanche—see which strategy wins for YOUR debts.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto flex max-w-4xl flex-col gap-8">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Your Debts</h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Add between {DEBT_LIMITS.min} and {DEBT_LIMITS.max} debts to
                  compare strategies.
                </p>
              </div>
              <button
                type="button"
                onClick={addDebt}
                className="rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:border-red-400 hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={inputs.debts.length >= DEBT_LIMITS.max}
              >
                + Add Debt
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {inputs.debts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onChange={handleDebtChange}
                  onRemove={removeDebt}
                  canRemove={inputs.debts.length > DEBT_LIMITS.min}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Extra Monthly Payment
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Total monthly payment: {formatCurrency(totalMinimums)} minimums
                  + {formatCurrency(inputs.extraPayment)} extra.
                </p>
              </div>
              <div className="rounded-full bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200">
                {formatCurrency(totalMinimums + inputs.extraPayment, 0)} / month
              </div>
            </div>

            <div className="mt-6">
              <SliderInput
                label="Extra Monthly Payment"
                value={inputs.extraPayment}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, extraPayment: value }))
                }
                min={0}
                max={5000}
                step={50}
                format="currency"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ComparisonCard
              title="Snowball"
              accent="red"
              icon="❄️"
              result={results.snowball}
              firstPayoff={results.firstPayoffSnowball}
              maxMonths={maxMonths}
            />
            <ComparisonCard
              title="Avalanche"
              accent="amber"
              icon="🏔️"
              result={results.avalanche}
              firstPayoff={results.firstPayoffAvalanche}
              maxMonths={maxMonths}
            />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
            <h3 className="text-lg font-semibold text-white">
              Strategy Comparison
            </h3>
            <div className="mt-4 grid gap-4 text-sm text-neutral-300 sm:grid-cols-2">
              <div className="rounded-xl bg-neutral-950/60 p-4">
                <p className="text-neutral-400">Interest saved with avalanche</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {formatCurrency(results.interestSaved, 0)}
                </p>
              </div>
              <div className="rounded-xl bg-neutral-950/60 p-4">
                <p className="text-neutral-400">Snowball first win advantage</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {results.monthsDifference > 0
                    ? `${results.monthsDifference} months sooner`
                    : results.monthsDifference === 0
                      ? "Same month"
                      : `${Math.abs(results.monthsDifference)} months later`}
                </p>
              </div>
            </div>
            <p className="mt-4 text-base text-neutral-300">
              {results.recommendation}
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <PayoffTimeline
              title="Snowball Payoff Timeline"
              accent="red"
              events={results.snowball.payoffOrder}
              totalMonths={results.snowball.totalMonths}
            />
            <PayoffTimeline
              title="Avalanche Payoff Timeline"
              accent="amber"
              events={results.avalanche.payoffOrder}
              totalMonths={results.avalanche.totalMonths}
            />
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <details className="rounded-2xl bg-neutral-900/60 p-6">
            <summary className="cursor-pointer text-lg font-semibold text-white">
              How we calculate the payoff strategies
            </summary>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>
                The debt snowball method focuses your extra payment on the
                smallest balance first. It delivers quick wins that build
                momentum, even if it costs more interest over time.
              </p>
              <p>
                The debt avalanche method applies extra payments to the highest
                interest rate first. It minimizes total interest and usually
                saves money, but it can take longer to see the first payoff.
              </p>
              <p>
                Personal finance is 80% behavior. Pick the method that keeps you
                consistent—and use this calculator to see the trade-offs.
              </p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}

type DebtCardProps = {
  debt: Debt;
  onChange: <K extends keyof Debt>(id: string, key: K, value: Debt[K]) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
};

function DebtCard({ debt, onChange, onRemove, canRemove }: DebtCardProps) {
  const handleNumberChange = (
    key: "balance" | "interestRate" | "minimumPayment",
    rawValue: string
  ) => {
    const value = Number(rawValue);
    const safeValue = Number.isNaN(value) ? 0 : value;
    const limits = FIELD_LIMITS[key];
    const clamped = Math.min(limits.max, Math.max(limits.min, safeValue));
    onChange(debt.id, key, clamped);
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="text"
          value={debt.name}
          onChange={(event) => onChange(debt.id, "name", event.target.value)}
          maxLength={30}
          className="w-full flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white outline-none transition focus:border-red-400"
          aria-label="Debt name"
        />
        <button
          type="button"
          onClick={() => onRemove(debt.id)}
          className="rounded-lg border border-neutral-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-400 transition hover:border-red-400 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canRemove}
        >
          Remove
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-neutral-400">
          Balance
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white">
            <span className="text-neutral-500">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={FIELD_LIMITS.balance.min}
              max={FIELD_LIMITS.balance.max}
              value={debt.balance}
              onChange={(event) =>
                handleNumberChange("balance", event.target.value)
              }
              className="w-full bg-transparent outline-none"
            />
          </div>
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-neutral-400">
          Interest rate
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white">
            <input
              type="number"
              inputMode="decimal"
              min={FIELD_LIMITS.interestRate.min}
              max={FIELD_LIMITS.interestRate.max}
              step={0.1}
              value={debt.interestRate}
              onChange={(event) =>
                handleNumberChange("interestRate", event.target.value)
              }
              className="w-full bg-transparent outline-none"
            />
            <span className="text-neutral-500">%</span>
          </div>
        </label>
        <label className="flex flex-col gap-2 text-xs uppercase tracking-wide text-neutral-400">
          Minimum payment
          <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white">
            <span className="text-neutral-500">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={FIELD_LIMITS.minimumPayment.min}
              max={FIELD_LIMITS.minimumPayment.max}
              value={debt.minimumPayment}
              onChange={(event) =>
                handleNumberChange("minimumPayment", event.target.value)
              }
              className="w-full bg-transparent outline-none"
            />
          </div>
        </label>
      </div>

      <div className="mt-3 text-xs text-neutral-500">
        Balance: {formatCurrency(debt.balance)} · Rate: {" "}
        {formatPercent(debt.interestRate / 100)} · Minimum: {" "}
        {formatCurrency(debt.minimumPayment)}
      </div>
    </div>
  );
}

type ComparisonCardProps = {
  title: string;
  icon: string;
  accent: "red" | "amber";
  result: MethodResult;
  firstPayoff: PayoffEvent;
  maxMonths: number;
};

function ComparisonCard({
  title,
  icon,
  accent,
  result,
  firstPayoff,
  maxMonths,
}: ComparisonCardProps) {
  const segments = result.payoffOrder.map((event, index) => {
    const previousMonth =
      index === 0 ? 0 : result.payoffOrder[index - 1].month;
    return {
      name: event.debtName,
      months: event.month - previousMonth,
    };
  });

  const accentStyles =
    accent === "red"
      ? {
          border: "border-red-400/50",
          text: "text-red-200",
          bar: "bg-red-500",
          chip: "bg-red-500/10 text-red-200",
        }
      : {
          border: "border-amber-400/50",
          text: "text-amber-200",
          bar: "bg-amber-400",
          chip: "bg-amber-400/10 text-amber-200",
        };

  return (
    <div className={`rounded-2xl border ${accentStyles.border} bg-neutral-900 p-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${accentStyles.chip}`}
        >
          {result.totalMonths ? `${result.totalMonths} months` : "N/A"}
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-neutral-300">
        <p className="text-2xl font-semibold text-white">
          Debt-free in {formatNumber(result.totalMonths)} months
        </p>
        <p>Total interest: {formatCurrency(result.totalInterest, 0)}</p>
        <p>
          First win: {firstPayoff.debtName || "N/A"} in {" "}
          {firstPayoff.month} months
        </p>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-neutral-500">
          <span>Payoff momentum</span>
          <span>{maxMonths ? formatNumber(result.totalMonths) : "0"} mo</span>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-neutral-800">
          {segments.length === 0 ? (
            <div className={`h-full ${accentStyles.bar}`} style={{ width: "0%" }} />
          ) : (
            segments.map((segment) => (
              <div
                key={segment.name}
                className={`${accentStyles.bar} opacity-80`}
                style={{
                  width: maxMonths
                    ? `${(segment.months / result.totalMonths) * 100}%`
                    : "0%",
                }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

type PayoffTimelineProps = {
  title: string;
  accent: "red" | "amber";
  events: PayoffEvent[];
  totalMonths: number;
};

function PayoffTimeline({ title, accent, events, totalMonths }: PayoffTimelineProps) {
  const accentClass = accent === "red" ? "bg-red-500/70" : "bg-amber-400/70";

  return (
    <div className="rounded-2xl bg-neutral-900 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-neutral-400">
        {totalMonths ? `All debts cleared in ${totalMonths} months.` : "Add debts to see the timeline."}
      </p>

      <div className="mt-4 space-y-4">
        {events.length === 0 ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-4 text-sm text-neutral-500">
            No payoff events yet.
          </div>
        ) : (
          events.map((event) => (
            <div key={`${event.debtName}-${event.month}`}>
              <div className="flex items-center justify-between text-sm text-neutral-300">
                <span>{event.debtName}</span>
                <span>Month {event.month}</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-neutral-800">
                <div
                  className={`h-full rounded-full ${accentClass}`}
                  style={{
                    width: totalMonths
                      ? `${Math.min(100, (event.month / totalMonths) * 100)}%`
                      : "0%",
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
