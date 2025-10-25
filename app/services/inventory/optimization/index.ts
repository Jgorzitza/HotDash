import { Prisma } from "@prisma/client";
import prisma from "~/db.server";
import { logDecision } from "~/services/decisions.server";
import {
  calculateReorderPoint,
  getInventoryStatus,
} from "../rop";
import {
  calculateEOQ,
  calculateDaysUntilStockout,
  calculateRecommendedOrderQty,
} from "../reorder-alerts";
import {
  performABCAnalysis,
  type ABCAnalysisItem,
  type ABCClass,
} from "../analytics";
import { getDemandForecast } from "../demand-forecast";
import type { ProductCategory } from "~/lib/inventory/seasonality";
import { ActionQueueService } from "~/services/action-queue/action-queue.service";

const DAY_MS = 1000 * 60 * 60 * 24;
const DEFAULT_LEAD_TIME_DAYS = 14;
const DEFAULT_SETUP_COST = 65; // Slightly higher than base to reflect handling overhead
const DEFAULT_HOLDING_COST_RATE = 0.25; // 25% annual holding cost

export interface OptimizationProductInput {
  productId: string;
  variantId?: string;
  productName: string;
  sku?: string;
  currentStock: number;
  avgDailySales: number;
  lastSaleDate: Date | null;
  costPerUnit: number;
  sellingPrice?: number;
  abcClass?: ABCClass;
  annualRevenue?: number;
  leadTimeDays?: number;
  maxDailySales?: number;
  maxLeadDays?: number;
  category?: ProductCategory;
  setupCost?: number;
  holdingCostRate?: number;
  vendorId?: string;
  vendorName?: string;
}

export interface DeadStockItem {
  productId: string;
  productName: string;
  currentStock: number;
  daysSinceLastSale: number;
  estimatedValue: number;
  recommendation: string;
}

export interface OverstockItem {
  productId: string;
  productName: string;
  currentStock: number;
  daysOfSupply: number;
  excessUnits: number;
  tiedUpCapital: number;
  recommendation: string;
}

export interface SlowMoverItem {
  productId: string;
  productName: string;
  currentStock: number;
  avgDailySales: number;
  daysSinceLastSale: number;
  recommendedAction: string;
}

export interface ROPAlertItem {
  productId: string;
  productName: string;
  sku?: string;
  currentStock: number;
  reorderPoint: number;
  safetyStock: number;
  status: "urgent_reorder" | "low_stock" | "out_of_stock";
  daysUntilStockout: number | null;
  recommendedOrderQty: number;
}

export interface OptimizationRecommendation {
  productId: string;
  productName: string;
  variantId?: string;
  sku?: string;
  abcClass: ABCClass;
  currentIssue: string;
  recommendedAction: string;
  estimatedImpact: string;
  priority: "high" | "medium" | "low";
  metrics: {
    reorderPoint: number;
    safetyStock: number;
    eoq: number;
    daysUntilStockout: number | null;
    daysOfSupply: number | null;
    dailyForecast: number;
  };
  orderSuggestion: {
    recommendedOrderQty: number;
    targetStockLevel: number;
  };
  alerts: {
    deadStock?: boolean;
    overstock?: boolean;
    slowMoving?: boolean;
  };
  vendor?: {
    id?: string;
    name?: string;
  };
  rationale: string;
}

export interface OptimizationSummary {
  deadStock: {
    count: number;
    totalValue: number;
    items: DeadStockItem[];
  };
  overstock: {
    count: number;
    tiedUpCapital: number;
    items: OverstockItem[];
  };
  slowMovers: {
    count: number;
    items: SlowMoverItem[];
  };
  abcBreakdown: {
    classACount: number;
    classBCount: number;
    classCCount: number;
    products: ABCAnalysisItem[];
  };
  ropAlerts: {
    count: number;
    items: ROPAlertItem[];
  };
  recommendations: OptimizationRecommendation[];
  approvals: {
    pending: Array<{ id: string; target: string; draft: string }>;
    suggested: OptimizationRecommendation[];
  };
  generatedAt: string;
}

