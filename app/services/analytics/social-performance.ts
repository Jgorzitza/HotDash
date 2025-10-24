/**
 * Social Post Performance Tracking Service
 *
 * Tracks Publer post metrics: impressions, clicks, engagement
 * Calculates CTR and engagement rate
 * Stores in DashboardFact table with factType="social_performance"
 */

import prisma from "~/prisma.server";

export interface SocialMetrics {
  impressions: number;
  clicks: number;
  engagement: number; // likes + shares + comments
  ctr: number; // Click-through rate (clicks/impressions * 100)
  engagementRate: number; // engagement/impressions * 100
}

export interface SocialPerformanceData {
  postId: string;
  platform: string;
  publishedAt: Date;
  metrics: SocialMetrics;
  metadata?: Record<string, any>;
}

/**
 * Track social post performance metrics
 * Fetches from Publer API and stores in DashboardFact
 */
export async function trackSocialPostPerformance(
  postId: string,
  shopDomain: string = "occ",
): Promise<SocialPerformanceData> {
  // TODO: Integrate with actual Publer API when credentials are available
  // For now, use mock data structure to establish the pattern

  // Fetch post from database
  const post = await prisma.socialPost.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error(`Social post ${postId} not found`);
  }

  // Mock metrics - Replace with actual Publer API call
  const rawMetrics = await fetchPublerMetrics(post.publerPostId || "");

  // Calculate derived metrics
  const metrics = calculateMetrics(rawMetrics);

  // Store in DashboardFact
  await storeSocialMetrics(shopDomain, postId, post.platform, metrics);

  return {
    postId,
    platform: post.platform,
    publishedAt: post.publishedAt || post.createdAt,
    metrics,
    metadata: {
      publerPostId: post.publerPostId,
      content: post.content.substring(0, 100), // First 100 chars
    },
  };
}

/**
 * Fetch metrics from Publer API
 * TODO: Replace with actual Publer API integration
 */
async function fetchPublerMetrics(publerPostId: string): Promise<{
  impressions: number;
  clicks: number;
  likes: number;
  shares: number;
  comments: number;
}> {
  // Mock data for now - Replace with actual API call
  // await fetch(`https://api.publer.io/v1/posts/${publerPostId}/analytics`, {
  //   headers: {
  //     Authorization: `Bearer ${process.env.PUBLER_API_KEY}`,
  //   },
  // });

  return {
    impressions: 1000,
    clicks: 45,
    likes: 23,
    shares: 8,
    comments: 5,
  };
}

/**
 * Calculate derived metrics: CTR and engagement rate
 */
function calculateMetrics(raw: {
  impressions: number;
  clicks: number;
  likes: number;
  shares: number;
  comments: number;
}): SocialMetrics {
  const engagement = raw.likes + raw.shares + raw.comments;
  const ctr = raw.impressions > 0 ? (raw.clicks / raw.impressions) * 100 : 0;
  const engagementRate =
    raw.impressions > 0 ? (engagement / raw.impressions) * 100 : 0;

  return {
    impressions: raw.impressions,
    clicks: raw.clicks,
    engagement,
    ctr: Number(ctr.toFixed(2)),
    engagementRate: Number(engagementRate.toFixed(2)),
  };
}

/**
 * Store social metrics in DashboardFact table
 */
async function storeSocialMetrics(
  shopDomain: string,
  postId: string,
  platform: string,
  metrics: SocialMetrics,
): Promise<void> {
  await prisma.dashboardFact.create({
    data: {
      shopDomain,
      factType: "social_performance",
      scope: platform,
      value: {
        postId,
        ...metrics,
      },
      metadata: {
        platform,
        trackedAt: new Date().toISOString(),
      },
    },
  });
}

/**
 * Get social performance metrics for a project
 * Returns aggregated metrics across all posts
 */
export async function getSocialPerformanceSummary(
  shopDomain: string = "occ",
  platform?: string,
  days: number = 30,
): Promise<{
  totalImpressions: number;
  totalClicks: number;
  totalEngagement: number;
  avgCtr: number;
  avgEngagementRate: number;
  postCount: number;
}> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const facts = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "social_performance",
      ...(platform && { scope: platform }),
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (facts.length === 0) {
    return {
      totalImpressions: 0,
      totalClicks: 0,
      totalEngagement: 0,
      avgCtr: 0,
      avgEngagementRate: 0,
      postCount: 0,
    };
  }

  // Aggregate metrics
  const totals = facts.reduce(
    (acc, fact) => {
      const value = fact.value as any;
      return {
        impressions: acc.impressions + (value.impressions || 0),
        clicks: acc.clicks + (value.clicks || 0),
        engagement: acc.engagement + (value.engagement || 0),
        ctr: acc.ctr + (value.ctr || 0),
        engagementRate: acc.engagementRate + (value.engagementRate || 0),
      };
    },
    { impressions: 0, clicks: 0, engagement: 0, ctr: 0, engagementRate: 0 },
  );

  return {
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalEngagement: totals.engagement,
    avgCtr: Number((totals.ctr / facts.length).toFixed(2)),
    avgEngagementRate: Number(
      (totals.engagementRate / facts.length).toFixed(2),
    ),
    postCount: facts.length,
  };
}
