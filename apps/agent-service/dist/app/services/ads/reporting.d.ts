/**
 * Ads Reporting Automation Service
 *
 * Generates weekly ad performance reports combining Google Ads and Facebook Ads data.
 * Provides cross-platform analytics and insights.
 *
 * @module app/services/ads/reporting
 */
import type { CampaignPerformance } from "./types";
import type { FacebookCampaignPerformance } from "./facebook-ads-client";
/**
 * Weekly Report
 */
export interface WeeklyReport {
    weekStarting: string;
    weekEnding: string;
    platforms: {
        google: PlatformReport;
        facebook: PlatformReport;
    };
    combined: CombinedReport;
    topPerformers: CampaignHighlight[];
    recommendations: string[];
    generatedAt: string;
}
/**
 * Platform Report
 */
export interface PlatformReport {
    totalSpend: number;
    totalConversions: number;
    totalImpressions: number;
    totalClicks: number;
    avgRoas: number | null;
    avgCtr: number;
    avgCpc: number;
    campaignCount: number;
}
/**
 * Combined Cross-Platform Report
 */
export interface CombinedReport {
    totalSpend: number;
    totalConversions: number;
    totalRevenue: number;
    overallRoas: number | null;
    totalImpressions: number;
    totalClicks: number;
    avgCtr: number;
    costPerConversion: number;
}
/**
 * Campaign Highlight
 */
export interface CampaignHighlight {
    platform: "google" | "facebook";
    campaignId: string;
    campaignName: string;
    metric: "roas" | "conversions" | "ctr";
    value: number;
    spend: number;
}
/**
 * Generate weekly ad performance report
 *
 * @param googlePerformances - Google Ads campaign performance data
 * @param facebookPerformances - Facebook Ads campaign performance data
 * @param weekStarting - Start date (ISO format)
 * @param weekEnding - End date (ISO format)
 * @returns WeeklyReport object
 */
export declare function generateWeeklyReport(googlePerformances: CampaignPerformance[], facebookPerformances: FacebookCampaignPerformance[], weekStarting: string, weekEnding: string): WeeklyReport;
/**
 * Format weekly report as markdown
 *
 * @param report - Weekly report data
 * @returns Markdown-formatted report
 */
export declare function formatReportAsMarkdown(report: WeeklyReport): string;
/**
 * Format weekly report as JSON for API consumption
 *
 * @param report - Weekly report data
 * @returns JSON-formatted report
 */
export declare function formatReportAsJson(report: WeeklyReport): string;
/**
 * Export functions for external use
 */
export { generateWeeklyReport as default };
//# sourceMappingURL=reporting.d.ts.map