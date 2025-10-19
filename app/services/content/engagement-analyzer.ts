/**
 * Engagement Analyzer Service
 *
 * Analyzes social media post performance and provides insights
 * for content optimization and strategy adjustments.
 *
 * @see app/lib/content/tracking.ts
 * @see docs/specs/content_tracking.md
 */

import {
  type ContentPerformance,
  type AggregatedPerformance,
  type SocialPlatform,
  getPerformanceTier,
  getPlatformEngagementTarget,
  getPlatformCTRTarget,
  getContentPerformance,
  getAggregatedPerformance,
  getTopPerformingPosts,
} from "~/lib/content/tracking";

/**
 * Performance Analysis Result
 */
export interface PerformanceAnalysis {
  post_id: string;
  platform: SocialPlatform;
  published_at: string;
  performance: ContentPerformance;
  analysis: {
    tier: "exceptional" | "above_target" | "at_target" | "below_target";
    engagement_analysis: {
      actual: number;
      target: number;
      vs_target: string; // e.g., "+25% above target"
      tier: string;
    };
    ctr_analysis: {
      actual: number;
      target: number;
      vs_target: string;
      tier: string;
    };
    key_insights: string[]; // What worked/didn't work
    recommendations: string[]; // Action items
  };
}

/**
 * Content Strategy Insights
 */
export interface StrategyInsights {
  period: {
    start: string;
    end: string;
  };
  overall_performance: AggregatedPerformance;
  top_performers: {
    posts: ContentPerformance[];
    common_patterns: string[]; // Why they succeeded
  };
  underperformers: {
    posts: ContentPerformance[];
    common_issues: string[]; // Why they failed
  };
  platform_insights: Record<
    SocialPlatform,
    {
      avg_engagement_rate: number;
      vs_target: string;
      best_post_type: string;
      optimal_posting_times?: string[];
    }
  >;
  recommendations: {
    priority: "high" | "medium" | "low";
    action: string;
    expected_impact: string;
  }[];
}

/**
 * Analyze Single Post Performance
 *
 * Provides detailed analysis with actionable insights.
 *
 * @param postId - Post identifier
 * @param platform - Social platform
 * @returns Performance analysis with recommendations
 */
export async function analyzePostPerformance(
  postId: string,
  platform: SocialPlatform,
): Promise<PerformanceAnalysis> {
  // Fetch performance data
  const performance = await getContentPerformance(postId, platform);

  // Get platform targets
  const engagementTarget = getPlatformEngagementTarget(platform);
  const ctrTarget = getPlatformCTRTarget(platform);

  // Calculate tier
  const engagementTier = getPerformanceTier(
    performance.engagement.engagementRate,
    engagementTarget,
  );
  const ctrTier = getPerformanceTier(
    performance.clicks.clickThroughRate,
    ctrTarget,
  );

  // Overall tier is worst of the two
  const overallTier =
    getTierPriority(engagementTier) > getTierPriority(ctrTier)
      ? ctrTier
      : engagementTier;

  // Generate insights
  const keyInsights = generateKeyInsights(performance, platform);
  const recommendations = generateRecommendations(
    performance,
    platform,
    overallTier,
  );

  return {
    post_id: postId,
    platform,
    published_at: performance.publishedAt,
    performance,
    analysis: {
      tier: overallTier,
      engagement_analysis: {
        actual: performance.engagement.engagementRate,
        target: engagementTarget,
        vs_target: formatVsTarget(
          performance.engagement.engagementRate,
          engagementTarget,
        ),
        tier: engagementTier,
      },
      ctr_analysis: {
        actual: performance.clicks.clickThroughRate,
        target: ctrTarget,
        vs_target: formatVsTarget(
          performance.clicks.clickThroughRate,
          ctrTarget,
        ),
        tier: ctrTier,
      },
      key_insights: keyInsights,
      recommendations,
    },
  };
}

/**
 * Analyze Content Strategy Over Period
 *
 * Identifies patterns, trends, and opportunities.
 *
 * @param startDate - Start of analysis period
 * @param endDate - End of analysis period
 * @returns Strategic insights and recommendations
 */
export async function analyzeContentStrategy(
  startDate: string,
  endDate: string,
): Promise<StrategyInsights> {
  // Get aggregated performance
  const overall = await getAggregatedPerformance(startDate, endDate);

  // Get top and bottom performers
  const topPosts = await getTopPerformingPosts(
    startDate,
    endDate,
    5,
    "engagement",
  );
  const allPosts = await getTopPerformingPosts(
    startDate,
    endDate,
    100,
    "engagement",
  );
  const bottomPosts = allPosts.slice(-5); // Last 5 = worst

  // Identify patterns
  const topPatterns = identifyCommonPatterns(topPosts);
  const bottomIssues = identifyCommonIssues(bottomPosts);

  // Platform-specific insights
  const platformInsights = analyzePlatformPerformance(overall);

  // Generate strategic recommendations
  const recommendations = generateStrategicRecommendations(
    overall,
    topPatterns,
    bottomIssues,
    platformInsights,
  );

  return {
    period: {
      start: startDate,
      end: endDate,
    },
    overall_performance: overall,
    top_performers: {
      posts: topPosts,
      common_patterns: topPatterns,
    },
    underperformers: {
      posts: bottomPosts,
      common_issues: bottomIssues,
    },
    platform_insights: platformInsights,
    recommendations,
  };
}

