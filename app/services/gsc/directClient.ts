import { google } from 'googleapis';
import type {
  DateRange,
  GSCClient,
  GSCPage,
  GSCAnomalyDetection,
  GSCQuery,
} from './client';

/**
 * Google Search Console Direct API Client
 *
 * Uses the official Google Search Console API (Webmasters API) to fetch
 * organic search performance data directly from GSC.
 *
 * @module services/gsc/directClient
 *
 * ## Authentication
 *
 * Uses GOOGLE_APPLICATION_CREDENTIALS environment variable pointing to a service
 * account JSON file with Search Console access permissions.
 *
 * ## Environment Variables
 *
 * - `GOOGLE_APPLICATION_CREDENTIALS`: Path to service account credentials file
 * - `GSC_SITE_URL`: Search Console property URL (e.g., "https://hotrodan.com")
 *
 * ## Features
 *
 * - Organic traffic filtering (web search type only)
 * - WoW (Week-over-Week) delta calculation
 * - Anomaly detection (>20% traffic changes)
 * - BigQuery export support
 *
 * @see {@link https://developers.google.com/webmaster-tools/search-console-api-original/v3/quickstart Google Search Console API}
 *
 * @example
 * ```typescript
 * const client = createDirectGSCClient('https://hotrodan.com');
 * const pages = await client.fetchOrganicPages({
 *   start: '2025-10-01',
 *   end: '2025-10-07',
 * });
 * ```
 */
