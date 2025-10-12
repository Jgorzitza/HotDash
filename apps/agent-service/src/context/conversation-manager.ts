/**
 * Conversation Context Manager
 * 
 * Manages conversation history, context, and state for agent interactions.
 * Maintains customer information, conversation metadata, and recent messages.
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface CustomerContext {
  email?: string;
  name?: string;
  orderId?: string;
  orderHistory?: any[];
  preferences?: Record<string, any>;
  tags?: string[];
}

export interface ConversationContext {
  conversationId: number;
  messages: Message[];
  customer: CustomerContext;
  intent?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  urgency?: 'low' | 'medium' | 'high';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Manages conversation context for agent operations
 */
export class ConversationManager {
  private contexts = new Map<number, ConversationContext>();

  /**
   * Get or create conversation context
   */
  getContext(conversationId: number): ConversationContext {
    let context = this.contexts.get(conversationId);
    
    if (!context) {
      context = {
        conversationId,
        messages: [],
        customer: {},
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.contexts.set(conversationId, context);
    }

    return context;
  }

  /**
   * Add message to conversation
   */
  addMessage(conversationId: number, message: Omit<Message, 'id' | 'timestamp'>): Message {
    const context = this.getContext(conversationId);
    
    const newMessage: Message = {
      ...message,
      id: `${conversationId}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: new Date(),
    };

    context.messages.push(newMessage);
    context.updatedAt = new Date();

    // Keep only last 50 messages to prevent memory growth
    if (context.messages.length > 50) {
      context.messages = context.messages.slice(-50);
    }

    return newMessage;
  }

  /**
   * Update customer context
   */
  updateCustomer(conversationId: number, customer: Partial<CustomerContext>): void {
    const context = this.getContext(conversationId);
    context.customer = {
      ...context.customer,
      ...customer,
    };
    context.updatedAt = new Date();
  }

  /**
   * Set conversation intent
   */
  setIntent(conversationId: number, intent: string): void {
    const context = this.getContext(conversationId);
    context.intent = intent;
    context.updatedAt = new Date();
  }

  /**
   * Set conversation sentiment
   */
  setSentiment(conversationId: number, sentiment: 'positive' | 'neutral' | 'negative'): void {
    const context = this.getContext(conversationId);
    context.sentiment = sentiment;
    context.updatedAt = new Date();
  }

  /**
   * Set conversation urgency
   */
  setUrgency(conversationId: number, urgency: 'low' | 'medium' | 'high'): void {
    const context = this.getContext(conversationId);
    context.urgency = urgency;
    context.updatedAt = new Date();
  }

  /**
   * Add metadata to conversation
   */
  addMetadata(conversationId: number, key: string, value: any): void {
    const context = this.getContext(conversationId);
    context.metadata[key] = value;
    context.updatedAt = new Date();
  }

  /**
   * Get recent messages for context
   */
  getRecentMessages(conversationId: number, count: number = 10): Message[] {
    const context = this.contexts.get(conversationId);
    if (!context) return [];
    
    return context.messages.slice(-count);
  }

  /**
   * Get conversation summary for agent context
   */
  getSummary(conversationId: number): string {
    const context = this.contexts.get(conversationId);
    if (!context) return 'No conversation history';

    const parts: string[] = [];

    if (context.customer.name) {
      parts.push(`Customer: ${context.customer.name}`);
    }
    if (context.customer.email) {
      parts.push(`Email: ${context.customer.email}`);
    }
    if (context.intent) {
      parts.push(`Intent: ${context.intent}`);
    }
    if (context.sentiment) {
      parts.push(`Sentiment: ${context.sentiment}`);
    }
    if (context.urgency) {
      parts.push(`Urgency: ${context.urgency}`);
    }

    const messageCount = context.messages.length;
    if (messageCount > 0) {
      parts.push(`Messages: ${messageCount}`);
    }

    return parts.join(' | ');
  }

  /**
   * Clear old conversations to prevent memory leaks
   */
  cleanup(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let removed = 0;

    for (const [conversationId, context] of this.contexts.entries()) {
      if (now - context.updatedAt.getTime() > maxAgeMs) {
        this.contexts.delete(conversationId);
        removed++;
      }
    }

    return removed;
  }

  /**
   * Get all active conversation IDs
   */
  getActiveConversations(): number[] {
    return Array.from(this.contexts.keys());
  }
}

// Export singleton instance
export const conversationManager = new ConversationManager();

// Run cleanup every hour
setInterval(() => {
  const removed = conversationManager.cleanup();
  if (removed > 0) {
    console.log(`[ConversationManager] Cleaned up ${removed} old conversations`);
  }
}, 60 * 60 * 1000);

