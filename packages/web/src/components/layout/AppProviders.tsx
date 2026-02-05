"use client";

import { Suspense, type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/strata/query-provider";
import { DemoModeProvider } from "@/lib/strata/demo-context";
import { StrataProvider } from "@/lib/strata/client";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { StrataAuthSync } from "@/lib/strata/auth";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <ClerkProvider>
        <Suspense fallback={null}>
          <DemoModeProvider>
            <QueryProvider>
              <StrataProvider>
                <StrataAuthSync />
                <DemoBanner />
                <div className="flex min-h-screen flex-col">
                  <main className="flex-1">{children}</main>
                </div>
              </StrataProvider>
            </QueryProvider>
          </DemoModeProvider>
        </Suspense>
      </ClerkProvider>
    </ThemeProvider>
  );
}
