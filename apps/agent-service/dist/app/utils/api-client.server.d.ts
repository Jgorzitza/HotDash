/**
 * Standardized API Client Utility
 *
 * Provides consistent patterns for external API calls with:
 * - Retry logic with exponential backoff
 * - Request/response logging
 * - Error handling and transformation
 * - Timeout management
 */
export interface ApiClientOptions {
    /** Base URL for the API */
    baseUrl: string;
    /** Default headers to include in all requests */
    headers?: Record<string, string>;
    /** Request timeout in milliseconds (default: 10000) */
    timeout?: number;
    /** Maximum retry attempts for retryable errors (default: 2) */
    maxRetries?: number;
    /** Initial retry delay in ms (default: 1000) */
    retryDelay?: number;
    /** Service name for error scoping */
    serviceName?: string;
}
export interface RequestOptions {
    /** HTTP method */
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    /** Request body (will be JSON.stringify'd) */
    body?: any;
    /** Additional headers for this request */
    headers?: Record<string, string>;
    /** Override timeout for this request */
    timeout?: number;
    /** Whether to retry this request on failure */
    retry?: boolean;
}
/**
 * Standardized API Client
 *
 * Usage:
 * ```typescript
 * const client = new ApiClient({
 *   baseUrl: 'https://api.example.com',
 *   headers: { 'Authorization': `Bearer ${token}` },
 *   serviceName: 'example-api',
 * });
 *
 * const data = await client.request<ResponseType>('/endpoint', {
 *   method: 'POST',
 *   body: { key: 'value' },
 * });
 * ```
 */
export declare class ApiClient {
    private options;
    constructor(options: ApiClientOptions);
    /**
     * Make an API request with retries
     */
    request<T = any>(path: string, requestOptions?: RequestOptions): Promise<T>;
    /**
     * Execute a single request
     */
    private executeRequest;
    /**
     * GET request
     */
    get<T = any>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
    /**
     * POST request
     */
    post<T = any>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
    /**
     * PUT request
     */
    put<T = any>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
    /**
     * DELETE request
     */
    delete<T = any>(path: string, options?: Omit<RequestOptions, "method" | "body">): Promise<T>;
}
//# sourceMappingURL=api-client.server.d.ts.map