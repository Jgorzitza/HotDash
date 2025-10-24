/**
 * Real-Time Analytics Metrics API
 * 
 * Task: DATA-022
 * 
 * GET /api/analytics/realtime-metrics
 * 
 * Returns comprehensive real-time metrics for the analytics dashboard.
 * 
 * Features:
 * - Growth Engine metrics (active actions, approvals, ROI)
 * - System performance metrics (response time, error rate, uptime)
 * - Business KPIs (revenue, conversion rate, sessions)
 * - System health status and alerts
 * - Cached for 30 seconds to reduce load
 */

import { type LoaderFunctionArgs } from "react-router";
import prisma from "~/db.server";
import { getDashboardMetrics } from "~/lib/monitoring/dashboard";

export interface RealtimeMetrics {
  growthEngine: {
    activeActions: number;
    pendingApprovals: number;
    completedToday: number;
    avgROI: number;
    successRate: number;
  };
  performance: {
    responseTimeP95: number;
    errorRate: number;
    uptime: number;
    throughput: number;
  };
  kpis: {
    revenue24h: number;
    conversionRate: number;
    avgOrderValue: number;
    sessions24h: number;
  };
  health: {
    status: 'healthy' | 'degraded' | 'critical';
    activeAlerts: number;
    lastCheck: string;
  };
  timestamp: string;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  metric: string;
  message: string;
  value: number;
  threshold: number;
  timestamp: string;
}

/**
 * Get Growth Engine metrics
 */
async function getGrowthEngineMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get action queue stats
  const [activeActions, pendingApprovals, completedToday, executedActions] = await Promise.all([
    prisma.action_queue.count({
      where: { status: 'pending' }
    }),
    prisma.action_queue.count({
      where: { status: 'pending', approved_at: null }
    }),
    prisma.action_queue.count({
      where: {
        status: 'executed',
        executed_at: { gte: today }
      }
    }),
    prisma.action_queue.findMany({
      where: {
        status: 'executed',
        realized_revenue_28d: { not: null }
      },
      select: {
        realized_revenue_28d: true,
        execution_result: true
      }
    })
  ]);
  
  // Calculate average ROI
  const totalROI = executedActions.reduce((sum, action) => {
    return sum + (action.realized_revenue_28d ? Number(action.realized_revenue_28d) : 0);
  }, 0);
  const avgROI = executedActions.length > 0 ? totalROI / executedActions.length : 0;
  
  // Calculate success rate
  const successfulActions = executedActions.filter(action => 
    action.execution_result && (action.execution_result as any).success === true
  ).length;
  const successRate = executedActions.length > 0 ? successfulActions / executedActions.length : 0;
  
  return {
    activeActions,
    pendingApprovals,
    completedToday,
    avgROI,
    successRate
  };
}

/**
 * Get system performance metrics
 */
function getPerformanceMetrics() {
  try {
    const dashboardMetrics = getDashboardMetrics(3600000); // 1 hour
    
    return {
      responseTimeP95: dashboardMetrics.performance.p95ResponseTime || 0,
      errorRate: dashboardMetrics.errors.errorRate || 0,
      uptime: dashboardMetrics.uptime.uptimePercentage || 0,
      throughput: dashboardMetrics.performance.throughput || 0
    };
  } catch (error) {
    console.error('[Realtime Metrics] Failed to get performance metrics:', error);
    return {
      responseTimeP95: 0,
      errorRate: 0,
      uptime: 1.0,
      throughput: 0
    };
  }
}

/**
 * Get business KPIs (mock data - replace with actual GA4/Shopify queries)
 */
async function getBusinessKPIs() {
  // TODO: Replace with actual GA4 and Shopify API calls
  // For now, return mock data
  return {
    revenue24h: 1250.50,
    conversionRate: 0.0245,
    avgOrderValue: 85.75,
    sessions24h: 1523
  };
}

/**
 * Get system health status
 */
