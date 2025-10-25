/**
 * Ad Creative Recommendations Service
 *
 * Generates recommendations for ad creative optimization based on
 * similar high-performing creatives found via image search.
 *
 * Part of ADS-IMAGE-SEARCH-001: Use Image Search for Ad Creative Optimization
 *
 * @module app/services/ads/creative-recommendations
 */
/**
 * Default recommendation thresholds
 */
export const DEFAULT_THRESHOLDS = {
    exceptional: {
        minRoas: 4.0,
        minCtr: 0.05,
        minConversions: 10,
    },
    strong: {
        minRoas: 2.5,
        minCtr: 0.03,
        minConversions: 5,
    },
    good: {
        minRoas: 2.0,
        minCtr: 0.02,
        minConversions: 3,
    },
    minSimilarity: 0.7,
};
/**
 * Generate recommendation for a similar creative
 *
 * @param creative - Similar creative from image search
 * @param thresholds - Custom thresholds (optional)
 * @returns Ad creative recommendation
 */
export function generateRecommendation(creative, thresholds = DEFAULT_THRESHOLDS) {
    const { roas, ctr, conversions, spend } = creative.performance;
    // Determine recommendation action based on performance
    let action;
    let reason;
    let projectedImpact;
    let suggestedBudget;
    let confidence;
    // Check for exceptional performance
    if (roas >= thresholds.exceptional.minRoas &&
        ctr >= thresholds.exceptional.minCtr &&
        conversions >= thresholds.exceptional.minConversions) {
        action = 'replicate';
        reason = `Exceptional performance: ${roas.toFixed(1)}x ROAS, ${(ctr * 100).toFixed(2)}% CTR, ${conversions} conversions`;
        const projectedRevenue = (roas * spend) / 100;
        const projectedSpend = spend * 1.5 / 100; // 50% more budget
        projectedImpact = `Similar creative could generate $${projectedRevenue.toFixed(2)} revenue with $${projectedSpend.toFixed(2)}/day spend`;
        suggestedBudget = Math.round(spend * 1.5); // 50% more budget
        confidence = Math.min(0.95, creative.similarity * 1.1); // High confidence
    }
    // Check for strong performance
    else if (roas >= thresholds.strong.minRoas &&
        ctr >= thresholds.strong.minCtr &&
        conversions >= thresholds.strong.minConversions) {
        action = 'test_variation';
        reason = `Strong performance: ${roas.toFixed(1)}x ROAS, ${(ctr * 100).toFixed(2)}% CTR, ${conversions} conversions`;
        projectedImpact = `Test variations to optimize further. Current creative shows strong potential.`;
        suggestedBudget = spend; // Same budget for testing
        confidence = Math.min(0.85, creative.similarity * 1.0);
    }
    // Check for good performance
    else if (roas >= thresholds.good.minRoas &&
        ctr >= thresholds.good.minCtr &&
        conversions >= thresholds.good.minConversions) {
        action = 'scale_budget';
        reason = `Good performance: ${roas.toFixed(1)}x ROAS, ${(ctr * 100).toFixed(2)}% CTR`;
        projectedImpact = `Increase budget to scale winning creative. Positive ROAS indicates profitability.`;
        suggestedBudget = Math.round(spend * 1.25); // 25% more budget
        confidence = Math.min(0.75, creative.similarity * 0.9);
    }
    // Below thresholds - analyze further
    else {
        action = 'analyze_further';
        reason = `Performance below thresholds: ${roas.toFixed(1)}x ROAS, ${(ctr * 100).toFixed(2)}% CTR`;
        projectedImpact = `Review creative elements and targeting before scaling. Consider A/B testing.`;
        confidence = creative.similarity * 0.7;
    }
    return {
        imageId: creative.imageId,
        imageUrl: creative.imageUrl,
        thumbnailUrl: creative.thumbnailUrl,
        similarity: creative.similarity,
        performance: creative.performance,
        recommendation: {
            action,
            reason,
            projectedImpact,
            suggestedBudget,
            confidence,
        },
    };
}
/**
 * Generate recommendations for multiple similar creatives
 *
 * @param creatives - Array of similar creatives
 * @param thresholds - Custom thresholds (optional)
 * @returns Array of recommendations sorted by confidence
 */
export function generateRecommendations(creatives, thresholds = DEFAULT_THRESHOLDS) {
    const recommendations = creatives
        .filter(c => c.similarity >= thresholds.minSimilarity)
        .map(c => generateRecommendation(c, thresholds))
        .sort((a, b) => b.recommendation.confidence - a.recommendation.confidence);
    return recommendations;
}
/**
 * Calculate performance statistics for a set of creatives
 *
 * @param creatives - Array of similar creatives
 * @returns Performance statistics
 */
