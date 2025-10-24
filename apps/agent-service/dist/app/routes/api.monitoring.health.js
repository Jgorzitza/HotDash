/**
 * Monitoring Health Check API
 *
 * GET /api/monitoring/health
 *
 * Returns current system health status with monitoring metrics.
 * Used by infrastructure monitoring and alerting systems.
 *
 * @see DEVOPS-017
 */
import { getHealthSummary } from "~/lib/monitoring/dashboard";
import { getErrorStats } from "~/lib/monitoring/error-tracker";
import { getPerformanceReport } from "~/lib/monitoring/performance-monitor";
import { getUptimeReport } from "~/lib/monitoring/uptime-monitor";
import { getAlertStats } from "~/lib/monitoring/alert-manager";
/**
 * Health check loader
 */
export async function loader({ request }) {
    try {
        // Get health summary
        const summary = getHealthSummary();
        // Get detailed metrics
        const errorStats = getErrorStats();
        const perfReport = getPerformanceReport(3600000); // Last hour
        const uptimeReport = getUptimeReport(3600000); // Last hour
        const alertStats = getAlertStats();
        const response = {
            status: summary.status,
            message: summary.message,
            timestamp: summary.timestamp,
            metrics: {
                errors: {
                    total: errorStats.totalErrors,
                    critical: errorStats.criticalErrors,
                },
                performance: {
                    routeP95: perfReport.metrics.routes.p95,
                    apiP95: perfReport.metrics.apis.p95,
                },
                uptime: {
                    overall: uptimeReport.overallUptime,
                },
                alerts: {
                    unacknowledged: alertStats.unacknowledged,
                    critical: alertStats.criticalUnacknowledged,
                },
            },
        };
        // Return appropriate HTTP status based on health
        const httpStatus = summary.status === 'healthy' ? 200 :
            summary.status === 'degraded' ? 200 : 503;
        return Response.json(response, {
            status: httpStatus,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    }
    catch (error) {
        console.error('[API] Monitoring health check error:', error);
        const errorResponse = {
            status: 'unhealthy',
            message: `Health check failed: ${error.message}`,
            timestamp: new Date().toISOString(),
            metrics: {
                errors: { total: 0, critical: 0 },
                performance: { routeP95: 0, apiP95: 0 },
                uptime: { overall: 0 },
                alerts: { unacknowledged: 0, critical: 0 },
            },
        };
        return Response.json(errorResponse, { status: 503 });
    }
}
//# sourceMappingURL=api.monitoring.health.js.map