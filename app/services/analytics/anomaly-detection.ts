/**
 * Alert & Anomaly Detection Service
 * 
 * Detects unusual patterns using Z-score analysis
 * Alerts on revenue drops, CTR spikes, conversion anomalies
 * Statistical significance threshold: Z-score > 2.5
 * Provides recommendations for detected anomalies
 */

import prisma from "~/db.server";

export interface Anomaly {
  type: "spike" | "drop" | "unusual";
  metric: string;
  currentValue: number;
  expectedValue: number;
  zScore: number;
  significance: "critical" | "moderate" | "low";
  detectedAt: Date;
  recommendation: string;
  severity: number; // 1-10 scale
}

export interface AnomalyAlert {
  alertId: string;
  shopDomain: string;
  anomalies: Anomaly[];
  summary: string;
  actionRequired: boolean;
}

export type AnomalyMetric = "revenue" | "ctr" | "conversions" | "impressions" | "clicks";

/**
 * Detect anomalies in metric using Z-score analysis
 * Z-score threshold: 2.5 (statistically significant)
 */
export async function detectAnomalies(
  metric: AnomalyMetric,
  shopDomain: string = "occ",
  days: number = 30
): Promise<Anomaly[]> {
  // Get historical data
  const historicalData = await getMetricHistory(metric, shopDomain, days);

  if (historicalData.length < 7) {
    // Need at least 7 days of data for statistical analysis
    return [];
  }

  // Calculate statistical baseline (mean and std dev)
  const values = historicalData.map((d) => d.value);
  const mean = calculateMean(values);
  const stdDev = calculateStdDev(values, mean);

  // Detect anomalies in recent data (last 3 days)
  const recentData = historicalData.slice(-3);
  const anomalies: Anomaly[] = [];

  for (const dataPoint of recentData) {
    const zScore = stdDev > 0 ? (dataPoint.value - mean) / stdDev : 0;
    const absZScore = Math.abs(zScore);

    // Z-score > 2.5 indicates statistical significance
    if (absZScore > 2.5) {
      const anomaly: Anomaly = {
        type: zScore > 0 ? "spike" : "drop",
        metric,
        currentValue: dataPoint.value,
        expectedValue: Number(mean.toFixed(2)),
        zScore: Number(zScore.toFixed(2)),
        significance: classifySignificance(absZScore),
        detectedAt: dataPoint.date,
        recommendation: generateAnomalyRecommendation(
          metric,
          zScore > 0 ? "spike" : "drop",
          absZScore
        ),
        severity: calculateSeverity(absZScore),
      };

      anomalies.push(anomaly);
    }
  }

  return anomalies;
}

/**
 * Detect multiple types of anomalies simultaneously
 */
export async function detectAllAnomalies(
  shopDomain: string = "occ",
  days: number = 30
): Promise<AnomalyAlert> {
  const metrics: AnomalyMetric[] = ["revenue", "ctr", "conversions", "impressions", "clicks"];

  const allAnomalies: Anomaly[] = [];

  for (const metric of metrics) {
    const anomalies = await detectAnomalies(metric, shopDomain, days);
    allAnomalies.push(...anomalies);
  }

  // Sort by severity (highest first)
  allAnomalies.sort((a, b) => b.severity - a.severity);

  const criticalCount = allAnomalies.filter(
    (a) => a.significance === "critical"
  ).length;

  return {
    alertId: `alert-${Date.now()}`,
    shopDomain,
    anomalies: allAnomalies,
    summary: generateAlertSummary(allAnomalies),
    actionRequired: criticalCount > 0,
  };
}

/**
 * Get historical metric data
 */
