/**
 * Google Analytics 4 (GA4) API Client with Common Query Helpers
 * Owner: integrations agent
 * Date: 2025-10-15
 */

import { logger } from "../../utils/logger.server";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 500;

interface ClientMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  retriedRequests: number;
  totalLatencyMs: number;
}

const metrics: ClientMetrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  retriedRequests: 0,
  totalLatencyMs: 0,
};

export function getClientMetrics(): Readonly<ClientMetrics> {
  return { ...metrics };
}

export function resetClientMetrics(): void {
  Object.assign(metrics, {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    retriedRequests: 0,
    totalLatencyMs: 0,
  });
}

export interface GA4RevenueData {
  totalRevenue: number;
  transactions: number;
  averageOrderValue: number;
  period: string;
}

export interface GA4TrafficData {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  period: string;
}

/**
 * Common GA4 Query Helpers
 */
export const GA4Helpers = {
  /**
   * Get last N days date range
   */
  getLastNDays(days: number): { startDate: string; endDate: string } {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  },

  /**
   * Get current month date range
   */
  getCurrentMonth(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  },

  /**
   * Get previous month date range
   */
  getPreviousMonth(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  },

  /**
   * Get year-to-date range
   */
  getYearToDate(): { startDate: string; endDate: string } {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), 0, 1);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0],
    };
  },

  /**
   * Get comparison periods (current vs previous)
   */
  getComparisonPeriods(days: number): {
    current: { startDate: string; endDate: string };
    previous: { startDate: string; endDate: string };
  } {
    const currentEnd = new Date();
    const currentStart = new Date();
    currentStart.setDate(currentStart.getDate() - days);
    
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - days);
    
    return {
      current: {
        startDate: currentStart.toISOString().split('T')[0],
        endDate: currentEnd.toISOString().split('T')[0],
      },
      previous: {
        startDate: previousStart.toISOString().split('T')[0],
        endDate: previousEnd.toISOString().split('T')[0],
      },
    };
  },
};

export interface GA4Client {
  getRevenue(startDate: string, endDate: string): Promise<GA4RevenueData>;
  getTraffic(startDate: string, endDate: string): Promise<GA4TrafficData>;
  getRevenueLastNDays(days: number): Promise<GA4RevenueData>;
  getTrafficLastNDays(days: number): Promise<GA4TrafficData>;
}

export function createGA4Client(): GA4Client {
  metrics.totalRequests++;

  return {
    async getRevenue(startDate: string, endDate: string): Promise<GA4RevenueData> {
      const startTime = Date.now();
      
      try {
        const { getGA4Client } = await import("../../config/ga.server");
        const ga4 = getGA4Client();

        if (!ga4) {
          throw new Error("GA4 client not configured");
        }

        const response = await ga4.runReport({
          dateRanges: [{ startDate, endDate }],
          dimensions: [],
          metrics: [
            { name: "totalRevenue" },
            { name: "transactions" },
          ],
        });

        const row = response.rows?.[0];
        const totalRevenue = Number.parseFloat(row?.metricValues?.[0]?.value || "0");
        const transactions = Number.parseInt(row?.metricValues?.[1]?.value || "0", 10);
        const averageOrderValue = transactions > 0 ? totalRevenue / transactions : 0;

        const latency = Date.now() - startTime;
        metrics.totalLatencyMs += latency;
        metrics.successfulRequests++;

        logger.debug("GA4 revenue query", {
          startDate,
          endDate,
          totalRevenue,
          transactions,
          latencyMs: latency,
        });

        return {
          totalRevenue,
          transactions,
          averageOrderValue,
          period: startDate + " to " + endDate,
        };
      } catch (error) {
        const latency = Date.now() - startTime;
        metrics.totalLatencyMs += latency;
        metrics.failedRequests++;

        logger.error("GA4 revenue query failed", {
          error: error instanceof Error ? error.message : String(error),
          startDate,
          endDate,
        });

        throw error;
      }
    },

    async getTraffic(startDate: string, endDate: string): Promise<GA4TrafficData> {
      const startTime = Date.now();
      
      try {
        const { getGA4Client } = await import("../../config/ga.server");
        const ga4 = getGA4Client();

        if (!ga4) {
          throw new Error("GA4 client not configured");
        }

        const response = await ga4.runReport({
          dateRanges: [{ startDate, endDate }],
          dimensions: [],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
            { name: "bounceRate" },
          ],
        });

        const row = response.rows?.[0];
        const sessions = Number.parseInt(row?.metricValues?.[0]?.value || "0", 10);
        const users = Number.parseInt(row?.metricValues?.[1]?.value || "0", 10);
        const pageviews = Number.parseInt(row?.metricValues?.[2]?.value || "0", 10);
        const bounceRate = Number.parseFloat(row?.metricValues?.[3]?.value || "0");

        const latency = Date.now() - startTime;
        metrics.totalLatencyMs += latency;
        metrics.successfulRequests++;

        logger.debug("GA4 traffic query", {
          startDate,
          endDate,
          sessions,
          users,
          latencyMs: latency,
        });

        return {
          sessions,
          users,
          pageviews,
          bounceRate,
          period: startDate + " to " + endDate,
        };
      } catch (error) {
        const latency = Date.now() - startTime;
        metrics.totalLatencyMs += latency;
        metrics.failedRequests++;

        logger.error("GA4 traffic query failed", {
          error: error instanceof Error ? error.message : String(error),
          startDate,
          endDate,
        });

        throw error;
      }
    },

    async getRevenueLastNDays(days: number): Promise<GA4RevenueData> {
      const { startDate, endDate } = GA4Helpers.getLastNDays(days);
      return this.getRevenue(startDate, endDate);
    },

    async getTrafficLastNDays(days: number): Promise<GA4TrafficData> {
      const { startDate, endDate } = GA4Helpers.getLastNDays(days);
      return this.getTraffic(startDate, endDate);
    },
  };
}
