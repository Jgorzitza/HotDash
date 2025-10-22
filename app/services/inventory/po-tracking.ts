/**
 * Purchase Order (PO) Tracking System (INVENTORY-004)
 *
 * Tracks purchase orders through their lifecycle:
 * - PO status (ordered, shipped, received, cancelled)
 * - Expected vs actual delivery dates
 * - Lead time accuracy calculation
 * - Integration with vendor management
 *
 * Context7 Source: /microsoft/typescript (type definitions)
 */

import { calculateLeadTime } from "./vendor-management";

export type POStatus =
  | "draft"
  | "ordered"
  | "shipped"
  | "received"
  | "cancelled";

export interface PurchaseOrder {
  po_number: string;
  vendor_id: string;
  vendor_name: string;
  sku: string;
  product_name: string;
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  status: POStatus;
  created_date: Date;
  ordered_date?: Date;
  expected_delivery_date?: Date;
  shipped_date?: Date;
  actual_delivery_date?: Date;
  notes?: string;
}

export interface POTrackingDetails extends PurchaseOrder {
  days_since_order?: number;
  days_until_expected?: number;
  actual_lead_time?: number;
  expected_lead_time?: number;
  lead_time_variance?: number; // Actual - Expected (positive = late, negative = early)
  is_overdue?: boolean;
  is_on_track?: boolean;
}

export interface POSummary {
  total_pos: number;
  draft_count: number;
  ordered_count: number;
  shipped_count: number;
  received_count: number;
  cancelled_count: number;
  overdue_count: number;
  total_value: number;
  average_lead_time?: number;
}

/**
 * Create a new purchase order (draft status)
 *
 * @param params - PO creation parameters
 * @returns Draft purchase order
 */
export function createPurchaseOrder(params: {
  po_number: string;
  vendor_id: string;
  vendor_name: string;
  sku: string;
  product_name: string;
  quantity: number;
  cost_per_unit: number;
  expected_lead_time_days?: number;
  notes?: string;
}): PurchaseOrder {
  const {
    po_number,
    vendor_id,
    vendor_name,
    sku,
    product_name,
    quantity,
    cost_per_unit,
    expected_lead_time_days,
    notes,
  } = params;

  const total_cost = quantity * cost_per_unit;
  const created_date = new Date();

  // Calculate expected delivery date if lead time provided
  let expected_delivery_date: Date | undefined = undefined;
  if (expected_lead_time_days && expected_lead_time_days > 0) {
    expected_delivery_date = new Date(created_date);
    expected_delivery_date.setDate(
      expected_delivery_date.getDate() + expected_lead_time_days,
    );
  }

  return {
    po_number,
    vendor_id,
    vendor_name,
    sku,
    product_name,
    quantity,
    cost_per_unit,
    total_cost,
    status: "draft",
    created_date,
    expected_delivery_date,
    notes,
  };
}

/**
 * Mark PO as ordered
 *
 * @param po - Purchase order
 * @param ordered_date - Date order was placed (defaults to now)
 * @param expected_delivery_date - Expected delivery date (optional, uses existing if not provided)
 * @returns Updated purchase order
 */
export function markPOAsOrdered(
  po: PurchaseOrder,
  ordered_date?: Date,
  expected_delivery_date?: Date,
): PurchaseOrder {
  if (po.status !== "draft") {
    throw new Error(`Cannot order PO with status: ${po.status}`);
  }

  return {
    ...po,
    status: "ordered",
    ordered_date: ordered_date ?? new Date(),
    expected_delivery_date:
      expected_delivery_date ?? po.expected_delivery_date ?? new Date(),
  };
}

/**
 * Mark PO as shipped
 *
 * @param po - Purchase order
 * @param shipped_date - Date order was shipped (defaults to now)
 * @returns Updated purchase order
 */
export function markPOAsShipped(
  po: PurchaseOrder,
  shipped_date?: Date,
): PurchaseOrder {
  if (po.status !== "ordered") {
    throw new Error(`Cannot ship PO with status: ${po.status}`);
  }

  return {
    ...po,
    status: "shipped",
    shipped_date: shipped_date ?? new Date(),
  };
}

/**
 * Mark PO as received
 *
 * @param po - Purchase order
 * @param received_date - Date order was received (defaults to now)
 * @returns Updated purchase order
 */
