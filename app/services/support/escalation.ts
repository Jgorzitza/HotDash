/**
 * Escalation Workflow Service
 * 
 * Auto-escalates conversations based on rules from triage and SLA monitoring
 */

import { Priority } from './triage';
import { SLAStatus } from './sla-monitor';

export interface EscalationRule {
  id: string;
  name: string;
  condition: (context: EscalationContext) => boolean;
  escalateTo: 'senior_support' | 'manager' | 'specialist';
  priority: 'immediate' | 'urgent' | 'normal';
  notificationChannels: ('email' | 'sms' | 'slack')[];
}

export interface EscalationContext {
  conversationId: string;
  priority: Priority;
  slaStatus?: SLAStatus;
  customerHistory?: {
    previousEscalations: number;
    unresolvedIssues: number;
    lifetimeValue: number;
  };
  messageContent?: string;
  attemptedResolutions?: number;
}

export interface EscalationResult {
  shouldEscalate: boolean;
  escalateTo?: string;
  reason: string;
  triggeredRules: string[];
  notificationChannels: string[];
  urgency: 'immediate' | 'urgent' | 'normal';
}

/**
 * Default escalation rules
 */
export const DEFAULT_ESCALATION_RULES: EscalationRule[] = [
  {
    id: 'critical_priority',
    name: 'Critical Priority Conversations',
    condition: (ctx) => ctx.priority === Priority.P0_CRITICAL,
    escalateTo: 'manager',
    priority: 'immediate',
    notificationChannels: ['email', 'sms', 'slack'],
  },
  {
    id: 'sla_breach',
    name: 'SLA Breach',
    condition: (ctx) => ctx.slaStatus?.responseBreached || ctx.slaStatus?.resolutionBreached || false,
    escalateTo: 'senior_support',
    priority: 'urgent',
    notificationChannels: ['email', 'slack'],
  },
  {
    id: 'multiple_unresolved',
    name: 'Multiple Unresolved Issues',
    condition: (ctx) => (ctx.customerHistory?.unresolvedIssues || 0) > 2,
    escalateTo: 'manager',
    priority: 'urgent',
    notificationChannels: ['email', 'slack'],
  },
  {
    id: 'high_value_customer',
    name: 'High Value Customer',
    condition: (ctx) => (ctx.customerHistory?.lifetimeValue || 0) > 5000,
    escalateTo: 'senior_support',
    priority: 'urgent',
    notificationChannels: ['email'],
  },
  {
    id: 'repeated_escalations',
    name: 'Repeated Escalations',
    condition: (ctx) => (ctx.customerHistory?.previousEscalations || 0) > 3,
    escalateTo: 'manager',
    priority: 'urgent',
    notificationChannels: ['email', 'slack'],
  },
  {
    id: 'failed_resolutions',
    name: 'Multiple Failed Resolution Attempts',
    condition: (ctx) => (ctx.attemptedResolutions || 0) > 2,
    escalateTo: 'specialist',
    priority: 'normal',
    notificationChannels: ['email'],
  },
];

/**
 * Evaluate escalation rules
 */
export function evaluateEscalation(
  context: EscalationContext,
  rules: EscalationRule[] = DEFAULT_ESCALATION_RULES
): EscalationResult {
  const triggeredRules: EscalationRule[] = [];
  
  for (const rule of rules) {
    if (rule.condition(context)) {
      triggeredRules.push(rule);
    }
  }
  
  if (triggeredRules.length === 0) {
    return {
      shouldEscalate: false,
      reason: 'No escalation rules triggered',
      triggeredRules: [],
      notificationChannels: [],
      urgency: 'normal',
    };
  }
  
  // Find highest priority rule
  const priorityOrder = { immediate: 3, urgent: 2, normal: 1 };
  const highestPriorityRule = triggeredRules.reduce((highest, rule) => {
    return priorityOrder[rule.priority] > priorityOrder[highest.priority] ? rule : highest;
  });
  
  // Collect all notification channels
  const allChannels = new Set<string>();
  triggeredRules.forEach(rule => {
    rule.notificationChannels.forEach(channel => allChannels.add(channel));
  });
  
  return {
    shouldEscalate: true,
    escalateTo: highestPriorityRule.escalateTo,
    reason: triggeredRules.map(r => r.name).join(', '),
    triggeredRules: triggeredRules.map(r => r.id),
    notificationChannels: Array.from(allChannels),
    urgency: highestPriorityRule.priority,
  };
}

/**
 * Create escalation notification
 */