/**
 * Get Tier Priority (for determining overall tier)
 */
function getTierPriority(tier: string): number {
  const priorities: Record<string, number> = {
    below_target: 3,
    at_target: 2,
    above_target: 1,
    exceptional: 0,
  };
  return priorities[tier] ?? 2;
}

/**
 * Format Performance vs Target
 */
function formatVsTarget(actual: number, target: number): string {
  const diff = actual - target;
  const percentage = ((diff / target) * 100).toFixed(1);

  if (diff > 0) {
    return `+${percentage}% above target`;
  } else if (diff < 0) {
    return `${percentage}% below target`;
  }
  return "At target";
}

/**
 * Generate Key Insights for Post
 */
function generateKeyInsights(
  performance: ContentPerformance,
  platform: SocialPlatform,
): string[] {
  const insights: string[] = [];
  const { engagement, reach, clicks, conversions } = performance;

  // Reach efficiency
  const reachEfficiency = (reach.reach / reach.impressions) * 100;
  if (reachEfficiency > 85) {
    insights.push(
      `Excellent reach efficiency (${reachEfficiency.toFixed(1)}% of impressions)`,
    );
  } else if (reachEfficiency < 60) {
    insights.push(
      `Low reach efficiency (${reachEfficiency.toFixed(1)}%) - consider broader targeting`,
    );
  }

  // Engagement type breakdown
  const totalEngagement =
    engagement.likes +
    engagement.comments +
    engagement.shares +
    (engagement.saves || 0);
  const commentRatio = (engagement.comments / totalEngagement) * 100;
  const saveRatio = ((engagement.saves || 0) / totalEngagement) * 100;

  if (commentRatio > 15) {
    insights.push("High comment ratio - content sparked conversation");
  }
  if (saveRatio > 20 && (platform === "instagram" || platform === "tiktok")) {
    insights.push("High save rate - valuable reference content");
  }

  // Click behavior
  if (clicks.clickThroughRate > getPlatformCTRTarget(platform) * 1.5) {
    insights.push("Exceptional CTR - strong call-to-action worked");
  }

  // Conversion performance
  if (conversions && conversions.conversionRate > 3.0) {
    insights.push("Above-average conversion rate - audience highly qualified");
  }

  return insights.length > 0
    ? insights
    : ["Post performed within normal range"];
}

/**
 * Generate Recommendations for Post
 */
function generateRecommendations(
  performance: ContentPerformance,
  platform: SocialPlatform,
  tier: string,
): string[] {
  const recommendations: string[] = [];
  const { engagement, clicks, conversions } = performance;

  if (tier === "below_target" || tier === "at_target") {
    // Engagement improvements
    if (engagement.engagementRate < getPlatformEngagementTarget(platform)) {
      recommendations.push("Test question-based captions to drive comments");
      recommendations.push(
        "Include more visual hooks in first 3 seconds (video) or image",
      );
    }

    // CTR improvements
    if (clicks.clickThroughRate < getPlatformCTRTarget(platform)) {
      recommendations.push(
        "Strengthen call-to-action (use urgency or scarcity)",
      );
      recommendations.push("Test link placement in first comment vs caption");
    }

    // Conversion improvements
    if (conversions && conversions.conversionRate < 2.0) {
      recommendations.push("Align landing page message with post copy");
      recommendations.push(
        "Add social proof (reviews, testimonials) to product page",
      );
    }
  }

  if (tier === "exceptional" || tier === "above_target") {
    recommendations.push("Replicate this content pattern in future posts");
    recommendations.push("Consider boosting post with paid promotion");
    recommendations.push(
      "Analyze what made this resonate and document in playbook",
    );
  }

  return recommendations;
}

/**
 * Identify Common Patterns in Top Posts
 */
function identifyCommonPatterns(posts: ContentPerformance[]): string[] {
  // This would analyze actual post content in production
  // For now, return general patterns based on performance

  const patterns: string[] = [];

  const avgEngagement =
    posts.reduce((sum, p) => sum + p.engagement.engagementRate, 0) /
    posts.length;
  if (avgEngagement > 5.0) {
    patterns.push("High-performing posts average >5% engagement");
  }

  const highSavers = posts.filter((p) => (p.engagement.saves || 0) > 50);
  if (highSavers.length > posts.length / 2) {
    patterns.push("Educational/reference content drives saves");
  }

  const highCommenters = posts.filter((p) => p.engagement.comments > 30);
  if (highCommenters.length > posts.length / 2) {
    patterns.push("Question-based or controversial topics drive comments");
  }

  return patterns.length > 0
    ? patterns
    : ["Insufficient data for pattern detection"];
}

/**
 * Identify Common Issues in Underperforming Posts
 */
