/**
 * Support Dashboard Data Service
 * 
 * Aggregates metrics from all support services for dashboard display
 */

import type { Conversation } from './sla-monitor';
import type { QualityGrade } from '../../lib/support/quality';
import type { TriageResult } from './triage';
import { getSLAMetrics, monitorConversations } from './sla-monitor';
import { calculateMetrics as calculateQualityMetrics } from '../../lib/support/quality';
import { getTriageStats } from './triage';

export interface DashboardMetrics {
  overview: {
    totalConversations: number;
    openConversations: number;
    pendingConversations: number;
    resolvedToday: number;
    avgResponseTime: number;
    avgResolutionTime: number;
  };
  sla: {
    responseComplianceRate: number;
    resolutionComplianceRate: number;
    breachedConversations: number;
    atRiskConversations: number;
  };
  quality: {
    avgToneGrade: number;
    avgAccuracyGrade: number;
    avgPolicyGrade: number;
    avgOverallGrade: number;
    aiDraftRate: number;
    editRate: number;
  };
  triage: {
    p0Count: number;
    p1Count: number;
    p2Count: number;
    p3Count: number;
    escalationRate: number;
  };
  channels: {
    email: number;
    chat: number;
    sms: number;
  };
  trends: {
    conversationsVsYesterday: number;
    responseTimeVsYesterday: number;
    qualityVsLastWeek: number;
  };
}

export interface DashboardAlert {
  id: string;
  type: 'sla_breach' | 'quality_drop' | 'high_volume' | 'escalation_spike';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  conversationId?: string;
}

/**
 * Calculate dashboard metrics
 */
export function calculateDashboardMetrics(
  conversations: Conversation[],
  qualityGrades: QualityGrade[],
  triageResults: TriageResult[]
): DashboardMetrics {
  // Overview metrics
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const openConversations = conversations.filter(c => c.status === 'open').length;
  const pendingConversations = conversations.filter(c => c.status === 'pending').length;
  const resolvedToday = conversations.filter(
    c => c.status === 'resolved' && c.resolvedAt && c.resolvedAt >= todayStart
  ).length;
  
  // SLA metrics
  const slaMetrics = getSLAMetrics(conversations);
  const monitoring = monitorConversations(conversations, now);
  
  // Quality metrics
  const qualityMetrics = calculateQualityMetrics(qualityGrades);
  const aiDraftRate = qualityGrades.length > 0 ? 1.0 : 0.9; // Placeholder
  
  // Triage metrics
  const triageStats = getTriageStats(triageResults);
  
  // Channel distribution
  const channelCounts = conversations.reduce(
    (acc, c) => {
      acc[c.channel] = (acc[c.channel] || 0) + 1;
      return acc;
    },
    { email: 0, chat: 0, sms: 0 } as Record<string, number>
  );
  
  // Trends (placeholder - would need historical data)
  const trends = {
    conversationsVsYesterday: 0,
    responseTimeVsYesterday: 0,
    qualityVsLastWeek: 0,
  };
  
  return {
    overview: {
      totalConversations: conversations.length,
      openConversations,
      pendingConversations,
      resolvedToday,
      avgResponseTime: slaMetrics.avgResponseTimeMinutes,
      avgResolutionTime: slaMetrics.avgResolutionTimeMinutes,
    },
    sla: {
      responseComplianceRate: slaMetrics.responseComplianceRate * 100,
      resolutionComplianceRate: slaMetrics.resolutionComplianceRate * 100,
      breachedConversations: monitoring.summary.breached,
      atRiskConversations: monitoring.summary.atRisk,
    },
    quality: {
      avgToneGrade: qualityMetrics.avgToneGrade,
      avgAccuracyGrade: qualityMetrics.avgAccuracyGrade,
      avgPolicyGrade: qualityMetrics.avgPolicyGrade,
      avgOverallGrade: qualityMetrics.avgOverallGrade,
      aiDraftRate: aiDraftRate * 100,
      editRate: qualityMetrics.editRate * 100,
    },
    triage: {
      p0Count: triageStats.priorities['P0'] || 0,
      p1Count: triageStats.priorities['P1'] || 0,
      p2Count: triageStats.priorities['P2'] || 0,
      p3Count: triageStats.priorities['P3'] || 0,
      escalationRate: triageStats.escalationRate,
    },
    channels: channelCounts,
    trends,
  };
}

/**
 * Generate dashboard alerts
 */
