import { describe, it, expect } from 'vitest';
import { summarizeCompetitors, findKeywordGaps } from '../../app/services/seo/competitors';
import type { KeywordRanking } from '../../app/lib/seo/rankings';

describe('SEO Competitor Analysis', () => {
  const our: KeywordRanking[] = [
    { keyword: 'hot rods', url: '/p1', position: 5, device: 'mobile', country: 'US', clicks: 50, impressions: 1000, ctr: 0.05, date: '2025-10-15' },
    { keyword: 'vintage cars', url: '/p2', position: 12, device: 'mobile', country: 'US', clicks: 20, impressions: 400, ctr: 0.05, date: '2025-10-15' },
  ];
  const comp = {
    name: 'comp.com',
    rankings: [
      { keyword: 'hot rods', url: '/c1', position: 3, device: 'mobile', country: 'US', clicks: 60, impressions: 1100, ctr: 0.054, date: '2025-10-15' },
      { keyword: 'classic cars', url: '/c2', position: 9, device: 'mobile', country: 'US', clicks: 25, impressions: 500, ctr: 0.05, date: '2025-10-15' },
    ] as KeywordRanking[],
  };

  it('summarizes visibility and gaps', () => {
    const { visibility, insights } = summarizeCompetitors(our, [comp]);
    expect(visibility.length).toBeGreaterThan(0);
    expect(insights.find(i => i.keyword === 'hot rods' && i.type === 'opportunity')).toBeTruthy();
    expect(insights.find(i => i.keyword === 'classic cars' && i.type === 'opportunity')).toBeTruthy();
  });

  it('detects risks when competitor trails far behind', () => {
    const competitor = {
      name: 'comp2',
      rankings: [ { keyword: 'vintage cars', url: '/c3', position: 30, device: 'mobile', country: 'US', clicks: 5, impressions: 100, ctr: 0.05, date: '2025-10-15' } ] as KeywordRanking[],
    };
    const gaps = findKeywordGaps(our, [competitor]);
    // Our 12 vs competitor 30 => negative gap (we are ahead), risk only for big negative gaps; none expected here
    expect(gaps.find(i => i.type === 'risk')).toBeFalsy();
  });
});

