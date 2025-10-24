/**
 * Seasonal Demand Adjustments for Inventory Management
 *
 * Adjusts reorder point calculations based on seasonal demand patterns.
 * Peak seasons (e.g., winter for snowboards) get 20-30% ROP buffer increase.
 *
 * Context7 Source: /microsoft/typescript (type guards, interfaces)
 */
/**
 * Predefined seasonality patterns for Hot Rodan product categories
 *
 * Based on historical sales patterns:
 * - Winter sports peak: Nov-Feb (months 10, 11, 0, 1)
 * - Summer sports peak: May-Aug (months 4, 5, 6, 7)
 */
export const SEASONALITY_PATTERNS = {
    snowboards: {
        category: "snowboards",
        peakMonths: [10, 11, 0, 1], // Nov, Dec, Jan, Feb
        peakFactor: 1.3, // 30% increase during peak
        offSeasonFactor: 0.7, // 30% decrease off-season
    },
    skis: {
        category: "skis",
        peakMonths: [10, 11, 0, 1], // Nov, Dec, Jan, Feb
        peakFactor: 1.3,
        offSeasonFactor: 0.7,
    },
    "winter-sports": {
        category: "winter-sports",
        peakMonths: [10, 11, 0, 1],
        peakFactor: 1.25, // 25% increase
        offSeasonFactor: 0.75,
    },
    "summer-sports": {
        category: "summer-sports",
        peakMonths: [4, 5, 6, 7], // May, Jun, Jul, Aug
        peakFactor: 1.25,
        offSeasonFactor: 0.75,
    },
    "apparel-winter": {
        category: "apparel-winter",
        peakMonths: [9, 10, 11, 0, 1, 2], // Sep-Mar (longer season)
        peakFactor: 1.2, // 20% increase
        offSeasonFactor: 0.8,
    },
    "apparel-summer": {
        category: "apparel-summer",
        peakMonths: [3, 4, 5, 6, 7, 8], // Apr-Sep
        peakFactor: 1.2,
        offSeasonFactor: 0.8,
    },
    general: {
        category: "general",
        peakMonths: [], // No seasonality
        peakFactor: 1.0,
        offSeasonFactor: 1.0,
    },
};
/**
 * Get current season from month
 *
 * @param month - Month (0-11, where 0=Jan, 11=Dec)
 * @returns Season name
 */
export function getSeason(month) {
    // Validate month
    if (month < 0 || month > 11) {
        throw new Error("Month must be between 0 and 11");
    }
    // Winter: Dec, Jan, Feb (11, 0, 1)
    if (month === 11 || month === 0 || month === 1) {
        return "winter";
    }
    // Spring: Mar, Apr, May (2, 3, 4)
    if (month >= 2 && month <= 4) {
        return "spring";
    }
    // Summer: Jun, Jul, Aug (5, 6, 7)
    if (month >= 5 && month <= 7) {
        return "summer";
    }
    // Fall: Sep, Oct, Nov (8, 9, 10)
    return "fall";
}
/**
 * Calculate seasonality factor for a product category and current month
 *
 * Returns a multiplier to adjust demand forecasts:
 * - Peak season: 1.2-1.3 (20-30% increase)
 * - Off-season: 0.7-0.8 (20-30% decrease)
 * - Normal: 1.0 (no adjustment)
 *
 * @param category - Product category
 * @param currentMonth - Current month (0-11)
 * @returns Seasonality multiplier
 */
export function getSeasonalityFactor(category, currentMonth) {
    // Validate month
    if (currentMonth < 0 || currentMonth > 11) {
        throw new Error("Month must be between 0 and 11");
    }
    const pattern = SEASONALITY_PATTERNS[category];
    // Check if current month is in peak season
    const isPeakMonth = pattern.peakMonths.includes(currentMonth);
    if (isPeakMonth) {
        return pattern.peakFactor;
    }
    // Check if category has seasonality (non-general)
    if (pattern.peakMonths.length === 0) {
        return 1.0; // No seasonality adjustment for general products
    }
    // Off-season for seasonal products
    return pattern.offSeasonFactor;
}
/**
 * Calculate seasonal adjusted average daily sales
 *
 * Applies seasonality factor to base average daily sales to account
 * for expected demand fluctuations.
 *
 * @param avgDailySales - Base average daily sales
 * @param category - Product category
 * @param currentMonth - Current month (0-11), defaults to current date
 * @returns Seasonally adjusted daily sales
 */
export function calculateSeasonalAdjustedSales(avgDailySales, category, currentMonth) {
    // Validate input
    if (avgDailySales < 0) {
        throw new Error("Average daily sales must be non-negative");
    }
    // Use current month if not provided
    const month = currentMonth ?? new Date().getMonth();
    // Get seasonality factor
    const factor = getSeasonalityFactor(category, month);
    // Apply factor and round to 2 decimal places
    return Math.round(avgDailySales * factor * 100) / 100;
}
/**
 * Determine if a month is in peak season for a category
 *
 * @param category - Product category
 * @param month - Month to check (0-11)
 * @returns True if month is in peak season
 */
export function isPeakSeason(category, month) {
    if (month < 0 || month > 11) {
        throw new Error("Month must be between 0 and 11");
    }
    const pattern = SEASONALITY_PATTERNS[category];
    return pattern.peakMonths.includes(month);
}
/**
 * Get months until next peak season for planning purposes
 *
 * @param category - Product category
 * @param currentMonth - Current month (0-11)
 * @returns Number of months until next peak season (0 if currently in peak)
 */
export function getMonthsUntilPeak(category, currentMonth) {
    if (currentMonth < 0 || currentMonth > 11) {
        throw new Error("Month must be between 0 and 11");
    }
    const pattern = SEASONALITY_PATTERNS[category];
    // No peak season for general products
    if (pattern.peakMonths.length === 0) {
        return 0;
    }
    // Already in peak season
    if (pattern.peakMonths.includes(currentMonth)) {
        return 0;
    }
    // Find next peak month
    let monthsUntil = 0;
    let checkMonth = currentMonth;
    for (let i = 0; i < 12; i++) {
        checkMonth = (currentMonth + i) % 12;
        if (pattern.peakMonths.includes(checkMonth)) {
            monthsUntil = i;
            break;
        }
    }
    return monthsUntil;
}
//# sourceMappingURL=seasonality.js.map