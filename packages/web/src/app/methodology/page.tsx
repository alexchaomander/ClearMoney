import type { Metadata } from "next";
import Link from "next/link";
import { Bodoni_Moda, IBM_Plex_Sans } from "next/font/google";
import {
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Target,
  BookOpen,
  Info,
  Layers,
  Lightbulb,
} from "lucide-react";

const display = Bodoni_Moda({ subsets: ["latin"], weight: ["400", "600", "700"] });
const body = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Methodology & Independence | ClearMoney",
  description:
    "How ClearMoney calculates recommendations, values points, and stays independent. Transparent methodology with audit-ready decision traces.",
};

const pledgeNever = [
  "Recommend a card because it pays us",
  "Inflate valuations to justify annual fees",
  "Hide methodology or assumptions",
  "Suppress critical reviews",
  "Sell personal data",
];

const pledgeAlways = [
  "Show the math and inputs",
  "Highlight tradeoffs and uncertainty",
  "Publish changes and corrections",
  "Separate editorial and revenue",
  "Let you see the decision trace",
];

const methodologySteps = [
  {
    title: "Inputs first",
    body: "We start with your actual spending, balances, and goals. If data is missing, we show the assumption and let you override it.",
  },
  {
    title: "Conservative baselines",
    body: "We anchor on cash-out values and realistic redemption scenarios before we consider transfer sweet spots.",
  },
  {
    title: "Decision traces",
    body: "Every recommendation stores the inputs, rules, and outputs so you can audit and replay it later.",
  },
  {
    title: "Human-readable outputs",
    body: "No black boxes. We explain the leverage points in plain English and show the sensitivity of the result.",
  },
];

const transparencySignals = [
  {
    label: "Revenue disclosure",
    value: "Every payout is published, card by card",
    icon: ShieldCheck,
  },
  {
    label: "Methodology updates",
    value: "Versioned changes with rationale",
    icon: BookOpen,
  },
  {
    label: "Correction workflow",
    value: "Community flagged, fast turnaround",
    icon: Lightbulb,
  },
];

const traceFields = [
  "Inputs used",
  "Freshness timestamps",
  "Rules + thresholds",
  "Exceptions applied",
  "Outcome confidence",
];

