/**
 * Analytics Query Batching
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { createGA4Client, GA4Helpers } from "./client";
import type { GA4RevenueData, GA4TrafficData } from "./client";

export interface BatchedAnalyticsData {
  revenue: GA4RevenueData;
  traffic: GA4TrafficData;
  period: string;
}

export interface BatchQueryOptions {
  startDate: string;
  endDate: string;
}

/**
 * Batch multiple analytics queries into a single operation
 */
export async function batchAnalyticsQueries(
  options: BatchQueryOptions
): Promise<BatchedAnalyticsData> {
  const client = createGA4Client();

  // Execute queries in parallel
  const [revenue, traffic] = await Promise.all([
    client.getRevenue(options.startDate, options.endDate),
    client.getTraffic(options.startDate, options.endDate),
  ]);

  return {
    revenue,
    traffic,
    period: `${options.startDate} to ${options.endDate}`,
  };
}

/**
 * Batch queries for multiple time periods
 */
export async function batchMultiPeriodQueries(
  periods: Array<{ startDate: string; endDate: string; label: string }>
): Promise<Record<string, BatchedAnalyticsData>> {
  const results = await Promise.all(
    periods.map(async (period) => ({
      label: period.label,
      data: await batchAnalyticsQueries(period),
    }))
  );

  return results.reduce((acc, { label, data }) => {
    acc[label] = data;
    return acc;
  }, {} as Record<string, BatchedAnalyticsData>);
}

/**
 * Get common dashboard metrics (last 7, 30, 90 days)
 */
export async function getDashboardMetrics(): Promise<{
  last7Days: BatchedAnalyticsData;
  last30Days: BatchedAnalyticsData;
  last90Days: BatchedAnalyticsData;
}> {
  const periods = [
    { ...GA4Helpers.getLastNDays(7), label: "last7Days" },
    { ...GA4Helpers.getLastNDays(30), label: "last30Days" },
    { ...GA4Helpers.getLastNDays(90), label: "last90Days" },
  ];

  const results = await batchMultiPeriodQueries(periods);

  return {
    last7Days: results.last7Days,
    last30Days: results.last30Days,
    last90Days: results.last90Days,
  };
}

/**
 * Get comparison metrics (current vs previous period)
 */
export async function getComparisonMetrics(days: number): Promise<{
  current: BatchedAnalyticsData;
  previous: BatchedAnalyticsData;
  growth: {
    revenue: number;
    transactions: number;
    sessions: number;
    users: number;
  };
}> {
  const { current, previous } = GA4Helpers.getComparisonPeriods(days);

  const [currentData, previousData] = await Promise.all([
    batchAnalyticsQueries(current),
    batchAnalyticsQueries(previous),
  ]);

  const growth = {
    revenue: previousData.revenue.totalRevenue > 0
      ? ((currentData.revenue.totalRevenue - previousData.revenue.totalRevenue) / previousData.revenue.totalRevenue) * 100
      : 0,
    transactions: previousData.revenue.transactions > 0
      ? ((currentData.revenue.transactions - previousData.revenue.transactions) / previousData.revenue.transactions) * 100
      : 0,
    sessions: previousData.traffic.sessions > 0
      ? ((currentData.traffic.sessions - previousData.traffic.sessions) / previousData.traffic.sessions) * 100
      : 0,
    users: previousData.traffic.users > 0
      ? ((currentData.traffic.users - previousData.traffic.users) / previousData.traffic.users) * 100
      : 0,
  };

  return {
    current: currentData,
    previous: previousData,
    growth,
  };
}
