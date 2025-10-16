/**
 * SLA Monitoring Service
 * 
 * Tracks response times and alerts on SLA breaches
 * Based on priority levels from triage service
 */

import { Priority, getSLATarget } from './triage';

export interface Conversation {
  id: string;
  priority: Priority;
  createdAt: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  status: 'open' | 'pending' | 'resolved';
  channel: 'email' | 'chat' | 'sms';
}

export interface SLAStatus {
  conversationId: string;
  priority: Priority;
  responseTimeMinutes: number | null;
  resolutionTimeMinutes: number | null;
  responseTarget: number;
  resolutionTarget: number;
  responseBreached: boolean;
  resolutionBreached: boolean;
  responseTimeRemaining: number | null;
  resolutionTimeRemaining: number | null;
  status: 'on_track' | 'at_risk' | 'breached';
}

export interface SLAAlert {
  conversationId: string;
  priority: Priority;
  alertType: 'response_breach' | 'resolution_breach' | 'response_warning' | 'resolution_warning';
  message: string;
  minutesOverdue?: number;
  minutesUntilBreach?: number;
}

/**
 * Calculate time difference in minutes
 */
function getMinutesDiff(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Check SLA status for a conversation
 */
export function checkSLA(conversation: Conversation, now: Date = new Date()): SLAStatus {
  const targets = getSLATarget(conversation.priority);
  
  // Calculate response time
  let responseTimeMinutes: number | null = null;
  let responseBreached = false;
  let responseTimeRemaining: number | null = null;
  
  if (conversation.firstResponseAt) {
    responseTimeMinutes = getMinutesDiff(conversation.createdAt, conversation.firstResponseAt);
    responseBreached = responseTimeMinutes > targets.responseTime;
    responseTimeRemaining = 0; // Already responded
  } else {
    const elapsed = getMinutesDiff(conversation.createdAt, now);
    responseTimeRemaining = targets.responseTime - elapsed;
    responseBreached = responseTimeRemaining < 0;
  }
  
  // Calculate resolution time
  let resolutionTimeMinutes: number | null = null;
  let resolutionBreached = false;
  let resolutionTimeRemaining: number | null = null;
  
  if (conversation.resolvedAt) {
    resolutionTimeMinutes = getMinutesDiff(conversation.createdAt, conversation.resolvedAt);
    resolutionBreached = resolutionTimeMinutes > targets.resolutionTime;
    resolutionTimeRemaining = 0; // Already resolved
  } else {
    const elapsed = getMinutesDiff(conversation.createdAt, now);
    resolutionTimeRemaining = targets.resolutionTime - elapsed;
    resolutionBreached = resolutionTimeRemaining < 0;
  }
  
  // Determine overall status
  let status: 'on_track' | 'at_risk' | 'breached' = 'on_track';
  
  if (responseBreached || resolutionBreached) {
    status = 'breached';
  } else if (
    (responseTimeRemaining !== null && responseTimeRemaining < targets.responseTime * 0.2) ||
    (resolutionTimeRemaining !== null && resolutionTimeRemaining < targets.resolutionTime * 0.2)
  ) {
    status = 'at_risk';
  }
  
  return {
    conversationId: conversation.id,
    priority: conversation.priority,
    responseTimeMinutes,
    resolutionTimeMinutes,
    responseTarget: targets.responseTime,
    resolutionTarget: targets.resolutionTime,
    responseBreached,
    resolutionBreached,
    responseTimeRemaining,
    resolutionTimeRemaining,
    status,
  };
}

/**
 * Generate alerts for SLA breaches or warnings
 */
export function generateAlerts(slaStatus: SLAStatus): SLAAlert[] {
  const alerts: SLAAlert[] = [];
  
  // Response breach
  if (slaStatus.responseBreached && slaStatus.responseTimeMinutes !== null) {
    const minutesOverdue = slaStatus.responseTimeMinutes - slaStatus.responseTarget;
    alerts.push({
      conversationId: slaStatus.conversationId,
      priority: slaStatus.priority,
      alertType: 'response_breach',
      message: `Response SLA breached by ${minutesOverdue} minutes`,
      minutesOverdue,
    });
  }
  
  // Response warning (20% time remaining)
  if (
    !slaStatus.responseBreached &&
    slaStatus.responseTimeRemaining !== null &&
    slaStatus.responseTimeRemaining > 0 &&
    slaStatus.responseTimeRemaining < slaStatus.responseTarget * 0.2
  ) {
    alerts.push({
      conversationId: slaStatus.conversationId,
      priority: slaStatus.priority,
      alertType: 'response_warning',
      message: `Response SLA at risk: ${slaStatus.responseTimeRemaining} minutes remaining`,
      minutesUntilBreach: slaStatus.responseTimeRemaining,
    });
  }
  
  // Resolution breach
  if (slaStatus.resolutionBreached && slaStatus.resolutionTimeMinutes !== null) {
    const minutesOverdue = slaStatus.resolutionTimeMinutes - slaStatus.resolutionTarget;
    alerts.push({
      conversationId: slaStatus.conversationId,
      priority: slaStatus.priority,
      alertType: 'resolution_breach',
      message: `Resolution SLA breached by ${minutesOverdue} minutes`,
      minutesOverdue,
    });
  }
  
  // Resolution warning (20% time remaining)
  if (
    !slaStatus.resolutionBreached &&
    slaStatus.resolutionTimeRemaining !== null &&
    slaStatus.resolutionTimeRemaining > 0 &&
    slaStatus.resolutionTimeRemaining < slaStatus.resolutionTarget * 0.2
  ) {
    alerts.push({
      conversationId: slaStatus.conversationId,
      priority: slaStatus.priority,
      alertType: 'resolution_warning',
      message: `Resolution SLA at risk: ${slaStatus.resolutionTimeRemaining} minutes remaining`,
      minutesUntilBreach: slaStatus.resolutionTimeRemaining,
    });
  }
  
  return alerts;
}

/**
 * Monitor multiple conversations
 */
export function monitorConversations(conversations: Conversation[], now: Date = new Date()) {
  const statuses = conversations.map(conv => checkSLA(conv, now));
  const allAlerts = statuses.flatMap(status => generateAlerts(status));
  
  return {
    statuses,
    alerts: allAlerts,
    summary: {
      total: conversations.length,
      onTrack: statuses.filter(s => s.status === 'on_track').length,
      atRisk: statuses.filter(s => s.status === 'at_risk').length,
      breached: statuses.filter(s => s.status === 'breached').length,
      responseBreaches: statuses.filter(s => s.responseBreached).length,
      resolutionBreaches: statuses.filter(s => s.resolutionBreached).length,
    },
  };
}

/**
 * Get SLA compliance metrics
 */
export function getSLAMetrics(conversations: Conversation[]) {
  const responded = conversations.filter(c => c.firstResponseAt);
  const resolved = conversations.filter(c => c.resolvedAt);
  
  const responseCompliance = responded.map(c => {
    const status = checkSLA(c);
    return !status.responseBreached;
  });
  
  const resolutionCompliance = resolved.map(c => {
    const status = checkSLA(c);
    return !status.resolutionBreached;
  });
  
  const avgResponseTime = responded.length > 0
    ? responded.reduce((sum, c) => {
        const minutes = getMinutesDiff(c.createdAt, c.firstResponseAt!);
        return sum + minutes;
      }, 0) / responded.length
    : 0;
  
  const avgResolutionTime = resolved.length > 0
    ? resolved.reduce((sum, c) => {
        const minutes = getMinutesDiff(c.createdAt, c.resolvedAt!);
        return sum + minutes;
      }, 0) / resolved.length
    : 0;
  
  return {
    totalConversations: conversations.length,
    responded: responded.length,
    resolved: resolved.length,
    responseComplianceRate: responseCompliance.filter(Boolean).length / Math.max(responded.length, 1),
    resolutionComplianceRate: resolutionCompliance.filter(Boolean).length / Math.max(resolved.length, 1),
    avgResponseTimeMinutes: Math.round(avgResponseTime),
    avgResolutionTimeMinutes: Math.round(avgResolutionTime),
  };
}

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing SLA Monitor\n');
  
  const now = new Date();
  
  const testConversations: Conversation[] = [
    {
      id: '1',
      priority: Priority.P0_CRITICAL,
      createdAt: new Date(now.getTime() - 10 * 60 * 1000), // 10 min ago
      status: 'open',
      channel: 'email',
    },
    {
      id: '2',
      priority: Priority.P1_HIGH,
      createdAt: new Date(now.getTime() - 30 * 60 * 1000), // 30 min ago
      firstResponseAt: new Date(now.getTime() - 25 * 60 * 1000), // Responded 5 min ago
      status: 'pending',
      channel: 'email',
    },
    {
      id: '3',
      priority: Priority.P2_NORMAL,
      createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      firstResponseAt: new Date(now.getTime() - 4 * 60 * 60 * 1000), // Responded 4 hours ago
      resolvedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // Resolved 1 hour ago
      status: 'resolved',
      channel: 'chat',
    },
    {
      id: '4',
      priority: Priority.P0_CRITICAL,
      createdAt: new Date(now.getTime() - 20 * 60 * 1000), // 20 min ago (BREACHED)
      status: 'open',
      channel: 'sms',
    },
  ];
  
  const monitoring = monitorConversations(testConversations, now);
  
  console.log('📊 SLA Status Summary:');
  console.log(`  Total: ${monitoring.summary.total}`);
  console.log(`  On Track: ${monitoring.summary.onTrack}`);
  console.log(`  At Risk: ${monitoring.summary.atRisk}`);
  console.log(`  Breached: ${monitoring.summary.breached}`);
  console.log();
  
  console.log('🚨 Alerts:');
  if (monitoring.alerts.length === 0) {
    console.log('  No alerts');
  } else {
    monitoring.alerts.forEach(alert => {
      console.log(`  [${alert.priority}] ${alert.conversationId}: ${alert.message}`);
    });
  }
  console.log();
  
  console.log('📈 Metrics:');
  const metrics = getSLAMetrics(testConversations);
  console.log(JSON.stringify(metrics, null, 2));
}

