import { render, screen } from "@testing-library/react";

import { DashboardHeader } from "../DashboardHeader";

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
    render(<DashboardHeader />);

    expect(screen.getByText(/Clear/)).toBeInTheDocument();
    expect(screen.getByText(/Money/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Connect" })).toBeInTheDocument();
  });
});
