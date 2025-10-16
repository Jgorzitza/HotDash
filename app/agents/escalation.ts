/**
 * Auto-Escalation Rules
 * 
 * Automatically escalates conversations based on:
 * - Keywords (refund, legal, complaint)
 * - Sentiment (negative, angry)
 * - Response time (SLA violations)
 * - Customer value (VIP, high LTV)
 */

import { z } from 'zod';
import type { ConversationContext } from './context/index';

/**
 * Escalation reason schema
 */
export const EscalationReasonSchema = z.enum([
  'negative_sentiment',
  'urgent_keywords',
  'legal_threat',
  'refund_request',
  'sla_violation',
  'vip_customer',
  'multiple_issues',
  'complex_issue',
  'manual_request',
]);

export type EscalationReason = z.infer<typeof EscalationReasonSchema>;

/**
 * Escalation result schema
 */
export const EscalationResultSchema = z.object({
  shouldEscalate: z.boolean(),
  reasons: z.array(EscalationReasonSchema),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  assignTo: z.string().optional(),
  notes: z.string().optional(),
});

export type EscalationResult = z.infer<typeof EscalationResultSchema>;

/**
 * Escalation rules configuration
 */
const ESCALATION_RULES = {
  // Keywords that trigger immediate escalation
  urgentKeywords: [
    'lawyer',
    'attorney',
    'legal action',
    'sue',
    'lawsuit',
    'bbb',
    'better business bureau',
    'ftc',
    'consumer protection',
  ],

  // Keywords that trigger high-priority escalation
  highPriorityKeywords: [
    'refund',
    'cancel order',
    'wrong item',
    'damaged',
    'defective',
    'broken',
    'never received',
    'missing',
  ],

  // Sentiment thresholds
  sentimentThreshold: {
    escalateOnNegative: true,
    consecutiveNegativeMessages: 2,
  },

  // SLA thresholds (in hours)
  slaThresholds: {
    firstResponse: 2, // Escalate if no response within 2 hours
    followUp: 24, // Escalate if no follow-up within 24 hours
  },

  // VIP customer indicators
  vipIndicators: {
    lifetimeValue: 1000, // $1000+ LTV
    orderCount: 10, // 10+ orders
  },
};

/**
 * Check if conversation should be escalated
 * 
 * @param context - Conversation context
 * @param customerData - Customer data (optional)
 */
export function checkEscalation(
  context: ConversationContext,
  customerData?: {
    lifetimeValue?: number;
    orderCount?: number;
    isVIP?: boolean;
  }
): EscalationResult {
  const reasons: EscalationReason[] = [];
  let priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal';

  // Check for urgent keywords (legal threats)
  if (hasUrgentKeywords(context)) {
    reasons.push('legal_threat');
    priority = 'urgent';
  }

  // Check for high-priority keywords
  if (hasHighPriorityKeywords(context)) {
    if (hasRefundKeywords(context)) {
      reasons.push('refund_request');
    }
    priority = priority === 'urgent' ? 'urgent' : 'high';
  }

  // Check sentiment
  const sentiment = context.metadata?.sentiment;
  if (sentiment === 'negative') {
    reasons.push('negative_sentiment');
    priority = priority === 'urgent' ? 'urgent' : 'high';
  }

  // Check SLA violations
  if (hasSLAViolation(context)) {
    reasons.push('sla_violation');
    priority = priority === 'urgent' ? 'urgent' : 'high';
  }

  // Check VIP customer
  if (customerData && isVIPCustomer(customerData)) {
    reasons.push('vip_customer');
    priority = priority === 'normal' ? 'high' : priority;
  }

  // Check for multiple issues
  if (hasMultipleIssues(context)) {
    reasons.push('multiple_issues');
    priority = priority === 'normal' ? 'high' : priority;
  }

  const shouldEscalate = reasons.length > 0;

  return {
    shouldEscalate,
    reasons,
    priority,
    assignTo: shouldEscalate ? determineAssignee(reasons) : undefined,
    notes: shouldEscalate ? generateEscalationNotes(reasons, context) : undefined,
  };
}

/**
 * Check for urgent keywords (legal threats)
 */
function hasUrgentKeywords(context: ConversationContext): boolean {
  const text = context.messages
    .map((m) => m.content.toLowerCase())
    .join(' ');

  return ESCALATION_RULES.urgentKeywords.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );
}

/**
 * Check for high-priority keywords
 */
function hasHighPriorityKeywords(context: ConversationContext): boolean {
  const text = context.messages
    .map((m) => m.content.toLowerCase())
    .join(' ');

  return ESCALATION_RULES.highPriorityKeywords.some((keyword) =>
    text.includes(keyword.toLowerCase())
  );
}

/**
 * Check for refund keywords
 */
function hasRefundKeywords(context: ConversationContext): boolean {
  const text = context.messages
    .map((m) => m.content.toLowerCase())
    .join(' ');

  return text.includes('refund') || text.includes('money back');
}

/**
 * Check for SLA violations
 */
