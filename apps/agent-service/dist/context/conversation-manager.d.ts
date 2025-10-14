/**
 * Conversation Context Manager
 *
 * Manages conversation history, context, and state for agent interactions.
 * Maintains customer information, conversation metadata, and recent messages.
 */
export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}
export interface CustomerContext {
    email?: string;
    name?: string;
    orderId?: string;
    orderHistory?: any[];
    preferences?: Record<string, any>;
    tags?: string[];
}
export interface ConversationContext {
    conversationId: number;
    messages: Message[];
    customer: CustomerContext;
    intent?: string;
    sentiment?: 'positive' | 'neutral' | 'negative';
    urgency?: 'low' | 'medium' | 'high' | 'urgent';
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Manages conversation context for agent operations
 */
export declare class ConversationManager {
    private contexts;
    /**
     * Get or create conversation context
     */
    getContext(conversationId: number): ConversationContext;
    /**
     * Add message to conversation
     */
    addMessage(conversationId: number, message: Omit<Message, 'id' | 'timestamp'>): Message;
    /**
     * Update customer context
     */
    updateCustomer(conversationId: number, customer: Partial<CustomerContext>): void;
    /**
     * Set conversation intent
     */
    setIntent(conversationId: number, intent: string): void;
    /**
     * Set conversation sentiment
     */
    setSentiment(conversationId: number, sentiment: 'positive' | 'neutral' | 'negative'): void;
    /**
     * Set conversation urgency
     */
    setUrgency(conversationId: number, urgency: 'low' | 'medium' | 'high' | 'urgent'): void;
    /**
     * Add metadata to conversation
     */
    addMetadata(conversationId: number, key: string, value: any): void;
    /**
     * Get recent messages for context
     */
    getRecentMessages(conversationId: number, count?: number): Message[];
    /**
     * Get conversation summary for agent context
     */
    getSummary(conversationId: number): string;
    /**
     * Clear old conversations to prevent memory leaks
     */
    cleanup(maxAgeMs?: number): number;
    /**
     * Get all active conversation IDs
     */
    getActiveConversations(): number[];
}
export declare const conversationManager: ConversationManager;
//# sourceMappingURL=conversation-manager.d.ts.map