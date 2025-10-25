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
import { createClient } from "@supabase/supabase-js";
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
export async function addMessage(conversationId, message, userId, supabaseUrl, supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        // Check if conversation exists
        const { data: existing, error: fetchError } = await supabase
            .from("decision_log")
            .select("*")
            .eq("scope", "ceo_conversation")
            .eq("external_ref", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
        const now = new Date().toISOString();
        if (!existing || fetchError) {
            // Create new conversation
            const newConversation = {
                conversationId,
                userId,
                messages: [message],
                createdAt: now,
                updatedAt: now,
                metadata: {
                    messageCount: 1,
                },
            };
            await supabase.from("decision_log").insert({
                scope: "ceo_conversation",
                actor: userId,
                action: "conversation.create",
                external_ref: conversationId,
                payload: newConversation,
            });
            return newConversation;
        }
        // Append to existing conversation
        const conversation = existing.payload;
        conversation.messages.push(message);
        conversation.updatedAt = now;
        conversation.metadata = {
            ...conversation.metadata,
            messageCount: conversation.messages.length,
        };
        // Auto-summarize if > 20 messages
        if (conversation.messages.length > 20 && !conversation.summary) {
            conversation.summary = await summarizeConversation(conversation);
        }
        // Update conversation
        await supabase.from("decision_log").insert({
            scope: "ceo_conversation",
            actor: userId,
            action: "conversation.update",
            external_ref: conversationId,
            payload: conversation,
        });
        return conversation;
    }
    catch (error) {
        console.error("[Memory] Error adding message:", error);
        throw error;
    }
}
/**
 * Get conversation history
 *
 * @param conversationId - Conversation identifier
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @param includeFullHistory - If false, return only recent messages (default: true)
 * @returns Conversation with messages
 */
export async function getConversation(conversationId, supabaseUrl, supabaseKey, includeFullHistory = true) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        const { data, error } = await supabase
            .from("decision_log")
            .select("*")
            .eq("scope", "ceo_conversation")
            .eq("external_ref", conversationId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
        if (error || !data) {
            return null;
        }
        const conversation = data.payload;
        // Return recent messages only if requested
        if (!includeFullHistory && conversation.messages.length > 10) {
            return {
                ...conversation,
                messages: conversation.messages.slice(-10), // Last 10 messages
                summary: conversation.summary || "Earlier messages summarized",
            };
        }
        return conversation;
    }
    catch (error) {
        console.error("[Memory] Error fetching conversation:", error);
        return null;
    }
}
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
export async function searchConversations(userId, searchQuery, limit, supabaseUrl, supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        // Query conversations for this user
        const { data, error } = await supabase
            .from("decision_log")
            .select("*")
            .eq("scope", "ceo_conversation")
            .eq("actor", userId)
            .order("created_at", { ascending: false })
            .limit(limit * 2); // Fetch extra for filtering
        if (error || !data) {
            return [];
        }
        // Filter and rank by search query
        const results = [];
        const searchLower = searchQuery.toLowerCase();
        for (const record of data) {
            const conversation = record.payload;
            // Check if title matches
            const titleMatch = conversation.title
                ?.toLowerCase()
                .includes(searchLower);
            // Check if summary matches
            const summaryMatch = conversation.summary
                ?.toLowerCase()
                .includes(searchLower);
            // Check if any message content matches
            const messageMatch = conversation.messages.some((m) => m.content.toLowerCase().includes(searchLower));
            if (titleMatch || summaryMatch || messageMatch) {
                // Calculate relevance score
                let relevance = 0;
                if (titleMatch)
                    relevance += 0.5;
                if (summaryMatch)
                    relevance += 0.3;
                if (messageMatch)
                    relevance += 0.2;
                // Find matched content snippet
                const matchedMessage = conversation.messages.find((m) => m.content.toLowerCase().includes(searchLower));
                results.push({
                    conversationId: conversation.conversationId,
                    userId: conversation.userId,
                    title: conversation.title,
                    summary: conversation.summary,
                    messageCount: conversation.messages.length,
                    lastMessageAt: conversation.updatedAt,
                    relevance,
                    matchedContent: matchedMessage?.content.slice(0, 200),
                });
                if (results.length >= limit)
                    break;
            }
        }
        // Sort by relevance
        return results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    }
    catch (error) {
        console.error("[Memory] Error searching conversations:", error);
        return [];
    }
}
/**
 * Summarize old conversation messages for context window management
 *
 * Uses first 10 messages to create concise summary
 *
 * @param conversation - Conversation to summarize
 * @returns Summary text
 */
async function summarizeConversation(conversation) {
    // Extract first 10 messages for summary
    const messagesToSummarize = conversation.messages.slice(0, 10);
    // Simple extraction of key topics
    const userQueries = messagesToSummarize
        .filter((m) => m.role === "user")
        .map((m) => m.content);
    const assistantResponses = messagesToSummarize
        .filter((m) => m.role === "assistant")
        .map((m) => m.content.slice(0, 100));
    const summary = `Conversation about: ${userQueries.join(", ")}. Key responses: ${assistantResponses.join(" | ")}`;
    return summary.slice(0, 500); // Limit summary length
}
/**
 * Delete conversation
 *
 * @param conversationId - Conversation to delete
 * @param userId - User ID (for ownership verification)
 * @param supabaseUrl - Supabase project URL
 * @param supabaseKey - Supabase service key
 * @returns Success boolean
 */
export async function deleteConversation(conversationId, userId, supabaseUrl, supabaseKey) {
    const supabase = createClient(supabaseUrl, supabaseKey);
    try {
        // Soft delete: mark as deleted in metadata
        const { error } = await supabase.from("decision_log").insert({
            scope: "ceo_conversation",
            actor: userId,
            action: "conversation.delete",
            external_ref: conversationId,
            payload: { deleted: true, deletedAt: new Date().toISOString() },
        });
        return !error;
    }
    catch (error) {
        console.error("[Memory] Error deleting conversation:", error);
        return false;
    }
}
//# sourceMappingURL=memory.js.map