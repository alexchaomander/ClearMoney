"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Calculator,
  DollarSign,
  Wallet,
  CreditCard,
  Target,
  Shield,
  Check,
} from "lucide-react";
import { colors, GradientBlob, GlobalStyles, NoiseTexture } from "../shared";

// ============================================================================
// ONBOARDING FLOW
// ============================================================================
// Clean, spacious multi-step form for collecting user financial data
// Steps: Income -> Assets -> Debts -> Goals -> Risk Tolerance
// ============================================================================

interface OnboardingData {
  // Income
  annualIncome: string;
  employmentType: string;
  hasEmployerMatch: boolean;
  matchPercentage: string;
  // Assets
  checking: string;
  savings: string;
  retirement401k: string;
  rothIra: string;
  brokerage: string;
  other: string;
  // Debts
  studentLoans: string;
  creditCards: string;
  carLoan: string;
  mortgage: string;
  otherDebt: string;
  // Goals
  goals: string[];
  targetRetirementAge: string;
  // Risk Tolerance
  riskTolerance: string;
}

const initialData: OnboardingData = {
  annualIncome: "",
  employmentType: "employed",
  hasEmployerMatch: true,
  matchPercentage: "",
  checking: "",
  savings: "",
  retirement401k: "",
  rothIra: "",
  brokerage: "",
  other: "",
  studentLoans: "",
  creditCards: "",
  carLoan: "",
  mortgage: "",
  otherDebt: "",
  goals: [],
  targetRetirementAge: "",
  riskTolerance: "",
};

const steps = [
  { id: "income", title: "Income", icon: DollarSign },
  { id: "assets", title: "Assets", icon: Wallet },
  { id: "debts", title: "Debts", icon: CreditCard },
  { id: "goals", title: "Goals", icon: Target },
  { id: "risk", title: "Risk", icon: Shield },
];

const goalOptions = [
  { id: "emergency", label: "Build emergency fund", description: "3-6 months of expenses" },
  { id: "retirement", label: "Retire comfortably", description: "Build long-term wealth" },
  { id: "house", label: "Buy a home", description: "Save for a down payment" },
  { id: "debt-free", label: "Become debt-free", description: "Pay off all debts" },
  { id: "invest", label: "Start investing", description: "Grow wealth in the market" },
  { id: "fire", label: "Achieve FIRE", description: "Financial independence, retire early" },
  { id: "education", label: "Fund education", description: "Pay for school or training" },
  { id: "travel", label: "Travel more", description: "Save for experiences" },
];

const riskOptions = [
  {
    id: "conservative",
    label: "Conservative",
    description: "I prioritize protecting what I have. I can accept lower returns for more stability.",
    allocation: "20% stocks / 80% bonds",
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "I want a balance between growth and stability. Some volatility is acceptable.",
    allocation: "60% stocks / 40% bonds",
  },
  {
    id: "moderate-aggressive",
    label: "Moderate Aggressive",
    description: "I'm focused on growth and can handle significant short-term volatility.",
    allocation: "80% stocks / 20% bonds",
  },
  {
    id: "aggressive",
    label: "Aggressive",
    description: "I want maximum growth and have a long time horizon. I can handle large swings.",
    allocation: "95% stocks / 5% bonds",
  },
];

// ============================================================================
// FORM INPUT COMPONENT
// ============================================================================

function FormInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  prefix,
  helper,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  prefix?: string;
  helper?: string;
}) {
  return (
    <div>
      <label className="block text-lg font-medium mb-3" style={{ color: colors.text }}>
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span
            className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-medium"
            style={{ color: colors.textLight }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-5 py-4 rounded-2xl text-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
          style={{
            backgroundColor: colors.bgAlt,
            border: `1px solid ${colors.border}`,
            color: colors.text,
            paddingLeft: prefix ? "2.5rem" : "1.25rem",
          }}
        />
      </div>
      {helper && (
        <p className="mt-2 text-sm" style={{ color: colors.textLight }}>
          {helper}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function IncomeStep({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>
          Let&apos;s start with your income
        </h2>
        <p className="text-xl" style={{ color: colors.textMuted }}>
          This helps us understand your cash flow and savings potential.
        </p>
      </div>

      <FormInput
        label="Annual gross income"
        placeholder="150,000"
        value={data.annualIncome}
        onChange={(value) => setData({ ...data, annualIncome: value })}
        prefix="$"
        helper="Before taxes. Include salary, bonuses, and regular freelance income."
      />

      <div>
        <label className="block text-lg font-medium mb-3" style={{ color: colors.text }}>
          Employment type
        </label>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { id: "employed", label: "W-2 Employee" },
            { id: "self-employed", label: "Self-employed" },
            { id: "mixed", label: "Mix of both" },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setData({ ...data, employmentType: option.id })}
              className="p-4 rounded-xl text-left transition-all duration-200"
              style={{
                backgroundColor:
                  data.employmentType === option.id
                    ? `${colors.accent}10`
                    : colors.bgAlt,
                border: `2px solid ${
                  data.employmentType === option.id ? colors.accent : colors.border
                }`,
                color: data.employmentType === option.id ? colors.accent : colors.text,
              }}
            >
              <span className="font-medium">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {data.employmentType !== "self-employed" && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setData({ ...data, hasEmployerMatch: !data.hasEmployerMatch })}
              className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
              style={{
                backgroundColor: data.hasEmployerMatch ? colors.accent : colors.bgAlt,
                border: `2px solid ${data.hasEmployerMatch ? colors.accent : colors.border}`,
              }}
            >
              {data.hasEmployerMatch && <Check className="w-4 h-4 text-white" />}
            </button>
            <span className="text-lg" style={{ color: colors.text }}>
              My employer offers a 401(k) match
            </span>
          </div>

          {data.hasEmployerMatch && (
            <FormInput
              label="Employer match details"
              placeholder="e.g., 50% up to 6%"
              value={data.matchPercentage}
              onChange={(value) => setData({ ...data, matchPercentage: value })}
              helper="Example: '100% up to 3%' or '50% up to 6%'"
            />
          )}
        </div>
      )}
    </div>
  );
}

function AssetsStep({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  const fields = [
    { key: "checking", label: "Checking accounts" },
    { key: "savings", label: "Savings accounts (including HYSA)" },
    { key: "retirement401k", label: "401(k) / 403(b)" },
    { key: "rothIra", label: "Roth IRA" },
    { key: "brokerage", label: "Brokerage accounts" },
    { key: "other", label: "Other investments" },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>
          What do you have saved?
        </h2>
        <p className="text-xl" style={{ color: colors.textMuted }}>
          Approximate values are fine. We&apos;ll help you optimize across accounts.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {fields.map((field) => (
          <FormInput
            key={field.key}
            label={field.label}
            placeholder="0"
            value={data[field.key]}
            onChange={(value) => setData({ ...data, [field.key]: value })}
            prefix="$"
          />
        ))}
      </div>
    </div>
  );
}

function DebtsStep({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  const fields = [
    { key: "studentLoans", label: "Student loans", helper: "Total remaining balance" },
    { key: "creditCards", label: "Credit card debt", helper: "Total across all cards" },
    { key: "carLoan", label: "Car loan" },
    { key: "mortgage", label: "Mortgage balance" },
    { key: "otherDebt", label: "Other debt" },
  ] as const;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>
          Any debts to account for?
        </h2>
        <p className="text-xl" style={{ color: colors.textMuted }}>
          Leave blank or enter 0 for any that don&apos;t apply. No judgment here.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {fields.map((field) => (
          <FormInput
            key={field.key}
            label={field.label}
            placeholder="0"
            value={data[field.key]}
            onChange={(value) => setData({ ...data, [field.key]: value })}
            prefix="$"
            helper={"helper" in field ? field.helper : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function GoalsStep({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  const toggleGoal = (goalId: string) => {
    const newGoals = data.goals.includes(goalId)
      ? data.goals.filter((g) => g !== goalId)
      : [...data.goals, goalId];
    setData({ ...data, goals: newGoals });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>
          What are you working toward?
        </h2>
        <p className="text-xl" style={{ color: colors.textMuted }}>
          Select all that apply. We&apos;ll prioritize recommendations based on your goals.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {goalOptions.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className="p-5 rounded-2xl text-left transition-all duration-200"
            style={{
              backgroundColor: data.goals.includes(goal.id) ? `${colors.accent}10` : colors.bgAlt,
              border: `2px solid ${
                data.goals.includes(goal.id) ? colors.accent : colors.border
              }`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                style={{
                  backgroundColor: data.goals.includes(goal.id) ? colors.accent : colors.bgAlt,
                  border: `2px solid ${data.goals.includes(goal.id) ? colors.accent : colors.border}`,
                }}
              >
                {data.goals.includes(goal.id) && <Check className="w-4 h-4 text-white" />}
              </div>
              <div>
                <p
                  className="font-semibold mb-1"
                  style={{
                    color: data.goals.includes(goal.id) ? colors.accent : colors.text,
                  }}
                >
                  {goal.label}
                </p>
                <p className="text-sm" style={{ color: colors.textMuted }}>
                  {goal.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <FormInput
        label="Target retirement age (optional)"
        placeholder="65"
        value={data.targetRetirementAge}
        onChange={(value) => setData({ ...data, targetRetirementAge: value })}
        helper="Leave blank if you're not sure yet"
      />
    </div>
  );
}

function RiskStep({
  data,
  setData,
}: {
  data: OnboardingData;
  setData: (data: OnboardingData) => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: colors.text }}>
          How do you feel about risk?
        </h2>
        <p className="text-xl" style={{ color: colors.textMuted }}>
          This helps us tailor investment recommendations to your comfort level.
        </p>
      </div>

      <div className="space-y-4">
        {riskOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setData({ ...data, riskTolerance: option.id })}
            className="w-full p-6 rounded-2xl text-left transition-all duration-200"
            style={{
              backgroundColor:
                data.riskTolerance === option.id ? `${colors.accent}10` : colors.bgAlt,
              border: `2px solid ${
                data.riskTolerance === option.id ? colors.accent : colors.border
              }`,
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-200"
                style={{
                  backgroundColor:
                    data.riskTolerance === option.id ? colors.accent : "transparent",
                  border: `2px solid ${
                    data.riskTolerance === option.id ? colors.accent : colors.border
                  }`,
                }}
              >
                {data.riskTolerance === option.id && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p
                    className="font-semibold text-lg"
                    style={{
                      color: data.riskTolerance === option.id ? colors.accent : colors.text,
                    }}
                  >
                    {option.label}
                  </p>
                  <span
                    className="text-sm font-medium px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.textMuted,
                    }}
                  >
                    {option.allocation}
                  </span>
                </div>
                <p className="text-base" style={{ color: colors.textMuted }}>
                  {option.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ONBOARDING COMPONENT
// ============================================================================

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - redirect to dashboard
      router.push("/designs/design-11-autonomous/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <IncomeStep data={data} setData={setData} />;
      case 1:
        return <AssetsStep data={data} setData={setData} />;
      case 2:
        return <DebtsStep data={data} setData={setData} />;
      case 3:
        return <GoalsStep data={data} setData={setData} />;
      case 4:
        return <RiskStep data={data} setData={setData} />;
      default:
        return null;
    }
  };

  return (
    <>
      <GlobalStyles />

      <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
        {/* Gradient blobs */}
        <GradientBlob
          color={colors.blob1}
          size={700}
          top="-15%"
          right="-10%"
          opacity={0.25}
          blur={100}
          animate
        />
        <GradientBlob
          color={colors.blob2}
          size={500}
          bottom="10%"
          left="-15%"
          opacity={0.2}
          blur={90}
          animate
          delay={-5}
        />
        <GradientBlob
          color={colors.blob3}
          size={400}
          bottom="30%"
          right="5%"
          opacity={0.15}
          blur={80}
          animate
          delay={-10}
        />

        <NoiseTexture />

        {/* Header */}
        <header className="relative z-10 px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <Link href="/designs/design-11-autonomous" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.blob2} 100%)`,
                  boxShadow: `0 4px 14px ${colors.accent}40`,
                }}
              >
                <Calculator className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight" style={{ color: colors.text }}>
                ClearMoney
              </span>
            </Link>

            <Link
              href="/designs/design-11-autonomous"
              className="text-base font-medium transition-colors duration-200 hover:text-black"
              style={{ color: colors.textMuted }}
            >
              Exit
            </Link>
          </div>
        </header>

        {/* Progress indicator */}
        <div className="relative z-10 px-6 lg:px-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div
                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        index <= currentStep ? colors.accent : colors.border,
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm font-medium" style={{ color: colors.textMuted }}>
                Step {currentStep + 1} of {steps.length}
              </p>
              <p className="text-sm font-medium" style={{ color: colors.text }}>
                {steps[currentStep].title}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="relative z-10 px-6 lg:px-8 pb-32">
          <div className="max-w-3xl mx-auto">
            <div
              className="p-8 sm:p-12 rounded-3xl"
              style={{
                backgroundColor: colors.bgAlt,
                border: `1px solid ${colors.border}`,
                boxShadow: "0 4px 40px rgba(0,0,0,0.03)",
              }}
            >
              {renderStep()}
            </div>
          </div>
        </main>

        {/* Navigation buttons */}
        <div
          className="fixed bottom-0 left-0 right-0 z-20 px-6 lg:px-8 py-6"
          style={{
            backgroundColor: "rgba(250, 250, 250, 0.9)",
            backdropFilter: "blur(12px)",
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-base font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-black/5"
              style={{ color: colors.text }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-base font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentLight} 100%)`,
                color: "white",
                boxShadow: `0 4px 14px ${colors.accent}30`,
              }}
            >
              {currentStep === steps.length - 1 ? "See My Dashboard" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
