/**
 * Growth Dashboard Metrics Service
 * 
 * Aggregates metrics across social, SEO, and ads channels
 * Provides weekly growth reports and trend analysis
 * Consolidates CTR, impressions, conversions data
 * Stores in DashboardFact table with factType="growth_metrics"
 */

import prisma from "~/db.server";

export interface GrowthMetrics {
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCTR: number;
  avgConversionRate: number;
  totalRevenue: number;
  totalSpend: number;
  overallROAS: number;
}

export interface WeeklyGrowthReport {
  week: string; // ISO week (YYYY-Www)
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  spend: number;
  ctr: number;
  conversionRate: number;
  roas: number;
  weekOverWeekGrowth: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

export interface TrendAnalysis {
  channel: "social" | "seo" | "ads" | "overall";
  trend: "up" | "down" | "stable";
  changePercent: number;
  currentValue: number;
  previousValue: number;
  metric: string; // "impressions", "clicks", "conversions", etc.
}

export interface DashboardMetrics {
  current: GrowthMetrics;
  previous: GrowthMetrics;
  weeklyReports: WeeklyGrowthReport[];
  trends: TrendAnalysis[];
  topPerformers: Array<{
    channel: string;
    metric: string;
    value: number;
    change: number;
  }>;
}

/**
 * Get consolidated growth metrics across all channels
 */
export async function getGrowthMetrics(
  shopDomain: string = "occ",
  days: number = 30
): Promise<GrowthMetrics> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Aggregate social metrics
  const socialMetrics = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "social_performance",
      createdAt: { gte: since },
    },
  });

  // Aggregate ads metrics
  const adsMetrics = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "ads_roas",
      createdAt: { gte: since },
    },
  });

  // Calculate totals
  const social = aggregateSocialMetrics(socialMetrics);
  const ads = aggregateAdsMetrics(adsMetrics);

  const totalImpressions = social.impressions + ads.impressions;
  const totalClicks = social.clicks + ads.clicks;
  const totalConversions = ads.conversions; // Social doesn't track conversions
  const totalRevenue = ads.revenue;
  const totalSpend = ads.spend;

  const avgCTR = totalImpressions > 0
    ? (totalClicks / totalImpressions) * 100
    : 0;

  const avgConversionRate = totalClicks > 0
    ? (totalConversions / totalClicks) * 100
    : 0;

  const overallROAS = totalSpend > 0
    ? totalRevenue / totalSpend
    : 0;

  return {
    totalImpressions,
    totalClicks,
    totalConversions,
    avgCTR: Number(avgCTR.toFixed(2)),
    avgConversionRate: Number(avgConversionRate.toFixed(2)),
    totalRevenue,
    totalSpend,
    overallROAS: Number(overallROAS.toFixed(2)),
  };
}

/**
 * Generate weekly growth report
 */
export async function getWeeklyGrowthReport(
  shopDomain: string = "occ",
  weeks: number = 4
): Promise<WeeklyGrowthReport[]> {
  const reports: WeeklyGrowthReport[] = [];
  const today = new Date();

  for (let i = 0; i < weeks; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const weekMetrics = await getMetricsForPeriod(
      shopDomain,
      weekStart,
      weekEnd
    );

    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);
    const prevWeekEnd = new Date(weekEnd);
    prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);

    const prevWeekMetrics = await getMetricsForPeriod(
      shopDomain,
      prevWeekStart,
      prevWeekEnd
    );

    // Calculate week-over-week growth
    const growth = {
      impressions: calculateGrowth(
        weekMetrics.totalImpressions,
        prevWeekMetrics.totalImpressions
      ),
      clicks: calculateGrowth(
        weekMetrics.totalClicks,
        prevWeekMetrics.totalClicks
      ),
      conversions: calculateGrowth(
        weekMetrics.totalConversions,
        prevWeekMetrics.totalConversions
      ),
      revenue: calculateGrowth(
        weekMetrics.totalRevenue,
        prevWeekMetrics.totalRevenue
      ),
    };

    reports.push({
      week: getISOWeek(weekStart),
      impressions: weekMetrics.totalImpressions,
      clicks: weekMetrics.totalClicks,
      conversions: weekMetrics.totalConversions,
      revenue: weekMetrics.totalRevenue,
      spend: weekMetrics.totalSpend,
      ctr: weekMetrics.avgCTR,
      conversionRate: weekMetrics.avgConversionRate,
      roas: weekMetrics.overallROAS,
      weekOverWeekGrowth: growth,
    });
  }

  return reports.reverse(); // Oldest to newest
}

/**
 * Analyze trends across channels
 */
