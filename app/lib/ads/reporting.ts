/**
 * Ads Reporting
 *
 * Generate weekly and monthly campaign performance reports
 *
 * @module app/lib/ads/reporting
 */

import type { Campaign } from "./types";
import { calculateAggregateImpact } from "./impact-metrics";
import { getPlatformBreakdown } from "../services/ads/metrics.service";
import {
  getTopPerformingCampaigns,
  getUnderperformingCampaigns,
} from "../services/ads/campaign.service";

export interface PerformanceReport {
  period: {
    start: string;
    end: string;
    type: "weekly" | "monthly";
  };
  summary: {
    totalSpend: number;
    totalRevenue: number;
    averageROAS: number;
    totalCampaigns: number;
  };
  platformBreakdown: {
    meta: {
      count: number;
      spend: number;
      revenue: number;
      roas: number;
    };
    google: {
      count: number;
      spend: number;
      revenue: number;
      roas: number;
    };
  };
  topPerformers: Array<{
    campaignName: string;
    roas: number;
    revenue: number;
  }>;
  needsAttention: Array<{
    campaignName: string;
    roas: number;
    issue: string;
  }>;
  recommendations: string[];
}

/**
 * Generate weekly performance report
 */
export function generateWeeklyReport(
  campaigns: Campaign[],
  weekStart: string,
): PerformanceReport {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return generateReport(
    campaigns,
    weekStart,
    weekEnd.toISOString().split("T")[0],
    "weekly",
  );
}

/**
 * Generate monthly performance report
 */
export function generateMonthlyReport(
  campaigns: Campaign[],
  monthStart: string,
): PerformanceReport {
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  return generateReport(
    campaigns,
    monthStart,
    monthEnd.toISOString().split("T")[0],
    "monthly",
  );
}

function generateReport(
  campaigns: Campaign[],
  start: string,
  end: string,
  type: "weekly" | "monthly",
): PerformanceReport {
  const aggregate = calculateAggregateImpact(campaigns, end);
  const platformBreakdown = getPlatformBreakdown(campaigns);
  const topPerformers = getTopPerformingCampaigns(campaigns, 5);
  const underperforming = getUnderperformingCampaigns(campaigns, 2.0);

  const recommendations: string[] = [];

  if (aggregate.averageROAS < 3.0) {
    recommendations.push(
      "Overall ROAS below target. Review underperforming campaigns.",
    );
  }

  if (underperforming.length > 0) {
    recommendations.push(
      `${underperforming.length} campaign(s) need attention (ROAS < 2.0x)`,
    );
  }

  if (topPerformers.length > 0 && topPerformers[0].metrics.roas > 5.0) {
    recommendations.push(
      `Top performer ${topPerformers[0].name} has ${topPerformers[0].metrics.roas.toFixed(1)}x ROAS - consider scaling`,
    );
  }

  return {
    period: { start, end, type },
    summary: {
      totalSpend: aggregate.totalSpend,
      totalRevenue: aggregate.totalRevenue,
      averageROAS: aggregate.averageROAS,
      totalCampaigns: aggregate.campaignCount,
    },
    platformBreakdown: {
      meta: {
        count: platformBreakdown.meta.count,
        spend: platformBreakdown.meta.totalSpend,
        revenue: platformBreakdown.meta.totalRevenue,
        roas: platformBreakdown.meta.averageROAS,
      },
      google: {
        count: platformBreakdown.google.count,
        spend: platformBreakdown.google.totalSpend,
        revenue: platformBreakdown.google.totalRevenue,
        roas: platformBreakdown.google.averageROAS,
      },
    },
    topPerformers: topPerformers.map((c) => ({
      campaignName: c.name,
      roas: c.metrics.roas,
      revenue: c.metrics.revenue,
    })),
    needsAttention: underperforming.map((c) => ({
      campaignName: c.name,
      roas: c.metrics.roas,
      issue: `ROAS ${c.metrics.roas.toFixed(2)}x below 2.0x target`,
    })),
    recommendations,
  };
}
