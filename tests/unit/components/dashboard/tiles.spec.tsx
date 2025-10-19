import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PolarisTestProvider } from "@shopify/polaris";
import type { ReactElement } from "react";
import { AOVTile } from "../../../../app/components/dashboard/AOVTile";
import { ReturnsTile } from "../../../../app/components/dashboard/ReturnsTile";
import { StockRiskTile } from "../../../../app/components/dashboard/StockRiskTile";
import { SEOTile } from "../../../../app/components/dashboard/SEOTile";
import { CXTile } from "../../../../app/components/dashboard/CXTile";

const renderWithProviders = (ui: ReactElement) =>
  render(<PolarisTestProvider>{ui}</PolarisTestProvider>);

describe("Dashboard Tiles", () => {
  describe("AOVTile", () => {
    it("should render value and trend", () => {
      renderWithProviders(
        <AOVTile value="$145.27" trend="up" percentChange="+12%" />,
      );
      expect(screen.getByText("$145.27")).toBeInTheDocument();
      expect(screen.getByText("+12% vs yesterday")).toBeInTheDocument();
    });

    it("should show loading state", () => {
      renderWithProviders(
        <AOVTile value="$145.27" trend="up" percentChange="+12%" loading />,
      );
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("ReturnsTile", () => {
    it("should render count and pending", () => {
      renderWithProviders(
        <ReturnsTile count={3} pendingReview={2} trend="neutral" />,
      );
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("2 pending review")).toBeInTheDocument();
    });
  });

  describe("StockRiskTile", () => {
    it("should render SKU count", () => {
      renderWithProviders(
        <StockRiskTile
          skuCount={2}
          subtitle="Below reorder point"
          trend="down"
        />,
      );
      expect(screen.getByText("2 SKUs")).toBeInTheDocument();
    });
  });

  describe("SEOTile", () => {
    it("should render alert count", () => {
      renderWithProviders(
        <SEOTile
          data={{
            anomalies: [
              {
                page: "/collections/new",
                metric: "traffic",
                change: -24,
                severity: "critical",
              },
              {
                page: "/collections/sale",
                metric: "traffic",
                change: -10,
                severity: "warning",
              },
            ],
          }}
        />,
      );

      expect(screen.getByText("SEO anomalies")).toBeInTheDocument();
      expect(screen.getByText("/collections/new")).toBeInTheDocument();
    });
  });

  describe("CXTile", () => {
    it("should render escalation count", () => {
      renderWithProviders(
        <CXTile
          data={{
            pendingCount: 3,
            breachedSLA: 1,
            avgResponseTime: 42,
          }}
        />,
      );

      expect(screen.getByText("Pending conversations")).toBeInTheDocument();
      expect(screen.getByText("Avg response time: 42m")).toBeInTheDocument();
    });
  });
});
