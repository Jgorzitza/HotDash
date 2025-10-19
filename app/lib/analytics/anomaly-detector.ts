/**
 * Anomaly Detection System
 *
 * Detects unusual patterns in analytics metrics using statistical methods.
 * Provides early warning for data quality issues or business anomalies.
 */

// ============================================================================
// Types
// ============================================================================

export interface AnomalyResult {
  isAnomaly: boolean;
  severity: "low" | "medium" | "high" | "critical";
  score: number; // 0-1, higher = more anomalous
  reasons: string[];
  metric: string;
  value: number;
  expectedRange: { min: number; max: number };
}

export interface HistoricalStats {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
}

// ============================================================================
// Statistical Functions
// ============================================================================

/**
 * Calculate mean (average)
 */
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate median
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = calculateMean(values);
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}

/**
 * Calculate historical statistics
 */
export function calculateHistoricalStats(values: number[]): HistoricalStats {
  return {
    mean: calculateMean(values),
    median: calculateMedian(values),
    stdDev: calculateStdDev(values),
    min: Math.min(...values),
    max: Math.max(...values),
    count: values.length,
  };
}

// ============================================================================
// Anomaly Detection Methods
// ============================================================================

/**
 * Z-Score method: Detects values outside N standard deviations
 */
function detectUsingZScore(
  value: number,
  stats: HistoricalStats,
  threshold: number = 3,
): boolean {
  if (stats.stdDev === 0) return false;
  const zScore = Math.abs((value - stats.mean) / stats.stdDev);
  return zScore > threshold;
}

/**
 * IQR method: Detects outliers using interquartile range
 */
function detectUsingIQR(value: number, values: number[]): boolean {
  if (values.length < 4) return false;

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return value < lowerBound || value > upperBound;
}

/**
 * Moving average method: Detects deviation from recent trend
 */
function detectUsingMovingAverage(
  value: number,
  recentValues: number[],
  deviationThreshold: number = 0.5, // 50% deviation
): boolean {
  if (recentValues.length === 0) return false;

  const movingAvg = calculateMean(recentValues);
  const deviation = Math.abs((value - movingAvg) / movingAvg);

  return deviation > deviationThreshold;
}

// ============================================================================
// Composite Anomaly Detection
// ============================================================================

/**
 * Detect anomaly using multiple methods
 * Returns severity based on how many methods detect an anomaly
 */
export function detectAnomaly(
  metricName: string,
  currentValue: number,
  historicalValues: number[],
): AnomalyResult {
  const reasons: string[] = [];
  let detectionCount = 0;

  // Calculate historical stats
  const stats = calculateHistoricalStats(historicalValues);

  // Method 1: Z-Score
  if (detectUsingZScore(currentValue, stats, 3)) {
    detectionCount++;
    const zScore = Math.abs((currentValue - stats.mean) / stats.stdDev);
    reasons.push(`Z-score ${zScore.toFixed(2)} exceeds threshold (>3σ)`);
  }

  // Method 2: IQR
  if (detectUsingIQR(currentValue, historicalValues)) {
    detectionCount++;
    reasons.push("Value is an outlier using IQR method");
  }

  // Method 3: Moving Average
  const recentValues = historicalValues.slice(-7); // Last 7 days
  if (detectUsingMovingAverage(currentValue, recentValues, 0.5)) {
    detectionCount++;
    const movingAvg = calculateMean(recentValues);
    const deviation = Math.abs((currentValue - movingAvg) / movingAvg);
    reasons.push(
      `${(deviation * 100).toFixed(1)}% deviation from 7-day moving average`,
    );
  }

  // Calculate anomaly score (0-1)
  const score = detectionCount / 3;

  // Determine severity
  let severity: "low" | "medium" | "high" | "critical" = "low";
  if (detectionCount >= 3) {
    severity = "critical"; // All 3 methods agree
  } else if (detectionCount === 2) {
    severity = "high"; // 2 methods agree
  } else if (detectionCount === 1) {
    severity = "medium"; // 1 method detected
  }

  // Calculate expected range (mean ± 2σ)
  const expectedRange = {
    min: Math.max(0, stats.mean - 2 * stats.stdDev),
    max: stats.mean + 2 * stats.stdDev,
  };

  return {
    isAnomaly: detectionCount > 0,
    severity,
    score,
    reasons,
    metric: metricName,
    value: currentValue,
    expectedRange,
  };
}

/**
 * Batch anomaly detection for multiple metrics
 */
export function detectAnomalies(
  currentMetrics: Record<string, number>,
  historicalMetrics: Record<string, number[]>,
): AnomalyResult[] {
  const anomalies: AnomalyResult[] = [];

  for (const [metricName, currentValue] of Object.entries(currentMetrics)) {
    const historicalValues = historicalMetrics[metricName];

    if (!historicalValues || historicalValues.length < 7) {
      continue; // Not enough historical data
    }

    const result = detectAnomaly(metricName, currentValue, historicalValues);

    if (result.isAnomaly) {
      anomalies.push(result);
    }
  }

  // Sort by severity
  const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
  anomalies.sort(
    (a, b) => severityOrder[b.severity] - severityOrder[a.severity],
  );

  return anomalies;
}

/**
 * Check if any critical anomalies exist
 */
export function hasCriticalAnomalies(anomalies: AnomalyResult[]): boolean {
  return anomalies.some((a) => a.severity === "critical");
}

/**
 * Generate anomaly report summary
 */
export function generateAnomalyReport(anomalies: AnomalyResult[]): string {
  if (anomalies.length === 0) {
    return "No anomalies detected";
  }

  const critical = anomalies.filter((a) => a.severity === "critical").length;
  const high = anomalies.filter((a) => a.severity === "high").length;
  const medium = anomalies.filter((a) => a.severity === "medium").length;

  let report = `${anomalies.length} anomal${anomalies.length === 1 ? "y" : "ies"} detected: `;
  const parts: string[] = [];

  if (critical > 0) parts.push(`${critical} critical`);
  if (high > 0) parts.push(`${high} high`);
  if (medium > 0) parts.push(`${medium} medium`);

  report += parts.join(", ");

  return report;
}
