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
  ApprovalsQueueTile,
  CEOAgentTile,
  UnreadMessagesTile,
  // Phase 7-8: Growth analytics tiles (ENG-023 to ENG-026)
  SocialPerformanceTile,
  SEOImpactTile,
  AdsROASTile,
  GrowthMetricsTile,
} from "../components/tiles";
import { GrowthEngineAnalyticsTile } from "../components/tiles/GrowthEngineAnalyticsTile";
import { SortableTile } from "../components/tiles/SortableTile";
import type { TileState, TileFact } from "../components/tiles";
import { BannerAlerts } from "../components/notifications/BannerAlerts";
import { useBannerAlerts } from "../hooks/useBannerAlerts";
import { useSSE } from "../hooks/useSSE";
import { useNotifications } from "../hooks/useNotifications";
import { ConnectionStatusIndicator } from "../components/indicators/ConnectionStatusIndicator";
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
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

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
  approvalsQueue: TileState<any>;
  ceoAgent: TileState<CEOAgentStatsResponse["data"]>;
  unreadMessages: TileState<UnreadMessagesResponse["data"]>;
  // Phase 7-8: Growth analytics (ENG-023 to ENG-026)
  socialPerformance: TileState<any>;
  seoImpact: TileState<any>;
  adsRoas: TileState<any>;
  growthMetrics: TileState<any>;
  // Phase 9-12: Advanced Growth Engine analytics (ENG-024)
  growthEngineAnalytics: TileState<any>;
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
  const approvalsQueue = await resolveApprovalsQueue();
  const ceoAgent = await resolveApiTile("/api/ceo-agent/stats");
  const unreadMessages = await resolveApiTile("/api/chatwoot/unread");

  // Phase 7-8: Growth analytics tiles (ENG-023 to ENG-026)
  const socialPerformance = await resolveApiTile(
    "/api/analytics/social-performance",
  );
  const seoImpact = await resolveApiTile("/api/analytics/seo-impact");
  const adsRoas = await resolveApiTile("/api/analytics/ads-roas");
  const growthMetrics = await resolveApiTile("/api/analytics/growth-metrics");
  
  // Phase 9-12: Advanced Growth Engine analytics (ENG-024)
  const growthEngineAnalytics = await resolveApiTile("/api/analytics/growth-engine");

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
    approvalsQueue,
    ceoAgent,
    unreadMessages,
    socialPerformance,
    seoImpact,
    adsRoas,
    growthMetrics,
    growthEngineAnalytics,
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

async function resolveApprovalsQueue(): Promise<TileState<any>> {
  try {
    const { getApprovalCounts, getPendingApprovals } = await import(
      "~/services/approvals"
    );

    const [counts, pendingApprovals] = await Promise.all([
      getApprovalCounts(),
      getPendingApprovals(),
    ]);

    // Find oldest pending approval
    let oldestPendingTime = "None";
    if (pendingApprovals.length > 0) {
      const oldest = pendingApprovals.reduce((oldest, current) => {
        const oldestDate = new Date(oldest.created_at);
        const currentDate = new Date(current.created_at);
        return currentDate < oldestDate ? current : oldest;
      });

      const oldestDate = new Date(oldest.created_at);
      const now = new Date();
      const diffMs = now.getTime() - oldestDate.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffDays > 0) {
        oldestPendingTime = `${diffDays}d ago`;
      } else if (diffHours > 0) {
        oldestPendingTime = `${diffHours}h ago`;
      } else {
        oldestPendingTime = "Just now";
      }
    }

    return {
      status: "ok",
      data: {
        pendingCount: counts.pending_review || 0,
        oldestPendingTime,
        counts,
      },
      source: "database",
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
    approvalsQueue: {
      status: "ok",
      data: {
        pendingCount: 3,
        oldestPendingTime: "2h ago",
        counts: { pending_review: 3, completed: 12, in_progress: 1 },
      },
      source: "mock",
      fact: fact(8),
    },
    ceoAgent: {
      status: "ok",
      data: ceoAgentData,
      source: "mock",
      fact: fact(9),
    },
    unreadMessages: {
      status: "ok",
      data: unreadMessagesData,
      source: "mock",
      fact: fact(10),
    },
    socialPerformance: {
      status: "ok",
      data: {
        totalPosts: 24,
        avgEngagement: 342,
        topPost: {
          platform: "Instagram",
          content: "Winter collection drop",
          impressions: 5240,
          engagement: 892,
        },
      },
      source: "mock",
      fact: fact(11),
    },
    seoImpact: {
      status: "ok",
      data: {
        totalKeywords: 142,
        avgPosition: 12.4,
        topMover: {
          keyword: "snow boots",
          oldPosition: 24,
          newPosition: 8,
          change: -16,
        },
      },
      source: "mock",
      fact: fact(12),
    },
    adsRoas: {
      status: "ok",
      data: {
        totalSpend: 4250,
        totalRevenue: 18900,
        roas: 4.45,
        topCampaign: {
          name: "Winter Collection Launch",
          platform: "Google Ads",
          roas: 6.2,
          spend: 1200,
        },
      },
      source: "mock",
      fact: fact(13),
    },
    growthMetrics: {
      status: "ok",
      data: {
        weeklyGrowth: 18.5,
        totalReach: 45200,
        bestChannel: { name: "Social Media", growth: 24.3 },
      },
      source: "mock",
      fact: fact(14),
    },
    visibleTiles: DEFAULT_TILE_ORDER, // ENG-015: All tiles visible by default
  };
}

