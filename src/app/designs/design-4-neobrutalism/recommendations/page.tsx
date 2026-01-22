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
  Check,
  Clock,
  XCircle,
  Zap,
  Calculator,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from "lucide-react";

interface Recommendation {
  id: number;
  priority: number;
  title: string;
  why: string;
  impact: string;
  impactType: "money" | "security" | "growth";
  category: string;
  status: "todo" | "in_progress" | "done" | "not_now";
  toolLink: string;
  toolName: string;
  details: string;
}

const recommendations: Recommendation[] = [
  {
    id: 1,
    priority: 1,
    title: "Max your 401k match",
    why: "Your employer matches 50% up to 6%. You're only contributing 4%. That's $3,600/year in FREE MONEY you're refusing.",
    impact: "+$3,600/yr",
    impactType: "money",
    category: "Retirement",
    status: "todo",
    toolLink: "/investing",
    toolName: "401k Calculator",
    details: "Increase contribution from 4% to 6%. Takes 5 minutes in your HR portal. Your future self will high-five you.",
  },
  {
    id: 2,
    priority: 2,
    title: "Kill that 22% credit card",
    why: "You have $5,000 at 22% APR. That's $1,100/year in interest. Banks are literally stealing from your future.",
    impact: "+$1,100/yr",
    impactType: "money",
    category: "Debt",
    status: "todo",
    toolLink: "/debt",
    toolName: "Debt Destroyer",
    details: "Pay $833/month for 6 months to eliminate. Consider a 0% balance transfer card to accelerate payoff.",
  },
  {
    id: 3,
    priority: 3,
    title: "Build emergency fund to 3 months",
    why: "You have 1.2 months of expenses saved. One job loss or medical emergency and you're going into debt.",
    impact: "Financial Security",
    impactType: "security",
    category: "Emergency Fund",
    status: "todo",
    toolLink: "/budgeting",
    toolName: "Emergency Fund Planner",
    details: "Target: $15,600 (3 months). You have $6,240. Need to save $9,360 more. Put $780/month aside.",
  },
  {
    id: 4,
    priority: 4,
    title: "Start Mega Backdoor Roth",
    why: "Your employer plan allows after-tax contributions. You can shelter an extra $23K from taxes LEGALLY.",
    impact: "+$23K tax-advantaged/yr",
    impactType: "growth",
    category: "Retirement",
    status: "todo",
    toolLink: "/investing",
    toolName: "Mega Backdoor Roth Calculator",
    details: "Check if your 401k allows after-tax contributions + in-service distributions. Most tech companies do.",
  },
  {
    id: 5,
    priority: 5,
    title: "Max your Roth IRA",
    why: "You're contributing $0 to a Roth IRA. At your income, you can still do backdoor Roth. Tax-free growth forever.",
    impact: "+$7K tax-free/yr",
    impactType: "growth",
    category: "Retirement",
    status: "todo",
    toolLink: "/taxes",
    toolName: "Backdoor Roth Guide",
    details: "Open a Traditional IRA, contribute $7K, convert to Roth immediately. $583/month auto-invest.",
  },
  {
    id: 6,
    priority: 6,
    title: "Optimize HSA as stealth IRA",
    why: "You're using HSA for current medical expenses. WRONG. Pay medical out of pocket, let HSA grow tax-free.",
    impact: "Triple tax advantage",
    impactType: "growth",
    category: "Taxes",
    status: "todo",
    toolLink: "/taxes",
    toolName: "HSA Maximization Tool",
    details: "Max contribution: $4,150/yr. Invest in low-cost index funds. Save receipts, reimburse yourself in 30 years.",
  },
  {
    id: 7,
    priority: 7,
    title: "Refinance student loans",
    why: "Your $29K student loan is at 6.5%. Current refinance rates are around 5%. Save $435/year.",
    impact: "+$435/yr",
    impactType: "money",
    category: "Debt",
    status: "todo",
    toolLink: "/debt",
    toolName: "Student Loan Strategy",
    details: "Shop rates at SoFi, Earnest, Splash. Don't refinance federal loans if you need income-driven repayment.",
  },
  {
    id: 8,
    priority: 8,
    title: "Increase savings rate to 25%",
    why: "You're at 22%. Push to 25% and you'll hit FIRE 3 years faster. The math is brutal but beautiful.",
    impact: "Retire 3 years earlier",
    impactType: "growth",
    category: "Savings",
    status: "todo",
    toolLink: "/investing",
    toolName: "FIRE Calculator",
    details: "Find $375/month in expenses to cut or earn. Cancel subscriptions, negotiate bills, meal prep more.",
  },
  {
    id: 9,
    priority: 9,
    title: "Open a brokerage account",
    why: "After maxing tax-advantaged accounts, you need somewhere for extra savings. Taxable brokerage is the answer.",
    impact: "Wealth building",
    impactType: "growth",
    category: "Investing",
    status: "todo",
    toolLink: "/investing",
    toolName: "Investment Guide",
    details: "Open at Fidelity, Vanguard, or Schwab. No fees. VTI + VXUS + BND. Set and forget.",
  },
  {
    id: 10,
    priority: 10,
    title: "Review insurance coverage",
    why: "When did you last check life/disability insurance? Probably never. Don't leave your family broke.",
    impact: "Family protection",
    impactType: "security",
    category: "Insurance",
    status: "todo",
    toolLink: "/budgeting",
    toolName: "Insurance Calculator",
    details: "Get 10-12x income in term life. Check employer disability coverage. Consider umbrella policy at $1M+ net worth.",
  },
];

