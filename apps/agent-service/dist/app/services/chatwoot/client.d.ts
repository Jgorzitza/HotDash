/**
 * Chatwoot Client Service
 *
 * Provides helper functions for interacting with the Chatwoot API
 */
import type { Conversation } from "../../../packages/integrations/chatwoot";
export interface UnreadSummary {
    unreadCount: number;
    conversations: Conversation[];
    topConversation: {
        customerName: string;
        snippet: string;
        createdAt: string;
    } | null;
}
/**
 * Get unread message count and top conversation
 */
export declare function getUnreadCount(): Promise<UnreadSummary>;
//# sourceMappingURL=client.d.ts.map