function identifyCommonIssues(posts: ContentPerformance[]): string[] {
  const issues: string[] = [];

  const avgEngagement =
    posts.reduce((sum, p) => sum + p.engagement.engagementRate, 0) /
    posts.length;
  if (avgEngagement < 2.0) {
    issues.push("Low engagement across underperformers (<2% avg)");
  }

  const lowCTR = posts.filter((p) => p.clicks.clickThroughRate < 0.8);
  if (lowCTR.length > posts.length / 2) {
    issues.push("Weak call-to-action or unclear value proposition");
  }

  const poorReach = posts.filter(
    (p) => p.reach.reach / p.reach.impressions < 0.6,
  );
  if (poorReach.length > posts.length / 2) {
    issues.push(
      "Poor reach efficiency - content not resonating with algorithm",
    );
  }

  return issues.length > 0 ? issues : ["No clear patterns in underperformance"];
}

/**
 * Analyze Platform-Specific Performance
 */
function analyzePlatformPerformance(
  overall: AggregatedPerformance,
): Record<SocialPlatform, any> {
  const platforms: SocialPlatform[] = ["instagram", "facebook", "tiktok"];
  const insights: Record<SocialPlatform, any> = {} as any;

  for (const platform of platforms) {
    const postCount = overall.platforms[platform] || 0;
    if (postCount === 0) continue;

    // Calculate platform-specific avg (simplified - would pull actual data in production)
    const avgER = overall.averageEngagementRate;
    const target = getPlatformEngagementTarget(platform);
    const vsTarget = formatVsTarget(avgER, target);

    insights[platform] = {
      avg_engagement_rate: avgER,
      vs_target: vsTarget,
      best_post_type: "launch", // Would analyze actual data
      optimal_posting_times: ["2:00 PM", "7:00 PM"], // Placeholder
    };
  }

  return insights;
}

/**
 * Generate Strategic Recommendations
 */
function generateStrategicRecommendations(
  overall: AggregatedPerformance,
  topPatterns: string[],
  bottomIssues: string[],
  platformInsights: Record<SocialPlatform, any>,
): any[] {
  const recommendations: any[] = [];

  // Based on overall performance
  if (overall.averageEngagementRate < 3.0) {
    recommendations.push({
      priority: "high",
      action:
        "Audit content calendar - increase ratio of high-engagement post types",
      expected_impact: "+1.5% average engagement rate",
    });
  }

  // Based on top patterns
  if (topPatterns.some((p) => p.includes("Educational"))) {
    recommendations.push({
      priority: "medium",
      action: "Double down on educational content - create weekly tip series",
      expected_impact: "+20% saves, +0.8% engagement rate",
    });
  }

  // Based on bottom issues
  if (bottomIssues.some((i) => i.includes("call-to-action"))) {
    recommendations.push({
      priority: "high",
      action:
        "Strengthen CTAs - A/B test 'Shop Now' vs 'Learn More' vs 'Pre-Order'",
      expected_impact: "+0.5% CTR",
    });
  }

  // Platform-specific
  const igInsights = platformInsights.instagram;
  if (igInsights && igInsights.vs_target.includes("below")) {
    recommendations.push({
      priority: "medium",
      action:
        "Optimize Instagram posting times - test 2PM vs 7PM based on audience analytics",
      expected_impact: "+15% reach, +0.6% engagement",
    });
  }

  return recommendations;
}

/**
 * Export Weekly Performance Report
 *
 * Generates markdown report for weekly brief.
 *
 * @param startDate - Week start
 * @param endDate - Week end
 * @returns Markdown-formatted report
 */
export async function exportWeeklyReport(
  startDate: string,
  endDate: string,
): Promise<string> {
  const insights = await analyzeContentStrategy(startDate, endDate);

  const report = `# Weekly Content Performance Report

**Period:** ${startDate} to ${endDate}

## Overall Performance

- **Total Posts:** ${insights.overall_performance.totalPosts}
- **Average Engagement Rate:** ${insights.overall_performance.averageEngagementRate}%
- **Average CTR:** ${insights.overall_performance.averageClickThroughRate}%
- **Total Conversions:** ${insights.overall_performance.totalConversions}
- **Total Revenue:** $${insights.overall_performance.totalRevenue}

## Top Performers

${insights.top_performers.posts.map((p, i) => `${i + 1}. Post ${p.postId} (${p.platform}): ${p.engagement.engagementRate}% ER`).join("\n")}

**Why They Worked:**
${insights.top_performers.common_patterns.map((p) => `- ${p}`).join("\n")}

## Areas for Improvement

**Common Issues:**
${insights.underperformers.common_issues.map((i) => `- ${i}`).join("\n")}

## Platform Insights

${Object.entries(insights.platform_insights)
  .map(
    ([platform, data]) => `
### ${platform.charAt(0).toUpperCase() + platform.slice(1)}

- Avg Engagement: ${data.avg_engagement_rate}% (${data.vs_target})
- Best Post Type: ${data.best_post_type}
`,
  )
  .join("\n")}

## Recommendations

${insights.recommendations.map((r, i) => `${i + 1}. [${r.priority.toUpperCase()}] ${r.action}\n   Expected Impact: ${r.expected_impact}`).join("\n\n")}
`;

  return report;
}
