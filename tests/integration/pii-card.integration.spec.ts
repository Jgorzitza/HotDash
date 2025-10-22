/**
 * Integration Tests: PII Card Service Integration
 *
 * Tests the PII Card service integration with the approval system
 * and verifies that PII data is properly handled in the operator workflow.
 *
 * Test Strategy: docs/testing/agent-sdk/test-strategy.md
 *
 * @requires PII Card service implemented
 * @requires Approval system integration
 * @requires Database seeded with test data
 */

import { describe, it, expect } from "vitest";
import { redactCustomerInfo } from "../../app/utils/pii-redaction";
import { sanitizePII } from "../../app/services/ai-knowledge/pii-sanitizer";

describe("PII Card Service Integration", () => {
  const mockCustomerData = {
    orderId: "#1234567890",
    orderStatus: "fulfilled",
    fulfillmentStatus: "shipped",
    email: "justin@hotrodan.com",
    phone: "555-123-4567",
    shippingAddress: {
      name: "Justin Case",
      address1: "123 Main St",
      address2: "Apt 4B",
      city: "Los Angeles",
      province: "CA",
      country: "USA",
      zip: "90210",
    },
    tracking: {
      carrier: "UPS",
      number: "1Z999AA10123456784",
      url: "https://www.ups.com/track?number=1Z999AA10123456784",
      lastEvent: "Delivered",
      lastEventDate: "2025-10-20T14:30:00Z",
    },
    lineItems: [
      {
        title: "Powder Board",
        sku: "PB-001",
        quantity: 1,
        price: "$299.99",
      },
      {
        title: "Wax Kit",
        sku: "WK-100",
        quantity: 2,
        price: "$19.99",
      },
    ],
  };

  describe("PII Redaction Service Integration", () => {
    it("should redact all PII types from customer data", () => {
      const redactedData = redactCustomerInfo(mockCustomerData);

      // Verify email redaction
      expect(redactedData.email).toBe("j***@h***.com");
      expect(redactedData.email).not.toContain("justin@hotrodan.com");

      // Verify phone redaction
      expect(redactedData.phone).toBe("***-***-4567");
      expect(redactedData.phone).not.toContain("555-123-4567");

      // Verify address redaction
      expect(redactedData.shippingZipPrefix).toBe("902**");
      expect(redactedData.shippingZipPrefix).not.toContain("90210");

      // Verify tracking redaction
      expect(redactedData.trackingCarrier).toBe("UPS");
      expect(redactedData.trackingLastEvent).toBe("Delivered");
    });

    it("should preserve non-PII data", () => {
      const redactedData = redactCustomerInfo(mockCustomerData);

      // Verify non-PII data is preserved
      expect(redactedData.shippingCity).toBe(mockCustomerData.shippingAddress.city);
      expect(redactedData.shippingRegion).toBe(mockCustomerData.shippingAddress.province);
      expect(redactedData.shippingCountry).toBe(mockCustomerData.shippingAddress.country);
    });

    it("should handle missing optional fields", () => {
      const dataWithoutPhone = { ...mockCustomerData, phone: undefined };
      const redactedData = redactCustomerInfo(dataWithoutPhone);

      expect(redactedData.phone).toBeUndefined();
      expect(redactedData.email).toBe("j***@h***.com");
    });

    it("should handle missing tracking information", () => {
      const dataWithoutTracking = { ...mockCustomerData, tracking: undefined };
      const redactedData = redactCustomerInfo(dataWithoutTracking);

      expect(redactedData.trackingCarrier).toBeUndefined();
      expect(redactedData.trackingLastEvent).toBeUndefined();
      expect(redactedData.email).toBe("j***@h***.com");
    });
  });

  describe("PII Sanitizer Service Integration", () => {
    it("should sanitize PII in conversation text", () => {
      const conversationText = "Customer email is justin@hotrodan.com and phone is 555-123-4567";
      const sanitized = sanitizePII(conversationText);

      expect(sanitized.sanitizedText).toBe("Customer email is [EMAIL_REDACTED] and phone is [PHONE_REDACTED]");
      expect(sanitized.piiDetected).toBe(true);
      expect(sanitized.piiTypes).toContain("email");
      expect(sanitized.piiTypes).toContain("phone");
    });

    it("should handle multiple PII types in one message", () => {
      const complexText = "Send to 123 Main St, ZIP 90210. Email: john@example.com, call (555) 123-4567";
      const sanitized = sanitizePII(complexText);

      expect(sanitized.piiDetected).toBe(true);
      expect(sanitized.piiTypes).toContain("address");
      expect(sanitized.piiTypes).toContain("postal_code");
      expect(sanitized.piiTypes).toContain("email");
      expect(sanitized.piiTypes).toContain("phone");

      // Verify no PII remains
      expect(sanitized.sanitizedText).not.toContain("john@example.com");
      expect(sanitized.sanitizedText).not.toContain("123 Main St");
      expect(sanitized.sanitizedText).not.toContain("90210");
      expect(sanitized.sanitizedText).not.toContain("(555) 123-4567");
    });

    it("should not sanitize text without PII", () => {
      const cleanText = "This is a normal message with no sensitive information.";
      const sanitized = sanitizePII(cleanText);

      expect(sanitized.sanitizedText).toBe(cleanText);
      expect(sanitized.piiDetected).toBe(false);
      expect(sanitized.piiTypes).toHaveLength(0);
    });
  });

  describe("Service Performance Integration", () => {
    it("should redact PII within acceptable time", () => {
      const startTime = performance.now();
      redactCustomerInfo(mockCustomerData);
      const endTime = performance.now();

      // Should complete within 50ms
      expect(endTime - startTime).toBeLessThan(50);
    });

    it("should sanitize text within acceptable time", () => {
      const text = "Customer email is justin@hotrodan.com and phone is 555-123-4567";
      const startTime = performance.now();
      sanitizePII(text);
      const endTime = performance.now();

      // Should complete within 100ms
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should handle large datasets efficiently", () => {
      const largeLineItems = Array.from({ length: 100 }, (_, i) => ({
        title: `Product ${i + 1}`,
        sku: `SKU-${i + 1}`,
        quantity: 1,
        price: "$10.00",
      }));

      const dataWithLargeLineItems = {
        ...mockCustomerData,
        lineItems: largeLineItems,
      };

      const startTime = performance.now();
      redactCustomerInfo(dataWithLargeLineItems);
      const endTime = performance.now();

      // Should still complete within reasonable time
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe("Data Integrity Integration", () => {
    it("should maintain data structure integrity", () => {
      const redactedData = redactCustomerInfo(mockCustomerData);

      // Verify all expected fields are present
      expect(redactedData).toHaveProperty("orderId");
      expect(redactedData).toHaveProperty("email");
      expect(redactedData).toHaveProperty("phone");
      expect(redactedData).toHaveProperty("shippingCity");
      expect(redactedData).toHaveProperty("shippingRegion");
      expect(redactedData).toHaveProperty("shippingCountry");
      expect(redactedData).toHaveProperty("shippingZipPrefix");
      expect(redactedData).toHaveProperty("trackingCarrier");
      expect(redactedData).toHaveProperty("trackingLastEvent");
    });

    it("should preserve data types", () => {
      const redactedData = redactCustomerInfo(mockCustomerData);

      expect(typeof redactedData.orderId).toBe("string");
      expect(typeof redactedData.email).toBe("string");
      expect(typeof redactedData.phone).toBe("string");
      expect(typeof redactedData.shippingCity).toBe("string");
      expect(typeof redactedData.shippingRegion).toBe("string");
      expect(typeof redactedData.shippingCountry).toBe("string");
      expect(typeof redactedData.shippingZipPrefix).toBe("string");
    });

    it("should handle edge cases gracefully", () => {
      const edgeCaseData = {
        ...mockCustomerData,
        email: "",
        phone: "",
        shippingAddress: {
          ...mockCustomerData.shippingAddress,
          address1: "",
          zip: "",
        },
      };

      const redactedData = redactCustomerInfo(edgeCaseData);

      // Should not throw errors and should handle empty strings
      expect(redactedData.email).toBe("***");
      expect(redactedData.phone).toBeUndefined(); // phone is undefined when input is empty
      expect(redactedData.shippingZipPrefix).toBe("**"); // Empty zip results in "**"
    });
  });

  describe("Security Integration", () => {
    it("should ensure no PII leaks in redacted data", () => {
      const redactedData = redactCustomerInfo(mockCustomerData);
      const redactedString = JSON.stringify(redactedData);

      // Verify no full PII remains
      expect(redactedString).not.toContain("justin@hotrodan.com");
      expect(redactedString).not.toContain("555-123-4567");
      expect(redactedString).not.toContain("123 Main St");
      expect(redactedString).not.toContain("1Z999AA10123456784");
    });

    it("should ensure no PII leaks in sanitized text", () => {
      const text = "Customer email is justin@hotrodan.com and phone is 555-123-4567";
      const sanitized = sanitizePII(text);

      expect(sanitized.sanitizedText).not.toContain("justin@hotrodan.com");
      expect(sanitized.sanitizedText).not.toContain("555-123-4567");
    });

    it("should maintain PII isolation between operations", () => {
      const data1 = { ...mockCustomerData, email: "customer1@example.com" };
      const data2 = { ...mockCustomerData, email: "customer2@example.com" };

      const redacted1 = redactCustomerInfo(data1);
      const redacted2 = redactCustomerInfo(data2);

      expect(redacted1.email).toBe("c***@e***.com");
      expect(redacted2.email).toBe("c***@e***.com");
      expect(redacted1.email).not.toContain("customer1@example.com");
      expect(redacted2.email).not.toContain("customer2@example.com");
    });
  });
});