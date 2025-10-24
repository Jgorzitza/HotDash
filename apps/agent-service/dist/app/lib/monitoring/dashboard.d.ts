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
export interface DashboardMetrics {
    timestamp: string;
    errors: {
        total: number;
        unique: number;
        critical: number;
        byLevel: {
            critical: number;
            error: number;
            warning: number;
        };
        topErrors: Array<{
            message: string;
            count: number;
            level: string;
        }>;
    };
    performance: {
        routes: {
            count: number;
            avgDuration: number;
            p95: number;
        };
        apis: {
            count: number;
            avgDuration: number;
            p95: number;
        };
        database: {
            count: number;
            avgDuration: number;
            p95: number;
        };
    };
    uptime: {
        overall: number;
        services: Array<{
            service: string;
            uptime: number;
            status: 'up' | 'down' | 'degraded';
        }>;
        incidents: number;
    };
    alerts: {
        total: number;
        unacknowledged: number;
        critical: number;
        bySeverity: {
            critical: number;
            warning: number;
            info: number;
        };
    };
    health: {
        status: 'healthy' | 'degraded' | 'unhealthy';
        issues: string[];
    };
}
export declare class MonitoringDashboard {
    private static instance;
    private constructor();
    static getInstance(): MonitoringDashboard;
    /**
     * Get comprehensive dashboard metrics
     */
    getMetrics(periodMs?: number): DashboardMetrics;
    /**
     * Determine overall system health
     */
    private determineHealth;
    /**
     * Get health summary
     */
    getHealthSummary(): {
        status: 'healthy' | 'degraded' | 'unhealthy';
        message: string;
        timestamp: string;
    };
}
/**
 * Get dashboard metrics
 */
export declare function getDashboardMetrics(periodMs?: number): DashboardMetrics;
/**
 * Get health summary
 */
export declare function getHealthSummary(): {
    status: "healthy" | "degraded" | "unhealthy";
    message: string;
    timestamp: string;
};
//# sourceMappingURL=dashboard.d.ts.map