/**
 * API Route: CEO Agent Health Check
 *
 * GET /api/ceo-agent/health?timeRange=24h
 *
 * Monitors CEO Agent performance and health status.
 * Tracks response times, token usage, error rates, tool utilization.
 *
 * Query Parameters:
 * - timeRange: '1h' | '24h' | '7d' | '30d' (optional, default: '24h')
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-012
 */
import { checkHealth, } from "../services/ai-customer/monitoring";
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const timeRange = (url.searchParams.get("timeRange") || "24h");
        // Validate timeRange
        const validTimeRanges = ["1h", "24h", "7d", "30d"];
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
        // Check health
        const result = await checkHealth(timeRange, supabaseUrl, supabaseKey);
        const response = {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[API] CEO Agent health check error:", error);
        const errorResponse = {
            success: false,
            error: error.message || "Failed to check health",
            timestamp: new Date().toISOString(),
        };
        return Response.json(errorResponse, { status: 500 });
    }
}
//# sourceMappingURL=api.ceo-agent.health.js.map