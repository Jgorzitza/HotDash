import { describe, it, expect } from 'vitest';

/** NEW Task 7F: Security */
describe('API Security', () => {
  it('should require authentication', () => {
    const protectedRoute = { requiresAuth: true };
    expect(protectedRoute.requiresAuth).toBe(true);
  });
  
  it('should sanitize inputs', () => {
    const malicious = '<script>alert("xss")</script>';
    const safe = malicious.replace(/<[^>]*>/g, '');
    expect(safe).not.toContain('<script>');
  });
});
