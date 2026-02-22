import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

// Provide a working localStorage mock when jsdom doesn't initialise one
// (e.g. when --localstorage-file is missing or invalid).
if (typeof window !== "undefined" && typeof window.localStorage.getItem !== "function") {
  const store = new Map<string, string>();
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, String(value)),
      removeItem: (key: string) => store.delete(key),
      clear: () => store.clear(),
      get length() {
        return store.size;
      },
      key: (index: number) => [...store.keys()][index] ?? null,
    },
    writable: true,
  });
}

type ChildrenProps = { children?: React.ReactNode };

function Passthrough({ children }: ChildrenProps): React.ReactNode {
  return children ?? null;
}

function UserButtonMock(): React.ReactElement {
  return React.createElement("div", { "data-testid": "clerk-user-button" });
}

vi.mock("@clerk/nextjs", () => {
  return {
    SignedIn: Passthrough,
    SignedOut: Passthrough,
    SignInButton: Passthrough,
    UserButton: UserButtonMock,
  };
});
