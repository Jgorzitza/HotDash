import { describe, it, expect } from 'vitest';
import { getRealtimeMetrics } from '../realtime.ts';

describe('realtime analytics (fallback)', () => {
  it('returns a plausible fallback payload when GA is not configured', async () => {
    const prevGa = process.env.GA_PROPERTY_ID;
    const prevCred = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GA_PROPERTY_ID;
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

    const out = await getRealtimeMetrics();

    expect(out.activeUsers).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(out.topPages)).toBe(true);
    expect(out.generatedAt).toMatch(/T/);

    // restore env
    if (prevGa) process.env.GA_PROPERTY_ID = prevGa;
    if (prevCred) process.env.GOOGLE_APPLICATION_CREDENTIALS = prevCred;
  });
});