export interface QueueResult {
  queued: number;
  skipped: number;
}

export interface HistoryResult {
  recorded: number;
}

export async function generateOptimizationReport(
  products?: OptimizationProductInput[],
): Promise<OptimizationSummary> {
  const dataset =
    products && products.length > 0
      ? products
      : await fetchOptimizationDataset().catch(() => []);

  const workingSet = dataset.length > 0 ? dataset : buildFallbackProducts();

  const enrichedRevenue = workingSet.map((product) => ({
    ...product,
    annualRevenue:
      product.annualRevenue ??
      Math.max(product.avgDailySales, 0) *
        365 *
        (product.sellingPrice ?? Math.max(product.costPerUnit * 1.45, product.costPerUnit * 1.1)),
  }));

  const abcAnalysis = performABCAnalysis(
    enrichedRevenue.map((product) => ({
      productId: product.productId,
      productName: product.productName,
      annualRevenue: Math.max(product.annualRevenue ?? 0, 0),
    })),
  );

  const abcMap = new Map<string, ABCAnalysisItem>();
  for (const item of abcAnalysis) {
    abcMap.set(item.productId, item);
  }

  const recommendationInputs = await Promise.all(
    enrichedRevenue.map(async (product) => {
      const lastSaleDate = product.lastSaleDate
        ? new Date(product.lastSaleDate)
        : null;
      const daysSinceLastSale = lastSaleDate
        ? Math.floor((Date.now() - lastSaleDate.getTime()) / DAY_MS)
        : 999;

      const abc = abcMap.get(product.productId);
      const leadTimeDays = product.leadTimeDays ?? DEFAULT_LEAD_TIME_DAYS;
      const maxLeadDays =
        product.maxLeadDays ?? Math.max(leadTimeDays + 7, leadTimeDays);
      const maxDailySales =
        product.maxDailySales ?? Math.max(product.avgDailySales * 1.6, product.avgDailySales || 1);

      const forecast = await getDemandForecast(product.productId, {
        avgDailySales: product.avgDailySales || 0,
        category: product.category,
      });

      const rop = calculateReorderPoint({
        avgDailySales: Math.max(product.avgDailySales, 0),
        leadTimeDays,
        maxDailySales,
        maxLeadDays,
        category: product.category ?? "general",
        currentMonth: new Date().getMonth(),
      });

      const daysUntilStockout = forecast.daily_forecast
        ? calculateDaysUntilStockout(product.currentStock, forecast.daily_forecast)
        : product.avgDailySales
          ? calculateDaysUntilStockout(product.currentStock, product.avgDailySales)
          : null;

      const eoq = calculateEOQ(
        Math.max(product.avgDailySales, 0) * 365,
        Math.max(product.costPerUnit, 0),
        product.setupCost ?? DEFAULT_SETUP_COST,
        product.holdingCostRate ?? DEFAULT_HOLDING_COST_RATE,
      );

      const recommendedOrderQty = calculateRecommendedOrderQty(
        product.currentStock,
        rop.reorderPoint,
        rop.safetyStock,
        eoq,
      );

      const status = getInventoryStatus(product.currentStock, rop.reorderPoint);
      const daysOfSupply =
        product.avgDailySales > 0
          ? Math.round((product.currentStock / product.avgDailySales) * 10) / 10
          : null;

      const alerts = {
        deadStock: daysSinceLastSale >= 120 || product.avgDailySales === 0,
        overstock: (daysOfSupply ?? 0) > 180,
        slowMoving: daysSinceLastSale >= 90 && product.avgDailySales < 0.5,
      };

      const recommendedAction = buildRecommendedAction({
        product,
        rop,
        eoq,
        recommendedOrderQty,
        status,
        alerts,
        daysUntilStockout,
        abc,
      });

      const estimatedImpact = buildEstimatedImpact({
        product,
        rop,
        alerts,
        recommendedOrderQty,
      });

      const priority = determinePriority({
        status,
        alerts,
        daysUntilStockout,
        daysSinceLastSale,
      });

      const rationale = buildRationale({
        currentIssue: recommendedAction.currentIssue,
        abc,
        alerts,
        estimatedImpact,
      });

      return {
        product,
        abc,
        rop,
        forecast,
        daysUntilStockout,
        daysSinceLastSale,
        daysOfSupply,
        eoq,
        recommendedOrderQty,
        status,
        alerts,
        recommendedAction,
        estimatedImpact,
        priority,
        rationale,
      };
    }),
  );

  const deadStockItems: DeadStockItem[] = recommendationInputs
    .filter((item) => item.alerts.deadStock)
    .map((item) => ({
      productId: item.product.productId,
      productName: item.product.productName,
      currentStock: item.product.currentStock,
      daysSinceLastSale: item.daysSinceLastSale,
      estimatedValue: roundCurrency(item.product.currentStock * item.product.costPerUnit),
      recommendation: item.recommendedAction.action,
    }));

  const deadStockValue = deadStockItems.reduce(
    (sum, entry) => sum + entry.estimatedValue,
    0,
  );

  const overstockItems: OverstockItem[] = recommendationInputs
    .filter((item) => item.alerts.overstock && (item.daysOfSupply ?? 0) > 0)
    .map((item) => {
      const excessUnits = Math.max(
        0,
        item.product.currentStock - (item.rop.reorderPoint + item.rop.safetyStock),
      );
      return {
        productId: item.product.productId,
        productName: item.product.productName,
        currentStock: item.product.currentStock,
        daysOfSupply: item.daysOfSupply ?? 0,
        excessUnits,
        tiedUpCapital: roundCurrency(excessUnits * item.product.costPerUnit),
        recommendation: item.recommendedAction.action,
      };
    });

  const tiedUpCapital = overstockItems.reduce(
    (sum, entry) => sum + entry.tiedUpCapital,
    0,
  );

  const slowMoverItems: SlowMoverItem[] = recommendationInputs
    .filter((item) => item.alerts.slowMoving)
    .map((item) => ({
      productId: item.product.productId,
      productName: item.product.productName,
      currentStock: item.product.currentStock,
      avgDailySales: roundMetric(item.product.avgDailySales),
      daysSinceLastSale: item.daysSinceLastSale,
      recommendedAction: item.recommendedAction.action,
    }));

  const ropAlertItems: ROPAlertItem[] = recommendationInputs
    .filter((item) =>
      item.status === "urgent_reorder" ||
      item.status === "low_stock" ||
      item.status === "out_of_stock",
    )
    .map((item) => ({
      productId: item.product.productId,
      productName: item.product.productName,
      sku: item.product.sku,
      currentStock: item.product.currentStock,
      reorderPoint: item.rop.reorderPoint,
      safetyStock: item.rop.safetyStock,
      status: item.status,
      daysUntilStockout: item.daysUntilStockout,
      recommendedOrderQty: item.recommendedOrderQty,
    }));

  const recommendations: OptimizationRecommendation[] = recommendationInputs
    .map((item) => ({
      productId: item.product.productId,
      productName: item.product.productName,
      variantId: item.product.variantId,
      sku: item.product.sku,
      abcClass: item.abc?.abcClass ?? "C",
      currentIssue: item.recommendedAction.currentIssue,
      recommendedAction: item.recommendedAction.action,
      estimatedImpact: item.estimatedImpact.summary,
      priority: item.priority,
      metrics: {
        reorderPoint: item.rop.reorderPoint,
        safetyStock: item.rop.safetyStock,
        eoq: item.eoq,
        daysUntilStockout: item.daysUntilStockout,
        daysOfSupply: item.daysOfSupply,
        dailyForecast: roundMetric(item.forecast.daily_forecast),
      },
      orderSuggestion: {
        recommendedOrderQty: item.recommendedOrderQty,
        targetStockLevel: item.rop.reorderPoint + item.rop.safetyStock,
      },
      alerts: item.alerts,
      vendor:
        item.product.vendorId || item.product.vendorName
          ? {
              id: item.product.vendorId,
              name: item.product.vendorName,
            }
          : undefined,
      rationale: item.rationale,
    }))
    .sort((a, b) => {
      const priorityRank = { high: 0, medium: 1, low: 2 } as const;
      const priorityDiff = priorityRank[a.priority] - priorityRank[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return (b.metrics.reorderPoint - b.metrics.safetyStock) - (a.metrics.reorderPoint - a.metrics.safetyStock);
    });

  const pendingApprovals = await fetchPendingOptimizationActions();

  return {
    deadStock: {
      count: deadStockItems.length,
      totalValue: roundCurrency(deadStockValue),
      items: deadStockItems,
    },
    overstock: {
      count: overstockItems.length,
      tiedUpCapital: roundCurrency(tiedUpCapital),
      items: overstockItems,
    },
    slowMovers: {
      count: slowMoverItems.length,
      items: slowMoverItems,
    },
    abcBreakdown: {
      classACount: abcAnalysis.filter((item) => item.abcClass === "A").length,
      classBCount: abcAnalysis.filter((item) => item.abcClass === "B").length,
      classCCount: abcAnalysis.filter((item) => item.abcClass === "C").length,
      products: abcAnalysis,
    },
    ropAlerts: {
      count: ropAlertItems.length,
      items: ropAlertItems,
    },
    recommendations,
    approvals: {
      pending: pendingApprovals,
      suggested: recommendations.filter((rec) => rec.priority === "high").slice(0, 5),
    },
    generatedAt: new Date().toISOString(),
  };
}

export async function queueOptimizationRecommendations({
  recommendations,
  actor,
  reason,
}: {
  recommendations: OptimizationRecommendation[];
  actor: string;
  reason?: string;
}): Promise<QueueResult> {
  if (recommendations.length === 0) {
    return { queued: 0, skipped: 0 };
  }

  let queued = 0;
  let skipped = 0;

  for (const recommendation of recommendations) {
    try {
      const existing = await prisma.action_queue.findFirst({
        where: {
          type: "inventory_optimization",
          target: recommendation.productId,
          status: "pending",
        },
      });

      if (existing) {
        skipped++;
        continue;
      }

      await ActionQueueService.createAction({
        type: "inventory_optimization",
        target: recommendation.productId,
        draft: recommendation.rationale,
        evidence: {
          mcp_request_ids: [],
          dataset_links: [],
          telemetry_refs: [],
        },
        expected_impact: {
          metric: "inventory_turnover",
          delta:
            recommendation.alerts.overstock && recommendation.orderSuggestion.recommendedOrderQty === 0
              ? 0.5
              : recommendation.metrics.daysUntilStockout
                ? Math.max(0, 14 - recommendation.metrics.daysUntilStockout)
                : 1,
          unit: "days",
        },
        confidence: recommendation.metrics.dailyForecast > 0 ? 0.75 : 0.6,
        ease: "medium",
        risk_tier: recommendation.alerts.deadStock ? "perf" : "none",
        can_execute: true,
        rollback_plan:
          "Cancel or adjust PO if demand shifts; monitor forecast variance after approval.",
        freshness_label: recommendation.priority.toUpperCase(),
        agent: "inventory",
      });

      queued++;
    } catch (error) {
      console.error("[INVENTORY] Failed to queue recommendation", error);
      skipped++;
    }
  }

  await logDecision({
    scope: "build",
    actor,
    action: "inventory_optimization_queue",
    rationale: `${queued} recommendation(s) queued for CEO approval${reason ? `: ${reason}` : ""}`,
    status: "in_progress",
    progressPct: queued > 0 ? 70 : 40,
    evidenceUrl: "app/services/inventory/optimization/index.ts",
    payload: {
      queued,
      skipped,
      products: recommendations.map((rec) => rec.productId),
    },
  });

  return { queued, skipped };
}

export async function recordOptimizationHistory({
  recommendations,
  operator,
}: {
  recommendations: OptimizationRecommendation[];
  operator: string;
}): Promise<HistoryResult> {
  if (recommendations.length === 0) {
    return { recorded: 0 };
  }

  let recorded = 0;

  for (const recommendation of recommendations) {
    try {
      await prisma.inventory_actions.create({
        data: {
          action_type: "optimization_recommendation",
          variant_id: recommendation.variantId ?? recommendation.productId,
          sku: recommendation.sku,
          reorder_quantity: recommendation.orderSuggestion.recommendedOrderQty,
          vendor_id: recommendation.vendor?.id,
          velocity_analysis: JSON.stringify({
            metrics: recommendation.metrics,
            alerts: recommendation.alerts,
          }),
          operator_name: operator,
          notes: recommendation.recommendedAction,
          metadata: {
            currentIssue: recommendation.currentIssue,
            priority: recommendation.priority,
            rationale: recommendation.rationale,
          },
        },
      });
      recorded++;
    } catch (error) {
      console.error("[INVENTORY] Failed to record optimization history", error);
    }
  }

  await logDecision({
    scope: "build",
    actor: operator,
    action: "inventory_optimization_history",
    rationale: `Recorded ${recorded}/${recommendations.length} optimization recommendations`,
    status: recorded === recommendations.length ? "completed" : "in_progress",
    progressPct: recorded === recommendations.length ? 90 : 60,
    evidenceUrl: "app/services/inventory/optimization/index.ts",
    payload: {
      recorded,
      total: recommendations.length,
    },
  });

  return { recorded };
}

async function fetchOptimizationDataset(limit = 25): Promise<OptimizationProductInput[]> {
  try {
    const rows = await prisma.$queryRaw<
      Array<{
        variant_id: string;
        sku: string | null;
        product_name: string | null;
        current_stock: number | null;
        avg_daily_sales: number | null;
        last_sale_at: Date | string | null;
        cost_per_unit: number | null;
      }>
    >(Prisma.sql`
      SELECT
        pv.id                  AS variant_id,
        pv.sku                 AS sku,
        COALESCE(p.title, pv.title, 'Unknown Product') AS product_name,
        COALESCE(pv.on_hand, 0) AS current_stock,
        COALESCE(pv.daily_velocity, pv.avg_daily_sales, 0) AS avg_daily_sales,
        pv.last_sale_at        AS last_sale_at,
        COALESCE(pv.average_landed_cost, 0) AS cost_per_unit
      FROM product_variants pv
      LEFT JOIN products p ON p.id = pv.product_id
      ORDER BY pv.updated_at DESC
      LIMIT ${limit}
    `);

    return rows.map((row) => ({
      productId: row.variant_id,
      variantId: row.variant_id,
      productName: row.product_name ?? "Unknown Product",
      sku: row.sku ?? undefined,
      currentStock: row.current_stock ?? 0,
      avgDailySales: Math.max(row.avg_daily_sales ?? 0, 0),
      lastSaleDate: row.last_sale_at ? new Date(row.last_sale_at) : null,
      costPerUnit: Math.max(row.cost_per_unit ?? 0, 0),
      category: "general",
    }));
  } catch (error) {
    console.warn("[INVENTORY] Falling back to mock optimization dataset", error);
    return [];
  }
}

async function fetchPendingOptimizationActions(): Promise<Array<{ id: string; target: string; draft: string }>> {
  try {
    const actions = await prisma.action_queue.findMany({
      where: {
        type: "inventory_optimization",
        status: "pending",
      },
      select: {
        id: true,
        target: true,
        draft: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });
    return actions.map((action) => ({
      id: action.id,
      target: action.target ?? "",
      draft: action.draft ?? "",
    }));
  } catch (error) {
    console.warn("[INVENTORY] Unable to load pending approvals", error);
    return [];
  }
}

function buildRecommendedAction({
  product,
  rop,
  eoq,
  recommendedOrderQty,
  status,
  alerts,
  daysUntilStockout,
  abc,
}: {
  product: OptimizationProductInput;
  rop: ReturnType<typeof calculateReorderPoint>;
  eoq: number;
  recommendedOrderQty: number;
  status: "urgent_reorder" | "low_stock" | "out_of_stock" | "in_stock";
  alerts: { deadStock?: boolean; overstock?: boolean; slowMoving?: boolean };
  daysUntilStockout: number | null;
  abc?: ABCAnalysisItem;
}): { currentIssue: string; action: string } {
  if (alerts.deadStock) {
    return {
      currentIssue: `Dead stock (${product.productName}) not sold in ${Math.min(999, Math.max(0, Math.floor((Date.now() - (product.lastSaleDate?.getTime() ?? Date.now() - 999 * DAY_MS)) / DAY_MS)))} days`,
      action:
        "Move to clearance bundle, consider promotional pricing, and reassess catalog placement",
    };
  }

  if (alerts.overstock) {
    const excessUnits = Math.max(
      0,
      product.currentStock - (rop.reorderPoint + rop.safetyStock),
    );
    return {
      currentIssue: `Overstock (${excessUnits} excess units, ${(product.avgDailySales || 0) ? Math.round((product.currentStock / Math.max(product.avgDailySales, 1e-6))) : 0} days of supply)` ,
      action:
        "Throttle purchasing, bundle with fast movers, and run targeted discount to reduce carrying cost",
    };
  }

  if (status === "urgent_reorder" || status === "low_stock" || status === "out_of_stock") {
    const daysLabel =
      daysUntilStockout === null
        ? "unknown"
        : daysUntilStockout <= 0
          ? "currently"
          : `${daysUntilStockout} day${daysUntilStockout === 1 ? "" : "s"}`;
    return {
      currentIssue: `${status.replace("_", " ")} risk (${daysLabel} until stockout)`,
      action: `Place replenishment order for ${recommendedOrderQty} units${abc ? ` (ABC ${abc.abcClass})` : ""} to restore buffer`,
    };
  }

  if (alerts.slowMoving) {
    return {
      currentIssue: "Slow moving inventory",
      action: "Run win-back campaign targeting past purchasers and add banner to store to improve sell-through",
    };
  }

  return {
    currentIssue: "Stable",
    action: eoq > 0
      ? `Monitor weekly; next EOQ batch projected at ${eoq} units within ${Math.max(1, Math.round((product.currentStock + recommendedOrderQty) / Math.max(product.avgDailySales, 1)))} days`
      : "Maintain monitoring cadence",
  };
}

function buildEstimatedImpact({
  product,
  rop,
  alerts,
  recommendedOrderQty,
}: {
  product: OptimizationProductInput;
  rop: ReturnType<typeof calculateReorderPoint>;
  alerts: { deadStock?: boolean; overstock?: boolean };
  recommendedOrderQty: number;
}): { summary: string } {
  if (alerts.deadStock) {
    const capital = roundCurrency(product.currentStock * product.costPerUnit);
    return {
      summary: `Free up ~$${capital.toLocaleString()} by liquidating dead stock`,
    };
  }

  if (alerts.overstock) {
    const excessUnits = Math.max(
      0,
      product.currentStock - (rop.reorderPoint + rop.safetyStock),
    );
    const carryingSavings = roundCurrency(excessUnits * product.costPerUnit * DEFAULT_HOLDING_COST_RATE);
    return {
      summary: `Reduce holding cost by ~$${carryingSavings.toLocaleString()} annually`,
    };
  }

  if (recommendedOrderQty > 0) {
    const orderValue = roundCurrency(recommendedOrderQty * product.costPerUnit);
    return {
      summary: `Prevent stockout and protect ~$${orderValue.toLocaleString()} in revenue`,
    };
  }

  return {
    summary: "Maintain availability; no immediate financial impact",
  };
}

function determinePriority({
  status,
  alerts,
  daysUntilStockout,
  daysSinceLastSale,
}: {
  status: "urgent_reorder" | "low_stock" | "out_of_stock" | "in_stock";
  alerts: { deadStock?: boolean; overstock?: boolean; slowMoving?: boolean };
  daysUntilStockout: number | null;
  daysSinceLastSale: number;
}): "high" | "medium" | "low" {
  if (
    status === "urgent_reorder" ||
    status === "out_of_stock" ||
    (daysUntilStockout !== null && daysUntilStockout <= 7)
  ) {
    return "high";
  }

  if (alerts.deadStock && daysSinceLastSale >= 180) {
    return "high";
  }

  if (alerts.overstock) {
    return "medium";
  }

  return alerts.slowMoving ? "medium" : "low";
}

function buildRationale({
  currentIssue,
  abc,
  alerts,
  estimatedImpact,
}: {
  currentIssue: string;
  abc?: ABCAnalysisItem;
  alerts: { deadStock?: boolean; overstock?: boolean; slowMoving?: boolean };
  estimatedImpact: { summary: string };
}): string {
  const reasons = [currentIssue];

  if (abc) {
    reasons.push(`ABC ${abc.abcClass}: ${abc.recommendedStrategy}`);
  }

  if (alerts.deadStock) {
    reasons.push("Flagged as dead stock (>120 days without sales)");
  }

  if (alerts.overstock) {
    reasons.push("Carrying cost above threshold");
  }

  if (alerts.slowMoving) {
    reasons.push("Velocity trending down");
  }

  reasons.push(estimatedImpact.summary);

  return reasons.join(" · ");
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundMetric(value: number): number {
  return Math.round((value + Number.EPSILON) * 10) / 10;
}

function buildFallbackProducts(): OptimizationProductInput[] {
  const now = Date.now();
  return [
    {
      productId: "prod_001",
      variantId: "var_001",
      productName: "Premium Widget Pro",
      sku: "WID-PRO-001",
      currentStock: 42,
      avgDailySales: 2.8,
      lastSaleDate: new Date(now - 5 * DAY_MS),
      costPerUnit: 48,
      sellingPrice: 119,
      leadTimeDays: 10,
      maxDailySales: 4.2,
      maxLeadDays: 16,
      category: "general",
    },
    {
      productId: "prod_002",
      variantId: "var_002",
      productName: "Deluxe Gadget Set",
      sku: "GAD-SET-002",
      currentStock: 120,
      avgDailySales: 0.5,
      lastSaleDate: new Date(now - 210 * DAY_MS),
      costPerUnit: 45,
      sellingPrice: 99,
      leadTimeDays: 21,
      maxDailySales: 1.2,
      maxLeadDays: 28,
      category: "general",
    },
    {
      productId: "prod_003",
      variantId: "var_003",
      productName: "Ultimate Bundle",
      sku: "ULT-BUN-003",
      currentStock: 15,
      avgDailySales: 3.1,
      lastSaleDate: new Date(now - 2 * DAY_MS),
      costPerUnit: 72,
      sellingPrice: 189,
      leadTimeDays: 12,
      maxDailySales: 4.5,
      maxLeadDays: 18,
      category: "general",
    },
    {
      productId: "prod_004",
      variantId: "var_004",
      productName: "Standard Tool Kit",
      sku: "STD-TLK-004",
      currentStock: 180,
      avgDailySales: 1.1,
      lastSaleDate: new Date(now - 65 * DAY_MS),
      costPerUnit: 32,
      sellingPrice: 79,
      leadTimeDays: 18,
      maxDailySales: 1.8,
      maxLeadDays: 25,
      category: "general",
    },
    {
      productId: "prod_005",
      variantId: "var_005",
      productName: "Replacement Part A",
      sku: "REP-PART-A",
      currentStock: 8,
      avgDailySales: 0.2,
      lastSaleDate: new Date(now - 150 * DAY_MS),
      costPerUnit: 18,
      sellingPrice: 35,
      leadTimeDays: 7,
      maxDailySales: 0.5,
      maxLeadDays: 12,
      category: "general",
    },
  ];
}