async function getSystemHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'critical';
  activeAlerts: number;
  lastCheck: string;
}> {
  try {
    const dashboardMetrics = getDashboardMetrics(3600000);
    
    // Determine health status based on metrics
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    let activeAlerts = 0;
    
    // Check error rate
    if (dashboardMetrics.errors.errorRate > 0.01) {
      status = 'critical';
      activeAlerts++;
    } else if (dashboardMetrics.errors.errorRate > 0.005) {
      status = 'degraded';
      activeAlerts++;
    }
    
    // Check uptime
    if (dashboardMetrics.uptime.uptimePercentage < 0.99) {
      status = 'critical';
      activeAlerts++;
    } else if (dashboardMetrics.uptime.uptimePercentage < 0.999) {
      if (status === 'healthy') status = 'degraded';
      activeAlerts++;
    }
    
    // Check response time
    if (dashboardMetrics.performance.p95ResponseTime > 5000) {
      status = 'critical';
      activeAlerts++;
    } else if (dashboardMetrics.performance.p95ResponseTime > 3000) {
      if (status === 'healthy') status = 'degraded';
      activeAlerts++;
    }
    
    return {
      status,
      activeAlerts,
      lastCheck: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Realtime Metrics] Failed to get system health:', error);
    return {
      status: 'healthy',
      activeAlerts: 0,
      lastCheck: new Date().toISOString()
    };
  }
}

/**
 * Generate alerts based on current metrics
 */
function generateAlerts(metrics: RealtimeMetrics): Alert[] {
  const alerts: Alert[] = [];
  
  // Check error rate
  if (metrics.performance.errorRate > 0.01) {
    alerts.push({
      id: `alert-error-rate-${Date.now()}`,
      type: 'critical',
      metric: 'Error Rate',
      message: 'Error rate exceeds critical threshold',
      value: metrics.performance.errorRate * 100,
      threshold: 1.0,
      timestamp: new Date().toISOString()
    });
  } else if (metrics.performance.errorRate > 0.005) {
    alerts.push({
      id: `alert-error-rate-${Date.now()}`,
      type: 'warning',
      metric: 'Error Rate',
      message: 'Error rate above normal levels',
      value: metrics.performance.errorRate * 100,
      threshold: 0.5,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check response time
  if (metrics.performance.responseTimeP95 > 5000) {
    alerts.push({
      id: `alert-response-time-${Date.now()}`,
      type: 'critical',
      metric: 'Response Time (P95)',
      message: 'Response time critically high',
      value: metrics.performance.responseTimeP95,
      threshold: 5000,
      timestamp: new Date().toISOString()
    });
  } else if (metrics.performance.responseTimeP95 > 3000) {
    alerts.push({
      id: `alert-response-time-${Date.now()}`,
      type: 'warning',
      metric: 'Response Time (P95)',
      message: 'Response time above target',
      value: metrics.performance.responseTimeP95,
      threshold: 3000,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check pending approvals
  if (metrics.growthEngine.pendingApprovals > 10) {
    alerts.push({
      id: `alert-approvals-${Date.now()}`,
      type: 'warning',
      metric: 'Pending Approvals',
      message: 'High number of pending approvals',
      value: metrics.growthEngine.pendingApprovals,
      threshold: 10,
      timestamp: new Date().toISOString()
    });
  }
  
  // Check success rate
  if (metrics.growthEngine.successRate < 0.7) {
    alerts.push({
      id: `alert-success-rate-${Date.now()}`,
      type: 'warning',
      metric: 'Action Success Rate',
      message: 'Action success rate below target',
      value: metrics.growthEngine.successRate * 100,
      threshold: 70,
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
}

/**
 * Loader function
 */
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    
    // Fetch all metrics in parallel
    const [growthEngine, performance, kpis, health] = await Promise.all([
      getGrowthEngineMetrics(),
      Promise.resolve(getPerformanceMetrics()),
      getBusinessKPIs(),
      getSystemHealth()
    ]);
    
    const metrics: RealtimeMetrics = {
      growthEngine,
      performance,
      kpis,
      health,
      timestamp: new Date().toISOString()
    };
    
    // Generate alerts
    const alerts = generateAlerts(metrics);
    
    
    return Response.json({
      success: true,
      metrics,
      alerts,
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('[Realtime Metrics API] ❌ Error:', error);
    
    return Response.json({
      success: false,
      error: error.message || 'Failed to fetch real-time metrics',
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