async function getMetricHistory(
  metric: AnomalyMetric,
  shopDomain: string,
  days: number
): Promise<Array<{ date: Date; value: number }>> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const facts = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType: {
        in: ["social_performance", "ads_roas", "growth_metrics"],
      },
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Aggregate by date
  const dailyValues = new Map<string, number>();

  for (const fact of facts) {
    const value = fact.value as any;
    const dateKey = fact.createdAt.toISOString().split("T")[0];

    const metricValue = extractMetricValue(value, metric);
    const current = dailyValues.get(dateKey) || 0;
    dailyValues.set(dateKey, current + metricValue);
  }

  return Array.from(dailyValues.entries()).map(([dateStr, value]) => ({
    date: new Date(dateStr),
    value,
  }));
}

/**
 * Extract metric value from fact data
 */
function extractMetricValue(value: any, metric: AnomalyMetric): number {
  switch (metric) {
    case "revenue":
      return value.revenue || 0;
    case "ctr":
      return value.ctr || 0;
    case "conversions":
      return value.conversions || 0;
    case "impressions":
      return value.impressions || 0;
    case "clicks":
      return value.clicks || 0;
    default:
      return 0;
  }
}

/**
 * Calculate mean (average)
 */
function calculateMean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[], mean: number): number {
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Classify anomaly significance based on Z-score
 */
function classifySignificance(
  absZScore: number
): "critical" | "moderate" | "low" {
  if (absZScore > 4.0) return "critical";
  if (absZScore > 3.0) return "moderate";
  return "low";
}

/**
 * Calculate severity score (1-10)
 */
function calculateSeverity(absZScore: number): number {
  // Map Z-score to 1-10 scale
  // Z=2.5 → 5, Z=5.0 → 10
  const severity = Math.min(10, Math.max(1, (absZScore / 5) * 10));
  return Math.round(severity);
}

/**
 * Generate recommendation based on anomaly
 */
function generateAnomalyRecommendation(
  metric: string,
  type: "spike" | "drop",
  zScore: number
): string {
  if (metric === "revenue" && type === "drop") {
    return `CRITICAL: Revenue drop detected (${zScore.toFixed(
      1
    )}σ below normal). Immediate investigation required. Check for order cancellations or payment issues.`;
  }

  if (metric === "ctr" && type === "spike") {
    return `Positive: CTR spike detected (${zScore.toFixed(
      1
    )}σ above normal). Analyze what drove this increase and replicate the strategy.`;
  }

  if (metric === "ctr" && type === "drop") {
    return `Warning: CTR drop detected (${zScore.toFixed(
      1
    )}σ below normal). Review ad creative, targeting, and bidding strategy.`;
  }

  if (metric === "conversions" && type === "drop") {
    return `Alert: Conversion drop detected (${zScore.toFixed(
      1
    )}σ below normal). Check checkout flow, pricing, and landing pages.`;
  }

  if (metric === "conversions" && type === "spike") {
    return `Positive: Conversion spike detected. Identify and maintain successful strategies.`;
  }

  if (type === "spike") {
    return `${metric} spike detected (${zScore.toFixed(
      1
    )}σ above normal). Monitor to ensure data accuracy and identify drivers.`;
  }

  return `${metric} drop detected (${zScore.toFixed(
    1
  )}σ below normal). Investigate root cause and implement corrective actions.`;
}

/**
 * Generate summary of all anomalies
 */
function generateAlertSummary(anomalies: Anomaly[]): string {
  if (anomalies.length === 0) {
    return "No anomalies detected. All metrics within normal ranges.";
  }

  const critical = anomalies.filter((a) => a.significance === "critical");
  const moderate = anomalies.filter((a) => a.significance === "moderate");

  if (critical.length > 0) {
    return `CRITICAL: ${critical.length} critical anomalies detected. Immediate action required. ${moderate.length} moderate anomalies also present.`;
  }

  if (moderate.length > 0) {
    return `${moderate.length} moderate anomalies detected. Review recommended. ${anomalies.length - moderate.length} minor anomalies also present.`;
  }

  return `${anomalies.length} minor anomalies detected. Monitor trends.`;
}

