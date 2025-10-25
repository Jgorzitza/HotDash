/**
 * Chatwoot Client Service
 *
 * Provides helper functions for interacting with the Chatwoot API
 */
import { chatwootClient } from "../../../packages/integrations/chatwoot";
import { getChatwootConfig } from "../../config/chatwoot.server";
/**
 * Get unread message count and top conversation
 */
export async function getUnreadCount() {
    const config = getChatwootConfig();
    const client = chatwootClient(config);
    // Fetch open conversations (unassigned + open status)
    const conversations = await client.listConversations({
        status: "open",
    });
    const unreadCount = conversations.length;
    let topConversation = null;
    if (conversations.length > 0) {
        // Sort by most recent message
        const sorted = conversations.sort((a, b) => new Date(b.last_activity_at || b.created_at).getTime() -
            new Date(a.last_activity_at || a.created_at).getTime());
        const top = sorted[0];
        const customerName = top.meta?.sender?.name ||
            top.contacts?.find((contact) => Boolean(contact?.name))?.name ||
            "Customer";
        // Get last message from messages array
        const messages = top.messages || [];
        const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
        const snippet = lastMessage?.content
            ? lastMessage.content.substring(0, 100)
            : "No messages yet";
        topConversation = {
            customerName,
            snippet,
            createdAt: top.last_activity_at || top.created_at,
        };
    }
    return {
        unreadCount,
        conversations,
        topConversation,
    };
}
//# sourceMappingURL=client.js.map