"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  DollarSign,
  Percent,
  PiggyBank,
  Home,
  Target,
  RefreshCw,
  Check,
  History,
  TrendingUp,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Slider } from "@/components/ui/slider";
import {
  useFinancialMemory,
  useUpdateMemory,
  useDeriveMemory,
  useMemoryEvents,
  useConsentStatus,
} from "@/lib/strata/hooks";
import type {
  FinancialMemory,
  FinancialMemoryUpdate,
  FilingStatus,
  RiskTolerance,
} from "@clearmoney/strata-sdk";
import { ConsentGate } from "@/components/shared/ConsentGate";

// ---------------------------------------------------------------------------
// Field input components
// ---------------------------------------------------------------------------

function SliderField({
  label,
  memoryKey,
  memory,
  onSave,
  min,
  max,
  step = 1,
  formatValue = (v) => String(v),
}: {
  label: string;
  memoryKey: keyof FinancialMemory;
  memory: FinancialMemory;
  onSave: (data: FinancialMemoryUpdate) => void;
  min: number;
  max: number;
  step?: number;
  formatValue?: (v: number) => string;
}) {
  const rawValue = memory[memoryKey];
  const initialValue = rawValue != null ? Number(rawValue) : min;
  const [localValue, setLocalValue] = useState(initialValue);

  const handleValueChange = (values: number[]) => {
    setLocalValue(values[0]);
  };

  const handleCommit = (values: number[]) => {
    onSave({ [memoryKey]: values[0] } as unknown as FinancialMemoryUpdate);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm text-neutral-400">{label}</label>
        <span className="text-sm font-medium text-emerald-400">
          {formatValue(localValue)}
        </span>
      </div>
      <Slider
        value={[localValue]}
        min={min}
        max={max}
        step={step}
        onValueChange={handleValueChange}
        onValueCommit={handleCommit}
        className="py-4"
      />
    </div>
  );
}

