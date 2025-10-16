/**
 * Chatwoot Webhook Handler
 * 
 * Processes incoming webhooks from Chatwoot
 * Routes to triage, SLA monitoring, and escalation services
 */

import { triageConversation, type TriageInput } from './triage';
import { checkSLA, type Conversation } from './sla-monitor';
import { evaluateEscalation, type EscalationContext } from './escalation';

export interface ChatwootWebhookPayload {
  event: 'conversation_created' | 'message_created' | 'conversation_status_changed' | 'conversation_updated';
  id: number;
  conversation: {
    id: number;
    inbox_id: number;
    status: 'open' | 'pending' | 'resolved';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    custom_attributes?: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
  message?: {
    id: number;
    content: string;
    message_type: 'incoming' | 'outgoing' | 'activity' | 'template';
    created_at: string;
    sender?: {
      id: number;
      name: string;
      email?: string;
    };
  };
  account?: {
    id: number;
    name: string;
  };
}

export interface WebhookProcessingResult {
  success: boolean;
  conversationId: string;
  actions: string[];
  triage?: {
    priority: string;
    escalateToHuman: boolean;
  };
  sla?: {
    status: string;
    breached: boolean;
  };
  escalation?: {
    shouldEscalate: boolean;
    escalateTo?: string;
  };
  error?: string;
}

/**
 * Verify webhook signature (placeholder - implement with actual secret)
 */
export function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  // TODO: Implement HMAC verification
  // const crypto = require('crypto');
  // const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  // return signature === expectedSignature;
  
  // For now, just check that signature exists
  return signature.length > 0;
}

/**
 * Process incoming webhook
 */
export async function processWebhook(payload: ChatwootWebhookPayload): Promise<WebhookProcessingResult> {
  const conversationId = `chatwoot_${payload.conversation.id}`;
  const actions: string[] = [];
  
  try {
    // Only process incoming messages
    if (payload.event !== 'message_created' || payload.message?.message_type !== 'incoming') {
      return {
        success: true,
        conversationId,
        actions: ['ignored_non_incoming_message'],
      };
    }
    
    const message = payload.message!;
    const conversation = payload.conversation;
    
    // Step 1: Triage the conversation
    const triageInput: TriageInput = {
      messageContent: message.content,
      customerEmail: message.sender?.email,
      channel: determineChannel(conversation.inbox_id),
    };
    
    const triageResult = triageConversation(triageInput);
    actions.push('triaged');
    
    // Step 2: Check SLA status
    const conversationData: Conversation = {
      id: conversationId,
      priority: mapPriority(triageResult.priority),
      createdAt: new Date(conversation.created_at),
      status: conversation.status,
      channel: determineChannel(conversation.inbox_id),
    };
    
    const slaStatus = checkSLA(conversationData);
    actions.push('sla_checked');
    
    // Step 3: Evaluate escalation
    const escalationContext: EscalationContext = {
      conversationId,
      priority: mapPriority(triageResult.priority),
      slaStatus,
      messageContent: message.content,
    };
    
    const escalationResult = evaluateEscalation(escalationContext);
    if (escalationResult.shouldEscalate) {
      actions.push('escalated');
    }
    
    // Step 4: Determine next action
    if (triageResult.escalateToHuman || escalationResult.shouldEscalate) {
      actions.push('route_to_human');
    } else {
      actions.push('generate_ai_draft');
    }
    
    return {
      success: true,
      conversationId,
      actions,
      triage: {
        priority: triageResult.priority,
        escalateToHuman: triageResult.escalateToHuman,
      },
      sla: {
        status: slaStatus.status,
        breached: slaStatus.responseBreached || slaStatus.resolutionBreached,
      },
      escalation: {
        shouldEscalate: escalationResult.shouldEscalate,
        escalateTo: escalationResult.escalateTo,
      },
    };
    
  } catch (error) {
    return {
      success: false,
      conversationId,
      actions: ['error'],
      error: (error as Error).message,
    };
  }
}

/**
 * Determine channel from inbox ID
 */
function determineChannel(inboxId: number): 'email' | 'chat' | 'sms' {
  // TODO: Map inbox IDs to channels based on Chatwoot configuration
  // For now, default to email
  if (inboxId === 1) return 'email';
  if (inboxId === 2) return 'chat';
  if (inboxId === 3) return 'sms';
  return 'email';
}

/**
 * Map triage priority to conversation priority
 */
function mapPriority(triagePriority: string): any {
  // Import Priority enum from triage
  const { Priority } = require('./triage');
  
  switch (triagePriority) {
    case 'P0':
      return Priority.P0_CRITICAL;
    case 'P1':
      return Priority.P1_HIGH;
    case 'P2':
      return Priority.P2_NORMAL;
    case 'P3':
      return Priority.P3_LOW;
    default:
      return Priority.P2_NORMAL;
  }
}

/**
 * Create webhook response
 */
export function createWebhookResponse(result: WebhookProcessingResult): {
  ok: boolean;
  processed: boolean;
  conversation_id: string;
  actions: string[];
  triage?: any;
  sla?: any;
  escalation?: any;
  error?: string;
} {
  return {
    ok: result.success,
    processed: result.success,
    conversation_id: result.conversationId,
    actions: result.actions,
    triage: result.triage,
    sla: result.sla,
    escalation: result.escalation,
    error: result.error,
  };
}

/**
 * Batch process webhooks
 */
export async function batchProcessWebhooks(
  payloads: ChatwootWebhookPayload[]
): Promise<WebhookProcessingResult[]> {
  return Promise.all(payloads.map(payload => processWebhook(payload)));
}

/**
 * Get webhook processing statistics
 */
export function getWebhookStats(results: WebhookProcessingResult[]) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  const actionCounts = results.flatMap(r => r.actions).reduce((acc, action) => {
    acc[action] = (acc[action] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const escalated = results.filter(r => r.escalation?.shouldEscalate).length;
  const aiDrafts = results.filter(r => r.actions.includes('generate_ai_draft')).length;
  
  return {
    total: results.length,
    successful,
    failed,
    successRate: (successful / results.length) * 100,
    actions: actionCounts,
    escalated,
    aiDrafts,
    escalationRate: (escalated / results.length) * 100,
  };
}

// CLI testing
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 Testing Chatwoot Webhook Handler\n');
  
  const testPayloads: ChatwootWebhookPayload[] = [
    {
      event: 'message_created',
      id: 1,
      conversation: {
        id: 101,
        inbox_id: 1,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      message: {
        id: 201,
        content: 'Where is my order?',
        message_type: 'incoming',
        created_at: new Date().toISOString(),
        sender: {
          id: 301,
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    },
    {
      event: 'message_created',
      id: 2,
      conversation: {
        id: 102,
        inbox_id: 1,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      message: {
        id: 202,
        content: 'URGENT! This is a fraud! I want to speak to a lawyer!',
        message_type: 'incoming',
        created_at: new Date().toISOString(),
        sender: {
          id: 302,
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
      },
    },
  ];
  
  batchProcessWebhooks(testPayloads).then(results => {
    results.forEach((result, idx) => {
      console.log(`Webhook ${idx + 1}:`);
      console.log(`  Success: ${result.success}`);
      console.log(`  Conversation: ${result.conversationId}`);
      console.log(`  Actions: ${result.actions.join(', ')}`);
      if (result.triage) {
        console.log(`  Priority: ${result.triage.priority}`);
        console.log(`  Escalate to Human: ${result.triage.escalateToHuman}`);
      }
      console.log();
    });
    
    console.log('📊 Statistics:');
    const stats = getWebhookStats(results);
    console.log(JSON.stringify(stats, null, 2));
  });
}

