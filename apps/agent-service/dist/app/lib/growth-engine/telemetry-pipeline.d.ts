/**
 * Growth Engine Telemetry Pipeline Infrastructure
 *
 * Task: DATA-TELEMETRY-001
 *
 * Implements the data flow from GSC API and GA4 Data API to Action Queue
 * Provides the foundation for Analytics Agent to identify opportunities
 *
 * Updated to use REAL production data from:
 * - Google Search Console API (app/lib/seo/search-console.ts)
 * - GA4 Data API (app/services/ga/directClient.ts)
 * - Prisma database for Action Queue storage
 */
export interface TelemetryData {
    source: 'gsc' | 'ga4' | 'shopify' | 'chatwoot';
    timestamp: string;
    data: any;
    freshness: string;
}
export interface GSCData {
    query: string;
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    date: string;
}
export interface GA4Data {
    page: string;
    sessions: number;
    revenue: number;
    conversions: number;
    bounceRate: number;
    avgSessionDuration: number;
    date: string;
}
export interface OpportunityData {
    page: string;
    query?: string;
    currentCtr: number;
    currentRevenue: number;
    potentialCtr: number;
    potentialRevenue: number;
    gap: number;
    confidence: number;
    freshness: string;
}
export declare class GSCBulkExport {
    /**
     * Get GSC data from Search Console API
     * Uses real production data from Google Search Console
     */
    getGSCData(startDate: string, endDate: string): Promise<GSCData[]>;
    /**
     * Get freshness label for GSC data
     */
    getFreshnessLabel(): string;
}
export declare class GA4DataAPI {
    private propertyId;
    private client;
    constructor(propertyId: string);
    /**
     * Get GA4 data for landing pages
     * Uses real production data from GA4 Data API
     */
    getGA4Data(startDate: string, endDate: string): Promise<GA4Data[]>;
    /**
     * Get freshness label for GA4 data
     */
    getFreshnessLabel(): string;
}
export declare class AnalyticsTransform {
    private gsc;
    private ga4;
    constructor(gsc: GSCBulkExport, ga4: GA4DataAPI);
    /**
     * Join GSC and GA4 data to identify opportunities
     */
    identifyOpportunities(startDate: string, endDate: string): Promise<OpportunityData[]>;
    /**
     * Apply opportunity rules to identify high-value actions
     */
    private applyOpportunityRules;
}
export interface ActionQueueItem {
    type: string;
    target: string;
    draft: string;
    evidence: {
        mcp_request_ids: string[];
        dataset_links: string[];
        telemetry_refs: string[];
    };
    expected_impact: {
        metric: string;
        delta: number;
        unit: string;
    };
    confidence: number;
    ease: 'simple' | 'medium' | 'hard';
    risk_tier: 'policy' | 'safety' | 'perf' | 'none';
    can_execute: boolean;
    rollback_plan: string;
    freshness_label: string;
}
export declare class ActionQueueEmitter {
    /**
     * Emit action to Action Queue
     * Stores in real Prisma database
     */
    emitAction(opportunity: OpportunityData): Promise<ActionQueueItem>;
    /**
     * Store action in Action Queue (REAL DATABASE)
     */
    private storeAction;
}
export declare class TelemetryPipeline {
    private gsc;
    private ga4;
    private transform;
    private emitter;
    constructor(propertyId?: string);
    /**
     * Run daily telemetry pipeline with REAL production data
     *
     * Performance optimizations:
     * - Parallel data fetching (GSC + GA4)
     * - Error handling with graceful degradation
     * - Performance monitoring and logging
     * - Database transaction batching
     */
    runDailyPipeline(): Promise<{
        success: boolean;
        opportunitiesFound: number;
        actionsEmitted: number;
        errors: string[];
        performance: {
            totalTime: number;
            gscFetchTime: number;
            ga4FetchTime: number;
            transformTime: number;
            emitTime: number;
        };
    }>;
}
//# sourceMappingURL=telemetry-pipeline.d.ts.map