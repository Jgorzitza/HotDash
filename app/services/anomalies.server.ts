import { Prisma } from "@prisma/client";
import prisma from "../prisma.server";
import type { RecordDashboardFactInput } from "./facts.server";

/**
 * Anomaly detection and forecasting utilities for Memory service integration.
 * Implements threshold-based anomaly detection and simple forecasting for KPIs.
 */

export interface AnomalyThreshold {
  warning: number;
  critical: number;
}

export interface AnomalyDetectionConfig {
  factType: string;
  metric: string;
  thresholds: {
    percentChange?: AnomalyThreshold; // for relative changes (e.g., sales_delta)
    absoluteValue?: AnomalyThreshold; // for absolute values (e.g., sla_breach_rate)
  };
  windowDays?: number; // lookback window for baseline calculation
}

export interface AnomalyResult {
  isAnomaly: boolean;
  severity: "none" | "warning" | "critical";
  currentValue: number;
  baselineValue?: number;
  delta?: number;
  percentChange?: number;
  threshold: number;
  message: string;
}

export interface ForecastParams {
  method: "simple_average" | "exponential_smoothing";
  windowDays: number;
  alpha?: number; // smoothing factor for exponential smoothing (0-1)
}

export interface ForecastResult {
  predictedValue: number;
  confidence?: number; // 0-1 scale
  predictionInterval?: {
    lower: number;
    upper: number;
  };
  assumptions: string[];
}

/**
 * Pre-configured anomaly detection profiles for standard KPIs
 */
export const ANOMALY_CONFIGS: Record<string, AnomalyDetectionConfig> = {
  salesDelta: {
    factType: "shopify.sales.summary",
    metric: "totalRevenue",
    thresholds: {
      percentChange: { warning: 0.15, critical: 0.3 }, // 15% and 30% change
    },
    windowDays: 7,
  },
  slaBreachRate: {
    factType: "chatwoot.sla.breaches",
    metric: "breachRate",
    thresholds: {
      absoluteValue: { warning: 0.2, critical: 0.4 }, // 20% and 40% breach rate
    },
  },
  trafficAnomaly: {
    factType: "ga.sessions.anomalies",
    metric: "wowDelta",
    thresholds: {
      percentChange: { warning: 0.2, critical: 0.4 }, // 20% and 40% drop
    },
  },
  inventoryCoverage: {
    factType: "shopify.inventory.coverage",
    metric: "daysOfCover",
    thresholds: {
      absoluteValue: { warning: 7, critical: 3 }, // days threshold
    },
  },
  fulfillmentIssueRate: {
    factType: "shopify.fulfillment.issues",
    metric: "issueRate",
    thresholds: {
      absoluteValue: { warning: 0.1, critical: 0.25 }, // 10% and 25% issue rate
    },
  },
};

/**
 * Detect anomaly based on threshold configuration
 */
export function detectAnomaly(
  currentValue: number,
  config: AnomalyDetectionConfig,
  baselineValue?: number,
): AnomalyResult {
  // Percent change detection
  if (config.thresholds.percentChange && baselineValue !== undefined) {
    const delta = currentValue - baselineValue;
    const percentChange =
      baselineValue !== 0 ? Math.abs(delta / baselineValue) : 0;

    const { warning, critical } = config.thresholds.percentChange;

    if (percentChange >= critical) {
      return {
        isAnomaly: true,
        severity: "critical",
        currentValue,
        baselineValue,
        delta,
        percentChange,
        threshold: critical,
        message: `Critical: ${(percentChange * 100).toFixed(1)}% change exceeds ${(critical * 100).toFixed(0)}% threshold`,
      };
    }

    if (percentChange >= warning) {
      return {
        isAnomaly: true,
        severity: "warning",
        currentValue,
        baselineValue,
        delta,
        percentChange,
        threshold: warning,
        message: `Warning: ${(percentChange * 100).toFixed(1)}% change exceeds ${(warning * 100).toFixed(0)}% threshold`,
      };
    }

    return {
      isAnomaly: false,
      severity: "none",
      currentValue,
      baselineValue,
      delta,
      percentChange,
      threshold: warning,
      message: "No anomaly detected",
    };
  }

  // Absolute value detection
  if (config.thresholds.absoluteValue) {
    const { warning, critical } = config.thresholds.absoluteValue;

    // For metrics where higher is worse (breach rates, issue rates)
    const isHigherWorse =
      config.metric.includes("Rate") || config.metric.includes("breach");

    if (isHigherWorse) {
      if (currentValue >= critical) {
        return {
          isAnomaly: true,
          severity: "critical",
          currentValue,
          threshold: critical,
          message: `Critical: value ${currentValue.toFixed(2)} exceeds ${critical.toFixed(2)} threshold`,
        };
      }

      if (currentValue >= warning) {
        return {
          isAnomaly: true,
          severity: "warning",
          currentValue,
          threshold: warning,
          message: `Warning: value ${currentValue.toFixed(2)} exceeds ${warning.toFixed(2)} threshold`,
        };
      }
    } else {
      // For metrics where lower is worse (inventory days of cover)
      if (currentValue <= critical) {
        return {
          isAnomaly: true,
          severity: "critical",
          currentValue,
          threshold: critical,
          message: `Critical: value ${currentValue.toFixed(2)} below ${critical.toFixed(2)} threshold`,
        };
      }

      if (currentValue <= warning) {
        return {
          isAnomaly: true,
          severity: "warning",
          currentValue,
          threshold: warning,
          message: `Warning: value ${currentValue.toFixed(2)} below ${warning.toFixed(2)} threshold`,
        };
      }
    }

    return {
      isAnomaly: false,
      severity: "none",
      currentValue,
      threshold: warning,
      message: "No anomaly detected",
    };
  }

  return {
    isAnomaly: false,
    severity: "none",
    currentValue,
    threshold: 0,
    message: "No threshold configured",
  };
}

