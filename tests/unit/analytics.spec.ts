import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  setActionKey,
  clearActionKey,
  getCurrentActionKey,
  isActionKeyExpired,
} from '../../app/utils/analytics';

describe('Analytics Utility - Action Key Management', () => {
  beforeEach(() => {
    // Clear session storage before each test
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  });

  afterEach(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  });

  describe('setActionKey', () => {
    it('stores action key in session storage', () => {
      setActionKey('seo-fix-powder-board-2025-10-21');
      
      expect(sessionStorage.getItem('hd_current_action')).toBe('seo-fix-powder-board-2025-10-21');
      expect(sessionStorage.getItem('hd_action_timestamp')).toBeTruthy();
    });

    it('stores timestamp when setting action key', () => {
      const before = Date.now();
      setActionKey('test-action');
      const after = Date.now();
      
      const timestamp = parseInt(sessionStorage.getItem('hd_action_timestamp') || '0', 10);
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('getCurrentActionKey', () => {
    it('retrieves action key from session storage', () => {
      sessionStorage.setItem('hd_current_action', 'test-action-key');
      
      const key = getCurrentActionKey();
      
      expect(key).toBe('test-action-key');
    });

    it('returns null when no action key is set', () => {
      const key = getCurrentActionKey();
      
      expect(key).toBeNull();
    });
  });

  describe('clearActionKey', () => {
    it('removes action key and timestamp from session storage', () => {
      sessionStorage.setItem('hd_current_action', 'test-key');
      sessionStorage.setItem('hd_action_timestamp', Date.now().toString());
      
      clearActionKey();
      
      expect(sessionStorage.getItem('hd_current_action')).toBeNull();
      expect(sessionStorage.getItem('hd_action_timestamp')).toBeNull();
    });
  });

  describe('isActionKeyExpired', () => {
    it('returns true for expired action keys (>24 hours)', () => {
      const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      sessionStorage.setItem('hd_action_timestamp', oldTimestamp.toString());
      
      const expired = isActionKeyExpired();
      
      expect(expired).toBe(true);
    });

    it('returns false for valid action keys (<24 hours)', () => {
      const recentTimestamp = Date.now() - (1 * 60 * 60 * 1000); // 1 hour ago
      sessionStorage.setItem('hd_action_timestamp', recentTimestamp.toString());
      
      const expired = isActionKeyExpired();
      
      expect(expired).toBe(false);
    });

    it('returns true when no timestamp is set', () => {
      const expired = isActionKeyExpired();
      
      expect(expired).toBe(true);
    });
  });

  describe('Action Key Lifecycle', () => {
    it('completes full lifecycle: set → get → check expiry → clear', () => {
      // Set action key
      setActionKey('lifecycle-test-key');
      expect(getCurrentActionKey()).toBe('lifecycle-test-key');
      
      // Check not expired
      expect(isActionKeyExpired()).toBe(false);
      
      // Clear
      clearActionKey();
      expect(getCurrentActionKey()).toBeNull();
    });

    it('handles expiration correctly', () => {
      // Set action key with old timestamp
      sessionStorage.setItem('hd_current_action', 'expired-key');
      sessionStorage.setItem('hd_action_timestamp', '0'); // Very old
      
      expect(isActionKeyExpired()).toBe(true);
      expect(getCurrentActionKey()).toBe('expired-key'); // Still returns key, but isExpired = true
    });
  });
});
