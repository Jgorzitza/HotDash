import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SalesPulseTile } from "../../app/components/tiles/SalesPulseTile";

const summary = {
  shopDomain: "test-shop",
  totalRevenue: 1250.5,
  currency: "USD",
  orderCount: 12,
  topSkus: [
    { sku: "SKU1", title: "Widget", quantity: 4, revenue: 400 },
    { sku: "SKU2", title: "Gadget", quantity: 3, revenue: 300 },
  ],
  pendingFulfillment: [
    { orderId: "1", name: "#1001", displayStatus: "UNFULFILLED", createdAt: new Date().toISOString() },
  ],
  generatedAt: new Date().toISOString(),
};

describe("SalesPulseTile", () => {
  it("does not render modal trigger when disabled", () => {
    render(<SalesPulseTile summary={summary} enableModal={false} />);

    expect(screen.queryByRole("button", { name: /view details/i })).toBeNull();
  });

  it("renders modal trigger when enabled", () => {
    render(<SalesPulseTile summary={summary} enableModal />);

    expect(screen.getByRole("button", { name: /view details/i })).toBeInTheDocument();
  });
});
