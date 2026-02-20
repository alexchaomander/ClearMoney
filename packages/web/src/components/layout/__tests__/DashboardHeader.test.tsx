import { render, screen } from "@testing-library/react";

import { DashboardHeader } from "../DashboardHeader";
import { ThemeProvider } from "../../theme-provider";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/connect",
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

describe("DashboardHeader", () => {
  it("renders navigation items and branding", () => {
    render(
      <ThemeProvider>
        <DashboardHeader />
      </ThemeProvider>
    );

    expect(screen.getByText(/Clear/)).toBeInTheDocument();
    expect(screen.getByText(/Money/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Connect" })).toBeInTheDocument();
  });
});
