import { render, screen } from "@testing-library/react";

import { DashboardHeader } from "../DashboardHeader";

vi.mock("next/navigation", () => ({
  usePathname: () => "/connect",
}));

describe("DashboardHeader", () => {
  it("renders navigation items and branding", () => {
    render(<DashboardHeader />);

    expect(screen.getByText(/ClearMoney/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Connect" })).toBeInTheDocument();
  });
});
