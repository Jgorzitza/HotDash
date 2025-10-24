/**
 * Monitoring Alerts API
 *
 * GET /api/monitoring/alerts - Get all alerts
 * POST /api/monitoring/alerts/:id/acknowledge - Acknowledge an alert
 *
 * Manages monitoring alerts and acknowledgments.
 *
 * @see DEVOPS-017
 */
import { getUnacknowledgedAlerts, acknowledgeAlert, getAlertStats } from "~/lib/monitoring/alert-manager";
import { AlertManager } from "~/lib/monitoring/alert-manager";
/**
 * Get alerts loader
 */
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const unacknowledgedOnly = url.searchParams.get('unacknowledged') === 'true';
        const alertManager = AlertManager.getInstance();
        const alerts = unacknowledgedOnly
            ? getUnacknowledgedAlerts()
            : alertManager.getAllAlerts();
        const stats = getAlertStats();
        const response = {
            success: true,
            data: {
                alerts,
                stats,
            },
            timestamp: new Date().toISOString(),
        };
        return Response.json(response, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    }
    catch (error) {
        console.error('[API] Monitoring alerts error:', error);
        const errorResponse = {
            success: false,
            error: error.message || 'Failed to fetch alerts',
            timestamp: new Date().toISOString(),
        };
        return Response.json(errorResponse, { status: 500 });
    }
}
/**
 * Acknowledge alert action
 */
export async function action({ request }) {
    try {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const alertId = pathParts[pathParts.length - 2]; // Get ID from path
        if (request.method !== 'POST') {
            return Response.json({ success: false, error: 'Method not allowed' }, { status: 405 });
        }
        const body = await request.json();
        const acknowledgedBy = body.acknowledgedBy || 'system';
        const success = acknowledgeAlert(alertId, acknowledgedBy);
        if (!success) {
            const errorResponse = {
                success: false,
                error: 'Alert not found',
                timestamp: new Date().toISOString(),
            };
            return Response.json(errorResponse, { status: 404 });
        }
        const response = {
            success: true,
            message: 'Alert acknowledged successfully',
            timestamp: new Date().toISOString(),
        };
        return Response.json(response);
    }
    catch (error) {
        console.error('[API] Acknowledge alert error:', error);
        const errorResponse = {
            success: false,
            error: error.message || 'Failed to acknowledge alert',
            timestamp: new Date().toISOString(),
        };
        return Response.json(errorResponse, { status: 500 });
    }
}
//# sourceMappingURL=api.monitoring.alerts.js.map