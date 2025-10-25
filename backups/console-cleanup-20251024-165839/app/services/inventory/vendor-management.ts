/**
 * Vendor Management Service (INVENTORY-003)
 *
 * Tracks vendor performance metrics for optimal supplier selection:
 * - Lead time tracking (order to delivery)
 * - Reliability scoring (on-time delivery %)
 * - Cost comparison across vendors
 * - Preferred vendor recommendations
 *
 * Context7 Source: /microsoft/typescript (type definitions)
 */

export interface Vendor {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  notes?: string;
}

export interface VendorPerformanceMetrics {
  vendor_id: string;
  vendor_name: string;
  total_orders: number;
  completed_orders: number;
  on_time_deliveries: number;
  late_deliveries: number;
  average_lead_time_days: number;
  expected_lead_time_days: number;
  lead_time_variance: number; // Standard deviation of actual lead times
  reliability_score: number; // 0-100 (percentage of on-time deliveries)
  average_cost_per_unit: number;
  last_order_date?: Date;
  last_delivery_date?: Date;
}

export interface VendorComparison {
  sku: string;
  vendors: Array<{
    vendor_id: string;
    vendor_name: string;
    cost_per_unit: number;
    lead_time_days: number;
    reliability_score: number;
    total_score: number; // Composite score (0-100)
    recommended: boolean; // True for best overall vendor
  }>;
  preferred_vendor_id: string;
  preferred_vendor_name: string;
}

export interface VendorOrder {
  order_id: string;
  vendor_id: string;
  sku: string;
  quantity: number;
  cost_per_unit: number;
  total_cost: number;
  order_date: Date;
  expected_delivery_date: Date;
  actual_delivery_date?: Date;
  status: "ordered" | "shipped" | "delivered" | "cancelled";
}

/**
 * Calculate lead time in days between two dates
 *
 * @param orderDate - Date order was placed
 * @param deliveryDate - Date order was delivered
 * @returns Lead time in days
 */
export function calculateLeadTime(orderDate: Date, deliveryDate: Date): number {
  const diffMs = deliveryDate.getTime() - orderDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  return Math.round(diffDays * 10) / 10; // Round to 1 decimal
}

/**
 * Determine if delivery was on time
 *
 * @param expectedDate - Expected delivery date
 * @param actualDate - Actual delivery date
 * @param gracePeriodDays - Grace period in days (default: 1)
 * @returns True if on time (within grace period)
 */
export function isOnTimeDelivery(
  expectedDate: Date,
  actualDate: Date,
  gracePeriodDays: number = 1,
): boolean {
  const gracePeriodMs = gracePeriodDays * 24 * 60 * 60 * 1000;
  const expectedWithGrace = new Date(expectedDate.getTime() + gracePeriodMs);
  return actualDate <= expectedWithGrace;
}

/**
 * Calculate vendor performance metrics from order history
 *
 * @param vendor - Vendor information
 * @param orders - Array of vendor orders
 * @returns Performance metrics
 */
export function calculateVendorPerformance(
  vendor: Vendor,
  orders: VendorOrder[],
): VendorPerformanceMetrics {
  // Filter completed orders only
  const completedOrders = orders.filter((o) => o.status === "delivered");

  if (completedOrders.length === 0) {
    return {
      vendor_id: vendor.id,
      vendor_name: vendor.name,
      total_orders: orders.length,
      completed_orders: 0,
      on_time_deliveries: 0,
      late_deliveries: 0,
      average_lead_time_days: 0,
      expected_lead_time_days: 0,
      lead_time_variance: 0,
      reliability_score: 0,
      average_cost_per_unit: 0,
    };
  }

  // Calculate lead times for completed orders
  const leadTimes = completedOrders
    .filter((o) => o.actual_delivery_date)
    .map((o) => calculateLeadTime(o.order_date, o.actual_delivery_date!));

  const averageLeadTime =
    leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;

  // Calculate expected lead time (average of expected - order date)
  const expectedLeadTimes = completedOrders.map((o) =>
    calculateLeadTime(o.order_date, o.expected_delivery_date),
  );
  const expectedLeadTime =
    expectedLeadTimes.reduce((sum, lt) => sum + lt, 0) /
    expectedLeadTimes.length;

  // Calculate lead time variance (standard deviation)
  const leadTimeVariance = Math.sqrt(
    leadTimes
      .map((lt) => Math.pow(lt - averageLeadTime, 2))
      .reduce((sum, sq) => sum + sq, 0) / leadTimes.length,
  );

  // Count on-time deliveries
  let onTimeCount = 0;
  let lateCount = 0;

  for (const order of completedOrders) {
    if (order.actual_delivery_date) {
      if (
        isOnTimeDelivery(
          order.expected_delivery_date,
          order.actual_delivery_date,
        )
      ) {
        onTimeCount++;
      } else {
        lateCount++;
      }
    }
  }

  // Calculate reliability score (percentage of on-time deliveries)
  const reliabilityScore =
    completedOrders.length > 0
      ? Math.round((onTimeCount / completedOrders.length) * 100)
      : 0;

  // Calculate average cost per unit
  const totalCost = completedOrders.reduce((sum, o) => sum + o.total_cost, 0);
  const totalQuantity = completedOrders.reduce((sum, o) => sum + o.quantity, 0);
  const averageCostPerUnit = totalQuantity > 0 ? totalCost / totalQuantity : 0;

  // Get last order and delivery dates
  const sortedOrders = [...orders].sort(
    (a, b) => b.order_date.getTime() - a.order_date.getTime(),
  );
  const lastOrderDate =
    sortedOrders.length > 0 ? sortedOrders[0].order_date : undefined;

  const deliveredOrders = completedOrders.filter((o) => o.actual_delivery_date);
  const sortedDeliveries = deliveredOrders.sort(
    (a, b) =>
      b.actual_delivery_date!.getTime() - a.actual_delivery_date!.getTime(),
  );
  const lastDeliveryDate =
    sortedDeliveries.length > 0
      ? sortedDeliveries[0].actual_delivery_date
      : undefined;

  return {
    vendor_id: vendor.id,
    vendor_name: vendor.name,
    total_orders: orders.length,
    completed_orders: completedOrders.length,
    on_time_deliveries: onTimeCount,
    late_deliveries: lateCount,
    average_lead_time_days: Math.round(averageLeadTime * 10) / 10,
    expected_lead_time_days: Math.round(expectedLeadTime * 10) / 10,
    lead_time_variance: Math.round(leadTimeVariance * 10) / 10,
    reliability_score: reliabilityScore,
    average_cost_per_unit: Math.round(averageCostPerUnit * 100) / 100,
    last_order_date: lastOrderDate,
    last_delivery_date: lastDeliveryDate,
  };
}

