/**
 * Scheduled Analytics Reports Service
 *
 * Generates daily/weekly/monthly reports
 * Email-ready templates for Phase 11 integration
 * Report templates with key metrics and insights
 */

import prisma from "~/prisma.server";
import { getGrowthMetrics } from "./growth-metrics";
import { detectAllAnomalies } from "./anomaly-detection";
import { forecastMetric } from "./trend-forecast";

export type ReportFrequency = "daily" | "weekly" | "monthly";

export interface ScheduledReport {
  reportId: string;
  reportType: ReportFrequency;
  shopDomain: string;
  generatedAt: Date;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    ctr: number;
    conversionRate: number;
    roas: number;
  };
  highlights: string[];
  anomalies: number;
  forecast: {
    trend: string;
    prediction: number;
  };
  emailTemplate: {
    subject: string;
    body: string;
    html: string;
  };
}

/**
 * Generate daily analytics report
 */
export async function generateDailyReport(
  shopDomain: string = "occ",
): Promise<ScheduledReport> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const metrics = await getGrowthMetrics(shopDomain, 1);
  const anomalies = await detectAllAnomalies(shopDomain, 7);
  const revenueForecast = await forecastMetric("revenue", shopDomain, 7, 30);

  const highlights = generateDailyHighlights(metrics, anomalies);

  return {
    reportId: `daily-${shopDomain}-${today.toISOString().split("T")[0]}`,
    reportType: "daily",
    shopDomain,
    generatedAt: today,
    period: {
      start: yesterday,
      end: today,
    },
    metrics: {
      impressions: metrics.totalImpressions,
      clicks: metrics.totalClicks,
      conversions: metrics.totalConversions,
      revenue: metrics.totalRevenue,
      ctr: metrics.avgCTR,
      conversionRate: metrics.avgConversionRate,
      roas: metrics.overallROAS,
    },
    highlights,
    anomalies: anomalies.anomalies.length,
    forecast: {
      trend: revenueForecast.trend,
      prediction: revenueForecast.predictions[6]?.predictedValue || 0,
    },
    emailTemplate: generateDailyEmailTemplate(
      shopDomain,
      metrics,
      highlights,
      anomalies.anomalies.length,
    ),
  };
}

/**
 * Generate weekly analytics report
 */
export async function generateWeeklyReport(
  shopDomain: string = "occ",
): Promise<ScheduledReport> {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const metrics = await getGrowthMetrics(shopDomain, 7);
  const anomalies = await detectAllAnomalies(shopDomain, 7);
  const revenueForecast = await forecastMetric("revenue", shopDomain, 7, 30);

  const highlights = generateWeeklyHighlights(metrics, anomalies);

  return {
    reportId: `weekly-${shopDomain}-${today.toISOString().split("T")[0]}`,
    reportType: "weekly",
    shopDomain,
    generatedAt: today,
    period: {
      start: weekAgo,
      end: today,
    },
    metrics: {
      impressions: metrics.totalImpressions,
      clicks: metrics.totalClicks,
      conversions: metrics.totalConversions,
      revenue: metrics.totalRevenue,
      ctr: metrics.avgCTR,
      conversionRate: metrics.avgConversionRate,
      roas: metrics.overallROAS,
    },
    highlights,
    anomalies: anomalies.anomalies.length,
    forecast: {
      trend: revenueForecast.trend,
      prediction: revenueForecast.predictions[6]?.predictedValue || 0,
    },
    emailTemplate: generateWeeklyEmailTemplate(
      shopDomain,
      metrics,
      highlights,
      anomalies.anomalies.length,
    ),
  };
}

/**
 * Generate monthly analytics report
 */
export async function generateMonthlyReport(
  shopDomain: string = "occ",
): Promise<ScheduledReport> {
  const today = new Date();
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);

  const metrics = await getGrowthMetrics(shopDomain, 30);
  const anomalies = await detectAllAnomalies(shopDomain, 30);
  const revenueForecast = await forecastMetric("revenue", shopDomain, 30, 90);

  const highlights = generateMonthlyHighlights(metrics, anomalies);

  return {
    reportId: `monthly-${shopDomain}-${today.toISOString().split("T")[0]}`,
    reportType: "monthly",
    shopDomain,
    generatedAt: today,
    period: {
      start: monthAgo,
      end: today,
    },
    metrics: {
      impressions: metrics.totalImpressions,
      clicks: metrics.totalClicks,
      conversions: metrics.totalConversions,
      revenue: metrics.totalRevenue,
      ctr: metrics.avgCTR,
      conversionRate: metrics.avgConversionRate,
      roas: metrics.overallROAS,
    },
    highlights,
    anomalies: anomalies.anomalies.length,
    forecast: {
      trend: revenueForecast.trend,
      prediction: revenueForecast.predictions[29]?.predictedValue || 0,
    },
    emailTemplate: generateMonthlyEmailTemplate(
      shopDomain,
      metrics,
      highlights,
      anomalies.anomalies.length,
    ),
  };
}

