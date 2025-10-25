/**
 * AI-Customer CEO Agent Memory Service
 *
 * Stores and retrieves conversation history for CEO Agent.
 * Supports multi-turn conversations with context retention,
 * conversation summarization, and search capabilities.
 *
 * @module app/services/ai-customer/memory
 * @see docs/directions/ai-customer.md AI-CUSTOMER-009
 */
/**
 * Message role types
 */
export type MessageRole = "user" | "assistant" | "system" | "tool";
/**
 * Conversation message
 */
export interface ConversationMessage {
    id?: string;
    role: MessageRole;
    content: string;
    toolCalls?: Array<{
        toolName: string;
        arguments: Record<string, any>;
        result?: Record<string, any>;
    }>;
    timestamp: string;
    metadata?: Record<string, any>;
}
/**
 * Conversation record
 */
export interface Conversation {
    conversationId: string;
    userId: string;
    title?: string;
    messages: ConversationMessage[];
    summary?: string;
    createdAt: string;
    updatedAt: string;
    metadata?: {
        totalTokens?: number;
        messageCount: number;
        lastAction?: string;
        tags?: string[];
    };
}
/**
 * Conversation search result
 */
export interface ConversationSearchResult {
    conversationId: string;
    userId: string;
    title?: string;
    summary?: string;
    messageCount: number;
    lastMessageAt: string;
    relevance?: number;
    matchedContent?: string;
}
/**
 * Create or append to conversation
 *
 * Strategy:
 * 1. Check if conversation exists
 * 2. If new: create conversation record
 * 3. If existing: append message
 * 4. Auto-summarize old messages if > 20 messages (context window management)
 * 5. Store in decision_log with scope='ceo_conversation'
 *
 * @param conversationId - Unique conversation identifier
 * @param message - New message to add
 * @param userId - CEO user ID
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Updated conversation
 */
export declare function addMessage(conversationId: string, message: ConversationMessage, userId: string, supabaseUrl: string, supabaseKey: string): Promise<Conversation>;
/**
 * Get conversation history
 *
 * @param conversationId - Conversation identifier
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @param includeFullHistory - If false, return only recent messages (default: true)
 * @returns Conversation with messages
 */
export declare function getConversation(conversationId: string, supabaseUrl: string, supabaseKey: string, includeFullHistory?: boolean): Promise<Conversation | null>;
/**
 * Search conversations by content or metadata
 *
 * @param userId - CEO user ID
 * @param searchQuery - Search term
 * @param limit - Max results to return
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Matching conversations
 */
export declare function searchConversations(userId: string, searchQuery: string, limit: number, supabaseUrl: string, supabaseKey: string): Promise<ConversationSearchResult[]>;
/**
 * Delete conversation
 *
 * @param conversationId - Conversation to delete
 * @param userId - User ID (for ownership verification)
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Success boolean
 */
export declare function deleteConversation(conversationId: string, userId: string, supabaseUrl: string, supabaseKey: string): Promise<boolean>;
//# sourceMappingURL=memory.d.ts.map