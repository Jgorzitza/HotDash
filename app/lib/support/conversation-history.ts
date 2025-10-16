/**
 * Conversation History Tracking
 * Backlog Task 1
 */

export interface ConversationMessage {
  id: string;
  conversationId: string;
  content: string;
  sender: 'customer' | 'agent' | 'system';
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationHistory {
  conversationId: string;
  messages: ConversationMessage[];
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  customerEmail?: string;
}

export function trackConversation(conversationId: string, messages: ConversationMessage[]): ConversationHistory {
  const sorted = messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  return {
    conversationId,
    messages: sorted,
    startedAt: sorted[0]?.timestamp || new Date(),
    lastMessageAt: sorted[sorted.length - 1]?.timestamp || new Date(),
    messageCount: messages.length,
    customerEmail: messages.find(m => m.sender === 'customer')?.metadata?.email,
  };
}

export function getConversationSummary(history: ConversationHistory): string {
  const customerMessages = history.messages.filter(m => m.sender === 'customer');
  const agentMessages = history.messages.filter(m => m.sender === 'agent');
  
  return `Conversation ${history.conversationId}: ${customerMessages.length} customer messages, ${agentMessages.length} agent responses`;
}

