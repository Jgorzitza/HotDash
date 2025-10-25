/**
 * Ads Reporting Automation Service
 *
 * Generates weekly ad performance reports combining Google Ads and Facebook Ads data.
 * Provides cross-platform analytics and insights.
 *
 * @module app/services/ads/reporting
 */
import { calculateROAS } from "../../lib/ads/metrics";
/**
 * Generate weekly ad performance report
 *
 * @param googlePerformances - Google Ads campaign performance data
 * @param facebookPerformances - Facebook Ads campaign performance data
 * @param weekStarting - Start date (ISO format)
 * @param weekEnding - End date (ISO format)
 * @returns WeeklyReport object
 */
export function generateWeeklyReport(googlePerformances, facebookPerformances, weekStarting, weekEnding) {
    // Calculate Google Ads platform report
    const googleReport = calculatePlatformReport(googlePerformances.map((p) => ({
        spend: p.costCents,
        conversions: p.conversions,
        impressions: p.impressions,
        clicks: p.clicks,
        revenue: p.revenueCents,
    })));
    // Calculate Facebook Ads platform report
    const facebookReport = calculatePlatformReport(facebookPerformances.map((p) => ({
        spend: p.spend,
        conversions: p.conversions,
        impressions: p.impressions,
        clicks: p.clicks,
        revenue: p.conversionValue,
    })));
    // Calculate combined metrics
    const totalSpend = googleReport.totalSpend + facebookReport.totalSpend;
    const totalConversions = googleReport.totalConversions + facebookReport.totalConversions;
    const totalImpressions = googleReport.totalImpressions + facebookReport.totalImpressions;
    const totalClicks = googleReport.totalClicks + facebookReport.totalClicks;
    const googleRevenue = googlePerformances.reduce((sum, p) => sum + p.revenueCents, 0);
    const facebookRevenue = facebookPerformances.reduce((sum, p) => sum + p.conversionValue, 0);
    const totalRevenue = googleRevenue + facebookRevenue;
    const overallRoas = calculateROAS(totalRevenue, totalSpend);
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const costPerConversion = totalConversions > 0 ? totalSpend / totalConversions : 0;
    // Identify top performers
    const topPerformers = identifyTopPerformers(googlePerformances, facebookPerformances);
    // Generate recommendations
    const recommendations = generateRecommendations(googleReport, facebookReport, topPerformers);
    return {
        weekStarting,
        weekEnding,
        platforms: {
            google: googleReport,
            facebook: facebookReport,
        },
        combined: {
            totalSpend,
            totalConversions,
            totalRevenue,
            overallRoas,
            totalImpressions,
            totalClicks,
            avgCtr,
            costPerConversion,
        },
        topPerformers,
        recommendations,
        generatedAt: new Date().toISOString(),
    };
}
/**
 * Calculate platform-specific report metrics
 */
function calculatePlatformReport(campaigns) {
    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
    const avgRoas = calculateROAS(totalRevenue, totalSpend);
    const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    return {
        totalSpend,
        totalConversions,
        totalImpressions,
        totalClicks,
        avgRoas,
        avgCtr,
        avgCpc,
        campaignCount: campaigns.length,
    };
}
/**
 * Identify top 5 performing campaigns across platforms
 */
function identifyTopPerformers(googlePerformances, facebookPerformances) {
    const highlights = [];
    // Top ROAS - Google
    const googleByRoas = [...googlePerformances]
        .map((p) => ({
        platform: "google",
        campaignId: p.campaignId,
        campaignName: p.campaignName,
        metric: "roas",
        value: calculateROAS(p.revenueCents, p.costCents) || 0,
        spend: p.costCents,
    }))
        .sort((a, b) => b.value - a.value);
    if (googleByRoas.length > 0) {
        highlights.push(googleByRoas[0]);
    }
    // Top ROAS - Facebook
    const facebookByRoas = [...facebookPerformances]
        .map((p) => ({
        platform: "facebook",
        campaignId: p.campaignId,
        campaignName: p.campaignName,
        metric: "roas",
        value: calculateROAS(p.conversionValue, p.spend) || 0,
        spend: p.spend,
    }))
        .sort((a, b) => b.value - a.value);
    if (facebookByRoas.length > 0) {
        highlights.push(facebookByRoas[0]);
    }
    // Top conversions - Google
    const googleByConversions = [...googlePerformances]
        .map((p) => ({
        platform: "google",
        campaignId: p.campaignId,
        campaignName: p.campaignName,
        metric: "conversions",
        value: p.conversions,
        spend: p.costCents,
    }))
        .sort((a, b) => b.value - a.value);
    if (googleByConversions.length > 0) {
        highlights.push(googleByConversions[0]);
    }
    // Top CTR - Facebook
    const facebookByCtr = [...facebookPerformances]
        .map((p) => ({
        platform: "facebook",
        campaignId: p.campaignId,
        campaignName: p.campaignName,
        metric: "ctr",
        value: p.ctr,
        spend: p.spend,
    }))
        .sort((a, b) => b.value - a.value);
    if (facebookByCtr.length > 0) {
        highlights.push(facebookByCtr[0]);
    }
    return highlights.slice(0, 5);
}
/**
 * Generate recommendations based on performance data
 */
