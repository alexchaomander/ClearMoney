"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Plus, Trash2, Trophy } from "lucide-react";
import { AppShell, MethodologySection, SliderInput } from "@/components/shared";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { formatCurrency } from "@/lib/shared/formatters";
import { useAccounts } from "@/lib/strata/hooks";
import { calculateDebtPayoff } from "@/lib/calculators/debt-destroyer/calculations";
import type { DebtItem } from "@/lib/calculators/debt-destroyer/types";
import { useToolPreset } from "@/lib/strata/presets";

// Default debts if no connected accounts
const DEFAULT_DEBTS: DebtItem[] = [
  {
    id: "demo-cc-1",
    name: "Credit Card 1",
    balance: 5000,
    interestRate: 22.9,
    minimumPayment: 150,
  },
  {
    id: "demo-cc-2",
    name: "Personal Loan",
    balance: 12000,
    interestRate: 9.5,
    minimumPayment: 300,
  },
  {
    id: "demo-car",
    name: "Auto Loan",
    balance: 18000,
    interestRate: 6.5,
    minimumPayment: 450,
  },
];

function MethodCard({
  title,
  subtitle,
  interest,
  time,
  isRecommended,
  colorClass,
}: {
  title: string;
  subtitle: string;
  interest: number;
  time: number;
  isRecommended?: boolean;
  colorClass: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-neutral-900 p-6 ${
        isRecommended ? "border-emerald-500/50 ring-1 ring-emerald-500/20" : "border-neutral-800"
      }`}
    >
      {isRecommended && (
        <div className="absolute right-0 top-0 rounded-bl-xl bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300">
          Mathematically Optimal
        </div>
      )}
      <div className="mb-4">
        <h3 className={`text-lg font-bold ${colorClass}`}>{title}</h3>
        <p className="text-sm text-neutral-400">{subtitle}</p>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-neutral-400">Total Interest</span>
          <span className="font-semibold text-white">{formatCurrency(interest)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-400">Debt-Free In</span>
          <span className="font-semibold text-white">
            {Math.floor(time / 12)}y {time % 12}m
          </span>
        </div>
      </div>
    </div>
  );
}

export function Calculator() {
  const { data: accountsData, isSuccess: accountsLoaded } = useAccounts();
  const [dataApplied, setDataApplied] = useState(false);
  const { preset } = useToolPreset<{ debts: DebtItem[]; extraPayment: number }>("debt-destroyer");
  
  // Transform connected debt accounts into calculator format
  const connectedDebts: DebtItem[] = useMemo(() => {
    if (!accountsData?.debt_accounts) return [];
    return accountsData.debt_accounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      balance: Number(acc.balance),
      interestRate: Number(acc.interest_rate) * 100, // API returns decimal (0.22), calculator uses percentage (22)
      minimumPayment: Number(acc.minimum_payment),
    }));
  }, [accountsData]);

  const [debts, setDebts] = useState<DebtItem[]>(
    () => (preset?.debts as DebtItem[] | undefined) ?? DEFAULT_DEBTS
  );
  const [monthlyExtra, setMonthlyExtra] = useState(
    () => (preset?.extraPayment as number | undefined) ?? 500
  );

  useEffect(() => {
    if (preset?.debts) {
      setDebts(preset.debts as DebtItem[]);
    }
    if (preset?.extraPayment != null) {
      setMonthlyExtra(preset.extraPayment as number);
    }
  }, [preset]);

  const handleLoadData = useCallback(() => {
    if (connectedDebts.length === 0) return;
    setDebts(connectedDebts);
    setDataApplied(true);
  }, [connectedDebts]);

  const results = useMemo(() => {
    return calculateDebtPayoff({ debts, monthlyExtraPayment: monthlyExtra });
  }, [debts, monthlyExtra]);

  const addDebt = () => {
    setDebts([
      ...debts,
      {
        id: `manual-${Date.now()}`,
        name: "New Debt",
        balance: 1000,
        interestRate: 15,
        minimumPayment: 25,
      },
    ]);
  };

  const updateDebt = (index: number, field: keyof DebtItem, value: string | number) => {
    const newDebts = [...debts];
    newDebts[index] = { ...newDebts[index], [field]: value };
    setDebts(newDebts);
  };

  const removeDebt = (index: number) => {
    setDebts(debts.filter((_, i) => i !== index));
  };

  const motivationCost = results.motivationCost;
  const timeDiff = Math.abs(results.timeSaved);

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-orange-400">
            Debt Destroyer
          </p>
          <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Snowball or Avalanche?
          </h1>
          <p className="mt-4 text-lg text-neutral-400">
            See the math behind the two most popular debt payoff strategies. 
            Choose between psychological wins (Snowball) or mathematical optimization (Avalanche).
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Input Column */}
          <div className="space-y-6">
            <LoadMyDataBanner
              isLoaded={accountsLoaded}
              hasData={connectedDebts.length > 0}
              isApplied={dataApplied}
              onApply={handleLoadData}
            />
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Your Debts</h2>
              <div className="space-y-4">
                {debts.map((debt, index) => (
                  <div key={debt.id} className="relative rounded-xl border border-neutral-800 bg-neutral-950/50 p-4 transition-all hover:border-neutral-700">
                    <div className="mb-3 flex items-center justify-between">
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(index, "name", e.target.value)}
                        className="bg-transparent font-medium text-white focus:outline-none"
                      />
                      <button
                        onClick={() => removeDebt(index)}
                        className="text-neutral-500 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs text-neutral-500">Balance</label>
                        <div className="flex items-center text-neutral-300">
                          <span className="mr-1">$</span>
                          <input
                            type="number"
                            min={0}
                            value={debt.balance}
                            onChange={(e) => updateDebt(index, "balance", Math.max(0, Number(e.target.value)))}
                            className="w-full bg-transparent focus:outline-none focus:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500">Rate (%)</label>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={debt.interestRate}
                          onChange={(e) => updateDebt(index, "interestRate", Math.min(100, Math.max(0, Number(e.target.value))))}
                          className="w-full bg-transparent text-neutral-300 focus:outline-none focus:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-neutral-500">Min Pay</label>
                        <div className="flex items-center text-neutral-300">
                          <span className="mr-1">$</span>
                          <input
                            type="number"
                            min={0}
                            value={debt.minimumPayment}
                            onChange={(e) => updateDebt(index, "minimumPayment", Math.max(0, Number(e.target.value)))}
                            className="w-full bg-transparent focus:outline-none focus:text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addDebt}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 p-4 text-sm text-neutral-400 hover:border-neutral-600 hover:bg-neutral-800/50 hover:text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add another debt
                </button>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white mb-2">Monthly Budget</h2>
              <p className="text-sm text-neutral-400 mb-6">
                How much extra can you pay towards debt each month (above minimums)?
              </p>
              <SliderInput
                label="Extra Monthly Payment"
                value={monthlyExtra}
                onChange={setMonthlyExtra}
                min={0}
                max={5000}
                step={50}
                format="currency"
              />
            </div>
          </div>

          {/* Results Column */}
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <MethodCard
                title="Snowball"
                subtitle="Smallest balance first"
                interest={results.snowball.totalInterest}
                time={results.snowball.monthsToPayoff}
                colorClass="text-blue-400"
              />
              <MethodCard
                title="Avalanche"
                subtitle="Highest interest first"
                interest={results.avalanche.totalInterest}
                time={results.avalanche.monthsToPayoff}
                isRecommended={true}
                colorClass="text-orange-400"
              />
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-full bg-orange-500/10 p-2">
                  <Trophy className="h-5 w-5 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-white">The Verdict</h3>
              </div>
              
              <div className="space-y-4">
                {motivationCost > 100 ? (
                  <p className="text-neutral-300">
                    The <strong>Avalanche method</strong> will save you <span className="font-bold text-emerald-400">{formatCurrency(motivationCost)}</span> in interest compared to Snowball.
                    {timeDiff > 0 && <span> It will also get you out of debt {timeDiff} months faster.</span>}
                  </p>
                ) : (
                  <p className="text-neutral-300">
                    The difference is negligible (<span className="text-neutral-400">{formatCurrency(motivationCost)}</span>). 
                    You should choose the <strong>Snowball method</strong> for the psychological wins of eliminating small debts quickly.
                  </p>
                )}

                <div className="rounded-xl bg-neutral-950 p-4 text-sm">
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-400">Avalanche Payoff Date</span>
                    <span className="text-white">{results.avalanche.payoffDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Snowball Payoff Date</span>
                    <span className="text-white">{results.snowball.payoffDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            <MethodologySection>
              <p>
                <strong>Debt Snowball:</strong> Prioritizes paying off the smallest balances first. This provides &quot;quick wins&quot; which can improve motivation and adherence to the plan, even if it costs slightly more in interest.
              </p>
              <p>
                <strong>Debt Avalanche:</strong> Prioritizes paying off the highest interest rate debts first. This is mathematically optimal as it minimizes the total interest paid over the life of the loans.
              </p>
              <p>
                Calculations assume minimum payments are made on all debts every month, with the &quot;Extra Payment&quot; applied entirely to the highest priority debt according to the chosen strategy.
              </p>
            </MethodologySection>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
