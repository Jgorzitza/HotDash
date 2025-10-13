import { BetaAnalyticsDataClient } from '@google-analytics/data';
import type { DateRange, GaClient, GaSession } from './client';

/**
 * Google Analytics Direct API Client
 * 
 * Uses the official Google Analytics Data API v1 (BetaAnalyticsDataClient) to fetch
 * analytics data directly from Google Analytics. This is the recommended approach for
 * production use as it provides the best performance and reliability.
 * 
 * @module services/ga/directClient
 * 
 * ## Authentication
 * 
 * Uses GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to a service
 * account JSON file with Google Analytics access permissions.
 * 
 * ## Environment Variables
 * 
 * - `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account credentials file
 * - `GA_PROPERTY_ID`: Google Analytics property ID (e.g., "123456789")
 * 
 * ## Performance
 * 
 * - Target latency: <100ms P95
 * - Recommended caching: 5 minutes TTL
 * - Rate limits: 25,000 queries/day per GA property
 * 
 * @see {@link https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries Google Analytics Data API Quickstart}
 * @see {@link https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema API Schema Documentation}
 * 
 * @example
 * ```typescript
 * const client = createDirectGaClient('123456789');
 * const sessions = await client.fetchLandingPageSessions({
 *   start: '2025-10-01',
 *   end: '2025-10-07',
 * });
 * ```
 */
export function createDirectGaClient(propertyId: string): GaClient {
  if (!propertyId) {
    throw new Error('GA_PROPERTY_ID environment variable required');
  }

  // Validate GOOGLE_APPLICATION_CREDENTIALS is set
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS environment variable required. ' +
      'Set to path of service account JSON file.'
    );
  }

  // Initialize client - uses GOOGLE_APPLICATION_CREDENTIALS env var automatically
  const client = new BetaAnalyticsDataClient();

  return {
    async fetchLandingPageSessions(range: DateRange): Promise<GaSession[]> {
      try {
        // Convert ISO date strings (YYYY-MM-DD) to GA date format
        const startDate = range.start; // Already in YYYY-MM-DD format
        const endDate = range.end;

        // Calculate previous week date range for WoW comparison
        const currentStart = new Date(startDate);
        const currentEnd = new Date(endDate);
        const daysDiff = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));
        
        const previousEnd = new Date(currentStart);
        previousEnd.setUTCDate(previousEnd.getUTCDate() - 1);
        const previousStart = new Date(previousEnd);
        previousStart.setUTCDate(previousStart.getUTCDate() - daysDiff);

        const prevStartDate = previousStart.toISOString().slice(0, 10);
        const prevEndDate = previousEnd.toISOString().slice(0, 10);

        // Run report with landing page dimensions and sessions metric for BOTH periods
        const [response] = await client.runReport({
          property: `properties/${propertyId}`,
          dateRanges: [
            {
              startDate,
              endDate,
              name: 'current',
            },
            {
              startDate: prevStartDate,
              endDate: prevEndDate,
              name: 'previous',
            },
          ],
          dimensions: [
            {
              name: 'pagePath', // Landing page path
            },
          ],
          metrics: [
            {
              name: 'sessions', // Total sessions
            },
          ],
          orderBys: [
            {
              metric: {
                metricName: 'sessions',
              },
              desc: true,
            },
          ],
          limit: 100, // Top 100 pages
        });

        // Transform GA API response to GaSession format with WoW calculation
        const sessions: GaSession[] = (response.rows || []).map((row) => {
          const landingPage = row.dimensionValues?.[0]?.value || '';
          const currentSessions = parseInt(row.metricValues?.[0]?.value || '0', 10);
          const previousSessions = parseInt(row.metricValues?.[1]?.value || '0', 10);
          
          // Calculate week-over-week delta percentage
          let wowDelta = 0;
          if (previousSessions > 0) {
            wowDelta = ((currentSessions - previousSessions) / previousSessions) * 100;
          } else if (currentSessions > 0) {
            // New page with no previous data - consider it 100% increase
            wowDelta = 100;
          }
          
          return {
            landingPage,
            sessions: currentSessions,
            wowDelta: parseFloat(wowDelta.toFixed(1)),
            evidenceUrl: undefined, // Optional - can be added later for drill-down links
          };
        });

        return sessions;
      } catch (error: any) {
        // Wrap API errors with context
        const message = error.message || 'Unknown error';
        throw new Error(
          `Google Analytics API request failed: ${message}. ` +
          `Property ID: ${propertyId}, Date range: ${range.start} to ${range.end}`
        );
      }
    },
  };
}

