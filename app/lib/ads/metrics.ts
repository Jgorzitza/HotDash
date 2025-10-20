/**
 * Ads Metrics Calculations
 *
 * Core advertising metrics calculations with zero-guards to prevent division by zero errors.
 * All monetary values are in cents to avoid floating-point precision issues.
 *
 * Metrics:
 * - ROAS (Return On Ad Spend): revenue / spend
 * - CPC (Cost Per Click): spend / clicks
 * - CPA (Cost Per Acquisition): spend / conversions
 * - CTR (Click-Through Rate): clicks / impressions
 * - Conversion Rate: conversions / clicks
 */

/**
 * Calculate Return On Ad Spend (ROAS)
 *
 * ROAS measures the revenue generated for every dollar spent on advertising.
 * A ROAS of 3.0 means $3 in revenue for every $1 spent.
 *
 * @param revenueCents - Total revenue attributed to campaign (in cents)
 * @param spendCents - Total ad spend (in cents)
 * @returns ROAS as a decimal (e.g., 3.5 = 3.5x), or null if spend is zero
 *
 * @example
 * calculateROAS(1000000, 250000) // Returns 4.0 (4x ROAS)
 * calculateROAS(500000, 0) // Returns null (no spend)
 */
export function calculateROAS(
  revenueCents: number,
  spendCents: number,
): number | null {
  // Zero-guard: cannot calculate ROAS if no money was spent
  if (spendCents === 0) {
    return null;
  }

  // Calculate ROAS as revenue divided by spend
  const roas = revenueCents / spendCents;

  // Round to 2 decimal places for readability
  return Math.round(roas * 100) / 100;
}

/**
 * Calculate Cost Per Click (CPC)
 *
 * CPC measures the average cost for each click on an ad.
 * Lower CPC generally indicates more efficient ad targeting.
 *
 * @param spendCents - Total ad spend (in cents)
 * @param clicks - Total number of clicks
 * @returns CPC in cents, or null if clicks is zero
 *
 * @example
 * calculateCPC(100000, 500) // Returns 200 ($2.00 per click)
 * calculateCPC(50000, 0) // Returns null (no clicks)
 */
export function calculateCPC(
  spendCents: number,
  clicks: number,
): number | null {
  // Zero-guard: cannot calculate CPC if there were no clicks
  if (clicks === 0) {
    return null;
  }

  // Calculate CPC as spend divided by clicks
  const cpc = spendCents / clicks;

  // Round to nearest cent
  return Math.round(cpc);
}

/**
 * Calculate Cost Per Acquisition (CPA)
 *
 * CPA measures the average cost to acquire one customer/conversion.
 * Also known as Cost Per Conversion.
 *
 * @param spendCents - Total ad spend (in cents)
 * @param conversions - Total number of conversions
 * @returns CPA in cents, or null if conversions is zero
 *
 * @example
 * calculateCPA(250000, 50) // Returns 5000 ($50.00 per conversion)
 * calculateCPA(100000, 0) // Returns null (no conversions)
 */
export function calculateCPA(
  spendCents: number,
  conversions: number,
): number | null {
  // Zero-guard: cannot calculate CPA if there were no conversions
  if (conversions === 0) {
    return null;
  }

  // Calculate CPA as spend divided by conversions
  const cpa = spendCents / conversions;

  // Round to nearest cent
  return Math.round(cpa);
}

/**
 * Calculate Click-Through Rate (CTR)
 *
 * CTR measures the percentage of impressions that resulted in clicks.
 * A higher CTR indicates more engaging ad creative and targeting.
 *
 * @param clicks - Total number of clicks
 * @param impressions - Total number of impressions
 * @returns CTR as a decimal (e.g., 0.035 = 3.5%), or null if impressions is zero
 *
 * @example
 * calculateCTR(350, 10000) // Returns 0.035 (3.5% CTR)
 * calculateCTR(100, 0) // Returns null (no impressions)
 */
