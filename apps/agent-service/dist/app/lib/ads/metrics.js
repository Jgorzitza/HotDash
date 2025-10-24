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
export function calculateROAS(revenueCents, spendCents) {
    if (spendCents === 0) {
        return null; // Zero-guard: prevent division by zero
    }
    const roas = revenueCents / spendCents;
    return parseFloat(roas.toFixed(2));
}
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
export function calculateCPC(spendCents, clicks) {
    if (clicks === 0) {
        return null; // Zero-guard: prevent division by zero
    }
    const cpc = spendCents / clicks;
    return Math.round(cpc);
}
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
export function calculateCPA(spendCents, conversions) {
    if (conversions === 0) {
        return null; // Zero-guard: prevent division by zero
    }
    const cpa = spendCents / conversions;
    return Math.round(cpa);
}
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
export function calculateCTR(clicks, impressions) {
    if (impressions === 0) {
        return null; // Zero-guard: prevent division by zero
    }
    const ctr = clicks / impressions;
    return parseFloat(ctr.toFixed(4));
}
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
export function calculateConversionRate(conversions, clicks) {
    if (clicks === 0) {
        return null; // Zero-guard: prevent division by zero
    }
    const rate = conversions / clicks;
    return parseFloat(rate.toFixed(4));
}
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
export function calculateAllMetrics(data) {
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
export function formatCentsToDollars(cents) {
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
export function formatPercentage(decimal, decimalPlaces = 2) {
    if (decimal === null) {
        return "N/A";
    }
    const percentage = decimal * 100;
    return `${percentage.toFixed(decimalPlaces)}%`;
}
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
export function formatROAS(roas) {
    if (roas === null) {
        return "N/A";
    }
    return `${roas.toFixed(2)}x`;
}
//# sourceMappingURL=metrics.js.map