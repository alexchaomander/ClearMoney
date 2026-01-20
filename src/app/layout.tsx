import type { Metadata } from "next";
import "./globals.css";

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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
