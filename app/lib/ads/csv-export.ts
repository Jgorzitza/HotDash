/**
 * CSV Export for Ads Performance
 * 
 * Purpose: Export ad performance data to CSV format
 * Owner: ads agent
 * Date: 2025-10-15
 * 
 * Features:
 * - Campaign performance export
 * - Custom column selection
 * - Date range filtering
 * - Multiple export formats
 */

import type { CampaignPerformance } from './tracking';

/**
 * CSV export options
 */
export interface CsvExportOptions {
  includeHeaders: boolean;
  delimiter: string;
  dateFormat: 'iso' | 'us' | 'eu';
  decimalPlaces: number;
}

/**
 * Default export options
 */
const DEFAULT_OPTIONS: CsvExportOptions = {
  includeHeaders: true,
  delimiter: ',',
  dateFormat: 'iso',
  decimalPlaces: 2,
};

/**
 * Escape CSV value
 * 
 * @param value - Value to escape
 * @returns Escaped value
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  const str = String(value);
  
  // If contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Format number for CSV
 * 
 * @param value - Number to format
 * @param decimalPlaces - Number of decimal places
 * @returns Formatted number
 */
function formatNumber(value: number, decimalPlaces: number): string {
  return value.toFixed(decimalPlaces);
}

/**
 * Format date for CSV
 * 
 * @param date - ISO date string
 * @param format - Date format
 * @returns Formatted date
 */
function formatDate(date: string, format: 'iso' | 'us' | 'eu'): string {
  const d = new Date(date);
  
  switch (format) {
    case 'us':
      return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    case 'eu':
      return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    default:
      return date.split('T')[0];
  }
}

/**
 * Export campaign performance to CSV
 * 
 * @param campaigns - Array of campaign performances
 * @param options - Export options
 * @returns CSV string
 */
export function exportCampaignPerformanceToCsv(
  campaigns: CampaignPerformance[],
  options: Partial<CsvExportOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines: string[] = [];

  // Headers
  if (opts.includeHeaders) {
    const headers = [
      'Campaign ID',
      'Campaign Name',
      'Platform',
      'Status',
      'Date Start',
      'Date End',
      'Ad Spend',
      'Revenue',
      'ROAS',
      'Impressions',
      'Clicks',
      'CTR (%)',
      'CPC',
      'Conversions',
      'Conversion Rate (%)',
      'CPA',
      'CPM',
    ];
    lines.push(headers.map(escapeCsvValue).join(opts.delimiter));
  }

  // Data rows
  for (const campaign of campaigns) {
    const row = [
      campaign.campaignId,
      campaign.campaignName,
      campaign.platform,
      campaign.status,
      formatDate(campaign.dateStart, opts.dateFormat),
      formatDate(campaign.dateEnd, opts.dateFormat),
      formatNumber(campaign.adSpend, opts.decimalPlaces),
      formatNumber(campaign.revenue, opts.decimalPlaces),
      formatNumber(campaign.roas, opts.decimalPlaces),
      campaign.impressions,
      campaign.clicks,
      formatNumber(campaign.ctr, opts.decimalPlaces),
      formatNumber(campaign.cpc, opts.decimalPlaces),
      campaign.conversions,
      formatNumber(campaign.conversionRate, opts.decimalPlaces),
      formatNumber(campaign.cpa, opts.decimalPlaces),
      formatNumber(campaign.cpm, opts.decimalPlaces),
    ];
    lines.push(row.map(escapeCsvValue).join(opts.delimiter));
  }

  return lines.join('\n');
}

/**
 * Export aggregated performance to CSV
 * 
 * @param data - Aggregated performance data
 * @param options - Export options
 * @returns CSV string
 */
