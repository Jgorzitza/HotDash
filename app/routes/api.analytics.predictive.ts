/**
 * Predictive Analytics API Route
 * 
 * ANALYTICS-003: API endpoints for predictive analytics
 */

import { type LoaderFunctionArgs} from 'react-router';
import { 
  generatePredictiveInsights,
  predictCustomerBehavior,
  generateSalesForecast
} from '~/services/analytics/predictive-analytics';
import { logDecision} from '~/services/decisions.server';

/**
 * GET /api/analytics/predictive
 * 
 * Query parameters:
 * - type: 'insights' | 'customers' | 'sales' | 'all'
 * - days: 7 | 14 | 30 (for sales forecasts)
 * - customerId: string (optional, for customer-specific predictions)
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'all';
  const days = parseInt(url.searchParams.get('days') || '30') as 7 | 14 | 30;
  const customerId = url.searchParams.get('customerId') || undefined;

  try {
    switch (type) {
      case 'insights': {
        const insights = await generatePredictiveInsights();
        return Response.json({
          success: true,
          data: insights
        });
      }

      case 'customers': {
        const predictions = await predictCustomerBehavior(customerId);
        
        await logDecision({
          scope: 'build',
          actor: 'analytics',
          action: 'customer_predictions_retrieved',
          rationale: `Retrieved predictions for ${predictions.length} customers`,
          evidenceUrl: 'app/routes/api.analytics.predictive.ts'
        });
        
        return Response.json({
          success: true,
          data: predictions,
          count: predictions.length
        });
      }

      case 'sales': {
        const forecast = await generateSalesForecast(days);
        
        return Response.json({
          success: true,
          data: forecast
        });
      }

      case 'all': {
        const insights = await generatePredictiveInsights();
        
        return Response.json({
          success: true,
          data: insights
        });
      }

      default:
        return Response.json({
          success: false,
          error: `Unknown type: ${type}`,
          validTypes: ['insights', 'customers', 'sales', 'all']
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Predictive analytics API error:', error);
    
    await logDecision({
      scope: 'build',
      actor: 'analytics',
      action: 'predictive_api_error',
      rationale: `Predictive analytics API error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      evidenceUrl: 'app/routes/api.analytics.predictive.ts',
      payload: {
        type,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

