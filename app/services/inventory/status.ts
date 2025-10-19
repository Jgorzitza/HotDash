/**
 * Inventory Status Bucket Logic
 *
 * Classifies inventory into status buckets based on current quantity vs ROP
 * and safety stock thresholds.
 */

/**
 * Inventory status buckets
 * - in_stock: Healthy stock levels above ROP
 * - low_stock: Below ROP but above safety stock (reorder soon)
 * - out_of_stock: Zero or negative inventory
 * - urgent_reorder: At or below safety stock (critical)
 */
export type InventoryStatus =
  | "in_stock"
  | "low_stock"
  | "out_of_stock"
  | "urgent_reorder";

export interface InventoryStatusInput {
  onHand: number;
  reorderPoint: number;
  safetyStock: number;
}

export interface InventoryStatusResult extends InventoryStatusInput {
  status: InventoryStatus;
  daysOfCover: number | null;
  recommendedOrderQuantity: number;
}

export interface InventoryRecommendation {
  shouldReorder: boolean;
  urgency: "none" | "low" | "medium" | "high" | "critical";
  message: string;
  orderQuantity: number;
}

/**
 * Evaluate inventory status based on current quantity vs thresholds
 *
 * @param onHand - Current quantity in stock
 * @param reorderPoint - ROP threshold
 * @param safetyStock - Safety stock threshold
 * @returns Status bucket classification
 *
 * @example
 * ```typescript
 * // Healthy stock
 * evaluateInventoryStatus(100, 50, 20);
 * // Returns: "in_stock"
 *
 * // Below ROP
 * evaluateInventoryStatus(40, 50, 20);
 * // Returns: "low_stock"
 *
 * // Critical level
 * evaluateInventoryStatus(15, 50, 20);
 * // Returns: "urgent_reorder"
 *
 * // Out of stock
 * evaluateInventoryStatus(0, 50, 20);
 * // Returns: "out_of_stock"
 * ```
 */
export function evaluateInventoryStatus(
  onHand: number,
  reorderPoint: number,
  safetyStock: number,
): InventoryStatus {
  // Out of stock takes highest priority
  if (onHand <= 0) {
    return "out_of_stock";
  }

  // Urgent reorder when at or below safety stock
  if (onHand <= safetyStock) {
    return "urgent_reorder";
  }

  // Low stock when below ROP but above safety stock
  if (onHand <= reorderPoint) {
    return "low_stock";
  }

  // Otherwise in stock
  return "in_stock";
}

/**
 * Calculate days of cover (how many days current stock will last)
 *
 * @param onHand - Current quantity in stock
 * @param averageDailySales - Average units sold per day
 * @returns Days of cover (rounded to 2 decimals) or null if sales data unavailable
 *
 * @example
 * ```typescript
 * calculateDaysOfCover(100, 10);
 * // Returns: 10.00 (100 units / 10 per day)
 *
 * calculateDaysOfCover(83, 7);
 * // Returns: 11.86
 *
 * calculateDaysOfCover(50, 0);
 * // Returns: null (no sales data)
 * ```
 */
export function calculateDaysOfCover(
  onHand: number,
  averageDailySales: number,
): number | null {
  if (averageDailySales <= 0) {
    return null;
  }

  return roundToTwo(onHand / averageDailySales);
}

/**
 * Calculate recommended order quantity
 *
 * Formula: (ROP + Safety Stock) - (On Hand + Incoming)
 *
 * @param params - Inventory parameters
 * @returns Recommended units to order (minimum 0)
 *
 * @example
 * ```typescript
 * recommendOrderQuantity({
 *   onHand: 30,
 *   incoming: 10,
 *   reorderPoint: 60,
 *   safetyStock: 20
 * });
 * // Target: 60 + 20 = 80
 * // Current: 30 + 10 = 40
 * // Order: 80 - 40 = 40
 * ```
 */
export function recommendOrderQuantity(params: {
  onHand: number;
  incoming?: number;
  reorderPoint: number;
  safetyStock: number;
}): number {
  const { onHand, incoming = 0, reorderPoint, safetyStock } = params;

  const projected = onHand + incoming;
  const target = reorderPoint + safetyStock;

  return Math.max(0, Math.floor(target - projected));
}

/**
 * Get complete inventory status with recommendations
 *
 * @param params - Inventory parameters including sales data
 * @returns Complete status assessment with recommendations
 *
 * @example
 * ```typescript
 * const assessment = getInventoryStatus({
 *   onHand: 25,
 *   reorderPoint: 60,
 *   safetyStock: 20,
 *   averageDailySales: 8,
 *   incoming: 10
 * });
 * // Returns: {
 * //   status: "low_stock",
 * //   daysOfCover: 3.13,
 * //   recommendedOrderQuantity: 45,
 * //   ...
 * // }
 * ```
 */
