/**
 * Health Check Utilities
 *
 * Provides health check endpoints and dependency monitoring for services.
 * Used by load balancers and monitoring systems to determine service health.
 */
export interface HealthStatus {
    status: "healthy" | "degraded" | "unhealthy";
    timestamp: string;
    uptime: number;
    version?: string;
    checks: HealthCheck[];
}
export interface HealthCheck {
    name: string;
    status: "pass" | "warn" | "fail";
    message?: string;
    responseTime?: number;
    metadata?: Record<string, any>;
}
export type HealthCheckFunction = () => Promise<HealthCheck>;
/**
 * Health Check Manager
 */
export declare class HealthCheckManager {
    private checks;
    /**
     * Register a health check
     */
    register(name: string, checkFn: HealthCheckFunction): void;
    /**
     * Run all health checks
     */
    runAll(): Promise<HealthStatus>;
    /**
     * Timeout helper for health checks
     */
    private timeout;
}
/**
 * Create default health check manager with common checks
 */
export declare function createHealthCheckManager(): HealthCheckManager;
/**
 * Shopify API health check
 */
export declare function checkShopifyHealth(): Promise<HealthCheck>;
/**
 * Google Analytics API health check
 */
export declare function checkGAHealth(): Promise<HealthCheck>;
/**
 * Chatwoot API health check
 */
export declare function checkChatwootHealth(): Promise<HealthCheck>;
/**
 * Export default health check manager
 */
export declare const healthCheckManager: HealthCheckManager;
//# sourceMappingURL=health-check.server.d.ts.map