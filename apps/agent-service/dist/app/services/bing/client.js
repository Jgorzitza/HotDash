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
const DEFAULT_BASE_URL = "https://ssl.bing.com/webmaster/api.svc/json";
export class BingWebmasterClient {
    config;
    accessToken;
    refreshToken;
    tokenExpiresAt;
    constructor(config) {
        this.config = {
            ...config,
            baseUrl: config.baseUrl || DEFAULT_BASE_URL,
        };
    }
    /**
     * Get OAuth authorization URL
     */
    getAuthorizationUrl(state) {
        const params = new URLSearchParams({
            client_id: this.config.clientId,
            response_type: "code",
            redirect_uri: this.config.redirectUri,
            scope: "https://ssl.bing.com/webmaster/api.svc/json",
            state: state || crypto.randomUUID(),
        });
        return `https://login.live.com/oauth20_authorize.srf?${params.toString()}`;
    }
    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(code) {
        try {
            const response = await fetch("https://login.live.com/oauth20_token.srf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    code,
                    grant_type: "authorization_code",
                    redirect_uri: this.config.redirectUri,
                }),
            });
            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                    statusCode: response.status,
                };
            }
            const data = await response.json();
            this.accessToken = data.access_token;
            this.refreshToken = data.refresh_token;
            this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) {
            return {
                success: false,
                error: "No refresh token available",
            };
        }
        try {
            const response = await fetch("https://login.live.com/oauth20_token.srf", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: this.config.clientId,
                    client_secret: this.config.clientSecret,
                    refresh_token: this.refreshToken,
                    grant_type: "refresh_token",
                }),
            });
            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                    statusCode: response.status,
                };
            }
            const data = await response.json();
            this.accessToken = data.access_token;
            this.tokenExpiresAt = Date.now() + (data.expires_in * 1000);
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Make authenticated API request
     */
    async request(endpoint, options = {}) {
        if (!this.accessToken) {
            return {
                success: false,
                error: "No access token available. Please authenticate first.",
            };
        }
        // Check if token needs refresh
        if (this.tokenExpiresAt && Date.now() >= this.tokenExpiresAt - 60000) { // Refresh 1 minute before expiry
            const refreshResult = await this.refreshAccessToken();
            if (!refreshResult.success) {
                return {
                    success: false,
                    error: "Failed to refresh access token",
                };
            }
        }
        try {
            const url = `${this.config.baseUrl}/${endpoint}`;
            const response = await fetch(url, {
                ...options,
                headers: {
                    "Authorization": `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                    ...options.headers,
                },
            });
            if (!response.ok) {
                return {
                    success: false,
                    error: `HTTP ${response.status}: ${response.statusText}`,
                    statusCode: response.status,
                };
            }
            const data = await response.json();
            return {
                success: true,
                data,
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    /**
     * Get list of verified sites
     */
    async getSites() {
        return this.request("GetUserSites");
    }
    /**
     * Verify a site using meta tag method
     */
    async verifySite(domain) {
        return this.request("AddSite", {
            method: "POST",
            body: JSON.stringify({
                siteUrl: domain,
                verificationMethod: "meta_tag",
            }),
        });
    }
    /**
     * Submit sitemap to Bing
     */
    async submitSitemap(siteId, sitemapUrl) {
        return this.request("SubmitSitemap", {
            method: "POST",
            body: JSON.stringify({
                siteId,
                sitemapUrl,
            }),
        });
    }
    /**
     * Get sitemaps for a site
     */
    async getSitemaps(siteId) {
        return this.request(`GetSitemaps?siteId=${encodeURIComponent(siteId)}`);
    }
    /**
     * Get search performance metrics
     */
    async getSearchMetrics(siteId, startDate, endDate, groupBy = "day") {
        return this.request("GetSearchPerformance", {
            method: "POST",
            body: JSON.stringify({
                siteId,
                startDate,
                endDate,
                groupBy,
            }),
        });
    }
    /**
     * Get query performance data
     */
    async getQueryPerformance(siteId, startDate, endDate, rowLimit = 1000) {
        return this.request("GetQueryPerformance", {
            method: "POST",
            body: JSON.stringify({
                siteId,
                startDate,
                endDate,
                rowLimit,
            }),
        });
    }
    /**
     * Check if access token is valid
     */
    isAuthenticated() {
        return !!this.accessToken && (!this.tokenExpiresAt || Date.now() < this.tokenExpiresAt);
    }
    /**
     * Set access token (for persistence)
     */
    setAccessToken(token, expiresAt) {
        this.accessToken = token;
        this.tokenExpiresAt = expiresAt;
    }
    /**
     * Clear authentication
     */
    clearAuth() {
        this.accessToken = undefined;
        this.refreshToken = undefined;
        this.tokenExpiresAt = undefined;
    }
}
/**
 * Factory function to create Bing client from environment variables
 */
export function createBingClient(config) {
    const clientId = config?.clientId || process.env.BING_CLIENT_ID;
    const clientSecret = config?.clientSecret || process.env.BING_CLIENT_SECRET;
    const redirectUri = config?.redirectUri || process.env.BING_REDIRECT_URI;
    if (!clientId) {
        throw new Error("BING_CLIENT_ID is required");
    }
    if (!clientSecret) {
        throw new Error("BING_CLIENT_SECRET is required");
    }
    if (!redirectUri) {
        throw new Error("BING_REDIRECT_URI is required");
    }
    return new BingWebmasterClient({
        clientId,
        clientSecret,
        redirectUri,
        baseUrl: config?.baseUrl,
    });
}
//# sourceMappingURL=client.js.map