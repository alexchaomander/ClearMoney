"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Search,
  Check,
  Shield,
  Eye,
  Lock,
  Building2,
  CreditCard,
  TrendingUp,
  Wallet,
  Home,
  BarChart3,
  User,
  Menu,
  X,
  Target,
  Landmark,
  GraduationCap,
  Car,
} from "lucide-react";

// Institution categories
const institutionCategories = [
  {
    id: "bank",
    name: "Bank Accounts",
    icon: Building2,
    institutions: [
      { id: "chase", name: "Chase", color: "#117ACA" },
      { id: "bofa", name: "Bank of America", color: "#E31837" },
      { id: "wells", name: "Wells Fargo", color: "#D71E28" },
      { id: "capital-one", name: "Capital One", color: "#004977" },
      { id: "citi", name: "Citibank", color: "#003B70" },
      { id: "usbank", name: "US Bank", color: "#0D2E5E" },
    ],
  },
  {
    id: "credit",
    name: "Credit Cards",
    icon: CreditCard,
    institutions: [
      { id: "amex", name: "American Express", color: "#006FCF" },
      { id: "chase-cc", name: "Chase Sapphire", color: "#1A1F71" },
      { id: "discover", name: "Discover", color: "#FF6600" },
      { id: "citi-cc", name: "Citi", color: "#003B70" },
      { id: "capital-one-cc", name: "Capital One", color: "#004977" },
      { id: "barclays", name: "Barclays", color: "#00AEEF" },
    ],
  },
  {
    id: "investments",
    name: "Investments",
    icon: TrendingUp,
    institutions: [
      { id: "fidelity", name: "Fidelity", color: "#4AA74E" },
      { id: "vanguard", name: "Vanguard", color: "#8B2332" },
      { id: "schwab", name: "Charles Schwab", color: "#00A0DF" },
      { id: "robinhood", name: "Robinhood", color: "#00C805" },
      { id: "etrade", name: "E*TRADE", color: "#6633CC" },
      { id: "td", name: "TD Ameritrade", color: "#54B848" },
    ],
  },
  {
    id: "retirement",
    name: "Retirement",
    icon: Wallet,
    institutions: [
      { id: "401k", name: "Company 401(k)", color: "#333333" },
      { id: "ira", name: "IRA Accounts", color: "#666666" },
      { id: "roth", name: "Roth IRA", color: "#999999" },
      { id: "pension", name: "Pension", color: "#444444" },
    ],
  },
  {
    id: "loans",
    name: "Loans & Debt",
    icon: Landmark,
    institutions: [
      { id: "mortgage", name: "Mortgage", color: "#2D5016", customIcon: Home },
      { id: "student", name: "Student Loans", color: "#1E3A5F", customIcon: GraduationCap },
      { id: "auto", name: "Auto Loans", color: "#5C3317", customIcon: Car },
      { id: "personal", name: "Personal Loans", color: "#4A4A4A" },
    ],
  },
];

// Mock connected accounts for Sarah
const initialConnectedAccounts = [
  { institutionId: "chase", name: "Chase Checking", balance: 8400, type: "checking" },
  { institutionId: "chase", name: "Chase Savings", balance: 3200, type: "savings" },
  { institutionId: "fidelity", name: "Fidelity 401(k)", balance: 67000, type: "investment" },
  { institutionId: "amex", name: "Amex Platinum", balance: -2100, type: "credit" },
  { institutionId: "student", name: "Federal Student Loans", balance: -28000, type: "loan" },
];

type ConnectingState = {
  [key: string]: "idle" | "connecting" | "connected";
};