export function markPOAsReceived(
  po: PurchaseOrder,
  received_date?: Date,
): PurchaseOrder {
  if (po.status !== "shipped" && po.status !== "ordered") {
    throw new Error(`Cannot receive PO with status: ${po.status}`);
  }

  return {
    ...po,
    status: "received",
    actual_delivery_date: received_date ?? new Date(),
  };
}

/**
 * Mark PO as cancelled
 *
 * @param po - Purchase order
 * @param notes - Cancellation reason (optional)
 * @returns Updated purchase order
 */
export function markPOAsCancelled(
  po: PurchaseOrder,
  notes?: string,
): PurchaseOrder {
  if (po.status === "received") {
    throw new Error("Cannot cancel received PO");
  }

  return {
    ...po,
    status: "cancelled",
    notes: notes
      ? po.notes
        ? `${po.notes}\nCancelled: ${notes}`
        : `Cancelled: ${notes}`
      : po.notes,
  };
}

/**
 * Get detailed tracking information for a PO
 *
 * @param po - Purchase order
 * @returns PO with tracking details
 */
export function getPOTrackingDetails(po: PurchaseOrder): POTrackingDetails {
  const now = new Date();
  const details: POTrackingDetails = { ...po };

  // Calculate days since order
  if (po.ordered_date) {
    details.days_since_order = calculateLeadTime(po.ordered_date, now);
  }

  // Calculate days until expected delivery
  if (po.expected_delivery_date && po.status !== "received") {
    const daysUntil = calculateLeadTime(now, po.expected_delivery_date);
    details.days_until_expected = daysUntil;
    details.is_overdue = daysUntil < 0;
  }

  // Calculate expected lead time
  if (po.ordered_date && po.expected_delivery_date) {
    details.expected_lead_time = calculateLeadTime(
      po.ordered_date,
      po.expected_delivery_date,
    );
  }

  // Calculate actual lead time for received orders
  if (po.ordered_date && po.actual_delivery_date) {
    details.actual_lead_time = calculateLeadTime(
      po.ordered_date,
      po.actual_delivery_date,
    );

    // Calculate variance
    if (details.expected_lead_time) {
      details.lead_time_variance =
        details.actual_lead_time - details.expected_lead_time;
    }
  }

  // Determine if PO is on track (not overdue and within expected timeframe)
  if (po.status === "ordered" || po.status === "shipped") {
    details.is_on_track =
      !details.is_overdue &&
      (!details.days_until_expected || details.days_until_expected > 0);
  } else if (po.status === "received") {
    // Received orders are on track if they weren't late
    details.is_on_track =
      !details.lead_time_variance || details.lead_time_variance <= 1; // 1-day grace period
  }

  return details;
}

/**
 * Get summary statistics for multiple POs
 *
 * @param pos - Array of purchase orders
 * @returns Summary statistics
 */
export function getPOSummary(pos: PurchaseOrder[]): POSummary {
  let total_value = 0;
  let draft_count = 0;
  let ordered_count = 0;
  let shipped_count = 0;
  let received_count = 0;
  let cancelled_count = 0;
  let overdue_count = 0;

  const leadTimes: number[] = [];

  for (const po of pos) {
    total_value += po.total_cost;

    switch (po.status) {
      case "draft":
        draft_count++;
        break;
      case "ordered":
        ordered_count++;
        break;
      case "shipped":
        shipped_count++;
        break;
      case "received":
        received_count++;
        break;
      case "cancelled":
        cancelled_count++;
        break;
    }

    // Check if overdue
    const details = getPOTrackingDetails(po);
    if (details.is_overdue) {
      overdue_count++;
    }

    // Collect lead times for received orders
    if (details.actual_lead_time) {
      leadTimes.push(details.actual_lead_time);
    }
  }

  const average_lead_time =
    leadTimes.length > 0
      ? leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length
      : undefined;

  return {
    total_pos: pos.length,
    draft_count,
    ordered_count,
    shipped_count,
    received_count,
    cancelled_count,
    overdue_count,
    total_value: Math.round(total_value * 100) / 100,
    average_lead_time: average_lead_time
      ? Math.round(average_lead_time * 10) / 10
      : undefined,
  };
}

/**
 * Get overdue POs (past expected delivery date)
 *
 * @param pos - Array of purchase orders
 * @returns Array of overdue POs with tracking details
 */
export function getOverduePOs(pos: PurchaseOrder[]): POTrackingDetails[] {
  return pos
    .filter((po) => po.status === "ordered" || po.status === "shipped")
    .map((po) => getPOTrackingDetails(po))
    .filter((details) => details.is_overdue === true);
}

