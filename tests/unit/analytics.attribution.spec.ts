import { describe, it, expect } from 'vitest';
import { attribute, normalizeCredits, type Touchpoint } from '../../app/lib/analytics/attribution.ts';

describe('analytics.attribution', () => {
  const now = Date.now();
  const touches: Touchpoint[] = [
    { source: 'google / cpc', timestamp: now - 3 * 24 * 60 * 60 * 1000 },
    { source: 'email', timestamp: now - 2 * 24 * 60 * 60 * 1000 },
    { source: 'direct', timestamp: now - 1 * 24 * 60 * 60 * 1000 },
  ];

  it('last_click assigns 100% to most recent', () => {
    const credits = attribute(touches, 'last_click');
    const norm = normalizeCredits(credits, 3);
    expect(norm['direct']).toBeCloseTo(1.0, 3);
  });

  it('linear splits equally', () => {
    const credits = attribute(touches, 'linear');
    const norm = normalizeCredits(credits, 3);
    expect(norm['google / cpc']).toBeCloseTo(1 / 3, 3);
    expect(norm['email']).toBeCloseTo(1 / 3, 3);
    expect(norm['direct']).toBeCloseTo(1 / 3, 3);
  });
});

