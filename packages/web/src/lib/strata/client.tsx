"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { StrataClient } from "@clearmoney/strata-sdk";
import type { StrataClientInterface } from "@clearmoney/strata-sdk";
import { DemoStrataClient } from "./demo-client";
import { useDemoMode } from "./demo-context";

const StrataClientContext = createContext<StrataClientInterface | null>(null);

const LOCAL_USER_KEY = "clearmoney-user-id";

function getOrCreateLocalUserId(): string | null {
  if (typeof window === "undefined") return null;
  const existing = window.localStorage.getItem(LOCAL_USER_KEY);
  if (existing) return existing;
  const generated = crypto.randomUUID();
  window.localStorage.setItem(LOCAL_USER_KEY, generated);
  return generated;
}

export function StrataProvider({ children }: { children: ReactNode }) {
  const isDemo = useDemoMode();
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!isDemo) {
      setLocalUserId(getOrCreateLocalUserId());
    }
  }, [isDemo]);

  const client = useMemo(() => {
    if (isDemo) {
      return new DemoStrataClient();
    }

    const baseUrl = process.env.NEXT_PUBLIC_STRATA_API_URL ?? "http://localhost:8006";
    const userId = process.env.NEXT_PUBLIC_STRATA_USER_ID ?? localUserId ?? undefined;
    const authToken = process.env.NEXT_PUBLIC_STRATA_AUTH_TOKEN;

    return new StrataClient({
      baseUrl,
      clerkUserId: userId,
      authToken,
    });
  }, [isDemo, localUserId]);

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