/**
 * Calculate composite vendor score (0-100)
 *
 * Weighted scoring:
 * - Reliability: 50% (on-time delivery rate)
 * - Lead Time: 30% (faster is better)
 * - Cost: 20% (lower is better)
 *
 * @param metrics - Vendor performance metrics
 * @param benchmarkLeadTime - Benchmark lead time for comparison (e.g., industry average)
 * @param benchmarkCost - Benchmark cost for comparison
 * @returns Composite score (0-100)
 */
export function calculateVendorScore(
  metrics: VendorPerformanceMetrics,
  benchmarkLeadTime: number,
  benchmarkCost: number,
): number {
  // Reliability score (0-100, already calculated)
  const reliabilityScore = metrics.reliability_score;

  // Lead time score (0-100, inverse - lower lead time is better)
  // If lead time is at or below benchmark, score 100
  // If lead time is 2x benchmark, score 0
  let leadTimeScore = 0;
  if (benchmarkLeadTime > 0) {
    const leadTimeRatio = metrics.average_lead_time_days / benchmarkLeadTime;
    leadTimeScore = Math.max(0, Math.min(100, (2 - leadTimeRatio) * 100));
  }

  // Cost score (0-100, inverse - lower cost is better)
  // If cost is at or below benchmark, score 100
  // If cost is 2x benchmark, score 0
  let costScore = 0;
  if (benchmarkCost > 0) {
    const costRatio = metrics.average_cost_per_unit / benchmarkCost;
    costScore = Math.max(0, Math.min(100, (2 - costRatio) * 100));
  }

  // Weighted composite score
  const compositeScore =
    reliabilityScore * 0.5 + // 50% weight on reliability
    leadTimeScore * 0.3 + // 30% weight on lead time
    costScore * 0.2; // 20% weight on cost

  return Math.round(compositeScore);
}

/**
 * Compare vendors for a specific SKU
 *
 * @param sku - Product SKU
 * @param vendors - Array of vendors with their metrics
 * @param benchmarkLeadTime - Benchmark lead time for scoring
 * @param benchmarkCost - Benchmark cost for scoring
 * @returns Vendor comparison with recommended vendor
 */
export function compareVendorsForSKU(
  sku: string,
  vendors: Array<{
    vendor: Vendor;
    metrics: VendorPerformanceMetrics;
  }>,
  benchmarkLeadTime?: number,
  benchmarkCost?: number,
): VendorComparison {
  // Calculate benchmark values if not provided
  const avgLeadTime =
    benchmarkLeadTime ??
    vendors.reduce((sum, v) => sum + v.metrics.average_lead_time_days, 0) /
      vendors.length;

  const avgCost =
    benchmarkCost ??
    vendors.reduce((sum, v) => sum + v.metrics.average_cost_per_unit, 0) /
      vendors.length;

  // Calculate scores for each vendor
  const vendorScores = vendors.map((v) => {
    const score = calculateVendorScore(v.metrics, avgLeadTime, avgCost);

    return {
      vendor_id: v.vendor.id,
      vendor_name: v.vendor.name,
      cost_per_unit: v.metrics.average_cost_per_unit,
      lead_time_days: v.metrics.average_lead_time_days,
      reliability_score: v.metrics.reliability_score,
      total_score: score,
      recommended: false, // Will be set for best vendor
    };
  });

  // Sort by total score (highest first)
  vendorScores.sort((a, b) => b.total_score - a.total_score);

  // Mark best vendor as recommended
  if (vendorScores.length > 0) {
    vendorScores[0].recommended = true;
  }

  return {
    sku,
    vendors: vendorScores,
    preferred_vendor_id: vendorScores[0]?.vendor_id ?? "",
    preferred_vendor_name: vendorScores[0]?.vendor_name ?? "",
  };
}

