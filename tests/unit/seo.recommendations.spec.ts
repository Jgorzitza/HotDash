import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../../app/services/seo/recommendations';
import type { RankingChange } from '../../app/lib/seo/rankings';
import type { VitalsAlert } from '../../app/lib/seo/web-vitals';
import type { CrawlError } from '../../app/lib/seo/crawl-errors';

describe('SEO Recommendations Engine', () => {
  it('aggregates inputs and prioritizes P0 first', () => {
    const rankingChanges: RankingChange[] = [
      { keyword: 'hot rods', url: '/p1', currentPosition: 15, previousPosition: 5, change: 10, changeType: 'drop', severity: 'major', date: '2025-10-15' },
      { keyword: 'vintage cars', url: '/p2', currentPosition: 4, previousPosition: 9, change: -5, changeType: 'improvement', severity: 'major', date: '2025-10-15' },
    ];
    const vitalsAlerts: VitalsAlert[] = [
      { url: '/p3', metric: 'LCP', currentValue: 5000, threshold: 4000, rating: 'poor', severity: 'critical', device: 'mobile', detectedAt: 'now' },
    ];
    const crawlErrors: CrawlError[] = [
      { url: '/p4', errorType: '500', errorCount: 3, firstDetected: 't1', lastDetected: 't2', severity: 'critical' },
    ];
    const contentOps = [
      { topic: 'classic car restoration', keywords: ['classic car restoration tips'], reason: 'gap', difficulty: 'medium', potentialTrafficScore: 60, priority: 'P1' as const },
    ];
    const meta = { title: 'x', description: 'y', h1: 'z', issues: [], score: 70 };

    const recs = generateRecommendations({ rankingChanges, vitalsAlerts, crawlErrors, contentOps, meta });
    expect(recs.length).toBeGreaterThan(0);

    // Ensure P0 appear before others
    const order = ['P0','P1','P2','P3'];
    for (let i = 1; i < recs.length; i++) {
      expect(order.indexOf(recs[i-1].priority)).toBeLessThanOrEqual(order.indexOf(recs[i].priority));
    }

    // Contains specific categories
    expect(recs.find(r => r.category === 'vitals')).toBeTruthy();
    expect(recs.find(r => r.category === 'crawl')).toBeTruthy();
    expect(recs.find(r => r.category === 'rankings')).toBeTruthy();
    expect(recs.find(r => r.category === 'content')).toBeTruthy();
  });
});

