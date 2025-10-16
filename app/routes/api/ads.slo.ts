/**
 * Ads SLO API Route
 * 
 * Purpose: API endpoint for Service Level Objective monitoring
 * Owner: ads agent
 * Date: 2025-10-16
 */


import { monitorSLOs, generateSLOReport, type SLODashboard } from '../../lib/ads/slo-dashboard';
import { adsTelemetry } from '../../lib/ads/telemetry';

export async function loader({ request }: any) {
  const startTime = Date.now();
  
  try {
    // Get current metrics from telemetry
    const recentEvents = adsTelemetry.getEvents();
    const apiCalls = recentEvents.filter(e => e.eventType === 'api_call');
    const errors = recentEvents.filter(e => e.eventType === 'error');
    const cacheHits = recentEvents.filter(e => e.eventType === 'cache_hit');
    const cacheMisses = recentEvents.filter(e => e.eventType === 'cache_miss');
    
    // Calculate metrics
    const totalRequests = apiCalls.length + errors.length;
    const availability = totalRequests > 0 ? ((apiCalls.length / totalRequests) * 100) : 100;
    const errorRate = totalRequests > 0 ? ((errors.length / totalRequests) * 100) : 0;
    
    const latencies = apiCalls.map(e => e.durationMs).sort((a, b) => a - b);
    const latencyP95 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] : 0;
    const latencyP99 = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] : 0;
    
    const totalCacheRequests = cacheHits.length + cacheMisses.length;
    const cacheHitRate = totalCacheRequests > 0 ? ((cacheHits.length / totalCacheRequests) * 100) : 0;
    
    // Assume data freshness of 3 minutes (would be calculated from actual cache timestamps)
    const dataFreshnessMinutes = 3;
    
    // Monitor SLOs
    const dashboard: SLODashboard = monitorSLOs({
      availability,
      latencyP95,
      latencyP99,
      errorRate,
      cacheHitRate,
      dataFreshnessMinutes,
    });
    
    // Generate report
    const report = generateSLOReport(dashboard);
    
    // Record telemetry
    const duration = Date.now() - startTime;
    adsTelemetry.recordEvent({
      eventType: 'api_call',
      operation: 'slo_monitoring',
      durationMs: duration,
      metadata: {
        overallHealth: dashboard.overallHealth,
        complianceRate: report.complianceRate,
      },
    });
    
    return Response.json({
      dashboard,
      report,
      metrics: {
        availability,
        latencyP95,
        latencyP99,
        errorRate,
        cacheHitRate,
        dataFreshnessMinutes,
        totalRequests,
        totalErrors: errors.length,
      },
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    adsTelemetry.recordEvent({
      eventType: 'error',
      operation: 'slo_monitoring',
      durationMs: duration,
      metadata: { error: error instanceof Error ? error.message : String(error) },
    });
    
    return Response.json(
      {
        error: 'Failed to fetch SLO metrics',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

