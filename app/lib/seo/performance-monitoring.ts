/**
 * SEO Performance Monitoring
 * Monitor anomaly detection runtime, API latency, tile load times
 */

export interface PerformanceMetric {
  operation: string;
  duration: number; // milliseconds
  timestamp: string;
  success: boolean;
  error?: string;
}

export interface PerformanceAlert {
  metric: "api_latency" | "tile_load" | "detection_runtime";
  threshold: number;
  actual: number;
  severity: "warning" | "critical";
  message: string;
}

const PERFORMANCE_THRESHOLDS = {
  TILE_LOAD: 3000, // 3s max per North Star
  API_LATENCY: 500, // 500ms P95
  DETECTION_RUNTIME: 2000, // 2s max
} as const;

/**
 * Monitor operation performance
 */
export async function monitorOperation<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<{ result: T; metric: PerformanceMetric }> {
  const start = Date.now();
  let success = true;
  let error: string | undefined;
  let result: T;

  try {
    result = await fn();
  } catch (err) {
    success = false;
    error = err instanceof Error ? err.message : "Unknown error";
    throw err;
  } finally {
    const duration = Date.now() - start;
    const metric: PerformanceMetric = {
      operation,
      duration,
      timestamp: new Date().toISOString(),
      success,
      error,
    };

    // Alert if exceeds threshold
    if (duration > PERFORMANCE_THRESHOLDS.API_LATENCY) {
      console.warn(`Performance alert: ${operation} took ${duration}ms`);
    }

    return { result: result!, metric };
  }
}

/**
 * Check if metrics exceed thresholds
 */
export function checkPerformanceThresholds(
  metrics: PerformanceMetric[]
): PerformanceAlert[] {
  const alerts: PerformanceAlert[] = [];

  for (const metric of metrics) {
    if (metric.operation.includes("tile") && metric.duration > PERFORMANCE_THRESHOLDS.TILE_LOAD) {
      alerts.push({
        metric: "tile_load",
        threshold: PERFORMANCE_THRESHOLDS.TILE_LOAD,
        actual: metric.duration,
        severity: metric.duration > PERFORMANCE_THRESHOLDS.TILE_LOAD * 1.5 ? "critical" : "warning",
        message: `Tile load time ${metric.duration}ms exceeds ${PERFORMANCE_THRESHOLDS.TILE_LOAD}ms threshold`,
      });
    }

    if (metric.operation.includes("api") && metric.duration > PERFORMANCE_THRESHOLDS.API_LATENCY) {
      alerts.push({
        metric: "api_latency",
        threshold: PERFORMANCE_THRESHOLDS.API_LATENCY,
        actual: metric.duration,
        severity: "warning",
        message: `API latency ${metric.duration}ms exceeds ${PERFORMANCE_THRESHOLDS.API_LATENCY}ms threshold`,
      });
    }
  }

  return alerts;
}
