/**
 * API Route: Ads Performance
 * 
 * GET /api/ads/performance
 * 
 * Purpose: Retrieve aggregated advertising performance metrics across platforms
 * Owner: ads agent
 * Date: 2025-10-15
 * 
 * Features:
 * - Multi-platform support (Meta, Google, TikTok)
 * - ROAS, CPC, CPM, CPA calculations
 * - Campaign aggregation
 * - 5-minute caching
 * - Audit logging to DashboardFact
 * 
 * Query Parameters:
 * - dateStart: ISO date string (YYYY-MM-DD) - default: 30 days ago
 * - dateEnd: ISO date string (YYYY-MM-DD) - default: today
 * - platform: Filter by platform (meta|google|tiktok|other) - optional
 * 
 * Security:
 * - Requires Shopify authentication
 * - No PII in logs
 * - Read-only operations only
 * 
 * Response Format:
 * {
 *   "totalCampaigns": 5,
 *   "totalAdSpend": 2500.00,
 *   "totalRevenue": 10000.00,
 *   "aggregatedRoas": 4.0,
 *   "averageCpc": 1.25,
 *   "averageCpm": 12.50,
 *   "averageCpa": 25.00,
 *   "aggregatedCtr": 2.5,
 *   "aggregatedConversionRate": 5.0,
 *   "byPlatform": {
 *     "meta": { ... },
 *     "google": { ... }
 *   },
 *   "dateStart": "2025-09-15",
 *   "dateEnd": "2025-10-15",
 *   "calculatedAt": "2025-10-15T14:00:00.000Z"
 * }
 */

import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { getShopifyServiceContext } from "../../services/shopify/client";
import { ServiceError } from "../../services/types";
import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../../services/facts.server";
import { toInputJson } from "../../services/json";
import {
  aggregateCampaignPerformance,
  type CampaignMetrics,
  type AggregatedPerformance,
  type AdPlatform,
} from "../../services/ads/tracking";

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory cache
const cache = new Map<string, { data: AggregatedPerformance; expiresAt: number }>();

/**
 * Get date range from query parameters or use defaults
 */
function getDateRange(request: Request): { dateStart: string; dateEnd: string } {
  const url = new URL(request.url);
  const dateEnd = url.searchParams.get('dateEnd') || new Date().toISOString().split('T')[0];
  
  // Default to 30 days ago
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);
  const dateStart = url.searchParams.get('dateStart') || defaultStart.toISOString().split('T')[0];

  return { dateStart, dateEnd };
}

/**
 * Get platform filter from query parameters
 */
function getPlatformFilter(request: Request): AdPlatform | null {
  const url = new URL(request.url);
  const platform = url.searchParams.get('platform');
  
  if (platform && ['meta', 'google', 'tiktok', 'other'].includes(platform)) {
    return platform as AdPlatform;
  }
  
  return null;
}

/**
 * Fetch campaign data from ad platforms
 * 
 * NOTE: This is a placeholder implementation. In production, this would:
 * 1. Connect to Meta Ads API for Facebook/Instagram campaigns
 * 2. Connect to Google Ads API for Google campaigns
 * 3. Connect to TikTok Ads API for TikTok campaigns
 * 4. Store campaign data in Supabase for historical tracking
 * 
 * For now, returns mock data for development and testing.
 */
async function fetchCampaignData(
  dateStart: string,
  dateEnd: string,
  platformFilter: AdPlatform | null
): Promise<CampaignMetrics[]> {
  // TODO: Replace with actual API integrations
  // This is mock data for development
  const mockCampaigns: CampaignMetrics[] = [
    {
      campaignId: 'meta_001',
      campaignName: 'Fall Collection - Meta',
      platform: 'meta',
      status: 'active',
      adSpend: 500,
      revenue: 2000,
      impressions: 50000,
      clicks: 500,
      conversions: 40,
      dateStart,
      dateEnd,
      metadata: {
        adSetCount: 3,
        adCount: 9,
      },
    },
    {
      campaignId: 'google_001',
      campaignName: 'Search - Hot Sauce',
      platform: 'google',
      status: 'active',
      adSpend: 750,
      revenue: 3750,
      impressions: 100000,
      clicks: 1000,
      conversions: 75,
      dateStart,
      dateEnd,
      metadata: {
        adGroupCount: 5,
        keywordCount: 50,
      },
    },
    {
      campaignId: 'meta_002',
      campaignName: 'Retargeting - Meta',
      platform: 'meta',
      status: 'active',
      adSpend: 300,
      revenue: 1500,
      impressions: 30000,
      clicks: 450,
      conversions: 30,
      dateStart,
      dateEnd,
      metadata: {
        audienceSize: 15000,
      },
    },
    {
      campaignId: 'tiktok_001',
      campaignName: 'Brand Awareness - TikTok',
      platform: 'tiktok',
      status: 'active',
      adSpend: 400,
      revenue: 1200,
      impressions: 200000,
      clicks: 2000,
      conversions: 24,
      dateStart,
      dateEnd,
      metadata: {
        videoCount: 5,
      },
    },
    {
      campaignId: 'google_002',
      campaignName: 'Shopping - All Products',
      platform: 'google',
      status: 'active',
      adSpend: 550,
      revenue: 2750,
      impressions: 75000,
      clicks: 750,
      conversions: 55,
      dateStart,
      dateEnd,
      metadata: {
        productCount: 120,
      },
    },
  ];

  // Apply platform filter if specified
  if (platformFilter) {
    return mockCampaigns.filter(c => c.platform === platformFilter);
  }

  return mockCampaigns;
}

