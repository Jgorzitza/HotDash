/**
 * Uptime Monitoring System
 *
 * Monitors service availability and health:
 * - Application uptime
 * - Dependency health checks
 * - Service availability tracking
 *
 * @see DEVOPS-017
 */
export class UptimeMonitor {
    static instance;
    checks = [];
    maxChecks = 10000;
    retentionMs = 7 * 24 * 60 * 60 * 1000; // 7 days
    constructor() {
        // Singleton pattern
        this.startCleanupInterval();
    }
    static getInstance() {
        if (!UptimeMonitor.instance) {
            UptimeMonitor.instance = new UptimeMonitor();
        }
        return UptimeMonitor.instance;
    }
    /**
     * Record an uptime check
     */
    recordCheck(service, status, responseTime, error) {
        const check = {
            id: `uptime-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
            timestamp: new Date().toISOString(),
            service,
            status,
            responseTime,
            error,
        };
        this.checks.push(check);
        // Trim old checks if we exceed max
        if (this.checks.length > this.maxChecks) {
            this.checks = this.checks.slice(-this.maxChecks);
        }
        // Log failures
        if (status === 'down') {
            console.error('[UptimeMonitor] Service down:', {
                service,
                error,
                timestamp: check.timestamp,
            });
        }
        else if (status === 'degraded') {
            console.warn('[UptimeMonitor] Service degraded:', {
                service,
                responseTime,
                timestamp: check.timestamp,
            });
        }
    }
    /**
     * Perform health check on a service
     */
    async checkService(service, checkFn) {
        try {
            const result = await checkFn();
            let status;
            if (result.ok) {
                status = result.responseTime && result.responseTime > 5000 ? 'degraded' : 'up';
            }
            else {
                status = 'down';
            }
            this.recordCheck(service, status, result.responseTime, result.error);
        }
        catch (error) {
            this.recordCheck(service, 'down', undefined, error.message);
        }
    }
    /**
     * Get uptime report for a time period
     */
    getReport(periodMs = 24 * 60 * 60 * 1000) {
        const cutoff = Date.now() - periodMs;
        const recentChecks = this.checks.filter(c => new Date(c.timestamp).getTime() > cutoff);
        // Group checks by service
        const serviceMap = new Map();
        for (const check of recentChecks) {
            if (!serviceMap.has(check.service)) {
                serviceMap.set(check.service, []);
            }
            serviceMap.get(check.service).push(check);
        }
        // Calculate uptime for each service
        const services = [];
        let totalUptime = 0;
        for (const [service, checks] of serviceMap.entries()) {
            const successfulChecks = checks.filter(c => c.status === 'up').length;
            const failedChecks = checks.filter(c => c.status === 'down').length;
            const uptime = checks.length > 0 ? (successfulChecks / checks.length) * 100 : 0;
            const responseTimes = checks
                .filter(c => c.responseTime !== undefined)
                .map(c => c.responseTime);
            const avgResponseTime = responseTimes.length > 0
                ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
                : 0;
            services.push({
                service,
                uptime,
                totalChecks: checks.length,
                successfulChecks,
                failedChecks,
                avgResponseTime,
            });
            totalUptime += uptime;
        }
        const overallUptime = services.length > 0 ? totalUptime / services.length : 100;
        // Get incidents (down or degraded checks)
        const incidents = recentChecks
            .filter(c => c.status === 'down' || c.status === 'degraded')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 20);
        return {
            period: `${periodMs / 1000}s`,
            services,
            overallUptime,
            incidents,
        };
    }
    /**
     * Get current status of all services
     */
    getCurrentStatus() {
        const statusMap = new Map();
        // Get most recent check for each service
        for (const check of [...this.checks].reverse()) {
            if (!statusMap.has(check.service)) {
                statusMap.set(check.service, check);
            }
        }
        return statusMap;
    }
    /**
     * Clear all checks
     */
    clear() {
        this.checks = [];
    }
    /**
     * Start cleanup interval to remove old checks
     */
    startCleanupInterval() {
        setInterval(() => {
            const cutoff = Date.now() - this.retentionMs;
            this.checks = this.checks.filter(c => new Date(c.timestamp).getTime() > cutoff);
        }, 3600000); // Run every hour
    }
}
/**
 * Convenience function to record uptime check
 */
export function recordUptimeCheck(service, status, responseTime, error) {
    UptimeMonitor.getInstance().recordCheck(service, status, responseTime, error);
}
/**
 * Convenience function to check service health
 */
export async function checkServiceHealth(service, checkFn) {
    return UptimeMonitor.getInstance().checkService(service, checkFn);
}
/**
 * Get uptime report
 */
export function getUptimeReport(periodMs) {
    return UptimeMonitor.getInstance().getReport(periodMs);
}
/**
 * Get current service status
 */
export function getCurrentServiceStatus() {
    return UptimeMonitor.getInstance().getCurrentStatus();
}
//# sourceMappingURL=uptime-monitor.js.map