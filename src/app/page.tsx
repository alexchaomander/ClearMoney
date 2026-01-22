import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  BookOpen,
  Shield,
  Eye,
  Users,
  Zap,
  Clock,
  Sparkles,
} from "lucide-react";
import { categories, tools, getLiveTools, getFeaturedTools } from "@/lib/site-config";
import { Header } from "@/components/layout/Header";
import { FeaturedTools } from "@/components/shared/FeaturedTools";
import { NewsletterSignup } from "@/components/shared/NewsletterSignup";

const principles = [
  {
    icon: Shield,
    title: "No Corporate Influence",
    description:
      "We serve you, not banks or card issuers. Our advice is based on math, not who pays us.",
  },
  {
    icon: Eye,
    title: "Radical Transparency",
    description:
      "We publish our methodology, our revenue sources, and our conflicts of interest.",
  },
  {
    icon: Calculator,
    title: "Tools First",
    description:
      "Interactive calculators that respect your intelligence. No 3,000-word articles for simple questions.",
  },
  {
    icon: Users,
    title: "Financial Literacy for All",
    description:
      "Everyone deserves access to the same financial knowledge that professionals use.",
  },
];

export default function HomePage() {
  const liveTools = getLiveTools();
  const featuredTools = getFeaturedTools();
  const comingSoonTools = tools.filter((t) => t.status === "coming-soon");
  const uniqueCategories = [...new Set(liveTools.map((t) => t.categoryId))];

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/5 via-transparent to-neutral-950" />

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-brand-400/5 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
              </span>
              <span className="text-sm font-medium text-brand-400">
                The honest alternative to corporate finance media
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              <span className="font-display italic">Financial literacy</span>{" "}
              <span className="block mt-2 bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
                for everyone
              </span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-neutral-400 sm:text-xl">
              Interactive tools and unbiased advice to help you make smarter
              money decisions. No affiliate bias. No corporate influence. Just
              math and honest opinions.
            </p>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-brand-400" />
                <span className="text-neutral-300">
                  <strong className="text-white">{liveTools.length}</strong> live tools
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <span className="text-neutral-300">
                  <strong className="text-white">{uniqueCategories.length}</strong> categories
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-brand-400" />
                <span className="text-neutral-300">
                  <strong className="text-white">Zero</strong> affiliate bias
                </span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="#tools"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-neutral-950 font-semibold hover:bg-neutral-100 transition-colors"
              >
                Explore Tools
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-neutral-700 text-white font-semibold hover:bg-neutral-800/50 transition-colors"
              >
                Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="border-y border-neutral-800 bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Your Money, Demystified
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Honest guidance across every area of personal finance.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories
              .filter((cat, index, self) =>
                self.findIndex((c) => c.id === cat.id) === index
              )
              .slice(0, 9)
              .map((category, index) => (
                <Link
                  key={`${category.id}-${index}`}
                  href={category.href}
                  className="group p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900 transition-all animate-fade-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <FeaturedTools limit={6} />

      {/* All Tools Section */}
      <section id="tools" className="py-16 sm:py-24 border-t border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              All {liveTools.length} Decision Tools
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Plug in your numbers. Get an answer. No fluff.
            </p>
          </div>

          {/* Live Tools Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveTools.map((tool, index) => {
              const accentColor = tool.primaryColor || "#0ea5e9";
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative p-5 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900 transition-all"
                >
                  {/* Accent line */}
                  <div
                    className="absolute top-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: accentColor }}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white group-hover:text-brand-400 transition-colors truncate">
                        {tool.name}
                      </h3>
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-2">
                        {tool.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
                      <ArrowRight className="w-5 h-5 text-neutral-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Coming Soon */}
          {comingSoonTools.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-neutral-500" />
                <h3 className="text-lg font-semibold text-neutral-400">
                  Coming Soon
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {comingSoonTools.slice(0, 6).map((tool) => (
                  <div
                    key={tool.id}
                    className="p-4 rounded-xl border border-neutral-800/50 bg-neutral-900/30"
                  >
                    <h4 className="text-sm font-medium text-neutral-500">
                      {tool.name}
                    </h4>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-center text-sm text-neutral-600">
                {comingSoonTools.length} more tools in development
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Principles Section */}
      <section className="border-y border-neutral-800 bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Why We're Different
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              We're not here to sell you products. We're here to help you
              decide.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle, index) => (
              <div
                key={principle.title}
                className="text-center animate-fade-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-500/10 border border-brand-500/20">
                  <principle.icon className="h-7 w-7 text-brand-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-500">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-24 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900">
          {/* Background */}
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

          <div className="relative p-8 sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              The financial advice industry is broken.
            </h2>
            <p className="mt-4 max-w-2xl text-neutral-400">
              Most "advice" sites exist to serve banks and advertisers, not
              you. They're paid to push products, inflate valuations, and bury
              the real math under walls of SEO content.
            </p>
            <p className="mt-4 max-w-2xl font-medium text-white">
              We're building something different. A platform that serves
              people, not corporations.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/tools/bilt-calculator"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-400 transition-colors"
              >
                Try a Calculator
                <Calculator className="w-4 h-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-neutral-700 text-white font-semibold hover:bg-neutral-800 transition-colors"
              >
                Read Our Takes
                <BookOpen className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="border-t border-neutral-800">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:py-24 sm:px-6">
          <NewsletterSignup />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800 bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                  <Calculator className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-white">
                  Clear<span className="text-brand-400">Money</span>
                </span>
              </div>
              <p className="mt-3 text-sm text-neutral-500">
                Financial literacy for everyone. No corporate influence.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Categories
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                {categories
                  .filter((cat, index, self) =>
                    self.findIndex((c) => c.id === cat.id) === index
                  )
                  .slice(0, 4)
                  .map((cat) => (
                    <Link
                      key={cat.id}
                      href={cat.href}
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      {cat.shortName}
                    </Link>
                  ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Company
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors">
                  About
                </Link>
                <Link href="/methodology" className="text-neutral-400 hover:text-white transition-colors">
                  Methodology
                </Link>
                <Link href="/transparency" className="text-neutral-400 hover:text-white transition-colors">
                  Transparency
                </Link>
                <Link href="/blog" className="text-neutral-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Legal
              </h4>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/privacy" className="text-neutral-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-neutral-400 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/disclosures" className="text-neutral-400 hover:text-white transition-colors">
                  Disclosures
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-neutral-800 pt-8 text-center text-xs text-neutral-600">
            <p>
              We may earn affiliate commissions from some links. See our{" "}
              <Link
                href="/transparency"
                className="text-neutral-400 hover:text-white transition-colors underline"
              >
                transparency page
              </Link>{" "}
              for details. Our recommendations are based on math, not payouts.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
