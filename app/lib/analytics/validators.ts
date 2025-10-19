/**
 * GA4 Data Validation Layer
 *
 * Prevents bad data from reaching dashboard tiles by validating:
 * - Value ranges (realistic bounds)
 * - Data types
 * - Required fields
 * - Business logic constraints
 */

// ============================================================================
// Validation Rules
// ============================================================================

export const VALIDATION_RULES = {
  revenue: {
    min: 0,
    max: 1000000, // $1M max per 30-day period (sanity check)
    required: true,
  },
  transactions: {
    min: 0,
    max: 10000, // 10k orders max per 30 days
    required: true,
  },
  averageOrderValue: {
    min: 0,
    max: 5000, // $5k max AOV (sanity check)
    required: true,
  },
  conversionRate: {
    min: 0,
    max: 100, // Percentage
    required: true,
  },
  sessions: {
    min: 0,
    max: 1000000, // 1M sessions max per 30 days
    required: true,
  },
  users: {
    min: 0,
    max: 500000, // 500k users max
    required: true,
  },
  pageviews: {
    min: 0,
    max: 5000000, // 5M pageviews max
    required: true,
  },
  bounceRate: {
    min: 0,
    max: 100, // Percentage
    required: false,
  },
  organicPercentage: {
    min: 0,
    max: 100, // Percentage
    required: false,
  },
};

// ============================================================================
// Validation Functions
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a numeric value against rules
 */
function validateNumeric(
  value: number,
  fieldName: string,
  rules: { min: number; max: number; required: boolean },
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if value exists
  if (value === null || value === undefined) {
    if (rules.required) {
      errors.push(`${fieldName} is required but missing`);
    }
    return { valid: errors.length === 0, errors, warnings };
  }

  // Check if value is a number
  if (typeof value !== "number" || isNaN(value)) {
    errors.push(`${fieldName} must be a valid number, got: ${typeof value}`);
    return { valid: false, errors, warnings };
  }

  // Check min bound
  if (value < rules.min) {
    errors.push(`${fieldName} is below minimum (${value} < ${rules.min})`);
  }

  // Check max bound
  if (value > rules.max) {
    warnings.push(
      `${fieldName} exceeds maximum (${value} > ${rules.max}) - possible data quality issue`,
    );
  }

  // Check for negative values where not appropriate
  if (value < 0 && !fieldName.includes("Change")) {
    errors.push(`${fieldName} cannot be negative: ${value}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate revenue metrics
 */
export function validateRevenueMetrics(metrics: {
  totalRevenue: number;
  averageOrderValue: number;
  transactions: number;
}): ValidationResult {
  const results: ValidationResult[] = [
    validateNumeric(
      metrics.totalRevenue,
      "totalRevenue",
      VALIDATION_RULES.revenue,
    ),
    validateNumeric(
      metrics.transactions,
      "transactions",
      VALIDATION_RULES.transactions,
    ),
    validateNumeric(
      metrics.averageOrderValue,
      "averageOrderValue",
      VALIDATION_RULES.averageOrderValue,
    ),
  ];

  // Business logic validation
  const errors: string[] = [];
  const warnings: string[] = [];

  // AOV = revenue / transactions
  if (metrics.transactions > 0) {
    const calculatedAOV = metrics.totalRevenue / metrics.transactions;
    const diff = Math.abs(calculatedAOV - metrics.averageOrderValue);
    const tolerance = 0.01; // 1 cent tolerance

    if (diff > tolerance) {
      warnings.push(
        `AOV calculation mismatch: ${calculatedAOV.toFixed(2)} vs ${metrics.averageOrderValue.toFixed(2)}`,
      );
    }
  }

  // Combine results
  for (const result of results) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate conversion metrics
 */
export function validateConversionMetrics(metrics: {
  conversionRate: number;
  transactions: number;
  revenue: number;
}): ValidationResult {
  const results: ValidationResult[] = [
    validateNumeric(
      metrics.conversionRate,
      "conversionRate",
      VALIDATION_RULES.conversionRate,
    ),
    validateNumeric(
      metrics.transactions,
      "transactions",
      VALIDATION_RULES.transactions,
    ),
    validateNumeric(metrics.revenue, "revenue", VALIDATION_RULES.revenue),
  ];

  const errors: string[] = [];
  const warnings: string[] = [];

  // Conversion rate sanity check
  if (metrics.conversionRate > 20) {
    warnings.push(
      `Unusually high conversion rate: ${metrics.conversionRate}% (typical: 1-5%)`,
    );
  }

  if (metrics.conversionRate < 0.1 && metrics.transactions > 0) {
    warnings.push(
      `Unusually low conversion rate: ${metrics.conversionRate}% with ${metrics.transactions} transactions`,
    );
  }

  // Combine results
  for (const result of results) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate traffic metrics
 */
export function validateTrafficMetrics(metrics: {
  totalSessions: number;
  organicSessions: number;
  organicPercentage: number;
}): ValidationResult {
  const results: ValidationResult[] = [
    validateNumeric(
      metrics.totalSessions,
      "totalSessions",
      VALIDATION_RULES.sessions,
    ),
    validateNumeric(
      metrics.organicSessions,
      "organicSessions",
      VALIDATION_RULES.sessions,
    ),
    validateNumeric(
      metrics.organicPercentage,
      "organicPercentage",
      VALIDATION_RULES.organicPercentage,
    ),
  ];

  const errors: string[] = [];
  const warnings: string[] = [];

  // Business logic validation
  if (metrics.organicSessions > metrics.totalSessions) {
    errors.push(
      `Organic sessions (${metrics.organicSessions}) cannot exceed total sessions (${metrics.totalSessions})`,
    );
  }

  // Organic percentage calculation check
  if (metrics.totalSessions > 0) {
    const calculatedPercentage =
      (metrics.organicSessions / metrics.totalSessions) * 100;
    const diff = Math.abs(calculatedPercentage - metrics.organicPercentage);

    if (diff > 1.0) {
      warnings.push(
        `Organic percentage mismatch: ${calculatedPercentage.toFixed(1)}% vs ${metrics.organicPercentage.toFixed(1)}%`,
      );
    }
  }

  // Combine results
  for (const result of results) {
    errors.push(...result.errors);
    warnings.push(...result.warnings);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate any metric value and log issues
 */
export function validateAndLog(
  metricName: string,
  value: any,
  validationFn: (value: any) => ValidationResult,
): boolean {
  const result = validationFn(value);

  if (!result.valid) {
    console.error(
      `[Validation] ${metricName} validation failed:`,
      result.errors,
    );
    return false;
  }

  if (result.warnings.length > 0) {
    console.warn(`[Validation] ${metricName} warnings:`, result.warnings);
  }

  return true;
}
