/**
 * Prometheus Metrics Endpoint
 *
 * Exposes application metrics in Prometheus format for monitoring and alerting.
 *
 * Metrics exposed:
 * - HTTP request duration (histogram)
 * - HTTP request count (counter)
 * - Active connections (gauge)
 * - Error rate (counter)
 * - Database query duration (histogram)
 * - Cache hit/miss rate (counter)
 */

import { Counter, Histogram, Gauge, Registry } from 'prom-client';

// Create a Registry to register the metrics
export const register = new Registry();

// HTTP Metrics
export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export const httpRequestErrors = new Counter({
  name: 'http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'error_type'],
  registers: [register],
});

// Application Metrics
export const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections',
  registers: [register],
});

export const databaseQueryDuration = new Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 3, 5],
  registers: [register],
});

export const cacheHits = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_name'],
  registers: [register],
});

export const cacheMisses = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_name'],
  registers: [register],
});

// Business Metrics
export const tilesLoaded = new Counter({
  name: 'tiles_loaded_total',
  help: 'Total number of dashboard tiles loaded',
  labelNames: ['tile_type'],
  registers: [register],
});

export const tileLoadDuration = new Histogram({
  name: 'tile_load_duration_seconds',
  help: 'Duration of tile loading in seconds',
  labelNames: ['tile_type'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 3, 5],
  registers: [register],
});

export const shopifyApiCalls = new Counter({
  name: 'shopify_api_calls_total',
  help: 'Total number of Shopify API calls',
  labelNames: ['operation', 'status'],
  registers: [register],
});

export const shopifyApiDuration = new Histogram({
  name: 'shopify_api_duration_seconds',
  help: 'Duration of Shopify API calls in seconds',
  labelNames: ['operation'],
  buckets: [0.1, 0.3, 0.5, 1, 2, 3, 5, 10],
  registers: [register],
});

// KB Search Metrics
export const kbSearchDuration = new Histogram({
  name: 'kb_search_duration_seconds',
  help: 'Duration of KB search operations in seconds',
  labelNames: ['type', 'success'],
  buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1, 2, 5],
  registers: [register],
});

export const kbSearchResultsCount = new Histogram({
  name: 'kb_search_results_count',
  help: 'Number of results returned by KB search',
  labelNames: ['type'],
  buckets: [0, 1, 3, 5, 10, 20, 50],
  registers: [register],
});

export const kbSearchTopConfidence = new Histogram({
  name: 'kb_search_top_confidence',
  help: 'Top result confidenceScore distribution (0-1)',
  labelNames: ['type'],
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
  registers: [register],
});


// Middleware to track HTTP metrics
export function metricsMiddleware() {
  return async (req: Request, next: () => Promise<Response>) => {
    const start = Date.now();
    const url = new URL(req.url);
    const route = url.pathname;
    const method = req.method;

    // Increment active connections
    activeConnections.inc();

    try {
      const response = await next();
      const duration = (Date.now() - start) / 1000;
      const statusCode = response.status.toString();

      // Record metrics
      httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
      httpRequestTotal.inc({ method, route, status_code: statusCode });

      // Track errors
      if (response.status >= 400) {
        const errorType = response.status >= 500 ? 'server_error' : 'client_error';
        httpRequestErrors.inc({ method, route, error_type: errorType });
      }

      return response;
    } catch (error) {
      const duration = (Date.now() - start) / 1000;
      httpRequestDuration.observe({ method, route, status_code: '500' }, duration);
      httpRequestTotal.inc({ method, route, status_code: '500' });
      httpRequestErrors.inc({ method, route, error_type: 'exception' });
      throw error;
    } finally {
      // Decrement active connections
      activeConnections.dec();
    }
  };
}

// Helper function to track database queries
export function trackDatabaseQuery<T>(
  operation: string,
  table: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  return queryFn()
    .then((result) => {
      const duration = (Date.now() - start) / 1000;
      databaseQueryDuration.observe({ operation, table }, duration);
      return result;
    })
    .catch((error) => {
      const duration = (Date.now() - start) / 1000;
      databaseQueryDuration.observe({ operation, table }, duration);
      throw error;
    });
}

// Helper function to track cache operations
export function trackCacheOperation(cacheName: string, hit: boolean) {
  if (hit) {
    cacheHits.inc({ cache_name: cacheName });
  } else {
    cacheMisses.inc({ cache_name: cacheName });
  }
}

// Helper function to track tile loading
export function trackTileLoad(tileType: string, duration: number) {
  tilesLoaded.inc({ tile_type: tileType });
  tileLoadDuration.observe({ tile_type: tileType }, duration / 1000);
}

// Helper function to track Shopify API calls
export function trackShopifyApiCall(operation: string, duration: number, success: boolean) {
  const status = success ? 'success' : 'error';
  shopifyApiCalls.inc({ operation, status });
  shopifyApiDuration.observe({ operation }, duration / 1000);
}

// Metrics endpoint handler
export async function metricsHandler(): Promise<Response> {
  const metrics = await register.metrics();
  return new Response(metrics, {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}

