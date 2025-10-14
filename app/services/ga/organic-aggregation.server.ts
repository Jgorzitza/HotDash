import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type { DateRange } from './client';

/**
 * GA4 Organic Search Aggregation Service
 *
 * Fetches and aggregates organic search metrics from Google Analytics 4.
 * Filters for sessionDefaultChannelGroup=Organic Search and calculates
 * proper Week-over-Week (WoW) delta by comparing with previous period.
 *
 * @module services/ga/organic-aggregation.server
 *
 * ## Key Features
 *
 * - Filters for organic search traffic only
 * - Calculates actual WoW delta (not hard-coded)
 * - Aggregates sessions, users, engagement metrics
 * - Compares current vs previous period
 *
 * ## Environment Variables
 *
 * - `GOOGLE_APPLICATION_CREDENTIALS`: Service account credentials file
 * - `GA_PROPERTY_ID`: Google Analytics 4 property ID
 *
 * @example
 * ```typescript
 * const aggregator = createOrganicAggregator('123456789');
 * const metrics = await aggregator.getOrganicMetrics({
 *   start: '2025-10-01',
 *   end: '2025-10-07',
 * });
 * // Returns: { sessions: 1250, wowDelta: -0.12, ... }
 * ```
 */

export interface OrganicMetrics {
  // Current period metrics
  sessions: number;
  users: number;
  engagedSessions: number;
  bounceRate: number;
  avgSessionDuration: number;

  // Week-over-Week comparison
  wowDelta: number; // Overall sessions change (e.g., -0.24 = -24%)
  wowUsersDelta: number;
  wowEngagementDelta: number;

  // Period info
  periodStart: string;
  periodEnd: string;
  comparedWith: {
    start: string;
    end: string;
  };
}

export interface OrganicPageMetrics {
  pagePath: string;
  sessions: number;
  wowDelta: number;
  users: number;
  bounceRate: number;
}

/**
 * Create organic search aggregation client
 */
