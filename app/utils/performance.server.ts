/**
 * Performance monitoring and optimization utilities
 */

/**
 * Measure execution time of an async function
 */
export async function measure<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; durationMs: number }> {
  const start = performance.now();
  const result = await fn();
  const durationMs = Math.round(performance.now() - start);
  
  console.log(`[Performance] ${name}: ${durationMs}ms`);
  
  return { result, durationMs };
}

/**
 * Simple memoization decorator for expensive operations
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: { ttlMs?: number; keyFn?: (...args: Parameters<T>) => string } = {}
): T {
  const cache = new Map<string, { value: ReturnType<T>; expiresAt: number }>();
  const ttlMs = options.ttlMs || 60000; // Default 1 minute
  const keyFn = options.keyFn || ((...args) => JSON.stringify(args));

  return ((...args: Parameters<T>) => {
    const key = keyFn(...args);
    const cached = cache.get(key);
    
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, {
      value: result,
      expiresAt: Date.now() + ttlMs,
    });

    return result;
  }) as T;
}

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delayMs);
  };
}

/**
 * Batch multiple operations to reduce overhead
 */
export async function batch<T, R>(
  items: T[],
  batchSize: number,
  processFn: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await processFn(batch);
    results.push(...batchResults);
  }
  
  return results;
}

/**
 * Profile a loader function for performance monitoring
 */
export function profileLoader<T>(
  loaderName: string
) {
  return async function(loaderFn: () => Promise<T>): Promise<T> {
    const { result, durationMs } = await measure(loaderName, loaderFn);
    
    // Warn if loader is slow (>300ms target per direction)
    if (durationMs > 300) {
      console.warn(`[Performance] Slow loader: ${loaderName} took ${durationMs}ms (target: <300ms)`);
    }
    
    return result;
  };
}

