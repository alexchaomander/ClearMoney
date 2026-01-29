"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { StrataClient } from "@clearmoney/strata-sdk";
import type { StrataClientInterface } from "@clearmoney/strata-sdk";
import { DemoStrataClient } from "./demo-client";
import { useDemoMode } from "./demo-context";

const StrataClientContext = createContext<StrataClientInterface | null>(null);

export function StrataProvider({ children }: { children: ReactNode }) {
  const isDemo = useDemoMode();

  const client = useMemo(() => {
    if (isDemo) {
      return new DemoStrataClient();
    }

    const baseUrl = process.env.NEXT_PUBLIC_STRATA_API_URL ?? "http://localhost:8006";
    const userId = process.env.NEXT_PUBLIC_DEV_USER_ID ?? "dev-user-001";

    return new StrataClient({
      baseUrl,
      clerkUserId: userId,
    });
  }, [isDemo]);

  return (
    <StrataClientContext.Provider value={client}>
      {children}
    </StrataClientContext.Provider>
  );
}

export function useStrataClient(): StrataClientInterface {
  const client = useContext(StrataClientContext);
  if (!client) {
    throw new Error("useStrataClient must be used within a StrataProvider");
  }
  return client;
}
