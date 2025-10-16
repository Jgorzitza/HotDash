/**
 * Error Handling Taxonomy for Ads
 * 
 * Purpose: Standardized error handling and classification
 * Owner: ads agent
 * Date: 2025-10-15
 */

export type ErrorCategory = 
  | 'api_error'
  | 'validation_error'
  | 'calculation_error'
  | 'data_error'
  | 'auth_error'
  | 'rate_limit_error'
  | 'network_error';

export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface AdsError {
  code: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  details?: Record<string, any>;
  retryable: boolean;
  timestamp: string;
}

export class AdsErrorHandler {
  static createError(
    code: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    message: string,
    details?: Record<string, any>,
    retryable: boolean = false
  ): AdsError {
    return {
      code,
      category,
      severity,
      message,
      details,
      retryable,
      timestamp: new Date().toISOString(),
    };
  }

  static handleApiError(error: any, platform: string): AdsError {
    return this.createError(
      'ADS_API_ERROR',
      'api_error',
      'error',
      `Failed to fetch data from ${platform} API: ${error.message}`,
      { platform, originalError: error.message },
      true
    );
  }

  static handleValidationError(field: string, value: any, reason: string): AdsError {
    return this.createError(
      'ADS_VALIDATION_ERROR',
      'validation_error',
      'warning',
      `Validation failed for ${field}: ${reason}`,
      { field, value, reason },
      false
    );
  }

  static handleCalculationError(metric: string, reason: string): AdsError {
    return this.createError(
      'ADS_CALCULATION_ERROR',
      'calculation_error',
      'error',
      `Failed to calculate ${metric}: ${reason}`,
      { metric, reason },
      false
    );
  }

  static handleRateLimitError(platform: string, retryAfter?: number): AdsError {
    return this.createError(
      'ADS_RATE_LIMIT',
      'rate_limit_error',
      'warning',
      `Rate limit exceeded for ${platform} API`,
      { platform, retryAfter },
      true
    );
  }

  static isRetryable(error: AdsError): boolean {
    return error.retryable;
  }

  static shouldAlert(error: AdsError): boolean {
    return error.severity === 'critical' || error.severity === 'error';
  }
}

export const ADS_ERROR_CODES = {
  API_ERROR: 'ADS_API_ERROR',
  VALIDATION_ERROR: 'ADS_VALIDATION_ERROR',
  CALCULATION_ERROR: 'ADS_CALCULATION_ERROR',
  DATA_ERROR: 'ADS_DATA_ERROR',
  AUTH_ERROR: 'ADS_AUTH_ERROR',
  RATE_LIMIT: 'ADS_RATE_LIMIT',
  NETWORK_ERROR: 'ADS_NETWORK_ERROR',
} as const;

