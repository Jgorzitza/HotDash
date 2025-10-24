/**
 * API Route: AI-Customer SLA Tracking
 *
 * GET /api/ai-customer/sla-tracking?timeRange=24h&firstResponseTime=60&resolutionTime=1440
 *
 * Tracks SLA performance for customer support conversations,
 * including First Response Time and Resolution Time metrics.
 * Generates alerts for breaches and at-risk conversations.
 *
 * Query Parameters:
 * - timeRange: '24h' | '7d' | '30d' (optional, default: '24h')
 * - firstResponseTime: number (minutes, optional, default: 60)
 * - resolutionTime: number (minutes, optional, default: 1440)
 * - businessHoursOnly: boolean (optional, default: true)
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-004
 */
import { trackSLA, } from "../services/ai-customer/sla-tracking";
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const timeRange = url.searchParams.get("timeRange") || "24h";
        // Parse threshold parameters
        const firstResponseTimeParam = url.searchParams.get("firstResponseTime");
        const resolutionTimeParam = url.searchParams.get("resolutionTime");
        const businessHoursOnlyParam = url.searchParams.get("businessHoursOnly");
        const thresholds = {};
        if (firstResponseTimeParam) {
            const value = parseInt(firstResponseTimeParam);
            if (isNaN(value) || value <= 0) {
                const errorResponse = {
                    success: false,
                    error: "Invalid firstResponseTime parameter. Must be a positive number.",
                    timestamp: new Date().toISOString(),
                };
                return Response.json(errorResponse, { status: 400 });
            }
            thresholds.firstResponseTime = value;
        }
        if (resolutionTimeParam) {
            const value = parseInt(resolutionTimeParam);
            if (isNaN(value) || value <= 0) {
                const errorResponse = {
                    success: false,
                    error: "Invalid resolutionTime parameter. Must be a positive number.",
                    timestamp: new Date().toISOString(),
                };
                return Response.json(errorResponse, { status: 400 });
            }
            thresholds.resolutionTime = value;
        }
        if (businessHoursOnlyParam) {
            thresholds.businessHoursOnly = businessHoursOnlyParam === "true";
        }
        // Validate timeRange parameter
        const validTimeRanges = ["24h", "7d", "30d"];
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
        // Track SLA
        const result = await trackSLA(timeRange, thresholds, supabaseUrl, supabaseKey);
        const response = {
            success: true,
            data: result,
            timestamp: new Date().toISOString(),
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[API] SLA tracking error:", error);
        const errorResponse = {
            success: false,
            error: error.message || "Failed to track SLA",
            timestamp: new Date().toISOString(),
        };
        return Response.json(errorResponse, { status: 500 });
    }
}
//# sourceMappingURL=api.ai-customer.sla-tracking.js.map