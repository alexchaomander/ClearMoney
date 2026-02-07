"use client";

import { useMemo, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { AppShell } from "@/components/shared/AppShell";
import type { CalculatorInputs } from "@/lib/calculators/founder-coverage-planner/types";
import { FOUNDER_COVERAGE_ONBOARDING_STORAGE_KEY } from "@/lib/calculators/founder-coverage-planner/storage";

type Persona = {
  id: string;
  label: string;
  description: string;
  values: Partial<CalculatorInputs>;
};

const STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

const PERSONAS: Persona[] = [
  {
    id: "solo-llc-scorp",
    label: "Solo founder, bootstrapped",
    description: "LLC with S-Corp election, W-2 salary + distributions, no equity grants.",
    values: {
      legalEntityType: "llc",
      taxElection: "s_corp",
      fundingPlan: "bootstrapped",
      ownerRole: "operator",
      annualNetIncome: 240000,
      marketSalary: 160000,
      plannedSalary: 120000,
      hasEquityGrants: false,
      stateCode: "CA",
      filingStatus: "single",
      businessAccounts: 1,
      personalAccounts: 2,
    },
  },
  {
    id: "vc-c-corp-equity",
    label: "VC-backed, equity grants",
    description: "C-Corp with founder stock and QSBS considerations.",
    values: {
      legalEntityType: "c_corp",
      taxElection: "none",
      fundingPlan: "vc",
      ownerRole: "operator",
      annualNetIncome: 0,
      marketSalary: 220000,
      plannedSalary: 180000,
      hasEquityGrants: true,
      equityGrantType: "restricted_stock",
      daysSinceGrant: 12,
      isQualifiedBusiness: true,
      assetsAtIssuance: 12000000,
      expectedHoldingYears: 5,
      stateCode: "NY",
      filingStatus: "single",
      businessAccounts: 1,
      personalAccounts: 2,
    },
  },
  {
    id: "agency-contractors",
    label: "Agency with team",
    description: "Multi-owner, employees/contractors, higher commingling risk.",
    values: {
      legalEntityType: "llc",
      taxElection: "s_corp",
      fundingPlan: "bootstrapped",
      ownerRole: "operator",
      annualNetIncome: 320000,
      ownersCount: 2,
      employeesCount: 4,
      marketSalary: 190000,
      plannedSalary: 140000,
      hasEquityGrants: false,
      reimbursementPolicy: "manual",
      mixedTransactionsPerMonth: 8,
      stateCode: "TX",
      filingStatus: "married",
      businessAccounts: 1,
      personalAccounts: 3,
    },
  },
];

function clampMoney(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function getDemoQuery(searchParams: ReadonlyURLSearchParams): string {
  const demo = searchParams.get("demo");
  return demo === "true" ? "?demo=true" : "";
}

export default function FounderCoveragePlannerStartPage(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [personaId, setPersonaId] = useState<string>(PERSONAS[0]?.id ?? "solo-llc-scorp");
  const [stateCode, setStateCode] = useState<string>("CA");
  const [filingStatus, setFilingStatus] = useState<CalculatorInputs["filingStatus"]>("single");
  const [annualNetIncome, setAnnualNetIncome] = useState<number>(240000);

  const persona = useMemo(() => {
    return PERSONAS.find((p) => p.id === personaId) ?? PERSONAS[0];
  }, [personaId]);

  const demoQuery = useMemo(() => getDemoQuery(searchParams), [searchParams]);

  function applyPersona(): void {
    if (!persona) return;
    setStateCode(persona.values.stateCode ?? "CA");
    setFilingStatus(persona.values.filingStatus ?? "single");
    setAnnualNetIncome(persona.values.annualNetIncome ?? 240000);
    setStep(2);
  }

  function goNext(): void {
    setStep((prev) => (prev === 3 ? 3 : ((prev + 1) as 1 | 2 | 3)));
  }

  function goBack(): void {
    setStep((prev) => (prev === 1 ? 1 : ((prev - 1) as 1 | 2 | 3)));
  }

  function startPlanner(): void {
    if (!persona) return;

    const payload: Partial<CalculatorInputs> = {
      ...persona.values,
      stateCode,
      filingStatus,
      annualNetIncome: clampMoney(annualNetIncome),
    };

    try {
      window.sessionStorage.setItem(
        FOUNDER_COVERAGE_ONBOARDING_STORAGE_KEY,
        JSON.stringify(payload)
      );
    } catch {
      // ignore
    }

    router.push(`/tools/founder-coverage-planner${demoQuery}`);
  }

  return (
    <AppShell>
      <div className="min-h-screen bg-neutral-950">
        <section className="px-4 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-400 mb-2">
                  60-second setup
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">
                  Founder Coverage Planner
                </h1>
                <p className="mt-3 text-sm text-neutral-400">
                  Pick a persona, sanity-check the essentials, and land in an end-to-end
                  report.
                </p>
              </div>
              <Link
                href={`/tools/founder-coverage-planner${demoQuery}`}
                className="hidden sm:inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-neutral-600 transition-colors"
              >
                Skip
              </Link>
            </div>

            <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">
                  Step {step} of 3
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={goBack}
                    disabled={step === 1}
                    className="rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 disabled:opacity-50"
                  >
                    Back
                  </button>
                  {step < 3 ? (
                    <button
                      type="button"
                      onClick={goNext}
                      className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-neutral-950"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startPlanner}
                      className="rounded-xl bg-emerald-300 px-3 py-2 text-xs font-semibold text-neutral-950"
                    >
                      Open planner
                    </button>
                  )}
                </div>
              </div>

              {step === 1 && (
                <div className="mt-6 space-y-4">
                  <p className="text-sm font-semibold text-white">Choose a persona</p>
                  <div className="grid gap-3 md:grid-cols-3">
                    {PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPersonaId(p.id)}
                        className={[
                          "rounded-2xl border p-4 text-left transition-colors",
                          p.id === personaId
                            ? "border-sky-400/60 bg-sky-400/10"
                            : "border-neutral-800 bg-neutral-950 hover:border-neutral-600",
                        ].join(" ")}
                      >
                        <p className="text-sm font-semibold text-white">{p.label}</p>
                        <p className="mt-2 text-xs text-neutral-400">{p.description}</p>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={applyPersona}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950"
                    >
                      Use this persona
                    </button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-white">Quick essentials</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      These 3 fields drive most of the “first-pass” output.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wide text-neutral-500">
                        State
                      </label>
                      <select
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                        value={stateCode}
                        onChange={(e) => setStateCode(e.target.value)}
                      >
                        {STATE_CODES.map((code) => (
                          <option key={code} value={code}>
                            {code}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wide text-neutral-500">
                        Filing status
                      </label>
                      <select
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                        value={filingStatus}
                        onChange={(e) => setFilingStatus(e.target.value as CalculatorInputs["filingStatus"])}
                      >
                        <option value="single">Single</option>
                        <option value="married">Married</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wide text-neutral-500">
                        Annual net income
                      </label>
                      <input
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
                        inputMode="numeric"
                        value={String(annualNetIncome)}
                        onChange={(e) => setAnnualNetIncome(Number(e.target.value))}
                      />
                      <p className="text-xs text-neutral-500">Business net income estimate.</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-neutral-950"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="mt-6 space-y-4">
                  <p className="text-sm font-semibold text-white">Review</p>
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
                    <div className="grid gap-3 md:grid-cols-3 text-sm">
                      <div>
                        <p className="text-xs text-neutral-500">Persona</p>
                        <p className="text-white font-semibold">{persona?.label ?? "—"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">State</p>
                        <p className="text-white font-semibold">{stateCode}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Filing</p>
                        <p className="text-white font-semibold">
                          {filingStatus === "married" ? "Married" : "Single"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Annual net income</p>
                        <p className="text-white font-semibold">
                          ${clampMoney(annualNetIncome).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Entity + election</p>
                        <p className="text-white font-semibold">
                          {persona?.values.legalEntityType?.replace("_", " ") ?? "—"}
                          {persona?.values.taxElection === "s_corp" ? " + S-Corp" : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Funding</p>
                        <p className="text-white font-semibold">
                          {persona?.values.fundingPlan === "vc" ? "VC-backed" : "Bootstrapped"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Link
                      href={`/tools/founder-coverage-planner${demoQuery}`}
                      className="inline-flex items-center justify-center rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-200 hover:border-neutral-600 transition-colors"
                    >
                      Skip and open planner
                    </Link>
                    <button
                      type="button"
                      onClick={startPlanner}
                      className="rounded-xl bg-emerald-300 px-4 py-2 text-sm font-semibold text-neutral-950"
                    >
                      Open planner with prefills
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
