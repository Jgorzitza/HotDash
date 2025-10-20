/**
 * Tests for Vendor Management Service (INVENTORY-003)
 *
 * Validates vendor performance tracking, scoring, and comparisons
 */

import { describe, it, expect } from "vitest";
import {
  calculateLeadTime,
  isOnTimeDelivery,
  calculateVendorPerformance,
  calculateVendorScore,
  compareVendorsForSKU,
  rankVendors,
  identifyVendorIssues,
  type Vendor,
  type VendorOrder,
  type VendorPerformanceMetrics,
} from "~/services/inventory/vendor-management";

// Helper to create test vendor
function createVendor(id: string, name: string): Vendor {
  return {
    id,
    name,
    contact_email: `${id}@example.com`,
  };
}

// Helper to create test order
function createOrder(
  orderId: string,
  vendorId: string,
  daysToDeliver: number,
  costPerUnit: number,
  expectedDays: number = 7,
): VendorOrder {
  const orderDate = new Date("2024-01-01");
  const expectedDeliveryDate = new Date(orderDate);
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + expectedDays);

  const actualDeliveryDate = new Date(orderDate);
  actualDeliveryDate.setDate(actualDeliveryDate.getDate() + daysToDeliver);

  return {
    order_id: orderId,
    vendor_id: vendorId,
    sku: "SKU-001",
    quantity: 100,
    cost_per_unit: costPerUnit,
    total_cost: 100 * costPerUnit,
    order_date: orderDate,
    expected_delivery_date: expectedDeliveryDate,
    actual_delivery_date: actualDeliveryDate,
    status: "delivered",
  };
}