/**
 * Generate daily highlights
 */
function generateDailyHighlights(metrics: any, anomalies: any): string[] {
  const highlights: string[] = [];

  if (metrics.totalRevenue > 0) {
    highlights.push(`Generated $${metrics.totalRevenue.toFixed(2)} in revenue`);
  }

  if (metrics.avgCTR > 0) {
    highlights.push(`Average CTR: ${metrics.avgCTR}%`);
  }

  if (anomalies.anomalies.length > 0) {
    highlights.push(`${anomalies.anomalies.length} anomalies detected`);
  }

  return highlights;
}

/**
 * Generate weekly highlights
 */
function generateWeeklyHighlights(metrics: any, anomalies: any): string[] {
  const highlights: string[] = [];

  highlights.push(
    `Total impressions: ${metrics.totalImpressions.toLocaleString()}`,
  );
  highlights.push(`Total clicks: ${metrics.totalClicks.toLocaleString()}`);

  if (metrics.totalConversions > 0) {
    highlights.push(`${metrics.totalConversions} conversions generated`);
  }

  if (metrics.overallROAS > 1) {
    highlights.push(`ROAS: ${metrics.overallROAS}x (profitable)`);
  }

  return highlights;
}

/**
 * Generate monthly highlights
 */
function generateMonthlyHighlights(metrics: any, anomalies: any): string[] {
  const highlights: string[] = [];

  highlights.push(`Total revenue: $${metrics.totalRevenue.toLocaleString()}`);
  highlights.push(`Total spend: $${metrics.totalSpend.toLocaleString()}`);

  if (metrics.overallROAS > 0) {
    const profit = metrics.totalRevenue - metrics.totalSpend;
    highlights.push(
      `Net profit: $${profit.toFixed(2)} (ROAS: ${metrics.overallROAS}x)`,
    );
  }

  return highlights;
}

/**
 * Generate daily email template
 */
function generateDailyEmailTemplate(
  shopDomain: string,
  metrics: any,
  highlights: string[],
  anomalyCount: number,
): { subject: string; body: string; html: string } {
  const subject = `Daily Analytics Report - ${shopDomain}`;

  const body = `
Daily Analytics Report
${shopDomain}
${new Date().toISOString().split("T")[0]}

KEY METRICS:
- Revenue: $${metrics.totalRevenue.toFixed(2)}
- CTR: ${metrics.avgCTR}%
- ROAS: ${metrics.overallROAS}x

HIGHLIGHTS:
${highlights.map((h) => `• ${h}`).join("\n")}

${anomalyCount > 0 ? `⚠️ ${anomalyCount} anomalies detected` : "✅ No anomalies detected"}
`.trim();

  const html = `
<h2>Daily Analytics Report</h2>
<p><strong>${shopDomain}</strong> - ${new Date().toISOString().split("T")[0]}</p>

<h3>Key Metrics</h3>
<ul>
  <li>Revenue: $${metrics.totalRevenue.toFixed(2)}</li>
  <li>CTR: ${metrics.avgCTR}%</li>
  <li>ROAS: ${metrics.overallROAS}x</li>
</ul>

<h3>Highlights</h3>
<ul>
  ${highlights.map((h) => `<li>${h}</li>`).join("\n")}
</ul>

${anomalyCount > 0 ? `<p style="color: orange;">⚠️ ${anomalyCount} anomalies detected</p>` : '<p style="color: green;">✅ No anomalies detected</p>'}
`.trim();

  return { subject, body, html };
}

/**
 * Generate weekly email template
 */
function generateWeeklyEmailTemplate(
  shopDomain: string,
  metrics: any,
  highlights: string[],
  anomalyCount: number,
): { subject: string; body: string; html: string } {
  const subject = `Weekly Analytics Report - ${shopDomain}`;

  const body = `Weekly Analytics Report - ${shopDomain}\n\n${highlights.join("\n")}`;
  const html = `<h2>Weekly Report</h2><ul>${highlights.map((h) => `<li>${h}</li>`).join("")}</ul>`;

  return { subject, body, html };
}

/**
 * Generate monthly email template
 */
function generateMonthlyEmailTemplate(
  shopDomain: string,
  metrics: any,
  highlights: string[],
  anomalyCount: number,
): { subject: string; body: string; html: string } {
  const subject = `Monthly Analytics Report - ${shopDomain}`;

  const body = `Monthly Analytics Report - ${shopDomain}\n\n${highlights.join("\n")}`;
  const html = `<h2>Monthly Report</h2><ul>${highlights.map((h) => `<li>${h}</li>`).join("")}</ul>`;

  return { subject, body, html };
}
