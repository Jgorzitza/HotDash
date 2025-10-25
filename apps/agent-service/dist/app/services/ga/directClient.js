import { BetaAnalyticsDataClient } from "@google-analytics/data";
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
export function createDirectGaClient(propertyId) {
    if (!propertyId) {
        throw new Error("GA_PROPERTY_ID environment variable required");
    }
    // Validate GOOGLE_APPLICATION_CREDENTIALS is set
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        throw new Error("GOOGLE_APPLICATION_CREDENTIALS environment variable required. " +
            "Set to path of service account JSON file.");
    }
    // Initialize client - uses GOOGLE_APPLICATION_CREDENTIALS env var automatically
    const client = new BetaAnalyticsDataClient();
    return {
        async fetchLandingPageSessions(range) {
            try {
                // Convert ISO date strings (YYYY-MM-DD) to GA date format
                const startDate = range.start; // Already in YYYY-MM-DD format
                const endDate = range.end;
                // Run report with landing page dimensions and sessions metric
                const [response] = await client.runReport({
                    property: `properties/${propertyId}`,
                    dateRanges: [
                        {
                            startDate,
                            endDate,
                        },
                    ],
                    dimensions: [
                        {
                            name: "pagePath", // Landing page path
                        },
                    ],
                    metrics: [
                        {
                            name: "sessions", // Total sessions
                        },
                    ],
                    orderBys: [
                        {
                            metric: {
                                metricName: "sessions",
                            },
                            desc: true,
                        },
                    ],
                    limit: 100, // Top 100 pages
                });
                // Transform GA API response to GaSession format
                const sessions = (response.rows || []).map((row) => {
                    const landingPage = row.dimensionValues?.[0]?.value || "";
                    const sessionsValue = row.metricValues?.[0]?.value || "0";
                    return {
                        landingPage,
                        sessions: parseInt(sessionsValue, 10),
                        wowDelta: 0, // Will be calculated separately by comparing with previous period
                        evidenceUrl: undefined, // Optional - can be added later for drill-down links
                    };
                });
                return sessions;
            }
            catch (error) {
                // Wrap API errors with context
                const message = error.message || "Unknown error";
                throw new Error(`Google Analytics API request failed: ${message}. ` +
                    `Property ID: ${propertyId}, Date range: ${range.start} to ${range.end}`);
            }
        },
    };
}
//# sourceMappingURL=directClient.js.map