/**
 * GET /api/ads/performance
 * 
 * Retrieve aggregated advertising performance metrics.
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();

  try {
    // Get authenticated Shopify context
    const context = await getShopifyServiceContext(request);
    const { shopDomain } = context;

    // Parse query parameters
    const { dateStart, dateEnd } = getDateRange(request);
    const platformFilter = getPlatformFilter(request);

    // Build cache key
    const cacheKey = `ads:${shopDomain}:${dateStart}:${dateEnd}:${platformFilter || 'all'}`;
    
    // Check cache
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      logger.info("Ads performance data served from cache", {
        shopDomain,
        dateStart,
        dateEnd,
        platform: platformFilter,
        durationMs: Date.now() - startTime,
      });
      return json(cached.data, {
        headers: {
          "Cache-Control": "private, max-age=300",
          "X-Cache": "HIT",
        },
      });
    }

    logger.info("Fetching ads performance data", {
      shopDomain,
      dateStart,
      dateEnd,
      platform: platformFilter,
    });

    // Fetch campaign data from ad platforms
    const campaigns = await fetchCampaignData(dateStart, dateEnd, platformFilter);

    if (campaigns.length === 0) {
      // No campaigns found
      const emptyResult: AggregatedPerformance = {
        totalCampaigns: 0,
        totalAdSpend: 0,
        totalRevenue: 0,
        totalImpressions: 0,
        totalClicks: 0,
        totalConversions: 0,
        aggregatedRoas: 0,
        averageCpc: 0,
        averageCpm: 0,
        averageCpa: 0,
        aggregatedCtr: 0,
        aggregatedConversionRate: 0,
        byPlatform: {} as any,
        dateStart,
        dateEnd,
        calculatedAt: new Date().toISOString(),
      };

      return json(emptyResult, {
        headers: {
          "Cache-Control": "private, max-age=300",
          "X-Cache": "MISS",
        },
      });
    }

    // Calculate aggregated performance
    const aggregated = aggregateCampaignPerformance(campaigns);

    // Log to audit trail
    await recordDashboardFact({
      shopDomain,
      factType: "ads.performance",
      scope: "dashboard",
      value: toInputJson(aggregated),
      metadata: toInputJson({
        dateStart,
        dateEnd,
        platform: platformFilter,
        campaignCount: campaigns.length,
        generatedAt: aggregated.calculatedAt,
      }),
    });

    // Cache the result
    cache.set(cacheKey, {
      data: aggregated,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    const duration = Date.now() - startTime;

    logger.info("Ads performance data calculated successfully", {
      shopDomain,
      totalCampaigns: aggregated.totalCampaigns,
      totalAdSpend: aggregated.totalAdSpend,
      totalRevenue: aggregated.totalRevenue,
      aggregatedRoas: aggregated.aggregatedRoas,
      durationMs: duration,
    });

    return json(aggregated, {
      headers: {
        "Cache-Control": "private, max-age=300",
        "X-Response-Time": `${duration}ms`,
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ServiceError) {
      logger.error("Ads performance service error", {
        message: error.message,
        scope: error.scope,
        code: error.code,
        durationMs: duration,
      });

      return json(
        {
          error: {
            message: error.message,
            scope: error.scope,
            code: error.code,
            retryable: error.retryable,
          },
        },
        {
          status: error.code ? parseInt(error.code, 10) : 500,
          headers: {
            "X-Response-Time": `${duration}ms`,
          },
        },
      );
    }

    logger.error("Ads performance unexpected error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    return json(
      {
        error: {
          message: "An unexpected error occurred while fetching ads performance data",
          scope: "ads.performance",
          code: "INTERNAL_ERROR",
          retryable: false,
        },
      },
      {
        status: 500,
        headers: {
          "X-Response-Time": `${duration}ms`,
        },
      },
    );
  }
}

