import { describe, it, expect } from 'vitest';
import { recordEvent, summarizeByName, lastN } from '../../app/lib/analytics/events.ts';

describe('analytics.events (in-memory)', () => {
  it('records and summarizes custom events', () => {
    recordEvent({ name: 'click', properties: { id: 'save' } });
    recordEvent({ name: 'click', properties: { id: 'cancel' } });
    recordEvent({ name: 'view', properties: { path: '/' } });

    const counts = summarizeByName();
    expect(counts.click).toBeGreaterThanOrEqual(2);
    expect(counts.view).toBeGreaterThanOrEqual(1);

    const recent = lastN(2);
    expect(recent.length).toBe(2);
  });
});

