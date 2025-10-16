/**
 * Integration Tests for Integrations API Contracts
 * 
 * Tests API contracts for all integration endpoints
 * Task 4 from 2025-10-16 direction
 * 
 * @see docs/directions/qa.md
 */

import { describe, it, expect } from 'vitest';

describe('Integrations API Contracts - Shopify', () => {
  describe('GET /api/shopify/revenue', () => {
    it('should match contract schema', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/revenue');
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('application/json');
      
      const data = await response.json();
      
      // Contract: { revenue: number, period: string, trend: object, _audit: object }
      expect(data).toHaveProperty('revenue');
      expect(typeof data.revenue).toBe('number');
      
      expect(data).toHaveProperty('period');
      expect(typeof data.period).toBe('string');
      
      expect(data).toHaveProperty('trend');
      expect(data.trend).toHaveProperty('direction');
      expect(data.trend).toHaveProperty('value');
      expect(['up', 'down', 'flat']).toContain(data.trend.direction);
      
      expect(data).toHaveProperty('_audit');
      expect(data._audit).toHaveProperty('timestamp');
    });

    it('should include metadata', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/revenue');
      const data = await response.json();
      
      expect(data).toHaveProperty('_meta');
      expect(data._meta).toHaveProperty('queryTime');
      expect(data._meta).toHaveProperty('cached');
    });
  });

  describe('GET /api/shopify/aov', () => {
    it('should match contract schema', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/aov');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Contract: { aov: number, orderCount: number, period: string, trend: object }
      expect(data).toHaveProperty('aov');
      expect(typeof data.aov).toBe('number');
      expect(data.aov).toBeGreaterThanOrEqual(0);
      
      expect(data).toHaveProperty('orderCount');
      expect(typeof data.orderCount).toBe('number');
      expect(data.orderCount).toBeGreaterThanOrEqual(0);
      
      expect(data).toHaveProperty('period');
      expect(data).toHaveProperty('trend');
    });
  });

  describe('GET /api/shopify/returns', () => {
    it('should match contract schema', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/returns');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Contract: { count: number, rate: number, reasons: array, period: string }
      expect(data).toHaveProperty('count');
      expect(typeof data.count).toBe('number');
      
      expect(data).toHaveProperty('rate');
      expect(typeof data.rate).toBe('number');
      expect(data.rate).toBeGreaterThanOrEqual(0);
      expect(data.rate).toBeLessThanOrEqual(1);
      
      expect(data).toHaveProperty('reasons');
      expect(Array.isArray(data.reasons)).toBe(true);
      
      if (data.reasons.length > 0) {
        expect(data.reasons[0]).toHaveProperty('reason');
        expect(data.reasons[0]).toHaveProperty('count');
      }
    });
  });

  describe('GET /api/shopify/stock', () => {
    it('should match contract schema', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/stock');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Contract: { lowStock: object, outOfStock: object, urgentReorder: object }
      expect(data).toHaveProperty('lowStock');
      expect(data.lowStock).toHaveProperty('count');
      expect(data.lowStock).toHaveProperty('items');
      expect(Array.isArray(data.lowStock.items)).toBe(true);
      
      expect(data).toHaveProperty('outOfStock');
      expect(data.outOfStock).toHaveProperty('count');
      expect(data.outOfStock).toHaveProperty('items');
      
      expect(data).toHaveProperty('urgentReorder');
      expect(data.urgentReorder).toHaveProperty('count');
      expect(data.urgentReorder).toHaveProperty('items');
    });

    it('should include product details in items', async () => {
      const response = await fetch('http://localhost:3000/api/shopify/stock');
      const data = await response.json();
      
      if (data.lowStock.items.length > 0) {
        const item = data.lowStock.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('reorderPoint');
      }
    });
  });
});

