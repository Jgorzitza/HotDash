/**
 * Performance Monitoring for Inventory Operations
 * 
 * Tracks calculation times, sync frequency, and tile load performance
 * Manager-specified path: app/lib/inventory/performance.ts (INV-014)
 */

export interface PerformanceMetric {
  operation: string;
  startTime: number;
  endTime: number;
  durationMs: number;
  success: boolean;
  error?: string;
}

class InventoryPerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 1000;

  startTimer(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      this.recordMetric({
        operation,
        startTime,
        endTime,
        durationMs: endTime - startTime,
        success: true,
      });
    };
  }

  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
    
    // Alert if tile load >3s (North Star SLA)
    if (metric.operation.includes("tile") && metric.durationMs > 3000) {
      console.warn(`⚠️ Tile load exceeded 3s SLA: ${metric.operation} took ${metric.durationMs}ms`);
    }
  }

  getMetrics(operation?: string): PerformanceMetric[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  getAverageDuration(operation: string): number {
    const opMetrics = this.getMetrics(operation);
    if (opMetrics.length === 0) return 0;
    
    const total = opMetrics.reduce((sum, m) => sum + m.durationMs, 0);
    return total / opMetrics.length;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const perfMonitor = new InventoryPerformanceMonitor();

export function monitorOperation<T>(
  operation: string,
  fn: () => T | Promise<T>,
): Promise<T> {
  const stop = perfMonitor.startTimer(operation);
  
  try {
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then(
        (value) => {
          stop();
          return value;
        },
        (error) => {
          perfMonitor.recordMetric({
            operation,
            startTime: performance.now() - 1,
            endTime: performance.now(),
            durationMs: 1,
            success: false,
            error: error.message,
          });
          throw error;
        },
      );
    }
    
    stop();
    return Promise.resolve(result);
  } catch (error: any) {
    perfMonitor.recordMetric({
      operation,
      startTime: performance.now() - 1,
      endTime: performance.now(),
      durationMs: 1,
      success: false,
      error: error.message,
    });
    throw error;
  }
}
