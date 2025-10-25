/**
 * API Route: Analytics Idea Pool
 *
 * GET /api/analytics/idea-pool
 *
 * Returns content idea suggestions from the always-on idea pool.
 * Maintains exactly 5 ideas with one wildcard.
 *
 * Features:
 * - Mocked Supabase responses by default
 * - Feature flag FEATURE_SUPABASE_IDEA_POOL for real database
 * - Graceful degradation to fixtures on error
 */
import { type LoaderFunctionArgs } from "react-router";
export interface IdeaPoolItem {
    id: string;
    type: "launch" | "evergreen" | "wildcard";
    title: string;
    description: string;
    target_platforms: string[];
    suggested_copy: string;
    suggested_hashtags: string[];
    evidence: Record<string, unknown>;
    supabase_linkage: {
        table: string;
        created_at?: string;
        [key: string]: unknown;
    };
    projected_metrics: {
        estimated_reach: number;
        estimated_engagement_rate: number;
        estimated_clicks: number;
        estimated_conversions: number;
    };
    cadence: string;
    status: "draft" | "approved" | "pending_review" | "rejected";
    priority: "low" | "medium" | "high" | "urgent";
    risk_level?: string;
    rollback_plan?: string;
}
export interface IdeaPoolResponse {
    success: boolean;
    data?: {
        ideas: IdeaPoolItem[];
        total_count: number;
        wildcard_count: number;
        source: "supabase" | "fixture";
        feature_flag_enabled: boolean;
    };
    error?: string;
    fallback_reason?: string;
    timestamp: string;
}
export declare function loader(_args: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.idea-pool.d.ts.map