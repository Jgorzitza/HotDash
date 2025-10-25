/**
 * Handoff Metrics Tracking
 *
 * Tracks handoff performance, accuracy, and confidence metrics.
 * Logs to decision_log for analysis and improvement.
 */
import type { HandoffDecision } from '../handoff/handoff-manager';
import type { ConversationContext } from '../context/conversation-manager';
export interface HandoffMetric {
    id: string;
    conversationId: number;
    timestamp: Date;
    sourceAgent: string | null;
    targetAgent: string;
    intent: string;
    confidence: number;
    latencyMs: number;
    rulesEvaluated: number;
    wasCorrect: boolean | null;
    actualIntent: string | null;
    wasEscalated: boolean;
    escalationReason: string | null;
    sentiment: string | null;
    urgency: string | null;
    customerTags: string[];
    metadata: {
        alternativeAgents?: string[];
        contextFactors?: string[];
        fallbackTriggered?: boolean;
    };
}
/**
 * Log a handoff decision to metrics
 */
export declare function logHandoffMetric(conversationId: number, decision: HandoffDecision, context: ConversationContext, sourceAgent?: string | null): Promise<void>;
/**
 * Get handoff accuracy for a time range
 */
export declare function getHandoffAccuracy(timeRange?: string): Promise<number>;
/**
 * Get average confidence for a time range
 */
export declare function getAverageConfidence(timeRange?: string): Promise<number>;
/**
 * Get fallback rate for a time range
 */
export declare function getFallbackRate(timeRange?: string): Promise<number>;
/**
 * Get handoff latency stats
 */
export declare function getHandoffLatency(timeRange?: string): Promise<{
    avg: number;
    p50: number;
    p95: number;
    p99: number;
}>;
/**
 * Get agent utilization stats
 */
export declare function getAgentUtilization(timeRange?: string): Promise<Record<string, number>>;
/**
 * Get handoff metrics summary
 */
export declare function getHandoffMetricsSummary(timeRange?: string): Promise<{
    accuracy: number;
    avgConfidence: number;
    fallbackRate: number;
    latency: {
        avg: number;
        p50: number;
        p95: number;
        p99: number;
    };
    agentUtilization: Record<string, number>;
    totalHandoffs: number;
}>;
/**
 * Update handoff metric with human feedback
 */
export declare function updateHandoffFeedback(metricId: string, wasCorrect: boolean, actualIntent?: string): Promise<void>;
//# sourceMappingURL=handoff-metrics.d.ts.map