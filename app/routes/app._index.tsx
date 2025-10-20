import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import type { LoaderFunction } from "react-router";

import "../styles/tokens.css";
import {
  TileCard,
  SalesPulseTile,
  FulfillmentHealthTile,
  InventoryHeatmapTile,
  CXEscalationsTile,
  SEOContentTile,
  OpsMetricsTile,
} from "~/components/tiles";
import type { TileState, TileFact } from "~/components/tiles";

import type { EscalationConversation } from "~/services/chatwoot/types";
import { getEscalations } from "~/services/chatwoot/escalations";
import type { LandingPageAnomaly } from "~/services/ga/ingest";
import { getLandingPageAnomalies } from "~/services/ga/ingest";
import { getShopifyServiceContext } from "~/services/shopify/client";
import { getInventoryAlerts } from "~/services/shopify/inventory";
import type { InventoryAlert } from "~/services/shopify/types";
import type { FulfillmentIssue, OrderSummary } from "~/services/shopify/types";
import { recordDashboardSessionOpen } from "~/services/dashboardSession.server";
import {
  getPendingFulfillments,
  getSalesPulseSummary,
} from "~/services/shopify/orders";
import {
  getOpsAggregateMetrics,
  type OpsAggregateMetrics,
} from "~/services/metrics/aggregate";
import type { ServiceResult } from "~/services/types";
import { ServiceError } from "~/services/types";

interface LoaderData {
  mode: "live" | "mock";
  sales: TileState<OrderSummary>;
  fulfillment: TileState<FulfillmentIssue[]>;
  inventory: TileState<InventoryAlert[]>;
  escalations: TileState<EscalationConversation[]>;
  seo: TileState<LandingPageAnomaly[]>;
  opsMetrics: TileState<OpsAggregateMetrics>;
}

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const useMock =
    url.searchParams.get("mock") === "1" ||
    process.env.DASHBOARD_USE_MOCK === "1";

  if (useMock) {
    return Response.json(buildMockDashboard());
  }

  const context = await getShopifyServiceContext(request);

  const sales = await resolveTile(() => getSalesPulseSummary(context));
  const fulfillment = await resolveTile(() => getPendingFulfillments(context));
  const inventory = await resolveTile(() => getInventoryAlerts(context));
  const seo = await resolveTile(() =>
    getLandingPageAnomalies({ shopDomain: context.shopDomain }),
  );
  const escalations = await resolveEscalations(context.shopDomain);
  const opsMetrics = await resolveTile(() => getOpsAggregateMetrics());

  await recordDashboardSessionOpen({
    shopDomain: context.shopDomain,
    operatorEmail: context.operatorEmail,
    requestId: request.headers.get("x-request-id"),
  });

  return Response.json({
    mode: "live",
    sales,
    fulfillment,
    inventory,
    escalations,
    seo,
    opsMetrics,
  });
};

