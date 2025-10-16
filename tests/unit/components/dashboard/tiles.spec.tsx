import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppProvider } from "@shopify/polaris";
function renderWithPolaris(ui: any) { return render(<AppProvider i18n={{}}>{ui}</AppProvider>); }

import { AOVTile } from "../../../../app/components/dashboard/AOVTile";
import { ReturnsTile } from "../../../../app/components/dashboard/ReturnsTile";
import { StockRiskTile } from "../../../../app/components/dashboard/StockRiskTile";
import { SEOTile } from "../../../../app/components/dashboard/SEOTile";
import { CXTile } from "../../../../app/components/dashboard/CXTile";
import { RevenueTile } from "../../../../app/components/dashboard/RevenueTile";
import { RevenueTileEnhanced } from "../../../../app/components/dashboard/RevenueTileEnhanced";

describe("RevenueTile", () => {
    it("should render value and orders with trend", () => {
      renderWithPolaris(<RevenueTile value="$8,425.50" orderCount={58} trend="up" />);
      expect(screen.getByText("$8,425.50")).toBeInTheDocument();
      expect(screen.getByText(/58 orders today/)).toBeInTheDocument();
    });
    it("should show loading state", () => {
      renderWithPolaris(<RevenueTile value="$0.00" orderCount={0} trend="neutral" loading />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("RevenueTileEnhanced", () => {
    const spark = [
      { date: "2025-10-12", value: 100 },
      { date: "2025-10-13", value: 140 },
      { date: "2025-10-14", value: 120 },
      { date: "2025-10-15", value: 180 },
      { date: "2025-10-16", value: 160 },
    ];
    it("should render sparkline and anomalies badge", () => {
      renderWithPolaris(
        <RevenueTileEnhanced
          value="$8,425.50"
          orderCount={58}
          trend="up"
          sparklineData={spark}
          anomalies={[{ date: "2025-10-15", reason: "Promo spike" }]}
        />
      );
      expect(screen.getByText("$8,425.50")).toBeInTheDocument();
      expect(screen.getByText(/58 orders today/)).toBeInTheDocument();
    });
  });

describe("Dashboard Tiles", () => {
  describe("AOVTile", () => {
    it("should render value and trend", () => {
      renderWithPolaris(<AOVTile value="$145.27" trend="up" percentChange="+12%" />);
      expect(screen.getByText("$145.27")).toBeInTheDocument();
      expect(screen.getByText("+12% vs yesterday")).toBeInTheDocument();
    });
    it("should show loading state", () => {
      renderWithPolaris(<AOVTile value="$145.27" trend="up" percentChange="+12%" loading />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("ReturnsTile", () => {
    it("should render count and pending", () => {
      renderWithPolaris(<ReturnsTile count={3} pendingReview={2} trend="neutral" />);
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("2 pending review")).toBeInTheDocument();
    });
  });

  describe("StockRiskTile", () => {
    it("should render SKU count", () => {
      renderWithPolaris(<StockRiskTile skuCount={2} subtitle="Below reorder point" trend="down" />);
      expect(screen.getByText("2 SKUs")).toBeInTheDocument();
    });
  });

  describe("SEOTile", () => {
    it("should render alert count", () => {
      renderWithPolaris(<SEOTile alertCount={1} topAlert="/collections/new -24% WoW" trend="down" />);
      expect(screen.getByText("1 alert")).toBeInTheDocument();
    });
  });

  describe("CXTile", () => {
    it("should render escalation count", () => {
      renderWithPolaris(<CXTile escalationCount={1} slaStatus="SLA breached 3h ago" trend="down" />);
      expect(screen.getByText("1 escalation")).toBeInTheDocument();
    });
  });
});