describe("Vendor Management Service (INVENTORY-003)", () => {
  describe("calculateLeadTime", () => {
    it("should calculate lead time in days", () => {
      const orderDate = new Date("2024-01-01");
      const deliveryDate = new Date("2024-01-08");

      const leadTime = calculateLeadTime(orderDate, deliveryDate);

      expect(leadTime).toBe(7);
    });

    it("should handle fractional days", () => {
      const orderDate = new Date("2024-01-01T00:00:00");
      const deliveryDate = new Date("2024-01-01T12:00:00"); // 12 hours later

      const leadTime = calculateLeadTime(orderDate, deliveryDate);

      expect(leadTime).toBe(0.5);
    });

    it("should handle same-day delivery", () => {
      const orderDate = new Date("2024-01-01T09:00:00");
      const deliveryDate = new Date("2024-01-01T17:00:00");

      const leadTime = calculateLeadTime(orderDate, deliveryDate);

      expect(leadTime).toBeCloseTo(0.3, 1); // ~8 hours
    });
  });

  describe("isOnTimeDelivery", () => {
    it("should return true for delivery on expected date", () => {
      const expectedDate = new Date("2024-01-08");
      const actualDate = new Date("2024-01-08");

      expect(isOnTimeDelivery(expectedDate, actualDate)).toBe(true);
    });

    it("should return true for early delivery", () => {
      const expectedDate = new Date("2024-01-08");
      const actualDate = new Date("2024-01-07");

      expect(isOnTimeDelivery(expectedDate, actualDate)).toBe(true);
    });

    it("should return true for delivery within grace period", () => {
      const expectedDate = new Date("2024-01-08");
      const actualDate = new Date("2024-01-09"); // 1 day late (within default grace)

      expect(isOnTimeDelivery(expectedDate, actualDate)).toBe(true);
    });

    it("should return false for delivery beyond grace period", () => {
      const expectedDate = new Date("2024-01-08");
      const actualDate = new Date("2024-01-10"); // 2 days late (beyond grace)

      expect(isOnTimeDelivery(expectedDate, actualDate)).toBe(false);
    });

    it("should use custom grace period", () => {
      const expectedDate = new Date("2024-01-08");
      const actualDate = new Date("2024-01-10"); // 2 days late

      // 2-day grace period
      expect(isOnTimeDelivery(expectedDate, actualDate, 2)).toBe(true);

      // 1-day grace period
      expect(isOnTimeDelivery(expectedDate, actualDate, 1)).toBe(false);
    });
  });

  describe("calculateVendorPerformance", () => {
    it("should calculate metrics for vendor with perfect performance", () => {
      const vendor = createVendor("V1", "Vendor One");
      const orders: VendorOrder[] = [
        createOrder("O1", "V1", 7, 10, 7), // On time
        createOrder("O2", "V1", 6, 10, 7), // Early
        createOrder("O3", "V1", 7, 10, 7), // On time
      ];

      const metrics = calculateVendorPerformance(vendor, orders);

      expect(metrics.vendor_id).toBe("V1");
      expect(metrics.vendor_name).toBe("Vendor One");
      expect(metrics.total_orders).toBe(3);
      expect(metrics.completed_orders).toBe(3);
      expect(metrics.on_time_deliveries).toBe(3);
      expect(metrics.late_deliveries).toBe(0);
      expect(metrics.reliability_score).toBe(100);
      expect(metrics.average_lead_time_days).toBeCloseTo(6.7, 1);
    });

    it("should calculate metrics for vendor with mixed performance", () => {
      const vendor = createVendor("V2", "Vendor Two");
      const orders: VendorOrder[] = [
        createOrder("O1", "V2", 7, 10, 7), // On time
        createOrder("O2", "V2", 10, 10, 7), // Late (3 days)
        createOrder("O3", "V2", 8, 10, 7), // On time (within grace)
        createOrder("O4", "V2", 12, 10, 7), // Late (5 days)
      ];

      const metrics = calculateVendorPerformance(vendor, orders);

      expect(metrics.total_orders).toBe(4);
      expect(metrics.completed_orders).toBe(4);
      expect(metrics.on_time_deliveries).toBe(2);
      expect(metrics.late_deliveries).toBe(2);
      expect(metrics.reliability_score).toBe(50); // 50% on-time
      expect(metrics.average_lead_time_days).toBeCloseTo(9.3, 1);
    });

    it("should calculate average cost per unit", () => {
      const vendor = createVendor("V3", "Vendor Three");
      const orders: VendorOrder[] = [
        { ...createOrder("O1", "V3", 7, 10, 7), quantity: 100 }, // $10/unit
        { ...createOrder("O2", "V3", 7, 12, 7), quantity: 100 }, // $12/unit
        { ...createOrder("O3", "V3", 7, 8, 7), quantity: 100 }, // $8/unit
      ];

      const metrics = calculateVendorPerformance(vendor, orders);

      expect(metrics.average_cost_per_unit).toBe(10); // (10+12+8)/3 = 10
    });

    it("should handle vendor with no completed orders", () => {
      const vendor = createVendor("V4", "Vendor Four");
      const orders: VendorOrder[] = [
        {
          ...createOrder("O1", "V4", 7, 10, 7),
          status: "ordered",
          actual_delivery_date: undefined,
        },
      ];

      const metrics = calculateVendorPerformance(vendor, orders);

      expect(metrics.total_orders).toBe(1);
      expect(metrics.completed_orders).toBe(0);
      expect(metrics.reliability_score).toBe(0);
      expect(metrics.average_lead_time_days).toBe(0);
    });

    it("should calculate lead time variance", () => {
      const vendor = createVendor("V5", "Vendor Five");
      const orders: VendorOrder[] = [
        createOrder("O1", "V5", 5, 10, 7), // 5 days
        createOrder("O2", "V5", 7, 10, 7), // 7 days
        createOrder("O3", "V5", 9, 10, 7), // 9 days
      ];

      const metrics = calculateVendorPerformance(vendor, orders);

      // Mean = 7, variance = sqrt(((5-7)^2 + (7-7)^2 + (9-7)^2) / 3) = sqrt(8/3) ≈ 1.6
      expect(metrics.average_lead_time_days).toBe(7);
      expect(metrics.lead_time_variance).toBeCloseTo(1.6, 1);
    });
  });

  describe("calculateVendorScore", () => {
    it("should give high score for excellent vendor", () => {
      const metrics: VendorPerformanceMetrics = {
        vendor_id: "V1",
        vendor_name: "Excellent Vendor",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 10,
        late_deliveries: 0,
        average_lead_time_days: 5, // Below benchmark (7)
        expected_lead_time_days: 7,
        lead_time_variance: 0.5,
        reliability_score: 100, // Perfect reliability
        average_cost_per_unit: 8, // Below benchmark (10)
      };

      const score = calculateVendorScore(metrics, 7, 10);

      expect(score).toBeGreaterThan(90); // Should be very high
    });

    it("should give low score for poor vendor", () => {
      const metrics: VendorPerformanceMetrics = {
        vendor_id: "V2",
        vendor_name: "Poor Vendor",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 3,
        late_deliveries: 7,
        average_lead_time_days: 14, // Double benchmark
        expected_lead_time_days: 7,
        lead_time_variance: 3,
        reliability_score: 30, // Poor reliability
        average_cost_per_unit: 20, // Double benchmark
      };

      const score = calculateVendorScore(metrics, 7, 10);

      expect(score).toBeLessThan(30); // Should be very low
    });

    it("should give medium score for average vendor", () => {
      const metrics: VendorPerformanceMetrics = {
        vendor_id: "V3",
        vendor_name: "Average Vendor",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 7,
        late_deliveries: 3,
        average_lead_time_days: 8, // Slightly above benchmark
        expected_lead_time_days: 7,
        lead_time_variance: 1,
        reliability_score: 70,
        average_cost_per_unit: 11, // Slightly above benchmark
      };

      const score = calculateVendorScore(metrics, 7, 10);

      expect(score).toBeGreaterThan(60);
      expect(score).toBeLessThan(80);
    });

    it("should weight reliability heavily (50%)", () => {
      const highReliability: VendorPerformanceMetrics = {
        vendor_id: "V4",
        vendor_name: "High Reliability",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 10,
        late_deliveries: 0,
        average_lead_time_days: 10, // Poor lead time
        expected_lead_time_days: 7,
        lead_time_variance: 2,
        reliability_score: 100, // Excellent reliability
        average_cost_per_unit: 15, // High cost
      };

      const score = calculateVendorScore(highReliability, 7, 10);

      // Despite poor lead time and cost, should still get decent score due to reliability
      expect(score).toBeGreaterThan(50);
    });
  });

  describe("compareVendorsForSKU", () => {
    it("should identify preferred vendor based on composite score", () => {
      const vendor1 = createVendor("V1", "Vendor One");
      const vendor2 = createVendor("V2", "Vendor Two");
      const vendor3 = createVendor("V3", "Vendor Three");

      const metrics1: VendorPerformanceMetrics = {
        vendor_id: "V1",
        vendor_name: "Vendor One",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 10,
        late_deliveries: 0,
        average_lead_time_days: 5,
        expected_lead_time_days: 7,
        lead_time_variance: 0.5,
        reliability_score: 100,
        average_cost_per_unit: 10,
      };

      const metrics2: VendorPerformanceMetrics = {
        vendor_id: "V2",
        vendor_name: "Vendor Two",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 8,
        late_deliveries: 2,
        average_lead_time_days: 7,
        expected_lead_time_days: 7,
        lead_time_variance: 1,
        reliability_score: 80,
        average_cost_per_unit: 8, // Lower cost
      };

      const metrics3: VendorPerformanceMetrics = {
        vendor_id: "V3",
        vendor_name: "Vendor Three",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 6,
        late_deliveries: 4,
        average_lead_time_days: 10,
        expected_lead_time_days: 7,
        lead_time_variance: 2,
        reliability_score: 60,
        average_cost_per_unit: 12,
      };

      const comparison = compareVendorsForSKU(
        "SKU-001",
        [
          { vendor: vendor1, metrics: metrics1 },
          { vendor: vendor2, metrics: metrics2 },
          { vendor: vendor3, metrics: metrics3 },
        ],
        7,
        10,
      );

      expect(comparison.sku).toBe("SKU-001");
      expect(comparison.vendors.length).toBe(3);

      // Vendor One should be preferred (high reliability, low lead time)
      expect(comparison.preferred_vendor_id).toBe("V1");

      // Verify only one vendor is marked as recommended
      const recommendedCount = comparison.vendors.filter(
        (v) => v.recommended,
      ).length;
      expect(recommendedCount).toBe(1);

      // Vendor One should have the highest score
      const vendor1Score = comparison.vendors.find(
        (v) => v.vendor_id === "V1",
      )?.total_score;
      const vendor2Score = comparison.vendors.find(
        (v) => v.vendor_id === "V2",
      )?.total_score;
      const vendor3Score = comparison.vendors.find(
        (v) => v.vendor_id === "V3",
      )?.total_score;

      expect(vendor1Score).toBeGreaterThan(vendor2Score!);
      expect(vendor2Score).toBeGreaterThan(vendor3Score!);
    });

    it("should calculate benchmark from vendors if not provided", () => {
      const vendor1 = createVendor("V1", "Vendor One");
      const vendor2 = createVendor("V2", "Vendor Two");

      const metrics1: VendorPerformanceMetrics = {
        vendor_id: "V1",
        vendor_name: "Vendor One",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 10,
        late_deliveries: 0,
        average_lead_time_days: 5,
        expected_lead_time_days: 7,
        lead_time_variance: 0.5,
        reliability_score: 100,
        average_cost_per_unit: 10,
      };

      const metrics2: VendorPerformanceMetrics = {
        vendor_id: "V2",
        vendor_name: "Vendor Two",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 8,
        late_deliveries: 2,
        average_lead_time_days: 9,
        expected_lead_time_days: 7,
        lead_time_variance: 1,
        reliability_score: 80,
        average_cost_per_unit: 12,
      };

      // Don't provide benchmarks - should calculate from vendors
      const comparison = compareVendorsForSKU("SKU-001", [
        { vendor: vendor1, metrics: metrics1 },
        { vendor: vendor2, metrics: metrics2 },
      ]);

      expect(comparison.preferred_vendor_id).toBeDefined();
      expect(comparison.vendors.length).toBe(2);
    });
  });

  describe("rankVendors", () => {
    it("should rank vendors by overall performance", () => {
      const vendors = [
        {
          vendor: createVendor("V1", "Vendor One"),
          metrics: {
            vendor_id: "V1",
            vendor_name: "Vendor One",
            total_orders: 10,
            completed_orders: 10,
            on_time_deliveries: 5,
            late_deliveries: 5,
            average_lead_time_days: 8,
            expected_lead_time_days: 7,
            lead_time_variance: 1.5,
            reliability_score: 50,
            average_cost_per_unit: 12,
          } as VendorPerformanceMetrics,
        },
        {
          vendor: createVendor("V2", "Vendor Two"),
          metrics: {
            vendor_id: "V2",
            vendor_name: "Vendor Two",
            total_orders: 15,
            completed_orders: 15,
            on_time_deliveries: 14,
            late_deliveries: 1,
            average_lead_time_days: 6,
            expected_lead_time_days: 7,
            lead_time_variance: 0.8,
            reliability_score: 93,
            average_cost_per_unit: 9,
          } as VendorPerformanceMetrics,
        },
        {
          vendor: createVendor("V3", "Vendor Three"),
          metrics: {
            vendor_id: "V3",
            vendor_name: "Vendor Three",
            total_orders: 8,
            completed_orders: 8,
            on_time_deliveries: 7,
            late_deliveries: 1,
            average_lead_time_days: 7,
            expected_lead_time_days: 7,
            lead_time_variance: 1,
            reliability_score: 88,
            average_cost_per_unit: 10,
          } as VendorPerformanceMetrics,
        },
      ];

      const ranked = rankVendors(vendors);

      expect(ranked.length).toBe(3);

      // Vendor Two should be ranked #1 (best performance)
      expect(ranked[0].vendor_id).toBe("V2");
      expect(ranked[0].rank).toBe(1);

      // Vendor One should be ranked #3 (worst performance)
      expect(ranked[2].vendor_id).toBe("V1");
      expect(ranked[2].rank).toBe(3);
    });
  });

  describe("identifyVendorIssues", () => {
    it("should flag low reliability", () => {
      const metrics: VendorPerformanceMetrics = {
        vendor_id: "V1",
        vendor_name: "Vendor One",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 4,
        late_deliveries: 6,
        average_lead_time_days: 7,
        expected_lead_time_days: 7,
        lead_time_variance: 1,
        reliability_score: 40, // Low reliability
        average_cost_per_unit: 10,
      };

      const issues = identifyVendorIssues(metrics);

      const reliabilityIssue = issues.find(
        (i) => i.issue_type === "low_reliability",
      );
      expect(reliabilityIssue).toBeDefined();
      expect(reliabilityIssue?.severity).toBe("high");
    });

    it("should flag high lead time variance", () => {
      const metrics: VendorPerformanceMetrics = {
        vendor_id: "V2",
        vendor_name: "Vendor Two",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 9,
        late_deliveries: 1,
        average_lead_time_days: 7,
        expected_lead_time_days: 7,
        lead_time_variance: 3, // High variance (> 30% of average)
        reliability_score: 90,
        average_cost_per_unit: 10,
      };

      const issues = identifyVendorIssues(metrics);

      const varianceIssue = issues.find(
        (i) => i.issue_type === "high_variance",
      );
      expect(varianceIssue).toBeDefined();
      expect(varianceIssue?.severity).toBe("medium");
    });

    it("should flag inactive vendors", () => {
      const lastOrderDate = new Date();
      lastOrderDate.setDate(lastOrderDate.getDate() - 120); // 120 days ago

      const metrics: VendorPerformanceMetrics = {
        vendor_id: "V3",
        vendor_name: "Vendor Three",
        total_orders: 5,
        completed_orders: 5,
        on_time_deliveries: 5,
        late_deliveries: 0,
        average_lead_time_days: 7,
        expected_lead_time_days: 7,
        lead_time_variance: 0.5,
        reliability_score: 100,
        average_cost_per_unit: 10,
        last_order_date: lastOrderDate,
      };

      const issues = identifyVendorIssues(metrics);

      const inactiveIssue = issues.find((i) => i.issue_type === "inactive");
      expect(inactiveIssue).toBeDefined();
      expect(inactiveIssue?.severity).toBe("low");
    });

    it("should return empty array for vendor with no issues", () => {
      const metrics: VendorPerformanceMetrics = {
        vendor_id: "V4",
        vendor_name: "Vendor Four",
        total_orders: 10,
        completed_orders: 10,
        on_time_deliveries: 10,
        late_deliveries: 0,
        average_lead_time_days: 7,
        expected_lead_time_days: 7,
        lead_time_variance: 0.5,
        reliability_score: 100,
        average_cost_per_unit: 10,
        last_order_date: new Date(),
      };

      const issues = identifyVendorIssues(metrics);

      expect(issues.length).toBe(0);
    });
  });
});