async function resolveTile<T>(
  resolver: () => Promise<ServiceResult<T>>,
): Promise<TileState<T>> {
  try {
    const result = await resolver();
    return {
      status: "ok",
      data: result.data,
      source: result.source,
      fact: {
        id: result.fact.id,
        createdAt: result.fact.createdAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    if (error instanceof ServiceError) {
      return { status: "error", error: error.message };
    }
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function resolveEscalations(
  shopDomain: string,
): Promise<TileState<EscalationConversation[]>> {
  try {
    const result = await getEscalations(shopDomain);
    return {
      status: "ok",
      data: result.data,
      source: result.source,
      fact: {
        id: result.fact.id,
        createdAt: result.fact.createdAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    if (error instanceof Error && error.message.includes("CHATWOOT")) {
      return {
        status: "unconfigured",
        error: "Chatwoot credentials not configured",
      };
    }
    if (error instanceof ServiceError) {
      return { status: "error", error: error.message };
    }
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

function buildMockDashboard(): LoaderData {
  const now = new Date().toISOString();
  const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
  const breachThirtyMinutesAfter = new Date(
    new Date(threeHoursAgo).getTime() + 30 * 60 * 1000,
  ).toISOString();

  const salesSummary: OrderSummary = {
    shopDomain: "mock-shop",
    totalRevenue: 8425.5,
    currency: "USD",
    orderCount: 58,
    topSkus: [
      {
        sku: "BOARD-XL",
        title: "Powder Board XL",
        quantity: 14,
        revenue: 2800,
      },
      {
        sku: "GLOVE-PRO",
        title: "Thermal Gloves Pro",
        quantity: 32,
        revenue: 1920,
      },
      {
        sku: "BOOT-INS",
        title: "Insulated Boots",
        quantity: 20,
        revenue: 1600,
      },
    ],
    pendingFulfillment: [
      {
        orderId: "gid://shopify/Order/7001",
        name: "#7001",
        displayStatus: "UNFULFILLED",
        createdAt: now,
      },
    ],
    generatedAt: now,
  };

  const fulfillmentIssues: FulfillmentIssue[] = [
    {
      orderId: "gid://shopify/Order/7001",
      name: "#7001",
      displayStatus: "UNFULFILLED",
      createdAt: now,
    },
    {
      orderId: "gid://shopify/Order/6998",
      name: "#6998",
      displayStatus: "IN_PROGRESS",
      createdAt: now,
    },
  ];

  const inventoryAlerts: InventoryAlert[] = [
    {
      sku: "BOARD-XL",
      productId: "gid://shopify/Product/1",
      variantId: "gid://shopify/ProductVariant/1",
      title: "Powder Board XL — 158cm",
      quantityAvailable: 6,
      threshold: 10,
      daysOfCover: 2.5,
      generatedAt: now,
    },
    {
      sku: "GLOVE-PRO",
      productId: "gid://shopify/Product/2",
      variantId: "gid://shopify/ProductVariant/2",
      title: "Thermal Gloves Pro — Medium",
      quantityAvailable: 12,
      threshold: 15,
      daysOfCover: 3.1,
      generatedAt: now,
    },
  ];

  const escalations: EscalationConversation[] = [
    {
      id: 101,
      inboxId: 1,
      status: "open",
      customerName: "Jamie Lee",
      createdAt: threeHoursAgo,
      breachedAt: breachThirtyMinutesAfter,
      lastMessageAt: now,
      slaBreached: true,
      tags: ["priority"],
      suggestedReplyId: "ack_delay",
      suggestedReply:
        "Hi Jamie, thanks for your patience. We're expediting your order update now.",
      messages: [],
      aiSuggestion: null,
      aiSuggestionEnabled: false,
    },
  ];

  const anomalies: LandingPageAnomaly[] = [
    {
      landingPage: "/collections/new-arrivals",
      sessions: 420,
      wowDelta: -0.24,
      evidenceUrl: undefined,
      isAnomaly: true,
    },
    {
      landingPage: "/products/powder-board-xl",
      sessions: 310,
      wowDelta: -0.05,
      evidenceUrl: undefined,
      isAnomaly: false,
    },
  ];

  const opsMetricsData: OpsAggregateMetrics = {
    activation: {
      windowStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      windowEnd: now,
      totalActiveShops: 12,
      activatedShops: 9,
      activationRate: 0.75,
    },
    sla: {
      windowStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      windowEnd: now,
      sampleSize: 6,
      medianMinutes: 32.5,
      p90Minutes: 58.2,
    },
  };

  const fact = (id: number): TileFact => ({ id, createdAt: now });

  return {
    mode: "mock",
    sales: {
      status: "ok",
      data: salesSummary,
      source: "mock",
      fact: fact(1),
    },
    fulfillment: {
      status: "ok",
      data: fulfillmentIssues,
      source: "mock",
      fact: fact(2),
    },
    inventory: {
      status: "ok",
      data: inventoryAlerts,
      source: "mock",
      fact: fact(3),
    },
    escalations: {
      status: "ok",
      data: escalations,
      source: "mock",
      fact: fact(4),
    },
    seo: {
      status: "ok",
      data: anomalies,
      source: "mock",
      fact: fact(5),
    },
    opsMetrics: {
      status: "ok",
      data: opsMetricsData,
      source: "mock",
      fact: fact(6),
    },
  };
}

export default function OperatorDashboard() {
  const data = useLoaderData<LoaderData>();

  return (
    <s-page heading="Operator Control Center">
      {data.mode === "mock" && (
        <div
          style={{
            marginBottom: "var(--occ-space-5)",
            padding: "var(--occ-space-4)",
            border: "1px dashed var(--occ-border-default)",
            borderRadius: "var(--occ-radius-md)",
            background: "var(--occ-bg-secondary)",
          }}
        >
          <p style={{ margin: 0, color: "var(--occ-text-secondary)" }}>
            Displaying sample data. Set <code>DASHBOARD_USE_MOCK=0</code> or
            append <code>?mock=0</code> to load live integrations.
          </p>
        </div>
      )}
      <div className="occ-tile-grid">
        <TileCard
          title="Ops Pulse"
          tile={data.opsMetrics}
          render={(metrics) => <OpsMetricsTile metrics={metrics} />}
          testId="tile-ops-metrics"
        />

        <TileCard
          title="Sales Pulse"
          tile={data.sales}
          render={(summary) => <SalesPulseTile summary={summary} enableModal />}
          testId="tile-sales-pulse"
        />

        <TileCard
          title="Fulfillment Health"
          tile={data.fulfillment}
          render={(issues) => <FulfillmentHealthTile issues={issues} />}
          testId="tile-fulfillment-health"
        />

        <TileCard
          title="Inventory Heatmap"
          tile={data.inventory}
          render={(alerts) => <InventoryHeatmapTile alerts={alerts} />}
          testId="tile-inventory-heatmap"
        />

        <TileCard
          title="CX Escalations"
          tile={data.escalations}
          render={(conversations) => (
            <CXEscalationsTile conversations={conversations} enableModal />
          )}
          testId="tile-cx-escalations"
        />

        <TileCard
          title="SEO & Content Watch"
          tile={data.seo}
          render={(anomalies) => <SEOContentTile anomalies={anomalies} />}
          testId="tile-seo-content"
        />
      </div>
    </s-page>
  );
}
