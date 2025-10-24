/**
 * Ads Metrics Calculations
 *
 * ROAS, CPC, CPA, CTR, and Conversion Rate calculations with zero-guard protections.
 * All monetary values in cents to avoid floating-point precision issues.
 *
 * @module app/lib/ads/metrics
 */
/**
 * Calculate ROAS (Return on Ad Spend)
 *
 * ROAS = Revenue / Spend
 * Measures how much revenue is generated for every dollar spent on ads.
 * Higher ROAS indicates better campaign performance.
 *
 * @param revenueCents - Total revenue in cents
 * @param spendCents - Total ad spend in cents
 * @returns ROAS as decimal (e.g., 3.5 = 3.5x) or null if spend is zero
 *
 * @example
 * calculateROAS(1000000, 250000) // Returns 4.0 (4x ROAS)
 * calculateROAS(500000, 0) // Returns null (zero-guard)
 */
export declare function calculateROAS(revenueCents: number, spendCents: number): number | null;
/**
 * Calculate CPC (Cost Per Click)
 *
 * CPC = Spend / Clicks
 * Measures the average cost for each click on an ad.
 * Lower CPC indicates more efficient targeting.
 *
 * @param spendCents - Total ad spend in cents
 * @param clicks - Total number of clicks
 * @returns CPC in cents or null if clicks is zero
 *
 * @example
 * calculateCPC(100000, 500) // Returns 200 ($2.00 per click)
 * calculateCPC(100000, 0) // Returns null (zero-guard)
 */
export declare function calculateCPC(spendCents: number, clicks: number): number | null;
/**
 * Calculate CPA (Cost Per Acquisition/Conversion)
 *
 * CPA = Spend / Conversions
 * Measures the average cost to acquire one customer/conversion.
 * Lower CPA indicates better campaign efficiency.
 *
 * @param spendCents - Total ad spend in cents
 * @param conversions - Total number of conversions
 * @returns CPA in cents or null if conversions is zero
 *
 * @example
 * calculateCPA(250000, 50) // Returns 5000 ($50.00 per conversion)
 * calculateCPA(250000, 0) // Returns null (zero-guard)
 */
export declare function calculateCPA(spendCents: number, conversions: number): number | null;
/**
 * Calculate CTR (Click-Through Rate)
 *
 * CTR = Clicks / Impressions
 * Measures the percentage of people who click after seeing an ad.
 * Higher CTR indicates more compelling ad creative.
 *
 * @param clicks - Total number of clicks
 * @param impressions - Total number of impressions
 * @returns CTR as decimal (e.g., 0.035 = 3.5%) or null if impressions is zero
 *
 * @example
 * calculateCTR(350, 10000) // Returns 0.035 (3.5% CTR)
 * calculateCTR(100, 0) // Returns null (zero-guard)
 */
export declare function calculateCTR(clicks: number, impressions: number): number | null;
/**
 * Calculate Conversion Rate
 *
 * Conversion Rate = Conversions / Clicks
 * Measures the percentage of clicks that result in conversions.
 * Higher conversion rate indicates better landing page/offer.
 *
 * @param conversions - Total number of conversions
 * @param clicks - Total number of clicks
 * @returns Conversion rate as decimal (e.g., 0.04 = 4%) or null if clicks is zero
 *
 * @example
 * calculateConversionRate(40, 1000) // Returns 0.04 (4% conversion rate)
 * calculateConversionRate(10, 0) // Returns null (zero-guard)
 */
export declare function calculateConversionRate(conversions: number, clicks: number): number | null;
/**
 * Calculate all metrics at once
 *
 * Convenience function to calculate ROAS, CPC, CPA, CTR, and conversion rate
 * from campaign data in a single call.
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
export declare function calculateAllMetrics(data: {
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
};
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
export declare function formatCentsToDollars(cents: number): string;
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
export declare function formatPercentage(decimal: number | null, decimalPlaces?: number): string;
/**
 * Format ROAS with 2 decimal places
 *
 * @param roas - ROAS value (e.g., 3.5)
 * @returns Formatted ROAS string (e.g., "3.50x")
 *
 * @example
 * formatROAS(3.5) // Returns "3.50x"
 * formatROAS(2.0) // Returns "2.00x"
 * formatROAS(0) // Returns "0.00x"
 */
export declare function formatROAS(roas: number | null): string;
//# sourceMappingURL=metrics.d.ts.map