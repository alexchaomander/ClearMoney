"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRightLeft, ExternalLink } from "lucide-react";
import { useDemoMode } from "@/lib/strata/demo-context";

export function DemoBanner() {
  const isDemo = useDemoMode();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isProductArea =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/connect") ||
    pathname.startsWith("/advisor") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/settings");
  if (!isProductArea) return null;

  const makeModeHref = (nextDemoMode: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextDemoMode) {
      params.set("demo", "true");
    } else {
      params.delete("demo");
    }

    const nextSearch = params.toString();
    return nextSearch ? `${pathname}?${nextSearch}` : pathname;
  };

  const liveHref = makeModeHref(false);
  const demoHref = makeModeHref(true);

  return (
    <div
      className={`${
        isDemo
          ? "bg-amber-500/90 text-amber-950"
          : "bg-neutral-900/90 text-neutral-100 border-b border-neutral-800"
      } text-center text-sm font-medium py-1.5 px-4`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex items-center gap-2">
          {isDemo ? <CheckCircle2 className="w-4 h-4" /> : <ExternalLink className="w-4 h-4" />}
          <span>
            {isDemo
              ? "Demo Mode is active — showing realistic synthetic Strata sample data."
              : "Live mode is active — your UI can pull real Strata integrations."}
          </span>
        </div>
        <div className="inline-flex flex-wrap items-center gap-2">
          <Link
            href={isDemo ? liveHref : demoHref}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition-colors border-current/40 bg-black/5 hover:bg-black/10"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            {isDemo ? "Switch to live data" : "Try synthetic preview"}
          </Link>
          {isDemo ? (
            <Link
              href="/connect"
              className="inline-flex items-center gap-2 rounded-full border border-black/20 px-3 py-1 text-xs font-medium transition-colors hover:bg-black/10"
            >
              Connect real data
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
