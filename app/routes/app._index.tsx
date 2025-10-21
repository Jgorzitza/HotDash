import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData, useFetcher } from "react-router";
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
  IdeaPoolTile,
  CEOAgentTile,
  UnreadMessagesTile,
} from "../components/tiles";
import { SortableTile } from "../components/tiles/SortableTile";
import type { TileState, TileFact } from "../components/tiles";
import { BannerAlerts } from "../components/notifications/BannerAlerts";
import { useBannerAlerts } from "../hooks/useBannerAlerts";
import { useSSE } from "../hooks/useSSE";
import { useState, useEffect, useCallback } from "react";

// @dnd-kit imports for drag & drop tile reordering (ENG-014)
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import type { EscalationConversation } from "../services/chatwoot/types";
import { getEscalations } from "../services/chatwoot/escalations";
import type { LandingPageAnomaly } from "../services/ga/ingest";
import { getLandingPageAnomalies } from "../services/ga/ingest";
import { getShopifyServiceContext } from "../services/shopify/client";
import { getInventoryAlerts } from "../services/shopify/inventory";
import type { InventoryAlert } from "../services/shopify/types";
import type { FulfillmentIssue, OrderSummary } from "../services/shopify/types";
import { recordDashboardSessionOpen } from "../services/dashboardSession.server";
import {
  getPendingFulfillments,
  getSalesPulseSummary,
} from "../services/shopify/orders";
import {
  getOpsAggregateMetrics,
  type OpsAggregateMetrics,
} from "../services/metrics/aggregate";
import type { ServiceResult } from "../services/types";
import { ServiceError } from "../services/types";
import type { IdeaPoolResponse } from "./api.analytics.idea-pool";
import type { CEOAgentStatsResponse } from "./api.ceo-agent.stats";
import type { UnreadMessagesResponse } from "./api.chatwoot.unread";

interface LoaderData {
  mode: "live" | "mock";
  sales: TileState<OrderSummary>;
  fulfillment: TileState<FulfillmentIssue[]>;
  inventory: TileState<InventoryAlert[]>;
  escalations: TileState<EscalationConversation[]>;
  seo: TileState<LandingPageAnomaly[]>;
  opsMetrics: TileState<OpsAggregateMetrics>;
  ideaPool: TileState<IdeaPoolResponse["data"]>;
  ceoAgent: TileState<CEOAgentStatsResponse["data"]>;
  unreadMessages: TileState<UnreadMessagesResponse["data"]>;
  // ENG-015: User preferences
  visibleTiles: string[];
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
  
  // Phase 3 tiles - fetch from new API routes
  const ideaPool = await resolveApiTile("/api/analytics/idea-pool");
  const ceoAgent = await resolveApiTile("/api/ceo-agent/stats");
  const unreadMessages = await resolveApiTile("/api/chatwoot/unread");

  await recordDashboardSessionOpen({
    shopDomain: context.shopDomain,
    operatorEmail: context.operatorEmail,
    requestId: request.headers.get("x-request-id"),
  });

  // TODO (Phase 11): Load visibleTiles from Supabase user_preferences
  const visibleTiles = DEFAULT_TILE_ORDER; // Default: all tiles visible