function hasSLAViolation(context: ConversationContext): boolean {
  if (context.messages.length === 0) return false;

  const now = Date.now();
  const lastMessage = context.messages[context.messages.length - 1];
  const lastMessageTime = new Date(lastMessage.timestamp).getTime();
  const hoursSinceLastMessage = (now - lastMessageTime) / (1000 * 60 * 60);

  // Check if customer's last message was unanswered for too long
  if (lastMessage.role === 'user') {
    return hoursSinceLastMessage > ESCALATION_RULES.slaThresholds.firstResponse;
  }

  // Check if follow-up is overdue
  const customerMessages = context.messages.filter((m) => m.role === 'user');
  if (customerMessages.length > 0) {
    const lastCustomerMessage = customerMessages[customerMessages.length - 1];
    const lastCustomerMessageTime = new Date(lastCustomerMessage.timestamp).getTime();
    const hoursSinceCustomerMessage = (now - lastCustomerMessageTime) / (1000 * 60 * 60);
    
    return hoursSinceCustomerMessage > ESCALATION_RULES.slaThresholds.followUp;
  }

  return false;
}

/**
 * Check if customer is VIP
 */
function isVIPCustomer(customerData: {
  lifetimeValue?: number;
  orderCount?: number;
  isVIP?: boolean;
}): boolean {
  if (customerData.isVIP) return true;

  const { lifetimeValue = 0, orderCount = 0 } = customerData;

  return (
    lifetimeValue >= ESCALATION_RULES.vipIndicators.lifetimeValue ||
    orderCount >= ESCALATION_RULES.vipIndicators.orderCount
  );
}

/**
 * Check for multiple issues in conversation
 */
function hasMultipleIssues(context: ConversationContext): boolean {
  const issues = new Set<string>();
  const text = context.messages.map((m) => m.content.toLowerCase()).join(' ');

  const issueKeywords = {
    shipping: ['shipping', 'delivery', 'tracking'],
    product: ['wrong item', 'defective', 'broken', 'damaged'],
    refund: ['refund', 'money back'],
    order: ['order', 'cancel'],
  };

  Object.entries(issueKeywords).forEach(([issue, keywords]) => {
    if (keywords.some((keyword) => text.includes(keyword))) {
      issues.add(issue);
    }
  });

  return issues.size >= 2;
}

/**
 * Determine who to assign escalated conversation to
 */
function determineAssignee(reasons: EscalationReason[]): string {
  // Legal threats go to manager
  if (reasons.includes('legal_threat')) {
    return 'manager';
  }

  // VIP customers go to senior support
  if (reasons.includes('vip_customer')) {
    return 'senior_support';
  }

  // Refunds go to support lead
  if (reasons.includes('refund_request')) {
    return 'support_lead';
  }

  // Default to support team
  return 'support_team';
}

/**
 * Generate escalation notes
 */
function generateEscalationNotes(
  reasons: EscalationReason[],
  context: ConversationContext
): string {
  const notes: string[] = [];

  notes.push(`Escalation triggered: ${reasons.join(', ')}`);

  if (context.metadata?.orderNumbers && context.metadata.orderNumbers.length > 0) {
    notes.push(`Related orders: ${context.metadata.orderNumbers.join(', ')}`);
  }

  if (context.metadata?.sentiment) {
    notes.push(`Sentiment: ${context.metadata.sentiment}`);
  }

  const messageCount = context.messages.length;
  notes.push(`Message count: ${messageCount}`);

  return notes.join('. ');
}

/**
 * Escalate conversation
 * 
 * @param conversationId - Conversation ID
 * @param result - Escalation result
 */
export async function escalateConversation(
  conversationId: string,
  result: EscalationResult
): Promise<void> {
  console.log('[Escalation] Escalating conversation:', conversationId, result);

  // TODO: Implement actual escalation logic
  // - Update conversation status in Supabase
  // - Assign to appropriate team member
  // - Send notification
  // - Create escalation record

  // await supabase.from('conversations').update({
  //   status: 'escalated',
  //   priority: result.priority,
  //   assigned_to: result.assignTo,
  //   escalation_reasons: result.reasons,
  //   escalation_notes: result.notes,
  //   escalated_at: new Date().toISOString(),
  // }).eq('id', conversationId);

  // Send notification
  // await sendEscalationNotification(conversationId, result);
}

/**
 * Get escalation statistics
 */
export async function getEscalationStats(days: number = 30): Promise<{
  total: number;
  byReason: Record<EscalationReason, number>;
  byPriority: Record<string, number>;
}> {
  console.log('[Escalation] Getting escalation stats for last', days, 'days');

  // TODO: Implement Supabase query
  // Mock data
  return {
    total: 45,
    byReason: {
      negative_sentiment: 15,
      urgent_keywords: 5,
      legal_threat: 2,
      refund_request: 12,
      sla_violation: 8,
      vip_customer: 3,
      multiple_issues: 0,
      complex_issue: 0,
      manual_request: 0,
    },
    byPriority: {
      urgent: 7,
      high: 23,
      normal: 15,
      low: 0,
    },
  };
}

