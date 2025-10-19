/**
 * Content Performance Tracking Library
 *
 * Implements engagement metrics calculations and performance tracking
 * for social media posts across platforms.
 *
 * @see docs/specs/content_tracking.md
 * @see docs/specs/content_pipeline.md
 */

/**
 * Social Platform Types
 */
export type SocialPlatform = "instagram" | "facebook" | "tiktok";

/**
 * Engagement Metrics
 * Tracks user interactions with content
 */
export interface EngagementMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves?: number; // Instagram/TikTok specific
  engagementRate: number; // Calculated: (likes + comments + shares + saves) / impressions * 100
}

/**
 * Reach Metrics
 * Tracks content visibility and distribution
 */
export interface ReachMetrics {
  impressions: number;
  reach: number;
  uniqueViews?: number;
}

/**
 * Click Metrics
 * Tracks click-through behavior
 */
export interface ClickMetrics {
  clicks: number;
  clickThroughRate: number; // Calculated: clicks / impressions * 100
  linkClicks?: number;
  profileClicks?: number;
}

/**
 * Conversion Metrics
 * Tracks business outcomes from content
 */
export interface ConversionMetrics {
  conversions: number;
  conversionRate: number; // Calculated: conversions / clicks * 100
  revenue?: number;
  averageOrderValue?: number;
}

/**
 * Complete Performance Data for Single Post
 */
export interface ContentPerformance {
  postId: string;
  platform: SocialPlatform;
  publishedAt: string; // ISO 8601
  engagement: EngagementMetrics;
  reach: ReachMetrics;
  clicks: ClickMetrics;
  conversions?: ConversionMetrics;
  period: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Aggregated Performance Across Multiple Posts
 */
export interface AggregatedPerformance {
  totalPosts: number;
  platforms: Record<SocialPlatform, number>; // Post count per platform
  totalEngagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  averageEngagementRate: number;
  totalReach: number;
  totalImpressions: number;
  totalClicks: number;
  averageClickThroughRate: number;
  totalConversions: number;
  totalRevenue: number;
  period: {
    start: string; // ISO 8601
    end: string; // ISO 8601
  };
}

/**
 * Calculate Engagement Rate
 *
 * Formula: (likes + comments + shares + saves) / impressions × 100
 *
 * @param engagement - Engagement counts (likes, comments, shares, saves)
 * @param impressions - Total impressions
 * @returns Engagement rate as percentage (0-100+)
 *
 * @example
 * calculateEngagementRate({ likes: 100, comments: 20, shares: 5, saves: 30 }, 5000)
 * // Returns: 3.1 (3.1% engagement rate)
 */
export function calculateEngagementRate(
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
  },
  impressions: number,
): number {
  // Zero-division guard
  if (impressions === 0) return 0;

  const totalEngagement =
    engagement.likes +
    engagement.comments +
    engagement.shares +
    (engagement.saves || 0);

  const rate = (totalEngagement / impressions) * 100;

  // Return 2 decimal places
  return parseFloat(rate.toFixed(2));
}

/**
 * Calculate Click-Through Rate
 *
 * Formula: clicks / impressions × 100
 *
 * @param clicks - Total clicks
 * @param impressions - Total impressions
 * @returns Click-through rate as percentage (0-100+)
 *
 * @example
 * calculateClickThroughRate(150, 5000)
 * // Returns: 3.0 (3% CTR)
 */
export function calculateClickThroughRate(
  clicks: number,
  impressions: number,
): number {
  // Zero-division guard
  if (impressions === 0) return 0;

  const rate = (clicks / impressions) * 100;

  return parseFloat(rate.toFixed(2));
}

/**
 * Calculate Conversion Rate
 *
 * Formula: conversions / clicks × 100
 *
 * @param conversions - Total conversions (purchases, signups, etc.)
 * @param clicks - Total clicks
 * @returns Conversion rate as percentage (0-100+)
 *
 * @example
 * calculateConversionRate(45, 1500)
 * // Returns: 3.0 (3% conversion rate)
 */
export function calculateConversionRate(
  conversions: number,
  clicks: number,
): number {
  // Zero-division guard
  if (clicks === 0) return 0;

  const rate = (conversions / clicks) * 100;

  return parseFloat(rate.toFixed(2));
}

/**
 * Get Performance Tier for Post
 *
 * Categorizes performance based on target comparison.
 *
 * Tiers:
 * - Exceptional: >150% of target
 * - Above Target: 100-150% of target
 * - At Target: 75-100% of target
 * - Below Target: <75% of target
 *
 * @param actual - Actual metric value
 * @param target - Target metric value
 * @returns Performance tier
 *
 * @example
 * getPerformanceTier(6.2, 4.0) // Engagement: 6.2% actual, 4% target
 * // Returns: "exceptional" (155% of target)
 */
export function getPerformanceTier(
  actual: number,
  target: number,
): "exceptional" | "above_target" | "at_target" | "below_target" {
  if (target === 0) return "below_target";

  const percentage = (actual / target) * 100;

  if (percentage > 150) return "exceptional";
  if (percentage >= 100) return "above_target";
  if (percentage >= 75) return "at_target";
  return "below_target";
}

/**
 * Get Platform-Specific Target Engagement Rate
 *
 * Based on KPI targets from content_pipeline.md:
 * - Instagram: ≥4.0%
 * - TikTok: ≥5.0%
 * - Facebook: ≥2.0%
 *
 * @param platform - Social platform
 * @returns Target engagement rate (%)
 */
