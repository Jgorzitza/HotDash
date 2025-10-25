/**
 * Monitoring Dashboard
 *
 * Aggregates monitoring data for dashboard display:
 * - Error statistics
 * - Performance metrics
 * - Uptime reports
 * - Active alerts
 *
 * @see DEVOPS-017
 */
import { ErrorTracker } from './error-tracker';
import { PerformanceMonitor } from './performance-monitor';
import { UptimeMonitor } from './uptime-monitor';
import { AlertManager } from './alert-manager';
export class MonitoringDashboard {
    static instance;
    constructor() {
        // Singleton pattern
    }
    static getInstance() {
        if (!MonitoringDashboard.instance) {
            MonitoringDashboard.instance = new MonitoringDashboard();
        }
        return MonitoringDashboard.instance;
    }
    /**
     * Get comprehensive dashboard metrics
     */
    getMetrics(periodMs = 3600000) {
        const errorTracker = ErrorTracker.getInstance();
        const performanceMonitor = PerformanceMonitor.getInstance();
        const uptimeMonitor = UptimeMonitor.getInstance();
        const alertManager = AlertManager.getInstance();
        // Get error statistics
        const errorStats = errorTracker.getStats();
        // Get performance report
        const perfReport = performanceMonitor.getReport(periodMs);
        // Get uptime report
        const uptimeReport = uptimeMonitor.getReport(periodMs);
        // Get current service status
        const currentStatus = uptimeMonitor.getCurrentStatus();
        const services = Array.from(currentStatus.entries()).map(([service, check]) => ({
            service,
            uptime: uptimeReport.services.find(s => s.service === service)?.uptime || 0,
            status: check.status,
        }));
        // Get alert statistics
        const alertStats = alertManager.getStats();
        // Determine overall health
        const health = this.determineHealth(errorStats, perfReport, uptimeReport, alertStats);
        return {
            timestamp: new Date().toISOString(),
            errors: {
                total: errorStats.totalErrors,
                unique: errorStats.uniqueErrors,
                critical: errorStats.criticalErrors,
                byLevel: errorStats.errorsByLevel,
                topErrors: errorStats.topErrors,
            },
            performance: {
                routes: {
                    count: perfReport.metrics.routes.count,
                    avgDuration: perfReport.metrics.routes.avgDuration,
                    p95: perfReport.metrics.routes.p95,
                },
                apis: {
                    count: perfReport.metrics.apis.count,
                    avgDuration: perfReport.metrics.apis.avgDuration,
                    p95: perfReport.metrics.apis.p95,
                },
                database: {
                    count: perfReport.metrics.database.count,
                    avgDuration: perfReport.metrics.database.avgDuration,
                    p95: perfReport.metrics.database.p95,
                },
            },
            uptime: {
                overall: uptimeReport.overallUptime,
                services,
                incidents: uptimeReport.incidents.length,
            },
            alerts: {
                total: alertStats.total,
                unacknowledged: alertStats.unacknowledged,
                critical: alertStats.criticalUnacknowledged,
                bySeverity: alertStats.bySeverity,
            },
            health,
        };
    }
    /**
     * Determine overall system health
     */
    determineHealth(errorStats, perfReport, uptimeReport, alertStats) {
        const issues = [];
        // Check error rate
        if (errorStats.criticalErrors > 0) {
            issues.push(`${errorStats.criticalErrors} critical errors detected`);
        }
        // Check performance
        if (perfReport.metrics.routes.p95 > 3000) {
            issues.push(`Route P95 response time: ${perfReport.metrics.routes.p95}ms (target: <3000ms)`);
        }
        // Check uptime
        if (uptimeReport.overallUptime < 99) {
            issues.push(`Overall uptime: ${uptimeReport.overallUptime.toFixed(2)}% (target: >99%)`);
        }
        // Check for down services
        const downServices = uptimeReport.services.filter((s) => s.uptime < 95);
        if (downServices.length > 0) {
            issues.push(`${downServices.length} service(s) with low uptime`);
        }
        // Check critical alerts
        if (alertStats.criticalUnacknowledged > 0) {
            issues.push(`${alertStats.criticalUnacknowledged} unacknowledged critical alerts`);
        }
        // Determine status
        let status;
        if (issues.length === 0) {
            status = 'healthy';
        }
        else if (errorStats.criticalErrors > 0 || uptimeReport.overallUptime < 95) {
            status = 'unhealthy';
        }
        else {
            status = 'degraded';
        }
        return { status, issues };
    }
    /**
     * Get health summary
     */
    getHealthSummary() {
        const metrics = this.getMetrics();
        let message;
        if (metrics.health.status === 'healthy') {
            message = 'All systems operational';
        }
        else if (metrics.health.status === 'degraded') {
            message = `System degraded: ${metrics.health.issues.join(', ')}`;
        }
        else {
            message = `System unhealthy: ${metrics.health.issues.join(', ')}`;
        }
        return {
            status: metrics.health.status,
            message,
            timestamp: metrics.timestamp,
        };
    }
}
/**
 * Get dashboard metrics
 */
export function getDashboardMetrics(periodMs) {
    return MonitoringDashboard.getInstance().getMetrics(periodMs);
}
/**
 * Get health summary
 */
export function getHealthSummary() {
    return MonitoringDashboard.getInstance().getHealthSummary();
}
//# sourceMappingURL=dashboard.js.map