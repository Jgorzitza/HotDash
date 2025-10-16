import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { AppProvider } from "@shopify/polaris";

vi.mock("react-router", async () => {
  const actual: any = await vi.importActual("react-router");
  return {
    ...actual,
    useLoaderData: vi.fn(),
  };
});

import Dashboard, { type DashboardData } from "../../../app/routes/dashboard";
import { useLoaderData } from "react-router";

function withPolaris(ui: React.ReactElement) {
  return render(<AppProvider i18n={{}}>{ui}</AppProvider>);
}

describe("Dashboard component tiles", () => {
  it("renders loading and error states from loader data", () => {
    (useLoaderData as unknown as vi.Mock).mockReturnValue({
      mode: "dev:test",
      tiles: {
        revenue: { status: "loading" },
        aov: { status: "error", error: "Boom" },
        returns: { status: "ok", value: "3", subtitle: "2 pending review", trend: "neutral" },
        stockRisk: { status: "ok", value: "2 SKUs", subtitle: "Below reorder point", trend: "down" },
        seo: { status: "ok", value: "1 alert", subtitle: "/collections/new -24% WoW", trend: "down" },
        cx: { status: "ok", value: "1 escalation", subtitle: "SLA breached 3h ago", trend: "down" },
        approvals: { status: "ok", value: "0 pending", subtitle: "All clear", trend: "neutral" },
      },
    } satisfies DashboardData);
    withPolaris(<Dashboard />);
    expect(screen.getAllByText(/Loading\./i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Error loading data/i)).toBeInTheDocument();
  });
});

