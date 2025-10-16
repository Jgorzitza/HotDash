/**
 * Ads Anomalies API Route
 * 
 * Purpose: API endpoint for detecting performance anomalies
 * Owner: ads agent
 * Date: 2025-10-16
 */


import { createAdapter, getAdapterConfig } from '../../lib/ads/adapters';
import { calculateCampaignPerformance } from '../../lib/ads/tracking';
import { detectAllAnomalies, type AnomalyAlert } from '../../lib/ads/anomaly-detection';
import { adsTelemetry } from '../../lib/ads/telemetry';
import type { AdPlatform } from '../../lib/ads/tracking';

export async function loader({ request }: any) {
  const startTime = Date.now();
  const url = new URL(request.url);
  
  const platform = url.searchParams.get('platform') as AdPlatform | null;
  const campaignId = url.searchParams.get('campaignId');
  const severity = url.searchParams.get('severity') as 'critical' | 'warning' | 'info' | null;
  
  try {
    // Fetch current campaigns
    const config = getAdapterConfig(process.env.NODE_ENV as any || 'development');
    const platforms: AdPlatform[] = platform ? [platform] : ['meta', 'google', 'tiktok'];
    
    const today = new Date().toISOString().split('T')[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const allCampaigns = [];
    for (const p of platforms) {
      const adapter = createAdapter(p, config);
      
      if (campaignId) {
        const campaign = await adapter.fetchCampaignById(campaignId);
        allCampaigns.push(campaign);
      } else {
        const campaigns = await adapter.fetchCampaigns(thirtyDaysAgo, today);
        allCampaigns.push(...campaigns);
      }
    }
    
    // Detect anomalies for each campaign
    const allAnomalies: (AnomalyAlert & { campaignId: string; campaignName: string })[] = [];
    
    for (const campaign of allCampaigns) {
      const performance = calculateCampaignPerformance(campaign);
      
      // Generate mock historical data (in production, fetch from database)
      const historicalSpend = Array(30).fill(campaign.adSpend / 30);
      const historicalRoas = Array(30).fill(performance.roas);
      const historicalCtr = Array(30).fill(performance.ctr);
      const historicalConversionRate = Array(30).fill(performance.conversionRate);
      const historicalCpa = Array(30).fill(performance.cpa);
      
      const anomalies = detectAllAnomalies(
        {
          spend: campaign.adSpend / 30, // Daily spend
          roas: performance.roas,
          ctr: performance.ctr,
          conversionRate: performance.conversionRate,
          cpa: performance.cpa,
        },
        {
          spend: historicalSpend,
          roas: historicalRoas,
          ctr: historicalCtr,
          conversionRate: historicalConversionRate,
          cpa: historicalCpa,
        }
      );
      
      // Add campaign context to anomalies
      for (const anomaly of anomalies) {
        allAnomalies.push({
          ...anomaly,
          campaignId: campaign.campaignId,
          campaignName: campaign.campaignName,
        });
      }
    }
    
    // Filter by severity if specified
    let filteredAnomalies = allAnomalies;
    if (severity) {
      filteredAnomalies = allAnomalies.filter(a => a.severity === severity);
    }
    
    // Sort by severity (critical first)
    filteredAnomalies.sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
    
    // Record telemetry
    const duration = Date.now() - startTime;
    adsTelemetry.recordEvent({
      eventType: 'calculation',
      operation: 'detect_anomalies',
      durationMs: duration,
      metadata: {
        campaignCount: allCampaigns.length,
        anomalyCount: filteredAnomalies.length,
      },
    });
    
    return Response.json({
      anomalies: filteredAnomalies,
      summary: {
        total: filteredAnomalies.length,
        critical: filteredAnomalies.filter(a => a.severity === 'critical').length,
        warning: filteredAnomalies.filter(a => a.severity === 'warning').length,
        info: filteredAnomalies.filter(a => a.severity === 'info').length,
      },
      meta: {
        platform: platform || 'all',
        campaignId: campaignId || 'all',
        campaignCount: allCampaigns.length,
      },
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    adsTelemetry.recordEvent({
      eventType: 'error',
      operation: 'detect_anomalies',
      durationMs: duration,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    
    return Response.json(
      {
        error: 'Failed to detect anomalies',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