export default function ConnectPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [connectedAccounts, setConnectedAccounts] = useState(initialConnectedAccounts);
  const [connectingState, setConnectingState] = useState<ConnectingState>({
    chase: "connected",
    fidelity: "connected",
    amex: "connected",
    student: "connected",
  });

  const handleConnect = (institutionId: string) => {
    if (connectingState[institutionId] === "connected") return;

    setConnectingState((prev) => ({ ...prev, [institutionId]: "connecting" }));

    // Simulate connection delay
    setTimeout(() => {
      setConnectingState((prev) => ({ ...prev, [institutionId]: "connected" }));
      // Add mock account
      const institution = institutionCategories
        .flatMap((cat) => cat.institutions)
        .find((inst) => inst.id === institutionId);
      if (institution) {
        setConnectedAccounts((prev) => [
          ...prev,
          {
            institutionId,
            name: `${institution.name} Account`,
            balance: Math.floor(Math.random() * 10000) + 1000,
            type: "checking",
          },
        ]);
      }
    }, 2000);
  };

  const totalConnected = Object.values(connectingState).filter((s) => s === "connected").length;
  const totalInstitutions = institutionCategories.flatMap((c) => c.institutions).length;

  const filteredCategories = searchQuery
    ? institutionCategories
        .map((cat) => ({
          ...cat,
          institutions: cat.institutions.filter((inst) =>
            inst.name.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((cat) => cat.institutions.length > 0)
    : institutionCategories;

  const totalAssets = connectedAccounts
    .filter((a) => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);
  const totalDebt = connectedAccounts
    .filter((a) => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalDebt;

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

        @keyframes pulse-connect {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-connect {
          animation: pulse-connect 1s ease-in-out infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
      `}</style>

      {/* Header */}
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
              { name: "Connect", href: "/designs/design-4-neobrutalism/connect", icon: Wallet },
              { name: "Graph", href: "/designs/design-4-neobrutalism/graph", icon: Target },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Connect";
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
              { name: "Connect", href: "/designs/design-4-neobrutalism/connect", icon: Wallet },
              { name: "Graph", href: "/designs/design-4-neobrutalism/graph", icon: Target },
              { name: "Profile", href: "/designs/design-4-neobrutalism/profile", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.name === "Connect";
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

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 md:px-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="inline-block mb-4">
            <div className="brutal-border bg-black text-[#c5f82a] px-4 py-2 font-mono-brutal text-sm rotate-[-1deg]">
              SECURE ACCOUNT LINKING
            </div>
          </div>
          <h1 className="font-brutal text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">
            CONNECT YOUR
            <br />
            <span className="inline-block bg-[#c5f82a] brutal-border px-2 brutal-shadow mt-2">MONEY</span>
          </h1>
          <p className="font-brutal text-xl md:text-2xl text-gray-600 max-w-2xl">
            Wall Street has your data. Time you did too.{" "}
            <span className="bg-black text-white px-1">Take back control.</span>
          </p>
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap gap-3 mb-10">
          {[
            { icon: Lock, text: "Bank-level encryption" },
            { icon: Eye, text: "Read-only access" },
            { icon: Shield, text: "You control what's shared" },
          ].map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.text}
                className="brutal-border bg-white px-4 py-2 flex items-center gap-2 brutal-shadow-sm"
              >
                <Icon className="w-5 h-5 text-green-600" />
                <span className="font-mono-brutal text-sm font-bold">{badge.text}</span>
              </div>
            );
          })}
        </div>

        {/* Connection Progress */}
        <div className="brutal-border-thick bg-[#c5f82a] p-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="font-mono-brutal text-sm">CONNECTION STATUS</span>
              <div className="font-brutal text-4xl font-black">
                {totalConnected} of {totalInstitutions} accounts connected
              </div>
            </div>
            <Link
              href="/designs/design-4-neobrutalism/graph"
              className="inline-flex items-center gap-2 font-brutal font-bold text-lg px-6 py-4 bg-black text-[#c5f82a] brutal-border brutal-shadow-sm brutal-shadow-hover brutal-shadow-active hover:bg-white hover:text-black transition-colors"
            >
              SEE YOUR FINANCIAL GRAPH
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="brutal-border bg-white flex items-center px-4 brutal-shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for your bank, broker, or institution..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 font-brutal text-lg px-4 py-4 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Institution Categories */}
          <div className="lg:col-span-2 space-y-8">
            {filteredCategories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <div key={category.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 brutal-border bg-black flex items-center justify-center">
                      <CategoryIcon className="w-5 h-5 text-[#c5f82a]" />
                    </div>
                    <h2 className="font-brutal text-2xl font-black uppercase tracking-tight">
                      {category.name}
                    </h2>
                  </div>

                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {category.institutions.map((institution) => {
                      const state = connectingState[institution.id] || "idle";
                      const CustomIcon = "customIcon" in institution ? institution.customIcon : null;

                      return (
                        <button
                          key={institution.id}
                          onClick={() => handleConnect(institution.id)}
                          disabled={state === "connecting"}
                          className={`brutal-border p-4 text-left transition-all ${
                            state === "connected"
                              ? "bg-green-100 border-green-600"
                              : state === "connecting"
                              ? "bg-yellow-50 animate-pulse-connect"
                              : "bg-white brutal-shadow-sm brutal-shadow-hover brutal-shadow-active hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 brutal-border flex items-center justify-center"
                              style={{ backgroundColor: institution.color }}
                            >
                              {CustomIcon ? (
                                <CustomIcon className="w-5 h-5 text-white" />
                              ) : (
                                <span className="font-mono-brutal text-white text-sm font-bold">
                                  {institution.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-brutal font-bold truncate">{institution.name}</div>
                              <div className="font-mono-brutal text-xs text-gray-500">
                                {state === "connected"
                                  ? "Connected"
                                  : state === "connecting"
                                  ? "Connecting..."
                                  : "Click to connect"}
                              </div>
                            </div>
                            {state === "connected" && (
                              <div className="w-6 h-6 brutal-border border-green-600 bg-green-500 flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                            {state === "connecting" && (
                              <div className="w-6 h-6 brutal-border border-yellow-600 bg-yellow-400 flex items-center justify-center animate-spin-slow">
                                <span className="font-mono-brutal text-xs">...</span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column - Connected Summary */}
          <div>
            <div className="brutal-border-thick bg-black text-white p-6 sticky top-24">
              <h3 className="font-mono-brutal text-[#c5f82a] text-sm mb-4">CONNECTED ACCOUNTS</h3>

              {connectedAccounts.length === 0 ? (
                <p className="font-brutal text-gray-400">No accounts connected yet.</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {connectedAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between brutal-border border-gray-700 bg-gray-900 p-3"
                    >
                      <div>
                        <div className="font-brutal font-bold">{account.name}</div>
                        <div className="font-mono-brutal text-xs text-gray-500">{account.type}</div>
                      </div>
                      <div
                        className={`font-mono-brutal font-bold ${
                          account.balance >= 0 ? "text-[#c5f82a]" : "text-red-400"
                        }`}
                      >
                        {account.balance >= 0 ? "$" : "-$"}
                        {Math.abs(account.balance).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Summary Stats */}
              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-mono-brutal text-sm text-gray-400">Total Assets</span>
                  <span className="font-mono-brutal font-bold text-[#c5f82a]">
                    ${totalAssets.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono-brutal text-sm text-gray-400">Total Debt</span>
                  <span className="font-mono-brutal font-bold text-red-400">
                    -${totalDebt.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-700 pt-3">
                  <span className="font-mono-brutal text-sm text-gray-400">Net Worth</span>
                  <span className="font-mono-brutal font-bold text-white text-xl">
                    ${netWorth.toLocaleString()}
                  </span>
                </div>
              </div>

              <Link
                href="/designs/design-4-neobrutalism/graph"
                className="mt-6 w-full inline-flex items-center justify-center gap-2 font-brutal font-bold text-lg px-6 py-4 bg-[#c5f82a] text-black brutal-border border-white brutal-shadow-accent brutal-shadow-hover brutal-shadow-active hover:bg-white transition-colors"
              >
                SEE YOUR FINANCIAL GRAPH
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Data Privacy Section */}
        <div className="brutal-border-thick bg-gray-100 p-6 md:p-8 mt-12">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 brutal-border bg-[#c5f82a] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-brutal text-xl font-black mb-2">YOUR DATA IS YOURS</h3>
              <p className="font-brutal text-gray-600 mb-4">
                We use bank-level 256-bit encryption. We never sell your data. We only have read-only access -
                we cannot move money or make transactions. You can disconnect any account instantly.
              </p>
              <div className="font-mono-brutal text-sm">
                <span className="text-gray-500">Powered by secure open banking protocols.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="brutal-border-thick border-b-0 border-l-0 border-r-0 bg-black text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono-brutal text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ClearMoney. Your data stays yours.
          </p>
          <div className="brutal-border border-white px-3 py-1 bg-[#c5f82a] text-black">
            <span className="font-mono-brutal text-xs">BANK-LEVEL SECURITY</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
