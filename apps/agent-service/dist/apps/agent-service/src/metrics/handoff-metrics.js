/**
 * Handoff Metrics Tracking
 *
 * Tracks handoff performance, accuracy, and confidence metrics.
 * Logs to decision_log for analysis and improvement.
 */
/**
 * Log a handoff decision to metrics
 */
export async function logHandoffMetric(conversationId, decision, context, sourceAgent = null) {
    try {
        const metric = {
            id: `handoff-${conversationId}-${Date.now()}`,
            conversationId,
            timestamp: new Date(),
            sourceAgent,
            targetAgent: decision.targetAgent || 'none',
            intent: context.intent || 'unknown',
            confidence: decision.confidence,
            latencyMs: decision.metadata.processingTimeMs,
            rulesEvaluated: decision.metadata.rulesEvaluated,
            wasCorrect: null, // To be filled by human review
            actualIntent: null,
            wasEscalated: decision.requiresHumanReview,
            escalationReason: decision.escalationReason || null,
            sentiment: context.sentiment || null,
            urgency: context.urgency || null,
            customerTags: context.customer.tags || [],
            metadata: {
                alternativeAgents: decision.alternativeAgents?.map(a => a.agent),
                contextFactors: decision.metadata.contextFactors,
                fallbackTriggered: decision.requiresHumanReview && decision.confidence < 0.5,
            },
        };
        // In a real implementation, this would log to decision_log table
        // For now, just console log
        console.log('[Handoff Metrics]', JSON.stringify(metric, null, 2));
        // TODO: Implement actual database logging
        // await logDecision({
        //   scope: 'agent_handoff',
        //   actor: sourceAgent || 'triage',
        //   action: 'handoff_decision',
        //   rationale: decision.reason,
        //   status: decision.requiresHumanReview ? 'pending_review' : 'completed',
        //   payload: metric,
        // });
    }
    catch (error) {
        console.error('[Handoff Metrics] Error logging metric:', error);
    }
}
/**
 * Get handoff accuracy for a time range
 */
export async function getHandoffAccuracy(timeRange = '7d') {
    // TODO: Implement actual database query
    // This would query decision_log for handoff metrics with wasCorrect field
    return 0.92; // Mock value
}
/**
 * Get average confidence for a time range
 */
export async function getAverageConfidence(timeRange = '7d') {
    // TODO: Implement actual database query
    return 0.85; // Mock value
}
/**
 * Get fallback rate for a time range
 */
export async function getFallbackRate(timeRange = '7d') {
    // TODO: Implement actual database query
    return 0.08; // Mock value
}
/**
 * Get handoff latency stats
 */
export async function getHandoffLatency(timeRange = '7d') {
    // TODO: Implement actual database query
    return {
        avg: 45,
        p50: 38,
        p95: 95,
        p99: 150,
    };
}
/**
 * Get agent utilization stats
 */
export async function getAgentUtilization(timeRange = '7d') {
    // TODO: Implement actual database query
    return {
        'Order Support': 0.45,
        'Shipping Support': 0.25,
        'Product Q&A': 0.20,
        'Technical Support': 0.10,
    };
}
/**
 * Get handoff metrics summary
 */
export async function getHandoffMetricsSummary(timeRange = '7d') {
    const [accuracy, avgConfidence, fallbackRate, latency, agentUtilization] = await Promise.all([
        getHandoffAccuracy(timeRange),
        getAverageConfidence(timeRange),
        getFallbackRate(timeRange),
        getHandoffLatency(timeRange),
        getAgentUtilization(timeRange),
    ]);
    return {
        accuracy,
        avgConfidence,
        fallbackRate,
        latency,
        agentUtilization,
        totalHandoffs: 1250, // Mock value
    };
}
/**
 * Update handoff metric with human feedback
 */
export async function updateHandoffFeedback(metricId, wasCorrect, actualIntent) {
    try {
        // TODO: Implement actual database update
        console.log('[Handoff Metrics] Feedback recorded:', {
            metricId,
            wasCorrect,
            actualIntent,
        });
    }
    catch (error) {
        console.error('[Handoff Metrics] Error updating feedback:', error);
    }
}
//# sourceMappingURL=handoff-metrics.js.map