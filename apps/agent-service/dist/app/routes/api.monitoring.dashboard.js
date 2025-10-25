/**
 * Monitoring Dashboard API
 *
 * GET /api/monitoring/dashboard?period=1h
 *
 * Returns comprehensive monitoring metrics for dashboard display.
 *
 * Query Parameters:
 * - period: '1h' | '24h' | '7d' (optional, default: '1h')
 *
 * @see DEVOPS-017
 */
import { getDashboardMetrics } from "~/lib/monitoring/dashboard";
/**
 * Parse period parameter to milliseconds
 */
function parsePeriod(period) {
    switch (period) {
        case '1h':
            return 3600000; // 1 hour
        case '24h':
            return 86400000; // 24 hours
        case '7d':
            return 604800000; // 7 days
        default:
            return 3600000; // Default to 1 hour
    }
}
/**
 * Dashboard metrics loader
 */
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const period = url.searchParams.get('period');
        const periodMs = parsePeriod(period);
        // Get dashboard metrics
        const metrics = getDashboardMetrics(periodMs);
        const response = {
            success: true,
            data: metrics,
            timestamp: new Date().toISOString(),
        };
        return Response.json(response, {
            headers: {
                'Cache-Control': 'public, max-age=60', // Cache for 1 minute
            },
        });
    }
    catch (error) {
        console.error('[API] Monitoring dashboard error:', error);
        const errorResponse = {
            success: false,
            error: error.message || 'Failed to fetch monitoring metrics',
            timestamp: new Date().toISOString(),
        };
        return Response.json(errorResponse, { status: 500 });
    }
}
//# sourceMappingURL=api.monitoring.dashboard.js.map