// Default tile order (ENG-014 + ENG-028)
const DEFAULT_TILE_ORDER = [
  "ops-metrics",
  "sales-pulse",
  "fulfillment",
  "inventory",
  "cx-escalations",
  "seo-content",
  "idea-pool",
  "approvals-queue",
  "ceo-agent",
  "unread-messages",
  // Phase 7-8: Growth analytics (ENG-028)
  "social-performance",
  "seo-impact",
  "ads-roas",
  "growth-metrics",
  // Phase 9-12: Advanced Growth Engine analytics (ENG-024)
  "growth-engine-analytics",
];

export default function OperatorDashboard() {
  const data = useLoaderData<LoaderData>();
  const tileOrderFetcher = useFetcher();
  const notifications = useNotifications();

  // Real-time SSE connection (Phase 5 - ENG-023)
  const { status: sseStatus, lastMessage, connectionQuality } = useSSE("/api/sse/updates", true);

  // Drag & Drop: Tile order state (ENG-014)
  const [tileOrder, setTileOrder] = useState<string[]>(DEFAULT_TILE_ORDER);

  // ENG-015: Filter tiles based on visibility preferences
  const visibleTileIds = tileOrder.filter((tileId) =>
    data.visibleTiles.includes(tileId),
  );

  // Track refreshing tiles (Phase 5 - ENG-025)
  const [refreshingTiles, setRefreshingTiles] = useState<Set<string>>(
    new Set(),
  );

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
    }),
  );

  // Handle drag end - reorder tiles and save to preferences (ENG-014)
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        setTileOrder((items) => {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);
          const newOrder = arrayMove(items, oldIndex, newIndex);

          // Save to user preferences via API
          tileOrderFetcher.submit(
            { tileOrder: JSON.stringify(newOrder) },
            { method: "POST", action: "/api/preferences/tile-order" },
          );

          return newOrder;
        });
      }
    },
    [tileOrderFetcher],
  );

  // Monitor system status for banner alerts (Phase 4 - ENG-012)
  const systemStatus = {
    queueDepth: data.approvalsQueue.status === "ok" && data.approvalsQueue.data 
      ? data.approvalsQueue.data.pendingCount || 0 
      : 0,
    approvalRate: undefined, // TODO: Get from metrics service
    serviceHealth: "healthy" as const,
    connectionStatus:
      sseStatus === "connected"
        ? ("online" as const)
        : sseStatus === "connecting"
          ? ("reconnecting" as const)
          : ("offline" as const),
  };
  const bannerAlerts = useBannerAlerts(systemStatus);

  // Monitor approvals queue for notifications
  useEffect(() => {
    const approvalsData = data.approvalsQueue;
    if (approvalsData.status === "ok" && approvalsData.data) {
      const pendingCount = approvalsData.data.pendingCount || 0;
      
      // Show notification if there are pending approvals and we haven't shown one recently
      if (pendingCount > 0) {
        const lastNotification = localStorage.getItem('last-approval-notification');
        const now = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        if (!lastNotification || (now - parseInt(lastNotification)) > oneHour) {
          notifications.addNotification({
            type: "approval",
            title: "Pending Approvals",
            message: `${pendingCount} approval${pendingCount > 1 ? 's' : ''} need your review`,
            url: "/approvals",
          });
          
          localStorage.setItem('last-approval-notification', now.toString());
        }
      }
    }
  }, [data.approvalsQueue, notifications]);

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
    fulfillment: (
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
    inventory: (
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
    "approvals-queue": (
      <TileCard
        title="Approvals Queue"
        tile={data.approvalsQueue}
        render={(approvalsData) => <ApprovalsQueueTile {...approvalsData} />}
        testId="tile-approvals-queue"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("approvals-queue")}
        onRefresh={() => handleRefreshTile("approvals-queue")}
        autoRefreshInterval={60}
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
    // Phase 7-8: Growth analytics tiles (ENG-023 to ENG-026)
    "social-performance": (
      <TileCard
        title="Social Performance"
        tile={data.socialPerformance}
        render={(socialData) => <SocialPerformanceTile data={socialData} />}
        testId="tile-social-performance"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("social-performance")}
        onRefresh={() => handleRefreshTile("social-performance")}
        autoRefreshInterval={300}
      />
    ),
    "seo-impact": (
      <TileCard
        title="SEO Impact"
        tile={data.seoImpact}
        render={(seoData) => <SEOImpactTile data={seoData} />}
        testId="tile-seo-impact"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("seo-impact")}
        onRefresh={() => handleRefreshTile("seo-impact")}
        autoRefreshInterval={600}
      />
    ),
    "ads-roas": (
      <TileCard
        title="Ads ROAS"
        tile={data.adsRoas}
        render={(adsData) => <AdsROASTile data={adsData} />}
        testId="tile-ads-roas"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("ads-roas")}
        onRefresh={() => handleRefreshTile("ads-roas")}
        autoRefreshInterval={300}
      />
    ),
    "growth-metrics": (
      <TileCard
        title="Growth Metrics"
        tile={data.growthMetrics}
        render={(growthData) => <GrowthMetricsTile data={growthData} />}
        testId="tile-growth-metrics"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("growth-metrics")}
        onRefresh={() => handleRefreshTile("growth-metrics")}
        autoRefreshInterval={600}
      />
    ),
    // Phase 9-12: Advanced Growth Engine analytics (ENG-024)
    "growth-engine-analytics": (
      <TileCard
        title="Growth Engine Analytics"
        tile={data.growthEngineAnalytics}
        render={(analyticsData) => (
          <GrowthEngineAnalyticsTile
            analytics={analyticsData.analytics}
            timeframe={analyticsData.timeframe}
            period={analyticsData.period}
            generatedAt={analyticsData.generatedAt}
          />
        )}
        testId="tile-growth-engine-analytics"
        showRefreshIndicator
        isRefreshing={refreshingTiles.has("growth-engine-analytics")}
        onRefresh={() => handleRefreshTile("growth-engine-analytics")}
        autoRefreshInterval={300}
      />
    ),
  };

  return (
    <s-page heading="Operator Control Center">
      {/* Banner Alerts (Phase 4 - ENG-012) */}
      {bannerAlerts.length > 0 && <BannerAlerts alerts={bannerAlerts} />}
      
      {/* Connection Status Indicator (ENG-020) */}
      <ConnectionStatusIndicator 
        status={sseStatus} 
        quality={connectionQuality}
        lastMessage={lastMessage}
      />

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
        <SortableContext
          items={visibleTileIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="occ-tile-grid">
            {visibleTileIds.length > 0 ? (
              visibleTileIds.map((tileId) => (
                <SortableTile key={tileId} id={tileId}>
                  {tileMap[tileId as keyof typeof tileMap]}
                </SortableTile>
              ))
            ) : (
              <div
                style={{
                  padding: "var(--occ-space-6)",
                  textAlign: "center",
                  color: "var(--occ-text-secondary)",
                }}
              >
                <p>
                  No tiles visible. Visit <a href="/settings">Settings</a> to
                  enable tiles.
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </s-page>
  );
}
