/**
 * Integration Tests: API Routes
 * 
 * Tests API routes with real database and external service calls
 * Uses staging environment and fixtures
 * 
 * @see docs/specs/test_plan_template.md
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('API Routes - Shopify Integration', () => {
  describe('GET /api/shopify/revenue', () => {
    it('should return revenue data', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/revenue');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('revenue');
      expect(data).toHaveProperty('period');
      expect(typeof data.revenue).toBe('number');
    });

    it('should return data within performance budget', async () => {
      const startTime = Date.now();
      
      const response = await fetch('http://localhost:3000/api/shopify/revenue');
      
      const duration = Date.now() - startTime;
      
      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(500); // P95 < 500ms
    });

    it('should handle authentication errors', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/revenue', {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      
      expect(response.status).toBe(401);
    });

    it('should log audit trail', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/revenue');
      
      expect(response.status).toBe(200);
      
      // Verify audit log was created
      // (This would query the audit log table)
      // For now, we just verify the response includes audit metadata
      const data = await response.json();
      expect(data).toHaveProperty('_audit');
    });
  });

  describe('GET /api/shopify/aov', () => {
    it('should return AOV data', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/aov');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('aov');
      expect(data).toHaveProperty('period');
      expect(typeof data.aov).toBe('number');
      expect(data.aov).toBeGreaterThanOrEqual(0);
    });

    it('should handle zero orders gracefully', async () => {
      // This would use a fixture with zero orders
      const response = await fetch('http://localhost:3000/api/shopify/aov?period=empty');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.aov).toBe(0);
    });
  });

  describe('GET /api/shopify/returns', () => {
    it('should return returns data', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/returns');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('rate');
      expect(typeof data.count).toBe('number');
      expect(typeof data.rate).toBe('number');
    });

    it('should calculate return rate correctly', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/returns');
      
      const data = await response.json();
      
      // Return rate should be between 0 and 1
      expect(data.rate).toBeGreaterThanOrEqual(0);
      expect(data.rate).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/shopify/stock', () => {
    it('should return stock risk data', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/stock');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('lowStock');
      expect(data).toHaveProperty('outOfStock');
      expect(data).toHaveProperty('urgentReorder');
      expect(Array.isArray(data.lowStock)).toBe(true);
    });

    it('should categorize stock levels correctly', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/stock');
      
      const data = await response.json();
      
      // Each category should have count and items
      expect(data.lowStock).toHaveProperty('count');
      expect(data.lowStock).toHaveProperty('items');
      expect(data.outOfStock).toHaveProperty('count');
      expect(data.urgentReorder).toHaveProperty('count');
    });
  });
});

describe('API Routes - Supabase Integration', () => {
  describe('GET /api/supabase/approvals', () => {
    it('should return approvals list', async () => {
      const response = await fetch('http://localhost:3000/api/supabase/approvals');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.approvals)).toBe(true);
    });

    it('should filter by state', async () => {
      const response = await fetch('http://localhost:3000/api/supabase/approvals?state=pending_review');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(Array.isArray(data.approvals)).toBe(true);
      
      // All approvals should have state=pending_review
      data.approvals.forEach((approval: any) => {
        expect(approval.state).toBe('pending_review');
      });
    });

    it('should support pagination', async () => {
      const response = await fetch('http://localhost:3000/api/supabase/approvals?limit=5');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.approvals.length).toBeLessThanOrEqual(5);
      expect(data).toHaveProperty('cursor');
    });

    it('should enforce RLS policies', async () => {
      // Attempt to access without authentication
      const response = await fetch('http://localhost:3000/api/supabase/approvals', {
        headers: {
          'Authorization': ''
        }
      });
      
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/supabase/approvals/:id/approve', () => {
    it('should approve an approval', async () => {
      // First create a test approval
      const createResponse = await fetch('http://localhost:3000/api/supabase/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      const created = await createResponse.json();
      
      // Now approve it
      const response = await fetch(`http://localhost:3000/api/supabase/approvals/${created.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: { tone: 5, accuracy: 5, policy: 5 }
        })
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.state).toBe('approved');
    });

    it('should capture grading data', async () => {
      // Create and approve with grades
      const createResponse = await fetch('http://localhost:3000/api/supabase/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: {},
          projected_impact: '',
          risks: '',
          rollback_plan: ''
        })
      });
      
      const created = await createResponse.json();
      
      const response = await fetch(`http://localhost:3000/api/supabase/approvals/${created.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grades: { tone: 4, accuracy: 5, policy: 5 }
        })
      });
      
      const data = await response.json();
      expect(data.grades).toEqual({ tone: 4, accuracy: 5, policy: 5 });
    });
  });
});

describe('API Routes - Error Handling', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await fetch('http://localhost:3000/api/unknown/route');
    
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid input', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing required fields
        kind: 'invalid'
      })
    });
    
    expect(response.status).toBe(400);
  });

  it('should return 500 for server errors', async () => {
    // This would trigger a server error condition
    // For example, database connection failure
    // Implementation depends on how errors are simulated
  });

  it('should include error details in response', async () => {
    const response = await fetch('http://localhost:3000/api/supabase/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('message');
  });
});

describe('API Routes - Performance', () => {
  it('should handle concurrent requests', async () => {
    const requests = Array(10).fill(null).map(() =>
      fetch('http://localhost:3000/api/shopify/revenue')
    );
    
    const responses = await Promise.all(requests);
    
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });

  it('should cache responses appropriately', async () => {
    const response1 = await fetch('http://localhost:3000/api/shopify/revenue');
    const data1 = await response1.json();
    
    // Second request should be cached (within 5 minutes)
    const response2 = await fetch('http://localhost:3000/api/shopify/revenue');
    const data2 = await response2.json();
    
    // Should return same data (cached)
    expect(data1).toEqual(data2);
  });
});

