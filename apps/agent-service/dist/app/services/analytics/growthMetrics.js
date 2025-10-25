/**
 * Growth Dashboard Metrics Service
 *
 * ANALYTICS-009: CTR, impressions, conversions tracking for growth metrics
 *
 * Features:
 * - Track click-through rates (CTR)
 * - Monitor impressions and reach
 * - Calculate conversion rates
 * - Generate growth performance insights
 */
/**
 * Calculate growth metrics from raw data
 *
 * ANALYTICS-009: Core function for growth metrics calculation
 *
 * @param channelData - Array of channel performance data
 * @param startDate - Analysis start date
 * @param endDate - Analysis end date
 * @param previousMetrics - Previous period metrics for comparison
 * @returns Complete growth metrics
 */
export function calculateGrowthMetrics(channelData, startDate, endDate, previousMetrics) {
    // Calculate totals
    const totalImpressions = channelData.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = channelData.reduce((sum, c) => sum + c.clicks, 0);
    const totalConversions = channelData.reduce((sum, c) => sum + c.conversions, 0);
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
    // Calculate channel metrics
    const channels = channelData.map(channel => ({
        channel: channel.channel,
        impressions: channel.impressions,
        clicks: channel.clicks,
        conversions: channel.conversions,
        ctr: channel.impressions > 0 ? (channel.clicks / channel.impressions) * 100 : 0,
        conversionRate: channel.clicks > 0 ? (channel.conversions / channel.clicks) * 100 : 0,
        revenue: channel.revenue,
    }));
    // Find top performers
    const topPerformers = channels
        .filter(c => c.clicks > 0) // Only channels with clicks
        .sort((a, b) => (b.ctr + b.conversionRate) - (a.ctr + a.conversionRate))
        .slice(0, 5)
        .map(c => ({
        channel: c.channel,
        ctr: Math.round(c.ctr * 100) / 100,
        conversionRate: Math.round(c.conversionRate * 100) / 100,
        revenue: c.revenue,
    }));
    // Calculate trends vs previous period
    let trends = {
        impressionsChange: 0,
        clicksChange: 0,
        conversionsChange: 0,
        ctrChange: 0,
        conversionRateChange: 0,
    };
    if (previousMetrics) {
        trends = {
            impressionsChange: calculatePercentageChange(totalImpressions, previousMetrics.traffic.totalImpressions),
            clicksChange: calculatePercentageChange(totalClicks, previousMetrics.traffic.totalClicks),
            conversionsChange: calculatePercentageChange(totalConversions, previousMetrics.traffic.totalConversions),
            ctrChange: calculatePercentageChange(ctr, previousMetrics.traffic.ctr),
            conversionRateChange: calculatePercentageChange(conversionRate, previousMetrics.traffic.conversionRate),
        };
    }
    return {
        period: { start: startDate, end: endDate },
        traffic: {
            totalImpressions,
            totalClicks,
            totalConversions,
            ctr: Math.round(ctr * 100) / 100,
            conversionRate: Math.round(conversionRate * 100) / 100,
        },
        channels,
        trends,
        topPerformers,
    };
}
/**
 * Generate growth insights and recommendations
 *
 * ANALYTICS-009: Analyze growth metrics and provide actionable insights
 *
 * @param metrics - Growth metrics
 * @returns Growth insights and recommendations
 */
