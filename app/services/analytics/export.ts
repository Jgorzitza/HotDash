/**
 * Analytics Data Export
 * 
 * Export analytics data to CSV format.
 */

import { getRevenueMetrics, getTrafficMetrics } from '../../lib/analytics/ga4';
import { getProductPerformance } from '../../lib/analytics/products';
import { getUTMBreakdown } from '../../lib/analytics/utm';

export async function exportRevenueToCSV(): Promise<string> {
  const data = await getRevenueMetrics();
  
  const csv = [
    'Metric,Value,Trend',
    `Total Revenue,$${data.totalRevenue.toFixed(2)},${data.trend.revenueChange.toFixed(1)}%`,
    `Average Order Value,$${data.averageOrderValue.toFixed(2)},${data.trend.aovChange.toFixed(1)}%`,
    `Transactions,${data.transactions},${data.trend.transactionsChange.toFixed(1)}%`,
    `Period,${data.period.start} to ${data.period.end},`,
  ].join('\n');
  
  return csv;
}

export async function exportTrafficToCSV(): Promise<string> {
  const data = await getTrafficMetrics();
  
  const csv = [
    'Metric,Value,Trend',
    `Total Sessions,${data.totalSessions},${data.trend.sessionsChange.toFixed(1)}%`,
    `Organic Sessions,${data.organicSessions},${data.trend.organicChange.toFixed(1)}%`,
    `Organic Percentage,${data.organicPercentage.toFixed(1)}%,`,
    `Period,${data.period.start} to ${data.period.end},`,
  ].join('\n');
  
  return csv;
}

export async function exportProductsToCSV(): Promise<string> {
  const products = await getProductPerformance();
  
  const headers = 'Product Name,Product ID,Views,Add to Carts,Purchases,Revenue,Add to Cart Rate,Purchase Rate,Avg Price';
  const rows = products.map(p => 
    `"${p.productName}",${p.productId},${p.views},${p.addToCarts},${p.purchases},${p.revenue.toFixed(2)},${p.addToCartRate.toFixed(2)}%,${p.purchaseRate.toFixed(2)}%,${p.avgPrice.toFixed(2)}`
  );
  
  return [headers, ...rows].join('\n');
}

export async function exportUTMToCSV(): Promise<string> {
  const utm = await getUTMBreakdown();
  
  const headers = 'Source,Medium,Campaign,Sessions,Users,Conversions,Revenue,Conversion Rate';
  const rows = utm.map(u => 
    `"${u.source}","${u.medium}","${u.campaign}",${u.sessions},${u.users},${u.conversions},${u.revenue.toFixed(2)},${u.conversionRate.toFixed(2)}%`
  );
  
  return [headers, ...rows].join('\n');
}

export function generateCSVFilename(reportType: string): string {
  const date = new Date().toISOString().split('T')[0];
  return `analytics-${reportType}-${date}.csv`;
}