export function exportAggregatedPerformanceToCsv(
  data: {
    dateStart: string;
    dateEnd: string;
    totalCampaigns: number;
    totalAdSpend: number;
    totalRevenue: number;
    aggregatedRoas: number;
    totalImpressions: number;
    totalClicks: number;
    aggregatedCtr: number;
    totalConversions: number;
    aggregatedConversionRate: number;
    averageCpc: number;
    averageCpa: number;
    averageCpm: number;
  },
  options: Partial<CsvExportOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines: string[] = [];

  // Headers
  if (opts.includeHeaders) {
    lines.push(['Metric', 'Value'].join(opts.delimiter));
  }

  // Data rows
  const rows = [
    ['Date Range', `${formatDate(data.dateStart, opts.dateFormat)} - ${formatDate(data.dateEnd, opts.dateFormat)}`],
    ['Total Campaigns', data.totalCampaigns],
    ['Total Ad Spend', formatNumber(data.totalAdSpend, opts.decimalPlaces)],
    ['Total Revenue', formatNumber(data.totalRevenue, opts.decimalPlaces)],
    ['Aggregated ROAS', formatNumber(data.aggregatedRoas, opts.decimalPlaces)],
    ['Total Impressions', data.totalImpressions],
    ['Total Clicks', data.totalClicks],
    ['Aggregated CTR (%)', formatNumber(data.aggregatedCtr, opts.decimalPlaces)],
    ['Total Conversions', data.totalConversions],
    ['Aggregated Conversion Rate (%)', formatNumber(data.aggregatedConversionRate, opts.decimalPlaces)],
    ['Average CPC', formatNumber(data.averageCpc, opts.decimalPlaces)],
    ['Average CPA', formatNumber(data.averageCpa, opts.decimalPlaces)],
    ['Average CPM', formatNumber(data.averageCpm, opts.decimalPlaces)],
  ];

  for (const row of rows) {
    lines.push(row.map(escapeCsvValue).join(opts.delimiter));
  }

  return lines.join('\n');
}

/**
 * Export platform comparison to CSV
 * 
 * @param byPlatform - Platform performance data
 * @param options - Export options
 * @returns CSV string
 */
export function exportPlatformComparisonToCsv(
  byPlatform: Record<string, {
    campaigns: number;
    adSpend: number;
    revenue: number;
    roas: number;
    cpc: number;
    cpm: number;
    cpa: number;
    ctr: number;
    conversionRate: number;
  }>,
  options: Partial<CsvExportOptions> = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const lines: string[] = [];

  // Headers
  if (opts.includeHeaders) {
    const headers = [
      'Platform',
      'Campaigns',
      'Ad Spend',
      'Revenue',
      'ROAS',
      'CPC',
      'CPM',
      'CPA',
      'CTR (%)',
      'Conversion Rate (%)',
    ];
    lines.push(headers.map(escapeCsvValue).join(opts.delimiter));
  }

  // Data rows
  for (const [platform, data] of Object.entries(byPlatform)) {
    const row = [
      platform.charAt(0).toUpperCase() + platform.slice(1),
      data.campaigns,
      formatNumber(data.adSpend, opts.decimalPlaces),
      formatNumber(data.revenue, opts.decimalPlaces),
      formatNumber(data.roas, opts.decimalPlaces),
      formatNumber(data.cpc, opts.decimalPlaces),
      formatNumber(data.cpm, opts.decimalPlaces),
      formatNumber(data.cpa, opts.decimalPlaces),
      formatNumber(data.ctr, opts.decimalPlaces),
      formatNumber(data.conversionRate, opts.decimalPlaces),
    ];
    lines.push(row.map(escapeCsvValue).join(opts.delimiter));
  }

  return lines.join('\n');
}

/**
 * Generate CSV download response
 * 
 * @param csvContent - CSV content string
 * @param filename - Filename for download
 * @returns Response object for download
 */
export function generateCsvDownloadResponse(
  csvContent: string,
  filename: string
): {
  content: string;
  headers: Record<string, string>;
} {
  return {
    content: csvContent,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
    },
  };
}

