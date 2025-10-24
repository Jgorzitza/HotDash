/**
 * Bing Webmaster Tools Integration Service
 *
 * Handles site verification, sitemap submission, and metrics collection
 * Stores data in seo_search_console_metrics table (multi-source)
 */

import { createBingClient } from "./client";
import type { BingSite, BingSitemap, BingSearchMetrics } from "./client";

export interface BingIntegrationConfig {
  domain: string;
  sitemapUrl: string;
  siteId?: string;
}

export interface BingVerificationResult {
  success: boolean;
  siteId?: string;
  verificationToken?: string;
  error?: string;
}

export interface BingSitemapResult {
  success: boolean;
  sitemapId?: string;
  error?: string;
}

export interface BingMetricsResult {
  success: boolean;
  metrics?: BingSearchMetrics[];
  error?: string;
}

export class BingIntegration {
  private client: ReturnType<typeof createBingClient>;
  private config: BingIntegrationConfig;

  constructor(config: BingIntegrationConfig) {
    this.config = config;
    this.client = createBingClient();
  }

  /**
   * Verify site ownership with Bing
   */
  async verifySite(): Promise<BingVerificationResult> {
    try {
      // First, get existing sites to check if already verified
      const sitesResponse = await this.client.getSites();
      
      if (sitesResponse.success && sitesResponse.data) {
        const existingSite = sitesResponse.data.find(site => 
          site.url === this.config.domain || site.url === `https://${this.config.domain}`
        );
        
        if (existingSite && existingSite.verified) {
          return {
            success: true,
            siteId: existingSite.id,
          };
        }
      }

      // If not verified, start verification process
      const verifyResponse = await this.client.verifySite(this.config.domain);
      
      if (!verifyResponse.success || !verifyResponse.data) {
        return {
          success: false,
          error: verifyResponse.error || "Failed to start site verification",
        };
      }

      return {
        success: true,
        verificationToken: verifyResponse.data.verificationToken,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during verification",
      };
    }
  }

  /**
   * Submit sitemap to Bing
   */
  async submitSitemap(): Promise<BingSitemapResult> {
    try {
      if (!this.config.siteId) {
        return {
          success: false,
          error: "Site ID is required. Please verify the site first.",
        };
      }

      const response = await this.client.submitSitemap(this.config.siteId, this.config.sitemapUrl);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Failed to submit sitemap",
        };
      }

      return {
        success: true,
        sitemapId: response.data.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during sitemap submission",
      };
    }
  }

  /**
   * Get search performance metrics
   */
  async getSearchMetrics(
    startDate: string,
    endDate: string
  ): Promise<BingMetricsResult> {
    try {
      if (!this.config.siteId) {
        return {
          success: false,
          error: "Site ID is required. Please verify the site first.",
        };
      }

      const response = await this.client.getSearchMetrics(
        this.config.siteId,
        startDate,
        endDate,
        "day"
      );
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Failed to get search metrics",
        };
      }

      return {
        success: true,
        metrics: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error getting metrics",
      };
    }
  }

  /**
   * Get query performance data
   */
  async getQueryPerformance(
    startDate: string,
    endDate: string,
    rowLimit: number = 1000
  ): Promise<BingMetricsResult> {
    try {
      if (!this.config.siteId) {
        return {
          success: false,
          error: "Site ID is required. Please verify the site first.",
        };
      }

      const response = await this.client.getQueryPerformance(
        this.config.siteId,
        startDate,
        endDate,
        rowLimit
      );
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Failed to get query performance",
        };
      }

      return {
        success: true,
        metrics: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error getting query performance",
      };
    }
  }

  /**
   * Store metrics in database
   */
  async storeMetrics(metrics: BingSearchMetrics[]): Promise<{ success: boolean; error?: string }> {
    try {
      // TODO: Implement database storage when Data agent implements seo_search_console_metrics table
      // This would store metrics in the multi-source table with source = 'bing'
      
      
      // Example of what the database storage would look like:
      // for (const metric of metrics) {
      //   await supabase.from('seo_search_console_metrics').insert({
      //     source: 'bing',
      //     date: metric.date,
      //     clicks: metric.clicks,
      //     impressions: metric.impressions,
      //     ctr: metric.ctr,
      //     position: metric.position,
      //     queries: metric.queries,
      //     created_at: new Date().toISOString(),
      //   });
      // }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to store metrics",
      };
    }
  }

  /**
   * Complete setup process: verify site and submit sitemap
   */
  async setup(): Promise<{
    success: boolean;
    siteId?: string;
    sitemapId?: string;
    verificationToken?: string;
    error?: string;
  }> {
    try {
      // Step 1: Verify site
      const verification = await this.verifySite();
      if (!verification.success) {
        return {
          success: false,
          error: verification.error,
        };
      }

      // If we got a verification token, the site needs manual verification
      if (verification.verificationToken) {
        return {
          success: true,
          verificationToken: verification.verificationToken,
          error: "Site verification requires manual step. Please add the verification token to your site's meta tags.",
        };
      }

      // Step 2: Submit sitemap if site is verified
      if (verification.siteId) {
        this.config.siteId = verification.siteId;
        const sitemap = await this.submitSitemap();
        
        return {
          success: true,
          siteId: verification.siteId,
          sitemapId: sitemap.sitemapId,
          error: sitemap.error,
        };
      }

      return {
        success: true,
        verificationToken: verification.verificationToken,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error during setup",
      };
    }
  }

  /**
   * Check if integration is properly configured
   */
  isConfigured(): boolean {
    return this.client.isAuthenticated();
  }
}

/**
 * Factory function to create Bing integration
 */
export function createBingIntegration(config: BingIntegrationConfig): BingIntegration {
  return new BingIntegration(config);
}
