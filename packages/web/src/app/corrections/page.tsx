import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Work_Sans } from "next/font/google";
import { ArrowUpRight, ScrollText, CheckCircle2, AlertTriangle } from "lucide-react";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });
const body = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Corrections Log | ClearMoney",
  description: "Every methodology change, public and timestamped.",
};

const corrections = [
  {
    date: "2026-01-19",
    type: "Correction",
    summary: "Updated Hilton valuation after program devaluation notice.",
    impact: "-0.05 cpp",
  },
  {
    date: "2026-01-12",
    type: "Update",
    summary: "Adjusted Amex Platinum credit usability defaults based on user surveys.",
    impact: "No change to net value for median user",
  },
  {
    date: "2026-01-05",
    type: "Correction",
    summary: "Fixed Chase Freedom Flex 5x category mapping bug.",
    impact: "+$24/year average",
  },
];

export default function CorrectionsPage() {
  return (
    <div className={`${body.className} min-h-screen bg-[#0f1115] text-white`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <Link href="/transparency" className="text-xs uppercase tracking-[0.3em] text-white/60">
          Transparency Hub
        </Link>
        <Link href="/methodology" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
          Methodology
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Corrections log</p>
            <h1 className={`${display.className} mt-4 text-5xl font-semibold leading-tight`}>
              We publish every change.
            </h1>
            <p className="mt-6 text-lg text-white/70">
              When assumptions shift or we discover an error, we log it publicly. This is how we keep ourselves honest.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <ScrollText className="h-5 w-5 text-emerald-300" />
              Correction standards
            </div>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Public timestamp</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" />Clear impact summary</li>
              <li className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-300" />Flagged in affected tools</li>
            </ul>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className={`${display.className} text-3xl font-semibold`}>Recent corrections</h2>
          <div className="mt-6 space-y-4">
            {corrections.map((item) => (
              <div key={item.date} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{item.date}</p>
                    <p className="text-lg font-semibold">{item.summary}</p>
                    <p className="text-sm text-white/60">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Impact</p>
                    <p className="text-lg text-emerald-300">{item.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
