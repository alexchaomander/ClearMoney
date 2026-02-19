import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How ClearMoney collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-slate-950 transition-colors">
      <main className="max-w-3xl mx-auto px-6 lg:px-8 py-20">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">
          Legal
        </p>
        <h1 className="font-display text-4xl text-slate-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-12">
          Last updated: February 2026
        </p>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">1. What We Collect</h2>
            <p>
              ClearMoney collects the minimum data necessary to provide personalized financial
              guidance. This includes information you provide directly (name, email, financial
              preferences) and data fetched from connected financial institutions via Plaid and
              SnapTrade (account balances, holdings, transactions).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">2. How We Use Your Data</h2>
            <p>
              Your financial data is used exclusively to power your ClearMoney dashboard,
              generate personalized recommendations, and produce decision traces. We never sell
              your data to third parties, use it for advertising, or share it with anyone without
              your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">3. Data Security</h2>
            <p>
              All data is encrypted in transit (TLS) and at rest (AES-256). Financial
              credentials are stored using industry-standard encryption. We use Clerk for
              authentication and never store your passwords directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">4. Third-Party Services</h2>
            <p>
              We use Plaid and SnapTrade to securely connect to your financial institutions.
              These services use read-only access and cannot move money or execute trades on your
              behalf. We use Sentry for error tracking (no financial data is included in error
              reports).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">5. Your Rights</h2>
            <p>
              You can disconnect any financial account at any time. You can request a full export
              or deletion of your data by contacting us. When you delete your account, all
              associated data is permanently removed.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">6. Consent Model</h2>
            <p>
              ClearMoney uses a granular consent system. Each data scope (reading accounts,
              accessing transactions, etc.) requires your explicit approval, and you can revoke
              any scope at any time from your Settings page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">7. Contact</h2>
            <p>
              For privacy-related questions, contact us at{" "}
              <a href="mailto:privacy@clearmoney.com" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                privacy@clearmoney.com
              </a>.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/"
            className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
