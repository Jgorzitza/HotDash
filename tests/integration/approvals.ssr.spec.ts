import { test, expect } from '@playwright/test';

// Ensures that the /approvals route renders on the server without throwing
// MissingAppProviderError or similar SSR issues.

test.describe('Approvals SSR', () => {
  test('renders /approvals without SSR errors', async ({ request }) => {
    const res = await request.get('/approvals');
    expect(res.ok()).toBeTruthy();
    const html = await res.text();
    // Basic sanity: contains root HTML structure
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    // Ensure no common SSR error markers
    expect(html).not.toMatch(/MissingAppProviderError|ReferenceError|TypeError/);
  });
});
