/**
 * Integration Tests: Vendor Management (INVENTORY-003)
 */

import { describe, it, expect } from "vitest";
import { calculateLeadTime } from "~/services/inventory/vendor-management";

describe("Vendor Management - Lead Time", () => {
  it("should calculate lead time in days", () => {
    const orderDate = new Date("2025-01-01");
    const deliveryDate = new Date("2025-01-10");

    const leadTime = calculateLeadTime(orderDate, deliveryDate);
    expect(leadTime).toBe(9);
  });

  it("should handle same-day delivery", () => {
    const date = new Date("2025-01-01");
    const leadTime = calculateLeadTime(date, date);
    expect(leadTime).toBe(0);
  });

  it("should round to 1 decimal", () => {
    const orderDate = new Date("2025-01-01T00:00:00");
    const deliveryDate = new Date("2025-01-01T12:00:00"); // 12 hours

    const leadTime = calculateLeadTime(orderDate, deliveryDate);
    expect(leadTime).toBe(0.5);
  });
});


