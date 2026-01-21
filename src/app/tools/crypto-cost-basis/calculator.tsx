"use client";

import { useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import {
  AppShell,
  MethodologySection,
  VerdictCard,
} from "@/components/shared/AppShell";
import {
  formatCurrency,
  formatPercent,
} from "@/lib/shared/formatters";
import {
  FILING_STATUS_OPTIONS,
  METHOD_DETAILS,
  PRIMARY_COLOR,
  STATE_OPTIONS,
} from "@/lib/calculators/crypto-cost-basis/constants";
import { calculate } from "@/lib/calculators/crypto-cost-basis/calculations";
import type {
  CalculatorInputs,
  FilingStatus,
} from "@/lib/calculators/crypto-cost-basis/types";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  numberOfWallets: 3,
  totalHoldings: 50000,
  totalCostBasis: 30000,
  plannedSaleAmount: 10000,
  holdingPeriodMix: 50,
  ordinaryIncome: 100000,
  filingStatus: "single",
  state: "CA",
  applyTransitionalRelief: true,
};

const METHOD_ORDER = ["fifo", "lifo", "hifo", "specificId"] as const;

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => calculate(inputs), [inputs]);

  const fifoTax = results.methodComparison.fifo.estimatedTax;
  const bestMethod = results.bestMethod;
  const bestTax =
    Object.values(results.methodComparison).find(
      (method) => method.method === bestMethod
    )?.estimatedTax ?? fifoTax;

  const walletImpact = results.walletByWalletImpact.difference;
  const walletImpactLabel =
    walletImpact >= 0 ? "Additional tax" : "Potential savings";
  const walletImpactType = walletImpact >= 0 ? "negative" : "positive";

  const verdictDescription =
    results.taxSavingsVsFIFO > 0
      ? `You could save about ${formatCurrency(
          results.taxSavingsVsFIFO,
          0
        )} compared with FIFO.`
      : "FIFO is already your lowest estimated tax method with these inputs.";

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p
            className="text-sm uppercase tracking-[0.3em] mb-3"
            style={{ color: PRIMARY_COLOR }}
          >
            Crypto Cost Basis Tracker
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Compare tax methods before the 2025 IRS wallet-by-wallet rules
          </h1>
          <p className="text-lg text-neutral-400">
            Model FIFO, LIFO, HIFO, and Specific ID strategies, then see how Form
            1099-DA reporting changes your tax bill.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Portfolio snapshot
                </h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Number of wallets/exchanges"
                    value={inputs.numberOfWallets}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        numberOfWallets: value,
                      }))
                    }
                    min={1}
                    max={20}
                    step={1}
                    format="number"
                    description="Each wallet must be tracked separately starting in 2025"
                  />
                  <SliderInput
                    label="Total crypto holdings"
                    value={inputs.totalHoldings}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, totalHoldings: value }))
                    }
                    min={0}
                    max={1000000}
                    step={1000}
                    format="currency"
                  />
                  <SliderInput
                    label="Total cost basis"
                    value={inputs.totalCostBasis}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, totalCostBasis: value }))
                    }
                    min={0}
                    max={1000000}
                    step={1000}
                    format="currency"
                    description="What you originally paid for the holdings"
                  />
                </div>
                <div className="mt-6 rounded-xl bg-neutral-950 border border-neutral-800 px-4 py-3">
                  <p className="text-sm text-neutral-400">Unrealized gain/loss</p>
                  <p className="text-lg font-semibold text-white">
                    {formatCurrency(results.unrealizedGain, 0)}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Sale assumptions
                </h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Planned sale amount"
                    value={inputs.plannedSaleAmount}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        plannedSaleAmount: value,
                      }))
                    }
                    min={0}
                    max={500000}
                    step={500}
                    format="currency"
                    description="How much crypto you plan to sell"
                  />
                  <SliderInput
                    label="Holding period mix (long-term %)"
                    value={inputs.holdingPeriodMix}
                    onChange={(value) =>
                      setInputs((prev) => ({
                        ...prev,
                        holdingPeriodMix: value,
                      }))
                    }
                    min={0}
                    max={100}
                    step={5}
                    format="percent"
                    description="Long-term = held longer than 1 year"
                  />
                  <div className="flex items-start gap-3 rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3">
                    <input
                      id="transitional-relief"
                      type="checkbox"
                      checked={inputs.applyTransitionalRelief}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          applyTransitionalRelief: event.target.checked,
                        }))
                      }
                      className="mt-1 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-orange-500 focus:ring-orange-500"
                    />
                    <label
                      htmlFor="transitional-relief"
                      className="text-sm text-neutral-300"
                    >
                      Apply the Rev. Proc. 2024-28 transitional relief election
                      (allocate legacy basis on Jan 1, 2025).
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Income & tax profile
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">
                      Filing status
                    </label>
                    <select
                      value={inputs.filingStatus}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          filingStatus: event.target.value as FilingStatus,
                        }))
                      }
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {FILING_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <SliderInput
                    label="Ordinary income"
                    value={inputs.ordinaryIncome}
                    onChange={(value) =>
                      setInputs((prev) => ({ ...prev, ordinaryIncome: value }))
                    }
                    min={0}
                    max={1000000}
                    step={5000}
                    format="currency"
                    description="Used to estimate your marginal tax bracket"
                  />
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">
                      State
                    </label>
                    <select
                      value={inputs.state}
                      onChange={(event) =>
                        setInputs((prev) => ({
                          ...prev,
                          state: event.target.value,
                        }))
                      }
                      className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {STATE_OPTIONS.map((option) => (
                        <option key={option.code} value={option.code}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <VerdictCard
              verdict={bestMethod}
              description={verdictDescription}
              type={results.taxSavingsVsFIFO > 0 ? "positive" : "neutral"}
            />

            <ResultCard
              title="Tax savings summary"
              primaryValue={formatCurrency(results.taxSavingsVsFIFO, 0)}
              primaryLabel="Estimated savings vs FIFO"
              items={[
                {
                  label: "Best method tax",
                  value: formatCurrency(bestTax, 0),
                  highlight: true,
                },
                {
                  label: "FIFO tax",
                  value: formatCurrency(fifoTax, 0),
                },
                {
                  label: "Sale amount modeled",
                  value: formatCurrency(
                    Math.min(inputs.plannedSaleAmount, inputs.totalHoldings),
                    0
                  ),
                },
              ]}
              variant="amber"
            />

            <ResultCard
              title="Wallet-by-wallet impact"
              primaryValue={formatCurrency(walletImpact, 0)}
              primaryLabel={walletImpactLabel}
              items={[
                {
                  label: "Universal FIFO tax",
                  value: formatCurrency(
                    results.walletByWalletImpact.universalMethod.totalTax,
                    0
                  ),
                },
                {
                  label: "Wallet-by-wallet tax",
                  value: formatCurrency(
                    results.walletByWalletImpact.walletByWallet.totalTax,
                    0
                  ),
                  highlight: true,
                },
              ]}
              variant="amber"
              footer={
                <p
                  className={cn(
                    "text-xs",
                    walletImpactType === "negative"
                      ? "text-red-300"
                      : "text-emerald-300"
                  )}
                >
                  {results.walletByWalletImpact.explanation}
                </p>
              }
            />

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Method comparison
              </h3>
              <div className="space-y-4">
                {METHOD_ORDER.map((methodKey) => {
                  const method = results.methodComparison[methodKey];
                  return (
                    <div
                      key={methodKey}
                      className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4 last:border-none last:pb-0"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {METHOD_DETAILS[methodKey].label}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {METHOD_DETAILS[methodKey].description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-white">
                          {formatCurrency(method.estimatedTax, 0)}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {formatCurrency(method.totalGain, 0)} gain ·{" "}
                          {formatPercent(method.effectiveRate)} effective
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recommendations
              </h3>
              <ul className="space-y-3 text-sm text-neutral-300">
                {results.recommendations.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span style={{ color: PRIMARY_COLOR }}>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {results.warnings.length > 0 && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/30 p-6">
                <h3 className="text-lg font-semibold text-red-300 mb-4">
                  IRS rule reminders
                </h3>
                <ul className="space-y-3 text-sm text-red-200">
                  {results.warnings.map((item, index) => (
                    <li key={index} className="flex gap-2">
                      <span>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl space-y-6">
          <MethodologySection>
            <p>
              We model your holdings as lots spread across each wallet, then
              apply FIFO, LIFO, HIFO, or Specific ID rules to choose which lots
              are sold. Short-term gains are taxed at ordinary income rates,
              while long-term gains use the 0/15/20% capital gains brackets.
            </p>
            <p>
              We estimate Net Investment Income Tax (NIIT) when total income
              exceeds IRS thresholds, and we add a state tax estimate based on
              your selected state. Transitional relief reduces the difference
              between universal and wallet-by-wallet methods to simulate a
              one-time basis reallocation.
            </p>
            <p>
              All numbers are estimates for planning purposes. Always consult a
              tax professional for actual filing decisions.
            </p>
          </MethodologySection>

          <MethodologySection title="2025-2026 IRS changes in plain English">
            <ul className="space-y-3 text-sm text-neutral-300">
              <li>
                <strong className="text-white">Form 1099-DA:</strong> Brokers
                must report gross proceeds starting January 1, 2025.
              </li>
              <li>
                <strong className="text-white">Wallet-by-wallet:</strong> You
                can no longer pool basis across exchanges. Each wallet gets its
                own lot tracking.
              </li>
              <li>
                <strong className="text-white">Basis reporting:</strong> Brokers
                start reporting basis for covered assets in 2026, but you need
                your records for 2025 sales.
              </li>
              <li>
                <strong className="text-white">Transitional relief:</strong> You
                can allocate unused basis to remaining assets once on January 1,
                2025.
              </li>
            </ul>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
