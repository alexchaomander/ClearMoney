import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Work_Sans } from "next/font/google";
import {
  ArrowUpRight,
  Shield,
  ScrollText,
  Activity,
  Receipt,
  BookOpen,
} from "lucide-react";

const display = Fraunces({ subsets: ["latin"], weight: ["400", "600", "700"] });
const body = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Transparency | ClearMoney",
  description:
    "ClearMoney transparency hub: independence report, payout disclosure, and corrections log.",
};

const cards = [
  {
    title: "Independence Report",
    description: "Annual accountability report on recommendations vs payouts.",
    href: "/independence-report",
    icon: Shield,
    accent: "from-amber-400/40 to-orange-500/20",
  },
  {
    title: "Payout Disclosure",
    description: "Live affiliate payout estimates and how they influence rankings.",
    href: "/payout-disclosure",
    icon: Receipt,
    accent: "from-emerald-400/40 to-teal-500/20",
  },
  {
    title: "Corrections Log",
    description: "Every methodology change, public and timestamped.",
    href: "/corrections",
    icon: ScrollText,
    accent: "from-sky-400/40 to-indigo-500/20",
  },
];

export default function TransparencyHubPage() {
  return (
    <div className={`${body.className} min-h-screen bg-[#0e0f13] text-white`}>
      <div className="relative overflow-hidden">
        <div className="absolute -left-40 top-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,#2f6bff33,transparent_70%)] blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,#0bb39c33,transparent_70%)] blur-3xl" />

        <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">ClearMoney</p>
              <p className={`${display.className} text-lg font-semibold`}>Transparency Hub</p>
            </div>
          </Link>
          <Link
            href="/methodology"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 hover:border-white/50 hover:text-white"
          >
            Methodology
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </header>

        <section className="mx-auto max-w-6xl px-6 pb-16 pt-4">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-white/60">Accountability</p>
              <h1 className={`${display.className} mt-4 text-5xl font-semibold leading-tight`}>A transparent financial lab.</h1>
              <p className="mt-6 text-lg text-white/70">
                ClearMoney publishes how we make decisions, how we make money, and when we are wrong.
                If a recommendation shifts, you can see the trail.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <div className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                  Payout disclosure
                </div>
                <div className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                  Corrections log
                </div>
                <div className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70">
                  Independence pledge
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <div className="flex items-center gap-3 text-sm text-white/60">
                <Activity className="h-5 w-5 text-emerald-300" />
                Live signals
              </div>
              <div className="mt-6 space-y-4 text-sm text-white/70">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Affiliate payouts disclosed</span>
                  <span className="text-emerald-300">100%</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span>Methodology updates logged</span>
                  <span className="text-emerald-300">Always</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Corrections published</span>
                  <span className="text-emerald-300">72h SLA</span>
                </div>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs text-white/60">
                Last updated: January 2026
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-white/30"
              >
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${card.accent} flex items-center justify-center`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className={`${display.className} mt-6 text-2xl font-semibold`}>{card.title}</h3>
                <p className="mt-3 text-sm text-white/70">{card.description}</p>
                <div className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50 group-hover:text-white">
                  Open report
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-10">
          <div className="flex items-center gap-3 text-sm text-white/60">
            <BookOpen className="h-5 w-5 text-emerald-300" />
            Our promise
          </div>
          <h2 className={`${display.className} mt-4 text-3xl font-semibold`}>
            We will show the math, or we won’t publish it.
          </h2>
          <p className="mt-4 text-sm text-white/70 max-w-3xl">
            If we can’t explain a recommendation in plain language, we don’t ship it. Every tool links to the
            assumptions and data used. Every payout is disclosed. Every correction is public.
          </p>
        </div>
      </section>
    </div>
  );
}
