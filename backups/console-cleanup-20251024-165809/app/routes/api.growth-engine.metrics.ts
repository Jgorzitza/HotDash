/**
 * Growth Engine Metrics API Route
 * 
 * Provides real-time performance metrics for monitoring and optimization
 * 
 * Task: ENG-003
 */

import type { LoaderFunctionArgs } from "react-router";
import { GrowthEnginePerformance, defaultPerformanceConfig } from "~/services/growth-engine-performance";

// Initialize performance service (singleton pattern)
let performanceService: GrowthEnginePerformance | null = null;

function getPerformanceService(): GrowthEnginePerformance {
  if (!performanceService) {
    performanceService = new GrowthEnginePerformance(defaultPerformanceConfig);
  }
  return performanceService;
}

/**
 * GET /api/growth-engine/metrics
 * 
 * Returns current performance metrics
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    
    const performance = getPerformanceService();
    const metrics = performance.getMetrics();
    
    if (format === 'prometheus') {
      // Prometheus format
      const prometheusMetrics = formatPrometheus(metrics);
      
      return new Response(prometheusMetrics, {
        headers: {
          'Content-Type': 'text/plain; version=0.0.4',
        },
      });
    }
    
    // JSON format (default)
    return Response.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * Format metrics for Prometheus
 */
function formatPrometheus(metrics: any): string {
  const lines: string[] = [];
  
  // System metrics
  lines.push('# HELP growth_engine_cpu_usage CPU usage percentage');
  lines.push('# TYPE growth_engine_cpu_usage gauge');
  lines.push(`growth_engine_cpu_usage ${metrics.system.cpuUsage}`);
  
  lines.push('# HELP growth_engine_memory_usage Memory usage percentage');
  lines.push('# TYPE growth_engine_memory_usage gauge');
  lines.push(`growth_engine_memory_usage ${metrics.system.memoryUsage}`);
  
  lines.push('# HELP growth_engine_disk_usage Disk usage percentage');
  lines.push('# TYPE growth_engine_disk_usage gauge');
  lines.push(`growth_engine_disk_usage ${metrics.system.diskUsage}`);
  
  lines.push('# HELP growth_engine_network_latency Network latency in milliseconds');
  lines.push('# TYPE growth_engine_network_latency gauge');
  lines.push(`growth_engine_network_latency ${metrics.system.networkLatency}`);
  
  // Application metrics
  lines.push('# HELP growth_engine_response_time Response time in milliseconds');
  lines.push('# TYPE growth_engine_response_time gauge');
  lines.push(`growth_engine_response_time ${metrics.application.responseTime}`);
  
  lines.push('# HELP growth_engine_throughput Throughput in requests per minute');
  lines.push('# TYPE growth_engine_throughput gauge');
  lines.push(`growth_engine_throughput ${metrics.application.throughput}`);
  
  lines.push('# HELP growth_engine_error_rate Error rate percentage');
  lines.push('# TYPE growth_engine_error_rate gauge');
  lines.push(`growth_engine_error_rate ${metrics.application.errorRate}`);
  
  lines.push('# HELP growth_engine_success_rate Success rate percentage');
  lines.push('# TYPE growth_engine_success_rate gauge');
  lines.push(`growth_engine_success_rate ${metrics.application.successRate}`);
  
  // Cache metrics
  lines.push('# HELP growth_engine_cache_hit_rate Cache hit rate percentage');
  lines.push('# TYPE growth_engine_cache_hit_rate gauge');
  lines.push(`growth_engine_cache_hit_rate ${metrics.cache.hitRate}`);
  
  lines.push('# HELP growth_engine_cache_miss_rate Cache miss rate percentage');
  lines.push('# TYPE growth_engine_cache_miss_rate gauge');
  lines.push(`growth_engine_cache_miss_rate ${metrics.cache.missRate}`);
  
  lines.push('# HELP growth_engine_cache_eviction_rate Cache eviction rate percentage');
  lines.push('# TYPE growth_engine_cache_eviction_rate gauge');
  lines.push(`growth_engine_cache_eviction_rate ${metrics.cache.evictionRate}`);
  
  lines.push('# HELP growth_engine_cache_size Cache size in entries');
  lines.push('# TYPE growth_engine_cache_size gauge');
  lines.push(`growth_engine_cache_size ${metrics.cache.size}`);
  
  // Database metrics
  lines.push('# HELP growth_engine_db_query_time Database query time in milliseconds');
  lines.push('# TYPE growth_engine_db_query_time gauge');
  lines.push(`growth_engine_db_query_time ${metrics.database.queryTime}`);
  
  lines.push('# HELP growth_engine_db_connection_pool Database connection pool usage percentage');
  lines.push('# TYPE growth_engine_db_connection_pool gauge');
  lines.push(`growth_engine_db_connection_pool ${metrics.database.connectionPool}`);
  
  lines.push('# HELP growth_engine_db_slow_queries Number of slow queries');
  lines.push('# TYPE growth_engine_db_slow_queries counter');
  lines.push(`growth_engine_db_slow_queries ${metrics.database.slowQueries}`);
  
  lines.push('# HELP growth_engine_db_deadlocks Number of deadlocks');
  lines.push('# TYPE growth_engine_db_deadlocks counter');
  lines.push(`growth_engine_db_deadlocks ${metrics.database.deadlocks}`);
  
  return lines.join('\n') + '\n';
}

