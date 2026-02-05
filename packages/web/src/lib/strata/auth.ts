"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useStrataClient } from "@/lib/strata/client";

export function StrataAuthSync(): null {
  const { getToken, isSignedIn, userId } = useAuth();
  const client = useStrataClient();

  useEffect(() => {
    let active = true;
    async function sync() {
      if (!isSignedIn || !userId) {
        client.setAuthToken(null);
        client.setClerkUserId(null);
        return;
      }
      client.setClerkUserId(userId);
      const token = await getToken();
      if (!active) return;
      client.setAuthToken(token ?? null);
    }
    void sync();
    return () => {
      active = false;
    };
  }, [client, getToken, isSignedIn, userId]);

  return null;
}
