/**
 * Scheduled Analytics Reports Service
 *
 * Generates daily/weekly/monthly reports
 * Email-ready templates for Phase 11 integration
 * Report templates with key metrics and insights
 */
export type ReportFrequency = "daily" | "weekly" | "monthly";
export interface ScheduledReport {
    reportId: string;
    reportType: ReportFrequency;
    shopDomain: string;
    generatedAt: Date;
    period: {
        start: Date;
        end: Date;
    };
    metrics: {
        impressions: number;
        clicks: number;
        conversions: number;
        revenue: number;
        ctr: number;
        conversionRate: number;
        roas: number;
    };
    highlights: string[];
    anomalies: number;
    forecast: {
        trend: string;
        prediction: number;
    };
    emailTemplate: {
        subject: string;
        body: string;
        html: string;
    };
}
/**
 * Generate daily analytics report
 */
export declare function generateDailyReport(shopDomain?: string): Promise<ScheduledReport>;
/**
 * Generate weekly analytics report
 */
export declare function generateWeeklyReport(shopDomain?: string): Promise<ScheduledReport>;
/**
 * Generate monthly analytics report
 */
export declare function generateMonthlyReport(shopDomain?: string): Promise<ScheduledReport>;
//# sourceMappingURL=scheduled-reports.d.ts.map