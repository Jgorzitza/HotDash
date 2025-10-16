/**
 * Product Performance Analytics
 * 
 * Track product views, add-to-cart rates, and purchase conversions.
 */

import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGaConfig } from '../../config/ga.server.ts';
import { appMetrics } from '../../utils/metrics.server.ts';

export interface ProductMetrics {
  productName: string;
  productId: string;
  views: number;
  addToCarts: number;
  purchases: number;
  revenue: number;
  addToCartRate: number;
  purchaseRate: number;
  avgPrice: number;
  trend: number;
}

export async function getProductPerformance(
  dateRange?: { start: string; end: string }
): Promise<ProductMetrics[]> {
  const startTime = Date.now();
  
  try {
    const config = getGaConfig();
    const client = new BetaAnalyticsDataClient();

    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = dateRange?.start || thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = dateRange?.end || today.toISOString().split('T')[0];

    const [response] = await client.runReport({
      property: `properties/${config.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'itemName' },
        { name: 'itemId' },
      ],
      metrics: [
        { name: 'itemsViewed' },
        { name: 'itemsAddedToCart' },
        { name: 'itemsPurchased' },
        { name: 'itemRevenue' },
      ],
      orderBys: [{ metric: { metricName: 'itemRevenue' }, desc: true }],
      limit: 50,
    });

    const products: ProductMetrics[] = (response.rows || []).map((row) => {
      const productName = row.dimensionValues?.[0]?.value || 'Unknown';
      const productId = row.dimensionValues?.[1]?.value || '';
      const views = parseInt(row.metricValues?.[0]?.value || '0', 10);
      const addToCarts = parseInt(row.metricValues?.[1]?.value || '0', 10);
      const purchases = parseInt(row.metricValues?.[2]?.value || '0', 10);
      const revenue = parseFloat(row.metricValues?.[3]?.value || '0');

      const addToCartRate = views > 0 ? (addToCarts / views) * 100 : 0;
      const purchaseRate = views > 0 ? (purchases / views) * 100 : 0;
      const avgPrice = purchases > 0 ? revenue / purchases : 0;

      return {
        productName,
        productId,
        views,
        addToCarts,
        purchases,
        revenue,
        addToCartRate,
        purchaseRate,
        avgPrice,
        trend: 0, // TODO: Calculate trend
      };
    });

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getProductPerformance', true, duration);

    return products;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('getProductPerformance', false, duration);
    throw error;
  }
}

