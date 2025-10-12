/**
 * Smart Handoff Manager
 *
 * Manages intelligent agent handoffs based on conversation context,
 * intent classification, and agent capabilities.
 */
import type { ConversationContext } from '../context/conversation-manager';
export interface HandoffRule {
    /** Rule priority (higher = checked first) */
    priority: number;
    /** Condition function to check if rule applies */
    condition: (context: ConversationContext) => boolean;
    /** Target agent to hand off to */
    targetAgent: string;
    /** Reason for handoff (for logging) */
    reason: string;
}
export interface HandoffDecision {
    shouldHandoff: boolean;
    targetAgent?: string;
    reason?: string;
    confidence: number;
}
/**
 * Manages smart handoff decisions between agents
 */
export declare class HandoffManager {
    private rules;
    /**
     * Register a handoff rule
     */
    addRule(rule: HandoffRule): void;
    /**
     * Decide if handoff is needed based on context
     */
    decideHandoff(context: ConversationContext): HandoffDecision;
    /**
     * Get recommended agent based on intent
     */
    getRecommendedAgent(intent: string): string | null;
    /**
     * Check if agent has required capabilities
     */
    hasCapability(agentName: string, capability: string): boolean;
}
/**
 * Create default handoff rules
 */
export declare function createDefaultHandoffRules(handoffManager: HandoffManager): void;
export declare const handoffManager: HandoffManager;
//# sourceMappingURL=handoff-manager.d.ts.map