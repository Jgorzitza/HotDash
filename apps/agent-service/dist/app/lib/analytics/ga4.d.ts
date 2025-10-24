/**
 * GA4 Analytics Library
 *
 * Provides high-level analytics data for dashboard tiles:
 * - Revenue metrics (last 30 days, trends)
 * - Traffic metrics (sessions, organic traffic)
 * - Conversion metrics (conversion rate, transactions)
 *
 * Uses the existing GA4 Direct API client for data fetching.
 */
export interface RevenueMetrics {
    totalRevenue: number;
    averageOrderValue: number;
    transactions: number;
    trend: {
        revenueChange: number;
        aovChange: number;
        transactionsChange: number;
    };
    period: {
        start: string;
        end: string;
    };
}
export interface TrafficMetrics {
    totalSessions: number;
    organicSessions: number;
    organicPercentage: number;
    trend: {
        sessionsChange: number;
        organicChange: number;
    };
    period: {
        start: string;
        end: string;
    };
}
export interface ConversionMetrics {
    conversionRate: number;
    transactions: number;
    revenue: number;
    trend: {
        conversionRateChange: number;
    };
    period: {
        start: string;
        end: string;
    };
}
/**
 * Fetch revenue metrics for the last 30 days with trend comparison
 */
export declare function getRevenueMetrics(): Promise<RevenueMetrics>;
/**
 * Fetch traffic metrics for the last 30 days with trend comparison
 */
export declare function getTrafficMetrics(): Promise<TrafficMetrics>;
/**
 * Fetch conversion metrics for the last 30 days with trend comparison
 */
export declare function getConversionMetrics(): Promise<ConversionMetrics>;
export interface ChannelMetrics {
    channel: string;
    sessions: number;
    users: number;
    engagedSessions: number;
    averageSessionDuration: number;
    bounceRate: number;
    sessionsPerUser: number;
    trend: {
        sessionsChange: number;
        usersChange: number;
    };
}
export interface TrafficBreakdown {
    channels: ChannelMetrics[];
    totalSessions: number;
    totalUsers: number;
    period: {
        start: string;
        end: string;
    };
}
/**
 * Fetch detailed traffic breakdown by channel for the last 30 days
 */
export declare function getTrafficBreakdown(): Promise<TrafficBreakdown>;
//# sourceMappingURL=ga4.d.ts.map