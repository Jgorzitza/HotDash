import prisma from "../db.server";
import { setCached, getCached } from "./cache.server";
import type { ServiceResult } from "./types";

/**
 * Analytics Service
 * 
 * Provides real-time analytics data for the operator dashboard.
 * Uses pre-computed views and caching for optimal performance.
 */

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  lastUpdated: Date;
}

export interface SalesTrend {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

export interface DashboardUsage {
  totalSessions: number;
  uniqueShops: number;
  firstSession: Date | null;
  lastSession: Date | null;
  durationMinutes: number;
}

export interface FactSummary {
  factType: string;
  factCount: number;
  lastFactAt: Date;
}

/**
 * Get 24-hour sales summary
 */
export async function getSalesSummary24h(
  shopDomain: string
): Promise<ServiceResult<SalesSummary>> {
  const cacheKey = `analytics:sales:24h:${shopDomain}`;
  const cached = getCached<ServiceResult<SalesSummary>>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  const result = await prisma.$queryRaw<Array<{
    fact_count: bigint;
    total_orders: number;
    total_revenue: number;
    last_updated: Date;
  }>>`
    SELECT * FROM v_sales_summary_24h
  `;

  const data: SalesSummary = {
    totalOrders: result[0]?.total_orders ?? 0,
    totalRevenue: result[0]?.total_revenue ?? 0,
    lastUpdated: result[0]?.last_updated ?? new Date(),
  };

  const response: ServiceResult<SalesSummary> = {
    data,
    source: "fresh",
  };

  setCached(cacheKey, response, CACHE_TTL_MS);
  return response;
}

/**
 * Get 7-day sales trend
 */
export async function getSalesTrend7d(
  shopDomain: string
): Promise<ServiceResult<SalesTrend[]>> {
  const cacheKey = `analytics:sales:trend:7d:${shopDomain}`;
  const cached = getCached<ServiceResult<SalesTrend[]>>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  const result = await prisma.$queryRaw<Array<{
    date: Date;
    total_orders: number;
    total_revenue: number;
    avg_order_value: number;
  }>>`
    SELECT * FROM v_sales_trend_7d
  `;

  const data: SalesTrend[] = result.map(row => ({
    date: row.date.toISOString().slice(0, 10),
    totalOrders: row.total_orders ?? 0,
    totalRevenue: row.total_revenue ?? 0,
    avgOrderValue: row.avg_order_value ?? 0,
  }));

  const response: ServiceResult<SalesTrend[]> = {
    data,
    source: "fresh",
  };

  setCached(cacheKey, response, CACHE_TTL_MS);
  return response;
}

/**
 * Get dashboard usage metrics (last 24 hours)
 */
export async function getDashboardUsage24h(
  shopDomain: string
): Promise<ServiceResult<DashboardUsage>> {
  const cacheKey = `analytics:usage:24h:${shopDomain}`;
  const cached = getCached<ServiceResult<DashboardUsage>>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  const result = await prisma.$queryRaw<Array<{
    total_sessions: bigint;
    unique_shops: bigint;
    first_session: Date | null;
    last_session: Date | null;
    duration_minutes: number | null;
  }>>`
    SELECT * FROM v_dashboard_usage_24h
  `;

  const data: DashboardUsage = {
    totalSessions: Number(result[0]?.total_sessions ?? 0),
    uniqueShops: Number(result[0]?.unique_shops ?? 0),
    firstSession: result[0]?.first_session ?? null,
    lastSession: result[0]?.last_session ?? null,
    durationMinutes: result[0]?.duration_minutes ?? 0,
  };

  const response: ServiceResult<DashboardUsage> = {
    data,
    source: "fresh",
  };

  setCached(cacheKey, response, CACHE_TTL_MS);
  return response;
}

/**
 * Get hourly fact aggregation
 */
export async function getFactsHourly(
  shopDomain: string,
  hours: number = 24
): Promise<ServiceResult<FactSummary[]>> {
  const cacheKey = `analytics:facts:hourly:${shopDomain}:${hours}`;
  const cached = getCached<ServiceResult<FactSummary[]>>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  const result = await prisma.$queryRaw<Array<{
    hour_start: Date;
    factType: string;
    scope: string | null;
    fact_count: bigint;
    last_fact_at: Date;
  }>>`
    SELECT 
      hour_start,
      "factType",
      scope,
      fact_count,
      last_fact_at
    FROM v_facts_hourly
    WHERE hour_start >= NOW() - INTERVAL '${hours} hours'
    ORDER BY hour_start DESC, fact_count DESC
  `;

  const data: FactSummary[] = result.map(row => ({
    factType: row.factType,
    factCount: Number(row.fact_count),
    lastFactAt: row.last_fact_at,
  }));

  const response: ServiceResult<FactSummary[]> = {
    data,
    source: "fresh",
  };

  setCached(cacheKey, response, CACHE_TTL_MS);
  return response;
}

/**
 * Get latest fact by type
 */
export async function getLatestFact<T = any>(
  factType: string
): Promise<T | null> {
  const result = await prisma.$queryRaw<Array<{
    value: any;
    created_at: Date;
    shop_domain: string;
  }>>`
    SELECT * FROM get_latest_fact(${factType})
  `;

  return result[0]?.value ?? null;
}

/**
 * Get fact history
 */
export async function getFactHistory<T = any>(
  factType: string,
  daysBack: number = 7
): Promise<Array<{ value: T; createdAt: Date; shopDomain: string }>> {
  const result = await prisma.$queryRaw<Array<{
    value: any;
    created_at: Date;
    shop_domain: string;
    scope: string | null;
  }>>`
    SELECT * FROM get_fact_history(${factType}, ${daysBack})
  `;

  return result.map(row => ({
    value: row.value,
    createdAt: row.created_at,
    shopDomain: row.shop_domain,
  }));
}

/**
 * Calculate fact trend
 */
export async function calculateFactTrend(
  factType: string,
  metricPath: string,
  daysBack: number = 7
): Promise<Array<{ date: string; value: number; changePct: number | null }>> {
  const result = await prisma.$queryRaw<Array<{
    date: Date;
    value: number;
    change_pct: number | null;
  }>>`
    SELECT * FROM calculate_fact_trend(${factType}, ${metricPath}, ${daysBack})
  `;

  return result.map(row => ({
    date: row.date.toISOString().slice(0, 10),
    value: row.value,
    changePct: row.change_pct,
  }));
}

/**
 * Get all current dashboard metrics
 */
export async function getCurrentDashboardMetrics(
  shopDomain: string
): Promise<ServiceResult<{
  sales: SalesSummary;
  fulfillmentIssues: any;
  inventoryAlerts: any;
  cxEscalations: any;
  gaAnomalies: any;
  operatorMetrics: any;
  activationMetrics: any;
}>> {
  const cacheKey = `analytics:dashboard:current:${shopDomain}`;
  const cached = getCached<ServiceResult<any>>(cacheKey);
  if (cached) {
    return { ...cached, source: "cache" };
  }

  const [
    sales,
    fulfillmentIssues,
    inventoryAlerts,
    cxEscalations,
    gaAnomalies,
    operatorMetrics,
    activationMetrics,
  ] = await Promise.all([
    getSalesSummary24h(shopDomain),
    getLatestFact('shopify.fulfillment.issues'),
    getLatestFact('shopify.inventory.alerts'),
    getLatestFact('chatwoot.escalations'),
    getLatestFact('ga.sessions.anomalies'),
    getLatestFact('metrics.sla_resolution.rolling7d'),
    getLatestFact('metrics.activation.rolling7d'),
  ]);

  const data = {
    sales: sales.data,
    fulfillmentIssues,
    inventoryAlerts,
    cxEscalations,
    gaAnomalies,
    operatorMetrics,
    activationMetrics,
  };

  const response: ServiceResult<typeof data> = {
    data,
    source: "fresh",
  };

  setCached(cacheKey, response, CACHE_TTL_MS);
  return response;
}
