/**
 * Performance monitoring utilities for tracking API and render performance
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000; // Keep last 1000 metrics

  /**
   * Start a performance timer
   */
  startTimer(name: string): () => void {
    const start = Date.now();
    
    return () => {
      const duration = Date.now() - start;
      this.recordMetric({
        name,
        duration,
        timestamp: new Date(),
      });
      return duration;
    };
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last N metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log slow operations (>1s)
    if (metric.duration > 1000) {
      console.warn(`[PERF] Slow operation: ${metric.name} took ${metric.duration}ms`, metric.metadata);
    }
  }

  /**
   * Get metrics for a specific operation
   */
  getMetrics(name?: string): PerformanceMetric[] {
    if (!name) return this.metrics;
    return this.metrics.filter((m) => m.name === name);
  }

  /**
   * Get average duration for an operation
   */
  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;
    
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Get performance summary
   */
  getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
    const summary: Record<string, { count: number; total: number; min: number; max: number }> = {};

    for (const metric of this.metrics) {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: 0,
        };
      }

      const entry = summary[metric.name];
      entry.count++;
      entry.total += metric.duration;
      entry.min = Math.min(entry.min, metric.duration);
      entry.max = Math.max(entry.max, metric.duration);
    }

    // Calculate averages
    const result: Record<string, { count: number; avg: number; min: number; max: number }> = {};
    for (const [name, data] of Object.entries(summary)) {
      result[name] = {
        count: data.count,
        avg: Math.round(data.total / data.count),
        min: data.min,
        max: data.max,
      };
    }

    return result;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }
}

// Singleton instance
export const perfMonitor = new PerformanceMonitor();

/**
 * Helper to wrap async functions with performance tracking
 */
export async function withPerformanceTracking<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, unknown>,
): Promise<T> {
  const endTimer = perfMonitor.startTimer(name);
  
  try {
    const result = await fn();
    const duration = endTimer();
    
    if (metadata) {
      perfMonitor.recordMetric({
        name,
        duration,
        timestamp: new Date(),
        metadata,
      });
    }
    
    return result;
  } catch (error) {
    endTimer();
    throw error;
  }
}
