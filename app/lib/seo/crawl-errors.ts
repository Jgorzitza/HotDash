/**
 * Crawl Error Detection
 * 
 * Monitor Search Console for crawl errors:
 * - 404 Not Found errors
 * - 5xx Server errors
 * - Robots.txt blocks
 * - Redirect chains
 * - Soft 404s
 * 
 * @module lib/seo/crawl-errors
 */

export type ErrorType = '404' | '500' | '503' | 'robots_blocked' | 'redirect_chain' | 'soft_404' | 'timeout' | 'dns_error';
export type ErrorSeverity = 'critical' | 'warning' | 'info';

export interface CrawlError {
  url: string;
  errorType: ErrorType;
  errorCount: number;
  firstDetected: string;
  lastDetected: string;
  severity: ErrorSeverity;
  affectedPages?: string[]; // Pages linking to this URL
  suggestedFix?: string;
}

export interface CrawlErrorSummary {
  totalErrors: number;
  criticalErrors: number;
  warningErrors: number;
  infoErrors: number;
  errorsByType: Record<ErrorType, number>;
  mostAffectedUrls: CrawlError[];
}

export interface SearchConsoleErrorResponse {
  errors: Array<{
    url: string;
    type: ErrorType;
    count: number;
    firstSeen: string;
    lastSeen: string;
    referringUrls?: string[];
  }>;
}

/**
 * Thresholds for error severity
 */
export const ERROR_THRESHOLDS = {
  critical: 10,  // 10+ errors
  warning: 3,    // 3-10 errors
} as const;

/**
 * Error type priorities (higher = more severe)
 */
export const ERROR_PRIORITIES: Record<ErrorType, number> = {
  '500': 10,
  '503': 9,
  'dns_error': 8,
  'timeout': 7,
  '404': 6,
  'soft_404': 5,
  'redirect_chain': 4,
  'robots_blocked': 3,
};

/**
 * Calculate error severity based on count and type
 */
export function calculateErrorSeverity(errorType: ErrorType, count: number): ErrorSeverity {
  // Server errors are always critical
  if (errorType === '500' || errorType === '503' || errorType === 'dns_error') {
    return 'critical';
  }
  
  if (count >= ERROR_THRESHOLDS.critical) {
    return 'critical';
  }
  
  if (count >= ERROR_THRESHOLDS.warning) {
    return 'warning';
  }
  
  return 'info';
}

/**
 * Get suggested fix for error type
 */
export function getSuggestedFix(errorType: ErrorType): string {
  const fixes: Record<ErrorType, string> = {
    '404': 'Create redirect to relevant page or restore content',
    '500': 'Check server logs and fix application error',
    '503': 'Check server capacity and availability',
    'robots_blocked': 'Update robots.txt to allow crawling',
    'redirect_chain': 'Simplify redirect chain to direct redirect',
    'soft_404': 'Return proper 404 status code or add content',
    'timeout': 'Optimize page load time or increase server timeout',
    'dns_error': 'Check DNS configuration and nameservers',
  };
  
  return fixes[errorType];
}

/**
 * Parse Search Console error response
 */
export function parseSearchConsoleErrors(
  response: SearchConsoleErrorResponse
): CrawlError[] {
  return response.errors.map(error => ({
    url: error.url,
    errorType: error.type,
    errorCount: error.count,
    firstDetected: error.firstSeen,
    lastDetected: error.lastSeen,
    severity: calculateErrorSeverity(error.type, error.count),
    affectedPages: error.referringUrls,
    suggestedFix: getSuggestedFix(error.type),
  }));
}

/**
 * Filter errors by severity
 */
export function filterErrorsBySeverity(
  errors: CrawlError[],
  severity: ErrorSeverity
): CrawlError[] {
  return errors.filter(error => error.severity === severity);
}

/**
 * Filter errors by type
 */
export function filterErrorsByType(
  errors: CrawlError[],
  errorType: ErrorType
): CrawlError[] {
  return errors.filter(error => error.errorType === errorType);
}

/**
 * Sort errors by priority (most severe first)
 */
export function sortErrorsByPriority(errors: CrawlError[]): CrawlError[] {
  return errors.sort((a, b) => {
    // First by severity
    if (a.severity !== b.severity) {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    }
    
    // Then by error type priority
    if (a.errorType !== b.errorType) {
      return ERROR_PRIORITIES[b.errorType] - ERROR_PRIORITIES[a.errorType];
    }
    
    // Finally by error count
    return b.errorCount - a.errorCount;
  });
}

/**
 * Get most affected URLs (highest error counts)
 */
export function getMostAffectedUrls(
  errors: CrawlError[],
  limit: number = 10
): CrawlError[] {
  return errors
    .sort((a, b) => b.errorCount - a.errorCount)
    .slice(0, limit);
}

/**
 * Generate error summary
 */
export function generateErrorSummary(errors: CrawlError[]): CrawlErrorSummary {
  const errorsByType: Record<ErrorType, number> = {
    '404': 0,
    '500': 0,
    '503': 0,
    'robots_blocked': 0,
    'redirect_chain': 0,
    'soft_404': 0,
    'timeout': 0,
    'dns_error': 0,
  };
  
  errors.forEach(error => {
    errorsByType[error.errorType] = (errorsByType[error.errorType] || 0) + 1;
  });
  
  const critical = filterErrorsBySeverity(errors, 'critical');
  const warning = filterErrorsBySeverity(errors, 'warning');
  const info = filterErrorsBySeverity(errors, 'info');
  
  return {
    totalErrors: errors.length,
    criticalErrors: critical.length,
    warningErrors: warning.length,
    infoErrors: info.length,
    errorsByType,
    mostAffectedUrls: getMostAffectedUrls(errors, 10),
  };
}

/**
 * Detect error trends (increasing/decreasing/stable)
 */
export function detectErrorTrend(
  currentErrors: CrawlError[],
  previousErrors: CrawlError[]
): 'increasing' | 'decreasing' | 'stable' {
  const currentCount = currentErrors.length;
  const previousCount = previousErrors.length;
  
  if (previousCount === 0) {
    return 'stable';
  }
  
  const change = (currentCount - previousCount) / previousCount;
  
  if (change > 0.2) {
    return 'increasing';
  }
  
  if (change < -0.2) {
    return 'decreasing';
  }
  
  return 'stable';
}

/**
 * Get errors that are new (not in previous scan)
 */
export function getNewErrors(
  currentErrors: CrawlError[],
  previousErrors: CrawlError[]
): CrawlError[] {
  const previousUrls = new Set(previousErrors.map(e => e.url));
  return currentErrors.filter(error => !previousUrls.has(error.url));
}

/**
 * Get errors that were fixed (in previous but not current)
 */
export function getFixedErrors(
  currentErrors: CrawlError[],
  previousErrors: CrawlError[]
): CrawlError[] {
  const currentUrls = new Set(currentErrors.map(e => e.url));
  return previousErrors.filter(error => !currentUrls.has(error.url));
}

/**
 * Mock Search Console API call
 * TODO: Replace with real Google Search Console API integration
 */
export async function fetchSearchConsoleErrors(): Promise<SearchConsoleErrorResponse> {
  console.log('[crawl-errors] Mock Search Console API call');
  
  return {
    errors: [],
  };
}

/**
 * Detect crawl errors
 */
export async function detectCrawlErrors(): Promise<CrawlError[]> {
  const response = await fetchSearchConsoleErrors();
  const errors = parseSearchConsoleErrors(response);
  return sortErrorsByPriority(errors);
}

