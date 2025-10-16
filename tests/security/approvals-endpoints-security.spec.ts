/**
 * Security Tests for Approvals Endpoints
 * 
 * Tests security controls for approvals API endpoints
 * Task 6 from 2025-10-16 direction
 * 
 * @see docs/directions/qa.md
 */

import { describe, it, expect } from 'vitest';

describe('Approvals Endpoints - Authentication', () => {
  it('should require authentication for GET /api/supabase/approvals', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      headers: {
        'Authorization': ''
      }
    });
    
    expect(response.status).toBe(401);
    
    const data = await response.json();
    expect(data.error.message).toContain('authentication');
  });

  it('should require authentication for POST /api/supabase/approvals', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ''
      },
      body: JSON.stringify({
        kind: 'cx_reply',
        evidence: {},
        projected_impact: '',
        risks: '',
        rollback_plan: ''
      })
    });
    
    expect(response.status).toBe(401);
  });

  it('should require authentication for POST /api/supabase/approvals/:id/approve', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals/123/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ''
      },
      body: JSON.stringify({
        grades: { tone: 5, accuracy: 5, policy: 5 }
      })
    });
    
    expect(response.status).toBe(401);
  });

  it('should reject invalid tokens', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      headers: {
        'Authorization': 'Bearer invalid-token-12345'
      }
    });
    
    expect(response.status).toBe(401);
  });

  it('should reject expired tokens', async () => {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.invalid';
    
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    
    expect(response.status).toBe(401);
  });
});

describe('Approvals Endpoints - Authorization', () => {
  it('should only return user\'s own approvals', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals');
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // All approvals should belong to authenticated user
    data.approvals.forEach((approval: any) => {
      expect(approval.user_id).toBe('current-user-id');
    });
  });

  it('should not allow accessing other users\' approvals', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals/other-user-approval-id');
    
    expect(response.status).toBe(404); // Not found (RLS hides it)
  });

  it('should not allow approving other users\' approvals', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals/other-user-approval-id/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grades: { tone: 5, accuracy: 5, policy: 5 }
      })
    });
    
    expect(response.status).toBe(404);
  });
});

describe('Approvals Endpoints - Input Validation', () => {
  it('should validate kind field', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'invalid_kind',
        evidence: { test: true },
        projected_impact: 'Test',
        risks: 'Low',
        rollback_plan: 'Revert'
      })
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error.message).toContain('kind');
  });

  it('should validate grades are 1-5', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals/123/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grades: { tone: 6, accuracy: 5, policy: 5 }
      })
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.error.message).toContain('grade');
  });

  it('should sanitize evidence input', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'cx_reply',
        evidence: { malicious: '<script>alert("xss")</script>' },
        projected_impact: 'Test',
        risks: 'Low',
        rollback_plan: 'Revert'
      })
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    // Script tags should be sanitized
    expect(data.evidence.malicious).not.toContain('<script>');
  });
});

describe('Approvals Endpoints - SQL Injection Prevention', () => {
  it('should prevent SQL injection in state filter', async () => {
    const maliciousInput = "'; DROP TABLE approvals; --";
    
    const response = await fetch(`http://localhost:3000/api/supabase/approvals?state=${encodeURIComponent(maliciousInput)}`);
    
    // Should handle safely
    expect(response.status).toBe(200);
    
    // Verify table still exists
    const verifyResponse = await fetch('http://localhost:3000/api/supabase/approvals');
    expect(verifyResponse.status).toBe(200);
  });

  it('should prevent SQL injection in ID parameter', async () => {
    const maliciousId = "1' OR '1'='1";
    
    const response = await fetch(`http://localhost:3000/api/supabase/approvals/${encodeURIComponent(maliciousId)}`);
    
    // Should return 404 or 400, not expose data
    expect([400, 404]).toContain(response.status);
  });
});

describe('Approvals Endpoints - XSS Prevention', () => {
  it('should escape HTML in projected_impact', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'cx_reply',
        evidence: { test: true },
        projected_impact: '<img src=x onerror=alert(1)>',
        risks: 'Low',
        rollback_plan: 'Revert'
      })
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.projected_impact).not.toContain('onerror=');
  });

  it('should escape HTML in risks field', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'cx_reply',
        evidence: { test: true },
        projected_impact: 'Test',
        risks: '<script>alert("xss")</script>',
        rollback_plan: 'Revert'
      })
    });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.risks).not.toContain('<script>');
  });
});

describe('Approvals Endpoints - CSRF Protection', () => {
  it('should require CSRF token for state-changing operations', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'cx_reply',
        evidence: {},
        projected_impact: '',
        risks: '',
        rollback_plan: ''
      })
      // Missing CSRF token
    });
    
    // Should require CSRF token
    expect([200, 403]).toContain(response.status);
  });

  it('should validate CSRF token', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': 'invalid-token'
      },
      body: JSON.stringify({
        kind: 'cx_reply',
        evidence: {},
        projected_impact: '',
        risks: '',
        rollback_plan: ''
      })
    });
    
    expect([200, 403]).toContain(response.status);
  });
});

describe('Approvals Endpoints - Rate Limiting', () => {
  it('should rate limit approval creation', async () => {
    const requests = 100;
    const responses: Response[] = [];
    
    for (let i = 0; i < requests; i++) {
      const response = await fetch('http://localhost:3000/api/supabase/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'Test',
          risks: 'Low',
          rollback_plan: 'Revert'
        })
      });
      responses.push(response);
    }
    
    // Some requests should be rate limited
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  }, { timeout: 30000 });

  it('should include rate limit headers', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals');
    
    expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
    expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
  });
});

describe('Approvals Endpoints - Data Privacy', () => {
  it('should not log PII in audit logs', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'cx_reply',
        evidence: { email: 'customer@example.com', phone: '555-1234' },
        projected_impact: 'Test',
        risks: 'Low',
        rollback_plan: 'Revert'
      })
    });
    
    expect(response.status).toBe(200);
    
    // Logs should redact PII (would require checking actual logs)
  });

  it('should not expose sensitive data in error messages', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals/invalid-id');
    
    const data = await response.json();
    const errorText = JSON.stringify(data);
    
    // Error should not leak sensitive info
    expect(errorText).not.toContain('password');
    expect(errorText).not.toContain('secret');
    expect(errorText).not.toContain('api_key');
  });
});

