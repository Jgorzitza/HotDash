/**
 * Agent Performance Monitoring Service
 *
 * Tracks CEO Agent and Customer Agent performance metrics including
 * response quality, response time, throughput, and learning trends.
 *
 * @module services/ai-customer/agent-performance
 */
/**
 * Agent performance metrics
 */
export interface AgentPerformanceMetrics {
    avgDraftGrade: number;
    draftApprovalRate: number;
    avgDraftGenerationTime: number;
    avgApprovalTime: number;
    draftsGenerated: number;
    draftsApproved: number;
    draftsRejected: number;
    draftsEdited: number;
    avgEditDistance: number;
    improvementTrend: "improving" | "stable" | "declining";
}
/**
 * Get agent performance metrics
 *
 * Analyzes decision_log data to calculate performance metrics for
 * CEO Agent or Customer Agent over a specified time period.
 *
 * @param agent - Agent type ('customer' | 'ceo')
 * @param days - Number of days to analyze (default: 7)
 * @returns Performance metrics
 *
 * @example
 * ```typescript
 * const metrics = await getAgentPerformance('customer', 7);
 * console.log(`Approval rate: ${metrics.draftApprovalRate}%`);
 * console.log(`Trend: ${metrics.improvementTrend}`);
 * ```
 */
export declare function getAgentPerformance(agent: "customer" | "ceo", days?: number): Promise<AgentPerformanceMetrics>;
//# sourceMappingURL=agent-performance.d.ts.map