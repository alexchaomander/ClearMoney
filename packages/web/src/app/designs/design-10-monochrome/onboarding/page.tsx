"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Calculator,
  ChevronRight,
  CreditCard,
  DollarSign,
  GraduationCap,
  Home,
  PiggyBank,
  Shield,
  TrendingUp,
  Wallet,
} from "lucide-react";

// Emerald color palette
const emerald = {
  950: "#022c22",
  900: "#064e3b",
  800: "#065f46",
  700: "#047857",
  600: "#059669",
  500: "#10b981",
  400: "#34d399",
  300: "#6ee7b7",
  200: "#a7f3d0",
  100: "#d1fae5",
  50: "#ecfdf5",
};

// Step configuration
const steps = [
  { id: "income", title: "Income", subtitle: "Your earnings" },
  { id: "assets", title: "Assets", subtitle: "What you own" },
  { id: "debts", title: "Debts", subtitle: "What you owe" },
  { id: "goals", title: "Goals", subtitle: "Your aspirations" },
  { id: "risk", title: "Risk", subtitle: "Your comfort" },
];

// Income sources
const incomeSources = [
  { id: "salary", label: "Salary / Wages", icon: Briefcase },
  { id: "bonus", label: "Bonuses", icon: DollarSign },
  { id: "equity", label: "Equity Compensation", icon: TrendingUp },
  { id: "rental", label: "Rental Income", icon: Building2 },
  { id: "business", label: "Business Income", icon: Calculator },
  { id: "other", label: "Other Income", icon: Wallet },
];

// Asset types
const assetTypes = [
  { id: "401k", label: "401(k) / 403(b)", icon: Shield },
  { id: "ira", label: "IRA (Traditional/Roth)", icon: PiggyBank },
  { id: "brokerage", label: "Brokerage Accounts", icon: TrendingUp },
  { id: "savings", label: "Savings / Cash", icon: DollarSign },
  { id: "realestate", label: "Real Estate", icon: Home },
  { id: "other", label: "Other Assets", icon: Calculator },
];

// Financial goals
const goalOptions = [
  { id: "retire-early", label: "Retire Early", description: "Financial independence before 60" },
  { id: "buy-home", label: "Purchase a Home", description: "Save for down payment" },
  { id: "debt-free", label: "Become Debt-Free", description: "Eliminate all debts" },
  { id: "build-wealth", label: "Build Wealth", description: "Grow net worth consistently" },
  { id: "education", label: "Fund Education", description: "College savings for family" },
  { id: "emergency", label: "Build Emergency Fund", description: "3-6 months of expenses" },
  { id: "travel", label: "Travel More", description: "Fund meaningful experiences" },
  { id: "giving", label: "Charitable Giving", description: "Give back meaningfully" },
];

// Risk tolerance levels
const riskLevels = [
  {
    id: "conservative",
    label: "Conservative",
    description: "Preserve capital, minimize volatility. Comfortable with modest returns for stability.",
    allocation: "70% Bonds, 30% Stocks",
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Balance growth and stability. Accept some volatility for better long-term returns.",
    allocation: "40% Bonds, 60% Stocks",
  },
  {
    id: "aggressive",
    label: "Aggressive",
    description: "Maximize growth potential. Comfortable with significant short-term volatility.",
    allocation: "10% Bonds, 90% Stocks",
  },
];

// Form data types
interface FormData {
  income: {
    salary: string;
    bonus: string;
    equity: string;
    rental: string;
    business: string;
    other: string;
  };
  assets: {
    "401k": string;
    ira: string;
    brokerage: string;
    savings: string;
    realestate: string;
    other: string;
  };
  debts: {
    mortgage: string;
    mortgageRate: string;
    student: string;
    studentRate: string;
    auto: string;
    autoRate: string;
    credit: string;
    creditRate: string;
    personal: string;
    personalRate: string;
    other: string;
    otherRate: string;
  };
  goals: string[];
  risk: string;
}

