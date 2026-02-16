import type { Metadata } from "next";
import Link from "next/link";
import { Work_Sans } from "next/font/google";
import { ArrowUpRight } from "lucide-react";
import { CorrectionsLogTable } from "@/components/transparency/CorrectionsLogTable";

const body = Work_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: "Corrections Log | ClearMoney",
  description: "Every methodology change, public and timestamped.",
};

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
        <CorrectionsLogTable />
      </main>
    </div>
  );
}
