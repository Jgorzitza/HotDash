/**
 * Error Tracking System
 *
 * Captures, categorizes, and reports application errors.
 * Integrates with logging system for persistence.
 *
 * @see DEVOPS-017
 */
export class ErrorTracker {
    static instance;
    errors = new Map();
    maxErrors = 1000;
    constructor() {
        // Singleton pattern
    }
    static getInstance() {
        if (!ErrorTracker.instance) {
            ErrorTracker.instance = new ErrorTracker();
        }
        return ErrorTracker.instance;
    }
    /**
     * Track an error
     */
    track(error, context = {}, level = 'error') {
        const fingerprint = this.generateFingerprint(error, context);
        const existing = this.errors.get(fingerprint);
        if (existing) {
            // Increment count for duplicate errors
            existing.count++;
            existing.timestamp = new Date().toISOString();
            return existing.id;
        }
        const report = {
            id: `err-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            level,
            context,
            fingerprint,
            count: 1,
        };
        this.errors.set(fingerprint, report);
        // Trim old errors if we exceed max
        if (this.errors.size > this.maxErrors) {
            const oldestKey = Array.from(this.errors.keys())[0];
            this.errors.delete(oldestKey);
        }
        // Log to console and structured logging
        this.logError(report);
        return report.id;
    }
    /**
     * Get error report by ID
     */
    getReport(id) {
        return Array.from(this.errors.values()).find(e => e.id === id);
    }
    /**
     * Get all error reports
     */
    getAllReports() {
        return Array.from(this.errors.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    /**
     * Get error statistics
     */
    getStats() {
        const reports = this.getAllReports();
        const totalErrors = reports.reduce((sum, r) => sum + r.count, 0);
        return {
            totalErrors,
            uniqueErrors: reports.length,
            criticalErrors: reports.filter(r => r.level === 'critical').length,
            errorsByLevel: {
                critical: reports.filter(r => r.level === 'critical').length,
                error: reports.filter(r => r.level === 'error').length,
                warning: reports.filter(r => r.level === 'warning').length,
            },
            topErrors: reports.slice(0, 10).map(r => ({
                message: r.message,
                count: r.count,
                level: r.level,
            })),
        };
    }
    /**
     * Clear all errors
     */
    clear() {
        this.errors.clear();
    }
    /**
     * Generate fingerprint for error deduplication
     */
    generateFingerprint(error, context) {
        const parts = [
            error.message,
            error.stack?.split('\n')[0] || '',
            context.route || '',
            context.action || '',
        ];
        return parts.join('|');
    }
    /**
     * Log error to console and structured logging
     */
    logError(report) {
        const logLevel = report.level === 'critical' ? 'error' : report.level;
        console[logLevel]('[ErrorTracker]', {
            id: report.id,
            message: report.message,
            level: report.level,
            context: report.context,
            fingerprint: report.fingerprint,
        });
        // In production, this would send to external error tracking service
        // For now, we rely on structured logging
    }
}
/**
 * Convenience function to track errors
 */
export function trackError(error, context, level) {
    return ErrorTracker.getInstance().track(error, context, level);
}
/**
 * Get error statistics
 */
export function getErrorStats() {
    return ErrorTracker.getInstance().getStats();
}
//# sourceMappingURL=error-tracker.js.map