  return Response.json({
    mode: "live",
    sales,
    fulfillment,
    inventory,
    escalations,
    seo,
    opsMetrics,
    ideaPool,
    ceoAgent,
    unreadMessages,
    visibleTiles,
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

async function resolveApiTile<T extends { data?: unknown; success: boolean }>(
  apiPath: string,
): Promise<TileState<T["data"]>> {
  try {
    const response = await fetch(`http://localhost:3000${apiPath}`);
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }
    const json = (await response.json()) as T;
    if (!json.success) {
      return {
        status: "error",
        error: "API request failed",
      };
    }
    return {
      status: "ok",
      data: json.data,
      source: "api",
      fact: {
        id: Date.now(),
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
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

  // Phase 3 mock data
  const ideaPoolData: IdeaPoolResponse["data"] = {
    ideas: [
      {
        id: "idea-1",
        type: "wildcard",
        title: "Limited Edition Snow Gear Drop",
        description: "Launch exclusive winter collection with urgency",
        target_platforms: ["instagram", "facebook"],
        suggested_copy: "24-hour flash sale on premium snow gear",
        suggested_hashtags: ["#WinterSale", "#SnowGear"],
        evidence: { trending: true },
        supabase_linkage: { table: "product_suggestions" },
        projected_metrics: {
          estimated_reach: 5000,
          estimated_engagement_rate: 0.08,
          estimated_clicks: 400,
          estimated_conversions: 20,
        },
        cadence: "one-time",
        status: "pending_review",
        priority: "high",
      },
    ],
    total_count: 5,
    wildcard_count: 1,
    source: "fixture",
    feature_flag_enabled: false,
  };

  const ceoAgentData: CEOAgentStatsResponse["data"] = {
    actions_today: 3,
    pending_approvals: 2,
    last_action: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    recent_actions: [
      {
        id: "cea-mock-1",
        type: "data_analysis",
        description: "Analyzed customer trends for Q4",
        status: "completed",
        created_at: now,
        completed_at: now,
      },
    ],
    source: "mock",
  };

  const unreadMessagesData: UnreadMessagesResponse["data"] = {
    unread_count: 3,
    top_conversation: {
      customer_name: "Mock Customer",
      snippet: "I have a question about my recent order...",
      created_at: now,
    },
    source: "mock",
  };

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
    ideaPool: {
      status: "ok",
      data: ideaPoolData,
      source: "mock",
      fact: fact(7),
    },
    ceoAgent: {
      status: "ok",
      data: ceoAgentData,
      source: "mock",
      fact: fact(8),
    },
    unreadMessages: {
      status: "ok",
      data: unreadMessagesData,
      source: "mock",
      fact: fact(9),
    },
    visibleTiles: DEFAULT_TILE_ORDER, // ENG-015: All tiles visible by default
  };
}

// Default tile order (ENG-014)
const DEFAULT_TILE_ORDER = [
  "ops-metrics",
  "sales-pulse",
  "fulfillment",
  "inventory",
  "cx-escalations",
  "seo-content",
  "idea-pool",
  "ceo-agent",
  "unread-messages",
];

export default function OperatorDashboard() {
  const data = useLoaderData<LoaderData>();
  const tileOrderFetcher = useFetcher();

  // Real-time SSE connection (Phase 5 - ENG-023)
  const { status: sseStatus, lastMessage } = useSSE("/api/sse/updates", true);

  // Drag & Drop: Tile order state (ENG-014)
  const [tileOrder, setTileOrder] = useState<string[]>(DEFAULT_TILE_ORDER);

  // ENG-015: Filter tiles based on visibility preferences
  const visibleTileIds = tileOrder.filter((tileId) => 
    data.visibleTiles.includes(tileId)
  );

  // Track refreshing tiles (Phase 5 - ENG-025)
  const [refreshingTiles, setRefreshingTiles] = useState<Set<string>>(new Set());

  // Handle tile refresh events from SSE
  useEffect(() => {
    if (lastMessage?.type === "tile-refresh") {
      const tileId = (lastMessage.data as { tileId?: string }).tileId;
      if (tileId) {
        setRefreshingTiles((prev) => new Set([...prev, tileId]));
        setTimeout(() => {
          setRefreshingTiles((prev) => {
            const next = new Set(prev);
            next.delete(tileId);
            return next;
          });
        }, 2000);
      }
    }
  }, [lastMessage]);

  // Manual refresh handler
  const handleRefreshTile = useCallback((tileId: string) => {
    setRefreshingTiles((prev) => new Set([...prev, tileId]));
    // TODO: Trigger actual data refresh
    setTimeout(() => {
      setRefreshingTiles((prev) => {
        const next = new Set(prev);
        next.delete(tileId);
        return next;
      });
    }, 1000);
  }, []);

  // Configure sensors for drag & drop (ENG-014)
  // Per Context7 @dnd-kit docs: PointerSensor for mouse/touch, KeyboardSensor for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement to start drag (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end - reorder tiles and save to preferences (ENG-014)
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTileOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Save to user preferences via API
        tileOrderFetcher.submit(
          { tileOrder: JSON.stringify(newOrder) },
          { method: "POST", action: "/api/preferences/tile-order" }
        );

        return newOrder;
      });
    }
  }, [tileOrderFetcher]);

  // Monitor system status for banner alerts (Phase 4 - ENG-012)
  const systemStatus = {
    queueDepth: 0, // TODO: Get from approval service
    approvalRate: undefined, // TODO: Get from metrics service
    serviceHealth: "healthy" as const,
    connectionStatus: sseStatus === "connected" ? ("online" as const) : sseStatus === "connecting" ? ("reconnecting" as const) : ("offline" as const),
  };
  const bannerAlerts = useBannerAlerts(systemStatus);

  // Tile mapping for dynamic ordering (ENG-014)
  const tileMap = {
    "ops-metrics": (
      <TileCard
        title="Ops Pulse"
        tile={data.opsMetrics}
        render={(metrics) => <OpsMetricsTile metrics={metrics} />}
        testId="tile-ops-metrics"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("ops-metrics")}
        onRefresh={() => handleRefreshTile("ops-metrics")}
        autoRefreshInterval={300}
      />
    ),
    "sales-pulse": (
      <TileCard
        title="Sales Pulse"
        tile={data.sales}
        render={(summary) => <SalesPulseTile summary={summary} enableModal />}
        testId="tile-sales-pulse"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("sales-pulse")}
        onRefresh={() => handleRefreshTile("sales-pulse")}
        autoRefreshInterval={60}
      />
    ),
    "fulfillment": (
      <TileCard
        title="Fulfillment Health"
        tile={data.fulfillment}
        render={(issues) => <FulfillmentHealthTile issues={issues} />}
        testId="tile-fulfillment-health"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("fulfillment")}
        onRefresh={() => handleRefreshTile("fulfillment")}
        autoRefreshInterval={120}
      />
    ),
    "inventory": (
      <TileCard
        title="Inventory Heatmap"
        tile={data.inventory}
        render={(alerts) => <InventoryHeatmapTile alerts={alerts} />}
        testId="tile-inventory-heatmap"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("inventory")}
        onRefresh={() => handleRefreshTile("inventory")}
        autoRefreshInterval={300}
      />
    ),
    "cx-escalations": (
      <TileCard
        title="CX Escalations"
        tile={data.escalations}
        render={(conversations) => (
          <CXEscalationsTile conversations={conversations} enableModal />
        )}
        testId="tile-cx-escalations"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("cx-escalations")}
        onRefresh={() => handleRefreshTile("cx-escalations")}
        autoRefreshInterval={30}
      />
    ),
    "seo-content": (
      <TileCard
        title="SEO & Content Watch"
        tile={data.seo}
        render={(anomalies) => <SEOContentTile anomalies={anomalies} />}
        testId="tile-seo-content"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("seo-content")}
        onRefresh={() => handleRefreshTile("seo-content")}
        autoRefreshInterval={600}
      />
    ),
    "idea-pool": (
      <TileCard
        title="Idea Pool"
        tile={data.ideaPool}
        render={(ideaPool) => <IdeaPoolTile ideaPool={ideaPool} />}
        testId="tile-idea-pool"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("idea-pool")}
        onRefresh={() => handleRefreshTile("idea-pool")}
        autoRefreshInterval={300}
      />
    ),
    "ceo-agent": (
      <TileCard
        title="CEO Agent"
        tile={data.ceoAgent}
        render={(stats) => <CEOAgentTile stats={stats} />}
        testId="tile-ceo-agent"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("ceo-agent")}
        onRefresh={() => handleRefreshTile("ceo-agent")}
        autoRefreshInterval={120}
      />
    ),
    "unread-messages": (
      <TileCard
        title="Unread Messages"
        tile={data.unreadMessages}
        render={(unread) => <UnreadMessagesTile unread={unread} />}
        testId="tile-unread-messages"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("unread-messages")}
        onRefresh={() => handleRefreshTile("unread-messages")}
        autoRefreshInterval={60}
      />
    ),
  };

  return (
    <s-page heading="Operator Control Center">
      {/* Banner Alerts (Phase 4 - ENG-012) */}
      {bannerAlerts.length > 0 && <BannerAlerts alerts={bannerAlerts} />}

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

      {/* Drag & Drop enabled tile grid (ENG-014 + ENG-015 visibility filtering) */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={visibleTileIds} strategy={verticalListSortingStrategy}>
          <div className="occ-tile-grid">
            {visibleTileIds.length > 0 ? (
              visibleTileIds.map((tileId) => (
                <SortableTile key={tileId} id={tileId}>
                  {tileMap[tileId as keyof typeof tileMap]}
                </SortableTile>
              ))
            ) : (
              <div style={{ 
                padding: "var(--occ-space-6)", 
                textAlign: "center",
                color: "var(--occ-text-secondary)",
              }}>
                <p>No tiles visible. Visit <a href="/settings">Settings</a> to enable tiles.</p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </s-page>
  );
}