describe('Integrations API Contracts - Supabase', () => {
  describe('GET /api/supabase/approvals', () => {
    it('should match contract schema', async () => {
      const response = await fetch('http://localhost:3000/api/supabase/approvals');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Contract: { approvals: array, cursor: string|null }
      expect(data).toHaveProperty('approvals');
      expect(Array.isArray(data.approvals)).toBe(true);
      
      expect(data).toHaveProperty('cursor');
      
      if (data.approvals.length > 0) {
        const approval = data.approvals[0];
        expect(approval).toHaveProperty('id');
        expect(approval).toHaveProperty('kind');
        expect(approval).toHaveProperty('state');
        expect(approval).toHaveProperty('evidence');
        expect(approval).toHaveProperty('projected_impact');
        expect(approval).toHaveProperty('risks');
        expect(approval).toHaveProperty('rollback_plan');
        expect(approval).toHaveProperty('created_at');
      }
    });

    it('should support pagination', async () => {
      const response = await fetch('http://localhost:3000/api/supabase/approvals?limit=5');
      const data = await response.json();
      
      expect(data.approvals.length).toBeLessThanOrEqual(5);
      
      if (data.approvals.length === 5) {
        expect(data.cursor).toBeTruthy();
      }
    });

    it('should support filtering by state', async () => {
      const response = await fetch('http://localhost:3000/api/supabase/approvals?state=pending_review');
      const data = await response.json();
      
      data.approvals.forEach((approval: any) => {
        expect(approval.state).toBe('pending_review');
      });
    });
  });

  describe('POST /api/supabase/approvals', () => {
    it('should match contract schema for creation', async () => {
      const response = await fetch('http://localhost:3000/api/supabase/approvals', {
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
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      
      // Contract: created approval object
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('kind');
      expect(data.kind).toBe('cx_reply');
      expect(data).toHaveProperty('state');
      expect(data.state).toBe('draft');
      expect(data).toHaveProperty('created_at');
    });
  });

  describe('POST /api/supabase/approvals/:id/approve', () => {
    it('should match contract schema for approval', async () => {
      // First create an approval
      const createResponse = await fetch('http://localhost:3000/api/supabase/approvals', {
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
      
      // Contract: approved approval with grades
      expect(data).toHaveProperty('id');
      expect(data.state).toBe('approved');
      expect(data).toHaveProperty('grades');
      expect(data.grades).toEqual({ tone: 5, accuracy: 5, policy: 5 });
      expect(data).toHaveProperty('approved_at');
    });
  });
});

describe('Integrations API Contracts - Analytics', () => {
  describe('GET /api/analytics/pageviews', () => {
    it('should match contract schema', async () => {
      const response = await fetch('http://localhost:3000/api/analytics/pageviews');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Contract: { pageviews: number, period: object, trend: object }
      expect(data).toHaveProperty('pageviews');
      expect(typeof data.pageviews).toBe('number');
      expect(data.pageviews).toBeGreaterThanOrEqual(0);
      
      expect(data).toHaveProperty('period');
      expect(data.period).toHaveProperty('start');
      expect(data.period).toHaveProperty('end');
      
      expect(data).toHaveProperty('trend');
    });
  });

  describe('GET /api/analytics/sessions', () => {
    it('should match contract schema', async () => {
      const response = await fetch('http://localhost:3000/api/analytics/sessions');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Contract: { sessions: number, users: number, bounceRate: number }
      expect(data).toHaveProperty('sessions');
      expect(typeof data.sessions).toBe('number');
      
      expect(data).toHaveProperty('users');
      expect(typeof data.users).toBe('number');
      
      expect(data).toHaveProperty('bounceRate');
      expect(typeof data.bounceRate).toBe('number');
      expect(data.bounceRate).toBeGreaterThanOrEqual(0);
      expect(data.bounceRate).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /api/analytics/seo/anomalies', () => {
    it('should match contract schema', async () => {
      const response = await fetch('http://localhost:3000/api/analytics/seo/anomalies');
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Contract: { anomalies: array }
      expect(data).toHaveProperty('anomalies');
      expect(Array.isArray(data.anomalies)).toBe(true);
      
      if (data.anomalies.length > 0) {
        const anomaly = data.anomalies[0];
        expect(anomaly).toHaveProperty('keyword');
        expect(anomaly).toHaveProperty('severity');
        expect(['critical', 'warning', 'info']).toContain(anomaly.severity);
        expect(anomaly).toHaveProperty('change');
        expect(anomaly).toHaveProperty('message');
      }
    });
  });
});

describe('API Contract Versioning', () => {
  it('should include API version in headers', async () => {
    const response = await fetch('http://localhost:3000/api/shopify/revenue');
    
    const apiVersion = response.headers.get('X-API-Version');
    expect(apiVersion).toBeTruthy();
    expect(apiVersion).toMatch(/v\d+/);
  });

  it('should support version negotiation', async () => {
    const response = await fetch('http://localhost:3000/api/shopify/revenue', {
      headers: {
        'Accept-Version': 'v1'
      }
    });
    
    expect(response.status).toBe(200);
  });
});

describe('API Contract Error Responses', () => {
  it('should return consistent error format', async () => {
    const response = await fetch('http://localhost:3000/api/shopify/invalid');
    
    expect(response.status).toBe(404);
    
    const data = await response.json();
    
    // Contract: { error: { message: string, code: string } }
    expect(data).toHaveProperty('error');
    expect(data.error).toHaveProperty('message');
    expect(data.error).toHaveProperty('code');
  });

  it('should include request ID in errors', async () => {
    const response = await fetch('http://localhost:3000/api/shopify/invalid');
    const data = await response.json();
    
    expect(data.error).toHaveProperty('requestId');
  });
});

