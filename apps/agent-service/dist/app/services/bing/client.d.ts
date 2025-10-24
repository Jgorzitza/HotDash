/**
 * Bing Webmaster Tools API Client
 *
 * Features:
 * - Site verification
 * - Sitemap submission
 * - Search performance metrics
 * - OAuth authentication
 *
 * Official API: https://docs.microsoft.com/en-us/bing/webmaster-api/
 */
export interface BingConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    baseUrl?: string;
}
export interface BingSite {
    id: string;
    url: string;
    verified: boolean;
    verificationMethod: string;
    verificationToken?: string;
}
export interface BingSitemap {
    id: string;
    url: string;
    submittedAt: string;
    status: "pending" | "success" | "error";
    lastCrawled?: string;
    pagesFound?: number;
}
export interface BingSearchMetrics {
    date: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    queries: Array<{
        query: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
}
export interface BingAPIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    statusCode?: number;
}
export declare class BingWebmasterClient {
    private config;
    private accessToken?;
    private refreshToken?;
    private tokenExpiresAt?;
    constructor(config: BingConfig);
    /**
     * Get OAuth authorization URL
     */
    getAuthorizationUrl(state?: string): string;
    /**
     * Exchange authorization code for access token
     */
    exchangeCodeForToken(code: string): Promise<BingAPIResponse<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }>>;
    /**
     * Refresh access token
     */
    refreshAccessToken(): Promise<BingAPIResponse<{
        access_token: string;
        expires_in: number;
    }>>;
    /**
     * Make authenticated API request
     */
    private request;
    /**
     * Get list of verified sites
     */
    getSites(): Promise<BingAPIResponse<BingSite[]>>;
    /**
     * Verify a site using meta tag method
     */
    verifySite(domain: string): Promise<BingAPIResponse<{
        verificationToken: string;
    }>>;
    /**
     * Submit sitemap to Bing
     */
    submitSitemap(siteId: string, sitemapUrl: string): Promise<BingAPIResponse<BingSitemap>>;
    /**
     * Get sitemaps for a site
     */
    getSitemaps(siteId: string): Promise<BingAPIResponse<BingSitemap[]>>;
    /**
     * Get search performance metrics
     */
    getSearchMetrics(siteId: string, startDate: string, endDate: string, groupBy?: "day" | "week" | "month"): Promise<BingAPIResponse<BingSearchMetrics[]>>;
    /**
     * Get query performance data
     */
    getQueryPerformance(siteId: string, startDate: string, endDate: string, rowLimit?: number): Promise<BingAPIResponse<BingSearchMetrics[]>>;
    /**
     * Check if access token is valid
     */
    isAuthenticated(): boolean;
    /**
     * Set access token (for persistence)
     */
    setAccessToken(token: string, expiresAt?: number): void;
    /**
     * Clear authentication
     */
    clearAuth(): void;
}
/**
 * Factory function to create Bing client from environment variables
 */
export declare function createBingClient(config?: Partial<BingConfig>): BingWebmasterClient;
//# sourceMappingURL=client.d.ts.map