/**
 * Chatwoot Support Reporting Automation
 *
 * Generates daily and weekly support reports:
 * - Performance metrics (FRT, resolution time, SLA)
 * - Volume trends
 * - Agent performance
 * - Top issues
 *
 * SUPPORT-006
 */
export interface SupportReport {
    report_type: "daily" | "weekly";
    period: {
        start: string;
        end: string;
    };
    summary: ReportSummary;
    performance: PerformanceMetrics;
    agents: AgentSummary[];
    top_issues: IssueSummary[];
    recommendations: string[];
    generated_at: string;
}
export interface ReportSummary {
    total_conversations: number;
    new_conversations: number;
    resolved_conversations: number;
    open_conversations: number;
    avg_per_day: number;
    trend: "up" | "down" | "stable";
}
export interface PerformanceMetrics {
    avg_response_time_minutes: number;
    avg_resolution_time_hours: number;
    sla_compliance_rate: number;
    sla_breaches: number;
    csat_score: number;
    csat_responses: number;
}
export interface AgentSummary {
    agent_id: number;
    agent_name: string;
    conversations_handled: number;
    avg_response_time_minutes: number;
    resolved_count: number;
    sla_compliance_rate: number;
}
export interface IssueSummary {
    category: string;
    count: number;
    percentage: number;
    trend: "up" | "down" | "stable";
}
/**
 * Generate daily support report
 */
export declare function generateDailyReport(): Promise<SupportReport>;
/**
 * Generate weekly support report
 */
export declare function generateWeeklyReport(): Promise<SupportReport>;
/**
 * Format report as markdown for easy distribution
 */
export declare function formatReportAsMarkdown(report: SupportReport): string;
/**
 * Email report to team
 */
export declare function emailReport(report: SupportReport, recipients: string[]): Promise<void>;
/**
 * Save report to database
 */
export declare function saveReport(report: SupportReport): Promise<void>;
//# sourceMappingURL=reporting.d.ts.map