/**
 * Get POs expected to arrive soon (within specified days)
 *
 * @param pos - Array of purchase orders
 * @param days - Number of days threshold (default: 7)
 * @returns Array of POs expected soon with tracking details
 */
export function getPOsExpectedSoon(
  pos: PurchaseOrder[],
  days: number = 7,
): POTrackingDetails[] {
  return pos
    .filter((po) => po.status === "ordered" || po.status === "shipped")
    .map((po) => getPOTrackingDetails(po))
    .filter(
      (details) =>
        details.days_until_expected !== undefined &&
        details.days_until_expected >= 0 &&
        details.days_until_expected <= days,
    )
    .sort(
      (a, b) =>
        (a.days_until_expected ?? Infinity) -
        (b.days_until_expected ?? Infinity),
    );
}

/**
 * Calculate lead time accuracy for vendor
 *
 * @param pos - Array of received purchase orders for a vendor
 * @returns Lead time accuracy metrics
 */
export function calculateLeadTimeAccuracy(pos: PurchaseOrder[]): {
  total_orders: number;
  on_time_count: number;
  early_count: number;
  late_count: number;
  accuracy_percentage: number;
  average_variance_days: number;
} {
  const receivedPOs = pos.filter((po) => po.status === "received");

  let on_time_count = 0;
  let early_count = 0;
  let late_count = 0;
  const variances: number[] = [];

  for (const po of receivedPOs) {
    const details = getPOTrackingDetails(po);

    if (details.lead_time_variance !== undefined) {
      variances.push(details.lead_time_variance);

      if (Math.abs(details.lead_time_variance) <= 1) {
        // Within 1 day grace period
        on_time_count++;
      } else if (details.lead_time_variance < 0) {
        early_count++;
      } else {
        late_count++;
      }
    }
  }

  const accuracy_percentage =
    receivedPOs.length > 0
      ? Math.round((on_time_count / receivedPOs.length) * 100)
      : 0;

  const average_variance =
    variances.length > 0
      ? variances.reduce((sum, v) => sum + v, 0) / variances.length
      : 0;

  return {
    total_orders: receivedPOs.length,
    on_time_count,
    early_count,
    late_count,
    accuracy_percentage,
    average_variance_days: Math.round(average_variance * 10) / 10,
  };
}

/**
 * Generate CSV export data for POs
 *
 * @param pos - Array of purchase orders
 * @returns CSV string
 */
export function exportPOsToCSV(pos: PurchaseOrder[]): string {
  const headers = [
    "PO Number",
    "Vendor",
    "SKU",
    "Product",
    "Quantity",
    "Cost Per Unit",
    "Total Cost",
    "Status",
    "Ordered Date",
    "Expected Delivery",
    "Actual Delivery",
    "Lead Time (days)",
    "Notes",
  ];

  const rows = pos.map((po) => {
    const details = getPOTrackingDetails(po);
    return [
      po.po_number,
      po.vendor_name,
      po.sku,
      po.product_name,
      po.quantity.toString(),
      po.cost_per_unit.toFixed(2),
      po.total_cost.toFixed(2),
      po.status,
      po.ordered_date?.toISOString().split("T")[0] ?? "",
      po.expected_delivery_date?.toISOString().split("T")[0] ?? "",
      po.actual_delivery_date?.toISOString().split("T")[0] ?? "",
      details.actual_lead_time?.toString() ?? "",
      (po.notes ?? "").replace(/"/g, '""'), // Escape quotes
    ];
  });

  const csvLines = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ];

  return csvLines.join("\n");
}

/**
 * Get purchase order tracking for a product (API helper for INVENTORY-006)
 *
 * In production: fetch from database by productId
 * For now: returns mock PO data
 *
 * @param productId - Product identifier
 * @returns Promise resolving to array of purchase orders
 */
export async function getPOTracking(productId: string): Promise<
  Array<{
    po_number: string;
    status: POStatus;
    quantity: number;
    expected_delivery_date: string;
    days_until_expected?: number;
  }>
> {
  // Mock PO data (in production: query database)
  const today = new Date();
  const expectedDate = new Date(today);
  expectedDate.setDate(expectedDate.getDate() + 5); // Expected in 5 days

  return [
    {
      po_number: "PO-2025-001",
      status: "shipped" as POStatus,
      quantity: 100,
      expected_delivery_date: expectedDate.toISOString(),
      days_until_expected: 5,
    },
  ];
}
