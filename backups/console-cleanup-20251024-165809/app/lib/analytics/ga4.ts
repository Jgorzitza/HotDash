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

export interface RealtimeEngagementMetrics {
  activeUsers: number;
  screenPageViews: number;
  eventCount: number;
  keyEvents: number;
  timestamp: string;
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
    const config = getGaConfig();
    const client = createDirectGaClient(config.propertyId);

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
      fetchRevenueData(client, currentStart, currentEnd),
      fetchRevenueData(client, previousStart, previousEnd),
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
  client: any,
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

  const revenue = parseFloat(
    response.rows?.[0]?.metricValues?.[0]?.value || "0",
  );
  const transactions = parseInt(
    response.rows?.[0]?.metricValues?.[1]?.value || "0",
    10,
  );
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
    const config = getGaConfig();
    const client = createDirectGaClient(config.propertyId);

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
      fetchTrafficData(client, currentStart, currentEnd),
      fetchTrafficData(client, previousStart, previousEnd),
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
 * Fetch realtime engagement metrics from GA4
 */
export async function getRealtimeEngagementMetrics(): Promise<RealtimeEngagementMetrics> {
  const cacheKey = "analytics:ga4:realtime-engagement";
  const cached = getCached<RealtimeEngagementMetrics>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  const startTime = Date.now();

  try {
    const config = getGaConfig();
    const { BetaAnalyticsDataClient } = await import("@google-analytics/data");
    const gaClient = new BetaAnalyticsDataClient();

    const [response] = await gaClient.runRealtimeReport({
      property: `properties/${config.propertyId}`,
      metrics: [
        { name: "activeUsers" },
        { name: "screenPageViews" },
        { name: "eventCount" },
        { name: "keyEvents" },
      ],
    });

    const metricValues = response.rows?.[0]?.metricValues ?? [];
    const parse = (index: number) =>
      Number(metricValues[index]?.value ?? 0);

    const result: RealtimeEngagementMetrics = {
      activeUsers: parse(0),
      screenPageViews: parse(1),
      eventCount: parse(2),
      keyEvents: parse(3),
      timestamp: new Date().toISOString(),
    };

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getRealtimeEngagementMetrics", true, duration);

    // Cache for 15 seconds to avoid quota spikes
    setCached(cacheKey, result, 15000);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall("getRealtimeEngagementMetrics", false, duration);
    console.error("[GA4] Realtime engagement metrics failed:", error);

    const fallback: RealtimeEngagementMetrics = {
      activeUsers: 0,
      screenPageViews: 0,
      eventCount: 0,
      keyEvents: 0,
      timestamp: new Date().toISOString(),
    };
    setCached(cacheKey, fallback, 10000);
    return fallback;
  }
}

/**
 * Fetch traffic data for a specific date range
 */
async function fetchTrafficData(
  client: any,
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

  response.rows?.forEach((row) => {
    const channelGroup = row.dimensionValues?.[0]?.value || "";
    const sessions = parseInt(row.metricValues?.[0]?.value || "0", 10);

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
    const config = getGaConfig();
    const client = createDirectGaClient(config.propertyId);

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
      fetchConversionData(client, currentStart, currentEnd),
      fetchConversionData(client, previousStart, previousEnd),
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
  client: any,
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

  const sessions = parseInt(
    response.rows?.[0]?.metricValues?.[0]?.value || "0",
    10,
  );
  const transactions = parseInt(
    response.rows?.[0]?.metricValues?.[1]?.value || "0",
    10,
  );
  const revenue = parseFloat(
    response.rows?.[0]?.metricValues?.[2]?.value || "0",
  );

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
    const config = getGaConfig();
    const client = createDirectGaClient(config.propertyId);

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
      fetchTrafficBreakdownData(client, currentStart, currentEnd),
      fetchTrafficBreakdownData(client, previousStart, previousEnd),
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
  client: any,
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

  response.rows?.forEach((row) => {
    const channel = row.dimensionValues?.[0]?.value || "Unknown";
    const sessions = parseInt(row.metricValues?.[0]?.value || "0", 10);
    const users = parseInt(row.metricValues?.[1]?.value || "0", 10);
    const engagedSessions = parseInt(row.metricValues?.[2]?.value || "0", 10);
    const averageSessionDuration = parseFloat(
      row.metricValues?.[3]?.value || "0",
    );
    const bounceRate = parseFloat(row.metricValues?.[4]?.value || "0");
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
