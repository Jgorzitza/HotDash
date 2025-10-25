/**
 * API Route: AI-Customer Template Optimization
 *
 * GET /api/ai-customer/template-optimizer?timeRange=30d
 *
 * Analyzes template performance based on HITL grades and provides
 * optimization recommendations, pattern analysis, and A/B test candidates.
 *
 * Query Parameters:
 * - timeRange: '7d' | '30d' | '90d' | 'all' (optional, default: '30d')
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-002
 */
import { optimizeTemplates, } from "../services/ai-customer/template-optimizer";
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const timeRange = url.searchParams.get("timeRange") || "30d";
        // Validate timeRange parameter
        const validTimeRanges = ["7d", "30d", "90d", "all"];
        if (!validTimeRanges.includes(timeRange)) {
            const errorResponse = {
                success: false,
                error: `Invalid timeRange parameter. Must be one of: ${validTimeRanges.join(", ")}`,
                timestamp: new Date().toISOString(),
            };
            return Response.json(errorResponse, { status: 400 });
        }
        // Get Supabase credentials from environment
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error("Missing Supabase configuration");
        }
        // Optimize templates
        const optimization = await optimizeTemplates(timeRange, supabaseUrl, supabaseKey);
        const response = {
            success: true,
            data: optimization,
            timestamp: new Date().toISOString(),
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[API] Template optimizer error:", error);
        const errorResponse = {
            success: false,
            error: error.message || "Failed to optimize templates",
            timestamp: new Date().toISOString(),
        };
        return Response.json(errorResponse, { status: 500 });
    }
}
//# sourceMappingURL=api.ai-customer.template-optimizer.js.map