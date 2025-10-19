/**
 * Ads Metrics Calculations
 *
 * Provides helper functions for calculating advertising performance metrics
 * with proper zero-guards to prevent division by zero errors.
 *
 * @module app/lib/ads/metrics
 */

/**
 * Calculate Return on Ad Spend (ROAS)
 * ROAS = Revenue / Ad Spend
 *
 * @param revenue - Total revenue generated from ads (in currency)
 * @param spend - Total advertising spend (in currency)
 * @returns ROAS value or 0 if spend is zero
 *
 * @example
 * calculateROAS(1000, 250) // Returns 4.0 (4x return)
 * calculateROAS(0, 100) // Returns 0 (no revenue)
 * calculateROAS(500, 0) // Returns 0 (zero-guard)
 */
export function calculateROAS(revenue: number, spend: number): number {
  if (spend === 0 || spend < 0) return 0;
  if (revenue < 0) return 0;
  return revenue / spend;
}

/**
 * Calculate Cost Per Click (CPC)
 * CPC = Total Spend / Total Clicks
 *
 * @param spend - Total advertising spend (in currency)
 * @param clicks - Total number of clicks received
 * @returns CPC value or 0 if clicks is zero
 *
 * @example
 * calculateCPC(100, 50) // Returns 2.0 ($2 per click)
 * calculateCPC(100, 0) // Returns 0 (zero-guard)
 */
export function calculateCPC(spend: number, clicks: number): number {
  if (clicks === 0 || clicks < 0) return 0;
  if (spend < 0) return 0;
  return spend / clicks;
}

/**
 * Calculate Cost Per Acquisition (CPA)
 * CPA = Total Spend / Total Conversions
 *
 * @param spend - Total advertising spend (in currency)
 * @param conversions - Total number of conversions/acquisitions
 * @returns CPA value or 0 if conversions is zero
 *
 * @example
 * calculateCPA(500, 25) // Returns 20.0 ($20 per acquisition)
 * calculateCPA(500, 0) // Returns 0 (zero-guard)
 */
export function calculateCPA(spend: number, conversions: number): number {
  if (conversions === 0 || conversions < 0) return 0;
  if (spend < 0) return 0;
  return spend / conversions;
}

/**
 * Calculate Click-Through Rate (CTR)
 * CTR = (Clicks / Impressions) * 100
 *
 * @param clicks - Total number of clicks received
 * @param impressions - Total number of impressions/views
 * @returns CTR as a percentage or 0 if impressions is zero
 *
 * @example
 * calculateCTR(50, 1000) // Returns 5.0 (5% CTR)
 * calculateCTR(0, 1000) // Returns 0 (no clicks)
 * calculateCTR(50, 0) // Returns 0 (zero-guard)
 */
export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0 || impressions < 0) return 0;
  if (clicks < 0) return 0;
  return (clicks / impressions) * 100;
}

/**
 * Calculate Conversion Rate
 * Conversion Rate = (Conversions / Clicks) * 100
 *
 * @param conversions - Total number of conversions
 * @param clicks - Total number of clicks received
 * @returns Conversion rate as a percentage or 0 if clicks is zero
 *
 * @example
 * calculateConversionRate(10, 100) // Returns 10.0 (10% conversion rate)
 * calculateConversionRate(0, 100) // Returns 0 (no conversions)
 * calculateConversionRate(10, 0) // Returns 0 (zero-guard)
 */
export function calculateConversionRate(
  conversions: number,
  clicks: number,
): number {
  if (clicks === 0 || clicks < 0) return 0;
  if (conversions < 0) return 0;
  return (conversions / clicks) * 100;
}

/**
 * Format currency value for display
 *
 * @param value - Numeric value to format
 * @param currency - Currency code (default: USD)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // Returns "$1,234.56"
 * formatCurrency(1000, "EUR") // Returns "€1,000.00"
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Format percentage for display
 *
 * @param value - Numeric value (already as percentage, e.g., 5.5 for 5.5%)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(5.5) // Returns "5.50%"
 * formatPercentage(12.345, 1) // Returns "12.3%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calculate all ad metrics at once
 *
 * @param data - Input data with spend, revenue, clicks, conversions
 * @returns Calculated metrics object
 *
 * @example
 * calculateAdMetrics({ spend: 100, revenue: 500, clicks: 50, conversions: 10 })
 * // Returns { spend: 100, revenue: 500, clicks: 50, conversions: 10, roas: 5, cpc: 2, cpa: 10 }
 */
export function calculateAdMetrics(data: {
  spend: number;
  revenue: number;
  clicks: number;
  conversions: number;
}): {
  spend: number;
  revenue: number;
  clicks: number;
  conversions: number;
  roas: number;
  cpc: number;
  cpa: number;
} {
  return {
    spend: data.spend,
    revenue: data.revenue,
    clicks: data.clicks,
    conversions: data.conversions,
    roas: calculateROAS(data.revenue, data.spend),
    cpc: calculateCPC(data.spend, data.clicks),
    cpa: calculateCPA(data.spend, data.conversions),
  };
}
