/**
 * Tests for date utilities
 */

import { describe, it, expect } from 'vitest';
import {
  toISODate,
  daysAgo,
  getDateRange,
  parseISODate,
  isValidDate,
  formatDisplayDate,
  getRelativeTime,
} from '../../app/utils/date.server';

describe('date utilities', () => {
  describe('toISODate', () => {
    it('should format date as ISO date string', () => {
      const date = new Date('2025-10-11T12:00:00Z');
      expect(toISODate(date)).toBe('2025-10-11');
    });
  });

  describe('daysAgo', () => {
    it('should return date N days ago', () => {
      const result = daysAgo(7);
      const expected = new Date();
      expected.setUTCDate(expected.getUTCDate() - 7);
      
      expect(toISODate(result)).toBe(toISODate(expected));
    });
  });

  describe('getDateRange', () => {
    it('should return date range for last N days', () => {
      const range = getDateRange(7);
      
      expect(range.start).toBeDefined();
      expect(range.end).toBeDefined();
      expect(range.start < range.end).toBe(true);
    });
  });

  describe('parseISODate', () => {
    it('should parse ISO date string', () => {
      const date = parseISODate('2025-10-11');
      expect(date).toBeInstanceOf(Date);
      expect(date.getFullYear()).toBe(2025);
      expect(date.getMonth()).toBe(9); // October (0-indexed)
      expect(date.getDate()).toBe(11);
    });
  });

  describe('isValidDate', () => {
    it('should validate Date objects', () => {
      expect(isValidDate(new Date())).toBe(true);
      expect(isValidDate(new Date('2025-10-11'))).toBe(true);
    });

    it('should reject invalid dates', () => {
      expect(isValidDate(new Date('invalid'))).toBe(false);
      expect(isValidDate('2025-10-11')).toBe(false);
      expect(isValidDate(null)).toBe(false);
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  describe('formatDisplayDate', () => {
    it('should format date for display', () => {
      const date = new Date('2025-10-11T12:00:00Z');
      const formatted = formatDisplayDate(date);
      expect(formatted).toContain('Oct');
      expect(formatted).toContain('2025');
    });
  });

  describe('getRelativeTime', () => {
    it('should return "just now" for very recent dates', () => {
      const date = new Date(Date.now() - 1000); // 1 second ago
      expect(getRelativeTime(date)).toBe('just now');
    });

    it('should return minutes for recent dates', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
      expect(getRelativeTime(date)).toBe('5 minutes ago');
    });

    it('should return hours for dates within 24 hours', () => {
      const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      expect(getRelativeTime(date)).toBe('3 hours ago');
    });

    it('should return days for older dates', () => {
      const date = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      expect(getRelativeTime(date)).toBe('5 days ago');
    });
  });
});