/**
 * Calculate baseline from historical facts
 */
export async function calculateBaseline(
  shopDomain: string,
  factType: string,
  metricPath: string, // e.g., "totalRevenue" or nested "metadata.breachRate"
  windowDays = 7,
): Promise<number | undefined> {
  const cutoffDate = new Date();
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - windowDays);

  const facts = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType,
      createdAt: {
        gte: cutoffDate,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (facts.length === 0) return undefined;

  // Extract metric values from JSON (simple path support)
  const values: number[] = [];
  for (const fact of facts) {
    const value = extractMetricValue(fact.value, metricPath);
    if (typeof value === "number" && Number.isFinite(value)) {
      values.push(value);
    }
  }

  if (values.length === 0) return undefined;

  // Simple average baseline
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Extract metric value from JSON by path (e.g., "totalRevenue" or "metadata.breachRate")
 */
function extractMetricValue(json: any, path: string): number | undefined {
  const parts = path.split(".");
  let current = json;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return typeof current === "number" ? current : undefined;
}

/**
 * Simple forecasting implementation
 */
export async function forecast(
  shopDomain: string,
  factType: string,
  metricPath: string,
  params: ForecastParams,
): Promise<ForecastResult> {
  const cutoffDate = new Date();
  cutoffDate.setUTCDate(cutoffDate.getUTCDate() - params.windowDays);

  const facts = await prisma.dashboardFact.findMany({
    where: {
      shopDomain,
      factType,
      createdAt: {
        gte: cutoffDate,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const values: number[] = [];
  for (const fact of facts) {
    const value = extractMetricValue(fact.value, metricPath);
    if (typeof value === "number" && Number.isFinite(value)) {
      values.push(value);
    }
  }

  if (values.length === 0) {
    return {
      predictedValue: 0,
      assumptions: ["No historical data available"],
    };
  }

  const assumptions: string[] = [
    `Based on ${values.length} data points over ${params.windowDays} days`,
  ];

  if (params.method === "simple_average") {
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const stdDev = Math.sqrt(
      values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) /
        values.length,
    );

    assumptions.push("Assumes stable trend (simple average)");

    return {
      predictedValue: average,
      confidence: values.length >= 7 ? 0.7 : 0.5,
      predictionInterval: {
        lower: average - 1.96 * stdDev, // 95% confidence interval
        upper: average + 1.96 * stdDev,
      },
      assumptions,
    };
  }

  if (params.method === "exponential_smoothing") {
    const alpha = params.alpha ?? 0.3;
    let smoothed = values[0];

    for (let i = 1; i < values.length; i++) {
      smoothed = alpha * values[i] + (1 - alpha) * smoothed;
    }

    assumptions.push(`Exponential smoothing with alpha=${alpha.toFixed(2)}`);
    assumptions.push("Recent values weighted more heavily");

    return {
      predictedValue: smoothed,
      confidence: values.length >= 14 ? 0.75 : 0.6,
      assumptions,
    };
  }

  return {
    predictedValue: 0,
    assumptions: ["Unknown forecasting method"],
  };
}

/**
 * Store anomaly detection result as a fact with metadata
 */
export async function recordAnomalyDetection(
  shopDomain: string,
  anomalyType: string,
  anomalyResult: AnomalyResult,
  additionalMetadata?: Prisma.InputJsonValue,
) {
  const factType = `anomaly.${anomalyType}`;

  return prisma.dashboardFact.create({
    data: {
      shopDomain,
      factType,
      scope: "ops",
      value: {
        isAnomaly: anomalyResult.isAnomaly,
        severity: anomalyResult.severity,
        currentValue: anomalyResult.currentValue,
        message: anomalyResult.message,
      },
      metadata: {
        ...(anomalyResult as unknown as Record<string, unknown>),
        ...(additionalMetadata
          ? (additionalMetadata as unknown as Record<string, unknown>)
          : {}),
        detectedAt: new Date().toISOString(),
      },
    },
  });
}
