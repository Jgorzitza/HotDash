/**
 * Customer Lifetime Value (CLV) Calculator
 *
 * Calculates predicted customer lifetime value using historical data.
 * Supports multiple calculation methods.
 */

export interface CLVResult {
  customerId?: string;
  predictedCLV: number;
  actualCLV?: number;
  confidence: number;
  method: "historical" | "predictive" | "cohort";
  breakdown: {
    avgOrderValue: number;
    purchaseFrequency: number;
    customerLifespan: number;
  };
}

/**
 * Calculate CLV using historical method
 * CLV = AOV × Purchase Frequency × Customer Lifespan
 */
export function calculateHistoricalCLV(
  avgOrderValue: number,
  purchaseFrequency: number,
  customerLifespanMonths: number,
): CLVResult {
  const clv = avgOrderValue * purchaseFrequency * (customerLifespanMonths / 12);

  return {
    predictedCLV: clv,
    confidence: 0.7,
    method: "historical",
    breakdown: {
      avgOrderValue,
      purchaseFrequency,
      customerLifespan: customerLifespanMonths,
    },
  };
}

/**
 * Calculate average CLV for all customers
 */
export function calculateAverageCLV(): CLVResult {
  // Mock data - typical automotive accessories customer
  const avgOrderValue = 85.5;
  const purchaseFrequency = 2.3; // purchases per year
  const customerLifespanMonths = 24; // 2 years average

  return calculateHistoricalCLV(
    avgOrderValue,
    purchaseFrequency,
    customerLifespanMonths,
  );
}

/**
 * Segment CLV by customer tier
 */
export function getCLVBySegment(): Record<string, CLVResult> {
  return {
    high_value: calculateHistoricalCLV(250, 4.5, 36), // High spenders
    regular: calculateHistoricalCLV(85, 2.3, 24), // Average
    occasional: calculateHistoricalCLV(45, 1.2, 12), // Low frequency
  };
}
