"use client";

import { useState } from "react";
import {
  Check,
  User,
  DollarSign,
  Wallet,
  CreditCard,
  Target,
  Shield,
  Edit3,
  Save,
  X,
} from "lucide-react";
import {
  colors,
  GradientBlob,
  GlobalStyles,
  NoiseTexture,
  AppNavigation,
  mockUser,
} from "../shared";

// ============================================================================
// PROFILE PAGE
// ============================================================================
// Clean, spacious profile editor with sections:
// - Personal Info
// - Income
// - Assets
// - Debts
// - Goals
// - Risk Tolerance
// ============================================================================

interface ProfileData {
  // Personal
  name: string;
  age: string;
  occupation: string;
  email: string;
  // Income
  annualIncome: string;
  employerMatch: string;
  monthlyExpenses: string;
  // Assets
  checking: string;
  savings: string;
  retirement401k: string;
  rothIra: string;
  brokerage: string;
  crypto: string;
  // Debts
  studentLoans: string;
  creditCards: string;
  carLoan: string;
  mortgage: string;
  // Goals & Risk
  goals: string[];
  riskTolerance: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const parseCurrency = (value: string) => {
  const num = parseInt(value.replace(/[^0-9]/g, ""), 10);
  return isNaN(num) ? 0 : num;
};

const goalOptions = [
  { id: "emergency", label: "Build emergency fund" },
  { id: "retirement", label: "Retire comfortably" },
  { id: "house", label: "Buy a home" },
  { id: "debt-free", label: "Become debt-free" },
  { id: "invest", label: "Start investing" },
  { id: "fire", label: "Achieve FIRE" },
  { id: "education", label: "Fund education" },
  { id: "travel", label: "Travel more" },
];

const riskOptions = [
  { id: "conservative", label: "Conservative", allocation: "20/80" },
  { id: "moderate", label: "Moderate", allocation: "60/40" },
  { id: "moderate-aggressive", label: "Moderate Aggressive", allocation: "80/20" },
  { id: "aggressive", label: "Aggressive", allocation: "95/5" },
];

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

function SectionCard({
  title,
  icon: Icon,
  children,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  title: string;
  icon: typeof User;
  children: React.ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        backgroundColor: colors.bgAlt,
        border: `1px solid ${colors.border}`,
      }}
    >
      <div
        className="px-8 py-5 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${colors.accent}10` }}
          >
            <Icon className="w-5 h-5" style={{ color: colors.accent }} />
          </div>
          <h2 className="text-xl font-bold" style={{ color: colors.text }}>
            {title}
          </h2>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-black/5"
              style={{ color: colors.textMuted }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: colors.success,
                color: "white",
              }}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-black/5"
            style={{ color: colors.accent }}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      <div className="p-8">{children}</div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  prefix,
  isEditing,
  displayValue,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  isEditing: boolean;
  displayValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: colors.textMuted }}>
        {label}
      </label>
      {isEditing ? (
        <div className="relative">
          {prefix && (
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-base"
              style={{ color: colors.textLight }}
            >
              {prefix}
            </span>
          )}
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-base outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
            style={{
              backgroundColor: colors.bg,
              border: `1px solid ${colors.border}`,
              color: colors.text,
              paddingLeft: prefix ? "2rem" : "1rem",
            }}
          />
        </div>
      ) : (
        <p className="text-lg font-semibold" style={{ color: colors.text }}>
          {displayValue || value || "Not set"}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN PROFILE PAGE
// ============================================================================

export default function ProfilePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showSaveToast, setShowSaveToast] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    name: mockUser.name,
    age: mockUser.age.toString(),
    occupation: mockUser.occupation,
    email: mockUser.email,
    annualIncome: mockUser.income.toString(),
    employerMatch: mockUser.employerMatch,
    monthlyExpenses: mockUser.monthlyExpenses.toString(),
    checking: mockUser.assets.checking.toString(),
    savings: mockUser.assets.savings.toString(),
    retirement401k: mockUser.assets["401k"].toString(),
    rothIra: mockUser.assets.rothIra.toString(),
    brokerage: mockUser.assets.brokerage.toString(),
    crypto: mockUser.assets.crypto.toString(),
    studentLoans: mockUser.debts.studentLoans.toString(),
    creditCards: mockUser.debts.creditCards.toString(),
    carLoan: mockUser.debts.carLoan.toString(),
    mortgage: mockUser.debts.mortgage.toString(),
    goals: ["emergency", "retirement", "house", "debt-free"],
    riskTolerance: mockUser.riskTolerance,
  });

  const [tempData, setTempData] = useState<ProfileData>(profileData);

  const handleEdit = (section: string) => {
    setTempData(profileData);
    setEditingSection(section);
  };

  const handleSave = () => {
    setProfileData(tempData);
    setEditingSection(null);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setEditingSection(null);
  };

  const toggleGoal = (goalId: string) => {
    const newGoals = tempData.goals.includes(goalId)
      ? tempData.goals.filter((g) => g !== goalId)
      : [...tempData.goals, goalId];
    setTempData({ ...tempData, goals: newGoals });
  };

  const totalAssets =
    parseCurrency(profileData.checking) +
    parseCurrency(profileData.savings) +
    parseCurrency(profileData.retirement401k) +
    parseCurrency(profileData.rothIra) +
    parseCurrency(profileData.brokerage) +
    parseCurrency(profileData.crypto);

  const totalDebts =
    parseCurrency(profileData.studentLoans) +
    parseCurrency(profileData.creditCards) +
    parseCurrency(profileData.carLoan) +
    parseCurrency(profileData.mortgage);

  return (
    <>
      <GlobalStyles />

      <div className="min-h-screen relative" style={{ backgroundColor: colors.bg }}>
        {/* Gradient blobs */}
        <GradientBlob
          color={colors.blob1}
          size={600}
          top="-10%"
          left="-5%"
          opacity={0.2}
          blur={100}
        />
        <GradientBlob
          color={colors.blob4}
          size={500}
          bottom="20%"
          right="-10%"
          opacity={0.15}
          blur={90}
        />

        <NoiseTexture />
        <AppNavigation currentPage="profile" />

        {/* Save toast */}
        {showSaveToast && (
          <div
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg"
            style={{
              backgroundColor: colors.success,
              color: "white",
            }}
          >
            <Check className="w-5 h-5" />
            Changes saved successfully
          </div>
        )}

        {/* Main content */}
        <main className="relative z-10 pt-28 pb-16 px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: colors.text }}>
                Your Profile
              </h1>
              <p className="text-xl" style={{ color: colors.textMuted }}>
                Keep your information up to date for the most accurate recommendations.
              </p>
            </div>

            {/* Summary card */}
            <div
              className="p-8 rounded-3xl mb-8 grid sm:grid-cols-3 gap-8"
              style={{
                backgroundColor: colors.bgAlt,
                border: `1px solid ${colors.border}`,
              }}
            >
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textMuted }}>
                  Net Worth
                </p>
                <p className="text-3xl font-bold" style={{ color: colors.text }}>
                  {formatCurrency(totalAssets - totalDebts)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textMuted }}>
                  Total Assets
                </p>
                <p className="text-3xl font-bold" style={{ color: colors.success }}>
                  {formatCurrency(totalAssets)}
                </p>
              </div>
              <div>
                <p className="text-sm mb-1" style={{ color: colors.textMuted }}>
                  Total Debts
                </p>
                <p className="text-3xl font-bold" style={{ color: colors.warning }}>
                  {formatCurrency(totalDebts)}
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {/* Personal Info */}
              <SectionCard
                title="Personal Information"
                icon={User}
                isEditing={editingSection === "personal"}
                onEdit={() => handleEdit("personal")}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    label="Name"
                    value={tempData.name}
                    onChange={(v) => setTempData({ ...tempData, name: v })}
                    isEditing={editingSection === "personal"}
                  />
                  <FormField
                    label="Age"
                    value={tempData.age}
                    onChange={(v) => setTempData({ ...tempData, age: v })}
                    isEditing={editingSection === "personal"}
                  />
                  <FormField
                    label="Occupation"
                    value={tempData.occupation}
                    onChange={(v) => setTempData({ ...tempData, occupation: v })}
                    isEditing={editingSection === "personal"}
                  />
                  <FormField
                    label="Email"
                    value={tempData.email}
                    onChange={(v) => setTempData({ ...tempData, email: v })}
                    isEditing={editingSection === "personal"}
                  />
                </div>
              </SectionCard>

              {/* Income */}
              <SectionCard
                title="Income & Expenses"
                icon={DollarSign}
                isEditing={editingSection === "income"}
                onEdit={() => handleEdit("income")}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                <div className="grid sm:grid-cols-3 gap-6">
                  <FormField
                    label="Annual Income"
                    value={tempData.annualIncome}
                    onChange={(v) => setTempData({ ...tempData, annualIncome: v })}
                    prefix="$"
                    isEditing={editingSection === "income"}
                    displayValue={formatCurrency(parseCurrency(profileData.annualIncome))}
                  />
                  <FormField
                    label="Monthly Expenses"
                    value={tempData.monthlyExpenses}
                    onChange={(v) => setTempData({ ...tempData, monthlyExpenses: v })}
                    prefix="$"
                    isEditing={editingSection === "income"}
                    displayValue={formatCurrency(parseCurrency(profileData.monthlyExpenses))}
                  />
                  <FormField
                    label="Employer 401k Match"
                    value={tempData.employerMatch}
                    onChange={(v) => setTempData({ ...tempData, employerMatch: v })}
                    isEditing={editingSection === "income"}
                  />
                </div>
              </SectionCard>

              {/* Assets */}
              <SectionCard
                title="Assets"
                icon={Wallet}
                isEditing={editingSection === "assets"}
                onEdit={() => handleEdit("assets")}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                <div className="grid sm:grid-cols-3 gap-6">
                  <FormField
                    label="Checking"
                    value={tempData.checking}
                    onChange={(v) => setTempData({ ...tempData, checking: v })}
                    prefix="$"
                    isEditing={editingSection === "assets"}
                    displayValue={formatCurrency(parseCurrency(profileData.checking))}
                  />
                  <FormField
                    label="Savings / HYSA"
                    value={tempData.savings}
                    onChange={(v) => setTempData({ ...tempData, savings: v })}
                    prefix="$"
                    isEditing={editingSection === "assets"}
                    displayValue={formatCurrency(parseCurrency(profileData.savings))}
                  />
                  <FormField
                    label="401(k)"
                    value={tempData.retirement401k}
                    onChange={(v) => setTempData({ ...tempData, retirement401k: v })}
                    prefix="$"
                    isEditing={editingSection === "assets"}
                    displayValue={formatCurrency(parseCurrency(profileData.retirement401k))}
                  />
                  <FormField
                    label="Roth IRA"
                    value={tempData.rothIra}
                    onChange={(v) => setTempData({ ...tempData, rothIra: v })}
                    prefix="$"
                    isEditing={editingSection === "assets"}
                    displayValue={formatCurrency(parseCurrency(profileData.rothIra))}
                  />
                  <FormField
                    label="Brokerage"
                    value={tempData.brokerage}
                    onChange={(v) => setTempData({ ...tempData, brokerage: v })}
                    prefix="$"
                    isEditing={editingSection === "assets"}
                    displayValue={formatCurrency(parseCurrency(profileData.brokerage))}
                  />
                  <FormField
                    label="Crypto"
                    value={tempData.crypto}
                    onChange={(v) => setTempData({ ...tempData, crypto: v })}
                    prefix="$"
                    isEditing={editingSection === "assets"}
                    displayValue={formatCurrency(parseCurrency(profileData.crypto))}
                  />
                </div>
              </SectionCard>

              {/* Debts */}
              <SectionCard
                title="Debts"
                icon={CreditCard}
                isEditing={editingSection === "debts"}
                onEdit={() => handleEdit("debts")}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <FormField
                    label="Student Loans"
                    value={tempData.studentLoans}
                    onChange={(v) => setTempData({ ...tempData, studentLoans: v })}
                    prefix="$"
                    isEditing={editingSection === "debts"}
                    displayValue={formatCurrency(parseCurrency(profileData.studentLoans))}
                  />
                  <FormField
                    label="Credit Cards"
                    value={tempData.creditCards}
                    onChange={(v) => setTempData({ ...tempData, creditCards: v })}
                    prefix="$"
                    isEditing={editingSection === "debts"}
                    displayValue={formatCurrency(parseCurrency(profileData.creditCards))}
                  />
                  <FormField
                    label="Car Loan"
                    value={tempData.carLoan}
                    onChange={(v) => setTempData({ ...tempData, carLoan: v })}
                    prefix="$"
                    isEditing={editingSection === "debts"}
                    displayValue={formatCurrency(parseCurrency(profileData.carLoan))}
                  />
                  <FormField
                    label="Mortgage"
                    value={tempData.mortgage}
                    onChange={(v) => setTempData({ ...tempData, mortgage: v })}
                    prefix="$"
                    isEditing={editingSection === "debts"}
                    displayValue={formatCurrency(parseCurrency(profileData.mortgage))}
                  />
                </div>
              </SectionCard>

              {/* Goals */}
              <SectionCard
                title="Financial Goals"
                icon={Target}
                isEditing={editingSection === "goals"}
                onEdit={() => handleEdit("goals")}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                {editingSection === "goals" ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {goalOptions.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className="flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200"
                        style={{
                          backgroundColor: tempData.goals.includes(goal.id)
                            ? `${colors.accent}10`
                            : colors.bg,
                          border: `2px solid ${
                            tempData.goals.includes(goal.id) ? colors.accent : colors.border
                          }`,
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: tempData.goals.includes(goal.id)
                              ? colors.accent
                              : "transparent",
                            border: `2px solid ${
                              tempData.goals.includes(goal.id) ? colors.accent : colors.border
                            }`,
                          }}
                        >
                          {tempData.goals.includes(goal.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span
                          style={{
                            color: tempData.goals.includes(goal.id)
                              ? colors.accent
                              : colors.text,
                          }}
                        >
                          {goal.label}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profileData.goals.map((goalId) => {
                      const goal = goalOptions.find((g) => g.id === goalId);
                      return goal ? (
                        <span
                          key={goalId}
                          className="px-4 py-2 rounded-full text-sm font-medium"
                          style={{
                            backgroundColor: `${colors.accent}10`,
                            color: colors.accent,
                          }}
                        >
                          {goal.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </SectionCard>

              {/* Risk Tolerance */}
              <SectionCard
                title="Risk Tolerance"
                icon={Shield}
                isEditing={editingSection === "risk"}
                onEdit={() => handleEdit("risk")}
                onSave={handleSave}
                onCancel={handleCancel}
              >
                {editingSection === "risk" ? (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {riskOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setTempData({ ...tempData, riskTolerance: option.id })}
                        className="flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200"
                        style={{
                          backgroundColor:
                            tempData.riskTolerance === option.id
                              ? `${colors.accent}10`
                              : colors.bg,
                          border: `2px solid ${
                            tempData.riskTolerance === option.id ? colors.accent : colors.border
                          }`,
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor:
                              tempData.riskTolerance === option.id ? colors.accent : "transparent",
                            border: `2px solid ${
                              tempData.riskTolerance === option.id ? colors.accent : colors.border
                            }`,
                          }}
                        >
                          {tempData.riskTolerance === option.id && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <span
                            className="font-medium"
                            style={{
                              color:
                                tempData.riskTolerance === option.id ? colors.accent : colors.text,
                            }}
                          >
                            {option.label}
                          </span>
                          <span
                            className="text-sm ml-2"
                            style={{ color: colors.textMuted }}
                          >
                            ({option.allocation} stocks/bonds)
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <span
                      className="px-4 py-2 rounded-full text-base font-semibold"
                      style={{
                        backgroundColor: `${colors.accent}10`,
                        color: colors.accent,
                      }}
                    >
                      {riskOptions.find((o) => o.id === profileData.riskTolerance)?.label ||
                        "Not set"}
                    </span>
                    <span style={{ color: colors.textMuted }}>
                      {riskOptions.find((o) => o.id === profileData.riskTolerance)?.allocation ||
                        ""}{" "}
                      stocks/bonds
                    </span>
                  </div>
                )}
              </SectionCard>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
