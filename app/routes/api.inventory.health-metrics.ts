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
import prisma from '~/db.server';
import { logDecision } from '~/services/decisions.server';

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    // Fetch all active inventory alerts
    const activeAlerts = await prisma.inventory_alert.findMany({
      where: {
        acknowledged: false,
      },
    });

    // Fetch all reorder suggestions
    const ropSuggestions = await prisma.reorder_suggestion.findMany({
      where: {
        status: 'pending',
      },
    });

    // Calculate stock level distribution
    // In production, this would query actual inventory data from Shopify
    // For now, we'll use mock data based on alerts
    const totalProducts = 100; // Mock value - would come from Shopify inventory count
    const outOfStock = activeAlerts.filter(a => a.alertType === 'out_of_stock').length;
    const lowStock = activeAlerts.filter(a => a.alertType === 'low_stock' || a.alertType === 'reorder_point').length;
    const overstock = activeAlerts.filter(a => a.alertType === 'overstock').length;
    const inStock = totalProducts - outOfStock - lowStock - overstock;

    // Calculate ROP compliance
    const productsAboveROP = totalProducts - ropSuggestions.length;
    const ropCompliance = (productsAboveROP / totalProducts) * 100;

    // Calculate average days to stockout
    const daysToStockout = ropSuggestions
      .map(r => r.days_until_stockout || 0)
      .filter(d => d > 0);
    const avgDaysToStockout = daysToStockout.length > 0
      ? daysToStockout.reduce((sum, d) => sum + d, 0) / daysToStockout.length
      : 0;

    // Count critical alerts
    const criticalAlerts = activeAlerts.filter(a => a.severity === 'critical').length;

    // Count emergency sourcing needed (products with < 7 days to stockout)
    const emergencySourcingNeeded = ropSuggestions.filter(r => (r.days_until_stockout || 999) < 7).length;

    // Determine overall health status
    let overallHealth: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (criticalAlerts > 0 || outOfStock > 5 || ropCompliance < 75) {
      overallHealth = 'critical';
    } else if (lowStock > 10 || ropCompliance < 90 || emergencySourcingNeeded > 0) {
      overallHealth = 'warning';
    }

    const metrics = {
      overallHealth,
      totalProducts,
      inStock,
      lowStock,
      outOfStock,
      overstock,
      activeAlerts: activeAlerts.length,
      criticalAlerts,
      ropCompliance,
      avgDaysToStockout,
      emergencySourcingNeeded,
      lastUpdated: new Date().toISOString(),
    };

    await logDecision({
      scope: 'build',
      actor: 'inventory',
      action: 'fetch_health_metrics',
      rationale: `Fetched inventory health metrics: ${overallHealth} status, ${activeAlerts.length} alerts`,
      evidenceUrl: 'app/routes/api.inventory.health-metrics.ts',
      status: 'completed',
      progressPct: 100,
    });

    return json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error fetching inventory health metrics:', error);

    await logDecision({
      scope: 'build',
      actor: 'inventory',
      action: 'fetch_health_metrics_error',
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