const statusConfig = {
  todo: { label: "TO DO", bg: "bg-white", text: "text-black", icon: Target },
  in_progress: { label: "IN PROGRESS", bg: "bg-[#c5f82a]", text: "text-black", icon: Clock },
  done: { label: "DONE", bg: "bg-black", text: "text-[#c5f82a]", icon: Check },
  not_now: { label: "NOT NOW", bg: "bg-gray-200", text: "text-gray-600", icon: XCircle },
};

export default function RecommendationsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [items, setItems] = useState(recommendations);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "todo" | "in_progress" | "done">("all");

  const updateStatus = (id: number, status: Recommendation["status"]) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredItems = filter === "all" ? items : items.filter((item) => item.status === filter);
  const completedCount = items.filter((i) => i.status === "done").length;
  const inProgressCount = items.filter((i) => i.status === "in_progress").length;

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
              const isActive = item.name === "Recommendations";
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
              const isActive = item.name === "Recommendations";
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
      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-block mb-2">
            <div className="brutal-border bg-black text-[#c5f82a] px-3 py-1 font-mono-brutal text-xs">
              YOUR PERSONALIZED PLAN
            </div>
          </div>
          <h1 className="font-brutal text-4xl md:text-5xl font-black uppercase tracking-tight mb-2">
            ACTION ITEMS
          </h1>
          <p className="font-brutal text-xl text-gray-600">
            Prioritized by impact. Do them in order. Wall Street hates this list.
          </p>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="brutal-border bg-white p-4">
            <div className="font-brutal text-3xl font-black">{completedCount}/{items.length}</div>
            <div className="font-mono-brutal text-xs text-gray-500">COMPLETED</div>
          </div>
          <div className="brutal-border bg-[#c5f82a] p-4">
            <div className="font-brutal text-3xl font-black">{inProgressCount}</div>
            <div className="font-mono-brutal text-xs">IN PROGRESS</div>
          </div>
          <div className="brutal-border bg-black text-white p-4">
            <div className="font-brutal text-3xl font-black text-[#c5f82a]">
              +$35K
            </div>
            <div className="font-mono-brutal text-xs text-gray-400">POTENTIAL IMPACT</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: "all", label: "All" },
            { value: "todo", label: "To Do" },
            { value: "in_progress", label: "In Progress" },
            { value: "done", label: "Done" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as typeof filter)}
              className={`font-brutal font-bold px-4 py-2 brutal-border whitespace-nowrap transition-colors ${
                filter === f.value ? "bg-black text-white" : "bg-white hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Recommendations List */}
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                className={`brutal-border bg-white transition-all ${
                  item.status === "done" ? "opacity-60" : ""
                }`}
              >
                {/* Main Row */}
                <div
                  className="p-4 md:p-6 cursor-pointer"
                  onClick={() => toggleExpand(item.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Priority Badge */}
                    <div
                      className={`w-12 h-12 brutal-border flex items-center justify-center flex-shrink-0 ${
                        item.priority <= 3
                          ? "bg-red-500 text-white"
                          : item.priority <= 6
                          ? "bg-orange-500 text-white"
                          : "bg-[#c5f82a]"
                      }`}
                    >
                      <span className="font-mono-brutal text-xl font-bold">{item.priority}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono-brutal text-xs text-gray-500">{item.category}</span>
                        <span
                          className={`font-mono-brutal text-xs px-2 py-0.5 brutal-border ${statusConfig[item.status].bg} ${statusConfig[item.status].text}`}
                        >
                          {statusConfig[item.status].label}
                        </span>
                      </div>
                      <h3 className="font-brutal text-xl font-black mb-1">{item.title}</h3>
                      <p className="font-brutal text-gray-600 line-clamp-2">{item.why}</p>
                    </div>

                    {/* Impact & Expand */}
                    <div className="flex items-center gap-3">
                      <div className="hidden md:block">
                        <div className="brutal-border bg-[#c5f82a] px-3 py-1">
                          <span className="font-mono-brutal text-sm font-bold">{item.impact}</span>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t-3 border-black p-4 md:p-6 bg-gray-50">
                    {/* Impact on mobile */}
                    <div className="md:hidden mb-4">
                      <div className="brutal-border bg-[#c5f82a] px-3 py-1 inline-block">
                        <span className="font-mono-brutal text-sm font-bold">{item.impact}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mb-6">
                      <h4 className="font-brutal font-bold text-lg mb-2">HOW TO DO IT</h4>
                      <p className="font-brutal text-gray-700">{item.details}</p>
                    </div>

                    {/* Tool Link */}
                    <div className="mb-6">
                      <Link
                        href={item.toolLink}
                        className="inline-flex items-center gap-2 font-brutal font-bold px-4 py-2 bg-white text-black brutal-border brutal-shadow-sm hover:bg-[#c5f82a] transition-colors"
                      >
                        <Calculator className="w-4 h-4" />
                        Open {item.toolName}
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>

                    {/* Status Buttons */}
                    <div>
                      <h4 className="font-brutal font-bold text-sm mb-2">UPDATE STATUS</h4>
                      <div className="flex flex-wrap gap-2">
                        {(["todo", "in_progress", "done", "not_now"] as const).map((status) => {
                          const config = statusConfig[status];
                          const Icon = config.icon;
                          return (
                            <button
                              key={status}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(item.id, status);
                              }}
                              className={`flex items-center gap-2 font-brutal font-bold px-3 py-2 brutal-border transition-colors ${
                                item.status === status
                                  ? `${config.bg} ${config.text} brutal-shadow-sm`
                                  : "bg-white hover:bg-gray-100"
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {config.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 brutal-border-thick bg-black text-white p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-8 h-8 text-[#c5f82a]" />
            <h3 className="font-brutal text-2xl font-black">THE BOTTOM LINE</h3>
          </div>
          <p className="font-brutal text-lg text-gray-300 mb-4">
            Complete items 1-3 first. They&apos;ll give you 90% of the impact.
            Then tackle the rest when you have bandwidth. Don&apos;t try to do everything at once.
          </p>
          <p className="font-mono-brutal text-sm text-[#c5f82a]">
            Financial advisors would charge you $1,500 for this plan. We gave it to you for free.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="brutal-border-thick border-b-0 border-l-0 border-r-0 bg-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-mono-brutal text-sm text-gray-500">
            &copy; {new Date().getFullYear()} ClearMoney. Built by people, not corporations.
          </p>
          <div className="brutal-border px-3 py-1 bg-white">
            <span className="font-mono-brutal text-xs">0% AFFILIATE BIAS</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
