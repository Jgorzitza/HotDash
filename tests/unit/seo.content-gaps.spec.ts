import { describe, it, expect } from 'vitest';
import { findContentGaps } from '../../app/services/seo/content-gaps';

describe('SEO Content Gaps', () => {
  it('finds competitor-only topics and prioritizes high-value', () => {
    const res = findContentGaps({
      ourKeywords: ['custom hot rods', 'vintage cars'],
      competitorKeywords: [
        'custom hot rods', // ours already
        'hot rod parts',
        'vintage cars for sale',
        'classic car restoration guide',
        'classic car restoration tips',
      ],
      existingSlugs: ['classic-car-restoration-guide'],
    });

    // Should exclude ones we already have and existing slugs
    expect(res.find(o => o.topic.includes('custom hot'))).toBeFalsy();
    // Topic is grouped by first two words
    expect(res.find(o => o.topic.includes('classic car'))).toBeTruthy();

    // Ordered by priority then traffic score
    const priorities = res.map(o => o.priority);
    const order = ['P0','P1','P2','P3'];
    for (let i = 1; i < priorities.length; i++) {
      expect(order.indexOf(priorities[i-1])).toBeLessThanOrEqual(order.indexOf(priorities[i]));
    }
  });
});

