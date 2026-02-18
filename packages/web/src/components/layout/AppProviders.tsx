"use client";

import { Suspense, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/lib/strata/query-provider";
import { DemoModeProvider } from "@/lib/strata/demo-context";
import { StrataProvider } from "@/lib/strata/client";
import { DemoBanner } from "@/components/shared/DemoBanner";
import { StrataAuthSync } from "@/lib/strata/auth";
import { ToastProvider } from "@/components/shared/toast";
import { AssumptionProvider } from "@/components/dashboard/AssumptionControl";
import { ActionExecutionProvider } from "@/lib/strata/action-execution-context";
import { DensityProvider } from "@/components/layout/DensityContext";
import { AdvisorSidebar } from "@/components/advisor/AdvisorSidebar";
import { HighlightProvider } from "@/lib/strata/highlight-context";

const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

function ProvidersContent({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <DemoModeProvider>
        <QueryProvider>
          <StrataProvider>
            <ToastProvider>
              <ActionExecutionProvider>
                <AssumptionProvider>
                  <DensityProvider>
                    <HighlightProvider>
                      {hasClerkKey ? <StrataAuthSync /> : null}
                      <DemoBanner />
                      <div className="flex min-h-screen flex-col">
                        <main id="main-content" className="flex-1">{children}</main>
                      </div>
                      <AdvisorSidebar />
                    </HighlightProvider>
                  </DensityProvider>
                </AssumptionProvider>
              </ActionExecutionProvider>
            </ToastProvider>
          </StrataProvider>
        </QueryProvider>
      </DemoModeProvider>
    </Suspense>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
    <ThemeProvider>
      {hasClerkKey ? (
        <ClerkProvider>
          <ProvidersContent>{children}</ProvidersContent>
        </ClerkProvider>
      ) : (
        <ProvidersContent>{children}</ProvidersContent>
      )}
    </ThemeProvider>
    </MotionConfig>
  );
}
