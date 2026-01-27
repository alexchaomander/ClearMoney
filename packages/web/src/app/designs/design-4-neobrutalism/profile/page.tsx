"use client";

import Link from "next/link";
import { useState } from "react";
import {
  TrendingUp,
  Home,
  BarChart3,
  Target,
  User,
  Menu,
  X,
  Wallet,
  CreditCard,
  Shield,
  Edit3,
  Save,
  Briefcase,
  Building,
  PiggyBank,
  Car,
  GraduationCap,
} from "lucide-react";

interface ProfileData {
  // Personal
  name: string;
  age: string;
  occupation: string;
  // Income
  annualIncome: string;
  employmentType: string;
  hasEquityComp: boolean;
  sideIncome: string;
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
  mortgageRate: string;
  carLoan: string;
  // Goals
  topGoal: string;
  retirementAge: string;
  emergencyMonths: string;
  // Risk
  riskTolerance: string;
  investingExperience: string;
}

const defaultProfile: ProfileData = {
  name: "Sarah",
  age: "32",
  occupation: "Software Engineer",
  annualIncome: "150,000",
  employmentType: "W-2 Employee",
  hasEquityComp: true,
  sideIncome: "5,000",
  checking: "8,400",
  savings: "12,000",
  retirement401k: "67,000",
  rothIRA: "23,000",
  brokerage: "12,000",
  homeEquity: "0",
  creditCards: "5,000",
  creditCardAPR: "22",
  studentLoans: "29,000",
  studentLoanRate: "6.5",
  mortgage: "0",
  mortgageRate: "",
  carLoan: "0",
  topGoal: "Achieve FIRE",
  retirementAge: "50",
  emergencyMonths: "6",
  riskTolerance: "buy",
  investingExperience: "intermediate",
};

