/**
 * Shared Mock Data and Utilities for Agent SDK Tests
 * 
 * This file provides reusable mock data generators for:
 * - Chatwoot webhook payloads
 * - Agent SDK draft responses
 * - Approval queue items
 * - Knowledge sources
 * - Mock service clients
 * 
 * Test Strategy: docs/testing/agent-sdk/test-strategy.md
 */

import { vi, expect } from 'vitest';

/**
 * Type Definitions
 * TODO: Import from actual types once implemented
 */

export interface ChatwootWebhook {
  event: string;
  id: number;
  message_type: string;
  content: string;
  created_at: string;
  inbox: {
    id: number;
    name: string;
  };
  conversation: {
    id: number;
    status: string;
    messages: any[];
  };
  sender: {
    id: number;
    name: string;
    email: string;
    type: string;
  };
  account: {
    id: number;
    name: string;
  };
}

export interface AgentSDKDraft {
  draft_response: string;
  confidence_score: number;
  recommended_action: 'approve' | 'edit' | 'escalate' | 'reject';
  sources: KnowledgeSource[];
  suggested_tags: string[];
  sentiment: {
    customer_sentiment: string;
    urgency: string;
  };
}

export interface KnowledgeSource {
  title: string;
  version: string;
  relevance: number;
  content: string;
}

export interface QueueItem {
  id: string;
  conversation_id: number;
  customer_name: string;
  customer_email: string;
  customer_message: string;
  draft_response: string;
  confidence_score: number;
  knowledge_sources: any[];
  recommended_action: string;
  priority: string;
  status: string;
  created_at: string;
  sentiment?: {
    customer_sentiment: string;
    urgency: string;
  };
}

/**
 * Mock Data Generators
 */

export function mockChatwootMessageCreated(overrides: Partial<ChatwootWebhook> = {}): ChatwootWebhook {
  return {
    event: 'message_created',
    id: Math.floor(Math.random() * 100000),
    message_type: 'incoming',
    content: 'What is your return policy?',
    created_at: new Date().toISOString(),
    inbox: {
      id: 1,
      name: 'Support Inbox'
    },
    conversation: {
      id: Math.floor(Math.random() * 1000),
      status: 'open',
      messages: [],
      ...overrides.conversation
    },
    sender: {
      id: 123,
      name: 'John Doe',
      email: 'john@example.com',
      type: 'contact',
      ...overrides.sender
    },
    account: {
      id: 1,
      name: 'HotDash'
    },
    ...overrides
  } as ChatwootWebhook;
}

export function mockAgentSDKDraft(overrides: Partial<AgentSDKDraft> = {}): AgentSDKDraft {
  return {
    draft_response: 'Our return policy allows returns within 30 days of purchase...',
    confidence_score: 85,
    recommended_action: 'approve',
    sources: [
      mockKnowledgeSource({
        title: 'Return Policy',
        version: 'v2.1',
        relevance: 0.92
      })
    ],
    suggested_tags: ['return_policy', 'customer_inquiry'],
    sentiment: {
      customer_sentiment: 'neutral',
      urgency: 'medium'
    },
    ...overrides
  };
}

export function mockKnowledgeSource(overrides: Partial<KnowledgeSource> = {}): KnowledgeSource {
  return {
    title: 'Sample Policy Document',
    version: 'v1.0',
    relevance: 0.85,
    content: 'This is sample knowledge content...',
    ...overrides
  };
}

