/**
 * Attribution Panel API Route
 *
 * ANALYTICS-101: API endpoint for action attribution panel data
 * Provides comprehensive attribution analysis with 7/14/28-day performance metrics
 */

import type { LoaderFunctionArgs } from "react-router";
import { 
  generateAttributionPanelData,
  type AttributionPanelData 
} from "~/services/ga/attribution";

export interface AttributionPanelResponse {
  success: boolean;
  data?: AttributionPanelData;
  error?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const startDate = url.searchParams.get("startDate") || 
      new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = url.searchParams.get("endDate") || 
      new Date().toISOString().split('T')[0];

    // Mock growth actions data - in production this would come from database
    const mockActions = [
      {
        actionId: 'action-001',
        actionType: 'seo',
        targetSlug: 'snowboard-collection',
        title: 'SEO Optimization for Snowboard Collection',
        approvedAt: '2025-10-15T10:00:00Z',
        executedAt: '2025-10-15T10:30:00Z',
        expectedImpact: {
          impressions: 5000,
          conversions: 25,
          revenue: 5000,
          roas: 2.5
        }
      },
      {
        actionId: 'action-002',
        actionType: 'ads',
        targetSlug: 'winter-gear',
        title: 'Google Ads Campaign for Winter Gear',
        approvedAt: '2025-10-16T09:00:00Z',
        executedAt: '2025-10-16T09:15:00Z',
        expectedImpact: {
          impressions: 10000,
          conversions: 50,
          revenue: 8000,
          roas: 3.2
        }
      },
      {
        actionId: 'action-003',
        actionType: 'social',
        targetSlug: 'instagram-content',
        title: 'Instagram Content Strategy',
        approvedAt: '2025-10-17T14:00:00Z',
        executedAt: '2025-10-17T14:30:00Z',
        expectedImpact: {
          impressions: 3000,
          conversions: 15,
          revenue: 2500,
          roas: 2.0
        }
      },
      {
        actionId: 'action-004',
        actionType: 'content',
        targetSlug: 'blog-series',
        title: 'Content Marketing Blog Series',
        approvedAt: '2025-10-18T11:00:00Z',
        executedAt: '2025-10-18T11:30:00Z',
        expectedImpact: {
          impressions: 8000,
          conversions: 40,
          revenue: 6000,
          roas: 2.8
        }
      },
      {
        actionId: 'action-005',
        actionType: 'email',
        targetSlug: 'newsletter-campaign',
        title: 'Email Newsletter Campaign',
        approvedAt: '2025-10-19T08:00:00Z',
        executedAt: '2025-10-19T08:30:00Z',
        expectedImpact: {
          impressions: 2000,
          conversions: 20,
          revenue: 3000,
          roas: 4.0
        }
      }
    ];

    // Generate attribution panel data
    const attributionData = await generateAttributionPanelData(
      mockActions,
      startDate,
      endDate
    );

    return Response.json({
      success: true,
      data: attributionData,
    } as AttributionPanelResponse);

  } catch (error) {
    console.error("Attribution Panel API Error:", error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    } as AttributionPanelResponse, { status: 500 });
  }
}
