/**
 * Google Search Console API Integration Stub
 *
 * OAuth setup required - see module documentation
 */

export interface SearchConsoleQuery {
  query: string;
  position: number;
  clicks: number;
  impressions: number;
  ctr: number;
  page: string;
}

export interface SearchConsoleAPIConfig {
  siteUrl: string;
  accessToken?: string;
}

/**
 * Fetches keyword ranking data from Google Search Console
 *
 * @param config - API configuration with site URL and access token
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @returns Promise resolving to query performance data
 *
 * @example
 * ```typescript
 * const queries = await fetchSearchConsoleQueries(
 *   { siteUrl: 'https://hotrodan.com', accessToken: process.env.GSC_TOKEN },
 *   '2025-10-01',
 *   '2025-10-19'
 * );
 * ```
 */
export async function fetchSearchConsoleQueries(
  config: SearchConsoleAPIConfig,
  startDate: string,
  endDate: string,
): Promise<SearchConsoleQuery[]> {
  console.warn(
    "fetchSearchConsoleQueries: Stub implementation - configure OAuth to enable",
  );

  // Mock data for development
  return [
    {
      query: "custom hot rods",
      position: 3.2,
      clicks: 145,
      impressions: 1820,
      ctr: 0.0797,
      page: "https://hotrodan.com/collections/custom-builds",
    },
  ];
}
