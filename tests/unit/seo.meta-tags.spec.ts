import { describe, expect, it } from 'vitest';
import {
  checkTitle,
  checkDescription,
  checkOpenGraph,
  analyzeMetaTags,
  getLowScorePages,
  META_TAG_RULES,
  type MetaTags,
} from '../../app/lib/seo/meta-tags';

describe('Meta Tag Optimization', () => {
  describe('checkTitle', () => {
    it('detects missing title', () => {
      const issues = checkTitle(undefined);
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('critical');
    });

    it('detects short title', () => {
      const issues = checkTitle('Short');
      expect(issues).toHaveLength(1);
      expect(issues[0].issue).toContain('too short');
    });

    it('detects long title', () => {
      const issues = checkTitle('This is a very long title that exceeds the recommended maximum length for SEO');
      expect(issues).toHaveLength(1);
      expect(issues[0].issue).toContain('too long');
    });

    it('accepts optimal title', () => {
      const issues = checkTitle('This is a good title for SEO optimization');
      expect(issues).toHaveLength(0);
    });
  });

  describe('checkDescription', () => {
    it('detects missing description', () => {
      const issues = checkDescription(undefined);
      expect(issues).toHaveLength(1);
      expect(issues[0].severity).toBe('critical');
    });

    it('detects short description', () => {
      const issues = checkDescription('Too short');
      expect(issues).toHaveLength(1);
      expect(issues[0].issue).toContain('too short');
    });

    it('detects long description', () => {
      const longDesc = 'A'.repeat(200);
      const issues = checkDescription(longDesc);
      expect(issues).toHaveLength(1);
      expect(issues[0].issue).toContain('too long');
    });

    it('accepts optimal description', () => {
      const desc = 'This is a well-optimized meta description that provides valuable information about the page content and encourages clicks from search results.';
      const issues = checkDescription(desc);
      expect(issues).toHaveLength(0);
    });
  });

  describe('checkOpenGraph', () => {
    it('detects missing OG tags', () => {
      const tags: MetaTags = {
        url: '/test',
        title: 'Test',
      };

      const issues = checkOpenGraph(tags);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.some(i => i.field === 'ogTitle')).toBe(true);
      expect(issues.some(i => i.field === 'ogDescription')).toBe(true);
      expect(issues.some(i => i.field === 'ogImage')).toBe(true);
    });

    it('accepts complete OG tags', () => {
      const tags: MetaTags = {
        url: '/test',
        ogTitle: 'Test',
        ogDescription: 'Description',
        ogImage: 'https://example.com/image.jpg',
      };

      const issues = checkOpenGraph(tags);
      expect(issues).toHaveLength(0);
    });
  });

  describe('analyzeMetaTags', () => {
    it('scores perfect tags highly', () => {
      const tags: MetaTags = {
        url: '/test',
        title: 'Perfect SEO Title for Testing',
        description: 'This is a perfectly optimized meta description that provides valuable information and is the right length for search engines.',
        canonical: 'https://example.com/test',
        ogTitle: 'Perfect SEO Title',
        ogDescription: 'Perfect description',
        ogImage: 'https://example.com/image.jpg',
      };

      const score = analyzeMetaTags(tags);
      expect(score.score).toBeGreaterThanOrEqual(90);
      expect(score.issues.length).toBeLessThanOrEqual(1); // May have minor warnings
    });

    it('penalizes missing critical tags', () => {
      const tags: MetaTags = {
        url: '/test',
      };

      const score = analyzeMetaTags(tags);
      expect(score.score).toBeLessThan(70);
      expect(score.issues.length).toBeGreaterThan(0);
    });
  });

  describe('getLowScorePages', () => {
    it('filters pages below threshold', () => {
      const scores = [
        { url: '/page1', score: 90, issues: [], strengths: [] },
        { url: '/page2', score: 50, issues: [], strengths: [] },
        { url: '/page3', score: 60, issues: [], strengths: [] },
      ];

      const low = getLowScorePages(scores, 70);
      expect(low).toHaveLength(2);
      expect(low[0].score).toBe(50);
    });
  });

  describe('META_TAG_RULES', () => {
    it('has correct title rules', () => {
      expect(META_TAG_RULES.title.minLength).toBe(30);
      expect(META_TAG_RULES.title.maxLength).toBe(60);
    });

    it('has correct description rules', () => {
      expect(META_TAG_RULES.description.minLength).toBe(120);
      expect(META_TAG_RULES.description.maxLength).toBe(160);
    });
  });
});

