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
import { type LoaderFunctionArgs } from "react-router";
export interface UnreadMessagesResponse {
    success: boolean;
    data?: {
        unread_count: number;
        top_conversation: {
            customer_name: string;
            snippet: string;
            created_at: string;
        } | null;
        source: "chatwoot" | "mock";
    };
    error?: string;
    timestamp: string;
}
export declare function loader(_args: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.chatwoot.unread.d.ts.map