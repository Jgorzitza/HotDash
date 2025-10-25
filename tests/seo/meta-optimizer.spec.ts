/**
 * Tests for Automated Meta Tag Optimization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { optimizeMetaTags, batchOptimizeMetaTags, type PageContent } from '~/services/seo/meta-optimizer';

describe('Meta Tag Optimizer', () => {
  describe('optimizeMetaTags', () => {
    it('should optimize title that is too short', async () => {
      const pageContent: PageContent = {
        url: 'https://example.com/test',
        title: 'Short',
        description: 'A short description',
        content: '<h1>Test Page About Shopify Analytics</h1><p>This is a comprehensive guide to Shopify analytics and reporting tools.</p>',
        headings: []
      };

      const result = await optimizeMetaTags(pageContent);

      expect(result.optimizedTitle).not.toBe('Short');
      expect(result.optimizedTitle.length).toBeGreaterThanOrEqual(30);
      expect(result.optimizedTitle.length).toBeLessThanOrEqual(60);
      expect(result.improvements.length).toBeGreaterThan(0);
    });

    it('should optimize description that is too short', async () => {
      const pageContent: PageContent = {
        url: 'https://example.com/test',
        title: 'Shopify Analytics Dashboard - Complete Guide',
        description: 'Short desc',
        content: '<h1>Shopify Analytics Dashboard</h1><p>Learn how to use Shopify analytics to track your store performance, monitor sales, and optimize your marketing campaigns for better results.</p>',
        headings: []
      };

      const result = await optimizeMetaTags(pageContent);

      expect(result.optimizedDescription).not.toBe('Short desc');
      expect(result.optimizedDescription.length).toBeGreaterThanOrEqual(120);
      expect(result.optimizedDescription.length).toBeLessThanOrEqual(160);
    });

    it('should keep good title and description unchanged', async () => {
      const goodTitle = 'Shopify Analytics Dashboard - Complete Guide';
      const goodDescription = 'Learn how to use Shopify analytics to track your store performance, monitor sales, and optimize your marketing campaigns for better results.';
      
      const pageContent: PageContent = {
        url: 'https://example.com/test',
        title: goodTitle,
        description: goodDescription,
        content: '<h1>Shopify Analytics Dashboard</h1><p>Content here</p>',
        headings: []
      };

      const result = await optimizeMetaTags(pageContent);

      expect(result.optimizedTitle).toBe(goodTitle);
      expect(result.optimizedDescription).toBe(goodDescription);
    });

    it('should extract keywords from content', async () => {
      const pageContent: PageContent = {
        url: 'https://example.com/test',
        title: 'Test Page',
        description: 'Test description',
        content: '<h1>Shopify Analytics</h1><p>Shopify analytics provides insights into your store performance. Track sales, monitor inventory, and analyze customer behavior with powerful analytics tools.</p>',
        headings: []
      };

      const result = await optimizeMetaTags(pageContent);

      expect(result.keywords.length).toBeGreaterThan(0);
      expect(result.keywords).toContain('shopify');
      expect(result.keywords).toContain('analytics');
    });

    it('should calculate optimization score', async () => {
      const pageContent: PageContent = {
        url: 'https://example.com/test',
        title: 'Shopify Analytics Dashboard - Complete Guide',
        description: 'Learn how to use Shopify analytics to track your store performance, monitor sales, and optimize your marketing campaigns for better results.',
        content: '<h1>Shopify Analytics Dashboard</h1><p>Comprehensive content about Shopify analytics and reporting.</p>',
        headings: []
      };

      const result = await optimizeMetaTags(pageContent);

      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should provide improvement suggestions', async () => {
      const pageContent: PageContent = {
        url: 'https://example.com/test',
        title: 'Short',
        description: 'Short',
        content: '<h1>Test Page</h1><p>Content here with keywords like Shopify, analytics, dashboard, and reporting tools.</p>',
        headings: []
      };

      const result = await optimizeMetaTags(pageContent);

      expect(result.improvements).toBeDefined();
      expect(Array.isArray(result.improvements)).toBe(true);
      expect(result.improvements.length).toBeGreaterThan(0);
    });
  });

  describe('batchOptimizeMetaTags', () => {
    it('should optimize multiple pages', async () => {
      const pages: PageContent[] = [
        {
          url: 'https://example.com/page1',
          title: 'Page 1',
          description: 'Desc 1',
          content: '<h1>Page 1</h1><p>Content for page 1 about Shopify analytics.</p>',
          headings: []
        },
        {
          url: 'https://example.com/page2',
          title: 'Page 2',
          description: 'Desc 2',
          content: '<h1>Page 2</h1><p>Content for page 2 about inventory management.</p>',
          headings: []
        }
      ];

      const results = await batchOptimizeMetaTags(pages);

      expect(results.size).toBe(2);
      expect(results.has('https://example.com/page1')).toBe(true);
      expect(results.has('https://example.com/page2')).toBe(true);
    });

    it('should handle empty array', async () => {
      const results = await batchOptimizeMetaTags([]);
      expect(results.size).toBe(0);
    });
  });
});