export function generateDashboardAlerts(
  conversations: Conversation[],
  qualityGrades: QualityGrade[],
  triageResults: TriageResult[]
): DashboardAlert[] {
  const alerts: DashboardAlert[] = [];
  const now = new Date();
  
  // SLA breach alerts
  const monitoring = monitorConversations(conversations, now);
  monitoring.alerts.forEach(alert => {
    alerts.push({
      id: `sla_${alert.conversationId}`,
      type: 'sla_breach',
      severity: alert.alertType.includes('breach') ? 'critical' : 'warning',
      message: alert.message,
      timestamp: now,
      conversationId: alert.conversationId,
    });
  });
  
  // Quality drop alerts
  const qualityMetrics = calculateQualityMetrics(qualityGrades);
  if (qualityMetrics.avgToneGrade < 4.5) {
    alerts.push({
      id: 'quality_tone',
      type: 'quality_drop',
      severity: 'warning',
      message: `Tone grade ${qualityMetrics.avgToneGrade} below target 4.5`,
      timestamp: now,
    });
  }
  
  if (qualityMetrics.avgAccuracyGrade < 4.7) {
    alerts.push({
      id: 'quality_accuracy',
      type: 'quality_drop',
      severity: 'warning',
      message: `Accuracy grade ${qualityMetrics.avgAccuracyGrade} below target 4.7`,
      timestamp: now,
    });
  }
  
  // High volume alert
  const openCount = conversations.filter(c => c.status === 'open').length;
  if (openCount > 20) {
    alerts.push({
      id: 'high_volume',
      type: 'high_volume',
      severity: 'warning',
      message: `${openCount} open conversations - above normal threshold`,
      timestamp: now,
    });
  }
  
  // Escalation spike
  const triageStats = getTriageStats(triageResults);
  if (triageStats.escalationRate > 50) {
    alerts.push({
      id: 'escalation_spike',
      type: 'escalation_spike',
      severity: 'warning',
      message: `Escalation rate ${triageStats.escalationRate.toFixed(1)}% above normal`,
      timestamp: now,
    });
  }
  
  return alerts;
}

/**
 * Get dashboard summary for display
 */
export function getDashboardSummary(metrics: DashboardMetrics): string {
  const lines: string[] = [];
  
  lines.push('📊 Support Dashboard Summary');
  lines.push('');
  lines.push('Overview:');
  lines.push(`  Total Conversations: ${metrics.overview.totalConversations}`);
  lines.push(`  Open: ${metrics.overview.openConversations}`);
  lines.push(`  Pending: ${metrics.overview.pendingConversations}`);
  lines.push(`  Resolved Today: ${metrics.overview.resolvedToday}`);
  lines.push(`  Avg Response Time: ${metrics.overview.avgResponseTime} min`);
  lines.push(`  Avg Resolution Time: ${metrics.overview.avgResolutionTime} min`);
  lines.push('');
  
  lines.push('SLA Compliance:');
  lines.push(`  Response: ${metrics.sla.responseComplianceRate.toFixed(1)}%`);
  lines.push(`  Resolution: ${metrics.sla.resolutionComplianceRate.toFixed(1)}%`);
  lines.push(`  Breached: ${metrics.sla.breachedConversations}`);
  lines.push(`  At Risk: ${metrics.sla.atRiskConversations}`);
  lines.push('');
  
  lines.push('Quality Metrics:');
  lines.push(`  Tone: ${metrics.quality.avgToneGrade}/5`);
  lines.push(`  Accuracy: ${metrics.quality.avgAccuracyGrade}/5`);
  lines.push(`  Policy: ${metrics.quality.avgPolicyGrade}/5`);
  lines.push(`  Overall: ${metrics.quality.avgOverallGrade}/5`);
  lines.push(`  AI Draft Rate: ${metrics.quality.aiDraftRate.toFixed(1)}%`);
  lines.push(`  Edit Rate: ${metrics.quality.editRate.toFixed(1)}%`);
  lines.push('');
  
  lines.push('Priority Distribution:');
  lines.push(`  P0 (Critical): ${metrics.triage.p0Count}`);
  lines.push(`  P1 (High): ${metrics.triage.p1Count}`);
  lines.push(`  P2 (Normal): ${metrics.triage.p2Count}`);
  lines.push(`  P3 (Low): ${metrics.triage.p3Count}`);
  lines.push(`  Escalation Rate: ${metrics.triage.escalationRate.toFixed(1)}%`);
  lines.push('');
  
  lines.push('Channels:');
  lines.push(`  Email: ${metrics.channels.email}`);
  lines.push(`  Chat: ${metrics.channels.chat}`);
  lines.push(`  SMS: ${metrics.channels.sms}`);
  
  return lines.join('\n');
}

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Support Dashboard\n');
  
  // Mock data
  const now = new Date();
  const mockConversations: Conversation[] = [
    {
      id: '1',
      priority: 'P0' as any,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 25 * 60 * 1000),
      status: 'pending',
      channel: 'email',
    },
    {
      id: '2',
      priority: 'P1' as any,
      createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      firstResponseAt: new Date(now.getTime() - 1.5 * 60 * 60 * 1000),
      resolvedAt: new Date(now.getTime() - 30 * 60 * 1000),
      status: 'resolved',
      channel: 'chat',
    },
    {
      id: '3',
      priority: 'P2' as any,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      status: 'open',
      channel: 'email',
    },
  ];
  
  const mockQualityGrades: QualityGrade[] = [];
  const mockTriageResults: TriageResult[] = [];
  
  const metrics = calculateDashboardMetrics(mockConversations, mockQualityGrades, mockTriageResults);
  const alerts = generateDashboardAlerts(mockConversations, mockQualityGrades, mockTriageResults);
  
  console.log(getDashboardSummary(metrics));
  console.log('\n🚨 Alerts:');
  if (alerts.length === 0) {
    console.log('  No alerts');
  } else {
    alerts.forEach(alert => {
      console.log(`  [${alert.severity.toUpperCase()}] ${alert.message}`);
    });
  }
}