export function getPlatformEngagementTarget(platform: SocialPlatform): number {
  const targets: Record<SocialPlatform, number> = {
    instagram: 4.0,
    tiktok: 5.0,
    facebook: 2.0,
  };

  return targets[platform];
}

/**
 * Get Platform-Specific Target CTR
 *
 * All platforms target ≥1.2% CTR (from content_pipeline.md)
 *
 * @param _platform - Social platform (currently unused, all same target)
 * @returns Target CTR (%)
 */
export function getPlatformCTRTarget(_platform: SocialPlatform): number {
  return 1.2;
}

/**
 * Get Platform-Specific Target Conversion Rate
 *
 * All platforms target ≥2.0% conversion rate (from content_pipeline.md)
 *
 * @param _platform - Social platform (currently unused, all same target)
 * @returns Target conversion rate (%)
 */
export function getPlatformConversionTarget(_platform: SocialPlatform): number {
  return 2.0;
}

/**
 * PLACEHOLDER: Get Content Performance
 *
 * Future integration: Fetch from Publer API + Supabase
 * Current: Returns mock data for development
 *
 * @param postId - Post identifier
 * @param platform - Social platform
 * @returns Content performance metrics
 */
export async function getContentPerformance(
  postId: string,
  platform: SocialPlatform,
): Promise<ContentPerformance> {
  // TODO: Implement Publer API integration
  // TODO: Fetch from Supabase content_performance table

  console.log("[PLACEHOLDER] getContentPerformance:", { postId, platform });

  // Mock data for development
  const impressions = 5000 + Math.floor(Math.random() * 5000);
  const reach = Math.floor(impressions * 0.8);
  const likes = Math.floor(impressions * 0.05);
  const comments = Math.floor(impressions * 0.01);
  const shares = Math.floor(impressions * 0.005);
  const saves = Math.floor(impressions * 0.02);
  const clicks = Math.floor(impressions * 0.015);
  const conversions = Math.floor(clicks * 0.025);

  return {
    postId,
    platform,
    publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    engagement: {
      likes,
      comments,
      shares,
      saves,
      engagementRate: calculateEngagementRate(
        { likes, comments, shares, saves },
        impressions,
      ),
    },
    reach: {
      impressions,
      reach,
    },
    clicks: {
      clicks,
      clickThroughRate: calculateClickThroughRate(clicks, impressions),
    },
    conversions: {
      conversions,
      conversionRate: calculateConversionRate(conversions, clicks),
    },
    period: {
      start: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      end: new Date().toISOString(),
    },
  };
}

/**
 * PLACEHOLDER: Get Aggregated Performance
 *
 * Future integration: Query Supabase for date range
 * Current: Returns mock data for development
 *
 * @param startDate - Start of period (ISO 8601)
 * @param endDate - End of period (ISO 8601)
 * @param platform - Optional platform filter
 * @returns Aggregated performance metrics
 */
export async function getAggregatedPerformance(
  startDate: string,
  endDate: string,
  platform?: SocialPlatform,
): Promise<AggregatedPerformance> {
  // TODO: Implement Supabase query
  // TODO: Aggregate across multiple posts

  console.log("[PLACEHOLDER] getAggregatedPerformance:", {
    startDate,
    endDate,
    platform,
  });

  // Mock data
  const totalPosts = 15;
  const totalImpressions = 75000;
  const totalLikes = 3750;
  const totalComments = 750;
  const totalShares = 375;
  const totalSaves = 1500;
  const totalClicks = 1125;
  const totalConversions = 28;

  return {
    totalPosts,
    platforms: {
      instagram: platform === "instagram" ? totalPosts : 7,
      facebook: platform === "facebook" ? totalPosts : 5,
      tiktok: platform === "tiktok" ? totalPosts : 3,
    },
    totalEngagement: {
      likes: totalLikes,
      comments: totalComments,
      shares: totalShares,
      saves: totalSaves,
    },
    averageEngagementRate: calculateEngagementRate(
      {
        likes: totalLikes,
        comments: totalComments,
        shares: totalShares,
        saves: totalSaves,
      },
      totalImpressions,
    ),
    totalReach: Math.floor(totalImpressions * 0.8),
    totalImpressions,
    totalClicks,
    averageClickThroughRate: calculateClickThroughRate(
      totalClicks,
      totalImpressions,
    ),
    totalConversions,
    totalRevenue: totalConversions * 95, // Avg order value $95
    period: {
      start: startDate,
      end: endDate,
    },
  };
}

/**
 * PLACEHOLDER: Get Top Performing Posts
 *
 * Future integration: Query Supabase sorted by metric
 * Current: Returns mock data for development
 *
 * @param startDate - Start of period (ISO 8601)
 * @param endDate - End of period (ISO 8601)
 * @param limit - Number of posts to return (1-100)
 * @param sortBy - Metric to sort by
 * @returns Array of top performing posts
 */
export async function getTopPerformingPosts(
  startDate: string,
  endDate: string,
  limit: number = 10,
  sortBy: "engagement" | "reach" | "clicks" | "conversions" = "engagement",
): Promise<ContentPerformance[]> {
  // TODO: Implement Supabase query with ORDER BY
  // TODO: Support different sort metrics

  console.log("[PLACEHOLDER] getTopPerformingPosts:", {
    startDate,
    endDate,
    limit,
    sortBy,
  });

  // Mock data - return top N posts
  const posts: ContentPerformance[] = [];

  for (let i = 0; i < Math.min(limit, 5); i++) {
    const platform: SocialPlatform = ["instagram", "facebook", "tiktok"][
      i % 3
    ] as SocialPlatform;
    posts.push(await getContentPerformance(`mock-post-${i + 1}`, platform));
  }

  return posts;
}
