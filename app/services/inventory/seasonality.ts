/**
 * Seasonality Factor Service
 * 
 * Applies seasonal adjustments to ROP calculations
 * Supports configurable seasonal patterns
 */

export interface SeasonalityConfig {
  enabled: boolean;
  patterns: SeasonalPattern[];
}

export interface SeasonalPattern {
  name: string;
  months: number[]; // 1-12
  factor: number; // Multiplier (e.g., 1.5 for 50% increase)
  applyToCategories?: string[];
  applyToSkus?: string[];
}

export interface SeasonalAdjustment {
  sku: string;
  baseValue: number;
  seasonalFactor: number;
  adjustedValue: number;
  appliedPattern?: string;
  month: number;
}

/**
 * Default seasonal patterns
 */
export const DEFAULT_PATTERNS: SeasonalPattern[] = [
  {
    name: 'Holiday Season',
    months: [11, 12], // November, December
    factor: 1.5,
  },
  {
    name: 'Summer Peak',
    months: [6, 7, 8], // June, July, August
    factor: 1.3,
  },
  {
    name: 'Spring',
    months: [3, 4, 5], // March, April, May
    factor: 1.1,
  },
];

/**
 * Get current month (1-12)
 */
function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Find applicable seasonal pattern
 */
export function findApplicablePattern(
  month: number,
  sku: string,
  category?: string,
  patterns: SeasonalPattern[] = DEFAULT_PATTERNS
): SeasonalPattern | null {
  for (const pattern of patterns) {
    // Check if month matches
    if (!pattern.months.includes(month)) {
      continue;
    }

    // Check category filter
    if (pattern.applyToCategories && category) {
      if (!pattern.applyToCategories.includes(category)) {
        continue;
      }
    }

    // Check SKU filter
    if (pattern.applyToSkus) {
      if (!pattern.applyToSkus.includes(sku)) {
        continue;
      }
    }

    return pattern;
  }

  return null;
}

/**
 * Apply seasonal adjustment to value
 */
export function applySeasonalAdjustment(
  sku: string,
  baseValue: number,
  config: SeasonalityConfig,
  category?: string,
  month: number = getCurrentMonth()
): SeasonalAdjustment {
  if (!config.enabled) {
    return {
      sku,
      baseValue,
      seasonalFactor: 1.0,
      adjustedValue: baseValue,
      month,
    };
  }

  const pattern = findApplicablePattern(month, sku, category, config.patterns);

  if (!pattern) {
    return {
      sku,
      baseValue,
      seasonalFactor: 1.0,
      adjustedValue: baseValue,
      month,
    };
  }

  const adjustedValue = Math.ceil(baseValue * pattern.factor);

  return {
    sku,
    baseValue,
    seasonalFactor: pattern.factor,
    adjustedValue,
    appliedPattern: pattern.name,
    month,
  };
}

/**
 * Apply seasonal adjustment to ROP
 */
export function applySeasonalROPAdjustment(
  sku: string,
  baseROP: number,
  config: SeasonalityConfig,
  category?: string
): {
  baseROP: number;
  adjustedROP: number;
  seasonalFactor: number;
  appliedPattern?: string;
} {
  const adjustment = applySeasonalAdjustment(sku, baseROP, config, category);

  return {
    baseROP,
    adjustedROP: adjustment.adjustedValue,
    seasonalFactor: adjustment.seasonalFactor,
    appliedPattern: adjustment.appliedPattern,
  };
}

/**
 * Apply seasonal adjustment to safety stock
 */
export function applySeasonalSafetyStockAdjustment(
  sku: string,
  baseSafetyStock: number,
  config: SeasonalityConfig,
  category?: string
): {
  baseSafetyStock: number;
  adjustedSafetyStock: number;
  seasonalFactor: number;
  appliedPattern?: string;
} {
  const adjustment = applySeasonalAdjustment(sku, baseSafetyStock, config, category);

  return {
    baseSafetyStock,
    adjustedSafetyStock: adjustment.adjustedValue,
    seasonalFactor: adjustment.seasonalFactor,
    appliedPattern: adjustment.appliedPattern,
  };
}

/**
 * Get seasonal forecast multiplier for future month
 */
export function getSeasonalForecastMultiplier(
  sku: string,
  targetMonth: number,
  config: SeasonalityConfig,
  category?: string
): number {
  if (!config.enabled) {
    return 1.0;
  }

  const pattern = findApplicablePattern(targetMonth, sku, category, config.patterns);
  return pattern ? pattern.factor : 1.0;
}

/**
 * Create custom seasonal pattern
 */
export function createSeasonalPattern(
  name: string,
  months: number[],
  factor: number,
  options: {
    applyToCategories?: string[];
    applyToSkus?: string[];
  } = {}
): SeasonalPattern {
  return {
    name,
    months,
    factor,
    ...options,
  };
}

/**
 * Validate seasonal pattern
 */
export function validateSeasonalPattern(pattern: SeasonalPattern): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!pattern.name || pattern.name.trim() === '') {
    errors.push('Pattern name is required');
  }

  if (!pattern.months || pattern.months.length === 0) {
    errors.push('At least one month must be specified');
  }

  if (pattern.months.some(m => m < 1 || m > 12)) {
    errors.push('Months must be between 1 and 12');
  }

  if (pattern.factor <= 0) {
    errors.push('Factor must be positive');
  }

  if (pattern.factor > 10) {
    errors.push('Factor seems unreasonably high (>10x)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get seasonality summary for year
 */
export function getSeasonalitySummary(
  config: SeasonalityConfig
): Array<{
  month: number;
  monthName: string;
  patterns: string[];
  maxFactor: number;
}> {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const summary = [];

  for (let month = 1; month <= 12; month++) {
    const applicablePatterns = config.patterns.filter(p => p.months.includes(month));
    const maxFactor = applicablePatterns.length > 0
      ? Math.max(...applicablePatterns.map(p => p.factor))
      : 1.0;

    summary.push({
      month,
      monthName: monthNames[month - 1],
      patterns: applicablePatterns.map(p => p.name),
      maxFactor,
    });
  }

  return summary;
}

/**
 * Toggle seasonality on/off
 */
export function toggleSeasonality(
  config: SeasonalityConfig,
  enabled: boolean
): SeasonalityConfig {
  return {
    ...config,
    enabled,
  };
}

/**
 * Add pattern to config
 */
export function addSeasonalPattern(
  config: SeasonalityConfig,
  pattern: SeasonalPattern
): SeasonalityConfig {
  return {
    ...config,
    patterns: [...config.patterns, pattern],
  };
}

/**
 * Remove pattern from config
 */
export function removeSeasonalPattern(
  config: SeasonalityConfig,
  patternName: string
): SeasonalityConfig {
  return {
    ...config,
    patterns: config.patterns.filter(p => p.name !== patternName),
  };
}

