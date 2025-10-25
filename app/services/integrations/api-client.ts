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

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { getRateLimiter, RateLimiter } from '~/lib/rate-limiter';

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

export class APIClient {
  private axios: AxiosInstance;
  private rateLimiter: RateLimiter;
  private config: APIClientConfig;
  private healthStatus: HealthCheck;

  constructor(config: APIClientConfig) {
    this.config = {
      timeout: 30000,
      retries: 3,
      retryDelay: 1000,
      rateLimit: {
        maxRequestsPerSecond: 10,
        burstSize: 20,
      },
      ...config,
    };

    this.rateLimiter = getRateLimiter(config.baseURL, this.config.rateLimit);
    this.healthStatus = {
      service: config.baseURL,
      healthy: false,
      lastChecked: new Date().toISOString(),
    };

    this.axios = this.createAxiosInstance();
    this.setupInterceptors();
  }

  private createAxiosInstance(): AxiosInstance {
    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'HotDash-Integration/1.0',
        ...this.config.headers,
      },
    });

    // Set up authentication
    if (this.config.auth) {
      this.setupAuthentication(instance);
    }

    return instance;
  }

  private setupAuthentication(instance: AxiosInstance): void {
    const { auth } = this.config;
    if (!auth) return;

    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          instance.defaults.headers.Authorization = `Bearer ${auth.token}`;
        }
        break;
      case 'basic':
        if (auth.username && auth.password) {
          instance.defaults.auth = {
            username: auth.username,
            password: auth.password,
          };
        }
        break;
      case 'api-key':
        if (auth.apiKey && auth.apiKeyHeader) {
          instance.defaults.headers[auth.apiKeyHeader] = auth.apiKey;
        }
        break;
    }
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axios.interceptors.request.use(
      (config) => {
        // Add request ID for tracking
        config.headers['X-Request-ID'] = crypto.randomUUID();
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.axios.interceptors.response.use(
      (response) => {
        // Update health status on successful response
        this.updateHealthStatus(true, response);
        return response;
      },
      async (error: AxiosError) => {
        // Update health status on error
        this.updateHealthStatus(false, undefined, error);
        
        // Handle retry logic
        if (this.shouldRetry(error)) {
          return this.handleRetry(error);
        }
        
        return Promise.reject(this.transformError(error));
      }
    );
  }

  private updateHealthStatus(healthy: boolean, response?: AxiosResponse, error?: AxiosError): void {
    this.healthStatus = {
      service: this.config.baseURL,
      healthy,
      latency: response ? Date.now() - (response.config.metadata?.startTime || 0) : undefined,
      error: error?.message,
      lastChecked: new Date().toISOString(),
    };
  }

  private shouldRetry(error: AxiosError): boolean {
    if (!this.config.retries || this.config.retries <= 0) return false;
    
    // Retry on network errors
    if (!error.response) return true;
    
    // Retry on server errors (5xx)
    if (error.response.status >= 500) return true;
    
    // Retry on rate limiting (429)
    if (error.response.status === 429) return true;
    
    return false;
  }

  private async handleRetry(error: AxiosError): Promise<AxiosResponse> {
    const config = error.config as AxiosRequestConfig & { retryCount?: number };
    config.retryCount = (config.retryCount || 0) + 1;

    if (config.retryCount > this.config.retries!) {
      return Promise.reject(this.transformError(error));
    }

    // Exponential backoff
    const delay = this.config.retryDelay! * Math.pow(2, config.retryCount - 1);
    await this.sleep(delay);

    return this.axios.request(config);
  }

  private transformError(error: AxiosError): APIError {
    if (error.response) {
      return {
        code: `HTTP_${error.response.status}`,
        message: error.response.data?.message || error.message,
        status: error.response.status,
        details: error.response.data,
        retryable: error.response.status >= 500 || error.response.status === 429,
      };
    }

    if (error.request) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network request failed',
        details: error.request,
        retryable: true,
      };
    }

    return {
      code: 'REQUEST_ERROR',
      message: error.message,
      details: error,
      retryable: false,
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<APIResponse<T>> {
    const startTime = Date.now();
    
    try {
      // Apply rate limiting
      const response = await this.rateLimiter.execute(() => 
        this.axios.request<T>(config)
      );

      return {
        success: true,
        data: response.data,
        metadata: {
          status: response.status,
          headers: response.headers as Record<string, string>,
          latency: Date.now() - startTime,
          retryCount: (config as any).retryCount || 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error as APIError,
        metadata: {
          status: (error as AxiosError).response?.status || 0,
          headers: {},
          latency: Date.now() - startTime,
          retryCount: (config as any).retryCount || 0,
        },
      };
    }
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<APIResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  getHealthStatus(): HealthCheck {
    return { ...this.healthStatus };
  }

  async healthCheck(): Promise<HealthCheck> {
    try {
      const response = await this.get('/health');
      this.healthStatus = {
        service: this.config.baseURL,
        healthy: response.success,
        latency: response.metadata?.latency,
        error: response.success ? undefined : response.error?.message,
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      this.healthStatus = {
        service: this.config.baseURL,
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        lastChecked: new Date().toISOString(),
      };
    }

    return this.getHealthStatus();
  }

  updateAuth(auth: APIClientConfig['auth']): void {
    this.config.auth = auth;
    this.setupAuthentication(this.axios);
  }

  getRateLimitInfo() {
    return this.rateLimiter.getRateLimitInfo();
  }

  getQueueStats() {
    return this.rateLimiter.getQueueStats();
  }
}

/**
 * Factory function to create API clients for common services
 */
export function createShopifyClient(accessToken: string): APIClient {
  return new APIClient({
    baseURL: `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01`,
    headers: {
      'X-Shopify-Access-Token': accessToken,
    },
    rateLimit: {
      maxRequestsPerSecond: 2,
      burstSize: 10,
    },
    retries: 3,
    retryDelay: 1000,
  });
}

export function createPublerClient(apiKey: string, workspaceId: string): APIClient {
  return new APIClient({
    baseURL: 'https://app.publer.com/api/v1',
    auth: {
      type: 'api-key',
      apiKey,
      apiKeyHeader: 'Authorization',
    },
    headers: {
      'Publer-Workspace-Id': workspaceId,
    },
    rateLimit: {
      maxRequestsPerSecond: 5,
      burstSize: 15,
    },
    retries: 3,
    retryDelay: 1000,
  });
}

export function createChatwootClient(baseUrl: string, token: string, accountId: number): APIClient {
  return new APIClient({
    baseURL: `${baseUrl}/api/v1/accounts/${accountId}`,
    auth: {
      type: 'api-key',
      apiKey: token,
      apiKeyHeader: 'api_access_token',
    },
    rateLimit: {
      maxRequestsPerSecond: 10,
      burstSize: 30,
    },
    retries: 3,
    retryDelay: 1000,
  });
}

export function createGenericClient(config: APIClientConfig): APIClient {
  return new APIClient(config);
}