export function calculatePerformanceStats(creatives) {
    if (creatives.length === 0) {
        return {
            totalCreatives: 0,
            totalImpressions: 0,
            totalClicks: 0,
            totalConversions: 0,
            totalSpend: 0,
            totalRevenue: 0,
            averageRoas: 0,
            averageCtr: 0,
            averageCpc: 0,
            topPerformers: [],
        };
    }
    const totals = creatives.reduce((acc, creative) => ({
        impressions: acc.impressions + creative.performance.impressions,
        clicks: acc.clicks + creative.performance.clicks,
        conversions: acc.conversions + creative.performance.conversions,
        spend: acc.spend + creative.performance.spend,
        revenue: acc.revenue + creative.performance.revenue,
    }), { impressions: 0, clicks: 0, conversions: 0, spend: 0, revenue: 0 });
    const averageRoas = totals.revenue / totals.spend;
    const averageCtr = totals.clicks / totals.impressions;
    const averageCpc = totals.spend / totals.clicks;
    // Get top 5 performers by ROAS
    const topPerformers = creatives
        .map(c => ({
        imageId: c.imageId,
        roas: c.performance.roas,
        ctr: c.performance.ctr,
    }))
        .sort((a, b) => b.roas - a.roas)
        .slice(0, 5);
    return {
        totalCreatives: creatives.length,
        totalImpressions: totals.impressions,
        totalClicks: totals.clicks,
        totalConversions: totals.conversions,
        totalSpend: totals.spend,
        totalRevenue: totals.revenue,
        averageRoas,
        averageCtr,
        averageCpc,
        topPerformers,
    };
}
/**
 * Generate optimization insights from creative performance patterns
 *
 * @param creatives - Array of similar creatives
 * @returns Array of optimization insights
 */
export function generateOptimizationInsights(creatives) {
    const insights = [];
    if (creatives.length < 5) {
        // Not enough data for meaningful insights
        return insights;
    }
    // Analyze by format
    const formatGroups = groupBy(creatives, c => c.performance.format);
    const formatInsight = analyzeGroup(formatGroups, 'format');
    if (formatInsight)
        insights.push(formatInsight);
    // Analyze by placement
    const placementGroups = groupBy(creatives, c => c.performance.placement);
    const placementInsight = analyzeGroup(placementGroups, 'placement');
    if (placementInsight)
        insights.push(placementInsight);
    // Analyze by platform
    const platformGroups = groupBy(creatives, c => c.performance.platform);
    const platformInsight = analyzeGroup(platformGroups, 'platform');
    if (platformInsight)
        insights.push(platformInsight);
    return insights;
}
/**
 * Helper: Group creatives by a key function
 */
function groupBy(items, keyFn) {
    return items.reduce((acc, item) => {
        const key = keyFn(item);
        if (!acc[key])
            acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});
}
/**
 * Helper: Analyze a group of creatives for insights
 */
function analyzeGroup(groups, type) {
    const groupKeys = Object.keys(groups);
    if (groupKeys.length < 2)
        return null;
    // Calculate average ROAS for each group
    const groupStats = groupKeys.map(key => {
        const creatives = groups[key];
        const avgRoas = creatives.reduce((sum, c) => sum + c.performance.roas, 0) / creatives.length;
        return { key, avgRoas, count: creatives.length };
    });
    // Find best and worst performing groups
    const sorted = groupStats.sort((a, b) => b.avgRoas - a.avgRoas);
    const best = sorted[0];
    const worst = sorted[sorted.length - 1];
    // Only generate insight if there's a significant difference (>20% lift)
    const lift = ((best.avgRoas - worst.avgRoas) / worst.avgRoas) * 100;
    if (lift < 20)
        return null;
    const overallAvg = groupStats.reduce((sum, g) => sum + g.avgRoas, 0) / groupStats.length;
    return {
        type,
        insight: `${best.key} ${type} performs ${lift.toFixed(0)}% better than ${worst.key}`,
        evidence: {
            sampleSize: best.count + worst.count,
            averageRoas: best.avgRoas,
            comparisonRoas: worst.avgRoas,
            lift,
        },
        recommendation: `Focus on ${best.key} ${type} for better performance. Consider reallocating budget from ${worst.key}.`,
    };
}
//# sourceMappingURL=creative-recommendations.js.map