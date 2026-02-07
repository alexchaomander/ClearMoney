import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

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
