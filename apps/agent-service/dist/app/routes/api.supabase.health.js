/**
 * Supabase Health Check API
 *
 * GET /api/supabase/health
 *
 * Verifies Supabase connectivity and performance.
 */
import prisma from "~/db.server";
export async function loader({ request }) {
    const start = Date.now();
    try {
        // Test database connectivity
        await prisma.$queryRaw `SELECT 1`;
        const latency = Date.now() - start;
        return Response.json({
            connected: true,
            latency,
            url: process.env.SUPABASE_URL || "not configured",
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        return Response.json({
            connected: false,
            error: error.message || "Supabase health check failed",
            timestamp: new Date().toISOString(),
        }, { status: 503 });
    }
}
//# sourceMappingURL=api.supabase.health.js.map