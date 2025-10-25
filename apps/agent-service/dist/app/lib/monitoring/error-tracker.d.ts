/**
 * Error Tracking System
 *
 * Captures, categorizes, and reports application errors.
 * Integrates with logging system for persistence.
 *
 * @see DEVOPS-017
 */
export interface ErrorContext {
    userId?: string;
    sessionId?: string;
    route?: string;
    action?: string;
    metadata?: Record<string, any>;
}
export interface ErrorReport {
    id: string;
    timestamp: string;
    message: string;
    stack?: string;
    level: 'error' | 'warning' | 'critical';
    context: ErrorContext;
    fingerprint: string;
    count: number;
}
export declare class ErrorTracker {
    private static instance;
    private errors;
    private readonly maxErrors;
    private constructor();
    static getInstance(): ErrorTracker;
    /**
     * Track an error
     */
    track(error: Error, context?: ErrorContext, level?: 'error' | 'warning' | 'critical'): string;
    /**
     * Get error report by ID
     */
    getReport(id: string): ErrorReport | undefined;
    /**
     * Get all error reports
     */
    getAllReports(): ErrorReport[];
    /**
     * Get error statistics
     */
    getStats(): {
        totalErrors: number;
        uniqueErrors: number;
        criticalErrors: number;
        errorsByLevel: {
            critical: number;
            error: number;
            warning: number;
        };
        topErrors: {
            message: string;
            count: number;
            level: "error" | "critical" | "warning";
        }[];
    };
    /**
     * Clear all errors
     */
    clear(): void;
    /**
     * Generate fingerprint for error deduplication
     */
    private generateFingerprint;
    /**
     * Log error to console and structured logging
     */
    private logError;
}
/**
 * Convenience function to track errors
 */
export declare function trackError(error: Error, context?: ErrorContext, level?: 'error' | 'warning' | 'critical'): string;
/**
 * Get error statistics
 */
export declare function getErrorStats(): {
    totalErrors: number;
    uniqueErrors: number;
    criticalErrors: number;
    errorsByLevel: {
        critical: number;
        error: number;
        warning: number;
    };
    topErrors: {
        message: string;
        count: number;
        level: "error" | "critical" | "warning";
    }[];
};
//# sourceMappingURL=error-tracker.d.ts.map