function NumberField({
  label,
  memoryKey,
  memory,
  onSave,
  prefix,
  suffix,
  step,
  min,
  max,
}: {
  label: string;
  memoryKey: keyof FinancialMemory;
  memory: FinancialMemory;
  onSave: (data: FinancialMemoryUpdate) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  const rawValue = memory[memoryKey];
  const [localValue, setLocalValue] = useState(
    rawValue != null ? String(rawValue) : ""
  );
  const [dirty, setDirty] = useState(false);

  const handleBlur = useCallback(() => {
    if (!dirty) return;
    const num = localValue === "" ? null : Number(localValue);
    onSave({ [memoryKey]: num } as unknown as FinancialMemoryUpdate);
    setDirty(false);
  }, [dirty, localValue, memoryKey, onSave]);

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && (
          <span className="text-sm text-neutral-500">{prefix}</span>
        )}
        <input
          type="number"
          value={localValue}
          step={step}
          min={min}
          max={max}
          onChange={(e) => {
            setLocalValue(e.target.value);
            setDirty(true);
          }}
          onBlur={handleBlur}
          onKeyDown={(e) => e.key === "Enter" && handleBlur()}
          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
        />
        {suffix && (
          <span className="text-sm text-neutral-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  memoryKey,
  memory,
  onSave,
  options,
}: {
  label: string;
  memoryKey: keyof FinancialMemory;
  memory: FinancialMemory;
  onSave: (data: FinancialMemoryUpdate) => void;
  options: { value: string; label: string }[];
}) {
  const currentValue = memory[memoryKey] as string | null;

  return (
    <div>
      <label className="block text-sm text-neutral-400 mb-1">{label}</label>
      <select
        value={currentValue ?? ""}
        onChange={(e) => {
          const val = e.target.value || null;
          onSave({ [memoryKey]: val } as unknown as FinancialMemoryUpdate);
        }}
        className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50"
      >
        <option value="">--</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILING_STATUS_OPTIONS: { value: FilingStatus; label: string }[] = [
  { value: "single", label: "Single" },
  { value: "married_filing_jointly", label: "Married Filing Jointly" },
  { value: "married_filing_separately", label: "Married Filing Separately" },
  { value: "head_of_household", label: "Head of Household" },
];

const RISK_TOLERANCE_OPTIONS: { value: RiskTolerance; label: string }[] = [
  { value: "conservative", label: "Conservative" },
  { value: "moderate", label: "Moderate" },
  { value: "aggressive", label: "Aggressive" },
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
].map((s) => ({ value: s, label: s }));

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function ProfilePage() {
  const { hasConsent: hasMemoryConsent } = useConsentStatus([
    "memory:read",
    "memory:write",
  ]);
  const { data: memory, isLoading } = useFinancialMemory({ enabled: hasMemoryConsent });
  const { data: events } = useMemoryEvents({ enabled: hasMemoryConsent });
  const updateMemory = useUpdateMemory();
  const deriveMemory = useDeriveMemory();
  const [showEvents, setShowEvents] = useState(false);

  const onSave = useCallback(
    (data: FinancialMemoryUpdate) => {
      updateMemory.mutate(data);
    },
    [updateMemory]
  );

  const sectionClass =
    "p-6 rounded-xl bg-neutral-900 border border-neutral-800";

  if (isLoading || !memory) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <DashboardHeader />
        <main className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
          {!hasMemoryConsent && (
            <ConsentGate
              scopes={["memory:read", "memory:write"]}
              purpose="Store and update your financial profile."
            >
              <div className="text-sm text-neutral-400">
                Authorize access to load your profile.
              </div>
            </ConsentGate>
          )}
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-48 rounded-xl bg-neutral-800/50 animate-pulse"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)",
        }}
      />

      <DashboardHeader />

      <main className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 py-8">
        <ConsentGate
          scopes={["memory:read", "memory:write"]}
          purpose="Store and update your financial profile."
        >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif text-3xl text-white mb-1">
                Financial Profile
              </h1>
              <p className="text-neutral-400">
                Your financial facts power pre-filled calculators and the AI
                advisor
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => deriveMemory.mutate()}
                disabled={deriveMemory.isPending}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/40 transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${deriveMemory.isPending ? "animate-spin" : ""}`}
                />
                Auto-fill from accounts
              </button>
              <button
                onClick={() => setShowEvents((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700 transition-all"
              >
                <History className="w-4 h-4" />
                History
              </button>
            </div>
          </div>
        </motion.div>

        {updateMemory.isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center gap-2 text-sm text-emerald-400"
          >
            <Check className="w-4 h-4" />
            Profile updated
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Demographics */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">
                Demographics
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField
                label="Age"
                memoryKey="age"
                memory={memory}
                onSave={onSave}
                min={18}
                max={120}
              />
              <SelectField
                label="State"
                memoryKey="state"
                memory={memory}
                onSave={onSave}
                options={US_STATES}
              />
              <SelectField
                label="Filing Status"
                memoryKey="filing_status"
                memory={memory}
                onSave={onSave}
                options={FILING_STATUS_OPTIONS}
              />
              <NumberField
                label="Dependents"
                memoryKey="num_dependents"
                memory={memory}
                onSave={onSave}
                min={0}
                max={20}
              />
            </div>
          </motion.div>

          {/* Income */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">Income</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField
                label="Annual Income"
                memoryKey="annual_income"
                memory={memory}
                onSave={onSave}
                prefix="$"
                min={0}
                step={1000}
              />
              <NumberField
                label="Monthly Income"
                memoryKey="monthly_income"
                memory={memory}
                onSave={onSave}
                prefix="$"
                min={0}
                step={100}
              />
              <NumberField
                label="Average Monthly Expenses"
                memoryKey="average_monthly_expenses"
                memory={memory}
                onSave={onSave}
                prefix="$"
                min={0}
                step={100}
              />
              <NumberField
                label="Income Growth Rate"
                memoryKey="income_growth_rate"
                memory={memory}
                onSave={onSave}
                suffix="%"
                step={0.01}
                min={0}
                max={1}
              />
            </div>
          </motion.div>

          {/* Tax Rates */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">
                Tax Rates
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <NumberField
                label="Federal Tax Rate"
                memoryKey="federal_tax_rate"
                memory={memory}
                onSave={onSave}
                suffix="%"
                step={0.01}
                min={0}
                max={1}
              />
              <NumberField
                label="State Tax Rate"
                memoryKey="state_tax_rate"
                memory={memory}
                onSave={onSave}
                suffix="%"
                step={0.01}
                min={0}
                max={1}
              />
              <NumberField
                label="Capital Gains Rate"
                memoryKey="capital_gains_rate"
                memory={memory}
                onSave={onSave}
                suffix="%"
                step={0.01}
                min={0}
                max={1}
              />
            </div>
          </motion.div>

          {/* Retirement */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <PiggyBank className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">
                Retirement
              </h2>
            </div>
            <div className="space-y-6">
              <SliderField
                label="Target Retirement Age"
                memoryKey="retirement_age"
                memory={memory}
                onSave={onSave}
                min={45}
                max={85}
                formatValue={(v) => `${v} years old`}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberField
                  label="Current Retirement Savings"
                  memoryKey="current_retirement_savings"
                  memory={memory}
                  onSave={onSave}
                  prefix="$"
                  min={0}
                  step={1000}
                />
                <NumberField
                  label="Monthly Retirement Contribution"
                  memoryKey="monthly_retirement_contribution"
                  memory={memory}
                  onSave={onSave}
                  prefix="$"
                  min={0}
                  step={50}
                />
                <NumberField
                  label="Employer Match %"
                  memoryKey="employer_match_pct"
                  memory={memory}
                  onSave={onSave}
                  suffix="%"
                  step={0.01}
                  min={0}
                  max={1}
                />
                <NumberField
                  label="Expected Social Security (monthly)"
                  memoryKey="expected_social_security"
                  memory={memory}
                  onSave={onSave}
                  prefix="$"
                  min={0}
                  step={100}
                />
                <div className="sm:col-span-2">
                  <NumberField
                    label="Desired Retirement Income (annual)"
                    memoryKey="desired_retirement_income"
                    memory={memory}
                    onSave={onSave}
                    prefix="$"
                    min={0}
                    step={1000}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Housing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">Housing</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <NumberField
                label="Home Value"
                memoryKey="home_value"
                memory={memory}
                onSave={onSave}
                prefix="$"
                min={0}
                step={10000}
              />
              <NumberField
                label="Mortgage Balance"
                memoryKey="mortgage_balance"
                memory={memory}
                onSave={onSave}
                prefix="$"
                min={0}
                step={1000}
              />
              <NumberField
                label="Mortgage Rate"
                memoryKey="mortgage_rate"
                memory={memory}
                onSave={onSave}
                suffix="%"
                step={0.001}
                min={0}
                max={1}
              />
              <NumberField
                label="Monthly Rent"
                memoryKey="monthly_rent"
                memory={memory}
                onSave={onSave}
                prefix="$"
                min={0}
                step={50}
              />
            </div>
          </motion.div>

          {/* Goals & Preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className={sectionClass}
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-emerald-400" />
              <h2 className="font-serif text-xl text-neutral-100">
                Goals & Preferences
              </h2>
            </div>
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-neutral-400">Risk Tolerance</label>
                  <span className="text-sm font-medium text-emerald-400 capitalize">
                    {memory.risk_tolerance || "Not set"}
                  </span>
                </div>
                <Slider
                  value={[
                    memory.risk_tolerance === "aggressive" ? 2 :
                    memory.risk_tolerance === "moderate" ? 1 : 0
                  ]}
                  min={0}
                  max={2}
                  step={1}
                  onValueCommit={(values) => {
                    const mapped: RiskTolerance = values[0] === 2 ? "aggressive" : values[0] === 1 ? "moderate" : "conservative";
                    onSave({ risk_tolerance: mapped });
                  }}
                  className="py-4"
                />
                <div className="flex justify-between text-[10px] text-neutral-500 uppercase tracking-widest px-1">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <NumberField
                  label="Investment Horizon (years)"
                  memoryKey="investment_horizon_years"
                  memory={memory}
                  onSave={onSave}
                  min={1}
                  max={60}
                />
                <NumberField
                  label="Monthly Savings Target"
                  memoryKey="monthly_savings_target"
                  memory={memory}
                  onSave={onSave}
                  prefix="$"
                  min={0}
                  step={100}
                />
                <NumberField
                  label="Emergency Fund Target (months)"
                  memoryKey="emergency_fund_target_months"
                  memory={memory}
                  onSave={onSave}
                  min={1}
                  max={24}
                />
              </div>
            </div>
          </motion.div>

          {/* Event History */}
          {showEvents && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={sectionClass}
            >
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-emerald-400" />
                <h2 className="font-serif text-xl text-neutral-100">
                  Change History
                </h2>
              </div>
              {events && events.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-neutral-200">
                          <span className="font-medium text-neutral-100">
                            {event.field_name}
                          </span>
                          {" "}
                          changed from{" "}
                          <span className="text-red-400">
                            {event.old_value ?? "empty"}
                          </span>{" "}
                          to{" "}
                          <span className="text-emerald-400">
                            {event.new_value ?? "empty"}
                          </span>
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {event.source}
                          {event.context ? ` — ${event.context}` : ""} &middot;{" "}
                          {new Date(event.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No changes recorded yet</p>
              )}
            </motion.div>
          )}
        </div>
        </ConsentGate>
      </main>
    </div>
  );
}
