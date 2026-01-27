"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SliderInput } from "@/components/shared/SliderInput";
import { ResultCard } from "@/components/shared/ResultCard";
import {
  AppShell,
  MethodologySection,
  VerdictCard,
} from "@/components/shared/AppShell";
import { formatCurrency } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/annual-fee-analyzer/calculations";
import type { CalculatorInputs } from "@/lib/calculators/annual-fee-analyzer/types";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  annualFee: 550,
  annualSpending: 30000,
  rewardsRate: 2.0,
  totalCredits: 300,
  creditUtilization: 50,
  pointsValueCpp: 1.0,
};

const POINT_VALUE_PRESETS = [
  { label: "Cash Back (1.0¢)", value: 1.0 },
  { label: "Chase Portal (1.25¢)", value: 1.25 },
  { label: "Travel Transfers (1.5¢)", value: 1.5 },
];

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);

  const verdictType =
    results.advantageVsCashBack > 0
      ? "positive"
      : results.advantageVsCashBack > -100
        ? "neutral"
        : "negative";

  const verdictDescription =
    results.advantageVsCashBack >= 0
      ? `Ahead of 2% cash back by ${formatCurrency(results.advantageVsCashBack)}.`
      : `Behind 2% cash back by ${formatCurrency(Math.abs(results.advantageVsCashBack))}.`;

  const breakEvenMessage = () => {
    if (results.breakEvenSpending === null) {
      return "At your redemption value, this card can't beat 2% cash back.";
    }

    if (results.breakEvenSpending === 0) {
      return "The credits alone cover the annual fee!";
    }

    return `You need to spend ${formatCurrency(
      results.breakEvenSpending,
      0
    )}/year to break even.`;
  };

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-green-400 mb-3">
            Annual Fee Analyzer
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Is That Annual Fee Worth It?
          </h1>
          <p className="text-lg text-neutral-400">
            Honest math. No affiliate bias. See if your card pays for itself.
          </p>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Card Details
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Annual Fee"
                  value={inputs.annualFee}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, annualFee: value }))
                  }
                  min={0}
                  max={700}
                  step={5}
                  format="currency"
                  description="The card's annual fee (e.g., $550 for Chase Sapphire Reserve)"
                />
                <SliderInput
                  label="Effective Rewards Rate"
                  value={inputs.rewardsRate}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, rewardsRate: value }))
                  }
                  min={0.5}
                  max={5}
                  step={0.1}
                  format="percent"
                  description="Average earn rate across your spending (e.g., 2x = 2%)"
                />
                <SliderInput
                  label="Annual Credits Value"
                  value={inputs.totalCredits}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, totalCredits: value }))
                  }
                  min={0}
                  max={1000}
                  step={25}
                  format="currency"
                  description="Dining credits, airline credits, lounge passes, etc."
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-6">
                Your Usage
              </h2>
              <div className="space-y-6">
                <SliderInput
                  label="Annual Spending"
                  value={inputs.annualSpending}
                  onChange={(value) =>
                    setInputs((prev) => ({ ...prev, annualSpending: value }))
                  }
                  min={0}
                  max={200000}
                  step={1000}
                  format="currency"
                  description="How much you put on credit cards per year"
                />
                <SliderInput
                  label="Credit Utilization Rate"
                  value={inputs.creditUtilization}
                  onChange={(value) =>
                    setInputs((prev) => ({
                      ...prev,
                      creditUtilization: value,
                    }))
                  }
                  min={0}
                  max={100}
                  step={5}
                  format="percent"
                  description="Most people use 30-50% of available credits. Be honest!"
                />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Point Value
              </h2>
              <div className="flex flex-wrap gap-3 mb-4">
                {POINT_VALUE_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        pointsValueCpp: preset.value,
                      }))
                    }
                    className={cn(
                      "rounded-lg border px-3 py-2 text-xs sm:text-sm font-semibold transition",
                      inputs.pointsValueCpp === preset.value
                        ? "border-green-400/70 bg-green-500/20 text-green-300"
                        : "border-neutral-700 text-neutral-300 hover:border-green-400/60"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <SliderInput
                label="Your Points Value"
                value={inputs.pointsValueCpp}
                onChange={(value) =>
                  setInputs((prev) => ({ ...prev, pointsValueCpp: value }))
                }
                min={0.5}
                max={2.0}
                step={0.1}
                format="number"
                description="1.0 = cash back, 1.25-1.5 = transfer partners"
              />
            </div>
          </div>

          <ResultCard
            title="Your Results"
            primaryValue={formatCurrency(results.netAnnualValue, 0)}
            primaryLabel="Net annual value after fee"
            items={[
              {
                label: "Rewards Earned",
                value: formatCurrency(results.rewardsEarned, 0),
              },
              {
                label: "Credits Used",
                value: formatCurrency(results.effectiveCredits, 0),
              },
              {
                label: "Annual Fee",
                value: formatCurrency(-inputs.annualFee, 0),
              },
              {
                label: "vs 2% Cash Back",
                value: formatCurrency(results.advantageVsCashBack, 0),
                highlight: results.advantageVsCashBack > 0,
              },
            ]}
            variant={results.netAnnualValue >= 0 ? "green" : "red"}
            footer={
              <VerdictCard
                verdict={results.verdict}
                description={verdictDescription}
                type={verdictType}
              />
            }
          />

          <div className="rounded-2xl bg-neutral-900 p-6">
            <h3 className="text-lg font-semibold text-white mb-2">
              Break-even check
            </h3>
            <p className="text-sm text-neutral-400">{breakEvenMessage()}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <MethodologySection>
            <p>
              We start with your actual annual spending and apply the card’s
              rewards rate. Then we adjust that value based on how you redeem
              points, because a 2x card is only as good as your redemption.
            </p>
            <p>
              We also discount credits based on how much you realistically use.
              Most cardholders never redeem every credit, so we ask you to set an
              honest utilization rate.
            </p>
            <p>
              Finally, we compare everything against a simple 2% cash back card
              so you can see if the fee card is actually worth the hassle.
            </p>
            <p>
              Want the deeper context? Read our critique of affiliate-driven
              recommendations in{" "}
              <Link
                href="/blog/why-we-built-this"
                className="text-green-400 underline hover:text-green-300"
              >
                why we built ClearMoney
              </Link>
              .
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
