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
import { checkAllIntegrations } from './health';

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
  successful: Array<{ name: string; data: T }>;
  failed: Array<{ name: string; error: string }>;
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

export class IntegrationManager {
  private integrations: Map<string, IntegrationConfig> = new Map();
  private metrics: Map<string, IntegrationMetrics> = new Map();
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor() {
    this.initializeDefaultIntegrations();
  }

  private initializeDefaultIntegrations(): void {
    // Initialize with existing integrations
    this.registerIntegration({
      name: 'shopify',
      client: this.createShopifyClient(),
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeout: 30000,
        monitoringPeriod: 60000,
      },
    });

    this.registerIntegration({
      name: 'publer',
      client: this.createPublerClient(),
      circuitBreaker: {
        failureThreshold: 3,
        recoveryTimeout: 60000,
        monitoringPeriod: 120000,
      },
    });

    this.registerIntegration({
      name: 'chatwoot',
      client: this.createChatwootClient(),
      circuitBreaker: {
        failureThreshold: 5,
        recoveryTimeout: 30000,
        monitoringPeriod: 60000,
      },
    });
  }

  private createShopifyClient(): APIClient {
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error('SHOPIFY_ACCESS_TOKEN is required');
    }
    
    return new APIClient({
      baseURL: `https://${process.env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
      rateLimit: {
        maxRequestsPerSecond: 2,
        burstSize: 10,
      },
    });
  }

  private createPublerClient(): APIClient {
    const apiKey = process.env.PUBLER_API_KEY;
    const workspaceId = process.env.PUBLER_WORKSPACE_ID;
    
    if (!apiKey || !workspaceId) {
      throw new Error('PUBLER_API_KEY and PUBLER_WORKSPACE_ID are required');
    }

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
    });
  }

  private createChatwootClient(): APIClient {
    const baseUrl = process.env.CHATWOOT_BASE_URL || 'https://app.chatwoot.com';
    const token = process.env.CHATWOOT_API_TOKEN;
    const accountId = process.env.CHATWOOT_ACCOUNT_ID;

    if (!token || !accountId) {
      throw new Error('CHATWOOT_API_TOKEN and CHATWOOT_ACCOUNT_ID are required');
    }

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
    });
  }

  registerIntegration(config: IntegrationConfig): void {
    this.integrations.set(config.name, config);
    this.metrics.set(config.name, {
      name: config.name,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageLatency: 0,
      circuitBreakerOpen: false,
    });

    if (config.circuitBreaker) {
      this.circuitBreakers.set(config.name, new CircuitBreaker(config.circuitBreaker));
    }
  }

  async executeRequest<T = any>(
    integrationName: string,
    requestFn: (client: APIClient) => Promise<APIResponse<T>>
  ): Promise<APIResponse<T>> {
    const integration = this.integrations.get(integrationName);
    if (!integration) {
      throw new Error(`Integration '${integrationName}' not found`);
    }

    const circuitBreaker = this.circuitBreakers.get(integrationName);
    if (circuitBreaker && circuitBreaker.isOpen()) {
      return {
        success: false,
        error: {
          code: 'CIRCUIT_BREAKER_OPEN',
          message: `Circuit breaker is open for ${integrationName}`,
          retryable: true,
        },
      };
    }

    const startTime = Date.now();
    const metrics = this.metrics.get(integrationName)!;

    try {
      const response = await requestFn(integration.client);
      const latency = Date.now() - startTime;

      // Update metrics
      metrics.totalRequests++;
      if (response.success) {
        metrics.successfulRequests++;
        metrics.lastSuccess = new Date().toISOString();
        if (circuitBreaker) {
          circuitBreaker.recordSuccess();
        }
      } else {
        metrics.failedRequests++;
        metrics.lastError = response.error?.message;
        if (circuitBreaker) {
          circuitBreaker.recordFailure();
        }
      }

      // Update average latency
      metrics.averageLatency = 
        (metrics.averageLatency * (metrics.totalRequests - 1) + latency) / metrics.totalRequests;

      return response;
    } catch (error) {
      const latency = Date.now() - startTime;
      metrics.totalRequests++;
      metrics.failedRequests++;
      metrics.lastError = error instanceof Error ? error.message : 'Unknown error';
      
      if (circuitBreaker) {
        circuitBreaker.recordFailure();
      }

      return {
        success: false,
        error: {
          code: 'INTEGRATION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          retryable: true,
        },
        metadata: {
          status: 0,
          headers: {},
          latency,
          retryCount: 0,
        },
      };
    }
  }

  async executeBulkOperation<T = any>(
    operations: Array<{
      integrationName: string;
      requestFn: (client: APIClient) => Promise<APIResponse<T>>;
    }>
  ): Promise<BulkOperationResult<T>> {
    const results = await Promise.allSettled(
      operations.map(async (op) => {
        const response = await this.executeRequest(op.integrationName, op.requestFn);
        return {
          name: op.integrationName,
          response,
        };
      })
    );

    const successful: Array<{ name: string; data: T }> = [];
    const failed: Array<{ name: string; error: string }> = [];

    results.forEach((result, index) => {
      const operation = operations[index];
      if (result.status === 'fulfilled' && result.value.response.success) {
        successful.push({
          name: operation.integrationName,
          data: result.value.response.data!,
        });
      } else {
        const error = result.status === 'rejected' 
          ? result.reason 
          : result.value.response.error?.message || 'Unknown error';
        failed.push({
          name: operation.integrationName,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    return {
      successful,
      failed,
      summary: {
        total: operations.length,
        successful: successful.length,
        failed: failed.length,
        successRate: successful.length / operations.length,
      },
    };
  }

  async getHealthStatus(): Promise<HealthCheck[]> {
    const healthChecks = await Promise.all(
      Array.from(this.integrations.values()).map(async (integration) => {
        return integration.client.healthCheck();
      })
    );

    return healthChecks;
  }

  getMetrics(): IntegrationMetrics[] {
    return Array.from(this.metrics.values());
  }

  getIntegrationMetrics(name: string): IntegrationMetrics | undefined {
    return this.metrics.get(name);
  }

  resetMetrics(name?: string): void {
    if (name) {
      const metrics = this.metrics.get(name);
      if (metrics) {
        metrics.totalRequests = 0;
        metrics.successfulRequests = 0;
        metrics.failedRequests = 0;
        metrics.averageLatency = 0;
        metrics.lastError = undefined;
        metrics.lastSuccess = undefined;
      }
    } else {
      this.metrics.forEach((metrics) => {
        metrics.totalRequests = 0;
        metrics.successfulRequests = 0;
        metrics.failedRequests = 0;
        metrics.averageLatency = 0;
        metrics.lastError = undefined;
        metrics.lastSuccess = undefined;
      });
    }
  }

  getCircuitBreakerStatus(name: string): boolean {
    const circuitBreaker = this.circuitBreakers.get(name);
    return circuitBreaker ? circuitBreaker.isOpen() : false;
  }

  resetCircuitBreaker(name: string): void {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (circuitBreaker) {
      circuitBreaker.reset();
    }
  }
}

class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';

  constructor(private config: {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
  }) {}

  isOpen(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.config.recoveryTimeout) {
        this.state = 'HALF_OPEN';
        return false;
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  reset(): void {
    this.failureCount = 0;
    this.lastFailureTime = 0;
    this.state = 'CLOSED';
  }
}

// Singleton instance
export const integrationManager = new IntegrationManager();
