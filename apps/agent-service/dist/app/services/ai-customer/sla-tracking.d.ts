/**
 * AI-Customer SLA Tracking Service
 *
 * Tracks Service Level Agreement (SLA) metrics for customer support,
 * including First Response Time (FRT), Resolution Time, and alerts on
 * SLA breaches. Provides performance dashboards for CX team.
 *
 * @module app/services/ai-customer/sla-tracking
 * @see docs/directions/ai-customer.md AI-CUSTOMER-004
 */
/**
 * SLA metric types
 */
export type SLAMetric = "first_response_time" | "resolution_time" | "response_time";
/**
 * SLA status
 */
export type SLAStatus = "within_sla" | "at_risk" | "breached";
/**
 * SLA thresholds (in minutes)
 */
export interface SLAThresholds {
    firstResponseTime: number;
    resolutionTime: number;
    businessHoursOnly: boolean;
}
/**
 * SLA performance for a single conversation
 */
export interface ConversationSLA {
    conversationId: number;
    customerName: string;
    status: "open" | "pending" | "resolved";
    createdAt: string;
    firstResponseAt?: string | null;
    resolvedAt?: string | null;
    firstResponseTime?: number;
    resolutionTime?: number;
    slaStatus: SLAStatus;
    breaches: {
        firstResponse: boolean;
        resolution: boolean;
    };
    remainingTime: {
        firstResponse?: number;
        resolution?: number;
    };
}
/**
 * SLA performance summary
 */
export interface SLAPerformanceSummary {
    totalConversations: number;
    withinSLA: number;
    atRisk: number;
    breached: number;
    metrics: {
        avgFirstResponseTime: number;
        avgResolutionTime: number;
        firstResponseSLARate: number;
        resolutionSLARate: number;
    };
    byPriority: {
        high: {
            count: number;
            breached: number;
        };
        medium: {
            count: number;
            breached: number;
        };
        low: {
            count: number;
            breached: number;
        };
    };
}
/**
 * SLA tracking result
 */
export interface SLATrackingResult {
    conversations: ConversationSLA[];
    summary: SLAPerformanceSummary;
    alerts: SLAAlert[];
    thresholds: SLAThresholds;
    timestamp: string;
}
/**
 * SLA breach alert
 */
export interface SLAAlert {
    conversationId: number;
    customerName: string;
    alertType: "first_response_breach" | "resolution_breach" | "first_response_at_risk" | "resolution_at_risk";
    severity: "warning" | "critical";
    message: string;
    minutesOverdue?: number;
    createdAt: string;
}
/**
 * Track SLA performance and generate alerts
 *
 * Strategy:
 * 1. Query conversations from decision_log or Chatwoot
 * 2. Calculate FRT and resolution time for each
 * 3. Compare against SLA thresholds
 * 4. Identify at-risk and breached conversations
 * 5. Generate alerts for breaches
 * 6. Calculate summary metrics
 *
 * @param timeRange - Time range to analyze: '24h', '7d', '30d'
 * @param thresholds - Custom SLA thresholds (optional)
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon/service key
 * @returns SLA tracking results with alerts
 */
export declare function trackSLA(timeRange: string, thresholds: Partial<SLAThresholds>, supabaseUrl: string, supabaseKey: string): Promise<SLATrackingResult>;
//# sourceMappingURL=sla-tracking.d.ts.map