/**
 * Bing Webmaster Tools Integration Service
 *
 * Handles site verification, sitemap submission, and metrics collection
 * Stores data in seo_search_console_metrics table (multi-source)
 */
import type { BingSearchMetrics } from "./client";
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
export declare class BingIntegration {
    private client;
    private config;
    constructor(config: BingIntegrationConfig);
    /**
     * Verify site ownership with Bing
     */
    verifySite(): Promise<BingVerificationResult>;
    /**
     * Submit sitemap to Bing
     */
    submitSitemap(): Promise<BingSitemapResult>;
    /**
     * Get search performance metrics
     */
    getSearchMetrics(startDate: string, endDate: string): Promise<BingMetricsResult>;
    /**
     * Get query performance data
     */
    getQueryPerformance(startDate: string, endDate: string, rowLimit?: number): Promise<BingMetricsResult>;
    /**
     * Store metrics in database
     */
    storeMetrics(metrics: BingSearchMetrics[]): Promise<{
        success: boolean;
        error?: string;
    }>;
    /**
     * Complete setup process: verify site and submit sitemap
     */
    setup(): Promise<{
        success: boolean;
        siteId?: string;
        sitemapId?: string;
        verificationToken?: string;
        error?: string;
    }>;
    /**
     * Check if integration is properly configured
     */
    isConfigured(): boolean;
}
/**
 * Factory function to create Bing integration
 */
export declare function createBingIntegration(config: BingIntegrationConfig): BingIntegration;
//# sourceMappingURL=integration.d.ts.map