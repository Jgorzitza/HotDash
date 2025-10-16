import { describe, it, expect } from 'vitest';
import { recordEvent, summarizeByName, lastN } from '../events.ts';

describe('custom events (in-memory)', () => {
  it('records and summarizes events by name', () => {
    recordEvent({ name: 'button_click', properties: { id: 'save' } });
    recordEvent({ name: 'button_click', properties: { id: 'cancel' } });
    recordEvent({ name: 'page_view', properties: { path: '/' } });

    const counts = summarizeByName();
    expect(counts['button_click']).toBeGreaterThanOrEqual(2);
    expect(counts['page_view']).toBeGreaterThanOrEqual(1);

    const recent = lastN(2);
    expect(recent.length).toBe(2);
    expect(recent[recent.length - 1].name).toBeDefined();
  });
});

