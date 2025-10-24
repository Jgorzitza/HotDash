/**
 * Integration Health Monitoring
 *
 * Monitors health of all external integrations:
 * - Publer API
 * - Shopify Admin API
 * - Chatwoot API
 */
export interface HealthCheckResult {
    service: string;
    healthy: boolean;
    latencyMs?: number;
    error?: string;
    details?: Record<string, any>;
    timestamp: string;
}
export interface AllHealthChecksResult {
    overall: "healthy" | "degraded" | "unhealthy";
    checks: HealthCheckResult[];
    summary: {
        total: number;
        healthy: number;
        unhealthy: number;
    };
}
export declare function checkPublerHealth(): Promise<HealthCheckResult>;
export declare function checkShopifyHealth(adminGraphqlClient?: any): Promise<HealthCheckResult>;
export declare function checkChatwootHealth(): Promise<HealthCheckResult>;
export declare function checkAllIntegrations(adminGraphqlClient?: any): Promise<AllHealthChecksResult>;
//# sourceMappingURL=health.d.ts.map