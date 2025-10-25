/**
 * Performance Monitoring System
 * 
 * Tracks application performance metrics:
 * - Response times
 * - Database query performance
 * - API call latency
 * - Resource usage
 * 
 * @see DEVOPS-017
 */

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  type: 'route' | 'api' | 'database' | 'external';
  name: string;
  duration: number;
  metadata?: Record<string, any>;
}

export interface PerformanceReport {
  period: string;
  metrics: {
    routes: PerformanceStats;
    apis: PerformanceStats;
    database: PerformanceStats;
    external: PerformanceStats;
  };
  slowestOperations: PerformanceMetric[];
}

interface PerformanceStats {
  count: number;
  avgDuration: number;
  p50: number;
  p95: number;
  p99: number;
  maxDuration: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 10000;
  private readonly retentionMs = 24 * 60 * 60 * 1000; // 24 hours

  private constructor() {
    // Singleton pattern
    this.startCleanupInterval();
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Record a performance metric
   */
  record(
    type: PerformanceMetric['type'],
    name: string,
    duration: number,
    metadata?: Record<string, any>
  ): void {
    const metric: PerformanceMetric = {
      id: `perf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      name,
      duration,
      metadata,
    };

    this.metrics.push(metric);

    // Trim old metrics if we exceed max
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow operations
    if (duration > 3000) {
      console.warn('[PerformanceMonitor] Slow operation detected:', {
        type,
        name,
        duration: `${duration}ms`,
      });
    }
  }

  /**
   * Start timing an operation
   */
  startTimer(type: PerformanceMetric['type'], name: string): () => void {
    const start = performance.now();
    
    return (metadata?: Record<string, any>) => {
      const duration = Math.round(performance.now() - start);
      this.record(type, name, duration, metadata);
    };
  }

  /**
   * Get performance report for a time period
   */
  getReport(periodMs: number = 3600000): PerformanceReport {
    const cutoff = Date.now() - periodMs;
    const recentMetrics = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > cutoff
    );

    const routes = this.calculateStats(recentMetrics.filter(m => m.type === 'route'));
    const apis = this.calculateStats(recentMetrics.filter(m => m.type === 'api'));
    const database = this.calculateStats(recentMetrics.filter(m => m.type === 'database'));
    const external = this.calculateStats(recentMetrics.filter(m => m.type === 'external'));

    const slowestOperations = recentMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    return {
      period: `${periodMs / 1000}s`,
      metrics: {
        routes,
        apis,
        database,
        external,
      },
      slowestOperations,
    };
  }

  /**
   * Get metrics by type
   */
  getMetricsByType(type: PerformanceMetric['type'], limit: number = 100): PerformanceMetric[] {
    return this.metrics
      .filter(m => m.type === type)
      .slice(-limit);
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Calculate statistics for a set of metrics
   */
  private calculateStats(metrics: PerformanceMetric[]): PerformanceStats {
    if (metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        p50: 0,
        p95: 0,
        p99: 0,
        maxDuration: 0,
      };
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const sum = durations.reduce((a, b) => a + b, 0);

    return {
      count: metrics.length,
      avgDuration: Math.round(sum / metrics.length),
      p50: this.percentile(durations, 0.5),
      p95: this.percentile(durations, 0.95),
      p99: this.percentile(durations, 0.99),
      maxDuration: durations[durations.length - 1],
    };
  }

  /**
   * Calculate percentile
   */
  private percentile(sorted: number[], p: number): number {
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Start cleanup interval to remove old metrics
   */
  private startCleanupInterval(): void {
    setInterval(() => {
      const cutoff = Date.now() - this.retentionMs;
      this.metrics = this.metrics.filter(
        m => new Date(m.timestamp).getTime() > cutoff
      );
    }, 3600000); // Run every hour
  }
}

/**
 * Convenience function to record performance metric
 */
export function recordPerformance(
  type: PerformanceMetric['type'],
  name: string,
  duration: number,
  metadata?: Record<string, any>
): void {
  PerformanceMonitor.getInstance().record(type, name, duration, metadata);
}

/**
 * Convenience function to start a performance timer
 */
export function startPerformanceTimer(
  type: PerformanceMetric['type'],
  name: string
): () => void {
  return PerformanceMonitor.getInstance().startTimer(type, name);
}

/**
 * Get performance report
 */
export function getPerformanceReport(periodMs?: number): PerformanceReport {
  return PerformanceMonitor.getInstance().getReport(periodMs);
}

