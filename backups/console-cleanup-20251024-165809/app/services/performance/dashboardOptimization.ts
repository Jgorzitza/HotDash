/**
 * Dashboard Performance Optimization Service
 *
 * Provides performance optimizations for Growth Engine phases 9-12
 * including lazy loading, caching, and efficient data fetching.
 */

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  apiResponseTime: number;
}

export interface OptimizationConfig {
  enableLazyLoading: boolean;
  enableCaching: boolean;
  enableVirtualization: boolean;
  maxConcurrentRequests: number;
  cacheTimeout: number;
  debounceDelay: number;
}

export class DashboardOptimizer {
  private config: OptimizationConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private performanceMetrics: PerformanceMetrics[] = [];

  constructor(config: Partial<OptimizationConfig> = {}) {
    this.config = {
      enableLazyLoading: true,
      enableCaching: true,
      enableVirtualization: true,
      maxConcurrentRequests: 5,
      cacheTimeout: 300000, // 5 minutes
      debounceDelay: 300,
      ...config,
    };
  }

  /**
   * Optimized data fetching with caching and request deduplication
   */
  async fetchWithOptimization<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; forceRefresh?: boolean } = {}
  ): Promise<T> {
    const { ttl = this.config.cacheTimeout, forceRefresh = false } = options;

    // Check cache first
    if (this.config.enableCaching && !forceRefresh) {
      const cached = this.cache.get(key);
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        return cached.data;
      }
    }

    // Fetch data
    const startTime = performance.now();
    try {
      const data = await fetcher();
      const endTime = performance.now();

      // Cache the result
      if (this.config.enableCaching) {
        this.cache.set(key, {
          data,
          timestamp: Date.now(),
          ttl,
        });
      }

      // Record performance metrics
      this.recordMetrics({
        loadTime: endTime - startTime,
        renderTime: 0, // Will be set by component
        memoryUsage: this.getMemoryUsage(),
        cacheHitRate: this.calculateCacheHitRate(),
        apiResponseTime: endTime - startTime,
      });

      return data;
    } catch (error) {
      console.error(`[DashboardOptimizer] Fetch failed for ${key}:`, error);
      throw error;
    }
  }

  /**
   * Debounced function execution for performance
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number = this.config.debounceDelay
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttled function execution for performance
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number = 1000
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  /**
   * Lazy loading utility for components
   */
  createLazyComponent<T extends React.ComponentType<any>>(
    importFunc: () => Promise<{ default: T }>
  ): React.LazyExoticComponent<T> {
    if (!this.config.enableLazyLoading) {
      throw new Error("Lazy loading is disabled");
    }

    return React.lazy(importFunc);
  }

  /**
   * Virtual scrolling configuration for large lists
   */
  getVirtualizationConfig(itemCount: number, itemHeight: number = 50) {
    if (!this.config.enableVirtualization || itemCount < 100) {
      return null;
    }

    return {
      itemCount,
      itemHeight,
      overscan: 5,
      threshold: 100,
    };
  }

  /**
   * Batch API requests for efficiency
   */
  async batchRequests<T>(
    requests: Array<{ key: string; fetcher: () => Promise<T> }>,
    batchSize: number = this.config.maxConcurrentRequests
  ): Promise<Record<string, T>> {
    const results: Record<string, T> = {};
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      const batchPromises = batch.map(async ({ key, fetcher }) => {
        try {
          const data = await this.fetchWithOptimization(key, fetcher);
          return { key, data };
        } catch (error) {
          console.error(`[DashboardOptimizer] Batch request failed for ${key}:`, error);
          return { key, data: null };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ key, data }) => {
        if (data !== null) {
          results[key] = data;
        }
      });
    }

    return results;
  }

  /**
   * Memory usage monitoring
   */
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Cache hit rate calculation
   */
  private calculateCacheHitRate(): number {
    if (this.performanceMetrics.length === 0) return 0;
    
    const totalRequests = this.performanceMetrics.length;
    const cacheHits = this.performanceMetrics.filter(m => m.cacheHitRate > 0).length;
    return (cacheHits / totalRequests) * 100;
  }

  /**
   * Record performance metrics
   */
  private recordMetrics(metrics: Partial<PerformanceMetrics>) {
    this.performanceMetrics.push({
      loadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      apiResponseTime: 0,
      ...metrics,
    });

    // Keep only last 100 metrics
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    averageLoadTime: number;
    averageRenderTime: number;
    averageMemoryUsage: number;
    averageCacheHitRate: number;
    averageApiResponseTime: number;
  } {
    if (this.performanceMetrics.length === 0) {
      return {
        averageLoadTime: 0,
        averageRenderTime: 0,
        averageMemoryUsage: 0,
        averageCacheHitRate: 0,
        averageApiResponseTime: 0,
      };
    }

    const sum = this.performanceMetrics.reduce(
      (acc, metrics) => ({
        loadTime: acc.loadTime + metrics.loadTime,
        renderTime: acc.renderTime + metrics.renderTime,
        memoryUsage: acc.memoryUsage + metrics.memoryUsage,
        cacheHitRate: acc.cacheHitRate + metrics.cacheHitRate,
        apiResponseTime: acc.apiResponseTime + metrics.apiResponseTime,
      }),
      { loadTime: 0, renderTime: 0, memoryUsage: 0, cacheHitRate: 0, apiResponseTime: 0 }
    );

    const count = this.performanceMetrics.length;
    return {
      averageLoadTime: sum.loadTime / count,
      averageRenderTime: sum.renderTime / count,
      averageMemoryUsage: sum.memoryUsage / count,
      averageCacheHitRate: sum.cacheHitRate / count,
      averageApiResponseTime: sum.apiResponseTime / count,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Global dashboard optimizer instance
export const dashboardOptimizer = new DashboardOptimizer({
  enableLazyLoading: true,
  enableCaching: true,
  enableVirtualization: true,
  maxConcurrentRequests: 5,
  cacheTimeout: 300000, // 5 minutes
  debounceDelay: 300,
});

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics[]>([]);
  const [summary, setSummary] = React.useState(dashboardOptimizer.getPerformanceSummary());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setSummary(dashboardOptimizer.getPerformanceSummary());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    metrics,
    summary,
    clearCache: () => dashboardOptimizer.clearCache(),
  };
}
