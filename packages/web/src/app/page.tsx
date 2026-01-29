"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Eye,
  Calculator,
  Sparkles,
  TrendingUp,
  PiggyBank,
  CreditCard,
  Building2,
  Receipt,
  Target,
  Heart,
  Percent,
  ChevronRight,
} from "lucide-react";
import { categories, getLiveTools, getFeaturedTools } from "@/lib/site-config";

const principles = [
  {
    icon: Shield,
    title: "No corporate influence",
    description:
      "We serve you, not banks or card issuers. Our advice is based on math, not who pays us.",
  },
  {
    icon: Eye,
    title: "Radical transparency",
    description:
      "We publish our methodology, our revenue sources, and our conflicts of interest.",
  },
  {
    icon: Calculator,
    title: "Tools first",
    description:
      "Interactive calculators that respect your intelligence. No 3,000-word articles for simple questions.",
  },
];

const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  "credit-cards": CreditCard,
  banking: Building2,
  investing: TrendingUp,
  taxes: Receipt,
  debt: Target,
  budgeting: PiggyBank,
  "credit-building": Eye,
  "charitable-giving": Heart,
  giving: Heart,
  equity: Percent,
  "equity-compensation": Percent,
};

const palette = {
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0a0a0a",
  textMuted: "#525252",
  border: "#e5e7eb",
  accent: "#2563eb",
  accentSoft: "#dbeafe",
  highlight: "#14b8a6",
};

