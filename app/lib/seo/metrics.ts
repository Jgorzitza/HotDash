/**
 * SEO Metrics and KPI Calculations
 */

export interface SEOMetrics {
  organicSessions: number;
  organicRevenue: number;
  avgPosition: number;
  clickThroughRate: number;
  impressions: number;
  clicks: number;
  conversions: number;
  bounceRate: number;
}

export interface SEOKPIs {
  trafficGrowth: number; // % WoW
  revenueGrowth: number; // % WoW
  positionChange: number; // Avg position delta
  ctrChange: number; // % change
  conversionRate: number; // %
}

/**
 * Calculate SEO KPIs from current and previous metrics
 */
export function calculateSEOKPIs(
  current: SEOMetrics,
  previous: SEOMetrics,
): SEOKPIs {
  const trafficGrowth =
    previous.organicSessions > 0
      ? ((current.organicSessions - previous.organicSessions) /
          previous.organicSessions) *
        100
      : 0;

  const revenueGrowth =
    previous.organicRevenue > 0
      ? ((current.organicRevenue - previous.organicRevenue) /
          previous.organicRevenue) *
        100
      : 0;

  const positionChange = current.avgPosition - previous.avgPosition;

  const ctrChange =
    previous.clickThroughRate > 0
      ? ((current.clickThroughRate - previous.clickThroughRate) /
          previous.clickThroughRate) *
        100
      : 0;

  const conversionRate =
    current.organicSessions > 0
      ? (current.conversions / current.organicSessions) * 100
      : 0;

  return {
    trafficGrowth,
    revenueGrowth,
    positionChange,
    ctrChange,
    conversionRate,
  };
}

/**
 * Calculate Click-Through Rate from impressions and clicks
 */
export function calculateCTR(clicks: number, impressions: number): number {
  return impressions > 0 ? (clicks / impressions) * 100 : 0;
}

/**
 * Calculate organic conversion rate
 */
export function calculateConversionRate(
  conversions: number,
  sessions: number,
): number {
  return sessions > 0 ? (conversions / sessions) * 100 : 0;
}

/**
 * Aggregate metrics over time period
 */
export function aggregateMetrics(dailyMetrics: SEOMetrics[]): SEOMetrics {
  if (dailyMetrics.length === 0) {
    return {
      organicSessions: 0,
      organicRevenue: 0,
      avgPosition: 0,
      clickThroughRate: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      bounceRate: 0,
    };
  }

  const totals = dailyMetrics.reduce(
    (acc, m) => ({
      organicSessions: acc.organicSessions + m.organicSessions,
      organicRevenue: acc.organicRevenue + m.organicRevenue,
      impressions: acc.impressions + m.impressions,
      clicks: acc.clicks + m.clicks,
      conversions: acc.conversions + m.conversions,
      avgPosition: acc.avgPosition + m.avgPosition,
      bounceRate: acc.bounceRate + m.bounceRate,
    }),
    {
      organicSessions: 0,
      organicRevenue: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      avgPosition: 0,
      bounceRate: 0,
    },
  );

  const count = dailyMetrics.length;

  return {
    ...totals,
    avgPosition: totals.avgPosition / count,
    bounceRate: totals.bounceRate / count,
    clickThroughRate: calculateCTR(totals.clicks, totals.impressions),
  };
}
