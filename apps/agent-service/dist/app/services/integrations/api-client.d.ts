/**
 * Third-Party API Integration Suite
 *
 * Comprehensive API client with:
 * - Error handling and retry logic
 * - Rate limiting and queue management
 * - Request/response interceptors
 * - Health monitoring
 * - Type-safe responses
 */
import { AxiosRequestConfig } from 'axios';
export interface APIClientConfig {
    baseURL: string;
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    rateLimit?: {
        maxRequestsPerSecond: number;
        burstSize: number;
    };
    headers?: Record<string, string>;
    auth?: {
        type: 'bearer' | 'basic' | 'api-key';
        token?: string;
        username?: string;
        password?: string;
        apiKey?: string;
        apiKeyHeader?: string;
    };
}
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: APIError;
    metadata?: {
        status: number;
        headers: Record<string, string>;
        latency: number;
        retryCount: number;
    };
}
export interface APIError {
    code: string;
    message: string;
    status?: number;
    details?: any;
    retryable: boolean;
}
export interface HealthCheck {
    service: string;
    healthy: boolean;
    latency?: number;
    error?: string;
    lastChecked: string;
}
export declare class APIClient {
    private axios;
    private rateLimiter;
    private config;
    private healthStatus;
    constructor(config: APIClientConfig);
    private createAxiosInstance;
    private setupAuthentication;
    private setupInterceptors;
    private updateHealthStatus;
    private shouldRetry;
    private handleRetry;
    private transformError;
    private sleep;
    request<T = any>(config: AxiosRequestConfig): Promise<APIResponse<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>>;
    getHealthStatus(): HealthCheck;
    healthCheck(): Promise<HealthCheck>;
    updateAuth(auth: APIClientConfig['auth']): void;
    getRateLimitInfo(): import("~/lib/rate-limiter").RateLimitInfo;
    getQueueStats(): {
        queueLength: number;
        tokens: number;
        processing: boolean;
    };
}
/**
 * Factory function to create API clients for common services
 */
export declare function createShopifyClient(accessToken: string): APIClient;
export declare function createPublerClient(apiKey: string, workspaceId: string): APIClient;
export declare function createChatwootClient(baseUrl: string, token: string, accountId: number): APIClient;
export declare function createGenericClient(config: APIClientConfig): APIClient;
//# sourceMappingURL=api-client.d.ts.map