export function createDirectGSCClient(siteUrl: string): GSCClient {
  if (!siteUrl) {
    throw new Error('GSC_SITE_URL environment variable required');
  }

  // Validate GOOGLE_APPLICATION_CREDENTIALS is set
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error(
      'GOOGLE_APPLICATION_CREDENTIALS environment variable required. ' +
        'Set to path of service account JSON file.'
    );
  }

  // Initialize Google Auth with service account
  const auth = new google.auth.GoogleAuth({
    keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  const searchConsole = google.webmasters({ version: 'v3', auth });

  return {
    async fetchOrganicPages(range: DateRange): Promise<GSCPage[]> {
      try {
        // Fetch current period data
        const currentResponse = await searchConsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: range.start,
            endDate: range.end,
            dimensions: ['page'],
            // Filter for organic web search only
            dimensionFilterGroups: [
              {
                filters: [
                  {
                    dimension: 'searchAppearance',
                    operator: 'notContains',
                    expression: 'VIDEO', // Exclude video results
                  },
                ],
              },
            ],
            rowLimit: 100, // Top 100 pages
            aggregationType: 'auto',
          },
        });

        // Calculate previous period (same length as current)
        const startDate = new Date(range.start);
        const endDate = new Date(range.end);
        const periodLength = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        const previousStart = new Date(startDate);
        previousStart.setDate(previousStart.getDate() - periodLength);
        const previousEnd = new Date(endDate);
        previousEnd.setDate(previousEnd.getDate() - periodLength);

        // Fetch previous period data for WoW calculation
        const previousResponse = await searchConsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: previousStart.toISOString().slice(0, 10),
            endDate: previousEnd.toISOString().slice(0, 10),
            dimensions: ['page'],
            dimensionFilterGroups: [
              {
                filters: [
                  {
                    dimension: 'searchAppearance',
                    operator: 'notContains',
                    expression: 'VIDEO',
                  },
                ],
              },
            ],
            rowLimit: 100,
            aggregationType: 'auto',
          },
        });

        // Build map of previous period clicks by page
        const previousClicks = new Map<string, number>();
        (previousResponse.data.rows || []).forEach((row) => {
          const page = row.keys?.[0] || '';
          previousClicks.set(page, row.clicks || 0);
        });

        // Fetch top queries for each page
        const pagesWithQueries: GSCPage[] = await Promise.all(
          (currentResponse.data.rows || []).map(async (row) => {
            const page = row.keys?.[0] || '';
            const currentClicks = row.clicks || 0;
            const previousPageClicks = previousClicks.get(page) || 0;

            // Calculate WoW delta
            let wowDelta = 0;
            if (previousPageClicks > 0) {
              wowDelta = (currentClicks - previousPageClicks) / previousPageClicks;
            } else if (currentClicks > 0) {
              wowDelta = 1; // 100% increase (new page)
            }

            // Fetch top queries for this page
            const queriesResponse = await searchConsole.searchanalytics.query({
              siteUrl,
              requestBody: {
                startDate: range.start,
                endDate: range.end,
                dimensions: ['query'],
                dimensionFilterGroups: [
                  {
                    filters: [
                      {
                        dimension: 'page',
                        operator: 'equals',
                        expression: page,
                      },
                      {
                        dimension: 'searchAppearance',
                        operator: 'notContains',
                        expression: 'VIDEO',
                      },
                    ],
                  },
                ],
                rowLimit: 10, // Top 10 queries per page
              },
            });

            const queries: GSCQuery[] = (queriesResponse.data.rows || []).map(
              (qRow) => ({
                query: qRow.keys?.[0] || '',
                clicks: qRow.clicks || 0,
                impressions: qRow.impressions || 0,
                ctr: qRow.ctr || 0,
                position: qRow.position || 0,
              })
            );

            return {
              url: page,
              clicks: currentClicks,
              impressions: row.impressions || 0,
              ctr: row.ctr || 0,
              position: row.position || 0,
              wowDelta,
              queries,
            };
          })
        );

        return pagesWithQueries;
      } catch (error: any) {
        const message = error.message || 'Unknown error';
        throw new Error(
          `Google Search Console API request failed: ${message}. ` +
            `Site: ${siteUrl}, Date range: ${range.start} to ${range.end}`
        );
      }
    },

    async detectAnomalies(
      currentRange: DateRange,
      previousRange: DateRange
    ): Promise<GSCAnomalyDetection[]> {
      try {
        // Fetch data for both periods
        const currentResponse = await searchConsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: currentRange.start,
            endDate: currentRange.end,
            dimensions: ['page'],
            dimensionFilterGroups: [
              {
                filters: [
                  {
                    dimension: 'searchAppearance',
                    operator: 'notContains',
                    expression: 'VIDEO',
                  },
                ],
              },
            ],
            rowLimit: 100,
            aggregationType: 'auto',
          },
        });

        const previousResponse = await searchConsole.searchanalytics.query({
          siteUrl,
          requestBody: {
            startDate: previousRange.start,
            endDate: previousRange.end,
            dimensions: ['page'],
            dimensionFilterGroups: [
              {
                filters: [
                  {
                    dimension: 'searchAppearance',
                    operator: 'notContains',
                    expression: 'VIDEO',
                  },
                ],
              },
            ],
            rowLimit: 100,
            aggregationType: 'auto',
          },
        });

        // Build previous clicks map
        const previousClicks = new Map<string, number>();
        (previousResponse.data.rows || []).forEach((row) => {
          const page = row.keys?.[0] || '';
          previousClicks.set(page, row.clicks || 0);
        });

        // Calculate anomalies
        const anomalies: GSCAnomalyDetection[] = [];
        (currentResponse.data.rows || []).forEach((row) => {
          const page = row.keys?.[0] || '';
          const currentClicks = row.clicks || 0;
          const previousPageClicks = previousClicks.get(page) || 0;

          // Skip if both periods have zero clicks
          if (currentClicks === 0 && previousPageClicks === 0) {
            return;
          }

          let delta = currentClicks - previousPageClicks;
          let deltaPercentage = 0;

          if (previousPageClicks > 0) {
            deltaPercentage = delta / previousPageClicks;
          } else if (currentClicks > 0) {
            deltaPercentage = 1; // 100% increase
          }

          // Anomaly threshold: ±20% change
          const isAnomaly = Math.abs(deltaPercentage) >= 0.2;
          let anomalyType: 'spike' | 'drop' | 'none' = 'none';

          if (isAnomaly) {
            anomalyType = deltaPercentage > 0 ? 'spike' : 'drop';
          }

          anomalies.push({
            page,
            currentClicks,
            previousClicks: previousPageClicks,
            delta,
            deltaPercentage,
            isAnomaly,
            anomalyType,
          });
        });

        // Sort by absolute delta percentage (biggest changes first)
        return anomalies.sort(
          (a, b) => Math.abs(b.deltaPercentage) - Math.abs(a.deltaPercentage)
        );
      } catch (error: any) {
        const message = error.message || 'Unknown error';
        throw new Error(
          `GSC anomaly detection failed: ${message}. ` +
            `Site: ${siteUrl}`
        );
      }
    },
  };
}

