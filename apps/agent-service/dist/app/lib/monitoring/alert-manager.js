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
export class AlertManager {
    static instance;
    alerts = [];
    maxAlerts = 1000;
    config = {
        enabled: true,
        errorRateThreshold: 5, // 5% error rate
        performanceThreshold: 3000, // 3 seconds
        uptimeThreshold: 99, // 99% uptime
        checkInterval: 60000, // 1 minute
    };
    constructor() {
        // Singleton pattern
    }
    static getInstance() {
        if (!AlertManager.instance) {
            AlertManager.instance = new AlertManager();
        }
        return AlertManager.instance;
    }
    /**
     * Create an alert
     */
    createAlert(severity, type, message, details = {}) {
        const alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            timestamp: new Date().toISOString(),
            severity,
            type,
            message,
            details,
            acknowledged: false,
        };
        this.alerts.push(alert);
        // Trim old alerts if we exceed max
        if (this.alerts.length > this.maxAlerts) {
            this.alerts = this.alerts.slice(-this.maxAlerts);
        }
        // Log alert
        this.logAlert(alert);
        return alert;
    }
    /**
     * Acknowledge an alert
     */
    acknowledgeAlert(alertId, acknowledgedBy) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) {
            return false;
        }
        alert.acknowledged = true;
        alert.acknowledgedAt = new Date().toISOString();
        alert.acknowledgedBy = acknowledgedBy;
        console.log('[AlertManager] Alert acknowledged:', {
            id: alertId,
            by: acknowledgedBy,
        });
        return true;
    }
    /**
     * Get all alerts
     */
    getAllAlerts() {
        return [...this.alerts].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    /**
     * Get unacknowledged alerts
     */
    getUnacknowledgedAlerts() {
        return this.alerts
            .filter(a => !a.acknowledged)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    /**
     * Get alerts by severity
     */
    getAlertsBySeverity(severity) {
        return this.alerts
            .filter(a => a.severity === severity)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    /**
     * Get alert statistics
     */
    getStats() {
        const unacknowledged = this.getUnacknowledgedAlerts();
        return {
            total: this.alerts.length,
            unacknowledged: unacknowledged.length,
            bySeverity: {
                critical: this.alerts.filter(a => a.severity === 'critical').length,
                warning: this.alerts.filter(a => a.severity === 'warning').length,
                info: this.alerts.filter(a => a.severity === 'info').length,
            },
            byType: {
                error_rate: this.alerts.filter(a => a.type === 'error_rate').length,
                performance: this.alerts.filter(a => a.type === 'performance').length,
                uptime: this.alerts.filter(a => a.type === 'uptime').length,
                custom: this.alerts.filter(a => a.type === 'custom').length,
            },
            criticalUnacknowledged: unacknowledged.filter(a => a.severity === 'critical').length,
        };
    }
    /**
     * Update alert configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };
        console.log('[AlertManager] Configuration updated:', this.config);
    }
    /**
     * Get current configuration
     */
    getConfig() {
        return { ...this.config };
    }
    /**
     * Clear all alerts
     */
    clear() {
        this.alerts = [];
    }
    /**
     * Clear acknowledged alerts older than specified time
     */
    clearOldAlerts(olderThanMs = 7 * 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - olderThanMs;
        this.alerts = this.alerts.filter(a => {
            if (!a.acknowledged)
                return true;
            return new Date(a.timestamp).getTime() > cutoff;
        });
    }
    /**
     * Log alert to console
     */
    logAlert(alert) {
        const logLevel = alert.severity === 'critical' ? 'error' :
            alert.severity === 'warning' ? 'warn' : 'info';
        console[logLevel]('[AlertManager] Alert created:', {
            id: alert.id,
            severity: alert.severity,
            type: alert.type,
            message: alert.message,
        });
        // In production, this would send to external alerting service
        // (e.g., PagerDuty, Slack, email)
    }
}
/**
 * Convenience function to create an alert
 */
export function createAlert(severity, type, message, details) {
    return AlertManager.getInstance().createAlert(severity, type, message, details);
}
/**
 * Convenience function to acknowledge an alert
 */
export function acknowledgeAlert(alertId, acknowledgedBy) {
    return AlertManager.getInstance().acknowledgeAlert(alertId, acknowledgedBy);
}
/**
 * Get unacknowledged alerts
 */
export function getUnacknowledgedAlerts() {
    return AlertManager.getInstance().getUnacknowledgedAlerts();
}
/**
 * Get alert statistics
 */
export function getAlertStats() {
    return AlertManager.getInstance().getStats();
}
/**
 * Update alert configuration
 */
export function updateAlertConfig(config) {
    AlertManager.getInstance().updateConfig(config);
}
//# sourceMappingURL=alert-manager.js.map