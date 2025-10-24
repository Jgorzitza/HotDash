/**
 * Growth Engine Performance Analysis API Route
 * 
 * ANALYTICS-PERFORMANCE-001: API endpoint for Growth Engine performance analysis
 * Provides real-time performance metrics, insights, and optimization recommendations
 */

import { type LoaderFunctionArgs} from 'react-router';
import { GrowthEnginePerformanceAnalysisService} from '~/services/analytics/growth-engine-performance-analysis';
import { logDecision} from '~/services/tasks.server';

// Singleton instance for continuous monitoring
let performanceService: GrowthEnginePerformanceAnalysisService | null = null;

/**
 * Initialize performance service if not already running
 */
function getPerformanceService(): GrowthEnginePerformanceAnalysisService {
  if (!performanceService) {
    performanceService = new GrowthEnginePerformanceAnalysisService();
    // Start monitoring with 30-second intervals
    performanceService.startMonitoring(30000);
  }
  return performanceService;
}

/**
 * GET /api/analytics/growth-engine-performance
 * 
 * Query parameters:
 * - action: 'report' | 'insights' | 'plans' | 'metrics' | 'trends'
 * - format: ' ' | 'summary'
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action') || 'report';
  const format = url.searchParams.get('format') || ' ';

  const service = getPerformanceService();

  try {
    switch (action) {
      case 'report': {
        const report = await service.generatePerformanceReport();
        
        if (format === 'summary') {
          return Response.json({
            success: true,
            summary: report.summary,
            insightsCount: report.insights.length,
            plansCount: report.optimizationPlans.length,
            trendsCount: report.trends.length
          });
        }
        
        return Response.json({
          success: true,
          data: report
        });
      }

      case 'insights': {
        const insights = service.getInsights();
        
        await logDecision({
          scope: 'build',
          actor: 'analytics',
          action: 'performance_insights_retrieved',
          rationale: `Retrieved ${insights.length} performance insights`,
          evidenceUrl: 'app/routes/api.analytics.growth-engine-performance.ts'
        });
        
        return Response.json({
          success: true,
          data: insights,
          count: insights.length
        });
      }

      case 'plans': {
        const plans = await service.generateOptimizationPlans();
        
        return Response.json({
          success: true,
          data: plans,
          count: plans.length
        });
      }

      case 'metrics': {
        const metrics = service.getMetricsHistory();
        const limit = parseInt(url.searchParams.get('limit') || '100');
        
        return Response.json({
          success: true,
          data: metrics.slice(-limit),
          count: metrics.length,
          returned: Math.min(limit, metrics.length)
        });
      }

      case 'trends': {
        const report = await service.generatePerformanceReport();
        
        return Response.json({
          success: true,
          data: report.trends
        });
      }

      default:
        return Response.json({
          success: false,
          error: `Unknown action: ${action}`,
          validActions: ['report', 'insights', 'plans', 'metrics', 'trends']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance analysis API error:', error);
    
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'performance_api_error',
      rationale: `Performance analysis API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      evidenceUrl: 'app/routes/api.analytics.growth-engine-performance.ts',
      payload: {
        action,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/analytics/growth-engine-performance
 * 
 * Actions:
 * - start-monitoring: Start performance monitoring
 * - stop-monitoring: Stop performance monitoring
 * - generate-plans: Generate optimization plans
 */
export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('action');

  const service = getPerformanceService();

  try {
    switch (actionType) {
      case 'start-monitoring': {
        const interval = parseInt(formData.get('interval') as string || '30000');
        await service.startMonitoring(interval);
        
        return Response.json({
          success: true,
          message: `Performance monitoring started with ${interval}ms interval`
        });
      }

      case 'stop-monitoring': {
        service.stopMonitoring();
        
        return Response.json({
          success: true,
          message: 'Performance monitoring stopped'
        });
      }

      case 'generate-plans': {
        const plans = await service.generateOptimizationPlans();
        
        return Response.json({
          success: true,
          data: plans,
          count: plans.length
        });
      }

      default:
        return Response.json({
          success: false,
          error: `Unknown action: ${actionType}`,
          validActions: ['start-monitoring', 'stop-monitoring', 'generate-plans']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance analysis action error:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

