/**
 * Conversation Context Management
 * 
 * Tracks conversation history and context for AI agents.
 * Manages message threading, user context, and conversation state.
 */

import { z } from 'zod';

/**
 * Message schema
 */
export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

export type Message = z.infer<typeof MessageSchema>;

/**
 * Conversation context schema
 */
export const ConversationContextSchema = z.object({
  conversationId: z.string(),
  customerId: z.string().optional(),
  customerEmail: z.string().optional(),
  channel: z.enum(['email', 'chat', 'sms']).optional(),
  messages: z.array(MessageSchema),
  metadata: z.object({
    orderNumbers: z.array(z.string()).optional(),
    productIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    sentiment: z.enum(['positive', 'neutral', 'negative']).optional(),
    priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  }).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ConversationContext = z.infer<typeof ConversationContextSchema>;

/**
 * In-memory conversation store (will be replaced with Supabase)
 */
const conversationStore = new Map<string, ConversationContext>();

/**
 * Get conversation context
 * 
 * @param conversationId - Conversation ID
 */
export async function getConversationContext(
  conversationId: string
): Promise<ConversationContext | null> {
  console.log('[Context] Getting conversation:', conversationId);

  // TODO: Implement Supabase query
  // const { data, error } = await supabase
  //   .from('conversations')
  //   .select('*, messages(*)')
  //   .eq('id', conversationId)
  //   .single();

  // Check in-memory store
  const context = conversationStore.get(conversationId);
  
  if (context) {
    return context;
  }

  // Mock data if not found
  return {
    conversationId,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Add message to conversation
 * 
 * @param conversationId - Conversation ID
 * @param message - Message to add
 */
export async function addMessage(
  conversationId: string,
  message: Omit<Message, 'id' | 'conversationId' | 'timestamp'>
): Promise<Message> {
  console.log('[Context] Adding message to conversation:', conversationId);

  const newMessage: Message = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    conversationId,
    timestamp: new Date().toISOString(),
    ...message,
  };

  // TODO: Implement Supabase insertion
  // await supabase.from('messages').insert(newMessage);

  // Update in-memory store
  const context = await getConversationContext(conversationId);
  if (context) {
    context.messages.push(newMessage);
    context.updatedAt = new Date().toISOString();
    conversationStore.set(conversationId, context);
  }

  return newMessage;
}

/**
 * Get conversation history
 * 
 * @param conversationId - Conversation ID
 * @param limit - Maximum number of messages to return
 */
export async function getConversationHistory(
  conversationId: string,
  limit: number = 50
): Promise<Message[]> {
  console.log('[Context] Getting conversation history:', conversationId, limit);

  const context = await getConversationContext(conversationId);
  
  if (!context) {
    return [];
  }

  // Return most recent messages up to limit
  return context.messages.slice(-limit);
}

/**
 * Update conversation metadata
 * 
 * @param conversationId - Conversation ID
 * @param metadata - Metadata to update
 */
export async function updateConversationMetadata(
  conversationId: string,
  metadata: Partial<ConversationContext['metadata']>
): Promise<void> {
  console.log('[Context] Updating conversation metadata:', conversationId, metadata);

  // TODO: Implement Supabase update
  // await supabase
  //   .from('conversations')
  //   .update({ metadata })
  //   .eq('id', conversationId);

  // Update in-memory store
  const context = await getConversationContext(conversationId);
  if (context) {
    context.metadata = { ...context.metadata, ...metadata };
    context.updatedAt = new Date().toISOString();
    conversationStore.set(conversationId, context);
  }
}

/**
 * Format conversation for AI context
 * 
 * Formats conversation history into a string suitable for AI context window
 */
export function formatConversationForAI(messages: Message[]): string {
  return messages
    .map((msg) => {
      const role = msg.role === 'user' ? 'Customer' : 'Assistant';
      return `${role}: ${msg.content}`;
    })
    .join('\n\n');
}

/**
 * Extract order numbers from conversation
 */
export function extractOrderNumbers(messages: Message[]): string[] {
  const orderNumbers = new Set<string>();
  const orderPattern = /#(\d{4,6})/g;

  messages.forEach((msg) => {
    const matches = msg.content.matchAll(orderPattern);
    for (const match of matches) {
      orderNumbers.add(match[1]);
    }
  });

  return Array.from(orderNumbers);
}

/**
 * Detect conversation sentiment
 * 
 * Simple keyword-based sentiment detection
 * In production, would use ML model
 */
export function detectSentiment(messages: Message[]): 'positive' | 'neutral' | 'negative' {
  const recentMessages = messages.slice(-5);
  const text = recentMessages.map((m) => m.content.toLowerCase()).join(' ');

  const positiveKeywords = ['thank', 'great', 'excellent', 'happy', 'love', 'perfect'];
  const negativeKeywords = ['angry', 'frustrated', 'terrible', 'awful', 'hate', 'disappointed'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach((keyword) => {
    if (text.includes(keyword)) positiveCount++;
  });

  negativeKeywords.forEach((keyword) => {
    if (text.includes(keyword)) negativeCount++;
  });

  if (negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  return 'neutral';
}

/**
 * Calculate conversation priority
 * 
 * Based on keywords, sentiment, and response time
 */
export function calculatePriority(
  messages: Message[],
  sentiment: 'positive' | 'neutral' | 'negative'
): 'low' | 'normal' | 'high' | 'urgent' {
  const text = messages.map((m) => m.content.toLowerCase()).join(' ');

  // Urgent keywords
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'emergency'];
  if (urgentKeywords.some((keyword) => text.includes(keyword))) {
    return 'urgent';
  }

  // High priority keywords
  const highPriorityKeywords = ['refund', 'cancel', 'wrong', 'broken', 'defective'];
  if (highPriorityKeywords.some((keyword) => text.includes(keyword))) {
    return 'high';
  }

  // Negative sentiment = high priority
  if (sentiment === 'negative') {
    return 'high';
  }

  // Check response time
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    const hoursSinceLastMessage =
      (Date.now() - new Date(lastMessage.timestamp).getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastMessage > 24) {
      return 'high';
    }
  }

  return 'normal';
}

/**
 * Get conversation summary
 * 
 * Generates a brief summary of the conversation
 */
export function getConversationSummary(context: ConversationContext): string {
  const messageCount = context.messages.length;
  const sentiment = context.metadata?.sentiment || 'neutral';
  const priority = context.metadata?.priority || 'normal';
  const orderNumbers = context.metadata?.orderNumbers || [];

  let summary = `Conversation with ${messageCount} message(s). `;
  summary += `Sentiment: ${sentiment}. Priority: ${priority}. `;
  
  if (orderNumbers.length > 0) {
    summary += `Related orders: ${orderNumbers.join(', ')}. `;
  }

  return summary;
}