export function createOrganicAggregator(propertyId: string) {
  if (!propertyId) {
    throw new Error('GA_PROPERTY_ID required');
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS required');
  }

  const client = new BetaAnalyticsDataClient();

  /**
   * Calculate previous period range (same duration)
   */
  function getPreviousPeriod(range: DateRange): DateRange {
    const startDate = new Date(range.start);
    const endDate = new Date(range.end);
    const periodLength = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const previousStart = new Date(startDate);
    previousStart.setDate(previousStart.getDate() - periodLength);
    const previousEnd = new Date(endDate);
    previousEnd.setDate(previousEnd.getDate() - periodLength);

    return {
      start: previousStart.toISOString().slice(0, 10),
      end: previousEnd.toISOString().slice(0, 10),
    };
  }

  return {
    /**
     * Get aggregated organic search metrics with WoW comparison
     */
    async getOrganicMetrics(range: DateRange): Promise<OrganicMetrics> {
      const previousRange = getPreviousPeriod(range);

      // Fetch current period
      const [currentResponse] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: range.start,
            endDate: range.end,
          },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'engagedSessions' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
        ],
        // Filter for organic search only
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGroup',
            stringFilter: {
              matchType: 'EXACT',
              value: 'Organic Search',
            },
          },
        },
      });

      // Fetch previous period
      const [previousResponse] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: previousRange.start,
            endDate: previousRange.end,
          },
        ],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'engagedSessions' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGroup',
            stringFilter: {
              matchType: 'EXACT',
              value: 'Organic Search',
            },
          },
        },
      });

      // Parse current period metrics
      const currentRow = currentResponse.rows?.[0];
      const currentSessions = parseInt(
        currentRow?.metricValues?.[0]?.value || '0',
        10
      );
      const currentUsers = parseInt(
        currentRow?.metricValues?.[1]?.value || '0',
        10
      );
      const currentEngaged = parseInt(
        currentRow?.metricValues?.[2]?.value || '0',
        10
      );
      const bounceRate = parseFloat(
        currentRow?.metricValues?.[3]?.value || '0'
      );
      const avgSessionDuration = parseFloat(
        currentRow?.metricValues?.[4]?.value || '0'
      );

      // Parse previous period metrics
      const previousRow = previousResponse.rows?.[0];
      const previousSessions = parseInt(
        previousRow?.metricValues?.[0]?.value || '0',
        10
      );
      const previousUsers = parseInt(
        previousRow?.metricValues?.[1]?.value || '0',
        10
      );
      const previousEngaged = parseInt(
        previousRow?.metricValues?.[2]?.value || '0',
        10
      );

      // Calculate WoW deltas
      let wowDelta = 0;
      let wowUsersDelta = 0;
      let wowEngagementDelta = 0;

      if (previousSessions > 0) {
        wowDelta = (currentSessions - previousSessions) / previousSessions;
      } else if (currentSessions > 0) {
        wowDelta = 1; // 100% increase (no previous data)
      }

      if (previousUsers > 0) {
        wowUsersDelta = (currentUsers - previousUsers) / previousUsers;
      } else if (currentUsers > 0) {
        wowUsersDelta = 1;
      }

      if (previousEngaged > 0) {
        wowEngagementDelta =
          (currentEngaged - previousEngaged) / previousEngaged;
      } else if (currentEngaged > 0) {
        wowEngagementDelta = 1;
      }

      return {
        sessions: currentSessions,
        users: currentUsers,
        engagedSessions: currentEngaged,
        bounceRate,
        avgSessionDuration,
        wowDelta,
        wowUsersDelta,
        wowEngagementDelta,
        periodStart: range.start,
        periodEnd: range.end,
        comparedWith: previousRange,
      };
    },

    /**
     * Get organic search metrics by landing page with WoW delta
     */
    async getOrganicPageMetrics(range: DateRange): Promise<OrganicPageMetrics[]> {
      const previousRange = getPreviousPeriod(range);

      // Fetch current period by page
      const [currentResponse] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: range.start,
            endDate: range.end,
          },
        ],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'sessions' },
          { name: 'activeUsers' },
          { name: 'bounceRate' },
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGroup',
            stringFilter: {
              matchType: 'EXACT',
              value: 'Organic Search',
            },
          },
        },
        orderBys: [
          {
            metric: { metricName: 'sessions' },
            desc: true,
          },
        ],
        limit: 100, // Top 100 pages
      });

      // Fetch previous period by page
      const [previousResponse] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
          {
            startDate: previousRange.start,
            endDate: previousRange.end,
          },
        ],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'sessions' }],
        dimensionFilter: {
          filter: {
            fieldName: 'sessionDefaultChannelGroup',
            stringFilter: {
              matchType: 'EXACT',
              value: 'Organic Search',
            },
          },
        },
        limit: 100,
      });

      // Build map of previous sessions by page
      const previousSessions = new Map<string, number>();
      (previousResponse.rows || []).forEach((row) => {
        const pagePath = row.dimensionValues?.[0]?.value || '';
        const sessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
        previousSessions.set(pagePath, sessions);
      });

      // Calculate metrics with WoW delta
      const pageMetrics: OrganicPageMetrics[] = (
        currentResponse.rows || []
      ).map((row) => {
        const pagePath = row.dimensionValues?.[0]?.value || '';
        const currentSessions = parseInt(
          row.metricValues?.[0]?.value || '0',
          10
        );
        const users = parseInt(row.metricValues?.[1]?.value || '0', 10);
        const bounceRate = parseFloat(row.metricValues?.[2]?.value || '0');

        const prevSessions = previousSessions.get(pagePath) || 0;
        let wowDelta = 0;

        if (prevSessions > 0) {
          wowDelta = (currentSessions - prevSessions) / prevSessions;
        } else if (currentSessions > 0) {
          wowDelta = 1; // 100% increase (new page)
        }

        return {
          pagePath,
          sessions: currentSessions,
          wowDelta,
          users,
          bounceRate,
        };
      });

      return pageMetrics;
    },
  };
}

