/**
 * Inventory Health Metrics API Route
 * 
 * INVENTORY-022: Production Inventory Monitoring & Alerts
 * 
 * GET /api/inventory/health-metrics
 * 
 * Returns comprehensive inventory health metrics for the dashboard.
 */

import type { LoaderFunctionArgs } from 'react-router';
import { json } from '~/utils/http.server';
import { getInventoryHealthSnapshot } from '~/services/inventory/health-monitor';
import { logDecision } from '~/services/decisions.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const snapshot = await getInventoryHealthSnapshot();
    const metrics = snapshot.metrics;

    await logDecision({
      scope: 'build',
      actor: 'inventory',
      action: 'inventory_health_metrics',
      rationale: `Inventory health ${metrics.overallHealth} | Alerts: ${metrics.activeAlerts}`,
      evidenceUrl: 'app/routes/api.inventory.health-metrics.ts',
      status: 'completed',
      progressPct: 100,
    });

    return json({
      success: true,
      metrics,
      ropAlerts: snapshot.ropAlerts,
    });
  } catch (error) {
    console.error('Error fetching inventory health metrics:', error);

    await logDecision({
      scope: 'build',
      actor: 'inventory',
      action: 'inventory_health_metrics_error',
      rationale: `Failed to fetch inventory health metrics: ${error}`,
      evidenceUrl: 'app/routes/api.inventory.health-metrics.ts',
      status: 'failed',
      progressPct: 0,
    });

    return json(
      {
        success: false,
        error: 'Failed to fetch inventory health metrics',
      },
      { status: 500 }
    );
  }
}
