/**
 * Export Launch Metrics to Google Analytics API
 *
 * Task: ANALYTICS-LAUNCH-001
 *
 * POST /api/analytics/export-to-ga
 *
 * Exports current launch metrics to Google Analytics
 */
import { getLaunchMetrics } from "~/services/metrics/launch-metrics";
import { exportLaunchMetricsToGA } from "~/services/analytics/ga-export";
export async function action({ request }) {
    if (request.method !== 'POST') {
        return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }
    try {
        // Get current metrics
        const metrics = await getLaunchMetrics();
        // Export to GA
        const result = await exportLaunchMetricsToGA(metrics);
        if (result.success) {
            return Response.json({
                success: true,
                message: `Successfully exported ${result.eventsExported} metrics to Google Analytics`,
                eventsExported: result.eventsExported,
            });
        }
        else {
            return Response.json({
                success: false,
                message: 'Export failed',
                errors: result.errors,
            }, { status: 500 });
        }
    }
    catch (error) {
        console.error('[Export to GA] Error:', error);
        return Response.json({
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.analytics.export-to-ga.js.map