export default function HomePage() {
  const liveTools = getLiveTools();
  const featuredTools = getFeaturedTools();
  const remainingTools = liveTools.filter(
    (tool) => !featuredTools.find((featured) => featured.id === tool.id)
  );
  const showcaseTools =
    featuredTools.length >= 6
      ? featuredTools.slice(0, 6)
      : [...featuredTools, ...remainingTools.slice(0, 6 - featuredTools.length)];
  const heroTool =
    liveTools.find((tool) => tool.id === "strategy-match-finder") ??
    showcaseTools[0] ??
    liveTools[0];

  const uniqueCategories = categories.filter(
    (cat, index, self) => self.findIndex((c) => c.id === cat.id) === index
  );

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: palette.bg, color: palette.text }}>
      <style jsx global>{`
        @keyframes blobFloat {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -40px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 30px) scale(0.95);
          }
        }

        .animate-blob-float {
          animation: blobFloat 26s ease-in-out infinite;
        }

        .glass-surface {
          backdrop-filter: blur(18px);
          background: rgba(255, 255, 255, 0.75);
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-grid-light opacity-60" />
      <div className="absolute -top-32 -left-40 h-[420px] w-[420px] rounded-full blur-3xl opacity-70 animate-blob-float"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.35), transparent 70%)" }}
      />
      <div className="absolute top-40 -right-32 h-[360px] w-[360px] rounded-full blur-3xl opacity-70 animate-blob-float"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.3), transparent 70%)", animationDelay: "-8s" }}
      />
      <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full blur-3xl opacity-60 animate-blob-float"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)", animationDelay: "-16s" }}
      />

      <div className="relative">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-black/5">
          <div className="glass-surface">
            <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
              <Link href="/" className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: palette.accentSoft }}
                >
                  <Calculator className="h-4 w-4" style={{ color: palette.accent }} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">ClearMoney</p>
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ color: palette.textMuted }}>
                    Autonomous edition
                  </p>
                </div>
              </Link>
              <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
                <Link href="/#tools" className="transition-colors hover:text-black">
                  Tools
                </Link>
                <Link href="/blog" className="transition-colors hover:text-black">
                  Research
                </Link>
                <Link href="/about" className="transition-colors hover:text-black">
                  Mission
                </Link>
              </nav>
              <div className="flex items-center gap-3">
                <Link
                  href="/#tools"
                  className="hidden items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-all hover:border-black/20 md:flex"
                >
                  Explore
                  <ArrowRight className="h-3 w-3" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white"
                  style={{ background: palette.accent }}
                >
                  Dashboard
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-4 pb-24 pt-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-widest">
              <span className="inline-flex h-2 w-2 rounded-full" style={{ background: palette.highlight }} />
              Independent finance lab
            </div>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Financial clarity,
              <span className="font-display block text-5xl italic sm:text-6xl lg:text-7xl">
                engineered for you.
              </span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed" style={{ color: palette.textMuted }}>
              ClearMoney builds decision tools that explain the tradeoffs. No affiliate bias. No corporate influence. Just
              rigorous math and transparent thinking.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all"
                style={{ background: palette.accent }}
              >
                Explore the tools
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-6 py-3 text-sm font-semibold transition-all hover:border-black/20"
              >
                Our principles
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {[
                { label: "Live tools", value: liveTools.length },
                { label: "Categories", value: uniqueCategories.length },
                { label: "Affiliate bias", value: "Zero" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-black/5 bg-white/80 px-4 py-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
                >
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em]" style={{ color: palette.textMuted }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: palette.textMuted }}>
                  Today in focus
                </p>
                <Sparkles className="h-4 w-4" style={{ color: palette.accent }} />
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{heroTool?.name ?? "Strategy Match Finder"}</h2>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: palette.textMuted }}>
                {heroTool?.description ??
                  "Map your risk profile to the strategy archetypes that actually fit your behavior."}
              </p>
              <Link
                href={heroTool?.href ?? "/tools/strategy-match-finder"}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold"
                style={{ color: palette.accent }}
              >
                Launch tool
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/80 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: palette.textMuted }}>
                Autonomous checklist
              </p>
              <ul className="mt-4 space-y-3 text-sm" style={{ color: palette.textMuted }}>
                {[
                  "Model the tradeoffs before you move money.",
                  "Validate assumptions against live data.",
                  "Document decisions and revisit quarterly.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full" style={{ background: palette.highlight }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-2xl border border-black/5 bg-white px-4 py-3 text-xs uppercase tracking-[0.2em]">
                Updated weekly
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: palette.textMuted }}>
                Coverage map
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Every decision surface, mapped.</h2>
              <p className="mt-2 max-w-xl text-sm" style={{ color: palette.textMuted }}>
                From credit cards to taxes, we design tools that bring clarity to every high stakes financial choice.
              </p>
            </div>
            <Link
              href="/#tools"
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: palette.accent }}
            >
              Explore all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {uniqueCategories.slice(0, 9).map((category) => {
              const Icon = categoryIcons[category.id] ?? Sparkles;
              return (
                <Link
                  key={category.id}
                  href={category.href}
                  className="group rounded-3xl border border-black/5 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-2xl"
                      style={{ background: palette.accentSoft }}
                    >
                      <span style={{ color: palette.accent }}><Icon className="h-5 w-5" /></span>
                    </div>
                    <div>
                      <p className="text-base font-semibold">{category.shortName}</p>
                      <p className="text-xs uppercase tracking-[0.2em]" style={{ color: palette.textMuted }}>
                        {category.name}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm" style={{ color: palette.textMuted }}>
                    {category.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: palette.accent }}>
                    View tools
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Featured Tools */}
        <section id="tools" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: palette.textMuted }}>
                Featured builds
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Decision tools with receipts.</h2>
              <p className="mt-2 max-w-xl text-sm" style={{ color: palette.textMuted }}>
                We focus on the scenarios where bad advice is expensive. These are the flagship calculators people use
                every week.
              </p>
            </div>
            <Link
              href="/#tools"
              className="inline-flex items-center gap-2 text-sm font-semibold"
              style={{ color: palette.accent }}
            >
              View all tools
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showcaseTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group rounded-3xl border border-black/5 bg-white/95 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.07)] transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: palette.textMuted }}>
                    {tool.categoryId.replace(/-/g, " ")}
                  </p>
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: tool.primaryColor ?? palette.accent }}
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{tool.name}</h3>
                <p className="mt-3 text-sm" style={{ color: palette.textMuted }}>
                  {tool.description}
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: palette.accent }}>
                  Launch calculator
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Principles */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: palette.textMuted }}>
                The ClearMoney standard
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Built for people who demand proof.</h2>
              <p className="mt-3 text-sm" style={{ color: palette.textMuted }}>
                Finance media optimizes for attention. We optimize for decisions. Every tool is built with transparent
                logic and reviewed by experts who publish their assumptions.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-2 text-sm font-semibold transition-all hover:border-black/20"
                >
                  Read the research
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 text-sm font-semibold"
                  style={{ color: palette.accent }}
                >
                  How we build
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              {principles.map((principle) => {
                const Icon = principle.icon;
                return (
                  <div
                    key={principle.title}
                    className="rounded-2xl border border-black/5 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl"
                        style={{ background: palette.accentSoft }}
                      >
                        <span style={{ color: palette.accent }}><Icon className="h-5 w-5" /></span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{principle.title}</p>
                        <p className="mt-1 text-xs" style={{ color: palette.textMuted }}>
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="grid gap-8 rounded-3xl border border-black/10 bg-white/95 p-10 shadow-[0_24px_60px_rgba(15,23,42,0.08)] lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: palette.textMuted }}>
                Field notes
              </p>
              <h2 className="mt-3 text-3xl font-semibold">Weekly experiments, shipped to your inbox.</h2>
              <p className="mt-3 text-sm" style={{ color: palette.textMuted }}>
                We send one concise brief each week: what we tested, what we learned, and how it changes your money
                strategy. No spam. No sponsored content.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <label className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: palette.textMuted }}>
                Email address
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="you@domain.com"
                  className="flex-1 rounded-full border border-black/10 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-black/30"
                />
                <button
                  type="button"
                  className="rounded-full px-6 py-3 text-sm font-semibold text-white"
                  style={{ background: palette.accent }}
                >
                  Subscribe
                </button>
              </div>
              <p className="text-xs" style={{ color: palette.textMuted }}>
                We never sell your data. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-black/5 pb-16">
          <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm" style={{ color: palette.textMuted }}>
                ClearMoney. Independent finance tools for real decisions.
              </p>
              <div className="flex items-center gap-6 text-sm">
                <Link href="/about" className="transition-colors hover:text-black" style={{ color: palette.textMuted }}>
                  About
                </Link>
                <Link href="/blog" className="transition-colors hover:text-black" style={{ color: palette.textMuted }}>
                  Blog
                </Link>
                <Link href="/privacy" className="transition-colors hover:text-black" style={{ color: palette.textMuted }}>
                  Privacy
                </Link>
              </div>
            </div>
            <p className="mt-6 text-xs" style={{ color: palette.textMuted }}>
              Not financial advice. We provide tools, you make decisions.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