export default function ProfilePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  const updateField = (field: keyof ProfileData, value: string | boolean) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = (section: string) => {
    setEditingSection(editingSection === section ? null : section);
  };

  // Calculate totals
  const totalAssets =
    parseFloat(profile.checking.replace(/,/g, "")) +
    parseFloat(profile.savings.replace(/,/g, "")) +
    parseFloat(profile.retirement401k.replace(/,/g, "")) +
    parseFloat(profile.rothIRA.replace(/,/g, "")) +
    parseFloat(profile.brokerage.replace(/,/g, "")) +
    parseFloat(profile.homeEquity.replace(/,/g, ""));

  const totalDebts =
    parseFloat(profile.creditCards.replace(/,/g, "")) +
    parseFloat(profile.studentLoans.replace(/,/g, "")) +
    parseFloat(profile.mortgage.replace(/,/g, "")) +
    parseFloat(profile.carLoan.replace(/,/g, ""));

  const netWorth = totalAssets - totalDebts;

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

        .brutal-input {
          font-family: 'Space Mono', monospace;
          border: 3px solid #000;
          padding: 8px 12px;
          font-size: 16px;
          background: white;
          width: 100%;
        }
        .brutal-input:focus {
          outline: none;
          box-shadow: 4px 4px 0 0 #c5f82a;
        }
      `}</style>

      {/* Header with Navigation */}
      <header className="brutal-border-thick border-t-0 border-l-0 border-r-0 bg-white sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
          <Link href="/designs/design-4-neobrutalism" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-[#c5f82a] brutal-border flex items-center justify-center brutal-shadow-sm group-hover:bg-black transition-colors">
              <span className="font-mono-brutal text-xl font-bold group-hover:text-[#c5f82a] transition-colors">$</span>
            </div>
            <div className="font-brutal hidden sm:block">
              <span className="text-2xl font-black tracking-tighter">CLEAR</span>
              <span className="text-2xl font-black tracking-tighter text-[#c5f82a] bg-black px-1">MONEY</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { name: "Home", href: "/designs/design-4-neobrutalism", icon: Home },
              { name: "Dashboard", href: "/designs/design-4-neobrutalism/dashboard", icon: BarChart3 },
              { name: "Recommendations", href: "/designs/design-4-neobrutalism/recommendations", icon: Target },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
              { name: "Progress", href: "/designs/design-4-neobrutalism/progress", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Profile";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`font-brutal font-bold px-4 py-2 brutal-border transition-colors flex items-center gap-2 ${
                    isActive ? "bg-[#c5f82a]" : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden brutal-border p-2 bg-white hover:bg-[#c5f82a] transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden brutal-border-thick border-t-0 bg-white">
            {[
              { name: "Home", href: "/designs/design-4-neobrutalism", icon: Home },
              { name: "Dashboard", href: "/designs/design-4-neobrutalism/dashboard", icon: BarChart3 },
              { name: "Recommendations", href: "/designs/design-4-neobrutalism/recommendations", icon: Target },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
              { name: "Progress", href: "/designs/design-4-neobrutalism/progress", icon: TrendingUp },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Profile";
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 font-brutal font-bold text-xl px-6 py-4 border-b-3 border-black transition-colors ${
                    isActive ? "bg-[#c5f82a]" : "hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block mb-2">
            <div className="brutal-border bg-black text-[#c5f82a] px-3 py-1 font-mono-brutal text-xs">
              YOUR FINANCIAL DNA
            </div>
          </div>
          <h1 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">
            PROFILE
          </h1>
          <p className="font-brutal text-xl text-gray-600">
            The more accurate your data, the better your recommendations. No judgment.
          </p>
        </div>

        {/* Net Worth Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="brutal-border bg-[#c5f82a] p-4">
            <div className="font-mono-brutal text-xs">TOTAL ASSETS</div>
            <div className="font-brutal text-2xl md:text-3xl font-black">
              ${totalAssets.toLocaleString()}
            </div>
          </div>
          <div className="brutal-border bg-red-100 p-4">
            <div className="font-mono-brutal text-xs">TOTAL DEBTS</div>
            <div className="font-brutal text-2xl md:text-3xl font-black text-red-600">
              ${totalDebts.toLocaleString()}
            </div>
          </div>
          <div className="brutal-border bg-black text-white p-4">
            <div className="font-mono-brutal text-xs text-[#c5f82a]">NET WORTH</div>
            <div className="font-brutal text-2xl md:text-3xl font-black text-[#c5f82a]">
              ${netWorth.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Income & Employment Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 brutal-border bg-[#c5f82a] flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <h2 className="font-brutal text-2xl font-black uppercase">INCOME & EMPLOYMENT</h2>
            </div>
            <button
              onClick={() => toggleEdit("income")}
              className="brutal-border px-3 py-1 flex items-center gap-2 hover:bg-[#c5f82a] transition-colors"
            >
              {editingSection === "income" ? (
                <>
                  <Save className="w-4 h-4" /> SAVE
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> EDIT
                </>
              )}
            </button>
          </div>

          <div className="brutal-border bg-white p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-brutal font-bold mb-2">Name</label>
                {editingSection === "income" ? (
                  <input
                    type="text"
                    className="brutal-input"
                    value={profile.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                ) : (
                  <div className="font-mono-brutal text-lg">{profile.name}</div>
                )}
              </div>
              <div>
                <label className="block font-brutal font-bold mb-2">Age</label>
                {editingSection === "income" ? (
                  <input
                    type="text"
                    className="brutal-input"
                    value={profile.age}
                    onChange={(e) => updateField("age", e.target.value)}
                  />
                ) : (
                  <div className="font-mono-brutal text-lg">{profile.age}</div>
                )}
              </div>
              <div>
                <label className="block font-brutal font-bold mb-2">Occupation</label>
                {editingSection === "income" ? (
                  <input
                    type="text"
                    className="brutal-input"
                    value={profile.occupation}
                    onChange={(e) => updateField("occupation", e.target.value)}
                  />
                ) : (
                  <div className="font-mono-brutal text-lg">{profile.occupation}</div>
                )}
              </div>
              <div>
                <label className="block font-brutal font-bold mb-2">Annual Income</label>
                {editingSection === "income" ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                    <input
                      type="text"
                      className="brutal-input pl-8"
                      value={profile.annualIncome}
                      onChange={(e) => updateField("annualIncome", e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="font-mono-brutal text-lg">${profile.annualIncome}</div>
                )}
              </div>
              <div>
                <label className="block font-brutal font-bold mb-2">Employment Type</label>
                {editingSection === "income" ? (
                  <select
                    className="brutal-input"
                    value={profile.employmentType}
                    onChange={(e) => updateField("employmentType", e.target.value)}
                  >
                    <option>W-2 Employee</option>
                    <option>Self-Employed</option>
                    <option>1099 Contractor</option>
                    <option>Business Owner</option>
                  </select>
                ) : (
                  <div className="font-mono-brutal text-lg">{profile.employmentType}</div>
                )}
              </div>
              <div>
                <label className="block font-brutal font-bold mb-2">Side Income</label>
                {editingSection === "income" ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                    <input
                      type="text"
                      className="brutal-input pl-8"
                      value={profile.sideIncome}
                      onChange={(e) => updateField("sideIncome", e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="font-mono-brutal text-lg">${profile.sideIncome}/yr</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Assets Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 brutal-border bg-[#c5f82a] flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="font-brutal text-2xl font-black uppercase">ASSETS</h2>
            </div>
            <button
              onClick={() => toggleEdit("assets")}
              className="brutal-border px-3 py-1 flex items-center gap-2 hover:bg-[#c5f82a] transition-colors"
            >
              {editingSection === "assets" ? (
                <>
                  <Save className="w-4 h-4" /> SAVE
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> EDIT
                </>
              )}
            </button>
          </div>

          <div className="brutal-border bg-white p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { key: "checking", label: "Checking Account", icon: Building },
                { key: "savings", label: "Savings / HYSA", icon: PiggyBank },
                { key: "retirement401k", label: "401(k) / 403(b)", icon: Briefcase },
                { key: "rothIRA", label: "Roth IRA", icon: Shield },
                { key: "brokerage", label: "Brokerage", icon: TrendingUp },
                { key: "homeEquity", label: "Home Equity", icon: Home },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key}>
                  <label className="flex items-center gap-2 font-brutal font-bold mb-2">
                    <Icon className="w-4 h-4" />
                    {label}
                  </label>
                  {editingSection === "assets" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                      <input
                        type="text"
                        className="brutal-input pl-8"
                        value={profile[key as keyof ProfileData] as string}
                        onChange={(e) => updateField(key as keyof ProfileData, e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="font-mono-brutal text-lg">
                      ${profile[key as keyof ProfileData]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Debts Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 brutal-border bg-red-500 text-white flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="font-brutal text-2xl font-black uppercase">DEBTS</h2>
            </div>
            <button
              onClick={() => toggleEdit("debts")}
              className="brutal-border px-3 py-1 flex items-center gap-2 hover:bg-[#c5f82a] transition-colors"
            >
              {editingSection === "debts" ? (
                <>
                  <Save className="w-4 h-4" /> SAVE
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> EDIT
                </>
              )}
            </button>
          </div>

          <div className="brutal-border bg-white p-6">
            <div className="space-y-6">
              {/* Credit Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 font-brutal font-bold mb-2">
                    <CreditCard className="w-4 h-4" />
                    Credit Card Balance
                  </label>
                  {editingSection === "debts" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                      <input
                        type="text"
                        className="brutal-input pl-8"
                        value={profile.creditCards}
                        onChange={(e) => updateField("creditCards", e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="font-mono-brutal text-lg text-red-600">${profile.creditCards}</div>
                  )}
                </div>
                <div>
                  <label className="font-brutal font-bold mb-2 block">Credit Card APR</label>
                  {editingSection === "debts" ? (
                    <div className="relative">
                      <input
                        type="text"
                        className="brutal-input pr-8"
                        value={profile.creditCardAPR}
                        onChange={(e) => updateField("creditCardAPR", e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono-brutal">%</span>
                    </div>
                  ) : (
                    <div className="font-mono-brutal text-lg">{profile.creditCardAPR}%</div>
                  )}
                </div>
              </div>

              {/* Student Loans */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 font-brutal font-bold mb-2">
                    <GraduationCap className="w-4 h-4" />
                    Student Loans
                  </label>
                  {editingSection === "debts" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                      <input
                        type="text"
                        className="brutal-input pl-8"
                        value={profile.studentLoans}
                        onChange={(e) => updateField("studentLoans", e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="font-mono-brutal text-lg text-red-600">${profile.studentLoans}</div>
                  )}
                </div>
                <div>
                  <label className="font-brutal font-bold mb-2 block">Interest Rate</label>
                  {editingSection === "debts" ? (
                    <div className="relative">
                      <input
                        type="text"
                        className="brutal-input pr-8"
                        value={profile.studentLoanRate}
                        onChange={(e) => updateField("studentLoanRate", e.target.value)}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono-brutal">%</span>
                    </div>
                  ) : (
                    <div className="font-mono-brutal text-lg">{profile.studentLoanRate}%</div>
                  )}
                </div>
              </div>

              {/* Other debts */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 font-brutal font-bold mb-2">
                    <Home className="w-4 h-4" />
                    Mortgage
                  </label>
                  {editingSection === "debts" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                      <input
                        type="text"
                        className="brutal-input pl-8"
                        value={profile.mortgage}
                        onChange={(e) => updateField("mortgage", e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="font-mono-brutal text-lg">${profile.mortgage}</div>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 font-brutal font-bold mb-2">
                    <Car className="w-4 h-4" />
                    Car Loan
                  </label>
                  {editingSection === "debts" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono-brutal">$</span>
                      <input
                        type="text"
                        className="brutal-input pl-8"
                        value={profile.carLoan}
                        onChange={(e) => updateField("carLoan", e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="font-mono-brutal text-lg">${profile.carLoan}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Goals Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 brutal-border bg-[#c5f82a] flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="font-brutal text-2xl font-black uppercase">GOALS</h2>
            </div>
            <button
              onClick={() => toggleEdit("goals")}
              className="brutal-border px-3 py-1 flex items-center gap-2 hover:bg-[#c5f82a] transition-colors"
            >
              {editingSection === "goals" ? (
                <>
                  <Save className="w-4 h-4" /> SAVE
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> EDIT
                </>
              )}
            </button>
          </div>

          <div className="brutal-border bg-white p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="font-brutal font-bold mb-2 block">#1 Goal</label>
                {editingSection === "goals" ? (
                  <select
                    className="brutal-input"
                    value={profile.topGoal}
                    onChange={(e) => updateField("topGoal", e.target.value)}
                  >
                    <option>Build emergency fund</option>
                    <option>Pay off debt</option>
                    <option>Save for house</option>
                    <option>Max retirement accounts</option>
                    <option>Achieve FIRE</option>
                    <option>Start investing</option>
                  </select>
                ) : (
                  <div className="font-mono-brutal text-lg">{profile.topGoal}</div>
                )}
              </div>
              <div>
                <label className="font-brutal font-bold mb-2 block">Target Retirement Age</label>
                {editingSection === "goals" ? (
                  <input
                    type="text"
                    className="brutal-input"
                    value={profile.retirementAge}
                    onChange={(e) => updateField("retirementAge", e.target.value)}
                  />
                ) : (
                  <div className="font-mono-brutal text-lg">{profile.retirementAge}</div>
                )}
              </div>
              <div>
                <label className="font-brutal font-bold mb-2 block">Emergency Fund Target</label>
                {editingSection === "goals" ? (
                  <select
                    className="brutal-input"
                    value={profile.emergencyMonths}
                    onChange={(e) => updateField("emergencyMonths", e.target.value)}
                  >
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="9">9 months</option>
                    <option value="12">12+ months</option>
                  </select>
                ) : (
                  <div className="font-mono-brutal text-lg">{profile.emergencyMonths} months</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Risk Profile Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 brutal-border bg-black text-white flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="font-brutal text-2xl font-black uppercase">RISK PROFILE</h2>
            </div>
            <button
              onClick={() => toggleEdit("risk")}
              className="brutal-border px-3 py-1 flex items-center gap-2 hover:bg-[#c5f82a] transition-colors"
            >
              {editingSection === "risk" ? (
                <>
                  <Save className="w-4 h-4" /> SAVE
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" /> EDIT
                </>
              )}
            </button>
          </div>

          <div className="brutal-border bg-white p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="font-brutal font-bold mb-2 block">Risk Tolerance</label>
                {editingSection === "risk" ? (
                  <select
                    className="brutal-input"
                    value={profile.riskTolerance}
                    onChange={(e) => updateField("riskTolerance", e.target.value)}
                  >
                    <option value="panic">Low - I panic sell</option>
                    <option value="worried">Moderate - I hold nervously</option>
                    <option value="calm">High - I stay calm</option>
                    <option value="buy">Aggressive - I buy the dip</option>
                  </select>
                ) : (
                  <div className="font-mono-brutal text-lg">
                    {profile.riskTolerance === "panic" && "Low - I panic sell"}
                    {profile.riskTolerance === "worried" && "Moderate - I hold nervously"}
                    {profile.riskTolerance === "calm" && "High - I stay calm"}
                    {profile.riskTolerance === "buy" && "Aggressive - I buy the dip"}
                  </div>
                )}
              </div>
              <div>
                <label className="font-brutal font-bold mb-2 block">Investing Experience</label>
                {editingSection === "risk" ? (
                  <select
                    className="brutal-input"
                    value={profile.investingExperience}
                    onChange={(e) => updateField("investingExperience", e.target.value)}
                  >
                    <option value="none">Never invested</option>
                    <option value="beginner">Beginner (&lt; 2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="advanced">Advanced (5+ years)</option>
                  </select>
                ) : (
                  <div className="font-mono-brutal text-lg">
                    {profile.investingExperience === "none" && "Never invested"}
                    {profile.investingExperience === "beginner" && "Beginner (< 2 years)"}
                    {profile.investingExperience === "intermediate" && "Intermediate (2-5 years)"}
                    {profile.investingExperience === "advanced" && "Advanced (5+ years)"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Warning */}
        <div className="brutal-border bg-black text-white p-6">
          <p className="font-brutal text-lg">
            <span className="text-[#c5f82a]">Privacy note:</span> Your data stays in your browser.
            We don&apos;t store, sell, or share your financial information. Unlike every other finance site.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="brutal-border-thick border-b-0 border-l-0 border-r-0 bg-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono-brutal text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ClearMoney. Your data, your control.
          </p>
          <div className="brutal-border px-3 py-1 bg-white">
            <span className="font-mono-brutal text-xs">0% DATA SELLING</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
