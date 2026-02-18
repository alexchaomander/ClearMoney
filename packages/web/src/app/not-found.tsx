import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-emerald-500">
        404
      </p>
      <h1 className="mt-4 font-display text-4xl tracking-tight text-slate-900 dark:text-white sm:text-5xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-lg text-slate-500 dark:text-slate-400">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-10 flex items-center gap-4">
        <Link
          href="/"
          className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
        >
          Go home
        </Link>
        <Link
          href="/tools"
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Browse tools
        </Link>
      </div>
    </div>
  );
}