export function getInventoryStatus(
  params: InventoryStatusInput & {
    averageDailySales?: number;
    incoming?: number;
  },
): InventoryStatusResult {
  const {
    onHand,
    reorderPoint,
    safetyStock,
    averageDailySales = 0,
    incoming = 0,
  } = params;

  const status = evaluateInventoryStatus(onHand, reorderPoint, safetyStock);
  const daysOfCover = calculateDaysOfCover(onHand, averageDailySales);
  const recommendedOrderQuantity = recommendOrderQuantity({
    onHand,
    incoming,
    reorderPoint,
    safetyStock,
  });

  return {
    onHand,
    reorderPoint,
    safetyStock,
    status,
    daysOfCover,
    recommendedOrderQuantity,
  };
}

/**
 * Get reorder recommendation with urgency level
 *
 * @param status - Inventory status from evaluateInventoryStatus
 * @param daysOfCover - Days of cover (can be null)
 * @returns Recommendation with urgency and message
 *
 * @example
 * ```typescript
 * getReorderRecommendation("urgent_reorder", 2.5);
 * // Returns: {
 * //   shouldReorder: true,
 * //   urgency: "critical",
 * //   message: "CRITICAL: Stock at safety stock level. Order immediately.",
 * //   ...
 * // }
 * ```
 */
export function getReorderRecommendation(
  status: InventoryStatus,
  daysOfCover: number | null,
  orderQuantity: number,
): InventoryRecommendation {
  switch (status) {
    case "out_of_stock":
      return {
        shouldReorder: true,
        urgency: "critical",
        message: "OUT OF STOCK. Emergency order required immediately.",
        orderQuantity,
      };

    case "urgent_reorder":
      return {
        shouldReorder: true,
        urgency: "critical",
        message:
          "CRITICAL: Stock at or below safety stock level. Order immediately.",
        orderQuantity,
      };

    case "low_stock": {
      const urgency =
        daysOfCover !== null && daysOfCover < 7 ? "high" : "medium";
      const message =
        urgency === "high"
          ? `LOW STOCK: Less than ${daysOfCover?.toFixed(1)} days of cover. Reorder recommended.`
          : "Low stock: Below reorder point. Reorder recommended.";

      return {
        shouldReorder: true,
        urgency,
        message,
        orderQuantity,
      };
    }

    case "in_stock":
    default:
      return {
        shouldReorder: false,
        urgency: "none",
        message: "Stock levels healthy. No action needed.",
        orderQuantity: 0,
      };
  }
}

/**
 * Filter inventory items by status bucket
 *
 * @param items - Array of items with status
 * @param status - Status bucket to filter by
 * @returns Filtered items matching status
 */
export function filterByStatus<T extends { status: InventoryStatus }>(
  items: T[],
  status: InventoryStatus,
): T[] {
  return items.filter((item) => item.status === status);
}

/**
 * Group inventory items by status bucket
 *
 * @param items - Array of items with status
 * @returns Items grouped by status bucket
 */
export function groupByStatus<T extends { status: InventoryStatus }>(
  items: T[],
): Record<InventoryStatus, T[]> {
  return items.reduce(
    (acc, item) => {
      acc[item.status].push(item);
      return acc;
    },
    {
      in_stock: [] as T[],
      low_stock: [] as T[],
      out_of_stock: [] as T[],
      urgent_reorder: [] as T[],
    },
  );
}

/**
 * Calculate inventory health metrics across all items
 *
 * @param items - Array of inventory items with status
 * @returns Health metrics summary
 */
export function calculateInventoryMetrics<
  T extends { status: InventoryStatus },
>(
  items: T[],
): {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  urgentReorder: number;
  healthPercentage: number;
} {
  const grouped = groupByStatus(items);

  const total = items.length;
  const inStock = grouped.in_stock.length;
  const lowStock = grouped.low_stock.length;
  const outOfStock = grouped.out_of_stock.length;
  const urgentReorder = grouped.urgent_reorder.length;

  const healthPercentage = total > 0 ? roundToTwo((inStock / total) * 100) : 0;

  return {
    total,
    inStock,
    lowStock,
    outOfStock,
    urgentReorder,
    healthPercentage,
  };
}

/**
 * Round number to 2 decimal places
 */
function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}