export function createEscalationNotification(
  context: EscalationContext,
  result: EscalationResult
): {
  subject: string;
  body: string;
  recipients: string[];
} {
  const subject = `[${result.urgency.toUpperCase()}] Escalation Required: Conversation ${context.conversationId}`;
  
  const body = `
Escalation Required

Conversation ID: ${context.conversationId}
Priority: ${context.priority}
Escalate To: ${result.escalateTo}
Urgency: ${result.urgency}

Reason: ${result.reason}

Triggered Rules:
${result.triggeredRules.map(r => `- ${r}`).join('\n')}

${context.slaStatus ? `
SLA Status:
- Response Breached: ${context.slaStatus.responseBreached ? 'YES' : 'NO'}
- Resolution Breached: ${context.slaStatus.resolutionBreached ? 'YES' : 'NO'}
- Time Remaining: ${context.slaStatus.resolutionTimeRemaining} minutes
` : ''}

${context.customerHistory ? `
Customer History:
- Previous Escalations: ${context.customerHistory.previousEscalations}
- Unresolved Issues: ${context.customerHistory.unresolvedIssues}
- Lifetime Value: $${context.customerHistory.lifetimeValue}
` : ''}

Action Required: Please review and respond to this conversation immediately.
  `.trim();
  
  // Determine recipients based on escalation target
  const recipients: string[] = [];
  switch (result.escalateTo) {
    case 'manager':
      recipients.push('manager@hotrodan.com');
      break;
    case 'senior_support':
      recipients.push('senior-support@hotrodan.com');
      break;
    case 'specialist':
      recipients.push('specialist@hotrodan.com');
      break;
  }
  
  return { subject, body, recipients };
}

/**
 * Batch evaluate escalations
 */
export function batchEvaluateEscalations(
  contexts: EscalationContext[],
  rules?: EscalationRule[]
): Array<{ context: EscalationContext; result: EscalationResult }> {
  return contexts.map(context => ({
    context,
    result: evaluateEscalation(context, rules),
  }));
}

/**
 * Get escalation statistics
 */
export function getEscalationStats(results: EscalationResult[]) {
  const escalated = results.filter(r => r.shouldEscalate);
  
  const urgencyCounts = escalated.reduce((acc, r) => {
    acc[r.urgency] = (acc[r.urgency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const targetCounts = escalated.reduce((acc, r) => {
    if (r.escalateTo) {
      acc[r.escalateTo] = (acc[r.escalateTo] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: results.length,
    escalated: escalated.length,
    escalationRate: (escalated.length / results.length) * 100,
    byUrgency: urgencyCounts,
    byTarget: targetCounts,
  };
}

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Escalation Workflow\n');
  
  const testContexts: EscalationContext[] = [
    {
      conversationId: 'conv1',
      priority: Priority.P0_CRITICAL,
    },
    {
      conversationId: 'conv2',
      priority: Priority.P1_HIGH,
      slaStatus: {
        conversationId: 'conv2',
        priority: Priority.P1_HIGH,
        responseTimeMinutes: 70,
        resolutionTimeMinutes: null,
        responseTarget: 60,
        resolutionTarget: 480,
        responseBreached: true,
        resolutionBreached: false,
        responseTimeRemaining: null,
        resolutionTimeRemaining: 400,
        status: 'breached',
      },
    },
    {
      conversationId: 'conv3',
      priority: Priority.P2_NORMAL,
      customerHistory: {
        previousEscalations: 0,
        unresolvedIssues: 1,
        lifetimeValue: 1200,
      },
    },
    {
      conversationId: 'conv4',
      priority: Priority.P1_HIGH,
      customerHistory: {
        previousEscalations: 4,
        unresolvedIssues: 3,
        lifetimeValue: 8000,
      },
    },
  ];
  
  const evaluations = batchEvaluateEscalations(testContexts);
  
  evaluations.forEach(({ context, result }) => {
    console.log(`Conversation ${context.conversationId}:`);
    console.log(`  Should Escalate: ${result.shouldEscalate ? 'YES' : 'NO'}`);
    if (result.shouldEscalate) {
      console.log(`  Escalate To: ${result.escalateTo}`);
      console.log(`  Urgency: ${result.urgency}`);
      console.log(`  Reason: ${result.reason}`);
      console.log(`  Channels: ${result.notificationChannels.join(', ')}`);
    }
    console.log();
  });
  
  console.log('📊 Statistics:');
  const stats = getEscalationStats(evaluations.map(e => e.result));
  console.log(JSON.stringify(stats, null, 2));
}