/**
 * Get vendor ranking summary across all SKUs
 *
 * @param vendors - Array of vendors with their overall metrics
 * @returns Ranked vendors with scores
 */
export function rankVendors(
  vendors: Array<{
    vendor: Vendor;
    metrics: VendorPerformanceMetrics;
  }>,
): Array<{
  vendor_id: string;
  vendor_name: string;
  reliability_score: number;
  average_lead_time_days: number;
  average_cost_per_unit: number;
  total_orders: number;
  rank: number;
}> {
  // Calculate overall benchmark values
  const avgLeadTime =
    vendors.reduce((sum, v) => sum + v.metrics.average_lead_time_days, 0) /
    vendors.length;
  const avgCost =
    vendors.reduce((sum, v) => sum + v.metrics.average_cost_per_unit, 0) /
    vendors.length;

  // Calculate scores and rank
  const ranked = vendors
    .map((v) => ({
      vendor_id: v.vendor.id,
      vendor_name: v.vendor.name,
      reliability_score: v.metrics.reliability_score,
      average_lead_time_days: v.metrics.average_lead_time_days,
      average_cost_per_unit: v.metrics.average_cost_per_unit,
      total_orders: v.metrics.total_orders,
      score: calculateVendorScore(v.metrics, avgLeadTime, avgCost),
      rank: 0,
    }))
    .sort((a, b) => b.score - a.score)
    .map((v, index) => ({
      ...v,
      rank: index + 1,
    }));

  return ranked;
}

/**
 * Identify vendors with performance issues
 *
 * Issues flagged:
 * - Low reliability (< 80% on-time)
 * - High lead time variance (inconsistent delivery)
 * - No recent orders (> 90 days)
 *
 * @param metrics - Vendor performance metrics
 * @returns Array of performance issues
 */
export function identifyVendorIssues(metrics: VendorPerformanceMetrics): Array<{
  issue_type: "low_reliability" | "high_variance" | "inactive";
  severity: "high" | "medium" | "low";
  description: string;
}> {
  const issues: Array<{
    issue_type: "low_reliability" | "high_variance" | "inactive";
    severity: "high" | "medium" | "low";
    description: string;
  }> = [];

  // Check reliability
  if (metrics.reliability_score < 60) {
    issues.push({
      issue_type: "low_reliability",
      severity: "high",
      description: `Low on-time delivery rate: ${metrics.reliability_score}% (${metrics.on_time_deliveries}/${metrics.completed_orders} orders)`,
    });
  } else if (metrics.reliability_score < 80) {
    issues.push({
      issue_type: "low_reliability",
      severity: "medium",
      description: `Below target on-time delivery rate: ${metrics.reliability_score}% (target: 80%)`,
    });
  }

  // Check lead time variance (high variance = inconsistent)
  const varianceThreshold = metrics.average_lead_time_days * 0.3; // 30% of average
  if (metrics.lead_time_variance > varianceThreshold) {
    issues.push({
      issue_type: "high_variance",
      severity: "medium",
      description: `Inconsistent lead times: ${metrics.lead_time_variance} days variance (avg: ${metrics.average_lead_time_days} days)`,
    });
  }

  // Check for inactive vendors (no orders in last 90 days)
  if (metrics.last_order_date) {
    const daysSinceLastOrder =
      (Date.now() - metrics.last_order_date.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastOrder > 90) {
      issues.push({
        issue_type: "inactive",
        severity: "low",
        description: `No recent orders: Last order ${Math.round(daysSinceLastOrder)} days ago`,
      });
    }
  }

  return issues;
}

/**
 * Get vendor information for a product (API helper for INVENTORY-006)
 *
 * In production: fetch from database by productId
 * For now: returns mock vendor data
 *
 * @param productId - Product identifier
 * @returns Promise resolving to vendor information
 */
export async function getVendorInfo(productId: string): Promise<{
  vendor_id: string;
  vendor_name: string;
  cost_per_unit: number;
  lead_time_days: number;
  reliability_score: number;
  last_order_date: string;
}> {
  // Mock vendor data (in production: query database)
  return {
    vendor_id: "vendor_001",
    vendor_name: "Premium Suppliers Inc.",
    cost_per_unit: 24.99,
    lead_time_days: 7,
    reliability_score: 92,
    last_order_date: new Date(
      Date.now() - 15 * 24 * 60 * 60 * 1000,
    ).toISOString(), // 15 days ago
  };
}
