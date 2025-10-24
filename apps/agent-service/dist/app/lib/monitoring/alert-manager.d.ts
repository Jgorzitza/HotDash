/**
 * Alert Management System
 *
 * Manages automated alerting for monitoring events:
 * - Error rate thresholds
 * - Performance degradation
 * - Service downtime
 * - Custom alert rules
 *
 * @see DEVOPS-017
 */
export interface Alert {
    id: string;
    timestamp: string;
    severity: 'info' | 'warning' | 'critical';
    type: 'error_rate' | 'performance' | 'uptime' | 'custom';
    message: string;
    details: Record<string, any>;
    acknowledged: boolean;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
}
export interface AlertConfig {
    enabled: boolean;
    errorRateThreshold: number;
    performanceThreshold: number;
    uptimeThreshold: number;
    checkInterval: number;
}
export declare class AlertManager {
    private static instance;
    private alerts;
    private readonly maxAlerts;
    private config;
    private constructor();
    static getInstance(): AlertManager;
    /**
     * Create an alert
     */
    createAlert(severity: Alert['severity'], type: Alert['type'], message: string, details?: Record<string, any>): Alert;
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean;
    /**
     * Get all alerts
     */
    getAllAlerts(): Alert[];
    /**
     * Get unacknowledged alerts
     */
    getUnacknowledgedAlerts(): Alert[];
    /**
     * Get alerts by severity
     */
    getAlertsBySeverity(severity: Alert['severity']): Alert[];
    /**
     * Get alert statistics
     */
    getStats(): {
        total: number;
        unacknowledged: number;
        bySeverity: {
            critical: number;
            warning: number;
            info: number;
        };
        byType: {
            error_rate: number;
            performance: number;
            uptime: number;
            custom: number;
        };
        criticalUnacknowledged: number;
    };
    /**
     * Update alert configuration
     */
    updateConfig(config: Partial<AlertConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): AlertConfig;
    /**
     * Clear all alerts
     */
    clear(): void;
    /**
     * Clear acknowledged alerts older than specified time
     */
    clearOldAlerts(olderThanMs?: number): void;
    /**
     * Log alert to console
     */
    private logAlert;
}
/**
 * Convenience function to create an alert
 */
export declare function createAlert(severity: Alert['severity'], type: Alert['type'], message: string, details?: Record<string, any>): Alert;
/**
 * Convenience function to acknowledge an alert
 */
export declare function acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean;
/**
 * Get unacknowledged alerts
 */
export declare function getUnacknowledgedAlerts(): Alert[];
/**
 * Get alert statistics
 */
export declare function getAlertStats(): {
    total: number;
    unacknowledged: number;
    bySeverity: {
        critical: number;
        warning: number;
        info: number;
    };
    byType: {
        error_rate: number;
        performance: number;
        uptime: number;
        custom: number;
    };
    criticalUnacknowledged: number;
};
/**
 * Update alert configuration
 */
export declare function updateAlertConfig(config: Partial<AlertConfig>): void;
//# sourceMappingURL=alert-manager.d.ts.map