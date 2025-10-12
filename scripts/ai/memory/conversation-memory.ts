/**
 * Task N: Conversational Memory and Context Tracking
 */

interface Message {
  content: string;
  intent?: string;
  status?: string;
  timestamp?: Date;
}

interface ConversationContext {
  conversationId: number;
  messages: Message[];
  metadata: {
    order_numbers: string[];
    products_mentioned: string[];
    intent_history: string[];
  };
  summary: string;
}

export class ConversationMemory {
  private conversations = new Map<number, ConversationContext>();
  
  store(conversationId: number, message: Message) {
    const context = this.conversations.get(conversationId) || this.createNew(conversationId);
    context.messages.push(message);
    
    // Extract entities
    this.extractEntities(message, context.metadata);
    
    // Summarize if too long
    if (context.messages.length > 10) {
      context.summary = this.summarize(context.messages);
      context.messages = context.messages.slice(-3); // Keep last 3 only
    }
    
    this.conversations.set(conversationId, context);
  }
  
  retrieve(conversationId: number): ConversationContext {
    return this.conversations.get(conversationId) || this.createNew(conversationId);
  }
  
  private extractEntities(message: Message, metadata: any) {
    // Extract order numbers, product names, dates
    const orderMatches = message.content.match(/#?\d{5,}/g);
    if (orderMatches) metadata.order_numbers.push(...orderMatches);
    
    // Add more entity extraction as needed
  }
  
  private summarize(messages: Message[]): string {
    // Compress conversation history
    return `Customer inquired about ${messages[0].intent}. ${messages.length} messages exchanged. Current status: ${messages[messages.length-1].status}`;
  }
  
  private createNew(id: number): ConversationContext {
    return {
      conversationId: id,
      messages: [],
      metadata: { order_numbers: [], products_mentioned: [], intent_history: [] },
      summary: '',
    };
  }
}

