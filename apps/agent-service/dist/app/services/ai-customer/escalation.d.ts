/**
 * AI-Customer Escalation Triggers Service
 *
 * Automatically detects conversations that require CEO/human escalation
 * based on sentiment analysis, complexity indicators, policy violations,
 * and specific request types (refunds, returns, complaints).
 *
 * @module app/services/ai-customer/escalation
 * @see docs/directions/ai-customer.md AI-CUSTOMER-003
 */
/**
 * Escalation trigger types
 */
export type EscalationTrigger = "negative_sentiment" | "refund_request" | "return_request" | "policy_violation" | "complex_issue" | "vip_customer" | "legal_threat" | "multiple_contacts";
/**
 * Sentiment classification
 */
export type Sentiment = "angry" | "frustrated" | "disappointed" | "neutral" | "satisfied" | "happy";
/**
 * Escalation severity level
 */
export type EscalationSeverity = "low" | "medium" | "high" | "critical";
/**
 * Escalation case details
 */
export interface EscalationCase {
    conversationId: number;
    customerId?: number;
    customerName: string;
    triggers: EscalationTrigger[];
    sentiment: Sentiment;
    severity: EscalationSeverity;
    reason: string;
    recommendedAction: string;
    context: {
        messageCount: number;
        lastMessageAt: string;
        previousEscalations: number;
        orderValue?: number;
        hasOpenOrders: boolean;
    };
    metadata: {
        detectedAt: string;
        keywords: string[];
        confidence: number;
    };
}
/**
 * Escalation detection result
 */
export interface EscalationDetectionResult {
    escalations: EscalationCase[];
    summary: {
        totalConversations: number;
        escalationsDetected: number;
        byTrigger: Record<EscalationTrigger, number>;
        bySeverity: Record<EscalationSeverity, number>;
    };
    timestamp: string;
}
/**
 * Detect conversations requiring escalation
 *
 * Strategy:
 * 1. Query open/pending Chatwoot conversations
 * 2. Analyze message content for triggers
 * 3. Classify sentiment
 * 4. Determine escalation severity
 * 5. Generate recommendations
 *
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase anon/service key
 * @param chatwootUrl - Chatwoot API URL (optional for testing)
 * @param chatwootKey - Chatwoot API key (optional for testing)
 * @returns Escalation detection results
 */
export declare function detectEscalations(supabaseUrl: string, supabaseKey: string, chatwootUrl?: string, chatwootKey?: string): Promise<EscalationDetectionResult>;
//# sourceMappingURL=escalation.d.ts.map