/**
 * Tests for PO Tracking System (INVENTORY-004)
 *
 * Validates purchase order lifecycle, tracking, and analytics
 */

import { describe, it, expect } from "vitest";
import {
  createPurchaseOrder,
  markPOAsOrdered,
  markPOAsShipped,
  markPOAsReceived,
  markPOAsCancelled,
  getPOTrackingDetails,
  getPOSummary,
  getOverduePOs,
  getPOsExpectedSoon,
  calculateLeadTimeAccuracy,
  exportPOsToCSV,
  type PurchaseOrder,
} from "~/services/inventory/po-tracking";

describe("PO Tracking System (INVENTORY-004)", () => {
  describe("createPurchaseOrder", () => {
    it("should create draft PO with basic information", () => {
      const po = createPurchaseOrder({
        po_number: "PO-001",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      expect(po.po_number).toBe("PO-001");
      expect(po.vendor_id).toBe("V1");
      expect(po.status).toBe("draft");
      expect(po.total_cost).toBe(1000); // 100 * 10
      expect(po.created_date).toBeInstanceOf(Date);
    });

    it("should calculate expected delivery date from lead time", () => {
      const po = createPurchaseOrder({
        po_number: "PO-002",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 50,
        cost_per_unit: 15,
        expected_lead_time_days: 7,
      });

      expect(po.expected_delivery_date).toBeInstanceOf(Date);

      // Expected delivery should be ~7 days from now
      const daysDiff =
        (po.expected_delivery_date!.getTime() - po.created_date.getTime()) /
        (1000 * 60 * 60 * 24);
      expect(daysDiff).toBeCloseTo(7, 0);
    });

    it("should include notes if provided", () => {
      const po = createPurchaseOrder({
        po_number: "PO-003",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 25,
        cost_per_unit: 20,
        notes: "Rush order",
      });

      expect(po.notes).toBe("Rush order");
    });
  });

  describe("markPOAsOrdered", () => {
    it("should transition PO from draft to ordered", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-004",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
        expected_lead_time_days: 7,
      });

      const ordered = markPOAsOrdered(draft);

      expect(ordered.status).toBe("ordered");
      expect(ordered.ordered_date).toBeInstanceOf(Date);
      expect(ordered.expected_delivery_date).toBeInstanceOf(Date);
    });

    it("should allow custom ordered date", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-005",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const customDate = new Date("2024-01-15");
      const ordered = markPOAsOrdered(draft, customDate);

      expect(ordered.ordered_date).toEqual(customDate);
    });

    it("should throw error if PO is not draft", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-006",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const ordered = markPOAsOrdered(draft);

      expect(() => markPOAsOrdered(ordered)).toThrow(
        "Cannot order PO with status: ordered",
      );
    });
  });

  describe("markPOAsShipped", () => {
    it("should transition PO from ordered to shipped", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-007",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const ordered = markPOAsOrdered(draft);
      const shipped = markPOAsShipped(ordered);

      expect(shipped.status).toBe("shipped");
      expect(shipped.shipped_date).toBeInstanceOf(Date);
    });

    it("should throw error if PO is not ordered", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-008",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      expect(() => markPOAsShipped(draft)).toThrow(
        "Cannot ship PO with status: draft",
      );
    });
  });

  describe("markPOAsReceived", () => {
    it("should transition PO from shipped to received", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-009",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const ordered = markPOAsOrdered(draft);
      const shipped = markPOAsShipped(ordered);
      const received = markPOAsReceived(shipped);

      expect(received.status).toBe("received");
      expect(received.actual_delivery_date).toBeInstanceOf(Date);
    });

    it("should allow receiving directly from ordered status", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-010",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const ordered = markPOAsOrdered(draft);
      const received = markPOAsReceived(ordered);

      expect(received.status).toBe("received");
    });

    it("should throw error if PO is draft", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-011",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      expect(() => markPOAsReceived(draft)).toThrow(
        "Cannot receive PO with status: draft",
      );
    });
  });

  describe("markPOAsCancelled", () => {
    it("should cancel draft PO", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-012",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const cancelled = markPOAsCancelled(draft, "Vendor out of stock");

      expect(cancelled.status).toBe("cancelled");
      expect(cancelled.notes).toContain("Cancelled: Vendor out of stock");
    });

    it("should throw error if PO is received", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-013",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const ordered = markPOAsOrdered(draft);
      const received = markPOAsReceived(ordered);

      expect(() => markPOAsCancelled(received)).toThrow(
        "Cannot cancel received PO",
      );
    });
  });

  describe("getPOTrackingDetails", () => {
    it("should calculate days since order", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-014",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const orderDate = new Date();
      orderDate.setDate(orderDate.getDate() - 5); // 5 days ago

      const ordered = markPOAsOrdered(draft, orderDate);
      const details = getPOTrackingDetails(ordered);

      expect(details.days_since_order).toBeCloseTo(5, 0);
    });

    it("should calculate days until expected delivery", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-015",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 3); // 3 days from now

      const ordered = markPOAsOrdered(draft, new Date(), expectedDate);
      const details = getPOTrackingDetails(ordered);

      expect(details.days_until_expected).toBeCloseTo(3, 0);
      expect(details.is_overdue).toBe(false);
    });

    it("should flag overdue POs", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-016",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - 2); // 2 days ago

      const ordered = markPOAsOrdered(draft, new Date(), expectedDate);
      const details = getPOTrackingDetails(ordered);

      expect(details.is_overdue).toBe(true);
      expect(details.days_until_expected).toBeLessThan(0);
    });

    it("should calculate lead time variance for received POs", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-017",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const orderDate = new Date("2024-01-01");
      const expectedDate = new Date("2024-01-08"); // 7 days
      const actualDate = new Date("2024-01-10"); // 9 days (2 days late)

      const ordered = markPOAsOrdered(draft, orderDate, expectedDate);
      const received = markPOAsReceived(ordered, actualDate);
      const details = getPOTrackingDetails(received);

      expect(details.expected_lead_time).toBe(7);
      expect(details.actual_lead_time).toBe(9);
      expect(details.lead_time_variance).toBe(2); // 2 days late
    });

    it("should mark on-track POs", () => {
      const draft = createPurchaseOrder({
        po_number: "PO-018",
        vendor_id: "V1",
        vendor_name: "Vendor One",
        sku: "SKU-001",
        product_name: "Test Product",
        quantity: 100,
        cost_per_unit: 10,
      });

      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 5); // 5 days from now

      const ordered = markPOAsOrdered(draft, new Date(), expectedDate);
      const details = getPOTrackingDetails(ordered);

      expect(details.is_on_track).toBe(true);
    });
  });

  describe("getPOSummary", () => {
    it("should calculate summary statistics", () => {
      const pos: PurchaseOrder[] = [
        createPurchaseOrder({
          po_number: "PO-019",
          vendor_id: "V1",
          vendor_name: "Vendor One",
          sku: "SKU-001",
          product_name: "Product 1",
          quantity: 100,
          cost_per_unit: 10,
        }),
        markPOAsOrdered(
          createPurchaseOrder({
            po_number: "PO-020",
            vendor_id: "V1",
            vendor_name: "Vendor One",
            sku: "SKU-002",
            product_name: "Product 2",
            quantity: 50,
            cost_per_unit: 20,
          }),
        ),
        markPOAsShipped(
          markPOAsOrdered(
            createPurchaseOrder({
              po_number: "PO-021",
              vendor_id: "V1",
              vendor_name: "Vendor One",
              sku: "SKU-003",
              product_name: "Product 3",
              quantity: 75,
              cost_per_unit: 15,
            }),
          ),
        ),
      ];

      const summary = getPOSummary(pos);

      expect(summary.total_pos).toBe(3);
      expect(summary.draft_count).toBe(1);
      expect(summary.ordered_count).toBe(1);
      expect(summary.shipped_count).toBe(1);
      expect(summary.total_value).toBe(3125); // 1000 + 1000 + 1125
    });

    it("should calculate average lead time for received orders", () => {
      const orderDate = new Date("2024-01-01");

      const pos: PurchaseOrder[] = [
        markPOAsReceived(
          markPOAsOrdered(
            createPurchaseOrder({
              po_number: "PO-022",
              vendor_id: "V1",
              vendor_name: "Vendor One",
              sku: "SKU-001",
              product_name: "Product 1",
              quantity: 100,
              cost_per_unit: 10,
            }),
            orderDate,
          ),
          new Date("2024-01-08"),
        ), // 7 days
        markPOAsReceived(
          markPOAsOrdered(
            createPurchaseOrder({
              po_number: "PO-023",
              vendor_id: "V1",
              vendor_name: "Vendor One",
              sku: "SKU-002",
              product_name: "Product 2",
              quantity: 50,
              cost_per_unit: 20,
            }),
            orderDate,
          ),
          new Date("2024-01-10"),
        ), // 9 days
      ];

      const summary = getPOSummary(pos);

      expect(summary.received_count).toBe(2);
      expect(summary.average_lead_time).toBe(8); // (7 + 9) / 2
    });
  });

  describe("getOverduePOs", () => {
    it("should return only overdue POs", () => {
      const now = new Date();
      const past = new Date(now);
      past.setDate(past.getDate() - 2);

      const pos: PurchaseOrder[] = [
        markPOAsOrdered(
          createPurchaseOrder({
            po_number: "PO-024",
            vendor_id: "V1",
            vendor_name: "Vendor One",
            sku: "SKU-001",
            product_name: "Product 1",
            quantity: 100,
            cost_per_unit: 10,
          }),
          new Date(),
          past,
        ), // Overdue
        markPOAsOrdered(
          createPurchaseOrder({
            po_number: "PO-025",
            vendor_id: "V1",
            vendor_name: "Vendor One",
            sku: "SKU-002",
            product_name: "Product 2",
            quantity: 50,
            cost_per_unit: 20,
          }),
        ), // Not overdue
      ];

      const overdue = getOverduePOs(pos);

      expect(overdue.length).toBe(1);
      expect(overdue[0].po_number).toBe("PO-024");
      expect(overdue[0].is_overdue).toBe(true);
    });

    it("should not include received or draft POs", () => {
      const past = new Date();
      past.setDate(past.getDate() - 2);

      const pos: PurchaseOrder[] = [
        createPurchaseOrder({
          po_number: "PO-026",
          vendor_id: "V1",
          vendor_name: "Vendor One",
          sku: "SKU-001",
          product_name: "Product 1",
          quantity: 100,
          cost_per_unit: 10,
        }), // Draft
        markPOAsReceived(
          markPOAsOrdered(
            createPurchaseOrder({
              po_number: "PO-027",
              vendor_id: "V1",
              vendor_name: "Vendor One",
              sku: "SKU-002",
              product_name: "Product 2",
              quantity: 50,
              cost_per_unit: 20,
            }),
            new Date(),
            past,
          ),
        ), // Received
      ];

      const overdue = getOverduePOs(pos);

      expect(overdue.length).toBe(0);
    });
  });

  describe("getPOsExpectedSoon", () => {
    it("should return POs expected within specified days", () => {
      const now = new Date();
      const in3Days = new Date(now);
      in3Days.setDate(in3Days.getDate() + 3);

      const in10Days = new Date(now);
      in10Days.setDate(in10Days.getDate() + 10);

      const pos: PurchaseOrder[] = [
        markPOAsOrdered(
          createPurchaseOrder({
            po_number: "PO-028",
            vendor_id: "V1",
            vendor_name: "Vendor One",
            sku: "SKU-001",
            product_name: "Product 1",
            quantity: 100,
            cost_per_unit: 10,
          }),
          new Date(),
          in3Days,
        ),
        markPOAsOrdered(
          createPurchaseOrder({
            po_number: "PO-029",
            vendor_id: "V1",
            vendor_name: "Vendor One",
            sku: "SKU-002",
            product_name: "Product 2",
            quantity: 50,
            cost_per_unit: 20,
          }),
          new Date(),
          in10Days,
        ),
      ];

      const expectedSoon = getPOsExpectedSoon(pos, 7);

      expect(expectedSoon.length).toBe(1);
      expect(expectedSoon[0].po_number).toBe("PO-028");
    });

    it("should sort by days until expected", () => {
      const now = new Date();
      const in2Days = new Date(now);
      in2Days.setDate(in2Days.getDate() + 2);

      const in5Days = new Date(now);
      in5Days.setDate(in5Days.getDate() + 5);

      const pos: PurchaseOrder[] = [
        markPOAsOrdered(
          createPurchaseOrder({
            po_number: "PO-030",
            vendor_id: "V1",
            vendor_name: "Vendor One",
            sku: "SKU-001",
            product_name: "Product 1",
            quantity: 100,
            cost_per_unit: 10,
          }),
          new Date(),
          in5Days,
        ),
        markPOAsOrdered(
          createPurchaseOrder({
            po_number: "PO-031",
            vendor_id: "V1",
            vendor_name: "Vendor One",
            sku: "SKU-002",
            product_name: "Product 2",
            quantity: 50,
            cost_per_unit: 20,
          }),
          new Date(),
          in2Days,
        ),
      ];

      const expectedSoon = getPOsExpectedSoon(pos, 7);

      expect(expectedSoon.length).toBe(2);
      expect(expectedSoon[0].po_number).toBe("PO-031"); // Closest first
      expect(expectedSoon[1].po_number).toBe("PO-030");
    });
  });

  describe("calculateLeadTimeAccuracy", () => {
    it("should calculate accuracy metrics", () => {
      const orderDate = new Date("2024-01-01");

      const pos: PurchaseOrder[] = [
        markPOAsReceived(
          markPOAsOrdered(
            createPurchaseOrder({
              po_number: "PO-032",
              vendor_id: "V1",
              vendor_name: "Vendor One",
              sku: "SKU-001",
              product_name: "Product 1",
              quantity: 100,
              cost_per_unit: 10,
            }),
            orderDate,
            new Date("2024-01-08"),
          ),
          new Date("2024-01-08"),
        ), // On time
        markPOAsReceived(
          markPOAsOrdered(
            createPurchaseOrder({
              po_number: "PO-033",
              vendor_id: "V1",
              vendor_name: "Vendor One",
              sku: "SKU-002",
              product_name: "Product 2",
              quantity: 50,
              cost_per_unit: 20,
            }),
            orderDate,
            new Date("2024-01-08"),
          ),
          new Date("2024-01-11"),
        ), // Late (3 days)
        markPOAsReceived(
          markPOAsOrdered(
            createPurchaseOrder({
              po_number: "PO-034",
              vendor_id: "V1",
              vendor_name: "Vendor One",
              sku: "SKU-003",
              product_name: "Product 3",
              quantity: 75,
              cost_per_unit: 15,
            }),
            orderDate,
            new Date("2024-01-08"),
          ),
          new Date("2024-01-06"),
        ), // Early (2 days)
      ];

      const accuracy = calculateLeadTimeAccuracy(pos);

      expect(accuracy.total_orders).toBe(3);
      expect(accuracy.on_time_count).toBe(1);
      expect(accuracy.early_count).toBe(1);
      expect(accuracy.late_count).toBe(1);
      expect(accuracy.accuracy_percentage).toBe(33); // 1/3
      expect(accuracy.average_variance_days).toBeCloseTo(0.3, 1); // (0 + 3 - 2) / 3
    });
  });

  describe("exportPOsToCSV", () => {
    it("should generate CSV with headers and data", () => {
      const pos: PurchaseOrder[] = [
        createPurchaseOrder({
          po_number: "PO-035",
          vendor_id: "V1",
          vendor_name: "Vendor One",
          sku: "SKU-001",
          product_name: "Test Product",
          quantity: 100,
          cost_per_unit: 10,
          notes: "Test notes",
        }),
      ];

      const csv = exportPOsToCSV(pos);

      expect(csv).toContain("PO Number");
      expect(csv).toContain("Vendor");
      expect(csv).toContain("PO-035");
      expect(csv).toContain("Vendor One");
      expect(csv).toContain("Test Product");
    });

    it("should escape quotes in notes", () => {
      const pos: PurchaseOrder[] = [
        createPurchaseOrder({
          po_number: "PO-036",
          vendor_id: "V1",
          vendor_name: "Vendor One",
          sku: "SKU-001",
          product_name: "Test Product",
          quantity: 100,
          cost_per_unit: 10,
          notes: 'Notes with "quotes"',
        }),
      ];

      const csv = exportPOsToCSV(pos);

      expect(csv).toContain('""quotes""'); // Escaped quotes
    });
  });
});

