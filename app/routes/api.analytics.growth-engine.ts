/**
 * Growth Engine Advanced Analytics API
 *
 * Provides comprehensive analytics data for Growth Engine phases 9-12
 * including attribution modeling, performance optimization, and insights.
 */

import type { LoaderFunctionArgs } from "react-router";
import { 
  generateGrowthEngineAnalytics, 
  exportGrowthEngineAnalytics,
  getMockGrowthEngineData,
  type GrowthEngineAnalytics 
} from "~/services/analytics/growthEngineAdvanced";

export interface GrowthEngineResponse {
  success: boolean;
  data?: {
    analytics: GrowthEngineAnalytics;
    timeframe: string;
    period: {
      start: string;
      end: string;
    };
    generatedAt: string;
  };
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate") || 
      new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = url.searchParams.get("endDate") || 
      new Date().toISOString();
    const timeframe = url.searchParams.get("timeframe") || "28d";

    // For now, use mock data - in production this would fetch from database
    const { actions, attributionData } = getMockGrowthEngineData();

    // Generate analytics
    const analytics = await generateGrowthEngineAnalytics(
      actions,
      attributionData,
      startDate,
      endDate
    );

    // Export for dashboard
    const exportedData = exportGrowthEngineAnalytics(analytics);

    return Response.json({
      success: true,
      data: exportedData,
    } as GrowthEngineResponse);

  } catch (error) {
    console.error("Growth Engine Analytics API Error:", error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    } as GrowthEngineResponse, { status: 500 });
  }
}