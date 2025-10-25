/**
 * Human Fallback Handler
 *
 * Handles low-confidence scenarios and escalations to human agents.
 * Implements intelligent fallback logic based on confidence, sentiment, and context.
 */
import type { ConversationContext } from '../context/conversation-manager';
import type { HandoffDecision } from './handoff-manager';
export interface FallbackCondition {
    name: string;
    check: (context: ConversationContext, decision: HandoffDecision) => boolean;
    priority: number;
    escalationReason: string;
}
/**
 * Fallback conditions that trigger human review
 */
export declare const fallbackConditions: FallbackCondition[];
/**
 * Check if fallback to human is needed
 */
export declare function shouldFallbackToHuman(context: ConversationContext, decision: HandoffDecision): {
    shouldFallback: boolean;
    reason?: string;
    priority?: number;
};
/**
 * Execute human fallback actions
 */
export declare function executeHumanFallback(context: ConversationContext, reason: string): Promise<void>;
/**
 * Get fallback statistics
 */
export declare function getFallbackStats(timeRange?: string): Promise<{
    totalFallbacks: number;
    fallbackRate: number;
    byReason: Record<string, number>;
    avgResolutionTime: number;
}>;
//# sourceMappingURL=fallback-handler.d.ts.map