/**
 * Ads Export API Route
 * 
 * Purpose: API endpoint for exporting ad performance data to CSV
 * Owner: ads agent
 * Date: 2025-10-16
 */

import { type LoaderFunctionArgs } from 'react-router';
import { createAdapter, getAdapterConfig } from '../../lib/ads/adapters';
import { calculateCampaignPerformance, aggregateCampaignPerformance } from '../../lib/ads/tracking';
import {
  exportCampaignPerformanceToCsv,
  exportAggregatedPerformanceToCsv,
  exportPlatformComparisonToCsv,
  generateCsvDownloadResponse,
} from '../../lib/ads/csv-export';
import { adsTelemetry } from '../../lib/ads/telemetry';
import type { AdPlatform } from '../../lib/ads/tracking';

export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();
  const url = new URL(request.url);
  
  const exportType = url.searchParams.get('type') || 'campaigns';
  const platform = url.searchParams.get('platform') as AdPlatform | null;
  const dateStart = url.searchParams.get('dateStart') || getDefaultStartDate();
  const dateEnd = url.searchParams.get('dateEnd') || getDefaultEndDate();
  const format = url.searchParams.get('format') || 'csv';
  
  try {
    // Fetch campaigns
    const config = getAdapterConfig(process.env.NODE_ENV as any || 'development');
    const platforms: AdPlatform[] = platform ? [platform] : ['meta', 'google', 'tiktok'];
    
    const allCampaigns = [];
    for (const p of platforms) {
      const adapter = createAdapter(p, config);
      const campaigns = await adapter.fetchCampaigns(dateStart, dateEnd);
      allCampaigns.push(...campaigns);
    }
    
    const campaignsWithPerformance = allCampaigns.map(calculateCampaignPerformance);
    
    let csvContent: string;
    let filename: string;
    
    switch (exportType) {
      case 'campaigns':
        csvContent = exportCampaignPerformanceToCsv(campaignsWithPerformance);
        filename = `campaigns_${dateStart}_${dateEnd}.csv`;
        break;
        
      case 'aggregated':
        const aggregated = aggregateCampaignPerformance(allCampaigns);
        csvContent = exportAggregatedPerformanceToCsv(aggregated);
        filename = `aggregated_${dateStart}_${dateEnd}.csv`;
        break;
        
      case 'platforms':
        const aggregatedForPlatforms = aggregateCampaignPerformance(allCampaigns);
        csvContent = exportPlatformComparisonToCsv(aggregatedForPlatforms.byPlatform);
        filename = `platforms_${dateStart}_${dateEnd}.csv`;
        break;
        
      default:
        throw new Error(`Unknown export type: ${exportType}`);
    }
    
    // Record telemetry
    const duration = Date.now() - startTime;
    adsTelemetry.recordEvent({
      eventType: 'api_call',
      operation: 'export_csv',
      durationMs: duration,
      metadata: { exportType, campaignCount: allCampaigns.length },
    });
    
    // Generate download response
    const response = generateCsvDownloadResponse(csvContent, filename);
    
    return new Response(response.content, {
      headers: response.headers,
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    adsTelemetry.recordEvent({
      eventType: 'error',
      operation: 'export_csv',
      durationMs: duration,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    
    return new Response(
      JSON.stringify({
        error: 'Failed to export data',
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
}

