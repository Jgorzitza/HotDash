/**
 * Unit Tests for AI Agent Components
 * 
 * Tests individual components in isolation with mocks.
 */

import { describe, it, expect } from 'vitest';
import { GradingSchema } from '../../app/components/grading/index';
import { detectSentiment, calculatePriority, extractOrderNumbers } from '../../app/agents/context/index';
import type { Message } from '../../app/agents/context/index';

describe('Grading Schema', () => {
  it('should validate correct grading', () => {
    const grading = {
      tone: 5,
      accuracy: 4,
      policy: 5,
      feedback: 'Great response!',
    };

    const result = GradingSchema.safeParse(grading);
    expect(result.success).toBe(true);
  });

  it('should reject invalid tone value', () => {
    const grading = {
      tone: 6, // Invalid: > 5
      accuracy: 4,
      policy: 5,
    };

    const result = GradingSchema.safeParse(grading);
    expect(result.success).toBe(false);
  });

  it('should reject invalid accuracy value', () => {
    const grading = {
      tone: 5,
      accuracy: 0, // Invalid: < 1
      policy: 5,
    };

    const result = GradingSchema.safeParse(grading);
    expect(result.success).toBe(false);
  });

  it('should allow optional feedback', () => {
    const grading = {
      tone: 5,
      accuracy: 4,
      policy: 5,
    };

    const result = GradingSchema.safeParse(grading);
    expect(result.success).toBe(true);
  });
});

describe('Sentiment Detection', () => {
  it('should detect positive sentiment', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'Thank you so much! This is great service.',
        timestamp: new Date().toISOString(),
      },
    ];

    const sentiment = detectSentiment(messages);
    expect(sentiment).toBe('positive');
  });

  it('should detect negative sentiment', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'This is terrible. I am very disappointed and frustrated.',
        timestamp: new Date().toISOString(),
      },
    ];

    const sentiment = detectSentiment(messages);
    expect(sentiment).toBe('negative');
  });

  it('should detect neutral sentiment', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'Where is my order?',
        timestamp: new Date().toISOString(),
      },
    ];

    const sentiment = detectSentiment(messages);
    expect(sentiment).toBe('neutral');
  });
});

describe('Priority Calculation', () => {
  it('should set urgent priority for urgent keywords', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'This is urgent! I need help immediately.',
        timestamp: new Date().toISOString(),
      },
    ];

    const priority = calculatePriority(messages, 'neutral');
    expect(priority).toBe('urgent');
  });

  it('should set high priority for refund requests', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'I want a refund for my order.',
        timestamp: new Date().toISOString(),
      },
    ];

    const priority = calculatePriority(messages, 'neutral');
    expect(priority).toBe('high');
  });

  it('should set high priority for negative sentiment', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'Where is my order?',
        timestamp: new Date().toISOString(),
      },
    ];

    const priority = calculatePriority(messages, 'negative');
    expect(priority).toBe('high');
  });

  it('should set normal priority for standard inquiries', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'What are your shipping options?',
        timestamp: new Date().toISOString(),
      },
    ];

    const priority = calculatePriority(messages, 'neutral');
    expect(priority).toBe('normal');
  });
});

describe('Order Number Extraction', () => {
  it('should extract order numbers from messages', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'Where is my order #12345?',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'msg_2',
        conversationId: 'conv_1',
        role: 'user',
        content: 'Also checking on order #67890',
        timestamp: new Date().toISOString(),
      },
    ];

    const orderNumbers = extractOrderNumbers(messages);
    expect(orderNumbers).toContain('12345');
    expect(orderNumbers).toContain('67890');
    expect(orderNumbers.length).toBe(2);
  });

  it('should return empty array when no order numbers found', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'What is your return policy?',
        timestamp: new Date().toISOString(),
      },
    ];

    const orderNumbers = extractOrderNumbers(messages);
    expect(orderNumbers).toEqual([]);
  });

  it('should handle duplicate order numbers', () => {
    const messages: Message[] = [
      {
        id: 'msg_1',
        conversationId: 'conv_1',
        role: 'user',
        content: 'Order #12345 is delayed',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'msg_2',
        conversationId: 'conv_1',
        role: 'user',
        content: 'Still waiting for #12345',
        timestamp: new Date().toISOString(),
      },
    ];

    const orderNumbers = extractOrderNumbers(messages);
    expect(orderNumbers).toEqual(['12345']);
  });
});

