import type { Metadata } from "next";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import { IndependenceAuditTable } from "@/components/transparency/IndependenceAuditTable";

const body = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Independence Report | ClearMoney",
  description: "Annual accountability report on ClearMoney recommendations and payouts.",
};

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
        <IndependenceAuditTable />
      </main>
    </div>
  );
}