function generateRecommendations(googleReport, facebookReport, topPerformers) {
    const recommendations = [];
    // Compare platforms
    if (googleReport.avgRoas !== null && facebookReport.avgRoas !== null) {
        if (googleReport.avgRoas > facebookReport.avgRoas * 1.5) {
            recommendations.push(`Google Ads ROAS (${googleReport.avgRoas.toFixed(2)}x) significantly outperforms Facebook (${facebookReport.avgRoas.toFixed(2)}x). Consider shifting budget to Google Ads.`);
        }
        else if (facebookReport.avgRoas > googleReport.avgRoas * 1.5) {
            recommendations.push(`Facebook Ads ROAS (${facebookReport.avgRoas.toFixed(2)}x) significantly outperforms Google (${googleReport.avgRoas.toFixed(2)}x). Consider shifting budget to Facebook Ads.`);
        }
    }
    // CTR recommendations
    const googleCtrPercent = googleReport.avgCtr * 100;
    const facebookCtrPercent = facebookReport.avgCtr * 100;
    if (googleCtrPercent < 1.0) {
        recommendations.push(`Google Ads CTR (${googleCtrPercent.toFixed(2)}%) is below industry average. Review ad copy and targeting.`);
    }
    if (facebookCtrPercent < 1.0) {
        recommendations.push(`Facebook Ads CTR (${facebookCtrPercent.toFixed(2)}%) is low. Consider refreshing ad creatives.`);
    }
    // Budget allocation
    const totalSpend = googleReport.totalSpend + facebookReport.totalSpend;
    if (totalSpend > 0) {
        const googleSpendPercent = (googleReport.totalSpend / totalSpend) * 100;
        const facebookSpendPercent = (facebookReport.totalSpend / totalSpend) * 100;
        if (googleSpendPercent > 70) {
            recommendations.push(`${googleSpendPercent.toFixed(0)}% of budget on Google Ads. Consider diversifying to Facebook for broader reach.`);
        }
        else if (facebookSpendPercent > 70) {
            recommendations.push(`${facebookSpendPercent.toFixed(0)}% of budget on Facebook Ads. Consider Google Ads for intent-based targeting.`);
        }
    }
    // Top performer insights
    if (topPerformers.length > 0) {
        const topRoasPerformer = topPerformers.find((p) => p.metric === "roas");
        if (topRoasPerformer && topRoasPerformer.value > 3.0) {
            recommendations.push(`"${topRoasPerformer.campaignName}" (${topRoasPerformer.platform}) has exceptional ROAS (${topRoasPerformer.value.toFixed(2)}x). Scale up budget.`);
        }
    }
    // Conversion efficiency
    const googleCostPerConversion = googleReport.totalConversions > 0
        ? googleReport.totalSpend / googleReport.totalConversions
        : 0;
    const facebookCostPerConversion = facebookReport.totalConversions > 0
        ? facebookReport.totalSpend / facebookReport.totalConversions
        : 0;
    if (googleCostPerConversion > 0 && facebookCostPerConversion > 0) {
        if (googleCostPerConversion < facebookCostPerConversion * 0.7) {
            recommendations.push(`Google Ads cost per conversion ($${(googleCostPerConversion / 100).toFixed(2)}) is more efficient than Facebook ($${(facebookCostPerConversion / 100).toFixed(2)}). Prioritize Google for conversions.`);
        }
        else if (facebookCostPerConversion < googleCostPerConversion * 0.7) {
            recommendations.push(`Facebook Ads cost per conversion ($${(facebookCostPerConversion / 100).toFixed(2)}) is more efficient than Google ($${(googleCostPerConversion / 100).toFixed(2)}). Prioritize Facebook for conversions.`);
        }
    }
    return recommendations;
}
/**
 * Format weekly report as markdown
 *
 * @param report - Weekly report data
 * @returns Markdown-formatted report
 */
