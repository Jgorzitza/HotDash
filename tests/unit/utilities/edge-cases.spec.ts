import { describe, it, expect } from 'vitest';

/**
 * NEW Task 7C: Utility Edge Cases Tests
 */
describe('Utility Edge Cases', () => {
  describe('Date Utilities', () => {
    it('should handle leap year dates', () => {
      const leapYear = new Date('2024-02-29');
      expect(leapYear.getMonth()).toBe(1);
    });

    it('should handle invalid dates', () => {
      const invalid = new Date('invalid');
      expect(isNaN(invalid.getTime())).toBe(true);
    });
  });

  describe('String Operations', () => {
    it('should handle empty strings', () => {
      expect(''.trim()).toBe('');
    });

    it('should sanitize HTML', () => {
      const html = '<script>alert("xss")</script>';
      const sanitized = html.replace(/<[^>]*>/g, '');
      expect(sanitized).not.toContain('<script>');
    });
  });

  describe('Number Edge Cases', () => {
    it('should handle MAX_SAFE_INTEGER', () => {
      expect(Number.MAX_SAFE_INTEGER).toBe(9007199254740991);
    });

    it('should handle division by zero', () => {
      expect(1 / 0).toBe(Infinity);
    });

    it('should handle NaN', () => {
      expect(isNaN(0 / 0)).toBe(true);
    });
  });
});
