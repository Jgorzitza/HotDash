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
export interface UptimeCheck {
    id: string;
    timestamp: string;
    service: string;
    status: 'up' | 'down' | 'degraded';
    responseTime?: number;
    error?: string;
}
export interface UptimeReport {
    period: string;
    services: ServiceUptime[];
    overallUptime: number;
    incidents: UptimeCheck[];
}
interface ServiceUptime {
    service: string;
    uptime: number;
    totalChecks: number;
    successfulChecks: number;
    failedChecks: number;
    avgResponseTime: number;
}
export declare class UptimeMonitor {
    private static instance;
    private checks;
    private readonly maxChecks;
    private readonly retentionMs;
    private constructor();
    static getInstance(): UptimeMonitor;
    /**
     * Record an uptime check
     */
    recordCheck(service: string, status: UptimeCheck['status'], responseTime?: number, error?: string): void;
    /**
     * Perform health check on a service
     */
    checkService(service: string, checkFn: () => Promise<{
        ok: boolean;
        responseTime?: number;
        error?: string;
    }>): Promise<void>;
    /**
     * Get uptime report for a time period
     */
    getReport(periodMs?: number): UptimeReport;
    /**
     * Get current status of all services
     */
    getCurrentStatus(): Map<string, UptimeCheck>;
    /**
     * Clear all checks
     */
    clear(): void;
    /**
     * Start cleanup interval to remove old checks
     */
    private startCleanupInterval;
}
/**
 * Convenience function to record uptime check
 */
export declare function recordUptimeCheck(service: string, status: UptimeCheck['status'], responseTime?: number, error?: string): void;
/**
 * Convenience function to check service health
 */
export declare function checkServiceHealth(service: string, checkFn: () => Promise<{
    ok: boolean;
    responseTime?: number;
    error?: string;
}>): Promise<void>;
/**
 * Get uptime report
 */
export declare function getUptimeReport(periodMs?: number): UptimeReport;
/**
 * Get current service status
 */
export declare function getCurrentServiceStatus(): Map<string, UptimeCheck>;
export {};
//# sourceMappingURL=uptime-monitor.d.ts.map