import type { GaClient } from "./client";
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
export declare function createDirectGaClient(propertyId: string): GaClient;
//# sourceMappingURL=directClient.d.ts.map