export function generateGrowthInsights(metrics) {
    const insights = [];
    const recommendations = [];
    const opportunities = [];
    // Analyze overall performance
    let overallPerformance = 'average';
    if (metrics.traffic.ctr >= 3 && metrics.traffic.conversionRate >= 5) {
        overallPerformance = 'excellent';
        insights.push('Excellent performance with high CTR and conversion rates');
    }
    else if (metrics.traffic.ctr >= 2 && metrics.traffic.conversionRate >= 3) {
        overallPerformance = 'good';
        insights.push('Good performance with solid CTR and conversion rates');
    }
    else if (metrics.traffic.ctr >= 1 && metrics.traffic.conversionRate >= 2) {
        overallPerformance = 'average';
        insights.push('Average performance with room for improvement');
    }
    else {
        overallPerformance = 'poor';
        insights.push('Performance needs significant improvement');
    }
    // Analyze trends
    if (metrics.trends.ctrChange > 10) {
        insights.push(`CTR improved by ${metrics.trends.ctrChange.toFixed(1)}% - great momentum!`);
    }
    else if (metrics.trends.ctrChange < -10) {
        insights.push(`CTR declined by ${Math.abs(metrics.trends.ctrChange).toFixed(1)}% - needs attention`);
        recommendations.push('Review ad creative and targeting to improve CTR');
    }
    if (metrics.trends.conversionRateChange > 10) {
        insights.push(`Conversion rate improved by ${metrics.trends.conversionRateChange.toFixed(1)}%`);
    }
    else if (metrics.trends.conversionRateChange < -10) {
        insights.push(`Conversion rate declined by ${Math.abs(metrics.trends.conversionRateChange).toFixed(1)}%`);
        recommendations.push('Optimize landing pages and user experience to improve conversions');
    }
    // Analyze channel performance
    metrics.channels.forEach(channel => {
        if (channel.ctr < 1 && channel.clicks > 100) {
            opportunities.push({
                channel: channel.channel,
                potential: 50, // 50% improvement potential
                reason: 'Low CTR indicates targeting or creative issues',
            });
            recommendations.push(`Optimize ${channel.channel} targeting and creative for better CTR`);
        }
        if (channel.conversionRate < 2 && channel.clicks > 50) {
            opportunities.push({
                channel: channel.channel,
                potential: 30, // 30% improvement potential
                reason: 'Low conversion rate suggests landing page issues',
            });
            recommendations.push(`Improve ${channel.channel} landing page experience`);
        }
        if (channel.ctr > 3 && channel.conversionRate > 5) {
            insights.push(`${channel.channel} is performing excellently with ${channel.ctr.toFixed(1)}% CTR and ${channel.conversionRate.toFixed(1)}% conversion rate`);
            recommendations.push(`Scale up ${channel.channel} budget to capitalize on strong performance`);
        }
    });
    // Top performer insights
    if (metrics.topPerformers.length > 0) {
        const topPerformer = metrics.topPerformers[0];
        insights.push(`${topPerformer.channel} is your top performer with ${topPerformer.ctr}% CTR and ${topPerformer.conversionRate}% conversion rate`);
    }
    return {
        overallPerformance,
        keyInsights: insights,
        recommendations,
        opportunities,
    };
}
/**
 * Calculate percentage change between two values
 */
function calculatePercentageChange(current, previous) {
    if (previous === 0) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
}
/**
 * Export growth metrics for dashboard
 *
 * ANALYTICS-009: Format growth data for dashboard display
 *
 * @param metrics - Growth metrics
 * @param insights - Growth insights
 * @returns Dashboard-ready growth data
 */
export function exportGrowthMetrics(metrics, insights) {
    return {
        summary: {
            impressions: metrics.traffic.totalImpressions,
            clicks: metrics.traffic.totalClicks,
            conversions: metrics.traffic.totalConversions,
            ctr: metrics.traffic.ctr,
            conversionRate: metrics.traffic.conversionRate,
            performance: insights.overallPerformance,
        },
        trends: {
            impressionsChange: metrics.trends.impressionsChange,
            clicksChange: metrics.trends.clicksChange,
            conversionsChange: metrics.trends.conversionsChange,
            ctrChange: metrics.trends.ctrChange,
            conversionRateChange: metrics.trends.conversionRateChange,
        },
        channels: metrics.channels.map(c => ({
            name: c.channel,
            impressions: c.impressions,
            clicks: c.clicks,
            conversions: c.conversions,
            ctr: c.ctr,
            conversionRate: c.conversionRate,
            revenue: c.revenue,
        })),
        topPerformers: metrics.topPerformers,
        insights: insights.keyInsights,
        recommendations: insights.recommendations,
        opportunities: insights.opportunities,
        period: metrics.period,
    };
}
/**
 * Calculate growth efficiency score
 *
 * ANALYTICS-009: Overall growth performance score
 *
 * @param metrics - Growth metrics
 * @returns Efficiency score (0-100)
 */
export function calculateGrowthEfficiencyScore(metrics) {
    let score = 0;
    // CTR score (0-40 points)
    if (metrics.traffic.ctr >= 3) {
        score += 40;
    }
    else if (metrics.traffic.ctr >= 2) {
        score += 30;
    }
    else if (metrics.traffic.ctr >= 1) {
        score += 20;
    }
    else {
        score += 10;
    }
    // Conversion rate score (0-40 points)
    if (metrics.traffic.conversionRate >= 5) {
        score += 40;
    }
    else if (metrics.traffic.conversionRate >= 3) {
        score += 30;
    }
    else if (metrics.traffic.conversionRate >= 2) {
        score += 20;
    }
    else {
        score += 10;
    }
    // Trend bonus/penalty (0-20 points)
    const trendScore = (metrics.trends.ctrChange + metrics.trends.conversionRateChange) / 2;
    if (trendScore > 0) {
        score += Math.min(trendScore, 20);
    }
    else {
        score += Math.max(trendScore, -20);
    }
    return Math.max(0, Math.min(100, Math.round(score)));
}
//# sourceMappingURL=growthMetrics.js.map