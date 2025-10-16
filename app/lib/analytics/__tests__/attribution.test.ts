import { describe, it, expect } from 'vitest';
import { attribute, normalizeCredits, type Touchpoint } from '../attribution.ts';

describe('attribution modeling', () => {
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

  it('first_click assigns 100% to first', () => {
    const credits = attribute(touches, 'first_click');
    const norm = normalizeCredits(credits, 3);
    expect(norm['google / cpc']).toBeCloseTo(1.0, 3);
  });

  it('linear splits equally', () => {
    const credits = attribute(touches, 'linear');
    const norm = normalizeCredits(credits, 3);
    expect(norm['google / cpc']).toBeCloseTo(1 / 3, 3);
    expect(norm['email']).toBeCloseTo(1 / 3, 3);
    expect(norm['direct']).toBeCloseTo(1 / 3, 3);
  });

  it('time_decay favors later touches (sum≈1)', () => {
    const credits = attribute(touches, 'time_decay', { decayHalfLife: 2 * 24 * 60 * 60 * 1000 });
    const norm = normalizeCredits(credits, 3);
    expect(norm['direct']).toBeGreaterThan(norm['email']);
    expect(norm['email']).toBeGreaterThan(norm['google / cpc']);
    const sum = Object.values(norm).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 2);
  });
});

