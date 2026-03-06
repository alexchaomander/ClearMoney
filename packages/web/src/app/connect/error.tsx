"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

export default function ConnectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-rose-500">
        Connection Error
      </p>
      <h1 className="mt-4 font-display text-3xl tracking-tight text-slate-900 dark:text-white">
        Could not load account connections
      </h1>
      <p className="mt-4 max-w-md text-base text-slate-500 dark:text-slate-400">
        There was a problem loading the connection page. Your linked accounts are
        safe.
      </p>
      <div className="mt-8 flex items-center gap-4">
        <button
          onClick={reset}
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
