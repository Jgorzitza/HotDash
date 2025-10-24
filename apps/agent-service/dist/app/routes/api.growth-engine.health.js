/**
 * Growth Engine Health Check API Route
 *
 * Provides health status for monitoring and alerting
 *
 * Task: ENG-003
 */
import { GrowthEnginePerformance, defaultPerformanceConfig } from "~/services/growth-engine-performance";
import prisma from "~/db.server";
// Track service start time
const startTime = Date.now();
/**
 * GET /api/growth-engine/health
 *
 * Returns health status of all Growth Engine components
 */
export async function loader({ request }) {
    const checks = {};
    let overallStatus = 'healthy';
    try {
        // Check database connection
        try {
            await prisma.$queryRaw `SELECT 1`;
            checks.database = 'ok';
        }
        catch (error) {
            checks.database = 'error';
            overallStatus = 'unhealthy';
        }
        // Check performance metrics
        try {
            const performance = new GrowthEnginePerformance(defaultPerformanceConfig);
            const metrics = performance.getMetrics();
            // Check if metrics are within acceptable ranges
            if (metrics.system.cpuUsage > 90) {
                checks.cpu = 'warning';
                overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
            }
            else {
                checks.cpu = 'ok';
            }
            if (metrics.system.memoryUsage > 90) {
                checks.memory = 'warning';
                overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
            }
            else {
                checks.memory = 'ok';
            }
            if (metrics.cache.hitRate < 30) {
                checks.cache = 'warning';
                overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
            }
            else {
                checks.cache = 'ok';
            }
            if (metrics.application.errorRate > 5) {
                checks.errorRate = 'warning';
                overallStatus = overallStatus === 'healthy' ? 'degraded' : overallStatus;
            }
            else {
                checks.errorRate = 'ok';
            }
        }
        catch (error) {
            checks.performance = 'error';
            overallStatus = 'degraded';
        }
        // Calculate uptime
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const response = {
            status: overallStatus,
            checks,
            uptime,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
        };
        // Return appropriate HTTP status code
        const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;
        return Response.json(response, { status: statusCode });
    }
    catch (error) {
        return Response.json({
            status: 'unhealthy',
            error: error.message,
            timestamp: new Date().toISOString(),
        }, { status: 503 });
    }
}
//# sourceMappingURL=api.growth-engine.health.js.map