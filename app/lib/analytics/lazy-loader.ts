/**
 * Lazy Loading for Expensive Metrics
 *
 * Defers loading of expensive metrics until requested.
 * Improves initial page load performance.
 */

export interface LazyMetric<T> {
  loaded: boolean;
  loading: boolean;
  data: T | null;
  error: string | null;
  load: () => Promise<void>;
}

/**
 * Create lazy metric loader
 */
export function createLazyMetric<T>(fetchFn: () => Promise<T>): LazyMetric<T> {
  const metric: LazyMetric<T> = {
    loaded: false,
    loading: false,
    data: null,
    error: null,
    load: async function () {
      if (this.loaded || this.loading) return;

      this.loading = true;
      try {
        this.data = await fetchFn();
        this.loaded = true;
        this.error = null;
      } catch (error: any) {
        this.error = error.message || "Failed to load";
        this.loaded = false;
      } finally {
        this.loading = false;
      }
    },
  };

  return metric;
}

/**
 * Batch load multiple lazy metrics
 */
export async function loadAllLazy(metrics: LazyMetric<any>[]): Promise<void> {
  await Promise.all(metrics.map((m) => m.load()));
}
