/**
 * Automated Insights Detection
 *
 * Generates natural language insights from analytics data.
 * Detects interesting patterns and formulates recommendations.
 */

export interface Insight {
  id: string;
  type: "positive" | "negative" | "neutral" | "actionable";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  metrics: string[];
  recommendation?: string;
  confidence: number;
}

/**
 * Detect insights from metrics
 */
export function detectInsights(metrics: {
  revenue: { value: number; change: number };
  conversion: { value: number; change: number };
  traffic: { value: number; change: number };
  aov: { value: number; change: number };
}): Insight[] {
  const insights: Insight[] = [];

  // Revenue insights
  if (metrics.revenue.change > 10) {
    insights.push({
      id: "rev-spike",
      type: "positive",
      severity: "high",
      title: "Significant Revenue Growth",
      description: `Revenue increased ${metrics.revenue.change.toFixed(1)}% - strongest growth in recent period`,
      metrics: ["revenue"],
      recommendation: "Investigate drivers to replicate success",
      confidence: 0.9,
    });
  } else if (metrics.revenue.change < -10) {
    insights.push({
      id: "rev-decline",
      type: "negative",
      severity: "high",
      title: "Revenue Decline Alert",
      description: `Revenue decreased ${Math.abs(metrics.revenue.change).toFixed(1)}% - requires immediate attention`,
      metrics: ["revenue"],
      recommendation: "Review traffic sources and conversion funnel",
      confidence: 0.95,
    });
  }

  // Conversion insights
  if (
    metrics.conversion.change > 5 &&
    metrics.traffic.change < 0 &&
    metrics.revenue.change > 0
  ) {
    insights.push({
      id: "quality-over-quantity",
      type: "positive",
      severity: "medium",
      title: "Quality Over Quantity Win",
      description:
        "Despite lower traffic, higher conversion drove revenue growth",
      metrics: ["conversion", "traffic", "revenue"],
      recommendation: "Focus on quality traffic sources rather than volume",
      confidence: 0.85,
    });
  }

  // AOV insights
  if (metrics.aov.change > 8) {
    insights.push({
      id: "aov-increase",
      type: "positive",
      severity: "medium",
      title: "Average Order Value Increasing",
      description: `Customers spending ${metrics.aov.change.toFixed(1)}% more per order`,
      metrics: ["aov", "revenue"],
      recommendation: "Consider bundling and upsell opportunities",
      confidence: 0.8,
    });
  }

  // Traffic insights
  if (metrics.traffic.change < -15) {
    insights.push({
      id: "traffic-drop",
      type: "negative",
      severity: "high",
      title: "Significant Traffic Decline",
      description: `Sessions dropped ${Math.abs(metrics.traffic.change).toFixed(1)}% - check SEO and paid channels`,
      metrics: ["traffic"],
      recommendation: "Audit SEO rankings and increase marketing spend",
      confidence: 0.9,
    });
  }

  return insights.sort((a, b) => {
    const severityOrder = { high: 3, medium: 2, low: 1 };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });
}
