"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-rose-500">
        Something went wrong
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-slate-900 dark:text-white sm:text-5xl">
        Unexpected error
      </h1>
      <p className="mt-4 max-w-md text-lg text-slate-500 dark:text-slate-400">
        We hit a snag loading this page. Your data is safe — try refreshing.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <button
          onClick={reset}
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
