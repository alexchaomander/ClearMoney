import { render, screen } from "@testing-library/react";
import { FeeBreakdown } from "../FeeBreakdown";
import { describe, it, expect } from "vitest";

describe("FeeBreakdown", () => {
  it("calculates positive effective fee correctly", () => {
    render(
      <FeeBreakdown
        annualFee={695}
        creditsValue={200}
        benefitsValue={100}
      />
    );

    // 695 - 200 - 100 = 395
    expect(screen.getByText("Your Real Cost")).toBeInTheDocument();
    expect(screen.getByText("$395")).toBeInTheDocument();
    expect(screen.getByText("$395")).toHaveClass("text-red-600");
  });

  it("calculates negative effective fee (profit) correctly", () => {
    render(
      <FeeBreakdown
        annualFee={95}
        creditsValue={100}
        benefitsValue={50}
      />
    );

    // 95 - 100 - 50 = -55
    expect(screen.getByText("-$55")).toBeInTheDocument();
    expect(screen.getByText("-$55")).toHaveClass("text-green-600");
    expect(screen.getByText(/pays you \$55 to keep it/)).toBeInTheDocument();
  });
});
