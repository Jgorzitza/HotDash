/**
 * Action API Route Tests (TDD)
 * Growth Spec Requirements: B2-B4
 */

import { describe, it, expect } from 'vitest';

// @ts-expect-error - TDD: Routes don't exist yet
import { loader as actionsLoader, action as actionsAction } from '../api.actions';

describe('Action API Routes', () => {
  describe('POST /api/actions', () => {
    it('creates action with valid payload', async () => {
      const request = new Request('http://localhost/api/actions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'seo_ctr_fix',
          payload: { pageId: 'page_123' },
          merchantId: 'merchant_123',
        }),
      });

      const response = await actionsAction({ request, params: {}, context: {} });

      expect(response.status).toBe(201);
    });

    it('validates action type', async () => {
      const request = new Request('http://localhost/api/actions', {
        method: 'POST',
        body: JSON.stringify({
          type: 'invalid_type',
          payload: {},
          merchantId: 'merchant_123',
        }),
      });

      const response = await actionsAction({ request, params: {}, context: {} });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/actions', () => {
    it('returns paginated list', async () => {
      const request = new Request('http://localhost/api/actions?limit=20');

      const response = await actionsLoader({ request, params: {}, context: {} });

      expect(response.status).toBe(200);
    });

    it('filters by status', async () => {
      const request = new Request('http://localhost/api/actions?status=pending');

      const response = await actionsLoader({ request, params: {}, context: {} });
      const data = await response.json();

      data.actions.forEach((action: any) => {
        expect(action.status).toBe('pending');
      });
    });
  });
});

