/**
 * SEO Success Metrics
 * @module lib/seo/success-metrics
 */

export interface SEOMetrics {
  indexingRate: number;
  avgPosition: number;
  organicTraffic: number;
  clickThroughRate: number;
  conversionRate: number;
  period: string;
}

export interface MetricsTrend {
  metric: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export function calculateMetricsTrend(
  current: SEOMetrics,
  previous: SEOMetrics
): MetricsTrend[] {
  const metrics: Array<{ key: keyof SEOMetrics; name: string }> = [
    { key: 'indexingRate', name: 'Indexing Rate' },
    { key: 'avgPosition', name: 'Average Position' },
    { key: 'organicTraffic', name: 'Organic Traffic' },
    { key: 'clickThroughRate', name: 'Click-Through Rate' },
    { key: 'conversionRate', name: 'Conversion Rate' },
  ];
  
  return metrics.map(({ key, name }) => {
    const currentVal = current[key] as number;
    const previousVal = previous[key] as number;
    const change = currentVal - previousVal;
    const changePercent = previousVal > 0 ? (change / previousVal) : 0;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(changePercent) > 0.05) {
      trend = change > 0 ? 'up' : 'down';
    }
    
    return {
      metric: name,
      current: currentVal,
      previous: previousVal,
      change,
      changePercent,
      trend,
    };
  });
}

export function calculateIndexingRate(indexed: number, total: number): number {
  return total > 0 ? (indexed / total) * 100 : 0;
}
