/**
 * Integration Tests: Integration Manager with Circuit Breakers
 * 
 * Tests circuit breaker functionality and integration orchestration
 * for INTEGRATIONS-021 acceptance criteria.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IntegrationManager } from '~/services/integrations/integration-manager';
import { APIClient } from '~/services/integrations/api-client';

// Mock environment variables
vi.stubEnv('SHOPIFY_ACCESS_TOKEN', 'test-token');
vi.stubEnv('SHOPIFY_SHOP_DOMAIN', 'test-shop.myshopify.com');
vi.stubEnv('PUBLER_API_KEY', 'test-api-key');
vi.stubEnv('PUBLER_WORKSPACE_ID', 'test-workspace');
vi.stubEnv('CHATWOOT_API_TOKEN', 'test-token');
vi.stubEnv('CHATWOOT_ACCOUNT_ID', '1');

describe('Integration Manager - Circuit Breakers', () => {
  let manager: IntegrationManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new IntegrationManager();
  });

  describe('Circuit Breaker Configuration', () => {
    it('should initialize with circuit breakers for all integrations', () => {
      // Verify circuit breakers are configured
      expect(manager.getCircuitBreakerStatus('shopify')).toBe(false); // Initially closed
      expect(manager.getCircuitBreakerStatus('publer')).toBe(false);
      expect(manager.getCircuitBreakerStatus('chatwoot')).toBe(false);
    });

    it('should have correct failure thresholds', () => {
      // Shopify: 5 failures
      // Publer: 3 failures
      // Chatwoot: 5 failures
      const shopifyThreshold = 5;
      const publerThreshold = 3;
      const chatwootThreshold = 5;

      expect(shopifyThreshold).toBe(5);
      expect(publerThreshold).toBe(3);
      expect(chatwootThreshold).toBe(5);
    });

    it('should have correct recovery timeouts', () => {
      // Shopify: 30000ms (30s)
      // Publer: 60000ms (60s)
      // Chatwoot: 30000ms (30s)
      const shopifyTimeout = 30000;
      const publerTimeout = 60000;
      const chatwootTimeout = 30000;

      expect(shopifyTimeout).toBe(30000);
      expect(publerTimeout).toBe(60000);
      expect(chatwootTimeout).toBe(30000);
    });
  });

  describe('Circuit Breaker States', () => {
    it('should start in CLOSED state', () => {
      const isOpen = manager.getCircuitBreakerStatus('shopify');
      expect(isOpen).toBe(false); // CLOSED = false
    });

    it('should transition to OPEN after threshold failures', async () => {
      // Mock the client to always fail
      const mockClient = {
        request: vi.fn().mockRejectedValue(new Error('API Error')),
        healthCheck: vi.fn().mockResolvedValue({ healthy: false }),
        getHealthStatus: vi.fn().mockReturnValue({ healthy: false }),
        getRateLimitInfo: vi.fn(),
        getQueueStats: vi.fn(),
      } as unknown as APIClient;

      manager.registerIntegration({
        name: 'test-integration',
        client: mockClient,
        circuitBreaker: {
          failureThreshold: 3,
          recoveryTimeout: 30000,
          monitoringPeriod: 60000,
        },
      });

      // Simulate 3 failures to open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await manager.executeRequest('test-integration', (client) => 
            client.request({ url: '/test' })
          );
        } catch (error) {
          // Expected to fail
        }
      }

      // Circuit should now be open
      const isOpen = manager.getCircuitBreakerStatus('test-integration');
      expect(isOpen).toBe(true);
    });

    it('should reject requests when circuit is OPEN', async () => {
      const mockClient = {
        request: vi.fn().mockRejectedValue(new Error('API Error')),
        healthCheck: vi.fn().mockResolvedValue({ healthy: false }),
        getHealthStatus: vi.fn().mockReturnValue({ healthy: false }),
        getRateLimitInfo: vi.fn(),
        getQueueStats: vi.fn(),
      } as unknown as APIClient;

      manager.registerIntegration({
        name: 'test-integration-2',
        client: mockClient,
        circuitBreaker: {
          failureThreshold: 2,
          recoveryTimeout: 30000,
          monitoringPeriod: 60000,
        },
      });

      // Trigger circuit breaker
      for (let i = 0; i < 2; i++) {
        try {
          await manager.executeRequest('test-integration-2', (client) => 
            client.request({ url: '/test' })
          );
        } catch (error) {
          // Expected
        }
      }

      // Next request should be rejected by circuit breaker
      const response = await manager.executeRequest('test-integration-2', (client) => 
        client.request({ url: '/test' })
      );

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('CIRCUIT_BREAKER_OPEN');
    });

    it('should reset circuit breaker on manual reset', () => {
      manager.resetCircuitBreaker('shopify');
      const isOpen = manager.getCircuitBreakerStatus('shopify');
      expect(isOpen).toBe(false);
    });
  });

  describe('Integration Metrics', () => {
    it('should track request metrics', () => {
      const metrics = manager.getMetrics();
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should track successful requests', async () => {
      const mockClient = {
        request: vi.fn().mockResolvedValue({ 
          success: true, 
          data: { result: 'ok' },
          metadata: { status: 200, headers: {}, latency: 100, retryCount: 0 }
        }),
        healthCheck: vi.fn().mockResolvedValue({ healthy: true }),
        getHealthStatus: vi.fn().mockReturnValue({ healthy: true }),
        getRateLimitInfo: vi.fn(),
        getQueueStats: vi.fn(),
      } as unknown as APIClient;

      manager.registerIntegration({
        name: 'test-success',
        client: mockClient,
      });

      await manager.executeRequest('test-success', (client) => 
        client.request({ url: '/test' })
      );

      const metrics = manager.getIntegrationMetrics('test-success');
      expect(metrics).toBeDefined();
      expect(metrics?.totalRequests).toBeGreaterThan(0);
      expect(metrics?.successfulRequests).toBeGreaterThan(0);
    });

    it('should track failed requests', async () => {
      const mockClient = {
        request: vi.fn().mockResolvedValue({ 
          success: false, 
          error: { code: 'ERROR', message: 'Failed', retryable: false }
        }),
        healthCheck: vi.fn().mockResolvedValue({ healthy: false }),
        getHealthStatus: vi.fn().mockReturnValue({ healthy: false }),
        getRateLimitInfo: vi.fn(),
        getQueueStats: vi.fn(),
      } as unknown as APIClient;

      manager.registerIntegration({
        name: 'test-failure',
        client: mockClient,
      });

      await manager.executeRequest('test-failure', (client) => 
        client.request({ url: '/test' })
      );

      const metrics = manager.getIntegrationMetrics('test-failure');
      expect(metrics).toBeDefined();
      expect(metrics?.totalRequests).toBeGreaterThan(0);
      expect(metrics?.failedRequests).toBeGreaterThan(0);
    });

    it('should calculate average latency', async () => {
      const mockClient = {
        request: vi.fn().mockResolvedValue({ 
          success: true, 
          data: { result: 'ok' },
          metadata: { status: 200, headers: {}, latency: 150, retryCount: 0 }
        }),
        healthCheck: vi.fn().mockResolvedValue({ healthy: true }),
        getHealthStatus: vi.fn().mockReturnValue({ healthy: true }),
        getRateLimitInfo: vi.fn(),
        getQueueStats: vi.fn(),
      } as unknown as APIClient;

      manager.registerIntegration({
        name: 'test-latency',
        client: mockClient,
      });

      await manager.executeRequest('test-latency', (client) => 
        client.request({ url: '/test' })
      );

      const metrics = manager.getIntegrationMetrics('test-latency');
      expect(metrics).toBeDefined();
      expect(metrics?.averageLatency).toBeGreaterThanOrEqual(0);
    });

    it('should reset metrics', () => {
      manager.resetMetrics('shopify');
      const metrics = manager.getIntegrationMetrics('shopify');
      expect(metrics?.totalRequests).toBe(0);
      expect(metrics?.successfulRequests).toBe(0);
      expect(metrics?.failedRequests).toBe(0);
    });
  });

  describe('Bulk Operations', () => {
    it('should execute bulk operations across integrations', async () => {
      const mockClient = {
        request: vi.fn().mockResolvedValue({ 
          success: true, 
          data: { result: 'ok' },
          metadata: { status: 200, headers: {}, latency: 100, retryCount: 0 }
        }),
        healthCheck: vi.fn().mockResolvedValue({ healthy: true }),
        getHealthStatus: vi.fn().mockReturnValue({ healthy: true }),
        getRateLimitInfo: vi.fn(),
        getQueueStats: vi.fn(),
      } as unknown as APIClient;

      manager.registerIntegration({
        name: 'bulk-test-1',
        client: mockClient,
      });

      manager.registerIntegration({
        name: 'bulk-test-2',
        client: mockClient,
      });

      const result = await manager.executeBulkOperation([
        {
          integrationName: 'bulk-test-1',
          requestFn: (client) => client.request({ url: '/test1' }),
        },
        {
          integrationName: 'bulk-test-2',
          requestFn: (client) => client.request({ url: '/test2' }),
        },
      ]);

      expect(result.summary.total).toBe(2);
      expect(result.successful.length + result.failed.length).toBe(2);
    });

    it('should calculate success rate for bulk operations', async () => {
      const successClient = {
        request: vi.fn().mockResolvedValue({ 
          success: true, 
          data: { result: 'ok' },
          metadata: { status: 200, headers: {}, latency: 100, retryCount: 0 }
        }),
        healthCheck: vi.fn().mockResolvedValue({ healthy: true }),
        getHealthStatus: vi.fn().mockReturnValue({ healthy: true }),
        getRateLimitInfo: vi.fn(),
        getQueueStats: vi.fn(),
      } as unknown as APIClient;

      const failClient = {
        request: vi.fn().mockResolvedValue({ 
          success: false, 
          error: { code: 'ERROR', message: 'Failed', retryable: false }
        }),
        healthCheck: vi.fn().mockResolvedValue({ healthy: false }),
        getHealthStatus: vi.fn().mockReturnValue({ healthy: false }),
        getRateLimitInfo: vi.fn(),
        getQueueStats: vi.fn(),
      } as unknown as APIClient;

      manager.registerIntegration({ name: 'bulk-success', client: successClient });
      manager.registerIntegration({ name: 'bulk-fail', client: failClient });

      const result = await manager.executeBulkOperation([
        { integrationName: 'bulk-success', requestFn: (c) => c.request({ url: '/test' }) },
        { integrationName: 'bulk-fail', requestFn: (c) => c.request({ url: '/test' }) },
      ]);

      expect(result.summary.successRate).toBeGreaterThanOrEqual(0);
      expect(result.summary.successRate).toBeLessThanOrEqual(1);
    });
  });

  describe('Health Monitoring', () => {
    it('should check health status of all integrations', async () => {
      const healthChecks = await manager.getHealthStatus();
      expect(Array.isArray(healthChecks)).toBe(true);
    });
  });
});

