/**
 * GA4 Analytics Library
 *
 * Provides high-level analytics data for dashboard tiles:
 * - Revenue metrics (last 30 days, trends)
 * - Traffic metrics (sessions, organic traffic)
 * - Conversion metrics (conversion rate, transactions)
 *
 * Uses the existing GA4 Direct API client for data fetching.
 */

import { createDirectGaClient } from "../../services/ga/directClient";
import { getGaConfig } from "../../config/ga.server";
import { appMetrics } from "../../utils/metrics.server";
import { getCached, setCached } from "../../services/cache.server";

// ============================================================================
// Types
// ============================================================================

export interface RevenueMetrics {
  totalRevenue: number;
  averageOrderValue: number;
  transactions: number;
  trend: {
    revenueChange: number; // Percentage change vs previous period
    aovChange: number;
    transactionsChange: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface TrafficMetrics {
  totalSessions: number;
  organicSessions: number;
  organicPercentage: number;
  trend: {
    sessionsChange: number; // Percentage change vs previous period
    organicChange: number;
  };
  period: {
    start: string;
    end: string;
  };
}

export interface ConversionMetrics {
  conversionRate: number;
  transactions: number;
  revenue: number;
  trend: {
    conversionRateChange: number;
  };
  period: {
    start: string;
    end: string;
  };
}

interface GaValueContainer {
  value?: string | null;
}

type NullableGaValue = GaValueContainer | null | undefined;

interface GaRow {
  dimensionValues?: Array<NullableGaValue> | null;
  metricValues?: Array<NullableGaValue> | null;
}

// ============================================================================
// Revenue Metrics
// ============================================================================

/**
 * Fetch revenue metrics for the last 30 days with trend comparison
 */
export async function getRevenueMetrics(): Promise<RevenueMetrics> {
  const startTime = Date.now();

  // Check cache first
  const cacheKey = "analytics:revenue:30d";
  const cached = getCached<RevenueMetrics>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    createDirectGaClient(getGaConfig().propertyId);

    // Calculate date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const currentStart = thirtyDaysAgo.toISOString().split("T")[0];
    const currentEnd = today.toISOString().split("T")[0];
    const previousStart = sixtyDaysAgo.toISOString().split("T")[0];
    const previousEnd = thirtyDaysAgo.toISOString().split("T")[0];

    // Fetch current and previous period data
    const [currentData, previousData] = await Promise.all([
      fetchRevenueData(currentStart, currentEnd),
      fetchRevenueData(previousStart, previousEnd),
    ]);

    // Calculate trends
    const revenueChange = calculatePercentageChange(
      currentData.revenue,
      previousData.revenue,
    );
    const aovChange = calculatePercentageChange(
      currentData.aov,
      previousData.aov,
    );
    const transactionsChange = calculatePercentageChange(
      currentData.transactions,
      previousData.transactions,
    );

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getRevenueMetrics", true, duration);

    const result: RevenueMetrics = {
      totalRevenue: currentData.revenue,
      averageOrderValue: currentData.aov,
      transactions: currentData.transactions,
      trend: {
        revenueChange,
        aovChange,
        transactionsChange,
      },
      period: {
        start: currentStart,
        end: currentEnd,
      },
    };

    // Cache for 5 minutes
    setCached(cacheKey, result, 300000);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getRevenueMetrics", false, duration);
    throw error;
  }
}

/**
 * Fetch revenue data for a specific date range
 */
async function fetchRevenueData(
  startDate: string,
  endDate: string,
): Promise<{ revenue: number; aov: number; transactions: number }> {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const gaClient = new BetaAnalyticsDataClient();

  const config = getGaConfig();
  const [response] = await gaClient.runReport({
    property: `properties/${config.propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [{ name: "totalRevenue" }, { name: "transactions" }],
  });

  const firstRow = response.rows?.[0] as GaRow | undefined;
  const revenue = getMetricNumber(firstRow, 0, "float");
  const transactions = getMetricNumber(firstRow, 1, "int");
  const aov = transactions > 0 ? revenue / transactions : 0;

  return { revenue, aov, transactions };
}

// ============================================================================
// Traffic Metrics
// ============================================================================

/**
 * Fetch traffic metrics for the last 30 days with trend comparison
 */
export async function getTrafficMetrics(): Promise<TrafficMetrics> {
  const startTime = Date.now();

  // Check cache first
  const cacheKey = "analytics:traffic:30d";
  const cached = getCached<TrafficMetrics>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    createDirectGaClient(getGaConfig().propertyId);

    // Calculate date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const currentStart = thirtyDaysAgo.toISOString().split("T")[0];
    const currentEnd = today.toISOString().split("T")[0];
    const previousStart = sixtyDaysAgo.toISOString().split("T")[0];
    const previousEnd = thirtyDaysAgo.toISOString().split("T")[0];

    // Fetch current and previous period data
    const [currentData, previousData] = await Promise.all([
      fetchTrafficData(currentStart, currentEnd),
      fetchTrafficData(previousStart, previousEnd),
    ]);

    // Calculate trends
    const sessionsChange = calculatePercentageChange(
      currentData.totalSessions,
      previousData.totalSessions,
    );
    const organicChange = calculatePercentageChange(
      currentData.organicSessions,
      previousData.organicSessions,
    );

    const organicPercentage =
      currentData.totalSessions > 0
        ? (currentData.organicSessions / currentData.totalSessions) * 100
        : 0;

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getTrafficMetrics", true, duration);

    const result: TrafficMetrics = {
      totalSessions: currentData.totalSessions,
      organicSessions: currentData.organicSessions,
      organicPercentage,
      trend: {
        sessionsChange,
        organicChange,
      },
      period: {
        start: currentStart,
        end: currentEnd,
      },
    };

    // Cache for 5 minutes
    setCached(cacheKey, result, 300000);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getTrafficMetrics", false, duration);
    throw error;
  }
}

/**
 * Fetch traffic data for a specific date range
 */
async function fetchTrafficData(
  startDate: string,
  endDate: string,
): Promise<{ totalSessions: number; organicSessions: number }> {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const gaClient = new BetaAnalyticsDataClient();

  const config = getGaConfig();
  const [response] = await gaClient.runReport({
    property: `properties/${config.propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [{ name: "sessions" }],
  });

  let totalSessions = 0;
  let organicSessions = 0;

  (response.rows ?? [])
    .filter(Boolean)
    .forEach((row: any) => {
      const channelGroup = getDimensionValue(row, 0);
      const sessions = getMetricNumber(row, 0, "int");

      totalSessions += sessions;

      if (channelGroup.toLowerCase().includes("organic")) {
        organicSessions += sessions;
      }
    });

  return { totalSessions, organicSessions };
}

// ============================================================================
// Conversion Metrics
// ============================================================================

/**
 * Fetch conversion metrics for the last 30 days with trend comparison
 */
export async function getConversionMetrics(): Promise<ConversionMetrics> {
  const startTime = Date.now();

  try {
    createDirectGaClient(getGaConfig().propertyId);

    // Calculate date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const currentStart = thirtyDaysAgo.toISOString().split("T")[0];
    const currentEnd = today.toISOString().split("T")[0];
    const previousStart = sixtyDaysAgo.toISOString().split("T")[0];
    const previousEnd = thirtyDaysAgo.toISOString().split("T")[0];

    // Fetch current and previous period data
    const [currentData, previousData] = await Promise.all([
      fetchConversionData(currentStart, currentEnd),
      fetchConversionData(previousStart, previousEnd),
    ]);

    // Calculate trend
    const conversionRateChange = calculatePercentageChange(
      currentData.conversionRate,
      previousData.conversionRate,
    );

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getConversionMetrics", true, duration);

    return {
      conversionRate: currentData.conversionRate,
      transactions: currentData.transactions,
      revenue: currentData.revenue,
      trend: {
        conversionRateChange,
      },
      period: {
        start: currentStart,
        end: currentEnd,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getConversionMetrics", false, duration);
    throw error;
  }
}

/**
 * Fetch conversion data for a specific date range
 */
async function fetchConversionData(
  startDate: string,
  endDate: string,
): Promise<{ conversionRate: number; transactions: number; revenue: number }> {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const gaClient = new BetaAnalyticsDataClient();

  const config = getGaConfig();
  const [response] = await gaClient.runReport({
    property: `properties/${config.propertyId}`,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: "sessions" },
      { name: "transactions" },
      { name: "totalRevenue" },
    ],
  });

  const firstRow = response.rows?.[0] as GaRow | undefined;
  const sessions = getMetricNumber(firstRow, 0, "int");
  const transactions = getMetricNumber(firstRow, 1, "int");
  const revenue = getMetricNumber(firstRow, 2, "float");

  const conversionRate = sessions > 0 ? (transactions / sessions) * 100 : 0;

  return { conversionRate, transactions, revenue };
}

// ============================================================================
// Traffic Breakdown (Detailed by Channel)
// ============================================================================

export interface ChannelMetrics {
  channel: string;
  sessions: number;
  users: number;
  engagedSessions: number;
  averageSessionDuration: number;
  bounceRate: number;
  sessionsPerUser: number;
  trend: {
    sessionsChange: number;
    usersChange: number;
  };
}

export interface TrafficBreakdown {
  channels: ChannelMetrics[];
  totalSessions: number;
  totalUsers: number;
  period: {
    start: string;
    end: string;
  };
}

/**
 * Fetch detailed traffic breakdown by channel for the last 30 days
 */
export async function getTrafficBreakdown(): Promise<TrafficBreakdown> {
  const startTime = Date.now();

  // Check cache first
  const cacheKey = "analytics:traffic-breakdown:30d";
  const cached = getCached<TrafficBreakdown>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    createDirectGaClient(getGaConfig().propertyId);

    // Calculate date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(today.getDate() - 60);

    const currentStart = thirtyDaysAgo.toISOString().split("T")[0];
    const currentEnd = today.toISOString().split("T")[0];
    const previousStart = sixtyDaysAgo.toISOString().split("T")[0];
    const previousEnd = thirtyDaysAgo.toISOString().split("T")[0];

    // Fetch current and previous period data
    const [currentData, previousData] = await Promise.all([
      fetchTrafficBreakdownData(currentStart, currentEnd),
      fetchTrafficBreakdownData(previousStart, previousEnd),
    ]);

    // Merge current and previous data to calculate trends
    const channels: ChannelMetrics[] = currentData.map((current) => {
      const previous = previousData.find((p) => p.channel === current.channel);

      return {
        channel: current.channel,
        sessions: current.sessions,
        users: current.users,
        engagedSessions: current.engagedSessions,
        averageSessionDuration: current.averageSessionDuration,
        bounceRate: current.bounceRate,
        sessionsPerUser: current.sessionsPerUser,
        trend: {
          sessionsChange: previous
            ? calculatePercentageChange(current.sessions, previous.sessions)
            : 0,
          usersChange: previous
            ? calculatePercentageChange(current.users, previous.users)
            : 0,
        },
      };
    });

    // Sort by sessions descending
    channels.sort((a, b) => b.sessions - a.sessions);

    const totalSessions = channels.reduce((sum, c) => sum + c.sessions, 0);
    const totalUsers = channels.reduce((sum, c) => sum + c.users, 0);

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getTrafficBreakdown", true, duration);

    const result: TrafficBreakdown = {
      channels,
      totalSessions,
      totalUsers,
      period: {
        start: currentStart,
        end: currentEnd,
      },
    };

    // Cache for 5 minutes
    setCached(cacheKey, result, 300000);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getTrafficBreakdown", false, duration);
    throw error;
  }
}

/**
 * Fetch traffic breakdown data for a specific date range
 */
async function fetchTrafficBreakdownData(
  startDate: string,
  endDate: string,
): Promise<
  Array<{
    channel: string;
    sessions: number;
    users: number;
    engagedSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    sessionsPerUser: number;
  }>
> {
  const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
  const gaClient = new BetaAnalyticsDataClient();

  const config = getGaConfig();
  const [response] = await gaClient.runReport({
    property: `properties/${config.propertyId}`,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: "sessionDefaultChannelGroup" }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "engagedSessions" },
      { name: "averageSessionDuration" },
      { name: "bounceRate" },
    ],
  });

  const channels: Array<{
    channel: string;
    sessions: number;
    users: number;
    engagedSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    sessionsPerUser: number;
  }> = [];

  (response.rows ?? [])
    .filter(Boolean)
    .forEach((row: any) => {
      const channel = getDimensionValue(row, 0) || "Unknown";
      const sessions = getMetricNumber(row, 0, "int");
      const users = getMetricNumber(row, 1, "int");
      const engagedSessions = getMetricNumber(row, 2, "int");
      const averageSessionDuration = getMetricNumber(row, 3, "float");
      const bounceRate = getMetricNumber(row, 4, "float");
      const sessionsPerUser = users > 0 ? sessions / users : 0;

      channels.push({
        channel,
        sessions,
        users,
        engagedSessions,
        averageSessionDuration,
        bounceRate,
        sessionsPerUser,
      });
    });

  return channels;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) {
    return current > 0 ? 100 : 0;
  }
  return ((current - previous) / previous) * 100;
}

function getMetricNumber(
  row: GaRow | undefined,
  index: number,
  mode: "int" | "float",
): number {
  const container = row?.metricValues?.[index];
  const rawValue =
    container && typeof container === "object" ? (container.value ?? "0") : "0";

  if (mode === "int") {
    const parsed = parseInt(rawValue, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  const parsed = parseFloat(rawValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function getDimensionValue(row: GaRow | undefined, index: number): string {
  const container = row?.dimensionValues?.[index];
  if (container && typeof container === "object" && container.value) {
    return container.value;
  }
  return "";
}
