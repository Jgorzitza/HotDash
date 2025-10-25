/**
 * Action Attribution API Route
 * 
 * ANALYTICS-002: API endpoint for action attribution and ROI measurement
 * Provides data for the Action Attribution Dashboard
 */

import type { LoaderFunctionArgs } from "react-router";
import { 
  generateAttributionReport, 
  getEnhancedActionAttribution,
  generateAttributionInsights 
} from "~/services/analytics/action-attribution-enhanced";
import { logDecision } from "~/services/decisions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const timeframe = (url.searchParams.get('timeframe') as '7d' | '14d' | '28d') || '28d';
    const actionKey = url.searchParams.get('actionKey');
    
    console.log(`[Action Attribution API] Loading data for timeframe: ${timeframe}, actionKey: ${actionKey || 'all'}`);

    if (actionKey) {
      // Get specific action attribution
      const attributionData = await getEnhancedActionAttribution(actionKey, timeframe);
      
      await logDecision({
        scope: "build",
        actor: "analytics",
        action: "action_attribution_api_call",
        rationale: `API call for specific action attribution: ${actionKey}`,
        evidenceUrl: request.url
      });

      return Response.json({
        success: true,
        data: attributionData,
        timeframe,
        actionKey,
        generatedAt: new Date().toISOString()
      });
    } else {
      // Get comprehensive attribution report
      const report = await generateAttributionReport(timeframe);
      
      await logDecision({
        scope: "build",
        actor: "analytics",
        action: "action_attribution_report_generated",
        rationale: `Generated comprehensive attribution report for ${timeframe}`,
        evidenceUrl: request.url,
        payload: {
          timeframe,
          totalActions: report.insights.topPerformingActions.length + report.insights.underperformingActions.length,
          totalRevenue: report.summary.totalRevenue,
          confidenceScore: report.insights.confidenceScore
        }
      });

      return Response.json({
        success: true,
        data: report,
        generatedAt: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error("[Action Attribution API] Error:", error.message);
    
    await logDecision({
      scope: "build",
      actor: "analytics",
      action: "action_attribution_api_error",
      rationale: `API error: ${error.message}`,
      evidenceUrl: request.url,
      payload: {
        error: error.message,
        stack: error.stack
      }
    });

    return Response.json({
      success: false,
      error: error.message,
      generatedAt: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function action({ request }: LoaderFunctionArgs) {
  try {
    const formData = await request.formData();
    const actionType = formData.get('actionType') as string;
    
    console.log(`[Action Attribution API] Action: ${actionType}`);

    switch (actionType) {
      case 'refresh':
        // Trigger refresh of attribution data
        const { generateAttributionReport } = await import("~/services/analytics/action-attribution-enhanced");
        const report = await generateAttributionReport('28d');
        
        await logDecision({
          scope: "build",
          actor: "analytics",
          action: "action_attribution_refresh",
          rationale: `Manual refresh of attribution data triggered`,
          evidenceUrl: request.url
        });

        return Response.json({
          success: true,
          message: "Attribution data refreshed successfully",
          data: report,
          generatedAt: new Date().toISOString()
        });

      case 'generate_insights':
        // Generate insights for specific timeframe
        const timeframe = formData.get('timeframe') as '7d' | '14d' | '28d' || '28d';
        const { generateAttributionReport: generateReport } = await import("~/services/analytics/action-attribution-enhanced");
        const insightsReport = await generateReport(timeframe);
        
        await logDecision({
          scope: "build",
          actor: "analytics",
          action: "action_attribution_insights_generated",
          rationale: `Generated insights for ${timeframe}`,
          evidenceUrl: request.url,
          payload: {
            timeframe,
            insightsCount: insightsReport.insights.optimizationOpportunities.length,
            recommendationsCount: insightsReport.recommendations.length
          }
        });

        return Response.json({
          success: true,
          message: "Insights generated successfully",
          data: insightsReport,
          generatedAt: new Date().toISOString()
        });

      default:
        return Response.json({
          success: false,
          error: "Invalid action type",
          generatedAt: new Date().toISOString()
        }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[Action Attribution API] Action error:", error.message);
    
    await logDecision({
      scope: "build",
      actor: "analytics",
      action: "action_attribution_action_error",
      rationale: `Action error: ${error.message}`,
      evidenceUrl: request.url,
      payload: {
        error: error.message,
        stack: error.stack
      }
    });

    return Response.json({
      success: false,
      error: error.message,
      generatedAt: new Date().toISOString()
    }, { status: 500 });
  }
}
