"use client";

import type { ReactNode } from "react";
import Link from "next/link";

type ClerkProviderProps = { children: ReactNode };

export function ClerkProvider({ children }: ClerkProviderProps) {
  return <>{children}</>;
}

export function SignedIn({ children }: { children: ReactNode }) {
  void children;
  return null;
}

export function SignedOut({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function SignInButton({ children }: { children: ReactNode }) {
  return <Link href="/sign-in">{children}</Link>;
}

export function UserButton() {
  return null;
}

export function SignIn(props: Record<string, unknown>) {
  void props;
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-100">
      <p className="font-semibold">Sign in is disabled in static export.</p>
      <p className="mt-2 text-sm text-neutral-400">
        This deployment is built with <code>output: \"export\"</code>, so Clerk server features are not available.
      </p>
    </div>
  );
}

export function SignUp(props: Record<string, unknown>) {
  void props;
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-6 text-neutral-100">
      <p className="font-semibold">Sign up is disabled in static export.</p>
      <p className="mt-2 text-sm text-neutral-400">
        This deployment is built with <code>output: \"export\"</code>, so Clerk server features are not available.
      </p>
    </div>
  );
}

export function useAuth() {
  return {
    isSignedIn: false,
    userId: null as string | null,
    getToken: async () => null as string | null,
  };
}

