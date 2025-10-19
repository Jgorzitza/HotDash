import { test, expect } from '@playwright/test';

test.describe('Analytics API (feature-flagged)', () => {
  test('returns sample payload when flag disabled', async ({ request }) => {
    const res = await request.get('/api/analytics/traffic');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.success).toBeTruthy();
    expect(body.mode).toBe('sample');
    expect(body.data).toHaveProperty('sessions');
    expect(body.data).toHaveProperty('users');
  });
});

