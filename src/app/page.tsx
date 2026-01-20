import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Calculator,
  BookOpen,
  Shield,
  Eye,
  Users,
  Zap,
} from "lucide-react";
import { categories, tools, getLiveTools } from "@/lib/site-config";

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

  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-600/10 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500"></span>
              </span>
              The honest alternative to corporate finance media
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              Financial literacy{" "}
              <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                for everyone
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-400 sm:text-xl">
              Interactive tools and unbiased advice to help you make smarter
              money decisions. No affiliate bias. No corporate influence. Just
              math and honest opinions.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="xl" asChild>
                <Link href="#tools">
                  Explore Tools
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link href="/blog/why-we-built-this">Our Mission</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="border-y border-neutral-800 bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Your Money, Demystified
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Honest guidance across every area of personal finance.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="group h-full transition-all hover:border-neutral-700 hover:bg-neutral-900/80">
                  <CardContent className="p-6">
                    <div className="mb-3 text-3xl">{category.icon}</div>
                    <h3 className="text-lg font-bold text-white group-hover:text-brand-400">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-sm text-neutral-400">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section id="tools" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Decision Tools
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Plug in your numbers. Get an answer. No fluff.
          </p>
        </div>

        {/* Live Tools */}
        {liveTools.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-brand-400">
              <Zap className="mr-2 inline h-4 w-4" />
              Live Now
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {liveTools.map((tool) => (
                <Link key={tool.id} href={tool.href}>
                  <Card className="group h-full transition-all hover:border-brand-500/50 hover:bg-neutral-900/80">
                    <CardContent className="flex items-start justify-between p-6">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white group-hover:text-brand-400">
                          {tool.name}
                        </h4>
                        <p className="mt-2 text-sm text-neutral-400">
                          {tool.description}
                        </p>
                      </div>
                      <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white transition-all group-hover:bg-brand-500">
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Coming Soon Tools - Preview */}
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-neutral-500">
            Coming Soon
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tools
              .filter((t) => t.status === "coming-soon")
              .slice(0, 6)
              .map((tool) => (
                <Card
                  key={tool.id}
                  className="border-neutral-800/50 bg-neutral-900/30"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <h4 className="text-sm font-medium text-neutral-300">
                        {tool.name}
                      </h4>
                      <span className="rounded-full bg-neutral-800 px-2 py-0.5 text-xs text-neutral-500">
                        Soon
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
          <p className="mt-4 text-center text-sm text-neutral-500">
            {tools.filter((t) => t.status === "coming-soon").length} more tools
            in development
          </p>
        </div>
      </section>

      {/* Principles Section */}
      <section className="border-y border-neutral-800 bg-neutral-900/30">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Why We're Different
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              We're not here to sell you products. We're here to help you
              decide.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => (
              <div key={principle.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600/20 text-brand-400">
                  <principle.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-400">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <Card className="overflow-hidden">
          <div className="relative bg-gradient-to-br from-brand-600/20 via-neutral-900 to-neutral-900 p-8 sm:p-12">
            <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-brand-600/10 blur-3xl" />
            <div className="relative">
              <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
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
                <Button size="lg" asChild>
                  <Link href="/tools/bilt-calculator">
                    Try a Calculator
                    <Calculator className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/blog">
                    Read Our Takes
                    <BookOpen className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-800">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <span className="text-xl font-black text-white">ClearMoney</span>
              <p className="mt-2 text-sm text-neutral-500">
                Financial literacy for everyone. No corporate influence.
              </p>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-neutral-400">
                Categories
              </h4>
              <div className="flex flex-col gap-2 text-sm text-neutral-500">
                {categories.slice(0, 4).map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    className="hover:text-white"
                  >
                    {cat.shortName}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-neutral-400">
                Company
              </h4>
              <div className="flex flex-col gap-2 text-sm text-neutral-500">
                <Link href="/about" className="hover:text-white">
                  About
                </Link>
                <Link href="/methodology" className="hover:text-white">
                  Methodology
                </Link>
                <Link href="/transparency" className="hover:text-white">
                  Transparency
                </Link>
                <Link href="/blog" className="hover:text-white">
                  Blog
                </Link>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-neutral-400">
                Legal
              </h4>
              <div className="flex flex-col gap-2 text-sm text-neutral-500">
                <Link href="/privacy" className="hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-white">
                  Terms of Service
                </Link>
                <Link href="/disclosures" className="hover:text-white">
                  Disclosures
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-neutral-800 pt-8 text-center text-xs text-neutral-500">
            <p>
              We may earn affiliate commissions from some links. See our{" "}
              <Link
                href="/transparency"
                className="underline hover:text-neutral-300"
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
