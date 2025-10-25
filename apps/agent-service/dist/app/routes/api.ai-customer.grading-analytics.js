/**
 * API Route: AI-Customer Grading Analytics
 *
 * GET /api/ai-customer/grading-analytics?timeRange=30d
 *
 * Returns analytics on tone/accuracy/policy grades from HITL workflow.
 * Provides insights on AI response quality and identifies patterns.
 *
 * Query Parameters:
 * - timeRange: '7d' | '30d' | '90d' | 'all' (optional, default: '30d')
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-001
 */
import { analyzeGrades, } from "../services/ai-customer/grading-analytics";
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
        // Analyze grades
        const analytics = await analyzeGrades(timeRange, supabaseUrl, supabaseKey);
        const response = {
            success: true,
            data: analytics,
            timestamp: new Date().toISOString(),
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[API] Grading analytics error:", error);
        const errorResponse = {
            success: false,
            error: error.message || "Failed to analyze grades",
            timestamp: new Date().toISOString(),
        };
        return Response.json(errorResponse, { status: 500 });
    }
}
//# sourceMappingURL=api.ai-customer.grading-analytics.js.map