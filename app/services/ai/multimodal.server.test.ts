/**
 * Tests for Multimodal AI Support Service
 * 
 * @module app/services/ai/multimodal.server.test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  validateImage,
  imageToBase64,
  analyzeImage,
  analyzeCombinedContext,
  prepareRAGContext,
  type ImageAnalysisRequest,
  type CombinedAnalysisRequest,
} from './multimodal.server';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    description: 'A screenshot showing an error message',
                    sentiment: 'negative',
                    issueDetected: true,
                    issueType: 'error_message',
                    confidence: 0.9,
                    visualElements: ['error dialog', 'red text', 'close button'],
                    suggestedAction: 'Investigate the error and provide solution',
                  }),
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

describe('multimodal.server', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateImage', () => {
    it('should validate URLs', () => {
      const result = validateImage('https://example.com/image.jpg', 'image/jpeg');
      expect(result.valid).toBe(true);
      expect(result.format).toBe('image/jpeg');
    });

    it('should validate base64 data URIs', () => {
      const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const result = validateImage(base64);
      expect(result.valid).toBe(true);
      expect(result.format).toBe('image/jpeg');
    });

    it('should reject unsupported formats', () => {
      const base64 = 'data:image/bmp;base64,Qk==';
      const result = validateImage(base64);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported format');
    });

    it('should reject images that are too large', () => {
      // Create a large base64 string (> 20MB)
      const largeData = 'A'.repeat(30 * 1024 * 1024); // 30MB
      const base64 = `data:image/jpeg;base64,${largeData}`;
      const result = validateImage(base64);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should reject invalid format', () => {
      const result = validateImage('not-a-valid-image');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid image format');
    });
  });

  describe('imageToBase64', () => {
    it('should pass through data URIs', async () => {
      const dataUri = 'data:image/jpeg;base64,/9j/4AAQSkZJRg==';
      const result = await imageToBase64(dataUri);
      expect(result).toBe(dataUri);
    });

    it('should pass through URLs', async () => {
      const url = 'https://example.com/image.jpg';
      const result = await imageToBase64(url);
      expect(result).toBe(url);
    });

    it('should convert plain base64 to data URI', async () => {
      const base64 = '/9j/4AAQSkZJRg==';
      const result = await imageToBase64(base64);
      expect(result).toBe('data:image/jpeg;base64,/9j/4AAQSkZJRg==');
    });

    it('should convert Buffer to data URI', async () => {
      const buffer = Buffer.from('test data');
      const result = await imageToBase64(buffer, 'image/png');
      expect(result).toContain('data:image/png;base64,');
      expect(result).toContain(buffer.toString('base64'));
    });
  });

  describe('analyzeImage', () => {
    beforeEach(() => {
      // Set mock API key
      process.env.OPENAI_API_KEY = 'sk-test-key';
    });

    it('should analyze image from URL', async () => {
      const request: ImageAnalysisRequest = {
        imageUrl: 'https://example.com/error-screenshot.jpg',
        text: 'I got this error',
      };

      const result = await analyzeImage(request);

      expect(result.description).toBeDefined();
      expect(result.sentiment).toBe('negative');
      expect(result.issueDetected).toBe(true);
      expect(result.issueType).toBe('error_message');
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.visualElements).toBeInstanceOf(Array);
    });

    it('should analyze image from base64', async () => {
      const request: ImageAnalysisRequest = {
        imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        text: 'Product looks damaged',
      };

      const result = await analyzeImage(request);

      expect(result).toBeDefined();
      expect(result.description).toBeDefined();
    });

    it('should throw error if no image provided', async () => {
      const request: ImageAnalysisRequest = {
        text: 'No image',
      };

      await expect(analyzeImage(request)).rejects.toThrow(
        'Either imageUrl or imageBase64 must be provided'
      );
    });

    it('should throw error if API key not configured', async () => {
      delete process.env.OPENAI_API_KEY;

      const request: ImageAnalysisRequest = {
        imageUrl: 'https://example.com/image.jpg',
      };

      await expect(analyzeImage(request)).rejects.toThrow(
        'OPENAI_API_KEY not configured'
      );
    });
  });

  describe('analyzeCombinedContext', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
    });

    it('should analyze text and images together', async () => {
      const request: CombinedAnalysisRequest = {
        text: 'My order arrived but the product is broken',
        images: [
          { url: 'https://example.com/broken-product.jpg' },
        ],
      };

      const result = await analyzeCombinedContext(request);

      expect(result.overallSentiment).toBeDefined();
      expect(result.urgencyScore).toBeGreaterThanOrEqual(0);
      expect(result.urgencyScore).toBeLessThanOrEqual(1);
      expect(result.issuesDetected).toBeInstanceOf(Array);
      expect(result.suggestedResponse).toBeDefined();
      expect(result.imageAnalysis).toBeDefined();
    });

    it('should handle text-only requests', async () => {
      const request: CombinedAnalysisRequest = {
        text: 'I need help with my order',
      };

      const result = await analyzeCombinedContext(request);

      expect(result.overallSentiment).toBeDefined();
      expect(result.imageAnalysis).toBeUndefined();
    });

    it('should include conversation history', async () => {
      const request: CombinedAnalysisRequest = {
        text: 'Still waiting for response',
        conversationHistory: 'Customer asked about order status 2 days ago',
      };

      const result = await analyzeCombinedContext(request);

      expect(result).toBeDefined();
      expect(result.urgencyScore).toBeGreaterThan(0.5); // Should be more urgent
    });
  });

  describe('prepareRAGContext', () => {
    it('should prepare context for RAG storage', () => {
      const analysis = {
        overallSentiment: 'negative' as const,
        urgencyScore: 0.8,
        issuesDetected: [
          { source: 'image' as const, type: 'broken_product', description: 'Product damage visible' },
        ],
        suggestedResponse: 'Apologize and offer replacement',
        confidence: 0.9,
        imageAnalysis: [
          {
            description: 'Broken product',
            sentiment: 'negative' as const,
            issueDetected: true,
            confidence: 0.9,
            visualElements: ['crack', 'damage'],
            rawResponse: 'test',
          },
        ],
      };

      const request = {
        text: 'Product arrived broken',
        images: [{ url: 'https://example.com/broken.jpg' }],
      };

      const context = prepareRAGContext(analysis, request);

      expect(context.text).toBe(request.text);
      expect(context.images).toBeDefined();
      expect(context.images?.[0]?.url).toBe('https://example.com/broken.jpg');
      expect(context.metadata.sentiment).toBe('negative');
      expect(context.metadata.urgency).toBe(0.8);
      expect(context.metadata.timestamp).toBeDefined();
    });
  });

  describe('Integration: Customer Support Scenarios', () => {
    beforeEach(() => {
      process.env.OPENAI_API_KEY = 'sk-test-key';
    });

    it('should handle error screenshot scenario', async () => {
      const request: CombinedAnalysisRequest = {
        text: 'I keep getting this error when I try to checkout',
        images: [
          { url: 'https://example.com/error-screenshot.jpg' },
        ],
      };

      const result = await analyzeCombinedContext(request);

      expect(result.overallSentiment).toBe('negative');
      expect(result.issuesDetected.length).toBeGreaterThan(0);
      expect(result.imageAnalysis).toBeDefined();
      expect(result.imageAnalysis?.[0]?.issueType).toBe('error_message');
    });

    it('should handle product photo scenario', async () => {
      const request: CombinedAnalysisRequest = {
        text: 'Does this product fit my car?',
        images: [
          { url: 'https://example.com/product-photo.jpg' },
        ],
      };

      const result = await analyzeCombinedContext(request);

      expect(result).toBeDefined();
      expect(result.suggestedResponse).toBeDefined();
    });

    it('should handle shipping damage scenario', async () => {
      const request: CombinedAnalysisRequest = {
        text: 'Package arrived damaged',
        images: [
          { url: 'https://example.com/damaged-box.jpg' },
          { url: 'https://example.com/damaged-product.jpg' },
        ],
      };

      const result = await analyzeCombinedContext(request);

      expect(result.overallSentiment).toBe('negative');
      expect(result.urgencyScore).toBeGreaterThan(0.6);
      expect(result.imageAnalysis?.length).toBe(2);
    });
  });
});

