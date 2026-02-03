"use client";

import { useCallback, useMemo, useState } from "react";
import { SliderInput } from "@/components/shared/SliderInput";
import { LoadMyDataBanner } from "@/components/tools/LoadMyDataBanner";
import { useMemoryPreFill } from "@/hooks/useMemoryPreFill";
import {
  formatNumber,
  formatPercent,
  formatWithSign,
} from "@/lib/shared/formatters";
import {
  analyzeProfile,
  simulate,
} from "@/lib/calculators/credit-score-simulator/calculations";
import type {
  CreditProfile,
  SimulationAction,
  FactorStatus,
} from "@/lib/calculators/credit-score-simulator/types";

const DEFAULT_PROFILE: CreditProfile = {
  estimatedScore: 700,
  totalCreditLimit: 20000,
  currentBalance: 3000,
  oldestAccountYears: 5,
  totalAccounts: 4,
  recentInquiries: 1,
  missedPayments: 0,
};

const DEFAULT_ACTIONS = {
  payDownDebt: {
    enabled: false,
    amount: 2000,
  },
  openNewCard: {
    enabled: false,
    creditLimit: 5000,
  },
  closeAccount: {
    enabled: false,
    accountAge: 3,
  },
  missPayment: {
    enabled: false,
  },
  authorizedUser: {
    enabled: false,
    accountAge: 5,
    creditLimit: 12000,
  },
};

const STATUS_STYLES: Record<FactorStatus["status"], string> = {
  excellent: "bg-emerald-500/15 text-emerald-300",
  good: "bg-green-500/15 text-green-300",
  fair: "bg-amber-500/15 text-amber-300",
  poor: "bg-rose-500/15 text-rose-300",
};

const SCORE_MIN = 300;
const SCORE_MAX = 850;

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const clampedScore = Math.min(SCORE_MAX, Math.max(SCORE_MIN, score));
  const progress = (clampedScore - SCORE_MIN) / (SCORE_MAX - SCORE_MIN);
  const dashOffset = 100 - progress * 100;

  return (
    <div className="rounded-2xl bg-neutral-900 p-6 text-center">
      <div className="relative mx-auto h-32 w-64">
        <svg viewBox="0 0 200 120" className="h-full w-full">
          <path
            d="M10 110 A90 90 0 0 1 190 110"
            stroke="#262626"
            strokeWidth="14"
            fill="none"
            pathLength={100}
          />
          <path
            d="M10 110 A90 90 0 0 1 190 110"
            stroke="#8b5cf6"
            strokeWidth="14"
            fill="none"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
          <div className="text-3xl font-semibold text-white">
            {formatNumber(clampedScore)}
          </div>
          <div className="text-sm text-neutral-400">{label}</div>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
        <span>{SCORE_MIN}</span>
        <span>{SCORE_MAX}</span>
      </div>
    </div>
  );
}

