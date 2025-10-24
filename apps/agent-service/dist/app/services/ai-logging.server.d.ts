export interface AIRecommendation {
    type: "template_variant" | "brief" | "insight" | "anomaly_summary" | "reply_generation";
    promptVersion: string;
    inputs: Record<string, unknown>;
    output: string;
    model?: string;
    metadata?: Record<string, unknown>;
}
/**
 * Log AI-generated recommendation to Memory with scope 'build'
 * All AI outputs must be logged per AI agent direction
 */
export declare function logAIRecommendation(recommendation: AIRecommendation, who?: string): Promise<void>;
/**
 * Log AI-generated copy variant for Chatwoot replies
 */
export declare function logReplyGeneration(templateId: string, promptVersion: string, inputs: {
    customerName: string;
    conversationId: number;
    context: string;
}, generatedReply: string, sourceFactId?: string): Promise<void>;
/**
 * Log AI-generated anomaly summary
 */
export declare function logAnomalySummary(factType: string, promptVersion: string, inputs: {
    anomalyData: unknown;
    threshold: unknown;
}, summary: string, sourceFactId?: string): Promise<void>;
/**
 * Log AI-generated insight or brief
 */
export declare function logInsight(topic: string, promptVersion: string, inputs: Record<string, unknown>, insight: string, sourceFactId?: string): Promise<void>;
//# sourceMappingURL=ai-logging.server.d.ts.map