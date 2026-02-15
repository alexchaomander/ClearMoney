import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Work_Sans } from "next/font/google";
import { ArrowUpRight, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { independenceAuditRows } from "@/lib/transparency-data";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });
const body = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Independence Report | ClearMoney",
  description: "Annual accountability report on ClearMoney recommendations and payouts.",
};

const highlights = [
  { label: "Recommendations vs highest payout", value: "78%" },
  { label: "Negative reviews published", value: "12" },
  { label: "Corrections issued", value: "7" },
  { label: "Affiliate payout transparency", value: "100%" },
];


export default function IndependenceReportPage() {
  return (
    <div className={`${body.className} min-h-screen bg-[#12131a] text-white`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <Link href="/transparency" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
          Transparency Hub
        </Link>
        <Link href="/payout-disclosure" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
          Payout Disclosure
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">2026 Independence Report</p>
            <h1 className={`${display.className} mt-4 text-5xl font-semibold leading-tight`}>
              We measure ourselves by how often we say no.
            </h1>
            <p className="mt-6 text-lg text-white/70">
              This report compares our recommendations to affiliate payouts and highlights when we ranked
              against the highest commission card.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              Independence signals
            </div>
            <div className="mt-6 grid gap-4">
              {highlights.map((item) => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sm text-white/70">{item.label}</span>
                  <span className="text-lg font-semibold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center justify-between">
            <h2 className={`${display.className} text-3xl font-semibold`}>Ranking audit</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-white/50">Illustrative dataset</span>
          </div>
          <div className="mt-6 space-y-4">
            {independenceAuditRows.map((row) => {
              const DeltaIcon = row.delta > 0 ? TrendingUp : TrendingDown;
              return (
                <div key={row.card} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold">{row.card}</p>
                      <p className="text-sm text-white/60">{row.reason}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wide">Our Rank</p>
                        <p className="text-lg">{row.ourRank}</p>
                      </div>
                      <div>
                        <p className="text-white/50 text-xs uppercase tracking-wide">Payout Rank</p>
                        <p className="text-lg">{row.payoutRank}</p>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-300">
                        <DeltaIcon className="h-4 w-4" />
                        {row.delta}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
