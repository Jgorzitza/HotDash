/**
 * Production Analytics Monitoring API
 * 
 * ANALYTICS-004: API endpoints for production monitoring
 */

import type { LoaderFunctionArgs } from 'react-router';
import { ProductionMonitoringService } from '~/services/analytics/production-monitoring';
import { logDecision } from '~/services/decisions.server';

// Singleton instance
let monitoringService: ProductionMonitoringService | null = null;

function getMonitoringService(): ProductionMonitoringService {
  if (!monitoringService) {
    monitoringService = new ProductionMonitoringService();
    monitoringService.startMonitoring(60000); // 1 minute intervals
  }
  return monitoringService;
}

/**
 * GET /api/analytics/monitoring
 * 
 * Query parameters:
 * - action: 'health' | 'metrics' | 'alerts' | 'history'
 * - limit: number (for history)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'health';
  const limit = parseInt(url.searchParams.get('limit') || '100');

  const service = getMonitoringService();

  try {
    switch (action) {
      case 'health': {
        const report = await service.generateHealthReport();
        return Response.json({
          success: true,
          data: report
        });
      }

      case 'metrics': {
        const history = service.getMetricsHistory();
        const latest = history[history.length - 1];
        
        return Response.json({
          success: true,
          data: latest,
          count: history.length
        });
      }

      case 'history': {
        const history = service.getMetricsHistory();
        
        return Response.json({
          success: true,
          data: history.slice(-limit),
          count: history.length,
          returned: Math.min(limit, history.length)
        });
      }

      default:
        return Response.json({
          success: false,
          error: `Unknown action: ${action}`,
          validActions: ['health', 'metrics', 'history']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring API error:', error);
    
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'monitoring_api_error',
      rationale: `Monitoring API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      evidenceUrl: 'app/routes/api.analytics.monitoring.ts'
    });
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/analytics/monitoring
 * 
 * Actions:
 * - start: Start monitoring
 * - stop: Stop monitoring
 */
export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('action');

  const service = getMonitoringService();

  try {
    switch (actionType) {
      case 'start': {
        const interval = parseInt(formData.get('interval') as string || '60000');
        await service.startMonitoring(interval);
        
        return Response.json({
          success: true,
          message: `Monitoring started with ${interval}ms interval`
        });
      }

      case 'stop': {
        service.stopMonitoring();
        
        return Response.json({
          success: true,
          message: 'Monitoring stopped'
        });
      }

      default:
        return Response.json({
          success: false,
          error: `Unknown action: ${actionType}`,
          validActions: ['start', 'stop']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Monitoring action error:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
