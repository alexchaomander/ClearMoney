"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calculator,
  Check,
  CreditCard,
  Edit3,
  Save,
  Shield,
  Target,
  TrendingUp,
  User,
  Wallet,
  X,
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

// Mock profile data
const initialProfileData = {
  personal: {
    name: "Sarah Chen",
    age: 32,
    occupation: "Software Engineer",
    employer: "Tech Corp Inc.",
    location: "San Francisco, CA",
    memberSince: "January 2026",
  },
  income: {
    salary: 150000,
    bonus: 15000,
    equity: 25000,
    rental: 0,
    other: 0,
  },
  assets: {
    "401k": 78000,
    rothIra: 18400,
    brokerage: 10000,
    savings: 15000,
    realEstate: 0,
    other: 0,
  },
  liabilities: {
    mortgage: 0,
    mortgageRate: 0,
    studentLoans: 30000,
    studentRate: 5.5,
    autoLoans: 0,
    autoRate: 0,
    creditCards: 4000,
    creditRate: 22.0,
    other: 0,
    otherRate: 0,
  },
  goals: [
    { id: "retire-early", label: "Retire Early", active: true },
    { id: "build-wealth", label: "Build Wealth", active: true },
    { id: "debt-free", label: "Become Debt-Free", active: true },
    { id: "emergency", label: "Build Emergency Fund", active: true },
    { id: "buy-home", label: "Purchase a Home", active: false },
    { id: "education", label: "Fund Education", active: false },
    { id: "travel", label: "Travel More", active: false },
    { id: "giving", label: "Charitable Giving", active: false },
  ],
  riskTolerance: "moderate",
};

// Section edit state type
type EditSection = "income" | "assets" | "liabilities" | "goals" | "risk" | null;

