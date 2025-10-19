/**
 * Enhanced Sampling Detection
 *
 * Improves upon basic isSamplingError with detailed diagnostics.
 * Detects various types of GA4 sampling and data quality issues.
 */

export interface SamplingDetectionResult {
  isSampled: boolean;
  samplingRate?: number;
  affectedMetrics?: string[];
  severity: "none" | "low" | "medium" | "high";
  recommendation: string;
}

/**
 * Detect sampling from error message
 */
export function detectSampling(error: unknown): SamplingDetectionResult {
  if (!error) {
    return {
      isSampled: false,
      severity: "none",
      recommendation: "No sampling detected",
    };
  }

  const message =
    typeof error === "string"
      ? error
      : typeof (error as any).message === "string"
        ? (error as any).message
        : "";

  const lowerMessage = message.toLowerCase();

  // Check for explicit sampling keywords
  const hasSamplingKeyword =
    /sampling/i.test(message) ||
    /sampled/i.test(message) ||
    /sample rate/i.test(message);

  if (!hasSamplingKeyword) {
    return {
      isSampled: false,
      severity: "none",
      recommendation: "No sampling detected",
    };
  }

  // Try to extract sampling rate if mentioned
  const rateMatch = message.match(/(\d+)%?\s*sampl/i);
  const samplingRate = rateMatch ? parseInt(rateMatch[1], 10) : undefined;

  // Determine severity based on sampling rate
  let severity: "none" | "low" | "medium" | "high" = "medium";
  if (samplingRate) {
    if (samplingRate <= 10) severity = "low";
    else if (samplingRate <= 30) severity = "medium";
    else severity = "high";
  }

  // Generate recommendation
  let recommendation = "Retry request or use broader date range";
  if (severity === "high") {
    recommendation =
      "High sampling rate detected - consider using GA4 BigQuery export";
  } else if (severity === "medium") {
    recommendation =
      "Moderate sampling - results may be approximate, retry with shorter date range";
  }

  return {
    isSampled: true,
    samplingRate,
    severity,
    recommendation,
  };
}

/**
 * Check if response data shows signs of sampling
 * (even without explicit error)
 */
export function detectImplicitSampling(metrics: {
  sessions?: number;
  users?: number;
  transactions?: number;
}): SamplingDetectionResult {
  const warnings: string[] = [];

  // Unrealistic ratios suggest sampling
  if (metrics.sessions && metrics.users) {
    const ratio = metrics.users / metrics.sessions;
    if (ratio > 1.2 || ratio < 0.4) {
      warnings.push(`Unusual users/sessions ratio: ${ratio.toFixed(2)}`);
    }
  }

  // Perfect round numbers suggest sampling
  if (
    metrics.sessions &&
    metrics.sessions % 100 === 0 &&
    metrics.sessions > 100
  ) {
    warnings.push("Sessions is a round number - possible sampling");
  }

  if (warnings.length > 0) {
    return {
      isSampled: true,
      severity: "low",
      recommendation: "Possible sampling detected - verify data quality",
      affectedMetrics: warnings,
    };
  }

  return {
    isSampled: false,
    severity: "none",
    recommendation: "No implicit sampling detected",
  };
}
