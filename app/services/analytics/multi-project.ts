/**
 * Multi-Project Analytics Aggregation Service
 *
 * Aggregates analytics across multiple projects/shops
 * CEO/agency view of all shops combined
 * Identifies top and bottom performers
 * Project comparison capabilities
 */

import prisma from "~/prisma.server";

export interface ProjectMetrics {
  project: string;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  avgCTR: number;
  avgConversionRate: number;
  totalRevenue: number;
  totalSpend: number;
  overallROAS: number;
  rank?: number;
}

export interface MultiProjectSummary {
  totalProjects: number;
  aggregateMetrics: {
    totalImpressions: number;
    totalClicks: number;
    totalConversions: number;
    totalRevenue: number;
    totalSpend: number;
    avgCTR: number;
    avgConversionRate: number;
    overallROAS: number;
  };
  topPerformers: ProjectMetrics[];
  bottomPerformers: ProjectMetrics[];
  projectBreakdown: ProjectMetrics[];
}

export interface ProjectComparison {
  project1: string;
  project2: string;
  metrics: {
    project1: ProjectMetrics;
    project2: ProjectMetrics;
  };
  comparison: {
    impressionsDiff: number;
    clicksDiff: number;
    conversionsDiff: number;
    revenueDiff: number;
    roasDiff: number;
    winner: string;
  };
}

/**
 * Get metrics for a specific project
 */
export async function getProjectMetrics(
  shopDomain: string,
  days: number = 30,
): Promise<ProjectMetrics> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get all analytics for this project
  const facts = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: {
        in: ["social_performance", "ads_roas"],
      },
      createdAt: {
        gte: since,
      },
    },
  });

  // Aggregate metrics
  const totals = facts.reduce(
    (acc, fact) => {
      const value = fact.value as any;
      return {
        impressions: acc.impressions + (value.impressions || 0),
        clicks: acc.clicks + (value.clicks || 0),
        conversions: acc.conversions + (value.conversions || 0),
        revenue: acc.revenue + (value.revenue || 0),
        spend: acc.spend + (value.spend || 0),
      };
    },
    { impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0 },
  );

  const avgCTR =
    totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0;
  const avgConversionRate =
    totals.clicks > 0 ? (totals.conversions / totals.clicks) * 100 : 0;
  const overallROAS = totals.spend > 0 ? totals.revenue / totals.spend : 0;

  return {
    project: shopDomain,
    totalImpressions: totals.impressions,
    totalClicks: totals.clicks,
    totalConversions: totals.conversions,
    avgCTR: Number(avgCTR.toFixed(2)),
    avgConversionRate: Number(avgConversionRate.toFixed(2)),
    totalRevenue: totals.revenue,
    totalSpend: totals.spend,
    overallROAS: Number(overallROAS.toFixed(2)),
  };
}

/**
 * Get aggregated metrics across all projects
 * CEO/agency view
 */
export async function getMultiProjectSummary(
  days: number = 30,
): Promise<MultiProjectSummary> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get all distinct shop domains
  const shops = await prisma.dashboardFact.findMany({
    where: {
      createdAt: {
        gte: since,
      },
    },
    select: {
      shopDomain: true,
    },
    distinct: ["shopDomain"],
  });

  const uniqueShops = shops.map((s) => s.shopDomain);

  // Get metrics for each project
  const projectMetrics = await Promise.all(
    uniqueShops.map((shop) => getProjectMetrics(shop, days)),
  );

  // Sort by ROAS (descending)
  const sortedProjects = projectMetrics
    .sort((a, b) => b.overallROAS - a.overallROAS)
    .map((p, index) => ({ ...p, rank: index + 1 }));

  // Calculate aggregate metrics across all projects
  const aggregateMetrics = projectMetrics.reduce(
    (acc, project) => ({
      totalImpressions: acc.totalImpressions + project.totalImpressions,
      totalClicks: acc.totalClicks + project.totalClicks,
      totalConversions: acc.totalConversions + project.totalConversions,
      totalRevenue: acc.totalRevenue + project.totalRevenue,
      totalSpend: acc.totalSpend + project.totalSpend,
      avgCTR: 0, // Calculated below
      avgConversionRate: 0, // Calculated below
      overallROAS: 0, // Calculated below
    }),
    {
      totalImpressions: 0,
      totalClicks: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalSpend: 0,
      avgCTR: 0,
      avgConversionRate: 0,
      overallROAS: 0,
    },
  );

  // Calculate aggregate rates
  aggregateMetrics.avgCTR =
    aggregateMetrics.totalImpressions > 0
      ? Number(
          (
            (aggregateMetrics.totalClicks / aggregateMetrics.totalImpressions) *
            100
          ).toFixed(2),
        )
      : 0;

  aggregateMetrics.avgConversionRate =
    aggregateMetrics.totalClicks > 0
      ? Number(
          (
            (aggregateMetrics.totalConversions / aggregateMetrics.totalClicks) *
            100
          ).toFixed(2),
        )
      : 0;

  aggregateMetrics.overallROAS =
    aggregateMetrics.totalSpend > 0
      ? Number(
          (aggregateMetrics.totalRevenue / aggregateMetrics.totalSpend).toFixed(
            2,
          ),
        )
      : 0;

  return {
    totalProjects: uniqueShops.length,
    aggregateMetrics,
    topPerformers: sortedProjects.slice(0, 5),
    bottomPerformers: sortedProjects.slice(-5).reverse(),
    projectBreakdown: sortedProjects,
  };
}

