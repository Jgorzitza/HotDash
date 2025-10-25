/**
 * API Route: CEO Agent Stats
 *
 * GET /api/ceo-agent/stats
 *
 * Returns CEO AI agent activity stats including:
 * - Actions completed today
 * - Pending approvals
 * - Last action timestamp
 * - Recent activity
 *
 * NOTE: Currently returns mock data. Phase 11 will integrate with real OpenAI SDK backend.
 */
import { type LoaderFunctionArgs } from "react-router";
export interface CEOAgentAction {
    id: string;
    type: "data_analysis" | "report" | "decision" | "query";
    description: string;
    status: "pending" | "approved" | "completed" | "rejected";
    created_at: string;
    completed_at?: string;
}
export interface CEOAgentStatsResponse {
    success: boolean;
    data?: {
        actions_today: number;
        pending_approvals: number;
        last_action: string | null;
        recent_actions: CEOAgentAction[];
        source: "mock" | "openai_sdk";
    };
    error?: string;
    timestamp: string;
}
export declare function loader(_args: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ceo-agent.stats.d.ts.map