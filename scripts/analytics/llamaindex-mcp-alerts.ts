/**
 * LlamaIndex MCP Alert Monitor
 * 
 * Task: ANALYTICS-LLAMAINDEX-001
 * 
 * Monitors LlamaIndex MCP server metrics and triggers alerts for:
 * - High error rates (> 5%)
 * - High latency (P95 > 500ms)
 * - Server downtime
 * - Unusual usage patterns
 * 
 * Usage:
 *   npx tsx scripts/analytics/llamaindex-mcp-alerts.ts
 *   npx tsx scripts/analytics/llamaindex-mcp-alerts.ts --check-once
 */

import { PrismaClient } from '@prisma/client';
import { logDecision } from '../../app/services/decisions.server';

const prisma = new PrismaClient();

interface AlertConfig {
  errorRateThreshold: number; // percentage
  p95LatencyThreshold: number; // milliseconds
  avgLatencyThreshold: number; // milliseconds
  checkIntervalMs: number; // milliseconds
}

const DEFAULT_CONFIG: AlertConfig = {
  errorRateThreshold: 5.0, // 5%
  p95LatencyThreshold: 500, // 500ms
  avgLatencyThreshold: 300, // 300ms
  checkIntervalMs: 60000, // 1 minute
};

interface Alert {
  severity: 'critical' | 'warning' | 'info';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: string;
}

async function fetchMCPMetrics(): Promise<any> {
  const mcpUrl = process.env.LLAMAINDEX_MCP_URL || 'http://localhost:4000';
  
  try {
    const response = await fetch(`${mcpUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    return null; // Server not reachable
  }
}

async function checkMetrics(config: AlertConfig): Promise<Alert[]> {
  const alerts: Alert[] = [];
  const timestamp = new Date().toISOString();
  
  const metrics = await fetchMCPMetrics();
  
  // Check if server is down
  if (!metrics) {
    alerts.push({
      severity: 'warning',
      message: 'LlamaIndex MCP server is not reachable',
      metric: 'server_status',
      value: 0,
      threshold: 1,
      timestamp,
    });
    return alerts;
  }
  
  // Check each tool's metrics
  if (metrics.metrics) {
    const toolMetrics = Object.entries(metrics.metrics) as [string, any][];
    
    toolMetrics.forEach(([toolName, m]) => {
      // Check error rate
      const errorRate = parseFloat(m.errorRate);
      if (errorRate > config.errorRateThreshold) {
        alerts.push({
          severity: errorRate > 10 ? 'critical' : 'warning',
          message: `High error rate for ${toolName}: ${m.errorRate}`,
          metric: `${toolName}.error_rate`,
          value: errorRate,
          threshold: config.errorRateThreshold,
          timestamp,
        });
      }
      
      // Check P95 latency
      if (m.p95LatencyMs > config.p95LatencyThreshold) {
        alerts.push({
          severity: m.p95LatencyMs > 1000 ? 'critical' : 'warning',
          message: `High P95 latency for ${toolName}: ${m.p95LatencyMs}ms`,
          metric: `${toolName}.p95_latency`,
          value: m.p95LatencyMs,
          threshold: config.p95LatencyThreshold,
          timestamp,
        });
      }
      
      // Check average latency
      if (m.avgLatencyMs > config.avgLatencyThreshold) {
        alerts.push({
          severity: 'info',
          message: `Elevated average latency for ${toolName}: ${m.avgLatencyMs}ms`,
          metric: `${toolName}.avg_latency`,
          value: m.avgLatencyMs,
          threshold: config.avgLatencyThreshold,
          timestamp,
        });
      }
    });
  }
  
  return alerts;
}

async function logAlerts(alerts: Alert[]): Promise<void> {
  if (alerts.length === 0) {
    console.log('✅ No alerts - all metrics within thresholds');
    return;
  }
  
  console.log(`\n⚠️  ${alerts.length} alert(s) detected:\n`);
  
  alerts.forEach(alert => {
    const icon = alert.severity === 'critical' ? '🔴' : alert.severity === 'warning' ? '🟡' : 'ℹ️';
    console.log(`${icon} [${alert.severity.toUpperCase()}] ${alert.message}`);
    console.log(`   Metric: ${alert.metric}`);
    console.log(`   Value: ${alert.value} | Threshold: ${alert.threshold}`);
    console.log(`   Time: ${new Date(alert.timestamp).toLocaleString()}`);
    console.log('');
  });
  
  // Log to database
  await logDecision({
    scope: 'build',
    actor: 'analytics',
    action: 'llamaindex_mcp_alerts_triggered',
    rationale: `LlamaIndex MCP monitoring detected ${alerts.length} alert(s)`,
    evidenceUrl: 'scripts/analytics/llamaindex-mcp-alerts.ts',
    status: alerts.some(a => a.severity === 'critical') ? 'blocked' : 'completed',
    payload: {
      alertCount: alerts.length,
      criticalCount: alerts.filter(a => a.severity === 'critical').length,
      warningCount: alerts.filter(a => a.severity === 'warning').length,
      infoCount: alerts.filter(a => a.severity === 'info').length,
      alerts: alerts.map(a => ({
        severity: a.severity,
        metric: a.metric,
        value: a.value,
        threshold: a.threshold,
      })),
    },
  });
}

async function monitorContinuously(config: AlertConfig): Promise<void> {
  console.log('🔍 Starting continuous LlamaIndex MCP monitoring...');
  console.log(`   Error rate threshold: ${config.errorRateThreshold}%`);
  console.log(`   P95 latency threshold: ${config.p95LatencyThreshold}ms`);
  console.log(`   Avg latency threshold: ${config.avgLatencyThreshold}ms`);
  console.log(`   Check interval: ${config.checkIntervalMs / 1000}s`);
  console.log('');
  
  const checkAndLog = async () => {
    const alerts = await checkMetrics(config);
    await logAlerts(alerts);
  };
  
  // Initial check
  await checkAndLog();
  
  // Set up interval
  setInterval(checkAndLog, config.checkIntervalMs);
}

async function main() {
  const args = process.argv.slice(2);
  const checkOnce = args.includes('--check-once');
  
  const config: AlertConfig = {
    ...DEFAULT_CONFIG,
  };
  
  // Override config from args
  const errorRateArg = args.find(arg => arg.startsWith('--error-rate='));
  if (errorRateArg) {
    config.errorRateThreshold = parseFloat(errorRateArg.split('=')[1]);
  }
  
  const p95LatencyArg = args.find(arg => arg.startsWith('--p95-latency='));
  if (p95LatencyArg) {
    config.p95LatencyThreshold = parseInt(p95LatencyArg.split('=')[1]);
  }
  
  if (checkOnce) {
    console.log('🔍 Running single alert check...\n');
    const alerts = await checkMetrics(config);
    await logAlerts(alerts);
    await prisma.$disconnect();
  } else {
    await monitorContinuously(config);
    // Keep process running
  }
}

main().catch(console.error);