/**
 * Compare two projects side by side
 */
export async function compareProjects(
  project1: string,
  project2: string,
  days: number = 30,
): Promise<ProjectComparison> {
  const [metrics1, metrics2] = await Promise.all([
    getProjectMetrics(project1, days),
    getProjectMetrics(project2, days),
  ]);

  // Calculate differences
  const impressionsDiff = metrics1.totalImpressions - metrics2.totalImpressions;
  const clicksDiff = metrics1.totalClicks - metrics2.totalClicks;
  const conversionsDiff = metrics1.totalConversions - metrics2.totalConversions;
  const revenueDiff = metrics1.totalRevenue - metrics2.totalRevenue;
  const roasDiff = metrics1.overallROAS - metrics2.overallROAS;

  // Determine winner based on ROAS
  const winner =
    metrics1.overallROAS > metrics2.overallROAS ? project1 : project2;

  return {
    project1,
    project2,
    metrics: {
      project1: metrics1,
      project2: metrics2,
    },
    comparison: {
      impressionsDiff,
      clicksDiff,
      conversionsDiff,
      revenueDiff,
      roasDiff: Number(roasDiff.toFixed(2)),
      winner,
    },
  };
}

/**
 * Get top performing projects by specific metric
 */
export async function getTopProjectsByMetric(
  metric: "impressions" | "clicks" | "conversions" | "revenue" | "roas",
  limit: number = 10,
  days: number = 30,
): Promise<ProjectMetrics[]> {
  const summary = await getMultiProjectSummary(days);

  const sortedProjects = [...summary.projectBreakdown].sort((a, b) => {
    switch (metric) {
      case "impressions":
        return b.totalImpressions - a.totalImpressions;
      case "clicks":
        return b.totalClicks - a.totalClicks;
      case "conversions":
        return b.totalConversions - a.totalConversions;
      case "revenue":
        return b.totalRevenue - a.totalRevenue;
      case "roas":
        return b.overallROAS - a.overallROAS;
      default:
        return 0;
    }
  });

  return sortedProjects.slice(0, limit);
}

/**
 * Get project performance rankings
 */
export async function getProjectRankings(days: number = 30): Promise<
  Array<{
    rank: number;
    project: string;
    overallROAS: number;
    totalRevenue: number;
    grade: "A" | "B" | "C" | "D" | "F";
  }>
> {
  const summary = await getMultiProjectSummary(days);

  return summary.projectBreakdown.map((project, index) => ({
    rank: index + 1,
    project: project.project,
    overallROAS: project.overallROAS,
    totalRevenue: project.totalRevenue,
    grade: getPerformanceGrade(project.overallROAS),
  }));
}

/**
 * Assign performance grade based on ROAS
 */
function getPerformanceGrade(roas: number): "A" | "B" | "C" | "D" | "F" {
  if (roas >= 4.0) return "A";
  if (roas >= 3.0) return "B";
  if (roas >= 2.0) return "C";
  if (roas >= 1.0) return "D";
  return "F";
}
