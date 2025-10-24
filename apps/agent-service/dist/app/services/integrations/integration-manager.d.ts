/**
 * Integration Manager
 *
 * Orchestrates multiple third-party API integrations with:
 * - Centralized health monitoring
 * - Circuit breaker pattern
 * - Bulk operations
 * - Error aggregation
 * - Performance metrics
 */
import { APIClient, APIResponse, HealthCheck } from './api-client';
export interface IntegrationConfig {
    name: string;
    client: APIClient;
    circuitBreaker?: {
        failureThreshold: number;
        recoveryTimeout: number;
        monitoringPeriod: number;
    };
    retryPolicy?: {
        maxRetries: number;
        backoffMultiplier: number;
        maxBackoff: number;
    };
}
export interface BulkOperationResult<T = any> {
    successful: Array<{
        name: string;
        data: T;
    }>;
    failed: Array<{
        name: string;
        error: string;
    }>;
    summary: {
        total: number;
        successful: number;
        failed: number;
        successRate: number;
    };
}
export interface IntegrationMetrics {
    name: string;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageLatency: number;
    lastError?: string;
    lastSuccess?: string;
    circuitBreakerOpen: boolean;
}
export declare class IntegrationManager {
    private integrations;
    private metrics;
    private circuitBreakers;
    constructor();
    private initializeDefaultIntegrations;
    private createShopifyClient;
    private createPublerClient;
    private createChatwootClient;
    registerIntegration(config: IntegrationConfig): void;
    executeRequest<T = any>(integrationName: string, requestFn: (client: APIClient) => Promise<APIResponse<T>>): Promise<APIResponse<T>>;
    executeBulkOperation<T = any>(operations: Array<{
        integrationName: string;
        requestFn: (client: APIClient) => Promise<APIResponse<T>>;
    }>): Promise<BulkOperationResult<T>>;
    getHealthStatus(): Promise<HealthCheck[]>;
    getMetrics(): IntegrationMetrics[];
    getIntegrationMetrics(name: string): IntegrationMetrics | undefined;
    resetMetrics(name?: string): void;
    getCircuitBreakerStatus(name: string): boolean;
    resetCircuitBreaker(name: string): void;
}
export declare const integrationManager: IntegrationManager;
//# sourceMappingURL=integration-manager.d.ts.map