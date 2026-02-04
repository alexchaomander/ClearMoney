import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Work_Sans } from "next/font/google";
import { ArrowUpRight, Receipt, Scale } from "lucide-react";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });
const body = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Payout Disclosure | ClearMoney",
  description: "Live affiliate payout estimates and how they influence rankings.",
};

const payoutRows = [
  {
    card: "Chase Sapphire Preferred",
    payout: 175,
    rank: 4,
    reason: "Net value behind no-fee alternatives for low travel spend.",
  },
  {
    card: "Amex Platinum",
    payout: 450,
    rank: 6,
    reason: "Credits hard to use; high annual fee drag.",
  },
  {
    card: "Capital One Venture X",
    payout: 350,
    rank: 3,
    reason: "Strong for high travel spend; average otherwise.",
  },
];

export default function PayoutDisclosurePage() {
  return (
    <div className={`${body.className} min-h-screen bg-[#0d1418] text-white`}>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
        <Link href="/transparency" className="text-xs uppercase tracking-[0.3em] text-white/60">
          Transparency Hub
        </Link>
        <Link href="/independence-report" className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-emerald-300">
          Independence Report
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Payout disclosure</p>
            <h1 className={`${display.className} mt-4 text-5xl font-semibold leading-tight`}>
              See every payout, next to every recommendation.
            </h1>
            <p className="mt-6 text-lg text-white/70">
              We publish estimated affiliate payouts and how they compare to our ranking. If a payout is high
              and the recommendation is low, you will see why.
            </p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3 text-sm text-white/60">
              <Receipt className="h-5 w-5 text-emerald-300" />
              What this means
            </div>
            <p className="mt-4 text-sm text-white/70">
              Payouts are estimates based on public reports and affiliate network ranges. We update monthly.
            </p>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
              Last update: January 2026
            </div>
          </div>
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-8">
          <div className="flex items-center justify-between">
            <h2 className={`${display.className} text-3xl font-semibold`}>Sample payout table</h2>
            <Scale className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="mt-6 space-y-4">
            {payoutRows.map((row) => (
              <div key={row.card} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold">{row.card}</p>
                    <p className="text-sm text-white/60">{row.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">Payout</p>
                    <p className="text-lg">${row.payout}</p>
                    <p className="text-xs text-white/50">Rank: {row.rank}</p>
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