// Navigation component
function Navigation() {
  return (
    <header
      className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b"
      style={{ borderColor: emerald[900] + "60" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <nav className="flex items-center justify-between h-16">
          <Link href="/designs/design-10-monochrome" className="flex items-center gap-3 group">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{ backgroundColor: emerald[800] }}
            >
              <Calculator className="w-4 h-4 text-emerald-100" />
            </div>
            <span className="font-serif text-xl tracking-tight text-white">
              Clear<span style={{ color: emerald[400] }}>Money</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {[
              { label: "Dashboard", href: "/designs/design-10-monochrome/dashboard" },
              { label: "Recommendations", href: "/designs/design-10-monochrome/recommendations" },
              { label: "Progress", href: "/designs/design-10-monochrome/progress" },
              { label: "Profile", href: "/designs/design-10-monochrome/profile", active: true },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200"
                style={{
                  color: item.active ? emerald[100] : emerald[400],
                  backgroundColor: item.active ? emerald[900] + "60" : "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}

// Editable field component
function EditableField({
  label,
  value,
  type = "text",
  prefix,
  suffix,
  onChange,
  isEditing,
}: {
  label: string;
  value: string | number;
  type?: "text" | "number";
  prefix?: string;
  suffix?: string;
  onChange: (value: string) => void;
  isEditing: boolean;
}) {
  if (!isEditing) {
    return (
      <div className="py-3 flex items-center justify-between border-b" style={{ borderColor: emerald[900] }}>
        <span className="text-sm" style={{ color: emerald[500] }}>
          {label}
        </span>
        <span className="font-medium" style={{ color: emerald[200] }}>
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix}
        </span>
      </div>
    );
  }

  return (
    <div className="py-3 flex items-center justify-between gap-4 border-b" style={{ borderColor: emerald[900] }}>
      <label className="text-sm flex-shrink-0" style={{ color: emerald[500] }}>
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: emerald[500] }}
          >
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-40 px-3 py-2 rounded-lg text-right text-sm outline-none transition-all duration-200"
          style={{
            backgroundColor: emerald[900] + "60",
            border: `1px solid ${emerald[800]}`,
            color: emerald[100],
            paddingLeft: prefix ? "1.75rem" : "0.75rem",
            paddingRight: suffix ? "2rem" : "0.75rem",
          }}
        />
        {suffix && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
            style={{ color: emerald[500] }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// Section card component
function SectionCard({
  title,
  icon: Icon,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: emerald[950],
        border: `1px solid ${isEditing ? emerald[700] : emerald[900]}`,
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${emerald[900]}` }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: emerald[900] }}
          >
            <Icon className="w-5 h-5" style={{ color: emerald[400] }} />
          </div>
          <h2 className="font-serif text-lg" style={{ color: emerald[100] }}>
            {title}
          </h2>
        </div>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ color: emerald[500] }}
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={onSave}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
              style={{ backgroundColor: emerald[500], color: emerald[950] }}
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
            style={{ backgroundColor: emerald[900], color: emerald[300] }}
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 py-2">{children}</div>
    </motion.div>
  );
}

// Goals section component
function GoalsSection({
  goals,
  isEditing,
  onToggle,
}: {
  goals: typeof initialProfileData.goals;
  isEditing: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="py-3 grid sm:grid-cols-2 gap-3">
      {goals.map((goal) => (
        <motion.button
          key={goal.id}
          onClick={() => isEditing && onToggle(goal.id)}
          disabled={!isEditing}
          whileHover={isEditing ? { scale: 1.02 } : {}}
          whileTap={isEditing ? { scale: 0.98 } : {}}
          className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
          style={{
            backgroundColor: goal.active ? emerald[800] + "40" : emerald[900] + "40",
            border: `1px solid ${goal.active ? emerald[600] : emerald[900]}`,
            cursor: isEditing ? "pointer" : "default",
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: goal.active ? emerald[500] : "transparent",
              border: `2px solid ${goal.active ? emerald[500] : emerald[700]}`,
            }}
          >
            {goal.active && <Check className="w-3 h-3" style={{ color: emerald[950] }} />}
          </div>
          <span
            className="text-sm font-medium"
            style={{ color: goal.active ? emerald[200] : emerald[500] }}
          >
            {goal.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

// Risk tolerance section
function RiskSection({
  value,
  isEditing,
  onChange,
}: {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}) {
  const options = [
    {
      id: "conservative",
      label: "Conservative",
      description: "Preserve capital, minimize volatility",
    },
    {
      id: "moderate",
      label: "Moderate",
      description: "Balance growth and stability",
    },
    {
      id: "aggressive",
      label: "Aggressive",
      description: "Maximize growth potential",
    },
  ];

  return (
    <div className="py-3 space-y-3">
      {options.map((option) => (
        <motion.button
          key={option.id}
          onClick={() => isEditing && onChange(option.id)}
          disabled={!isEditing}
          whileHover={isEditing ? { scale: 1.01 } : {}}
          className="w-full flex items-center gap-4 p-4 rounded-lg transition-all duration-200 text-left"
          style={{
            backgroundColor: value === option.id ? emerald[800] + "40" : emerald[900] + "40",
            border: `1px solid ${value === option.id ? emerald[600] : emerald[900]}`,
            cursor: isEditing ? "pointer" : "default",
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: value === option.id ? emerald[500] : "transparent",
              border: `2px solid ${value === option.id ? emerald[500] : emerald[700]}`,
            }}
          >
            {value === option.id && (
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: emerald[950] }} />
            )}
          </div>
          <div>
            <h4
              className="font-medium"
              style={{ color: value === option.id ? emerald[200] : emerald[400] }}
            >
              {option.label}
            </h4>
            <p className="text-sm" style={{ color: emerald[600] }}>
              {option.description}
            </p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Main profile page
export default function ProfilePage() {
  const [profileData, setProfileData] = useState(initialProfileData);
  const [editingSection, setEditingSection] = useState<EditSection>(null);
  const [tempData, setTempData] = useState(initialProfileData);

  const handleEdit = (section: EditSection) => {
    setTempData(profileData);
    setEditingSection(section);
  };

  const handleSave = () => {
    setProfileData(tempData);
    setEditingSection(null);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setEditingSection(null);
  };

  const updateTempIncome = (field: string, value: string) => {
    setTempData((prev) => ({
      ...prev,
      income: { ...prev.income, [field]: parseInt(value) || 0 },
    }));
  };

  const updateTempAssets = (field: string, value: string) => {
    setTempData((prev) => ({
      ...prev,
      assets: { ...prev.assets, [field]: parseInt(value) || 0 },
    }));
  };

  const updateTempLiabilities = (field: string, value: string) => {
    const numValue = field.includes("Rate") ? parseFloat(value) || 0 : parseInt(value) || 0;
    setTempData((prev) => ({
      ...prev,
      liabilities: { ...prev.liabilities, [field]: numValue },
    }));
  };

  const toggleGoal = (goalId: string) => {
    setTempData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goalId ? { ...g, active: !g.active } : g)),
    }));
  };

  const totalIncome = Object.values(profileData.income).reduce((sum, val) => sum + val, 0);
  const totalAssets = Object.values(profileData.assets).reduce((sum, val) => sum + val, 0);
  const totalLiabilities =
    profileData.liabilities.mortgage +
    profileData.liabilities.studentLoans +
    profileData.liabilities.autoLoans +
    profileData.liabilities.creditCards +
    profileData.liabilities.other;

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

        <Navigation />

        <main className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4" style={{ color: emerald[500] }} />
              <span className="text-sm" style={{ color: emerald[500] }}>
                Your Profile
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-white mb-3">
              Financial <span className="italic" style={{ color: emerald[400] }}>Portrait</span>
            </h1>
            <p style={{ color: emerald[400] }}>
              Review and update your financial details to receive more accurate recommendations.
            </p>
          </motion.div>

          {/* Profile overview card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="p-6 rounded-xl mb-6"
            style={{
              backgroundColor: emerald[950],
              border: `1px solid ${emerald[900]}`,
            }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl font-medium"
                style={{ backgroundColor: emerald[800], color: emerald[200] }}
              >
                {profileData.personal.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h2 className="font-serif text-xl" style={{ color: emerald[100] }}>
                  {profileData.personal.name}
                </h2>
                <p className="text-sm" style={{ color: emerald[400] }}>
                  {profileData.personal.occupation} at {profileData.personal.employer}
                </p>
                <p className="text-sm" style={{ color: emerald[600] }}>
                  {profileData.personal.location} | Age {profileData.personal.age}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Total Income", value: `$${totalIncome.toLocaleString()}`, subtext: "Annual" },
                { label: "Total Assets", value: `$${totalAssets.toLocaleString()}`, subtext: "Net position" },
                { label: "Total Debt", value: `$${totalLiabilities.toLocaleString()}`, subtext: "Outstanding" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: emerald[900] + "40" }}
                >
                  <p className="text-sm mb-1" style={{ color: emerald[500] }}>
                    {stat.label}
                  </p>
                  <p className="font-serif text-xl font-medium" style={{ color: emerald[200] }}>
                    {stat.value}
                  </p>
                  <p className="text-xs" style={{ color: emerald[600] }}>
                    {stat.subtext}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Sections grid */}
          <div className="space-y-6">
            {/* Income section */}
            <SectionCard
              title="Income & Career"
              icon={Briefcase}
              isEditing={editingSection === "income"}
              onEdit={() => handleEdit("income")}
              onSave={handleSave}
              onCancel={handleCancel}
            >
              <EditableField
                label="Base Salary"
                value={editingSection === "income" ? tempData.income.salary : profileData.income.salary}
                type="number"
                prefix="$"
                onChange={(v) => updateTempIncome("salary", v)}
                isEditing={editingSection === "income"}
              />
              <EditableField
                label="Annual Bonus"
                value={editingSection === "income" ? tempData.income.bonus : profileData.income.bonus}
                type="number"
                prefix="$"
                onChange={(v) => updateTempIncome("bonus", v)}
                isEditing={editingSection === "income"}
              />
              <EditableField
                label="Equity Compensation"
                value={editingSection === "income" ? tempData.income.equity : profileData.income.equity}
                type="number"
                prefix="$"
                onChange={(v) => updateTempIncome("equity", v)}
                isEditing={editingSection === "income"}
              />
              <EditableField
                label="Rental Income"
                value={editingSection === "income" ? tempData.income.rental : profileData.income.rental}
                type="number"
                prefix="$"
                onChange={(v) => updateTempIncome("rental", v)}
                isEditing={editingSection === "income"}
              />
              <EditableField
                label="Other Income"
                value={editingSection === "income" ? tempData.income.other : profileData.income.other}
                type="number"
                prefix="$"
                onChange={(v) => updateTempIncome("other", v)}
                isEditing={editingSection === "income"}
              />
            </SectionCard>

            {/* Assets section */}
            <SectionCard
              title="Assets"
              icon={Wallet}
              isEditing={editingSection === "assets"}
              onEdit={() => handleEdit("assets")}
              onSave={handleSave}
              onCancel={handleCancel}
            >
              <EditableField
                label="401(k) / 403(b)"
                value={editingSection === "assets" ? tempData.assets["401k"] : profileData.assets["401k"]}
                type="number"
                prefix="$"
                onChange={(v) => updateTempAssets("401k", v)}
                isEditing={editingSection === "assets"}
              />
              <EditableField
                label="Roth IRA"
                value={editingSection === "assets" ? tempData.assets.rothIra : profileData.assets.rothIra}
                type="number"
                prefix="$"
                onChange={(v) => updateTempAssets("rothIra", v)}
                isEditing={editingSection === "assets"}
              />
              <EditableField
                label="Brokerage"
                value={editingSection === "assets" ? tempData.assets.brokerage : profileData.assets.brokerage}
                type="number"
                prefix="$"
                onChange={(v) => updateTempAssets("brokerage", v)}
                isEditing={editingSection === "assets"}
              />
              <EditableField
                label="Savings / Cash"
                value={editingSection === "assets" ? tempData.assets.savings : profileData.assets.savings}
                type="number"
                prefix="$"
                onChange={(v) => updateTempAssets("savings", v)}
                isEditing={editingSection === "assets"}
              />
              <EditableField
                label="Real Estate Equity"
                value={editingSection === "assets" ? tempData.assets.realEstate : profileData.assets.realEstate}
                type="number"
                prefix="$"
                onChange={(v) => updateTempAssets("realEstate", v)}
                isEditing={editingSection === "assets"}
              />
            </SectionCard>

            {/* Liabilities section */}
            <SectionCard
              title="Liabilities"
              icon={CreditCard}
              isEditing={editingSection === "liabilities"}
              onEdit={() => handleEdit("liabilities")}
              onSave={handleSave}
              onCancel={handleCancel}
            >
              <div className="space-y-1">
                <EditableField
                  label="Student Loans"
                  value={editingSection === "liabilities" ? tempData.liabilities.studentLoans : profileData.liabilities.studentLoans}
                  type="number"
                  prefix="$"
                  onChange={(v) => updateTempLiabilities("studentLoans", v)}
                  isEditing={editingSection === "liabilities"}
                />
                <EditableField
                  label="Student Loan Rate"
                  value={editingSection === "liabilities" ? tempData.liabilities.studentRate : profileData.liabilities.studentRate}
                  type="number"
                  suffix="%"
                  onChange={(v) => updateTempLiabilities("studentRate", v)}
                  isEditing={editingSection === "liabilities"}
                />
              </div>
              <div className="space-y-1 mt-4">
                <EditableField
                  label="Credit Cards"
                  value={editingSection === "liabilities" ? tempData.liabilities.creditCards : profileData.liabilities.creditCards}
                  type="number"
                  prefix="$"
                  onChange={(v) => updateTempLiabilities("creditCards", v)}
                  isEditing={editingSection === "liabilities"}
                />
                <EditableField
                  label="Credit Card Rate"
                  value={editingSection === "liabilities" ? tempData.liabilities.creditRate : profileData.liabilities.creditRate}
                  type="number"
                  suffix="%"
                  onChange={(v) => updateTempLiabilities("creditRate", v)}
                  isEditing={editingSection === "liabilities"}
                />
              </div>
              <div className="space-y-1 mt-4">
                <EditableField
                  label="Mortgage"
                  value={editingSection === "liabilities" ? tempData.liabilities.mortgage : profileData.liabilities.mortgage}
                  type="number"
                  prefix="$"
                  onChange={(v) => updateTempLiabilities("mortgage", v)}
                  isEditing={editingSection === "liabilities"}
                />
                <EditableField
                  label="Auto Loans"
                  value={editingSection === "liabilities" ? tempData.liabilities.autoLoans : profileData.liabilities.autoLoans}
                  type="number"
                  prefix="$"
                  onChange={(v) => updateTempLiabilities("autoLoans", v)}
                  isEditing={editingSection === "liabilities"}
                />
              </div>
            </SectionCard>

            {/* Goals section */}
            <SectionCard
              title="Aspirations"
              icon={Target}
              isEditing={editingSection === "goals"}
              onEdit={() => handleEdit("goals")}
              onSave={handleSave}
              onCancel={handleCancel}
            >
              <GoalsSection
                goals={editingSection === "goals" ? tempData.goals : profileData.goals}
                isEditing={editingSection === "goals"}
                onToggle={toggleGoal}
              />
            </SectionCard>

            {/* Risk tolerance section */}
            <SectionCard
              title="Risk Comfort"
              icon={TrendingUp}
              isEditing={editingSection === "risk"}
              onEdit={() => handleEdit("risk")}
              onSave={handleSave}
              onCancel={handleCancel}
            >
              <RiskSection
                value={editingSection === "risk" ? tempData.riskTolerance : profileData.riskTolerance}
                isEditing={editingSection === "risk"}
                onChange={(v) => setTempData((prev) => ({ ...prev, riskTolerance: v }))}
              />
            </SectionCard>
          </div>

          {/* Bottom info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 p-5 rounded-xl"
            style={{
              backgroundColor: emerald[950],
              border: `1px solid ${emerald[900]}`,
            }}
          >
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: emerald[500] }} />
              <div>
                <h3 className="font-medium mb-1" style={{ color: emerald[200] }}>
                  Your data remains private
                </h3>
                <p className="text-sm" style={{ color: emerald[500] }}>
                  All financial information is stored locally in your browser. We never transmit your personal
                  data to our servers or third parties. Your privacy is paramount.
                </p>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
