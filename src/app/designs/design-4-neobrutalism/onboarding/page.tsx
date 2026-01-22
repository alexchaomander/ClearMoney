"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  DollarSign,
  Wallet,
  CreditCard,
  Target,
  Shield,
  Check,
  AlertTriangle,
} from "lucide-react";

// Step types
type Step = "income" | "assets" | "debts" | "goals" | "risk";

interface FormData {
  // Income
  annualIncome: string;
  employmentType: string;
  hasEquityComp: boolean;
  hasSideIncome: boolean;
  sideIncomeAmount: string;
  // Assets
  checking: string;
  savings: string;
  retirement401k: string;
  rothIRA: string;
  brokerage: string;
  homeEquity: string;
  // Debts
  creditCards: string;
  creditCardAPR: string;
  studentLoans: string;
  studentLoanRate: string;
  mortgage: string;
  carLoan: string;
  // Goals
  topGoal: string;
  retirementAge: string;
  emergencyMonths: string;
  // Risk
  riskTolerance: string;
  investingExperience: string;
}

const steps: { id: Step; title: string; icon: React.ElementType; description: string }[] = [
  { id: "income", title: "INCOME", icon: DollarSign, description: "Let's see what you're working with" },
  { id: "assets", title: "ASSETS", icon: Wallet, description: "What have you accumulated?" },
  { id: "debts", title: "DEBTS", icon: CreditCard, description: "Time to face the music" },
  { id: "goals", title: "GOALS", icon: Target, description: "Where do you want to be?" },
  { id: "risk", title: "RISK", icon: Shield, description: "How much volatility can you stomach?" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("income");
  const [formData, setFormData] = useState<FormData>({
    annualIncome: "",
    employmentType: "",
    hasEquityComp: false,
    hasSideIncome: false,
    sideIncomeAmount: "",
    checking: "",
    savings: "",
    retirement401k: "",
    rothIRA: "",
    brokerage: "",
    homeEquity: "",
    creditCards: "",
    creditCardAPR: "",
    studentLoans: "",
    studentLoanRate: "",
    mortgage: "",
    carLoan: "",
    topGoal: "",
    retirementAge: "",
    emergencyMonths: "",
    riskTolerance: "",
    investingExperience: "",
  });

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const updateField = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    } else {
      // Complete onboarding - redirect to dashboard
      router.push("/designs/design-4-neobrutalism/dashboard");
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black selection:bg-[#c5f82a] selection:text-black">
      {/* Custom Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Darker+Grotesque:wght@400;500;600;700;800;900&family=Space+Mono:wght@400;700&display=swap');

        .font-brutal {
          font-family: 'Darker Grotesque', sans-serif;
        }
        .font-mono-brutal {
          font-family: 'Space Mono', monospace;
        }

        .brutal-shadow {
          box-shadow: 4px 4px 0 0 #000;
        }
        .brutal-shadow-sm {
          box-shadow: 2px 2px 0 0 #000;
        }
        .brutal-shadow-lg {
          box-shadow: 6px 6px 0 0 #000;
        }
        .brutal-shadow-accent {
          box-shadow: 4px 4px 0 0 #c5f82a;
        }
        .brutal-shadow-hover:hover {
          box-shadow: 6px 6px 0 0 #000;
          transform: translate(-2px, -2px);
        }
        .brutal-shadow-active:active {
          box-shadow: 2px 2px 0 0 #000;
          transform: translate(2px, 2px);
        }

        .brutal-border {
          border: 3px solid #000;
        }
        .brutal-border-thick {
          border: 4px solid #000;
        }

        .brutal-grid {
          background-image:
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px);
          background-size: 40px 40px;
          background-position: -1px -1px;
        }

        .brutal-input {
          font-family: 'Space Mono', monospace;
          border: 3px solid #000;
          padding: 12px 16px;
          font-size: 18px;
          background: white;
          transition: all 0.15s ease;
        }
        .brutal-input:focus {
          outline: none;
          box-shadow: 4px 4px 0 0 #c5f82a;
          transform: translate(-2px, -2px);
        }
        .brutal-input::placeholder {
          color: #999;
        }
      `}</style>

      {/* Header */}
      <header className="brutal-border-thick border-t-0 border-l-0 border-r-0 bg-white">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          <Link href="/designs/design-4-neobrutalism" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#c5f82a] brutal-border flex items-center justify-center brutal-shadow-sm group-hover:bg-black transition-colors">
              <span className="font-mono-brutal text-xl font-bold group-hover:text-[#c5f82a] transition-colors">$</span>
            </div>
            <div className="font-brutal">
              <span className="text-2xl font-black tracking-tighter">CLEAR</span>
              <span className="text-2xl font-black tracking-tighter text-[#c5f82a] bg-black px-1">MONEY</span>
            </div>
          </Link>

          <div className="brutal-border bg-black text-[#c5f82a] px-4 py-2 font-mono-brutal text-sm">
            FINANCIAL AUDIT
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="brutal-border-thick border-t-0 border-l-0 border-r-0 bg-gray-100">
        <div className="h-3 bg-[#c5f82a] transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Step Indicators */}
      <div className="brutal-border-thick border-t-0 border-l-0 border-r-0 bg-white overflow-x-auto">
        <div className="flex min-w-max">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isComplete = index < currentStepIndex;

            return (
              <div
                key={step.id}
                className={`flex-1 min-w-[120px] px-4 py-3 border-r-3 border-black last:border-r-0 flex items-center gap-2 ${
                  isActive ? "bg-[#c5f82a]" : isComplete ? "bg-black text-white" : "bg-white"
                }`}
              >
                <div
                  className={`w-8 h-8 brutal-border flex items-center justify-center flex-shrink-0 ${
                    isActive ? "bg-black text-[#c5f82a]" : isComplete ? "bg-[#c5f82a] text-black" : "bg-white"
                  }`}
                >
                  {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`font-brutal font-bold text-sm hidden sm:block ${isActive || isComplete ? "" : "text-gray-500"}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12 md:py-16">
        <div className="mb-8">
          <div className="inline-block mb-4">
            <div className="brutal-border bg-black text-white px-3 py-1 font-mono-brutal text-xs">
              STEP {currentStepIndex + 1} OF {steps.length}
            </div>
          </div>
          <h1 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">
            {steps[currentStepIndex].title}
          </h1>
          <p className="font-brutal text-xl text-gray-600">{steps[currentStepIndex].description}</p>
        </div>

        {/* Form Steps */}
        <div className="space-y-6">
          {currentStep === "income" && (
            <>
              <div>
                <label className="block font-brutal font-bold text-lg mb-2">
                  Annual Gross Income
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal text-xl">$</span>
                  <input
                    type="text"
                    className="brutal-input w-full pl-10"
                    placeholder="150,000"
                    value={formData.annualIncome}
                    onChange={(e) => updateField("annualIncome", e.target.value)}
                  />
                </div>
                <p className="font-mono-brutal text-sm text-gray-500 mt-1">Before taxes. Include bonuses.</p>
              </div>

              <div>
                <label className="block font-brutal font-bold text-lg mb-2">
                  Employment Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["W-2 Employee", "Self-Employed", "1099 Contractor", "Business Owner"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("employmentType", type)}
                      className={`brutal-border p-3 font-brutal font-bold text-sm transition-colors ${
                        formData.employmentType === type
                          ? "bg-[#c5f82a] brutal-shadow-sm"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => updateField("hasEquityComp", !formData.hasEquityComp)}
                  className={`w-8 h-8 brutal-border flex items-center justify-center transition-colors ${
                    formData.hasEquityComp ? "bg-[#c5f82a]" : "bg-white"
                  }`}
                >
                  {formData.hasEquityComp && <Check className="w-5 h-5" />}
                </button>
                <label className="font-brutal font-bold text-lg cursor-pointer" onClick={() => updateField("hasEquityComp", !formData.hasEquityComp)}>
                  I have stock options, RSUs, or other equity compensation
                </label>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => updateField("hasSideIncome", !formData.hasSideIncome)}
                  className={`w-8 h-8 brutal-border flex items-center justify-center transition-colors ${
                    formData.hasSideIncome ? "bg-[#c5f82a]" : "bg-white"
                  }`}
                >
                  {formData.hasSideIncome && <Check className="w-5 h-5" />}
                </button>
                <label className="font-brutal font-bold text-lg cursor-pointer" onClick={() => updateField("hasSideIncome", !formData.hasSideIncome)}>
                  I have side income or rental income
                </label>
              </div>

              {formData.hasSideIncome && (
                <div>
                  <label className="block font-brutal font-bold text-lg mb-2">
                    Annual Side Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal text-xl">$</span>
                    <input
                      type="text"
                      className="brutal-input w-full pl-10"
                      placeholder="10,000"
                      value={formData.sideIncomeAmount}
                      onChange={(e) => updateField("sideIncomeAmount", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {currentStep === "assets" && (
            <>
              <div className="brutal-border bg-black text-white p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-[#c5f82a]" />
                  <span className="font-mono-brutal text-sm text-[#c5f82a]">DON&apos;T WORRY</span>
                </div>
                <p className="font-brutal">
                  We&apos;re not here to judge. Most people have less saved than they &quot;should.&quot; That&apos;s why you&apos;re here.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-brutal font-bold text-lg mb-2">Checking Account</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                    <input
                      type="text"
                      className="brutal-input w-full pl-10"
                      placeholder="5,000"
                      value={formData.checking}
                      onChange={(e) => updateField("checking", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-brutal font-bold text-lg mb-2">Savings / HYSA</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                    <input
                      type="text"
                      className="brutal-input w-full pl-10"
                      placeholder="15,000"
                      value={formData.savings}
                      onChange={(e) => updateField("savings", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-brutal font-bold text-lg mb-2">401(k) / 403(b)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                    <input
                      type="text"
                      className="brutal-input w-full pl-10"
                      placeholder="45,000"
                      value={formData.retirement401k}
                      onChange={(e) => updateField("retirement401k", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-brutal font-bold text-lg mb-2">Roth IRA</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                    <input
                      type="text"
                      className="brutal-input w-full pl-10"
                      placeholder="20,000"
                      value={formData.rothIRA}
                      onChange={(e) => updateField("rothIRA", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-brutal font-bold text-lg mb-2">Brokerage / Taxable</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                    <input
                      type="text"
                      className="brutal-input w-full pl-10"
                      placeholder="10,000"
                      value={formData.brokerage}
                      onChange={(e) => updateField("brokerage", e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-brutal font-bold text-lg mb-2">Home Equity</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                    <input
                      type="text"
                      className="brutal-input w-full pl-10"
                      placeholder="0"
                      value={formData.homeEquity}
                      onChange={(e) => updateField("homeEquity", e.target.value)}
                    />
                  </div>
                  <p className="font-mono-brutal text-sm text-gray-500 mt-1">Home value minus mortgage</p>
                </div>
              </div>
            </>
          )}

          {currentStep === "debts" && (
            <>
              <div className="brutal-border bg-[#c5f82a] p-4 mb-6">
                <p className="font-brutal font-bold text-lg">
                  &quot;The borrower is slave to the lender.&quot; Let&apos;s break those chains.
                </p>
              </div>

              <div className="space-y-6">
                <div className="brutal-border p-4 bg-white">
                  <h3 className="font-brutal font-black text-xl mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" /> Credit Cards
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-brutal font-bold mb-2">Total Balance</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                        <input
                          type="text"
                          className="brutal-input w-full pl-10"
                          placeholder="5,000"
                          value={formData.creditCards}
                          onChange={(e) => updateField("creditCards", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-brutal font-bold mb-2">Average APR</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="brutal-input w-full pr-10"
                          placeholder="22"
                          value={formData.creditCardAPR}
                          onChange={(e) => updateField("creditCardAPR", e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono-brutal">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="brutal-border p-4 bg-white">
                  <h3 className="font-brutal font-black text-xl mb-4">Student Loans</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-brutal font-bold mb-2">Total Balance</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                        <input
                          type="text"
                          className="brutal-input w-full pl-10"
                          placeholder="25,000"
                          value={formData.studentLoans}
                          onChange={(e) => updateField("studentLoans", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-brutal font-bold mb-2">Interest Rate</label>
                      <div className="relative">
                        <input
                          type="text"
                          className="brutal-input w-full pr-10"
                          placeholder="6.5"
                          value={formData.studentLoanRate}
                          onChange={(e) => updateField("studentLoanRate", e.target.value)}
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono-brutal">%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-brutal font-bold text-lg mb-2">Mortgage Balance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                      <input
                        type="text"
                        className="brutal-input w-full pl-10"
                        placeholder="0"
                        value={formData.mortgage}
                        onChange={(e) => updateField("mortgage", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-brutal font-bold text-lg mb-2">Car Loan</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                      <input
                        type="text"
                        className="brutal-input w-full pl-10"
                        placeholder="0"
                        value={formData.carLoan}
                        onChange={(e) => updateField("carLoan", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === "goals" && (
            <>
              <div>
                <label className="block font-brutal font-bold text-lg mb-2">
                  What&apos;s your #1 financial goal right now?
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Build emergency fund",
                    "Pay off debt",
                    "Save for house",
                    "Max retirement accounts",
                    "Achieve FIRE",
                    "Start investing",
                    "Build passive income",
                    "Save for big purchase",
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => updateField("topGoal", goal)}
                      className={`brutal-border p-4 font-brutal font-bold text-left transition-colors ${
                        formData.topGoal === goal
                          ? "bg-[#c5f82a] brutal-shadow-sm"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-brutal font-bold text-lg mb-2">
                  Target retirement age
                </label>
                <input
                  type="text"
                  className="brutal-input w-full md:w-48"
                  placeholder="55"
                  value={formData.retirementAge}
                  onChange={(e) => updateField("retirementAge", e.target.value)}
                />
                <p className="font-mono-brutal text-sm text-gray-500 mt-1">
                  Traditional is 65, but who wants traditional?
                </p>
              </div>

              <div>
                <label className="block font-brutal font-bold text-lg mb-2">
                  How many months of expenses should your emergency fund cover?
                </label>
                <div className="flex gap-3">
                  {["3", "6", "9", "12+"].map((months) => (
                    <button
                      key={months}
                      type="button"
                      onClick={() => updateField("emergencyMonths", months)}
                      className={`brutal-border px-6 py-3 font-mono-brutal font-bold transition-colors ${
                        formData.emergencyMonths === months
                          ? "bg-[#c5f82a] brutal-shadow-sm"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      {months}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {currentStep === "risk" && (
            <>
              <div>
                <label className="block font-brutal font-bold text-lg mb-4">
                  If your portfolio dropped 30% tomorrow, you would:
                </label>
                <div className="space-y-3">
                  {[
                    { value: "panic", label: "Sell everything. I can't handle this.", intensity: "Low risk tolerance" },
                    { value: "worried", label: "Feel sick but probably hold on.", intensity: "Moderate risk tolerance" },
                    { value: "calm", label: "Shrug. Markets do this sometimes.", intensity: "High risk tolerance" },
                    { value: "buy", label: "BUY THE DIP. Everything's on sale!", intensity: "Aggressive risk tolerance" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("riskTolerance", option.value)}
                      className={`brutal-border p-4 w-full text-left transition-colors ${
                        formData.riskTolerance === option.value
                          ? "bg-[#c5f82a] brutal-shadow-sm"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-brutal font-bold text-lg">{option.label}</div>
                      <div className="font-mono-brutal text-sm text-gray-600">{option.intensity}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-brutal font-bold text-lg mb-4">
                  Investing experience
                </label>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    { value: "none", label: "Never invested", description: "Total beginner" },
                    { value: "beginner", label: "Just started", description: "< 2 years" },
                    { value: "intermediate", label: "Know my way around", description: "2-5 years" },
                    { value: "advanced", label: "Options trader mode", description: "5+ years" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField("investingExperience", option.value)}
                      className={`brutal-border p-4 text-left transition-colors ${
                        formData.investingExperience === option.value
                          ? "bg-[#c5f82a] brutal-shadow-sm"
                          : "bg-white hover:bg-gray-100"
                      }`}
                    >
                      <div className="font-brutal font-bold">{option.label}</div>
                      <div className="font-mono-brutal text-sm text-gray-600">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-12 pt-8 border-t-3 border-black">
          {currentStepIndex > 0 ? (
            <button
              type="button"
              onClick={prevStep}
              className="inline-flex items-center gap-2 font-brutal font-bold text-lg px-6 py-3 bg-white text-black brutal-border brutal-shadow-sm brutal-shadow-hover brutal-shadow-active hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              BACK
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={nextStep}
            className="inline-flex items-center gap-2 font-brutal font-bold text-lg px-8 py-4 bg-[#c5f82a] text-black brutal-border brutal-shadow-lg brutal-shadow-hover brutal-shadow-active hover:bg-black hover:text-[#c5f82a] transition-colors"
          >
            {currentStepIndex === steps.length - 1 ? (
              <>
                SEE MY RESULTS
                <Check className="w-5 h-5" />
              </>
            ) : (
              <>
                CONTINUE
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
