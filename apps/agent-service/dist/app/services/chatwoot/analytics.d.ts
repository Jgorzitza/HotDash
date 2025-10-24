/**
 * Chatwoot Conversation Analytics Service
 *
 * Analyzes Chatwoot conversations for:
 * - Response time, resolution time
 * - CSAT (Customer Satisfaction)
 * - Common issues identification
 * - Peak hours analysis
 *
 * SUPPORT-004
 */
export interface AnalyticsReport {
    period: {
        start: string;
        end: string;
    };
    response_time: ResponseTimeMetrics;
    resolution_time: ResolutionTimeMetrics;
    csat: CSATMetrics;
    common_issues: CommonIssue[];
    peak_hours: PeakHoursAnalysis;
    conversation_volume: VolumeMetrics;
}
export interface ResponseTimeMetrics {
    avg_minutes: number;
    median_minutes: number;
    p90_minutes: number;
    p95_minutes: number;
    p99_minutes: number;
    under_15min: number;
    over_1hour: number;
}
export interface ResolutionTimeMetrics {
    avg_hours: number;
    median_hours: number;
    p90_hours: number;
    under_4hours: number;
    under_24hours: number;
    over_24hours: number;
}
export interface CSATMetrics {
    total_responses: number;
    avg_score: number;
    score_distribution: {
        score: number;
        count: number;
        percentage: number;
    }[];
    positive_percentage: number;
    negative_percentage: number;
}
export interface CommonIssue {
    category: string;
    count: number;
    percentage: number;
    sample_conversations: number[];
    keywords: string[];
}
export interface PeakHoursAnalysis {
    hourly_distribution: {
        hour: number;
        count: number;
        avg_response_time_minutes: number;
    }[];
    daily_distribution: {
        day: string;
        count: number;
        avg_response_time_minutes: number;
    }[];
    peak_hour: {
        hour: number;
        count: number;
    };
    peak_day: {
        day: string;
        count: number;
    };
}
export interface VolumeMetrics {
    total_conversations: number;
    new_conversations: number;
    resolved_conversations: number;
    open_conversations: number;
    avg_per_day: number;
}
/**
 * Generate analytics report for a time period
 */
export declare function generateAnalyticsReport(startDate: Date, endDate: Date): Promise<AnalyticsReport>;
//# sourceMappingURL=analytics.d.ts.map