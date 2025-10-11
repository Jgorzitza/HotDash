/**
 * Tests for ConversationManager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConversationManager } from '../src/context/conversation-manager';

describe('ConversationManager', () => {
  let manager: ConversationManager;

  beforeEach(() => {
    manager = new ConversationManager();
  });

  describe('getContext', () => {
    it('should create new context for new conversation', () => {
      const context = manager.getContext(123);
      expect(context.conversationId).toBe(123);
      expect(context.messages).toEqual([]);
      expect(context.customer).toEqual({});
    });

    it('should return existing context', () => {
      const context1 = manager.getContext(123);
      const context2 = manager.getContext(123);
      expect(context1).toBe(context2);
    });
  });

  describe('addMessage', () => {
    it('should add message to conversation', () => {
      const message = manager.addMessage(123, {
        role: 'user',
        content: 'Hello',
      });

      expect(message.id).toBeDefined();
      expect(message.timestamp).toBeInstanceOf(Date);
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');

      const context = manager.getContext(123);
      expect(context.messages).toHaveLength(1);
    });

    it('should limit messages to 50', () => {
      // Add 60 messages
      for (let i = 0; i < 60; i++) {
        manager.addMessage(123, {
          role: 'user',
          content: `Message ${i}`,
        });
      }

      const context = manager.getContext(123);
      expect(context.messages).toHaveLength(50);
      // Should keep most recent messages
      expect(context.messages[0].content).toBe('Message 10');
    });
  });

  describe('updateCustomer', () => {
    it('should update customer context', () => {
      manager.updateCustomer(123, { email: 'test@example.com', name: 'Test User' });

      const context = manager.getContext(123);
      expect(context.customer.email).toBe('test@example.com');
      expect(context.customer.name).toBe('Test User');
    });

    it('should merge customer updates', () => {
      manager.updateCustomer(123, { email: 'test@example.com' });
      manager.updateCustomer(123, { name: 'Test User' });

      const context = manager.getContext(123);
      expect(context.customer.email).toBe('test@example.com');
      expect(context.customer.name).toBe('Test User');
    });
  });

  describe('setIntent', () => {
    it('should set conversation intent', () => {
      manager.setIntent(123, 'order_status');

      const context = manager.getContext(123);
      expect(context.intent).toBe('order_status');
    });
  });

  describe('setSentiment', () => {
    it('should set conversation sentiment', () => {
      manager.setSentiment(123, 'positive');

      const context = manager.getContext(123);
      expect(context.sentiment).toBe('positive');
    });
  });

  describe('setUrgency', () => {
    it('should set conversation urgency', () => {
      manager.setUrgency(123, 'high');

      const context = manager.getContext(123);
      expect(context.urgency).toBe('high');
    });
  });

  describe('getRecentMessages', () => {
    it('should return recent messages', () => {
      for (let i = 0; i < 20; i++) {
        manager.addMessage(123, {
          role: 'user',
          content: `Message ${i}`,
        });
      }

      const recent = manager.getRecentMessages(123, 5);
      expect(recent).toHaveLength(5);
      expect(recent[0].content).toBe('Message 15');
      expect(recent[4].content).toBe('Message 19');
    });
  });

  describe('getSummary', () => {
    it('should generate conversation summary', () => {
      manager.updateCustomer(123, { name: 'Test User', email: 'test@example.com' });
      manager.setIntent(123, 'order_status');
      manager.setSentiment(123, 'positive');
      manager.setUrgency(123, 'medium');
      manager.addMessage(123, { role: 'user', content: 'Hello' });

      const summary = manager.getSummary(123);
      expect(summary).toContain('Test User');
      expect(summary).toContain('order_status');
      expect(summary).toContain('positive');
      expect(summary).toContain('medium');
      expect(summary).toContain('Messages: 1');
    });
  });

  describe('cleanup', () => {
    it('should remove old conversations', () => {
      // Create conversation and manually set old timestamp
      const context = manager.getContext(123);
      context.updatedAt = new Date(Date.now() - 48 * 60 * 60 * 1000); // 48 hours ago

      const removed = manager.cleanup(24 * 60 * 60 * 1000); // 24 hours
      expect(removed).toBe(1);
      expect(manager.getActiveConversations()).toHaveLength(0);
    });
  });
});

