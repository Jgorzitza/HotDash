/**
 * Negative Tests for /validate Endpoint
 * 
 * Tests error paths and edge cases for the validation endpoint
 * Task 2 from 2025-10-16 direction
 * 
 * @see docs/directions/qa.md
 */

import { describe, it, expect } from 'vitest';

describe('/validate Endpoint - Negative Tests', () => {
  describe('Missing Required Fields', () => {
    it('should return 400 when evidence is missing', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          // evidence missing
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('message');
      expect(data.error.message).toContain('evidence');
    });

    it('should return 400 when projected_impact is missing', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          // projected_impact missing
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('projected_impact');
    });

    it('should return 400 when risks is missing', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'Test impact',
          // risks missing
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('risks');
    });

    it('should return 400 when rollback_plan is missing', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: 'Low risk'
          // rollback_plan missing
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('rollback_plan');
    });

    it('should return 400 when kind is missing', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // kind missing
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('kind');
    });
  });

  describe('Invalid Field Types', () => {
    it('should return 400 when evidence is not an object', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: 'not an object',
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('evidence');
      expect(data.error.message).toContain('object');
    });

    it('should return 400 when kind is not a string', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 123,
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('kind');
      expect(data.error.message).toContain('string');
    });

    it('should return 400 when projected_impact is not a string', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 123,
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Invalid Field Values', () => {
    it('should return 400 when kind is invalid', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'invalid_kind',
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('kind');
      expect(data.error.message).toMatch(/cx_reply|inventory_po|growth_post/);
    });

    it('should return 400 when evidence is empty object', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: {},
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('evidence');
      expect(data.error.message).toContain('empty');
    });

    it('should return 400 when projected_impact is empty string', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: '',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('projected_impact');
      expect(data.error.message).toContain('empty');
    });

    it('should return 400 when risks is empty string', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: '',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 when rollback_plan is empty string', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: ''
        })
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('Malformed Requests', () => {
    it('should return 400 when body is not JSON', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not json'
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('JSON');
    });

    it('should return 400 when body is empty', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: ''
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 when Content-Type is missing', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect([400, 415]).toContain(response.status);
    });
  });

  describe('Edge Cases', () => {
    it('should return 400 when evidence contains null values', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { key: null },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 when evidence contains undefined values', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { key: undefined },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
    });

    it('should return 400 when projected_impact is too short', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'x',
          risks: 'Low risk',
          rollback_plan: 'Revert'
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error.message).toContain('projected_impact');
      expect(data.error.message).toMatch(/length|characters/i);
    });

    it('should return 400 when rollback_plan is too short', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind: 'cx_reply',
          evidence: { test: true },
          projected_impact: 'Test impact',
          risks: 'Low risk',
          rollback_plan: 'x'
        })
      });
      
      expect(response.status).toBe(400);
    });
  });

  describe('HTTP Method Validation', () => {
    it('should return 405 for GET requests', async () => {
      const response = await fetch('http://localhost:3000/api/validate');
      
      expect(response.status).toBe(405);
      
      const data = await response.json();
      expect(data.error.message).toContain('POST');
    });

    it('should return 405 for PUT requests', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      expect(response.status).toBe(405);
    });

    it('should return 405 for DELETE requests', async () => {
      const response = await fetch('http://localhost:3000/api/validate', {
        method: 'DELETE'
      });
      
      expect(response.status).toBe(405);
    });
  });
});

