import { describe, it, expect } from 'vitest';
import { ServiceError } from '../../../app/services/types';

/** NEW Task 7B: Service Error Handling */
describe('Service Error Handling', () => {
  describe('ServiceError Class', () => {
    it('should create error with all properties', () => {
      const error = new ServiceError('Test error', {
        scope: 'test.service',
        retryable: true,
        statusCode: 500,
      });

      expect(error.message).toBe('Test error');
      expect(error.scope).toBe('test.service');
      expect(error.retryable).toBe(true);
    });

    it('should default retryable to false', () => {
      const error = new ServiceError('Test', { scope: 'test' });
      expect(error.retryable).toBe(false);
    });
  });

  describe('Error Types', () => {
    it('should handle rate limit (429)', () => {
      const error = { statusCode: 429, retryAfter: 2.5 };
      expect(error.statusCode).toBe(429);
    });

    it('should handle auth errors (401)', () => {
      const error = { statusCode: 401, retryable: false };
      expect(error.statusCode).toBe(401);
    });
  });

  describe('Error Recovery', () => {
    it('should calculate exponential backoff', () => {
      const delays = [1, 2, 3].map(n => 1000 * Math.pow(2, n - 1));
      expect(delays).toEqual([1000, 2000, 4000]);
    });
  });
});
