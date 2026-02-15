"use client";

import { Suspense, type ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/strata/query-provider";
import { DemoModeProvider } from "@/lib/strata/demo-context";
import { StrataProvider } from "@/lib/strata/client";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { StrataAuthSync } from "@/lib/strata/auth";
import { ToastProvider } from "@/components/shared/toast";

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function ProvidersContent({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DemoModeProvider>
        <QueryProvider>
          <StrataProvider>
            <ToastProvider>
              {hasClerkKey ? <StrataAuthSync /> : null}
              <DemoBanner />
              <div className="flex min-h-screen flex-col">
                <main className="flex-1">{children}</main>
              </div>
            </ToastProvider>
          </StrataProvider>
        </QueryProvider>
      </DemoModeProvider>
    </Suspense>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      {hasClerkKey ? (
        <ClerkProvider>
          <ProvidersContent>{children}</ProvidersContent>
        </ClerkProvider>
      ) : (
        <ProvidersContent>{children}</ProvidersContent>
      )}
    </ThemeProvider>
  );
}