export function mockQueueData(overrides: Partial<QueueItem> = {}): QueueItem {
  return {
    id: `queue-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    conversation_id: Math.floor(Math.random() * 10000),
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_message: 'Test customer message',
    draft_response: 'Test draft response',
    confidence_score: 80,
    knowledge_sources: [],
    recommended_action: 'approve',
    priority: 'normal',
    status: 'pending',
    created_at: new Date().toISOString(),
    ...overrides
  };
}

/**
 * Mock Service Clients
 */

export function mockLlamaIndexService() {
  return {
    query: vi.fn().mockResolvedValue({
      sources: [mockKnowledgeSource()],
      relevance: 0.9,
      processingTime: 350
    }),
    health: vi.fn().mockResolvedValue({ status: 'healthy' })
  };
}

export function mockAgentSDKService() {
  return {
    generateDraft: vi.fn().mockResolvedValue(mockAgentSDKDraft()),
    health: vi.fn().mockResolvedValue({ status: 'healthy' })
  };
}

export function mockChatwootClient() {
  return {
    sendReply: vi.fn().mockResolvedValue({ id: 123, sent: true }),
    createPrivateNote: vi.fn().mockResolvedValue({ id: 456, created: true }),
    assignAgent: vi.fn().mockResolvedValue({ success: true }),
    addLabel: vi.fn().mockResolvedValue({ success: true }),
    getConversationDetails: vi.fn().mockResolvedValue({
      id: 123,
      status: 'open',
      messages: []
    })
  };
}

/**
 * Mock Service Error Simulators
 */

export function mockLlamaIndexDelay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function mockLlamaIndexOffline() {
  return {
    query: vi.fn().mockRejectedValue(new Error('Service unavailable'))
  };
}

export function mockAgentSDKDelay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function mockAgentSDKError(error: { status: number; message: string }) {
  return {
    generateDraft: vi.fn().mockRejectedValue({
      status: error.status,
      message: error.message
    })
  };
}

export function mockChatwootAPIError(status: number) {
  return {
    sendReply: vi.fn().mockRejectedValue({
      status,
      message: `Chatwoot API error: ${status}`
    })
  };
}

/**
 * Database Seed Helpers
 */

import { createClient } from '@supabase/supabase-js';

// Create test Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || 'test-key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function seedApprovalQueue(items: Partial<QueueItem>[]): Promise<QueueItem[]> {
  const { data, error } = await supabase
    .from('agent_sdk_approval_queue')
    .insert(items.map(item => ({
      ...mockQueueData(),
      ...item
    })))
    .select();
  
  if (error) throw error;
  return data as QueueItem[];
}

export async function clearApprovalQueue(): Promise<void> {
  await supabase
    .from('agent_sdk_approval_queue')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
}

export async function clearLearningData(): Promise<void> {
  await supabase
    .from('agent_sdk_learning_data')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
}

export async function clearNotifications(): Promise<void> {
  await supabase
    .from('agent_sdk_notifications')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
}

/**
 * Assertion Helpers
 */

export async function waitForQueueStatus(
  id: string,
  status: string,
  timeout = 5000
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const { data } = await supabase
      .from('agent_sdk_approval_queue')
      .select('status')
      .eq('id', id)
      .single();
    
    if (data?.status === status) return true;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error(`Timeout waiting for status ${status}`);
}

export function expectChatwootReply(
  mockClient: ReturnType<typeof mockChatwootClient>,
  conversationId: number,
  content: string
) {
  expect(mockClient.sendReply).toHaveBeenCalledWith(
    conversationId,
    expect.stringContaining(content)
  );
}

export function expectQueueEntry(
  entry: any,
  expected: Partial<QueueItem>
) {
  expect(entry).toMatchObject(expected);
  expect(entry.id).toBeDefined();
  expect(entry.created_at).toBeDefined();
}

/**
 * HMAC Signature Utilities
 */

import * as crypto from 'crypto';

export function generateHmacSignature(payload: any, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(JSON.stringify(payload));
  return hmac.digest('hex');
}

export function validSignature(payload: any, secret = 'test-webhook-secret'): string {
  return generateHmacSignature(payload, secret);
}

/**
 * Realtime Subscription Helpers
 */

export function subscribeToApprovalQueue(callback: (payload: any) => void) {
  return supabase
    .channel('test-approval-queue')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'agent_sdk_approval_queue',
        filter: 'status=eq.pending'
      },
      callback
    )
    .subscribe();
}

export function unsubscribeFromApprovalQueue(channel: any) {
  return supabase.removeChannel(channel);
}

/**
 * Test Data Scenarios
 */

export const TEST_SCENARIOS = {
  highConfidence: () => mockQueueData({
    confidence_score: 92,
    recommended_action: 'approve',
    sentiment: { customer_sentiment: 'neutral', urgency: 'medium' }
  }),
  
  lowConfidence: () => mockQueueData({
    confidence_score: 45,
    recommended_action: 'escalate',
    sentiment: { customer_sentiment: 'frustrated', urgency: 'high' }
  }),
  
  urgentCase: () => mockQueueData({
    priority: 'urgent',
    confidence_score: 55,
    sentiment: { customer_sentiment: 'angry', urgency: 'high' }
  }),
  
  refundRequest: () => mockChatwootMessageCreated({
    content: "I want a refund for my order #12345!",
    sender: { id: 201, name: 'Angry Customer', email: 'angry@example.com', type: 'contact' }
  }),
  
  shippingInquiry: () => mockChatwootMessageCreated({
    content: "Where is my package? It's been 2 weeks!",
    sender: { id: 202, name: 'Worried Customer', email: 'worried@example.com', type: 'contact' }
  }),
  
  policyQuestion: () => mockChatwootMessageCreated({
    content: "What's your return policy?",
    sender: { id: 203, name: 'New Customer', email: 'newcustomer@example.com', type: 'contact' }
  })
};

