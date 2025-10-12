/**
 * Standardized API Client Utility
 * 
 * Provides consistent patterns for external API calls with:
 * - Retry logic with exponential backoff
 * - Request/response logging
 * - Error handling and transformation
 * - Timeout management
 */

import { ServiceError } from '../services/types';

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
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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
export class ApiClient {
  private options: Required<Omit<ApiClientOptions, 'headers' | 'serviceName'>> & { 
    headers: Record<string, string>;
    serviceName: string;
  };

  constructor(options: ApiClientOptions) {
    this.options = {
      baseUrl: options.baseUrl.replace(/\/$/, ''), // Remove trailing slash
      headers: options.headers || {},
      timeout: options.timeout || 10000,
      maxRetries: options.maxRetries || 2,
      retryDelay: options.retryDelay || 1000,
      serviceName: options.serviceName || 'api-client',
    };
  }

  /**
   * Make an API request with retries
   */
  async request<T = any>(path: string, requestOptions: RequestOptions = {}): Promise<T> {
    const url = `${this.options.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
    const method = requestOptions.method || 'GET';
    const shouldRetry = requestOptions.retry !== false;
    
    let lastError: Error | null = null;
    const maxAttempts = shouldRetry ? this.options.maxRetries + 1 : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff
          const delay = this.options.retryDelay * Math.pow(2, attempt - 1);
          console.log(`[${this.options.serviceName}] Retry ${attempt}/${this.options.maxRetries} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const response = await this.executeRequest(url, method, requestOptions);
        return response as T;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on 4xx errors (client errors)
        if (error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }
        
        // Continue to next retry attempt
        console.error(`[${this.options.serviceName}] Attempt ${attempt + 1} failed:`, error.message);
      }
    }

    // All retries failed
    throw lastError;
  }

  /**
   * Execute a single request
   */
  private async executeRequest(url: string, method: string, options: RequestOptions): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      options.timeout || this.options.timeout
    );

    try {
      const headers = {
        ...this.options.headers,
        ...options.headers,
      };

      // Add Content-Type for POST/PUT/PATCH with body
      if (['POST', 'PUT', 'PATCH'].includes(method) && options.body) {
        headers['Content-Type'] = headers['Content-Type'] || 'application/json';
      }

      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (options.body) {
        fetchOptions.body = typeof options.body === 'string' 
          ? options.body 
          : JSON.stringify(options.body);
      }

      const startTime = Date.now();
      const response = await fetch(url, fetchOptions);
      const duration = Date.now() - startTime;

      console.log(`[${this.options.serviceName}] ${method} ${url} - ${response.status} (${duration}ms)`);

      if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new ServiceError(
          `API request failed: ${response.status} ${response.statusText}`,
          {
            scope: `${this.options.serviceName}.http`,
            code: `HTTP_${response.status}`,
            retryable: response.status >= 500,
            cause: new Error(text),
          }
        );
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        return await response.json();
      }

      // Return text for non-JSON responses
      return await response.text();
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * GET request
   */
  async get<T = any>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T = any>(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'POST', body });
  }

  /**
   * PUT request
   */
  async put<T = any>(path: string, body?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'PUT', body });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(path: string, options: Omit<RequestOptions, 'method' | 'body'> = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

