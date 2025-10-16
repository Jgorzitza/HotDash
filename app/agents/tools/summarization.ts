/**
 * Thread Summarization
 * 
 * Generates concise summaries of conversation threads.
 * Backlog task #8: Summarization of threads
 */

import type { Message } from '../context/index';

/**
 * Summarize conversation thread
 * 
 * @param messages - Conversation messages
 * @param maxLength - Maximum summary length in words
 */
export function summarizeThread(messages: Message[], maxLength: number = 50): string {
  if (messages.length === 0) {
    return 'No messages in conversation.';
  }

  // Extract key information
  const customerMessages = messages.filter(m => m.role === 'user');
  const assistantMessages = messages.filter(m => m.role === 'assistant');

  // Identify main topics
  const topics = extractTopics(messages);
  
  // Identify sentiment
  const sentiment = detectOverallSentiment(messages);
  
  // Build summary
  let summary = `${customerMessages.length} customer message(s), ${assistantMessages.length} response(s). `;
  
  if (topics.length > 0) {
    summary += `Topics: ${topics.join(', ')}. `;
  }
  
  summary += `Sentiment: ${sentiment}.`;
  
  // Truncate if needed
  const words = summary.split(' ');
  if (words.length > maxLength) {
    summary = words.slice(0, maxLength).join(' ') + '...';
  }
  
  return summary;
}

/**
 * Extract main topics from conversation
 */
function extractTopics(messages: Message[]): string[] {
  const topics = new Set<string>();
  const text = messages.map(m => m.content.toLowerCase()).join(' ');

  const topicKeywords = {
    'order status': ['order', 'tracking', 'shipped', 'delivery'],
    'returns': ['return', 'refund', 'exchange'],
    'product issue': ['wrong', 'defective', 'broken', 'damaged'],
    'shipping': ['shipping', 'delivery', 'carrier'],
    'payment': ['payment', 'charge', 'credit card'],
    'account': ['account', 'login', 'password'],
  };

  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => text.includes(keyword))) {
      topics.add(topic);
    }
  });

  return Array.from(topics);
}

/**
 * Detect overall sentiment of conversation
 */
function detectOverallSentiment(messages: Message[]): 'positive' | 'neutral' | 'negative' {
  const text = messages.map(m => m.content.toLowerCase()).join(' ');

  const positiveKeywords = ['thank', 'great', 'excellent', 'happy', 'love', 'perfect', 'appreciate'];
  const negativeKeywords = ['angry', 'frustrated', 'terrible', 'awful', 'hate', 'disappointed', 'unacceptable'];

  let positiveCount = 0;
  let negativeCount = 0;

  positiveKeywords.forEach(keyword => {
    const matches = text.match(new RegExp(keyword, 'g'));
    if (matches) positiveCount += matches.length;
  });

  negativeKeywords.forEach(keyword => {
    const matches = text.match(new RegExp(keyword, 'g'));
    if (matches) negativeCount += matches.length;
  });

  if (negativeCount > positiveCount) return 'negative';
  if (positiveCount > negativeCount) return 'positive';
  return 'neutral';
}

/**
 * Generate detailed summary with key points
 */
export function generateDetailedSummary(messages: Message[]): {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  sentiment: string;
} {
  const topics = extractTopics(messages);
  const sentiment = detectOverallSentiment(messages);
  
  // Extract key points
  const keyPoints: string[] = [];
  const actionItems: string[] = [];
  
  messages.forEach(msg => {
    // Look for questions (key points)
    if (msg.content.includes('?')) {
      const sentences = msg.content.split(/[.!?]+/);
      sentences.forEach(sentence => {
        if (sentence.includes('?')) {
          keyPoints.push(sentence.trim() + '?');
        }
      });
    }
    
    // Look for action items (will, going to, need to)
    if (msg.role === 'assistant') {
      const actionPatterns = [/will\s+\w+/gi, /going to\s+\w+/gi, /need to\s+\w+/gi];
      actionPatterns.forEach(pattern => {
        const matches = msg.content.match(pattern);
        if (matches) {
          matches.forEach(match => actionItems.push(match));
        }
      });
    }
  });

  const summary = summarizeThread(messages);

  return {
    summary,
    keyPoints: keyPoints.slice(0, 5), // Top 5 key points
    actionItems: actionItems.slice(0, 5), // Top 5 action items
    sentiment,
  };
}