function FactorCard({ factor }: { factor: FactorStatus }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">{factor.name}</h3>
          <p className="text-xs text-neutral-500">{factor.currentValue}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_STYLES[factor.status]}`}
        >
          {factor.status}
        </span>
      </div>
      <p className="mt-3 text-sm text-neutral-400">{factor.description}</p>
      <p className="mt-2 text-xs text-neutral-500">Weight: {factor.weight}%</p>
    </div>
  );
}

function ActionToggle({
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-neutral-400">{description}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
            enabled ? "bg-purple-500" : "bg-neutral-700"
          }`}
          aria-pressed={enabled}
        >
          <span
            className={`h-5 w-5 rounded-full bg-white transition ${
              enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      {enabled && children ? <div className="mt-5 space-y-4">{children}</div> : null}
    </div>
  );
}

function ImpactRange({ min, max }: { min: number; max: number }) {
  const range = 120;
  const clamp = (value: number) => Math.max(-range, Math.min(range, value));
  const minPercent = ((clamp(min) + range) / (range * 2)) * 100;
  const maxPercent = ((clamp(max) + range) / (range * 2)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>-{range}</span>
        <span>+{range}</span>
      </div>
      <div className="relative h-2 rounded-full bg-neutral-800">
        <div
          className="absolute top-0 h-2 rounded-full bg-purple-500"
          style={{
            left: `${Math.min(minPercent, maxPercent)}%`,
            width: `${Math.abs(maxPercent - minPercent)}%`,
          }}
        />
        <div
          className="absolute top-1/2 h-3 w-0.5 -translate-y-1/2 bg-white"
          style={{ left: "50%" }}
        />
      </div>
      <div className="flex items-center justify-between text-sm text-neutral-200">
        <span>{formatWithSign(min, (value) => formatNumber(value))}</span>
        <span>{formatWithSign(max, (value) => formatNumber(value))}</span>
      </div>
    </div>
  );
}

export function Calculator() {
  const {
    preFilledFields,
    isLoaded: memoryLoaded,
    hasDefaults: memoryHasDefaults,
    applyTo: applyMemoryDefaults,
  } = useMemoryPreFill<CreditProfile>({});

  const [profile, setProfile] = useState<CreditProfile>(DEFAULT_PROFILE);
  const [actions, setActions] = useState(DEFAULT_ACTIONS);
  const handleLoadData = useCallback(
    () => applyMemoryDefaults(setProfile),
    [applyMemoryDefaults]
  );

  const factors = useMemo(() => analyzeProfile(profile), [profile]);

  const activeActions = useMemo<SimulationAction[]>(() => {
    const selected: SimulationAction[] = [];
    if (actions.payDownDebt.enabled) {
      selected.push({
        type: "payDownDebt",
        params: { amount: actions.payDownDebt.amount },
      });
    }
    if (actions.openNewCard.enabled) {
      selected.push({
        type: "openNewCard",
        params: { creditLimit: actions.openNewCard.creditLimit },
      });
    }
    if (actions.closeAccount.enabled) {
      selected.push({
        type: "closeAccount",
        params: { accountAge: actions.closeAccount.accountAge },
      });
    }
    if (actions.missPayment.enabled) {
      selected.push({
        type: "missPayment",
        params: {},
      });
    }
    if (actions.authorizedUser.enabled) {
      selected.push({
        type: "authorizedUser",
        params: {
          accountAge: actions.authorizedUser.accountAge,
          creditLimit: actions.authorizedUser.creditLimit,
        },
      });
    }
    return selected;
  }, [actions]);

  const results = useMemo(() => {
    return activeActions.length > 0 ? simulate(profile, activeActions) : null;
  }, [profile, activeActions]);

  const utilization =
    profile.totalCreditLimit > 0
      ? profile.currentBalance / profile.totalCreditLimit
      : 0;

  return (
    <div className="min-h-screen bg-neutral-950">
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Credit Score Simulator
          </h1>
          <p className="mt-3 text-lg text-neutral-400">
            See how actions might affect your score—no account required.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-5xl space-y-8">
          <LoadMyDataBanner
            isLoaded={memoryLoaded}
            hasData={memoryHasDefaults}
            isApplied={preFilledFields.size > 0}
            onApply={handleLoadData}
          />
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
            <ScoreGauge score={profile.estimatedScore} label="Current estimate" />
            <div className="grid gap-4 sm:grid-cols-2">
              {factors.map((factor) => (
                <FactorCard key={factor.name} factor={factor} />
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">
              Current Credit Profile
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Adjust your current credit details to reflect your baseline.
            </p>
            <div className="mt-6 space-y-6">
              <SliderInput
                label="Current Score Estimate"
                value={profile.estimatedScore}
                onChange={(value) =>
                  setProfile((prev) => ({ ...prev, estimatedScore: value }))
                }
                min={300}
                max={850}
                step={5}
                format="number"
              />
              <SliderInput
                label="Total Credit Limit"
                value={profile.totalCreditLimit}
                onChange={(value) =>
                  setProfile((prev) => ({ ...prev, totalCreditLimit: value }))
                }
                min={0}
                max={200000}
                step={500}
                format="currency"
              />
              <SliderInput
                label="Current Total Balances"
                value={profile.currentBalance}
                onChange={(value) =>
                  setProfile((prev) => ({ ...prev, currentBalance: value }))
                }
                min={0}
                max={100000}
                step={500}
                format="currency"
              />
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-4">
                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <span>Utilization</span>
                  <span className="text-white">
                    {formatPercent(utilization)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  Under 30% is good; under 10% is excellent.
                </p>
              </div>
              <SliderInput
                label="Age of Oldest Account (years)"
                value={profile.oldestAccountYears}
                onChange={(value) =>
                  setProfile((prev) => ({ ...prev, oldestAccountYears: value }))
                }
                min={0}
                max={40}
                step={1}
                format="number"
              />
              <SliderInput
                label="Number of Accounts"
                value={profile.totalAccounts}
                onChange={(value) =>
                  setProfile((prev) => ({ ...prev, totalAccounts: value }))
                }
                min={1}
                max={30}
                step={1}
                format="number"
              />
              <SliderInput
                label="Hard Inquiries (last 12 months)"
                value={profile.recentInquiries}
                onChange={(value) =>
                  setProfile((prev) => ({ ...prev, recentInquiries: value }))
                }
                min={0}
                max={10}
                step={1}
                format="number"
              />
              <SliderInput
                label="Missed Payments (ever)"
                value={profile.missedPayments}
                onChange={(value) =>
                  setProfile((prev) => ({ ...prev, missedPayments: value }))
                }
                min={0}
                max={20}
                step={1}
                format="number"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white">
              What-If Scenarios
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Toggle actions to see estimated changes to your score range.
            </p>
          </div>

          <ActionToggle
            title="Pay Down Debt"
            description="See how paying down balances could improve utilization."
            enabled={actions.payDownDebt.enabled}
            onToggle={() =>
              setActions((prev) => ({
                ...prev,
                payDownDebt: {
                  ...prev.payDownDebt,
                  enabled: !prev.payDownDebt.enabled,
                },
              }))
            }
          >
            <SliderInput
              label="Amount to pay down"
              value={actions.payDownDebt.amount}
              onChange={(value) =>
                setActions((prev) => ({
                  ...prev,
                  payDownDebt: { ...prev.payDownDebt, amount: value },
                }))
              }
              min={0}
              max={Math.max(1000, profile.currentBalance)}
              step={250}
              format="currency"
            />
          </ActionToggle>

          <ActionToggle
            title="Open New Card"
            description="Add a new credit card with a fresh limit."
            enabled={actions.openNewCard.enabled}
            onToggle={() =>
              setActions((prev) => ({
                ...prev,
                openNewCard: {
                  ...prev.openNewCard,
                  enabled: !prev.openNewCard.enabled,
                },
              }))
            }
          >
            <SliderInput
              label="New card credit limit"
              value={actions.openNewCard.creditLimit}
              onChange={(value) =>
                setActions((prev) => ({
                  ...prev,
                  openNewCard: { ...prev.openNewCard, creditLimit: value },
                }))
              }
              min={500}
              max={50000}
              step={500}
              format="currency"
            />
          </ActionToggle>

          <ActionToggle
            title="Close Account"
            description="Close a credit card or account."
            enabled={actions.closeAccount.enabled}
            onToggle={() =>
              setActions((prev) => ({
                ...prev,
                closeAccount: {
                  ...prev.closeAccount,
                  enabled: !prev.closeAccount.enabled,
                },
              }))
            }
          >
            <SliderInput
              label="Account age (years)"
              value={actions.closeAccount.accountAge}
              onChange={(value) =>
                setActions((prev) => ({
                  ...prev,
                  closeAccount: { ...prev.closeAccount, accountAge: value },
                }))
              }
              min={0}
              max={40}
              step={1}
              format="number"
            />
          </ActionToggle>

          <ActionToggle
            title="Miss a Payment"
            description="Simulate the impact of missing a payment."
            enabled={actions.missPayment.enabled}
            onToggle={() =>
              setActions((prev) => ({
                ...prev,
                missPayment: {
                  ...prev.missPayment,
                  enabled: !prev.missPayment.enabled,
                },
              }))
            }
          />

          <ActionToggle
            title="Become Authorized User"
            description="Join a trusted account to boost history and limits."
            enabled={actions.authorizedUser.enabled}
            onToggle={() =>
              setActions((prev) => ({
                ...prev,
                authorizedUser: {
                  ...prev.authorizedUser,
                  enabled: !prev.authorizedUser.enabled,
                },
              }))
            }
          >
            <SliderInput
              label="Card age (years)"
              value={actions.authorizedUser.accountAge}
              onChange={(value) =>
                setActions((prev) => ({
                  ...prev,
                  authorizedUser: {
                    ...prev.authorizedUser,
                    accountAge: value,
                  },
                }))
              }
              min={0}
              max={30}
              step={1}
              format="number"
            />
            <SliderInput
              label="Card credit limit"
              value={actions.authorizedUser.creditLimit}
              onChange={(value) =>
                setActions((prev) => ({
                  ...prev,
                  authorizedUser: {
                    ...prev.authorizedUser,
                    creditLimit: value,
                  },
                }))
              }
              min={500}
              max={50000}
              step={500}
              format="currency"
            />
          </ActionToggle>
        </div>
      </section>

      {results ? (
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-3xl space-y-8">
            <div className="rounded-2xl bg-neutral-900 p-6">
              <h2 className="text-xl font-semibold text-white">
                Estimated Score Range
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                Score changes are approximate ranges, not exact predictions.
              </p>

              <div className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl bg-neutral-950 p-4">
                    <p className="text-xs text-neutral-500">Current</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatNumber(results.currentScore)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-950 p-4">
                    <p className="text-xs text-neutral-500">Estimated Range</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatNumber(results.estimatedNewScore.min)} -{" "}
                      {formatNumber(results.estimatedNewScore.max)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-950 p-4">
                    <p className="text-xs text-neutral-500">Likely</p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {formatNumber(results.estimatedNewScore.likely)}
                    </p>
                  </div>
                </div>

                <ImpactRange
                  min={results.change.min}
                  max={results.change.max}
                />
                <p className="text-sm text-neutral-400">
                  {results.recommendation}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white">
                Action Breakdown
              </h3>
              <div className="mt-4 space-y-4">
                {results.actionImpacts.map((impact) => (
                  <div
                    key={impact.action}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-white">
                        {impact.action}
                      </p>
                      <span className="text-sm text-neutral-300">
                        {formatWithSign(impact.impact.min, (value) =>
                          formatNumber(value)
                        )} -{" "}
                        {formatWithSign(impact.impact.max, (value) =>
                          formatNumber(value)
                        )} pts
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-400">
                      {impact.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {results.warnings.length > 0 ? (
              <div className="space-y-3">
                {results.warnings.map((warning) => (
                  <div
                    key={warning}
                    className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">
              Credit Score Factors
            </h2>
            <div className="mt-4 space-y-3 text-sm text-neutral-400">
              <p>
                Payment history and utilization make up 65% of your score. Keep
                balances low and pay on time to see the biggest gains.
              </p>
              <p>
                Age and mix reward long-term, healthy credit habits. Avoid
                opening too many new accounts at once.
              </p>
              <p>
                Hard inquiries fade over time, but multiple in a short window
                can lower your score temporarily.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h2 className="text-xl font-semibold text-white">Tips</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-400">
              <li>Keep utilization under 30%, ideally under 10%.</li>
              <li>Set autopay or reminders to avoid missed payments.</li>
              <li>Let older accounts age to strengthen credit history.</li>
              <li>Space out new applications to minimize inquiries.</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6">
            <p className="text-sm text-neutral-300">
              This simulator provides estimates based on general credit scoring
              principles. Actual score changes vary based on your complete
              credit history. This is for educational purposes only.
            </p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-3xl">
          <details className="rounded-2xl bg-neutral-900/50 p-6">
            <summary className="cursor-pointer text-lg font-semibold text-white">
              How we calculate this
            </summary>
            <div className="mt-4 space-y-2 text-sm text-neutral-400">
              <p>
                We apply common FICO weighting ranges to estimate potential
                movement. Each action uses a range (not a single value) so you
                see possible outcomes rather than exact predictions.
              </p>
              <p>
                The estimated score range is clipped to FICO&apos;s 300-850 scale
                and assumes no other changes occur during the period.
              </p>
            </div>
          </details>
        </div>
      </section>
    </div>
  );
}
