/**
 * Health Check Endpoint
 *
 * GET /health
 *
 * Returns application health status with subsystem checks.
 * Used by infrastructure monitoring and load balancers.
 *
 * Response time target: <500ms
 */
/**
 * Check database connectivity (Supabase)
 */
async function checkDatabase() {
    const start = Date.now();
    try {
        // Simple connectivity check - try to import the client
        // In production, this would actually ping the database
        const { createClient } = await import("~/lib/supabase.server");
        const client = createClient();
        // For now, just verify client creation succeeds
        // A real implementation would do: await client.from('health_check').select('count').limit(1)
        const responseTime = Date.now() - start;
        return {
            status: "ok",
            responseTime,
        };
    }
    catch (error) {
        return {
            status: "error",
            responseTime: Date.now() - start,
            error: error.message || "Database check failed",
        };
    }
}
/**
 * Check Shopify API connectivity
 */
async function checkShopify() {
    const start = Date.now();
    try {
        // Check if Shopify API key is configured
        if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
            return {
                status: "degraded",
                responseTime: Date.now() - start,
                error: "Shopify credentials not configured",
            };
        }
        // In production, this would make a lightweight API call
        // For now, just verify environment is configured
        const responseTime = Date.now() - start;
        return {
            status: "ok",
            responseTime,
        };
    }
    catch (error) {
        return {
            status: "error",
            responseTime: Date.now() - start,
            error: error.message || "Shopify check failed",
        };
    }
}
/**
 * Health check loader
 */
export async function loader({ request }) {
    const startTime = Date.now();
    // Run health checks in parallel for speed
    const [dbCheck, shopifyCheck] = await Promise.all([
        checkDatabase(),
        checkShopify(),
    ]);
    // Determine overall status
    const allHealthy = dbCheck.status === "ok" && shopifyCheck.status === "ok";
    const anyError = dbCheck.status === "error" || shopifyCheck.status === "error";
    const overallStatus = allHealthy ? "ok" : anyError ? "degraded" : "degraded";
    const response = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        checks: {
            database: dbCheck,
            shopify: shopifyCheck,
        },
    };
    const totalTime = Date.now() - startTime;
    // Add response time header for monitoring
    const headers = new Headers({
        "Content-Type": "application/json",
        "X-Response-Time": `${totalTime}ms`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
    });
    const statusCode = overallStatus === "ok" ? 200 : 503;
    return new Response(JSON.stringify(response, null, 2), {
        status: statusCode,
        headers,
    });
}
/**
 * Default export for health check route
 * (Route doesn't render UI, only returns JSON)
 */
export default function HealthRoute() {
    return null;
}
//# sourceMappingURL=health.js.map