// Progress indicator component
function ProgressIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            initial={false}
            animate={{
              backgroundColor: index <= currentStep ? emerald[500] : emerald[900],
              scale: index === currentStep ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
            className="w-3 h-3 rounded-full"
          />
          {index < steps.length - 1 && (
            <motion.div
              initial={false}
              animate={{
                backgroundColor: index < currentStep ? emerald[500] : emerald[900],
              }}
              transition={{ duration: 0.3 }}
              className="w-8 h-0.5 mx-1"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Currency input component
function CurrencyInput({
  label,
  value,
  onChange,
  icon: Icon,
  placeholder = "0",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium" style={{ color: emerald[300] }}>
        <Icon className="w-4 h-4" style={{ color: emerald[500] }} />
        {label}
      </label>
      <div className="relative">
        <span
          className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-medium"
          style={{ color: emerald[500] }}
        >
          $
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const numericValue = e.target.value.replace(/[^0-9]/g, "");
            onChange(numericValue);
          }}
          placeholder={placeholder}
          className="w-full pl-8 pr-4 py-3 rounded-lg text-lg outline-none transition-all duration-300"
          style={{
            backgroundColor: emerald[950],
            border: `1px solid ${emerald[800]}`,
            color: emerald[100],
          }}
          onFocus={(e) => (e.target.style.borderColor = emerald[500])}
          onBlur={(e) => (e.target.style.borderColor = emerald[800])}
        />
      </div>
    </div>
  );
}

// Step components
function IncomeStep({
  data,
  onChange,
}: {
  data: FormData["income"];
  onChange: (field: keyof FormData["income"], value: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3">
          Let&apos;s understand your <span className="italic" style={{ color: emerald[400] }}>earnings</span>
        </h2>
        <p style={{ color: emerald[400] }}>
          Share your annual income sources. This helps us understand your cash flow.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {incomeSources.map((source) => (
          <CurrencyInput
            key={source.id}
            label={source.label}
            value={data[source.id as keyof typeof data]}
            onChange={(value) => onChange(source.id as keyof FormData["income"], value)}
            icon={source.icon}
          />
        ))}
      </div>

      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: emerald[900] + "40", border: `1px solid ${emerald[800]}` }}
      >
        <p className="text-sm" style={{ color: emerald[300] }}>
          <span className="font-medium" style={{ color: emerald[200] }}>
            Total Annual Income:
          </span>{" "}
          $
          {Object.values(data)
            .reduce((sum, val) => sum + (parseInt(val) || 0), 0)
            .toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

function AssetsStep({
  data,
  onChange,
}: {
  data: FormData["assets"];
  onChange: (field: keyof FormData["assets"], value: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3">
          What do you <span className="italic" style={{ color: emerald[400] }}>own</span>?
        </h2>
        <p style={{ color: emerald[400] }}>
          Current balances of your investment accounts and other assets.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {assetTypes.map((asset) => (
          <CurrencyInput
            key={asset.id}
            label={asset.label}
            value={data[asset.id as keyof typeof data]}
            onChange={(value) => onChange(asset.id as keyof FormData["assets"], value)}
            icon={asset.icon}
          />
        ))}
      </div>

      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: emerald[900] + "40", border: `1px solid ${emerald[800]}` }}
      >
        <p className="text-sm" style={{ color: emerald[300] }}>
          <span className="font-medium" style={{ color: emerald[200] }}>
            Total Assets:
          </span>{" "}
          $
          {Object.values(data)
            .reduce((sum, val) => sum + (parseInt(val) || 0), 0)
            .toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

function DebtsStep({
  data,
  onChange,
}: {
  data: FormData["debts"];
  onChange: (field: keyof FormData["debts"], value: string) => void;
}) {
  const debtFields = [
    { id: "mortgage", rateId: "mortgageRate", label: "Mortgage", icon: Home },
    { id: "student", rateId: "studentRate", label: "Student Loans", icon: GraduationCap },
    { id: "auto", rateId: "autoRate", label: "Auto Loans", icon: CreditCard },
    { id: "credit", rateId: "creditRate", label: "Credit Cards", icon: CreditCard },
    { id: "personal", rateId: "personalRate", label: "Personal Loans", icon: Wallet },
    { id: "other", rateId: "otherRate", label: "Other Debt", icon: Calculator },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3">
          What do you <span className="italic" style={{ color: emerald[400] }}>owe</span>?
        </h2>
        <p style={{ color: emerald[400] }}>
          Include balances and interest rates. We&apos;ll prioritize payoff strategies.
        </p>
      </div>

      <div className="space-y-6">
        {debtFields.map((debt) => (
          <div
            key={debt.id}
            className="p-4 rounded-lg"
            style={{ backgroundColor: emerald[950], border: `1px solid ${emerald[900]}` }}
          >
            <div className="flex items-center gap-2 mb-4">
              <debt.icon className="w-5 h-5" style={{ color: emerald[500] }} />
              <span className="font-medium" style={{ color: emerald[200] }}>
                {debt.label}
              </span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm" style={{ color: emerald[400] }}>
                  Balance
                </label>
                <div className="relative">
                  <span
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: emerald[500] }}
                  >
                    $
                  </span>
                  <input
                    type="text"
                    value={data[debt.id as keyof FormData["debts"]]}
                    onChange={(e) =>
                      onChange(
                        debt.id as keyof FormData["debts"],
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2.5 rounded-lg outline-none transition-all duration-300"
                    style={{
                      backgroundColor: emerald[900] + "60",
                      border: `1px solid ${emerald[800]}`,
                      color: emerald[100],
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm" style={{ color: emerald[400] }}>
                  Interest Rate
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={data[debt.rateId as keyof FormData["debts"]]}
                    onChange={(e) =>
                      onChange(
                        debt.rateId as keyof FormData["debts"],
                        e.target.value.replace(/[^0-9.]/g, "")
                      )
                    }
                    placeholder="0.0"
                    className="w-full px-4 py-2.5 rounded-lg outline-none transition-all duration-300"
                    style={{
                      backgroundColor: emerald[900] + "60",
                      border: `1px solid ${emerald[800]}`,
                      color: emerald[100],
                    }}
                  />
                  <span
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    style={{ color: emerald[500] }}
                  >
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: emerald[900] + "40", border: `1px solid ${emerald[800]}` }}
      >
        <p className="text-sm" style={{ color: emerald[300] }}>
          <span className="font-medium" style={{ color: emerald[200] }}>
            Total Debt:
          </span>{" "}
          $
          {["mortgage", "student", "auto", "credit", "personal", "other"]
            .reduce((sum, key) => sum + (parseInt(data[key as keyof FormData["debts"]]) || 0), 0)
            .toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
}

function GoalsStep({
  data,
  onChange,
}: {
  data: string[];
  onChange: (goals: string[]) => void;
}) {
  const toggleGoal = (goalId: string) => {
    if (data.includes(goalId)) {
      onChange(data.filter((g) => g !== goalId));
    } else {
      onChange([...data, goalId]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3">
          What are your <span className="italic" style={{ color: emerald[400] }}>aspirations</span>?
        </h2>
        <p style={{ color: emerald[400] }}>Select all that resonate with your financial journey.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {goalOptions.map((goal) => {
          const isSelected = data.includes(goal.id);
          return (
            <motion.button
              key={goal.id}
              onClick={() => toggleGoal(goal.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-lg text-left transition-all duration-300"
              style={{
                backgroundColor: isSelected ? emerald[800] + "60" : emerald[950],
                border: `1px solid ${isSelected ? emerald[500] : emerald[900]}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className="font-medium mb-1"
                    style={{ color: isSelected ? emerald[100] : emerald[200] }}
                  >
                    {goal.label}
                  </h3>
                  <p className="text-sm" style={{ color: emerald[400] }}>
                    {goal.description}
                  </p>
                </div>
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isSelected ? emerald[500] : "transparent",
                    borderColor: isSelected ? emerald[500] : emerald[700],
                  }}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-3"
                >
                  {isSelected && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke={emerald[950]}
                      strokeWidth={3}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </motion.div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {data.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg"
          style={{ backgroundColor: emerald[900] + "40", border: `1px solid ${emerald[800]}` }}
        >
          <p className="text-sm" style={{ color: emerald[300] }}>
            <span className="font-medium" style={{ color: emerald[200] }}>
              {data.length} goal{data.length !== 1 ? "s" : ""} selected
            </span>{" "}
            - We&apos;ll prioritize recommendations around these.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

function RiskStep({ data, onChange }: { data: string; onChange: (risk: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl sm:text-4xl text-white mb-3">
          Your risk <span className="italic" style={{ color: emerald[400] }}>comfort</span>
        </h2>
        <p style={{ color: emerald[400] }}>
          How do you feel about investment volatility? This guides our asset allocation suggestions.
        </p>
      </div>

      <div className="space-y-4">
        {riskLevels.map((level) => {
          const isSelected = data === level.id;
          return (
            <motion.button
              key={level.id}
              onClick={() => onChange(level.id)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full p-6 rounded-xl text-left transition-all duration-300"
              style={{
                backgroundColor: isSelected ? emerald[800] + "60" : emerald[950],
                border: `1px solid ${isSelected ? emerald[500] : emerald[900]}`,
              }}
            >
              <div className="flex items-start gap-4">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor: isSelected ? emerald[500] : "transparent",
                    borderColor: isSelected ? emerald[500] : emerald[700],
                  }}
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
                >
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: emerald[950] }}
                    />
                  )}
                </motion.div>
                <div className="flex-1">
                  <h3
                    className="font-serif text-xl mb-2"
                    style={{ color: isSelected ? emerald[100] : emerald[200] }}
                  >
                    {level.label}
                  </h3>
                  <p className="text-sm mb-3" style={{ color: emerald[400] }}>
                    {level.description}
                  </p>
                  <p
                    className="text-xs font-medium px-3 py-1.5 rounded-full inline-block"
                    style={{
                      backgroundColor: emerald[900],
                      color: emerald[300],
                    }}
                  >
                    Typical: {level.allocation}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Main onboarding component
export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    income: { salary: "", bonus: "", equity: "", rental: "", business: "", other: "" },
    assets: { "401k": "", ira: "", brokerage: "", savings: "", realestate: "", other: "" },
    debts: {
      mortgage: "",
      mortgageRate: "",
      student: "",
      studentRate: "",
      auto: "",
      autoRate: "",
      credit: "",
      creditRate: "",
      personal: "",
      personalRate: "",
      other: "",
      otherRate: "",
    },
    goals: [],
    risk: "",
  });

  const updateIncome = (field: keyof FormData["income"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      income: { ...prev.income, [field]: value },
    }));
  };

  const updateAssets = (field: keyof FormData["assets"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      assets: { ...prev.assets, [field]: value },
    }));
  };

  const updateDebts = (field: keyof FormData["debts"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      debts: { ...prev.debts, [field]: value },
    }));
  };

  const updateGoals = (goals: string[]) => {
    setFormData((prev) => ({ ...prev, goals }));
  };

  const updateRisk = (risk: string) => {
    setFormData((prev) => ({ ...prev, risk }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete onboarding - navigate to dashboard
      router.push("/designs/design-10-monochrome/dashboard");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Income
        return Object.values(formData.income).some((v) => v !== "");
      case 1: // Assets
        return true; // Can have no assets
      case 2: // Debts
        return true; // Can have no debts
      case 3: // Goals
        return formData.goals.length > 0;
      case 4: // Risk
        return formData.risk !== "";
      default:
        return true;
    }
  };

  return (
    <>
      {/* Custom fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@300;400;500;600&display=swap');

        .font-serif {
          font-family: 'Cormorant Garamond', Georgia, serif;
        }

        body {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }
      `}</style>

      <div className="min-h-screen bg-black">
        {/* Background */}
        <div
          className="fixed inset-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${emerald[900]}40 0%, transparent 60%)`,
          }}
        />

        {/* Header */}
        <header className="relative z-20 border-b" style={{ borderColor: emerald[900] }}>
          <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
            <Link href="/designs/design-10-monochrome" className="flex items-center gap-3 group">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{ backgroundColor: emerald[800] }}
              >
                <Calculator className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="font-serif text-xl tracking-tight text-white">
                Clear<span style={{ color: emerald[400] }}>Money</span>
              </span>
            </Link>

            <ProgressIndicator currentStep={currentStep} />
          </div>
        </header>

        {/* Step indicator */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 pt-8">
          <div className="flex items-center gap-2 text-sm" style={{ color: emerald[500] }}>
            <span className="font-medium" style={{ color: emerald[400] }}>
              Step {currentStep + 1}
            </span>
            <ChevronRight className="w-4 h-4" />
            <span style={{ color: emerald[300] }}>{steps[currentStep].title}</span>
          </div>
        </div>

        {/* Main content */}
        <main className="relative z-10 max-w-3xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <IncomeStep key="income" data={formData.income} onChange={updateIncome} />
            )}
            {currentStep === 1 && (
              <AssetsStep key="assets" data={formData.assets} onChange={updateAssets} />
            )}
            {currentStep === 2 && (
              <DebtsStep key="debts" data={formData.debts} onChange={updateDebts} />
            )}
            {currentStep === 3 && (
              <GoalsStep key="goals" data={formData.goals} onChange={updateGoals} />
            )}
            {currentStep === 4 && (
              <RiskStep key="risk" data={formData.risk} onChange={updateRisk} />
            )}
          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t" style={{ borderColor: emerald[900] }}>
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ color: emerald[300] }}
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>

            <motion.button
              onClick={handleNext}
              disabled={!canProceed()}
              whileHover={canProceed() ? { scale: 1.02 } : {}}
              whileTap={canProceed() ? { scale: 0.98 } : {}}
              className="flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: canProceed() ? emerald[500] : emerald[800],
                color: emerald[950],
              }}
            >
              {currentStep === steps.length - 1 ? "Complete" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </main>
      </div>
    </>
  );
}
