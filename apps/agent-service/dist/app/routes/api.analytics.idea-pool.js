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
import { isFeatureEnabled } from "~/config/featureFlags";
import ideaPoolFixture from "~/fixtures/content/idea-pool.json";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function loader(_args) {
    const timestamp = new Date().toISOString();
    const featureFlagEnabled = isFeatureEnabled("supabase_idea_pool");
    try {
        // Check feature flag for real Supabase calls
        if (featureFlagEnabled) {
            // TODO: Replace with real Supabase query when Data migrations are live
            // const { data, error } = await supabaseClient
            //   .from('product_suggestions')
            //   .select('*')
            //   .order('priority', { ascending: false })
            //   .limit(5);
            //
            // if (error) throw error;
            //
            // return Response.json({
            //   success: true,
            //   data: {
            //     ideas: data,
            //     total_count: data.length,
            //     wildcard_count: data.filter(i => i.type === 'wildcard').length,
            //     source: 'supabase',
            //     feature_flag_enabled: true,
            //   },
            //   timestamp,
            //});
            // For now, fall back to fixtures even when flag is enabled
            console.warn("[API] FEATURE_SUPABASE_IDEA_POOL enabled but Supabase integration not yet implemented. Falling back to fixtures.");
        }
        // Return mocked fixture data
        const ideas = ideaPoolFixture;
        const wildcardCount = ideas.filter((i) => i.type === "wildcard").length;
        const response = {
            success: true,
            data: {
                ideas,
                total_count: ideas.length,
                wildcard_count: wildcardCount,
                source: "fixture",
                feature_flag_enabled: featureFlagEnabled,
            },
            fallback_reason: featureFlagEnabled
                ? "Supabase integration pending Data migrations"
                : undefined,
            timestamp,
        };
        return Response.json(response);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("[API] Idea pool error:", error);
        // Graceful degradation to fixtures on error
        const ideas = ideaPoolFixture;
        const wildcardCount = ideas.filter((i) => i.type === "wildcard").length;
        const errorResponse = {
            success: true, // Still return success with fixtures
            data: {
                ideas,
                total_count: ideas.length,
                wildcard_count: wildcardCount,
                source: "fixture",
                feature_flag_enabled: featureFlagEnabled,
            },
            fallback_reason: `Error fetching from Supabase: ${errorMessage}`,
            timestamp,
        };
        return Response.json(errorResponse);
    }
}
//# sourceMappingURL=api.analytics.idea-pool.js.map