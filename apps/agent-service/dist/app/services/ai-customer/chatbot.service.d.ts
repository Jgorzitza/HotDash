/**
 * AI Customer Service Chatbot Implementation
 *
 * Implements AI-powered customer service with OpenAI integration,
 * ticket routing, response automation, and HITL approval workflows.
 *
 * @module app/services/ai-customer/chatbot.service
 */
export interface CustomerInquiry {
    id: string;
    customerId: string;
    customerEmail: string;
    customerName?: string;
    message: string;
    channel: 'email' | 'chat' | 'sms';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'new' | 'assigned' | 'in_progress' | 'pending_approval' | 'resolved';
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    metadata?: Record<string, any>;
}
export interface AIResponse {
    id: string;
    inquiryId: string;
    draftResponse: string;
    confidence: number;
    suggestedTags: string[];
    requiresApproval: boolean;
    approvalReason?: string;
    createdAt: string;
    approvedAt?: string;
    approvedBy?: string;
    finalResponse?: string;
    sentAt?: string;
    customerSatisfaction?: number;
}
export interface ChatbotConfig {
    openaiApiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
    systemPrompt: string;
    autoApproveThreshold: number;
    escalationKeywords: string[];
    piiDetection: boolean;
    responseTimeTarget: number;
    shopifyMCPEnabled: boolean;
    storefrontMCPEnabled: boolean;
    customerAccountsMCPEnabled: boolean;
}
export declare class AICustomerChatbot {
    private openai;
    private supabase;
    private config;
    constructor(config?: Partial<ChatbotConfig>);
    /**
     * Process a new customer inquiry
     */
    processInquiry(inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<AIResponse>;
    /**
     * Analyze customer inquiry to determine intent, sentiment, and routing
     */
    private analyzeInquiry;
    /**
     * Generate AI response to customer inquiry
     */
    private generateResponse;
    /**
     * Determine if response requires human approval
     */
    private requiresApproval;
    /**
     * Get default system prompt for AI responses
     */
    private getDefaultSystemPrompt;
    /**
     * Approve and send a response
     */
    approveResponse(responseId: string, approvedBy: string, finalResponse?: string): Promise<void>;
    /**
     * Get pending responses that need approval
     */
    getPendingResponses(): Promise<AIResponse[]>;
    /**
     * Call Shopify Storefront MCP for product/catalog queries
     */
    callStorefrontMCP(query: string, customerId?: string): Promise<any>;
    /**
     * Call Customer Accounts MCP for authenticated customer data
     */
    callCustomerAccountsMCP(action: string, customerId: string, token: string): Promise<any>;
    /**
     * Get chatbot performance metrics
     */
    getPerformanceMetrics(): Promise<{
        totalInquiries: number;
        autoResolved: number;
        humanApproved: number;
        averageResponseTime: number;
        customerSatisfaction: number;
    }>;
}
/**
 * Default chatbot instance
 */
export declare const aiChatbot: AICustomerChatbot;
//# sourceMappingURL=chatbot.service.d.ts.map