export function formatReportAsMarkdown(report) {
    const lines = [];
    lines.push(`# Weekly Ad Performance Report`);
    lines.push(`**Week**: ${report.weekStarting} to ${report.weekEnding}`);
    lines.push(`**Generated**: ${new Date(report.generatedAt).toLocaleDateString()}`);
    lines.push(``);
    // Combined summary
    lines.push(`## 📊 Summary`);
    lines.push(``);
    lines.push(`- **Total Spend**: $${(report.combined.totalSpend / 100).toFixed(2)}`);
    lines.push(`- **Total Conversions**: ${report.combined.totalConversions}`);
    lines.push(`- **Total Revenue**: $${(report.combined.totalRevenue / 100).toFixed(2)}`);
    lines.push(`- **Overall ROAS**: ${report.combined.overallRoas !== null ? report.combined.overallRoas.toFixed(2) + "x" : "N/A"}`);
    lines.push(`- **Cost Per Conversion**: $${(report.combined.costPerConversion / 100).toFixed(2)}`);
    lines.push(``);
    // Platform comparison
    lines.push(`## 🔀 Platform Comparison`);
    lines.push(``);
    lines.push(`| Metric | Google Ads | Facebook Ads |`);
    lines.push(`|--------|------------|--------------|`);
    lines.push(`| Spend | $${(report.platforms.google.totalSpend / 100).toFixed(2)} | $${(report.platforms.facebook.totalSpend / 100).toFixed(2)} |`);
    lines.push(`| Conversions | ${report.platforms.google.totalConversions} | ${report.platforms.facebook.totalConversions} |`);
    lines.push(`| ROAS | ${report.platforms.google.avgRoas !== null ? report.platforms.google.avgRoas.toFixed(2) + "x" : "N/A"} | ${report.platforms.facebook.avgRoas !== null ? report.platforms.facebook.avgRoas.toFixed(2) + "x" : "N/A"} |`);
    lines.push(`| CTR | ${(report.platforms.google.avgCtr * 100).toFixed(2)}% | ${(report.platforms.facebook.avgCtr * 100).toFixed(2)}% |`);
    lines.push(`| Avg CPC | $${(report.platforms.google.avgCpc / 100).toFixed(2)} | $${(report.platforms.facebook.avgCpc / 100).toFixed(2)} |`);
    lines.push(`| Campaigns | ${report.platforms.google.campaignCount} | ${report.platforms.facebook.campaignCount} |`);
    lines.push(``);
    // Top performers
    if (report.topPerformers.length > 0) {
        lines.push(`## 🏆 Top Performers`);
        lines.push(``);
        for (const performer of report.topPerformers) {
            const platform = performer.platform === "google" ? "🔍 Google" : "📘 Facebook";
            const metric = performer.metric.toUpperCase();
            let value = "";
            if (performer.metric === "roas") {
                value = `${performer.value.toFixed(2)}x`;
            }
            else if (performer.metric === "ctr") {
                value = `${(performer.value * 100).toFixed(2)}%`;
            }
            else {
                value = performer.value.toString();
            }
            lines.push(`- **${platform}**: ${performer.campaignName}`);
            lines.push(`  - ${metric}: ${value}`);
            lines.push(`  - Spend: $${(performer.spend / 100).toFixed(2)}`);
            lines.push(``);
        }
    }
    // Recommendations
    if (report.recommendations.length > 0) {
        lines.push(`## 💡 Recommendations`);
        lines.push(``);
        for (let i = 0; i < report.recommendations.length; i++) {
            lines.push(`${i + 1}. ${report.recommendations[i]}`);
        }
        lines.push(``);
    }
    return lines.join("\n");
}
/**
 * Format weekly report as JSON for API consumption
 *
 * @param report - Weekly report data
 * @returns JSON-formatted report
 */
export function formatReportAsJson(report) {
    return JSON.stringify(report, null, 2);
}
/**
 * Export functions for external use
 */
export { generateWeeklyReport as default };
//# sourceMappingURL=reporting.js.map