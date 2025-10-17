/**
 * Tests for validation utilities
 */

import { describe, it, expect } from "vitest";
import {
  isValidEmail,
  isValidShopifyGid,
  extractIdFromGid,
  isValidUrl,
  sanitizeInput,
  isPositiveNumber,
  isInteger,
  clamp,
} from "../../app/utils/validation.server";

describe("validation utilities", () => {
  describe("isValidEmail", () => {
    it("should validate correct emails", () => {
      expect(isValidEmail("test@example.com")).toBe(true);
      expect(isValidEmail("user+tag@domain.co.uk")).toBe(true);
      expect(isValidEmail("first.last@company.com")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("test@")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });

  describe("isValidShopifyGid", () => {
    it("should validate correct GIDs", () => {
      expect(isValidShopifyGid("gid://shopify/Order/123456789")).toBe(true);
      expect(isValidShopifyGid("gid://shopify/Product/987654321")).toBe(true);
    });

    it("should reject invalid GIDs", () => {
      expect(isValidShopifyGid("not-a-gid")).toBe(false);
      expect(isValidShopifyGid("gid://shopify/Order/")).toBe(false);
      expect(isValidShopifyGid("gid://shopify//123")).toBe(false);
    });

    it("should validate resource type", () => {
      expect(isValidShopifyGid("gid://shopify/Order/123", "Order")).toBe(true);
      expect(isValidShopifyGid("gid://shopify/Order/123", "Product")).toBe(
        false,
      );
    });
  });

  describe("extractIdFromGid", () => {
    it("should extract numeric ID from GID", () => {
      expect(extractIdFromGid("gid://shopify/Order/123456789")).toBe(
        "123456789",
      );
      expect(extractIdFromGid("gid://shopify/Product/987654321")).toBe(
        "987654321",
      );
    });

    it("should return null for invalid GID", () => {
      expect(extractIdFromGid("not-a-gid")).toBeNull();
      expect(extractIdFromGid("gid://shopify/Order/")).toBeNull();
    });
  });

  describe("isValidUrl", () => {
    it("should validate correct URLs", () => {
      expect(isValidUrl("https://example.com")).toBe(true);
      expect(isValidUrl("http://example.com/path")).toBe(true);
      expect(isValidUrl("https://example.com:8080/path?query=value")).toBe(
        true,
      );
    });

    it("should reject invalid URLs", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("example.com")).toBe(false);
      expect(isValidUrl("")).toBe(false);
    });
  });

  describe("sanitizeInput", () => {
    it("should remove angle brackets", () => {
      expect(sanitizeInput("Hello <script>")).toBe("Hello script");
      expect(sanitizeInput("<div>content</div>")).toBe("divcontent/div");
    });

    it("should trim whitespace", () => {
      expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("should handle clean input", () => {
      expect(sanitizeInput("Hello World")).toBe("Hello World");
    });
  });

  describe("isPositiveNumber", () => {
    it("should validate positive numbers", () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(100.5)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
    });

    it("should reject non-positive numbers", () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(NaN)).toBe(false);
      expect(isPositiveNumber(Infinity)).toBe(false);
    });

    it("should reject non-numbers", () => {
      expect(isPositiveNumber("5")).toBe(false);
      expect(isPositiveNumber(null)).toBe(false);
      expect(isPositiveNumber(undefined)).toBe(false);
    });
  });

  describe("isInteger", () => {
    it("should validate integers", () => {
      expect(isInteger(1)).toBe(true);
      expect(isInteger(0)).toBe(true);
      expect(isInteger(-5)).toBe(true);
    });

    it("should reject non-integers", () => {
      expect(isInteger(1.5)).toBe(false);
      expect(isInteger(NaN)).toBe(false);
      expect(isInteger("5")).toBe(false);
    });
  });

  describe("clamp", () => {
    it("should clamp values within range", () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });

    it("should handle boundary values", () => {
      expect(clamp(0, 0, 10)).toBe(0);
      expect(clamp(10, 0, 10)).toBe(10);
    });
  });
});