export async function getTrendAnalysis(
  shopDomain: string = "occ",
  days: number = 30
): Promise<TrendAnalysis[]> {
  const trends: TrendAnalysis[] = [];

  // Split period into current and previous
  const midpoint = Math.floor(days / 2);
  const today = new Date();

  const currentEnd = today;
  const currentStart = new Date(today);
  currentStart.setDate(currentStart.getDate() - midpoint);

  const previousEnd = new Date(currentStart);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - midpoint);

  // Get metrics for both periods
  const currentMetrics = await getMetricsForPeriod(
    shopDomain,
    currentStart,
    currentEnd
  );

  const previousMetrics = await getMetricsForPeriod(
    shopDomain,
    previousStart,
    previousEnd
  );

  // Analyze trends for key metrics
  const metrics = [
    { key: "impressions", current: currentMetrics.totalImpressions, previous: previousMetrics.totalImpressions },
    { key: "clicks", current: currentMetrics.totalClicks, previous: previousMetrics.totalClicks },
    { key: "conversions", current: currentMetrics.totalConversions, previous: previousMetrics.totalConversions },
    { key: "revenue", current: currentMetrics.totalRevenue, previous: previousMetrics.totalRevenue },
  ];

  for (const metric of metrics) {
    const change = calculateGrowth(metric.current, metric.previous);
    trends.push({
      channel: "overall",
      trend: determineTrend(change),
      changePercent: change,
      currentValue: metric.current,
      previousValue: metric.previous,
      metric: metric.key,
    });
  }

  return trends;
}

/**
 * Get complete dashboard metrics
 */
export async function getDashboardMetrics(
  shopDomain: string = "occ"
): Promise<DashboardMetrics> {
  const currentMetrics = await getGrowthMetrics(shopDomain, 30);
  const previousMetrics = await getGrowthMetrics(shopDomain, 60); // 30-60 days ago range needs adjustment

  const weeklyReports = await getWeeklyGrowthReport(shopDomain, 4);
  const trends = await getTrendAnalysis(shopDomain, 30);

  // Identify top performers
  const topPerformers = identifyTopPerformers(trends);

  return {
    current: currentMetrics,
    previous: previousMetrics,
    weeklyReports,
    trends,
    topPerformers,
  };
}

/**
 * Helper: Get metrics for a specific period
 */
async function getMetricsForPeriod(
  shopDomain: string,
  start: Date,
  end: Date
): Promise<GrowthMetrics> {
  const socialMetrics = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "social_performance",
      createdAt: { gte: start, lte: end },
    },
  });

  const adsMetrics = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: "ads_roas",
      createdAt: { gte: start, lte: end },
    },
  });

  const social = aggregateSocialMetrics(socialMetrics);
  const ads = aggregateAdsMetrics(adsMetrics);

  const totalImpressions = social.impressions + ads.impressions;
  const totalClicks = social.clicks + ads.clicks;

  return {
    totalImpressions,
    totalClicks,
    totalConversions: ads.conversions,
    avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    avgConversionRate: totalClicks > 0 ? (ads.conversions / totalClicks) * 100 : 0,
    totalRevenue: ads.revenue,
    totalSpend: ads.spend,
    overallROAS: ads.spend > 0 ? ads.revenue / ads.spend : 0,
  };
}

/**
 * Helper: Aggregate social metrics
 */
function aggregateSocialMetrics(metrics: any[]): {
  impressions: number;
  clicks: number;
} {
  return metrics.reduce(
    (acc, metric) => {
      const value = metric.value as any;
      return {
        impressions: acc.impressions + (value.impressions || 0),
        clicks: acc.clicks + (value.clicks || 0),
      };
    },
    { impressions: 0, clicks: 0 }
  );
}

/**
 * Helper: Aggregate ads metrics
 */
function aggregateAdsMetrics(metrics: any[]): {
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  spend: number;
} {
  return metrics.reduce(
    (acc, metric) => {
      const value = metric.value as any;
      return {
        impressions: acc.impressions + (value.impressions || 0),
        clicks: acc.clicks + (value.clicks || 0),
        conversions: acc.conversions + (value.conversions || 0),
        revenue: acc.revenue + (value.revenue || 0),
        spend: acc.spend + (value.spend || 0),
      };
    },
    { impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0 }
  );
}

/**
 * Helper: Calculate growth percentage
 */
function calculateGrowth(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

/**
 * Helper: Determine trend direction
 */
function determineTrend(change: number): "up" | "down" | "stable" {
  if (change > 5) return "up";
  if (change < -5) return "down";
  return "stable";
}

/**
 * Helper: Get ISO week string
 */
function getISOWeek(date: Date): string {
  const year = date.getFullYear();
  const week = getWeekNumber(date);
  return `${year}-W${week.toString().padStart(2, "0")}`;
}

/**
 * Helper: Get week number
 */
function getWeekNumber(date: Date): number {
  const firstDay = new Date(date.getFullYear(), 0, 1);
  const days = Math.floor((date.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((days + firstDay.getDay() + 1) / 7);
}

/**
 * Helper: Identify top performers
 */
function identifyTopPerformers(trends: TrendAnalysis[]): Array<{
  channel: string;
  metric: string;
  value: number;
  change: number;
}> {
  return trends
    .filter((t) => t.trend === "up")
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 3)
    .map((t) => ({
      channel: t.channel,
      metric: t.metric,
      value: t.currentValue,
      change: t.changePercent,
    }));
}

