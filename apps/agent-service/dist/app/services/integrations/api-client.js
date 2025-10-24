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
import axios from 'axios';
import { getRateLimiter } from '~/lib/rate-limiter';
export class APIClient {
    axios;
    rateLimiter;
    config;
    healthStatus;
    constructor(config) {
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
    createAxiosInstance() {
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
    setupAuthentication(instance) {
        const { auth } = this.config;
        if (!auth)
            return;
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
    setupInterceptors() {
        // Request interceptor
        this.axios.interceptors.request.use((config) => {
            // Add request ID for tracking
            config.headers['X-Request-ID'] = crypto.randomUUID();
            return config;
        }, (error) => Promise.reject(error));
        // Response interceptor
        this.axios.interceptors.response.use((response) => {
            // Update health status on successful response
            this.updateHealthStatus(true, response);
            return response;
        }, async (error) => {
            // Update health status on error
            this.updateHealthStatus(false, undefined, error);
            // Handle retry logic
            if (this.shouldRetry(error)) {
                return this.handleRetry(error);
            }
            return Promise.reject(this.transformError(error));
        });
    }
    updateHealthStatus(healthy, response, error) {
        this.healthStatus = {
            service: this.config.baseURL,
            healthy,
            latency: response ? Date.now() - (response.config.metadata?.startTime || 0) : undefined,
            error: error?.message,
            lastChecked: new Date().toISOString(),
        };
    }
    shouldRetry(error) {
        if (!this.config.retries || this.config.retries <= 0)
            return false;
        // Retry on network errors
        if (!error.response)
            return true;
        // Retry on server errors (5xx)
        if (error.response.status >= 500)
            return true;
        // Retry on rate limiting (429)
        if (error.response.status === 429)
            return true;
        return false;
    }
    async handleRetry(error) {
        const config = error.config;
        config.retryCount = (config.retryCount || 0) + 1;
        if (config.retryCount > this.config.retries) {
            return Promise.reject(this.transformError(error));
        }
        // Exponential backoff
        const delay = this.config.retryDelay * Math.pow(2, config.retryCount - 1);
        await this.sleep(delay);
        return this.axios.request(config);
    }
    transformError(error) {
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
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async request(config) {
        const startTime = Date.now();
        try {
            // Apply rate limiting
            const response = await this.rateLimiter.execute(() => this.axios.request(config));
            return {
                success: true,
                data: response.data,
                metadata: {
                    status: response.status,
                    headers: response.headers,
                    latency: Date.now() - startTime,
                    retryCount: config.retryCount || 0,
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: error,
                metadata: {
                    status: error.response?.status || 0,
                    headers: {},
                    latency: Date.now() - startTime,
                    retryCount: config.retryCount || 0,
                },
            };
        }
    }
    async get(url, config) {
        return this.request({ ...config, method: 'GET', url });
    }
    async post(url, data, config) {
        return this.request({ ...config, method: 'POST', url, data });
    }
    async put(url, data, config) {
        return this.request({ ...config, method: 'PUT', url, data });
    }
    async patch(url, data, config) {
        return this.request({ ...config, method: 'PATCH', url, data });
    }
    async delete(url, config) {
        return this.request({ ...config, method: 'DELETE', url });
    }
    getHealthStatus() {
        return { ...this.healthStatus };
    }
    async healthCheck() {
        try {
            const response = await this.get('/health');
            this.healthStatus = {
                service: this.config.baseURL,
                healthy: response.success,
                latency: response.metadata?.latency,
                error: response.success ? undefined : response.error?.message,
                lastChecked: new Date().toISOString(),
            };
        }
        catch (error) {
            this.healthStatus = {
                service: this.config.baseURL,
                healthy: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                lastChecked: new Date().toISOString(),
            };
        }
        return this.getHealthStatus();
    }
    updateAuth(auth) {
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
export function createShopifyClient(accessToken) {
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
export function createPublerClient(apiKey, workspaceId) {
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
export function createChatwootClient(baseUrl, token, accountId) {
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
export function createGenericClient(config) {
    return new APIClient(config);
}
//# sourceMappingURL=api-client.js.map