export function calculateCTR(
  clicks: number,
  impressions: number,
): number | null {
  // Zero-guard: cannot calculate CTR if there were no impressions
  if (impressions === 0) {
    return null;
  }

  // Calculate CTR as clicks divided by impressions
  const ctr = clicks / impressions;

  // Round to 4 decimal places (e.g., 0.0325 = 3.25%)
  return Math.round(ctr * 10000) / 10000;
}

/**
 * Calculate Conversion Rate
 *
 * Conversion rate measures the percentage of clicks that resulted in conversions.
 * A higher conversion rate indicates effective landing pages and offers.
 *
 * @param conversions - Total number of conversions
 * @param clicks - Total number of clicks
 * @returns Conversion rate as a decimal (e.g., 0.04 = 4%), or null if clicks is zero
 *
 * @example
 * calculateConversionRate(40, 1000) // Returns 0.04 (4% conversion rate)
 * calculateConversionRate(10, 0) // Returns null (no clicks)
 */
export function calculateConversionRate(
  conversions: number,
  clicks: number,
): number | null {
  // Zero-guard: cannot calculate conversion rate if there were no clicks
  if (clicks === 0) {
    return null;
  }

  // Calculate conversion rate as conversions divided by clicks
  const conversionRate = conversions / clicks;

  // Round to 4 decimal places (e.g., 0.0425 = 4.25%)
  return Math.round(conversionRate * 10000) / 10000;
}

/**
 * Calculate all metrics for a campaign
 *
 * Convenience function that calculates all standard advertising metrics
 * from raw campaign data.
 *
 * @param data - Campaign metrics data
 * @returns Object with all calculated metrics
 *
 * @example
 * calculateAllMetrics({
 *   spend_cents: 100000,
 *   revenue_cents: 300000,
 *   impressions: 50000,
 *   clicks: 1500,
 *   conversions: 60
 * })
 * // Returns: { roas: 3.0, cpc: 67, cpa: 1667, ctr: 0.03, conversionRate: 0.04 }
 */
export function calculateAllMetrics(data: {
  spend_cents: number;
  revenue_cents: number;
  impressions: number;
  clicks: number;
  conversions: number;
}): {
  roas: number | null;
  cpc: number | null;
  cpa: number | null;
  ctr: number | null;
  conversionRate: number | null;
} {
  return {
    roas: calculateROAS(data.revenue_cents, data.spend_cents),
    cpc: calculateCPC(data.spend_cents, data.clicks),
    cpa: calculateCPA(data.spend_cents, data.conversions),
    ctr: calculateCTR(data.clicks, data.impressions),
    conversionRate: calculateConversionRate(data.conversions, data.clicks),
  };
}

/**
 * Format cents to dollars
 *
 * Helper function to convert cents to dollar string for display.
 *
 * @param cents - Amount in cents
 * @returns Formatted dollar string (e.g., "$12.50")
 *
 * @example
 * formatCentsToDollars(1250) // Returns "$12.50"
 * formatCentsToDollars(100) // Returns "$1.00"
 */
export function formatCentsToDollars(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toFixed(2)}`;
}

/**
 * Format percentage
 *
 * Helper function to format decimal percentages for display.
 *
 * @param decimal - Decimal value (e.g., 0.0325 for 3.25%)
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted percentage string (e.g., "3.25%")
 *
 * @example
 * formatPercentage(0.0325) // Returns "3.25%"
 * formatPercentage(0.045, 1) // Returns "4.5%"
 */
export function formatPercentage(
  decimal: number | null,
  decimalPlaces: number = 2,
): string {
  if (decimal === null) {
    return "N/A";
  }

  const percentage = decimal * 100;
  return `${percentage.toFixed(decimalPlaces)}%`;
}

/**
 * Format ROAS
 *
 * Helper function to format ROAS for display.
 *
 * @param roas - ROAS value (e.g., 3.5)
 * @returns Formatted ROAS string (e.g., "3.5x")
 *
 * @example
 * formatROAS(3.5) // Returns "3.5x"
 * formatROAS(null) // Returns "N/A"
 */
export function formatROAS(roas: number | null): string {
  if (roas === null) {
    return "N/A";
  }

  return `${roas.toFixed(2)}x`;
}
