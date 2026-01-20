"use client";

import { useCallback, useMemo, useState } from "react";
import { AppShell, MethodologySection, VerdictCard } from "@/components/shared/AppShell";
import { ResultCard } from "@/components/shared/ResultCard";
import { SliderInput } from "@/components/shared/SliderInput";
import { formatCurrency, formatPercent } from "@/lib/shared/formatters";
import { calculate } from "@/lib/calculators/estate-tax/calculations";
import {
  FEDERAL_EXEMPTION_2025,
  ANNUAL_GIFT_EXCLUSION_2025,
  FEDERAL_ESTATE_TAX_RATE,
  EXEMPTION_SUNSET_DATE,
} from "@/lib/calculators/estate-tax/constants";
import type {
  CalculatorInputs,
  Assets,
  Liabilities,
  PersonalInfo,
} from "@/lib/calculators/estate-tax/types";
import { cn } from "@/lib/utils";

const DEFAULT_INPUTS: CalculatorInputs = {
  assets: {
    bankAccounts: 100000,
    brokerageAccounts: 500000,
    retirementAccounts: 500000,
    primaryResidence: 1000000,
    otherRealEstate: 0,
    lifeInsurance: 1000000,
    businessInterests: 0,
    otherAssets: 100000,
  },
  liabilities: {
    mortgages: 400000,
    otherDebts: 0,
  },
  personal: {
    maritalStatus: "single",
    stateOfResidence: "CA",
    age: 45,
    spouseAge: 43,
  },
  lifetimeGiftsMade: 0,
};

const STATE_OPTIONS = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

const urgencyCopy = {
  none: "No federal exposure after the 2026 sunset based on current inputs.",
  low: "Limited exposure after 2026. Still worth planning early.",
  moderate: "Material exposure after 2026. Consider planning in 2025.",
  high: "High exposure after 2026. Planning should start soon.",
  critical: "Critical exposure after 2026. Immediate planning recommended.",
};

