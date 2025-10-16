import { describe, it, expect } from 'vitest';
import { auditMeta, optimizeMeta, suggestTitle, suggestDescription } from '../../app/services/seo/meta-optimizer';

describe('SEO Meta Optimizer', () => {
  it('suggests defaults when fields are missing and computes issues', () => {
    const issues = auditMeta({ primaryKeyword: 'hot rods', brand: 'HotRodan' });
    const ids = issues.map(i => i.id).sort();
    expect(ids).toContain('title.missing');
    expect(ids).toContain('desc.missing');
    expect(ids).toContain('h1.missing');

    const result = optimizeMeta({ primaryKeyword: 'hot rods', brand: 'HotRodan' });
    expect(result.title).toBeTypeOf('string');
    expect(result.description).toBeTypeOf('string');
    expect(result.h1).toBe('hot rods');
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('flags keyword placement late in title and provides suggestion', () => {
    const issues = auditMeta({
      title: 'Buy now | HotRodan',
      description: 'Quality parts and service',
      h1: 'Welcome',
      primaryKeyword: 'hot rods',
      brand: 'HotRodan',
    });
    const keywordIssue = issues.find(i => i.id === 'title.keyword');
    expect(keywordIssue?.suggested).toBeTruthy();
  });

  it('respects max length in suggestions', () => {
    const t = suggestTitle({ primaryKeyword: 'vintage cars', brand: 'HotRodan', maxLength: 10 });
    expect(t.length).toBeLessThanOrEqual(10);
    const d = suggestDescription({ primaryKeyword: 'vintage cars', usp: 'Best in class', cta: 'Shop now', maxLength: 30 });
    expect(d.length).toBeLessThanOrEqual(30);
  });
});

