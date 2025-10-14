/**
 * Auto-Escalation System
 *
 * Intelligently escalates conversations to human agents based on:
 * - Customer explicit requests
 * - Negative sentiment
 * - Low AI confidence
 * - Legal/threat language
 * - VIP customer status
 *
 * Direction Reference: docs/directions/chatwoot.md Task 5
 */
import type { SentimentAnalysis } from './sentiment-analyzer.js';
export interface EscalationTrigger {
    type: 'explicit_request' | 'negative_sentiment' | 'low_confidence' | 'legal_threat' | 'vip_customer' | 'complex_query';
    severity: 'low' | 'medium' | 'high' | 'critical';
    reason: string;
    metadata?: Record<string, any>;
}
export interface EscalationDecision {
    shouldEscalate: boolean;
    triggers: EscalationTrigger[];
    recommendedAgent?: 'standard' | 'senior' | 'manager';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    alertChannels: string[];
    draftMessage: string;
}
/**
 * Determines when to escalate to human agents
 */
export declare class AutoEscalation {
    /**
     * Evaluate if conversation should be escalated
     */
    evaluate(params: {
        message: string;
        sentiment: SentimentAnalysis;
        confidence: number;
        intent: string;
        customerTier?: string;
        conversationHistory?: any[];
    }): EscalationDecision;
    /**
     * Check if message explicitly requests human agent
     */
    private hasExplicitHumanRequest;
    /**
     * Check for legal threat language
     */
    private hasLegalThreat;
    /**
     * Check if query is complex (multiple issues)
     */
    private isComplexQuery;
    /**
     * Check if triggers meet escalation threshold
     */
    private meetsEscalationThreshold;
    /**
     * Generate escalation message for human agent
     */
    private generateEscalationMessage;
    /**
     * Get escalation statistics
     */
    private escalations;
    trackEscalation(conversationId: number, decision: EscalationDecision): void;
    getStats(): {
        total: number;
        escalationRate: string;
        byType: {};
        byPriority: {};
        escalated?: undefined;
    } | {
        total: number;
        escalated: number;
        escalationRate: string;
        byType: Record<string, number>;
        byPriority: Record<string, number>;
    };
}
export declare const autoEscalation: AutoEscalation;
//# sourceMappingURL=auto-escalation.d.ts.map