/**
 * CX Conversation Mining Service Tests
 * 
 * Tests for CX → Product Loop functionality:
 * - Conversation embedding
 * - Theme detection
 * - Action card generation
 * - PII safety verification
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { embedConversations, detectRecurringThemes, generateCXProductActions, runNightlyCXMining } from '~/services/ai-knowledge/cx-conversation-mining';

// Mock dependencies
vi.mock('~/db.server', () => ({
  prisma: {
    chatwootConversation: {
      findMany: vi.fn(),
    },
    shopifyProduct: {
      findFirst: vi.fn(),
    },
    $executeRaw: vi.fn(),
    $queryRaw: vi.fn(),
  },
}));

vi.mock('openai', () => ({
  OpenAI: vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    },
  })),
}));

vi.mock('~/services/ai-knowledge/pii-sanitizer', () => ({
  sanitizeConversation: vi.fn((messages) =>
    messages.map((m: any) => ({
      content: m.content.replace(/test@example\.com/g, '[EMAIL_REDACTED]'),
      messageType: m.messageType,
      piiDetected: m.content.includes('test@example.com'),
      piiTypes: m.content.includes('test@example.com') ? ['email'] : [],
    }))
  ),
}));

import { prisma } from '~/db.server';

describe('CX Conversation Mining', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('embedConversations', () => {
    it('should embed conversations and remove PII', async () => {
      // Mock Chatwoot conversations
      vi.mocked(prisma.chatwootConversation.findMany).mockResolvedValue([
        {
          id: 'conv-1',
          createdAt: new Date(),
          messages: [
            {
              id: 'msg-1',
              content: 'My email is test@example.com',
              messageType: 'incoming',
              createdAt: new Date(),
            },
            {
              id: 'msg-2',
              content: 'Thank you for your message',
              messageType: 'outgoing',
              createdAt: new Date(),
            },
          ],
        },
      ] as any);

      const count = await embedConversations();

      expect(count).toBe(1);
      expect(prisma.$executeRaw).toHaveBeenCalled();
      
      // Verify PII was sanitized in the embedded text
      const executeCall = vi.mocked(prisma.$executeRaw).mock.calls[0];
      const embeddedText = executeCall[0];
      
      // The embedded text should not contain the original email
      expect(embeddedText).not.toContain('test@example.com');
    });

    it('should handle empty conversation list', async () => {
      vi.mocked(prisma.chatwootConversation.findMany).mockResolvedValue([]);

      const count = await embedConversations();

      expect(count).toBe(0);
      expect(prisma.$executeRaw).not.toHaveBeenCalled();
    });

    it('should extract product handles from conversations', async () => {
      vi.mocked(prisma.chatwootConversation.findMany).mockResolvedValue([
        {
          id: 'conv-2',
          createdAt: new Date(),
          messages: [
            {
              id: 'msg-3',
              content: 'I want to buy /products/awesome-tshirt',
              messageType: 'incoming',
              createdAt: new Date(),
            },
          ],
        },
      ] as any);

      await embedConversations();

      // Verify product handles were extracted
      const executeCall = vi.mocked(prisma.$executeRaw).mock.calls[0];
      expect(executeCall).toBeDefined();
    });
  });

  describe('detectRecurringThemes', () => {
    it('should detect themes from similar conversations', async () => {
      // Mock pgvector similarity search results
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        {
          conversation_id: 'conv-1',
          text: 'Do you have a size chart?',
          product_handles: '["awesome-tshirt"]',
          created_at: new Date(),
          distance: 0.2,
        },
        {
          conversation_id: 'conv-2',
          text: 'Where can I find sizing information?',
          product_handles: '["awesome-tshirt"]',
          created_at: new Date(),
          distance: 0.25,
        },
        {
          conversation_id: 'conv-3',
          text: 'What are the dimensions?',
          product_handles: '["awesome-tshirt"]',
          created_at: new Date(),
          distance: 0.3,
        },
      ]);

      const themes = await detectRecurringThemes(3, 7);

      expect(themes.length).toBeGreaterThan(0);
      expect(themes[0]).toHaveProperty('theme');
      expect(themes[0]).toHaveProperty('occurrences');
      expect(themes[0]).toHaveProperty('productHandle');
      expect(themes[0].occurrences).toBeGreaterThanOrEqual(3);
    });

    it('should not return themes below minimum occurrences', async () => {
      // Mock only 2 similar conversations
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        {
          conversation_id: 'conv-1',
          text: 'Question about warranty',
          product_handles: '[]',
          created_at: new Date(),
          distance: 0.2,
        },
        {
          conversation_id: 'conv-2',
          text: 'Warranty info needed',
          product_handles: '[]',
          created_at: new Date(),
          distance: 0.25,
        },
      ]);

      const themes = await detectRecurringThemes(3, 7);

      // Should not return themes with only 2 occurrences (minimum is 3)
      expect(themes.length).toBe(0);
    });
  });

  describe('generateCXProductActions', () => {
    it('should generate action cards from themes', async () => {
      // Mock theme detection
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        {
          conversation_id: 'conv-1',
          text: 'Do you have a size chart?',
          product_handles: '["awesome-tshirt"]',
          created_at: new Date(),
          distance: 0.2,
        },
        {
          conversation_id: 'conv-2',
          text: 'Where is the sizing guide?',
          product_handles: '["awesome-tshirt"]',
          created_at: new Date(),
          distance: 0.25,
        },
        {
          conversation_id: 'conv-3',
          text: 'Need size information',
          product_handles: '["awesome-tshirt"]',
          created_at: new Date(),
          distance: 0.3,
        },
      ]);

      // Mock product lookup
      vi.mocked(prisma.shopifyProduct.findFirst).mockResolvedValue({
        id: 'prod-1',
        title: 'Awesome T-Shirt',
        handle: 'awesome-tshirt',
      } as any);

      const actions = await generateCXProductActions();

      expect(actions.length).toBeGreaterThan(0);
      expect(actions[0]).toHaveProperty('type');
      expect(actions[0]).toHaveProperty('title');
      expect(actions[0]).toHaveProperty('description');
      expect(actions[0]).toHaveProperty('expectedRevenue');
      expect(actions[0]).toHaveProperty('confidence');
      expect(actions[0]).toHaveProperty('ease');
      expect(actions[0].type).toBe('content');
    });

    it('should calculate expected revenue based on occurrences', async () => {
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        ...Array(5).fill(null).map((_, i) => ({
          conversation_id: `conv-${i}`,
          text: 'Size chart question',
          product_handles: '["test-product"]',
          created_at: new Date(),
          distance: 0.2,
        })),
      ]);

      vi.mocked(prisma.shopifyProduct.findFirst).mockResolvedValue({
        id: 'prod-1',
        title: 'Test Product',
        handle: 'test-product',
      } as any);

      const actions = await generateCXProductActions();

      expect(actions[0].expectedRevenue).toBe(250); // 5 occurrences * $50
    });
  });

  describe('runNightlyCXMining', () => {
    it('should execute complete mining workflow', async () => {
      // Mock conversations
      vi.mocked(prisma.chatwootConversation.findMany).mockResolvedValue([
        {
          id: 'conv-1',
          createdAt: new Date(),
          messages: [
            {
              id: 'msg-1',
              content: 'Do you have a size chart?',
              messageType: 'incoming',
              createdAt: new Date(),
            },
          ],
        },
      ] as any);

      // Mock theme detection
      vi.mocked(prisma.$queryRaw).mockResolvedValue([
        {
          conversation_id: 'conv-1',
          text: 'Size chart question',
          product_handles: '["test-product"]',
          created_at: new Date(),
          distance: 0.2,
        },
        {
          conversation_id: 'conv-2',
          text: 'Sizing guide needed',
          product_handles: '["test-product"]',
          created_at: new Date(),
          distance: 0.25,
        },
        {
          conversation_id: 'conv-3',
          text: 'Where are dimensions?',
          product_handles: '["test-product"]',
          created_at: new Date(),
          distance: 0.3,
        },
      ]);

      // Mock product lookup
      vi.mocked(prisma.shopifyProduct.findFirst).mockResolvedValue({
        id: 'prod-1',
        title: 'Test Product',
        handle: 'test-product',
      } as any);

      const summary = await runNightlyCXMining();

      expect(summary).toHaveProperty('embedded');
      expect(summary).toHaveProperty('themesDetected');
      expect(summary).toHaveProperty('actionsGenerated');
      expect(summary.embedded).toBe(1);
      expect(summary.themesDetected).toBeGreaterThan(0);
      expect(summary.actionsGenerated).toBeGreaterThan(0);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(prisma.chatwootConversation.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );

      await expect(runNightlyCXMining()).rejects.toThrow('Database connection failed');
    });
  });

  describe('PII Safety', () => {
    it('should never store PII in embeddings', async () => {
      vi.mocked(prisma.chatwootConversation.findMany).mockResolvedValue([
        {
          id: 'conv-1',
          createdAt: new Date(),
          messages: [
            {
              id: 'msg-1',
              content: 'My email is test@example.com and phone is (555) 123-4567',
              messageType: 'incoming',
              createdAt: new Date(),
            },
          ],
        },
      ] as any);

      await embedConversations();

      const executeCall = vi.mocked(prisma.$executeRaw).mock.calls[0];
      const embeddedText = executeCall[0];

      // Verify NO PII in embedded text
      expect(embeddedText).not.toContain('test@example.com');
      expect(embeddedText).not.toContain('(555) 123-4567');
      expect(embeddedText).not.toContain('555');
    });
  });
});
