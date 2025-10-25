/**
 * API Route: Chatwoot Unread Messages
 *
 * GET /api/chatwoot/unread
 *
 * Returns unread Chatwoot conversation count and top conversation snippet
 *
 * Features:
 * - Real Chatwoot API integration via client
 * - Graceful degradation on error (returns 0 unread)
 * - Top conversation preview
 */
import { getUnreadCount } from "~/services/chatwoot/client";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader(_args) {
    const timestamp = new Date().toISOString();
    try {
        const summary = await getUnreadCount();
        const response = {
            success: true,
            data: {
                unread_count: summary.unreadCount,
                top_conversation: summary.topConversation,
                source: "chatwoot",
            },
            timestamp,
        };
        return Response.json(response);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] Chatwoot unread error:", error);
        // Graceful degradation - return 0 unread on error
        const fallbackResponse = {
            success: false,
            error: errorMessage,
            data: {
                unread_count: 0,
                top_conversation: null,
                source: "mock",
            },
            timestamp,
        };
        return Response.json(fallbackResponse);
    }
}
//# sourceMappingURL=api.chatwoot.unread.js.map