export default function MethodologyPage() {
  return (
    <div className={`${body.className} cm-methodology-page min-h-screen bg-[#f3efe6] text-[#1b1a17]`}>
      <style>{`
        .cm-methodology-page {
          --ink: #1b1a17;
          --ink-soft: #3a342c;
          --paper: #f3efe6;
          --accent: #c75c2e;
          --accent-2: #0e7c7b;
          --ink-line: rgba(27, 26, 23, 0.18);
        }
        .cm-methodology-page .grain {
          position: relative;
        }
        .cm-methodology-page .grain::after {
          content: "";
          pointer-events: none;
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
          mix-blend-mode: multiply;
        }
      `}</style>

      <div className="relative overflow-hidden grain">
        <div className="absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,#f2c16b,transparent_60%)] opacity-60" />
        <div className="absolute -bottom-32 left-[-15%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,#7bd4d3,transparent_65%)] opacity-50" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-[var(--ink-line)] bg-white/70 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-soft)]">
                ClearMoney
              </p>
              <p className={`${display.className} text-lg font-semibold`}>
                Methodology & Independence
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link
              href="/tools"
              className="rounded-full border border-[var(--ink-line)] px-4 py-2 text-[var(--ink-soft)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition"
            >
              Explore tools
            </Link>
            <Link
              href="/blog/why-we-built-this"
              className="rounded-full bg-[var(--accent)] px-4 py-2 text-white shadow-[0_12px_30px_rgba(199,92,46,0.25)]"
            >
              Read the manifesto
            </Link>
          </div>
        </header>

        <section className="relative mx-auto max-w-6xl px-6 pb-16 pt-8">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--ink-soft)]">
                Transparency first
              </p>
              <h1 className={`${display.className} mt-5 text-5xl font-semibold leading-tight text-[var(--ink)] md:text-6xl`}>
                We publish our math, our incentives, and our decision traces.
              </h1>
              <p className="mt-6 text-lg text-[var(--ink-soft)]">
                ClearMoney is built as a consumer advocate. Every recommendation is backed by explainable logic and
                auditable data so you can trust the outcome or challenge it with facts.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="rounded-full border border-[var(--ink-line)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--ink-soft)]">
                  No affiliate bias
                </div>
                <div className="rounded-full border border-[var(--ink-line)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--ink-soft)]">
                  Open methodology
                </div>
                <div className="rounded-full border border-[var(--ink-line)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--ink-soft)]">
                  Audit-ready traces
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-[var(--ink-line)] bg-white/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 text-sm text-[var(--ink-soft)]">
                <Layers className="h-5 w-5 text-[var(--accent-2)]" />
                The Independence Pledge
              </div>
              <div className="mt-5 grid gap-6">
                <div>
                  <p className={`${display.className} text-xl font-semibold`}>We will never:</p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
                    {pledgeNever.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className={`${display.className} text-xl font-semibold`}>We will always:</p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
                    {pledgeAlways.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[var(--accent-2)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--ink-soft)]">
              Methodology
            </p>
            <h2 className={`${display.className} mt-4 text-4xl font-semibold`}>
              How we build recommendations
            </h2>
            <p className="mt-4 text-[var(--ink-soft)]">
              Our process is designed for accountability. We treat your financial decisions like an engineering system:
              define inputs, apply rules, track outputs, and store a trace.
            </p>
            <div className="mt-8 space-y-4">
              {methodologySteps.map((step, index) => (
                <div
                  key={step.title}
                  className="rounded-2xl border border-[var(--ink-line)] bg-white/70 p-5"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-soft)]">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-[var(--ink-line)] bg-[#151311] p-8 text-white shadow-[0_40px_120px_rgba(0,0,0,0.25)]">
            <div className="flex items-center gap-3 text-sm text-[#c9bdb0]">
              <Target className="h-5 w-5 text-[var(--accent)]" />
              Decision Trace Snapshot
            </div>
            <h3 className={`${display.className} mt-4 text-3xl font-semibold`}>
              Every recommendation is auditable.
            </h3>
            <p className="mt-4 text-sm text-[#c9bdb0]">
              The trace captures your data, our assumptions, and the exact logic that produced the result.
            </p>
            <div className="mt-6 grid gap-3">
              {traceFields.map((field) => (
                <div
                  key={field}
                  className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80"
                >
                  {field}
                </div>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">Confidence</p>
                <p className="mt-2 text-2xl font-semibold">84%</p>
              </div>
              <div className="h-12 w-12 rounded-full border border-white/10 bg-[radial-gradient(circle,#c75c2e,transparent_70%)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[32px] border border-[var(--ink-line)] bg-white/80 p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--ink-soft)]">
                Transparency signals
              </p>
              <h2 className={`${display.className} mt-3 text-3xl font-semibold`}>
                How you can verify us
              </h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-[var(--accent)] hover:text-[var(--accent-2)]"
            >
              Read the research
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {transparencySignals.map((signal) => {
              const Icon = signal.icon;
              return (
                <div
                  key={signal.label}
                  className="rounded-2xl border border-[var(--ink-line)] bg-white/70 p-6"
                >
                  <Icon className="h-6 w-6 text-[var(--accent)]" />
                  <h3 className="mt-4 text-lg font-semibold">{signal.label}</h3>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">{signal.value}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[32px] border border-[var(--ink-line)] bg-[#1b1a17] p-8 text-white">
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-white/60">
              <Info className="h-4 w-4 text-[var(--accent)]" />
              Corrections & data integrity
            </div>
            <h3 className={`${display.className} mt-4 text-3xl font-semibold`}>
              We publish changes.
            </h3>
            <p className="mt-4 text-sm text-white/70">
              Every adjustment to valuations, assumptions, or recommendations is tracked. Corrections are versioned
              and visible, with the reasoning behind each change.
            </p>
            <div className="mt-6 space-y-3">
              {[
                "Community submissions reviewed within 72 hours",
                "Audit log of valuation changes",
                "Data freshness badges on every tool",
                "Corrections surfaced in the UI",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[32px] border border-[var(--ink-line)] bg-white/80 p-8">
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--ink-soft)]">
              Revenue transparency
            </p>
            <h3 className={`${display.className} mt-4 text-3xl font-semibold`}>
              Incentives you can see.
            </h3>
            <p className="mt-4 text-sm text-[var(--ink-soft)]">
              We publish affiliate payouts and never hide conflicts. If we earn money from a card, you will see it next
              to the recommendation.
            </p>
            <div className="mt-6 rounded-2xl border border-[var(--ink-line)] bg-white p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-soft)]">Example disclosure</p>
              <div className="mt-3 text-sm text-[var(--ink-soft)]">
                <p>Card: Chase Sapphire Preferred</p>
                <p>Affiliate payout: $175</p>
                <p>Recommendation rank: 4th</p>
                <p>Reason: Lower net value for your spend profile</p>
              </div>
            </div>
            <Link
              href="/tools"
              className="mt-6 inline-flex items-center gap-2 text-sm text-[var(--accent)]"
            >
              Explore decision tools
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