function daysUntilSunset(): number {
  const now = new Date();
  const diffMs = EXEMPTION_SUNSET_DATE.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function Calculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  // Generic handler factory for updating asset values
  const handleAssetChange = useCallback((field: keyof Assets) => {
    return (value: number) => {
      setInputs((prev) => ({
        ...prev,
        assets: { ...prev.assets, [field]: value },
      }));
    };
  }, []);

  // Generic handler factory for updating liability values
  const handleLiabilityChange = useCallback((field: keyof Liabilities) => {
    return (value: number) => {
      setInputs((prev) => ({
        ...prev,
        liabilities: { ...prev.liabilities, [field]: value },
      }));
    };
  }, []);

  // Generic handler factory for updating personal info values
  const handlePersonalChange = useCallback(<K extends keyof PersonalInfo>(field: K) => {
    return (value: PersonalInfo[K]) => {
      setInputs((prev) => ({
        ...prev,
        personal: { ...prev.personal, [field]: value },
      }));
    };
  }, []);

  // Handler for lifetime gifts
  const handleLifetimeGiftsChange = useCallback((value: number) => {
    setInputs((prev) => ({ ...prev, lifetimeGiftsMade: value }));
  }, []);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const daysToSunset = daysUntilSunset();
  const hasUrgency = results.sunsetComparison.additionalTaxIfNoAction > 0;

  const verdictType = results.totalEstateTax > 0 ? "negative" : "positive";
  const verdictTitle =
    results.totalEstateTax > 0
      ? `Estate Tax Exposure: ${formatCurrency(results.totalEstateTax, 0)}`
      : "No Estate Tax Expected";
  const verdictDescription =
    results.totalEstateTax > 0
      ? `Estimated effective tax rate of ${formatPercent(results.totalTaxRate)}.`
      : "Based on current inputs, your estate sits below federal and state exemptions.";

  // Format constants for display in methodology section
  const formattedExemption = formatCurrency(FEDERAL_EXEMPTION_2025, 0);
  const formattedExemptionMarried = formatCurrency(FEDERAL_EXEMPTION_2025 * 2, 0);
  const formattedAnnualExclusion = formatCurrency(ANNUAL_GIFT_EXCLUSION_2025, 0);
  const formattedTaxRate = `${(FEDERAL_ESTATE_TAX_RATE * 100).toFixed(0)}%`;

  return (
    <AppShell>
      <section className="px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400 mb-3">
            Estate Planning
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Estate Tax Exposure Calculator
          </h1>
          <p className="text-lg text-neutral-400">
            Will you owe estate taxes? Understand your exposure—especially before 2026.
          </p>
        </div>
      </section>

      {hasUrgency && (
        <section className="px-4 pb-8">
          <div className="mx-auto max-w-3xl rounded-2xl border border-slate-500/40 bg-slate-500/10 p-6 text-left">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-300 mb-2">
                  2026 Exemption Sunset Countdown
                </p>
                <h2 className="text-2xl font-semibold text-white">
                  {daysToSunset.toLocaleString()} days until the exemption drop
                </h2>
                <p className="text-sm text-slate-200 mt-2">
                  Potential additional federal tax:{" "}
                  <span className="font-semibold text-white">
                    {formatCurrency(results.sunsetComparison.additionalTaxIfNoAction, 0)}
                  </span>
                </p>
              </div>
              <div className="rounded-xl bg-slate-900/40 px-4 py-3 text-sm text-slate-200">
                {urgencyCopy[results.sunsetComparison.urgencyLevel]}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="rounded-2xl bg-neutral-900 p-6 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Assets</h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Bank & Cash Accounts"
                    value={inputs.assets.bankAccounts}
                    onChange={handleAssetChange("bankAccounts")}
                    min={0}
                    max={10000000}
                    step={10000}
                    format="currency"
                    description="Checking, savings, money market funds"
                  />
                  <SliderInput
                    label="Taxable Investment Accounts"
                    value={inputs.assets.brokerageAccounts}
                    onChange={handleAssetChange("brokerageAccounts")}
                    min={0}
                    max={50000000}
                    step={25000}
                    format="currency"
                    description="Brokerage accounts, mutual funds, ETFs"
                  />
                  <SliderInput
                    label="Retirement Accounts (401k, IRA)"
                    value={inputs.assets.retirementAccounts}
                    onChange={handleAssetChange("retirementAccounts")}
                    min={0}
                    max={20000000}
                    step={25000}
                    format="currency"
                    description="Traditional and Roth retirement balances"
                  />
                  <SliderInput
                    label="Primary Residence Value"
                    value={inputs.assets.primaryResidence}
                    onChange={handleAssetChange("primaryResidence")}
                    min={0}
                    max={20000000}
                    step={50000}
                    format="currency"
                  />
                  <SliderInput
                    label="Other Real Estate"
                    value={inputs.assets.otherRealEstate}
                    onChange={handleAssetChange("otherRealEstate")}
                    min={0}
                    max={20000000}
                    step={50000}
                    format="currency"
                  />
                  <SliderInput
                    label="Life Insurance Death Benefit"
                    value={inputs.assets.lifeInsurance}
                    onChange={handleAssetChange("lifeInsurance")}
                    min={0}
                    max={20000000}
                    step={100000}
                    format="currency"
                    description="Counts toward your taxable estate"
                  />
                  <SliderInput
                    label="Business Interests"
                    value={inputs.assets.businessInterests}
                    onChange={handleAssetChange("businessInterests")}
                    min={0}
                    max={50000000}
                    step={50000}
                    format="currency"
                  />
                  <SliderInput
                    label="Other Assets"
                    value={inputs.assets.otherAssets}
                    onChange={handleAssetChange("otherAssets")}
                    min={0}
                    max={10000000}
                    step={10000}
                    format="currency"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-6">Liabilities</h2>
                <div className="space-y-6">
                  <SliderInput
                    label="Mortgages"
                    value={inputs.liabilities.mortgages}
                    onChange={handleLiabilityChange("mortgages")}
                    min={0}
                    max={5000000}
                    step={25000}
                    format="currency"
                  />
                  <SliderInput
                    label="Other Debts"
                    value={inputs.liabilities.otherDebts}
                    onChange={handleLiabilityChange("otherDebts")}
                    min={0}
                    max={2000000}
                    step={10000}
                    format="currency"
                  />
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-white mb-6">
                  Personal Information
                </h2>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-semibold text-neutral-300 mb-2">
                      Marital Status
                    </p>
                    <div className="flex gap-3">
                      {(["single", "married"] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handlePersonalChange("maritalStatus")(status)}
                          className={cn(
                            "flex-1 rounded-lg border px-4 py-2 text-sm font-semibold transition",
                            inputs.personal.maritalStatus === status
                              ? "border-slate-400 bg-slate-500/20 text-slate-100"
                              : "border-neutral-700 text-neutral-300 hover:border-slate-500/60"
                          )}
                        >
                          {status === "single" ? "Single" : "Married"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-neutral-300">
                      State of Residence
                    </label>
                    <div className="mt-2">
                      <select
                        value={inputs.personal.stateOfResidence}
                        onChange={(event) =>
                          handlePersonalChange("stateOfResidence")(event.target.value)
                        }
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-slate-400 focus:outline-none"
                      >
                        {STATE_OPTIONS.map((state) => (
                          <option key={state.code} value={state.code}>
                            {state.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <SliderInput
                    label="Your Age"
                    value={inputs.personal.age}
                    onChange={(value) => handlePersonalChange("age")(value)}
                    min={18}
                    max={100}
                    step={1}
                    format="number"
                  />

                  {inputs.personal.maritalStatus === "married" && (
                    <SliderInput
                      label="Spouse Age"
                      value={inputs.personal.spouseAge ?? 43}
                      onChange={(value) => handlePersonalChange("spouseAge")(value)}
                      min={18}
                      max={100}
                      step={1}
                      format="number"
                    />
                  )}

                  <SliderInput
                    label="Lifetime Taxable Gifts Made"
                    value={inputs.lifetimeGiftsMade}
                    onChange={handleLifetimeGiftsChange}
                    min={0}
                    max={15000000}
                    step={50000}
                    format="currency"
                    description={`Gifts above the ${formattedAnnualExclusion} annual exclusion that have used your lifetime exemption (not double-counted in estate)`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <VerdictCard
              verdict={verdictTitle}
              description={verdictDescription}
              type={verdictType}
            />

            <ResultCard
              title="Estate Summary"
              primaryValue={formatCurrency(results.netEstate, 0)}
              primaryLabel="Estimated net estate value"
              items={[
                {
                  label: "Gross estate",
                  value: formatCurrency(results.grossEstate, 0),
                },
                {
                  label: "Total liabilities",
                  value: formatCurrency(results.totalLiabilities, 0),
                },
                {
                  label: "Effective estate tax rate",
                  value: formatPercent(results.totalTaxRate),
                },
              ]}
              variant="neutral"
            />

            <ResultCard
              title="Federal + State Tax Breakdown"
              primaryValue={formatCurrency(results.totalEstateTax, 0)}
              primaryLabel="Estimated total estate tax"
              items={[
                {
                  label: "Federal estate tax",
                  value: formatCurrency(results.federal.federalTaxDue, 0),
                },
                {
                  label: "State estate tax",
                  value: formatCurrency(results.state.stateTaxDue, 0),
                },
                {
                  label: "Exemption remaining",
                  value: formatCurrency(results.federal.exemptionRemaining, 0),
                },
              ]}
              variant="neutral"
            />

            <div className="rounded-2xl bg-neutral-900 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Asset Breakdown</h3>
              <div className="space-y-4">
                {results.assetBreakdown.length === 0 && (
                  <p className="text-sm text-neutral-400">
                    Add assets to see the composition of your estate.
                  </p>
                )}
                {results.assetBreakdown.map((item) => (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-300">{item.category}</span>
                      <span className="text-neutral-400">
                        {formatCurrency(item.value, 0)} -{" "}
                        {formatPercent(item.percentage / 100, 0)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-neutral-800">
                      <div
                        className={cn(
                          "h-2 rounded-full",
                          item.category === "Life Insurance"
                            ? "bg-amber-400"
                            : "bg-slate-500"
                        )}
                        style={{ width: `${Math.min(100, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  2026 Sunset Comparison
                </h3>
                <p className="text-sm text-neutral-400">
                  Compare current law vs. a lower exemption after 2026.
                </p>
              </div>
              <span className="rounded-full border border-slate-500/40 bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-200">
                {results.sunsetComparison.urgencyLevel.toUpperCase()}
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                <p className="text-xs uppercase tracking-widest text-neutral-500">
                  Current Law (2025)
                </p>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.sunsetComparison.currentLaw.federalTaxDue, 0)}
                </p>
                <p className="text-xs text-neutral-500 mt-1">
                  Exemption remaining:{" "}
                  {formatCurrency(
                    results.sunsetComparison.currentLaw.exemptionRemaining,
                    0
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-slate-500/40 bg-slate-500/10 p-4">
                <p className="text-xs uppercase tracking-widest text-slate-300">
                  After Sunset (2026)
                </p>
                <p className="text-2xl font-semibold text-white mt-2">
                  {formatCurrency(results.sunsetComparison.postSunset.federalTaxDue, 0)}
                </p>
                <p className="text-xs text-slate-200 mt-1">
                  Additional tax:{" "}
                  {formatCurrency(results.sunsetComparison.additionalTaxIfNoAction, 0)}
                </p>
              </div>
            </div>
            <p className="text-sm text-neutral-400">
              {urgencyCopy[results.sunsetComparison.urgencyLevel]}
            </p>
          </div>

          <div className="rounded-2xl bg-neutral-900 p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">State Estate Tax</h3>
            <p className="text-sm text-neutral-400">
              {results.state.hasEstateTax
                ? `Your state exemption is ${formatCurrency(results.state.exemption, 0)}.`
                : "Your state does not levy a separate estate tax."}
            </p>
            <div className="space-y-3 text-sm text-neutral-300">
              <div className="flex justify-between">
                <span>State tax due</span>
                <span className="text-white">
                  {formatCurrency(results.state.stateTaxDue, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Top marginal rate</span>
                <span className="text-white">
                  {results.state.maxRate > 0 ? formatPercent(results.state.maxRate) : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Net estate</span>
                <span className="text-white">{formatCurrency(results.netEstate, 0)}</span>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/40 p-4 text-xs text-neutral-400">
              {results.state.notes}
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Planning Opportunities</h3>
            <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              Educational only
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {results.opportunities.map((opportunity) => (
              <div
                key={opportunity.strategy}
                className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-white">
                      {opportunity.strategy}
                    </h4>
                    <p className="text-sm text-neutral-400 mt-2">
                      {opportunity.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-500/40 bg-slate-500/10 px-3 py-1 text-[11px] font-semibold text-slate-200">
                    {opportunity.complexity}
                  </span>
                </div>
                <div className="mt-4 text-sm text-neutral-300 space-y-1">
                  <p>
                    <span className="text-neutral-500">Potential savings:</span>{" "}
                    {opportunity.potentialSavings > 0
                      ? formatCurrency(opportunity.potentialSavings, 0)
                      : "Varies"}
                  </p>
                  <p>
                    <span className="text-neutral-500">Timeframe:</span>{" "}
                    {opportunity.timeframe}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Warnings</h3>
            {results.warnings.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No major warning flags based on the inputs provided.
              </p>
            ) : (
              <ul className="space-y-3 text-sm text-neutral-300">
                {results.warnings.map((warning) => (
                  <li key={warning} className="flex gap-2">
                    <span className="text-amber-400">!</span>
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-2xl bg-neutral-900 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recommendations</h3>
            <ul className="space-y-3 text-sm text-neutral-300">
              {results.recommendations.map((recommendation) => (
                <li key={recommendation} className="flex gap-2">
                  <span className="text-slate-300">-</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <MethodologySection>
            <p>
              This calculator estimates federal and state estate taxes based on the
              assets, liabilities, and lifetime taxable gifts you enter. It includes life
              insurance death benefits, retirement accounts, real estate, and business
              interests in the gross estate calculation.
            </p>
            <p>
              Federal estate tax uses the 2025 exemption of {formattedExemption} per
              person ({formattedExemptionMarried} for married couples with portability)
              and a {formattedTaxRate} tax rate on amounts exceeding the exemption. The
              2026 sunset comparison models the exemption dropping to approximately $7M
              per person when TCJA provisions expire.
            </p>
            <p>
              Lifetime taxable gifts (those exceeding the {formattedAnnualExclusion}{" "}
              annual exclusion) reduce your available exemption but are not
              double-counted in the estate value. State estate tax estimates use
              published exemption thresholds and simplified effective rates. New York
              includes the 5% cliff rule. Results are educational estimates, not legal or
              tax advice.
            </p>
          </MethodologySection>
        </div>
      </section>
    </AppShell>
  );
}
