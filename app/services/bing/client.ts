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
  ctr: number; // Click-through rate
  position: number; // Average position
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

const DEFAULT_BASE_URL = "https://ssl.bing.com/webmaster/api.svc/json";

export class BingWebmasterClient {
  private config: BingConfig;
  private accessToken?: string;
  private refreshToken?: string;
  private tokenExpiresAt?: number;

  constructor(config: BingConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl || DEFAULT_BASE_URL,
    };
  }

  /**
   * Get OAuth authorization URL
   */
  getAuthorizationUrl(state?: string): string {
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
  async exchangeCodeForToken(code: string): Promise<BingAPIResponse<{ access_token: string; refresh_token: string; expires_in: number }>> {
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<BingAPIResponse<{ access_token: string; expires_in: number }>> {
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<BingAPIResponse<T>> {
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
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get list of verified sites
   */
  async getSites(): Promise<BingAPIResponse<BingSite[]>> {
    return this.request<BingSite[]>("GetUserSites");
  }

  /**
   * Verify a site using meta tag method
   */
  async verifySite(domain: string): Promise<BingAPIResponse<{ verificationToken: string }>> {
    return this.request<{ verificationToken: string }>("AddSite", {
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
  async submitSitemap(siteId: string, sitemapUrl: string): Promise<BingAPIResponse<BingSitemap>> {
    return this.request<BingSitemap>("SubmitSitemap", {
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
  async getSitemaps(siteId: string): Promise<BingAPIResponse<BingSitemap[]>> {
    return this.request<BingSitemap[]>(`GetSitemaps?siteId=${encodeURIComponent(siteId)}`);
  }

  /**
   * Get search performance metrics
   */
  async getSearchMetrics(
    siteId: string,
    startDate: string,
    endDate: string,
    groupBy: "day" | "week" | "month" = "day"
  ): Promise<BingAPIResponse<BingSearchMetrics[]>> {
    return this.request<BingSearchMetrics[]>("GetSearchPerformance", {
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
  async getQueryPerformance(
    siteId: string,
    startDate: string,
    endDate: string,
    rowLimit: number = 1000
  ): Promise<BingAPIResponse<BingSearchMetrics[]>> {
    return this.request<BingSearchMetrics[]>("GetQueryPerformance", {
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
  isAuthenticated(): boolean {
    return !!this.accessToken && (!this.tokenExpiresAt || Date.now() < this.tokenExpiresAt);
  }

  /**
   * Set access token (for persistence)
   */
  setAccessToken(token: string, expiresAt?: number): void {
    this.accessToken = token;
    this.tokenExpiresAt = expiresAt;
  }

  /**
   * Clear authentication
   */
  clearAuth(): void {
    this.accessToken = undefined;
    this.refreshToken = undefined;
    this.tokenExpiresAt = undefined;
  }
}

/**
 * Factory function to create Bing client from environment variables
 */
export function createBingClient(config?: Partial<BingConfig>): BingWebmasterClient {
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
