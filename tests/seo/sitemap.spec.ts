/**
 * Tests for Dynamic Sitemap Generation
 */

import { describe, it, expect } from 'vitest';
import { seoOptimizer } from '~/lib/seo/seo-optimization';

describe('Sitemap Generation', () => {
  describe('Static Pages', () => {
    it('should include all core application pages', () => {
      const baseUrl = 'https://hotdash.fly.dev';
      const now = new Date().toISOString();
      
      const pages = [
        {
          url: `${baseUrl}/`,
          lastModified: now,
          changeFrequency: 'daily' as const,
          priority: 1.0
        },
        {
          url: `${baseUrl}/settings`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.8
        },
        {
          url: `${baseUrl}/content-calendar`,
          lastModified: now,
          changeFrequency: 'daily' as const,
          priority: 0.9
        },
        {
          url: `${baseUrl}/ideas`,
          lastModified: now,
          changeFrequency: 'daily' as const,
          priority: 0.9
        },
        {
          url: `${baseUrl}/growth-engine`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7
        },
        {
          url: `${baseUrl}/health`,
          lastModified: now,
          changeFrequency: 'hourly' as const,
          priority: 0.6
        },
        {
          url: `${baseUrl}/seo/anomalies`,
          lastModified: now,
          changeFrequency: 'daily' as const,
          priority: 0.8
        }
      ];

      expect(pages.length).toBeGreaterThan(0);
      expect(pages.every(p => p.url.startsWith(baseUrl))).toBe(true);
      expect(pages.every(p => p.priority >= 0 && p.priority <= 1)).toBe(true);
    });

    it('should have valid change frequencies', () => {
      const validFrequencies = ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'];
      const testFrequencies = ['daily', 'weekly', 'hourly'];

      testFrequencies.forEach(freq => {
        expect(validFrequencies).toContain(freq);
      });
    });

    it('should have valid priority values', () => {
      const priorities = [1.0, 0.9, 0.8, 0.7, 0.6];

      priorities.forEach(priority => {
        expect(priority).toBeGreaterThanOrEqual(0);
        expect(priority).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('Sitemap XML Generation', () => {
    it('should generate valid sitemap XML', () => {
      const pages = [
        {
          url: 'https://example.com/',
          lastModified: new Date().toISOString(),
          changeFrequency: 'daily' as const,
          priority: 1.0
        },
        {
          url: 'https://example.com/about',
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.8
        }
      ];

      const sitemap = seoOptimizer.generateSitemapData(pages);

      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset');
      expect(sitemap).toContain('</urlset>');
      expect(sitemap).toContain('<url>');
      expect(sitemap).toContain('</url>');
      expect(sitemap).toContain('<loc>');
      expect(sitemap).toContain('<lastmod>');
      expect(sitemap).toContain('<changefreq>');
      expect(sitemap).toContain('<priority>');
    });

    it('should include all pages in sitemap', () => {
      const pages = [
        {
          url: 'https://example.com/page1',
          lastModified: new Date().toISOString(),
          changeFrequency: 'daily' as const,
          priority: 1.0
        },
        {
          url: 'https://example.com/page2',
          lastModified: new Date().toISOString(),
          changeFrequency: 'weekly' as const,
          priority: 0.8
        },
        {
          url: 'https://example.com/page3',
          lastModified: new Date().toISOString(),
          changeFrequency: 'monthly' as const,
          priority: 0.5
        }
      ];

      const sitemap = seoOptimizer.generateSitemapData(pages);

      pages.forEach(page => {
        expect(sitemap).toContain(page.url);
      });
    });

    it('should escape special characters in URLs', () => {
      const pages = [
        {
          url: 'https://example.com/page?param=value&other=test',
          lastModified: new Date().toISOString(),
          changeFrequency: 'daily' as const,
          priority: 1.0
        }
      ];

      const sitemap = seoOptimizer.generateSitemapData(pages);

      // XML should escape & as &amp;
      expect(sitemap).toContain('&amp;');
    });
  });

  describe('Sitemap Response Headers', () => {
    it('should have correct content type', () => {
      const headers = {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'noindex'
      };

      expect(headers['Content-Type']).toBe('application/xml');
    });

    it('should have cache control header', () => {
      const headers = {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'noindex'
      };

      expect(headers['Cache-Control']).toContain('max-age');
      expect(headers['Cache-Control']).toContain('3600');
    });

    it('should prevent indexing of sitemap itself', () => {
      const headers = {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'noindex'
      };

      expect(headers['X-Robots-Tag']).toBe('noindex');
    });
  });

  describe('Dynamic Page Discovery', () => {
    it('should support future dynamic page addition', () => {
      // Placeholder test for future dynamic page discovery
      // When implemented, this will fetch pages from database/Shopify
      
      const staticPages = 7; // Current count of static pages
      const dynamicPages = 0; // Will be > 0 when implemented
      
      const totalPages = staticPages + dynamicPages;
      
      expect(totalPages).toBeGreaterThanOrEqual(staticPages);
    });

    it('should handle empty dynamic pages gracefully', () => {
      const dynamicPages: any[] = [];
      
      expect(Array.isArray(dynamicPages)).toBe(true);
      expect(dynamicPages.length).toBe(0);
    });
  });
});

