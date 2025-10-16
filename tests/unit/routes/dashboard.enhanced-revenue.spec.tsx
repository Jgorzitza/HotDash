import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { AppProvider } from "@shopify/polaris";

vi.mock("react-router", async () => {
  const actual: any = await vi.importActual("react-router");
  return { ...actual, useLoaderData: vi.fn() };
});

import Dashboard from "../../../app/routes/dashboard";
import { useLoaderData } from "react-router";

function withPolaris(ui: React.ReactElement) {
  return render(<AppProvider i18n={{}}>{ui}</AppProvider>);
}

describe("Dashboard Enhanced Revenue in dev mode", () => {
  it("renders sparkline SVG when dev:test mode and revenue ok", () => {
    (useLoaderData as unknown as vi.Mock).mockReturnValue({
      mode: "dev:test",
      tiles: {
        revenue: { status: "ok", value: "$8,425.50", subtitle: "58 orders today", trend: "up" },
        aov: { status: "ok", value: "$145.27", subtitle: "+12% vs yesterday", trend: "up" },
        returns: { status: "ok", value: "3", subtitle: "2 pending review", trend: "neutral" },
        stockRisk: { status: "ok", value: "2 SKUs", subtitle: "Below reorder point", trend: "down" },
        seo: { status: "ok", value: "1 alert", subtitle: "/collections/new -24% WoW", trend: "down" },
        cx: { status: "ok", value: "1 escalation", subtitle: "SLA breached 3h ago", trend: "down" },
        approvals: { status: "ok", value: "0 pending", subtitle: "All clear", trend: "neutral" },
      },
    });

    const { container } = withPolaris(<Dashboard />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });
});

