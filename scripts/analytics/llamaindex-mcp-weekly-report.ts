/**
 * LlamaIndex MCP Weekly Report Generator
 * 
 * Task: ANALYTICS-LLAMAINDEX-001
 * 
 * Generates weekly performance reports for LlamaIndex MCP server usage.
 * Tracks:
 * - Tool usage by agent
 * - Query latency trends
 * - Error rates and patterns
 * - Knowledge base growth
 * 
 * Usage:
 *   npx tsx scripts/analytics/llamaindex-mcp-weekly-report.ts
 *   npx tsx scripts/analytics/llamaindex-mcp-weekly-report.ts --days 7
 *   npx tsx scripts/analytics/llamaindex-mcp-weekly-report.ts --format json
 */

import { PrismaClient } from '@prisma/client';
import { logDecision } from '../../app/services/decisions.server';

const prisma = new PrismaClient();

interface WeeklyReport {
  period: {
    start: string;
    end: string;
    days: number;
  };
  summary: {
    totalCalls: number;
    totalErrors: number;
    errorRate: number;
    avgLatency: number;
    p95Latency: number;
  };
  byAgent: {
    [agent: string]: {
      calls: number;
      errors: number;
      avgLatency: number;
    };
  };
  byTool: {
    [tool: string]: {
      calls: number;
      errors: number;
      avgLatency: number;
    };
  };
  trends: {
    callsPerDay: number[];
    errorsPerDay: number[];
    latencyPerDay: number[];
  };
  alerts: string[];
  recommendations: string[];
}

async function fetchMCPMetrics(): Promise<any> {
  const mcpUrl = process.env.LLAMAINDEX_MCP_URL || 'http://localhost:4000';
  
  try {
    const response = await fetch(`${mcpUrl}/metrics`, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('[MCP Metrics] Failed to fetch:', error);
    return null;
  }
}

async function generateWeeklyReport(days: number = 7): Promise<WeeklyReport> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // Fetch current metrics from MCP server
  const currentMetrics = await fetchMCPMetrics();
  
  // Query historical data from decision_log
  const historicalData = await prisma.decisionLog.findMany({
    where: {
      action: 'llamaindex_mcp_dashboard_loaded',
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  // Build report
  const report: WeeklyReport = {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      days,
    },
    summary: {
      totalCalls: 0,
      totalErrors: 0,
      errorRate: 0,
      avgLatency: 0,
      p95Latency: 0,
    },
    byAgent: {},
    byTool: {},
    trends: {
      callsPerDay: [],
      errorsPerDay: [],
      latencyPerDay: [],
    },
    alerts: [],
    recommendations: [],
  };
  
  // If MCP server is running, use current metrics
  if (currentMetrics && currentMetrics.tools) {
    const toolMetrics = Object.entries(currentMetrics.tools) as [string, any][];
    
    report.summary.totalCalls = toolMetrics.reduce((sum, [_, m]) => sum + m.calls, 0);
    report.summary.totalErrors = toolMetrics.reduce((sum, [_, m]) => sum + m.errors, 0);
    report.summary.errorRate = report.summary.totalCalls > 0
      ? (report.summary.totalErrors / report.summary.totalCalls) * 100
      : 0;
    report.summary.avgLatency = toolMetrics.length > 0
      ? Math.round(toolMetrics.reduce((sum, [_, m]) => sum + m.avgLatencyMs, 0) / toolMetrics.length)
      : 0;
    report.summary.p95Latency = toolMetrics.length > 0
      ? Math.max(...toolMetrics.map(([_, m]) => m.p95LatencyMs))
      : 0;
    
    // By tool breakdown
    toolMetrics.forEach(([toolName, metrics]) => {
      report.byTool[toolName] = {
        calls: metrics.calls,
        errors: metrics.errors,
        avgLatency: metrics.avgLatencyMs,
      };
    });
  }
  
  // Generate alerts
  if (report.summary.errorRate > 5) {
    report.alerts.push(`⚠️ High error rate: ${report.summary.errorRate.toFixed(2)}% (threshold: 5%)`);
  }
  
  if (report.summary.p95Latency > 500) {
    report.alerts.push(`⚠️ High P95 latency: ${report.summary.p95Latency}ms (threshold: 500ms)`);
  }
  
  if (report.summary.totalCalls === 0) {
    report.alerts.push('ℹ️ No MCP calls recorded this week - server may not be running');
  }
  
  // Generate recommendations
  if (report.summary.avgLatency > 300) {
    report.recommendations.push('Consider optimizing query performance or adding caching');
  }
  
  if (report.summary.errorRate > 2) {
    report.recommendations.push('Investigate error patterns and add error handling');
  }
  
  if (report.summary.totalCalls > 1000) {
    report.recommendations.push('High usage detected - consider scaling or load balancing');
  }
  
  return report;
}

function formatReportText(report: WeeklyReport): string {
  const lines: string[] = [];
  
  lines.push('═'.repeat(80));
  lines.push('LlamaIndex MCP Weekly Performance Report');
  lines.push('═'.repeat(80));
  lines.push('');
  
  lines.push(`Period: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()} (${report.period.days} days)`);
  lines.push('');
  
  lines.push('SUMMARY');
  lines.push('─'.repeat(80));
  lines.push(`Total Calls:    ${report.summary.totalCalls}`);
  lines.push(`Total Errors:   ${report.summary.totalErrors}`);
  lines.push(`Error Rate:     ${report.summary.errorRate.toFixed(2)}%`);
  lines.push(`Avg Latency:    ${report.summary.avgLatency}ms`);
  lines.push(`P95 Latency:    ${report.summary.p95Latency}ms`);
  lines.push('');
  
  if (Object.keys(report.byTool).length > 0) {
    lines.push('BY TOOL');
    lines.push('─'.repeat(80));
    Object.entries(report.byTool).forEach(([tool, metrics]) => {
      lines.push(`${tool}:`);
      lines.push(`  Calls:       ${metrics.calls}`);
      lines.push(`  Errors:      ${metrics.errors}`);
      lines.push(`  Avg Latency: ${metrics.avgLatency}ms`);
      lines.push('');
    });
  }
  
  if (report.alerts.length > 0) {
    lines.push('ALERTS');
    lines.push('─'.repeat(80));
    report.alerts.forEach(alert => lines.push(alert));
    lines.push('');
  }
  
  if (report.recommendations.length > 0) {
    lines.push('RECOMMENDATIONS');
    lines.push('─'.repeat(80));
    report.recommendations.forEach((rec, i) => lines.push(`${i + 1}. ${rec}`));
    lines.push('');
  }
  
  lines.push('═'.repeat(80));
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('═'.repeat(80));
  
  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const daysArg = args.find(arg => arg.startsWith('--days='));
  const days = daysArg ? parseInt(daysArg.split('=')[1]) : 7;
  const format = args.includes('--format=json') ? 'json' : 'text';
  
  console.log(`Generating ${days}-day LlamaIndex MCP report...\n`);
  
  const report = await generateWeeklyReport(days);
  
  if (format === 'json') {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(formatReportText(report));
  }
  
  // Log report generation
  await logDecision({
    scope: 'build',
    actor: 'analytics',
    action: 'llamaindex_mcp_weekly_report_generated',
    rationale: `Generated ${days}-day LlamaIndex MCP performance report`,
    evidenceUrl: 'scripts/analytics/llamaindex-mcp-weekly-report.ts',
    payload: {
      period: report.period,
      summary: report.summary,
      alertCount: report.alerts.length,
      recommendationCount: report.recommendations.length,
    },
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);

