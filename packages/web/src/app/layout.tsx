import type { Metadata } from "next";
import "./globals.css";
import { AppProviders } from "@/components/layout/AppProviders";

const SITE_NAME = "ClearMoney";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Financial Literacy for Everyone`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "The honest alternative to corporate finance media. Interactive calculators and unbiased advice for credit cards, investing, budgeting, and more. No affiliate bias. No corporate influence.",
  keywords: [
    "personal finance",
    "financial literacy",
    "credit card calculator",
    "investing calculator",
    "budgeting tools",
    "debt payoff calculator",
    "retirement planning",
    "401k calculator",
    "savings calculator",
    "honest financial advice",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Financial Literacy for Everyone`,
    description:
      "The honest alternative to corporate finance media. Interactive tools and unbiased advice.",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "The honest alternative to corporate finance media. Interactive tools and unbiased advice.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
