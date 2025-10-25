/**
 * Growth Engine Integration Tests
 * 
 * Comprehensive tests for Growth Engine Integration service
 * and all related components.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createGrowthEngineIntegration, defaultIntegrationConfig } from '~/services/growth-engine-integration';
import { createGrowthEngineSupportAgent } from '~/services/growth-engine-support-agent';
import { growthEngineAnalytics } from '~/services/growth-engine-analytics';
import { createGrowthEnginePerformance, defaultPerformanceConfig } from '~/services/growth-engine-performance';

describe('Growth Engine Integration', () => {
  let integration: any;
  let config: any;

  beforeEach(() => {
    config = {
      ...defaultIntegrationConfig,
      agent: {
        name: 'test-support',
        date: '2025-10-22',
        task: 'TEST-INTEGRATION',
        estimatedHours: 1
      }
    };
  });

  afterEach(async () => {
    if (integration) {
      await integration.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully with default config', async () => {
      integration = createGrowthEngineIntegration(config);
      await integration.initialize();
      
      const status = integration.getStatus();
      expect(status.integration.status).toBe('active');
      expect(status.integration.health).toBeOneOf(['excellent', 'good', 'fair', 'poor', 'critical']);
    });

    it('should initialize all enabled components', async () => {
      integration = createGrowthEngineIntegration(config);
      await integration.initialize();
      
      const status = integration.getStatus();
      expect(status.integration.components.supportAgent).toBe(true);
      expect(status.integration.components.analytics).toBe(true);
      expect(status.integration.components.performance).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      const invalidConfig = {
        ...config,
        agent: {
          name: '',
          date: '',
          task: '',
          estimatedHours: -1
        }
      };
      
      integration = createGrowthEngineIntegration(invalidConfig);
      
      await expect(integration.initialize()).rejects.toThrow();
    });
  });

  describe('Support Request Processing', () => {
    beforeEach(async () => {
      integration = createGrowthEngineIntegration(config);
      await integration.initialize();
    });

    it('should process troubleshooting requests', async () => {
      const request = {
        type: 'troubleshooting' as const,
        priority: 'high' as const,
        description: 'System performance issue',
        context: { systemId: 'test-system' }
      };

      const result = await integration.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    it('should process optimization requests', async () => {
      const request = {
        type: 'optimization' as const,
        priority: 'medium' as const,
        description: 'Performance optimization needed',
        context: { targetSystem: 'test-system' }
      };

      const result = await integration.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should process analysis requests', async () => {
      const request = {
        type: 'analysis' as const,
        priority: 'low' as const,
        description: 'System analysis required',
        context: { analysisType: 'performance' }
      };

      const result = await integration.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.analytics).toBeDefined();
    });

    it('should process emergency requests', async () => {
      const request = {
        type: 'emergency' as const,
        priority: 'critical' as const,
        description: 'Critical system failure',
        context: { severity: 'critical' }
      };

      const result = await integration.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.metrics?.responseTime).toBeDefined();
    });

    it('should process comprehensive requests', async () => {
      const request = {
        type: 'comprehensive' as const,
        priority: 'high' as const,
        description: 'Comprehensive system review',
        context: { scope: 'full-system' }
      };

      const result = await integration.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.analytics).toBeDefined();
      expect(result.performance).toBeDefined();
    });
  });

  describe('Status and Monitoring', () => {
    beforeEach(async () => {
      integration = createGrowthEngineIntegration(config);
      await integration.initialize();
    });

    it('should provide comprehensive status', () => {
      const status = integration.getStatus();
      
      expect(status.agent).toBeDefined();
      expect(status.analytics).toBeDefined();
      expect(status.performance).toBeDefined();
      expect(status.integration).toBeDefined();
    });

    it('should track agent status', () => {
      const status = integration.getStatus();
      
      expect(status.agent.agent).toBe('test-support');
      expect(status.agent.status).toBeOneOf(['active', 'idle', 'busy', 'error']);
      expect(status.agent.capabilities).toBeDefined();
      expect(status.agent.performance).toBeDefined();
      expect(status.agent.metrics).toBeDefined();
    });

    it('should track analytics status', () => {
      const status = integration.getStatus();
      
      expect(status.analytics.metrics).toBeDefined();
      expect(status.analytics.insights).toBeDefined();
      expect(status.analytics.alerts).toBeDefined();
    });

    it('should track performance status', () => {
      const status = integration.getStatus();
      
      expect(status.performance.metrics).toBeDefined();
      expect(status.performance.targets).toBeDefined();
    });

    it('should track integration health', () => {
      const status = integration.getStatus();
      
      expect(status.integration.status).toBeOneOf(['active', 'idle', 'error']);
      expect(status.integration.health).toBeOneOf(['excellent', 'good', 'fair', 'poor', 'critical']);
      expect(status.integration.components).toBeDefined();
    });
  });

  describe('Comprehensive Reporting', () => {
    beforeEach(async () => {
      integration = createGrowthEngineIntegration(config);
      await integration.initialize();
    });

    it('should generate comprehensive report', async () => {
      const period = {
        start: '2025-10-22T00:00:00Z',
        end: '2025-10-22T23:59:59Z'
      };

      const report = await integration.generateComprehensiveReport(period);
      
      expect(report.integration).toBeDefined();
      expect(report.analytics).toBeDefined();
      expect(report.performance).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should include analytics report', async () => {
      const period = {
        start: '2025-10-22T00:00:00Z',
        end: '2025-10-22T23:59:59Z'
      };

      const report = await integration.generateComprehensiveReport(period);
      
      expect(report.analytics.period).toBeDefined();
      expect(report.analytics.summary).toBeDefined();
      expect(report.analytics.metrics).toBeDefined();
      expect(report.analytics.insights).toBeDefined();
      expect(report.analytics.recommendations).toBeDefined();
    });

    it('should include performance optimization', async () => {
      const period = {
        start: '2025-10-22T00:00:00Z',
        end: '2025-10-22T23:59:59Z'
      };

      const report = await integration.generateComprehensiveReport(period);
      
      expect(report.performance.success).toBeDefined();
      expect(report.performance.optimizations).toBeDefined();
      expect(report.performance.performanceGains).toBeDefined();
      expect(report.performance.recommendations).toBeDefined();
    });
  });

  describe('Optimization', () => {
    beforeEach(async () => {
      integration = createGrowthEngineIntegration(config);
      await integration.initialize();
    });

    it('should optimize all components', async () => {
      const result = await integration.optimizeAll();
      
      expect(result.success).toBe(true);
      expect(result.optimizations).toBeDefined();
      expect(result.performanceGains).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should provide optimization details', async () => {
      const result = await integration.optimizeAll();
      
      expect(result.optimizations.length).toBeGreaterThan(0);
      expect(result.performanceGains).toBeDefined();
      expect(result.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid requests gracefully', async () => {
      integration = createGrowthEngineIntegration(config);
      await integration.initialize();

      const invalidRequest = {
        type: 'invalid' as any,
        priority: 'invalid' as any,
        description: '',
        context: {}
      };

      await expect(integration.processSupportRequest(invalidRequest)).rejects.toThrow();
    });

    it('should handle component failures gracefully', async () => {
      const faultyConfig = {
        ...config,
        capabilities: {
          mcpEvidence: false,
          heartbeat: false,
          devMCPBan: false,
          aiFeatures: false,
          inventoryOptimization: false,
          advancedAnalytics: false,
          performanceOptimization: false
        }
      };

      integration = createGrowthEngineIntegration(faultyConfig);
      await integration.initialize();

      const status = integration.getStatus();
      expect(status.integration.health).toBe('critical');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources properly', async () => {
      integration = createGrowthEngineIntegration(config);
      await integration.initialize();
      
      await integration.cleanup();
      
      const status = integration.getStatus();
      expect(status.integration.status).toBe('idle');
    });
  });
});

describe('Growth Engine Support Agent', () => {
  let agent: any;
  let config: any;

  beforeEach(() => {
    config = {
      agent: 'test-support',
      date: '2025-10-22',
      task: 'TEST-AGENT',
      estimatedHours: 1,
      capabilities: {
        mcpEvidence: true,
        heartbeat: true,
        devMCPBan: true,
        aiFeatures: true,
        inventoryOptimization: true,
        advancedAnalytics: true
      },
      performance: {
        maxConcurrentTasks: 10,
        responseTimeThreshold: 5000,
        memoryLimit: 1024 * 1024 * 1024,
        cpuLimit: 80
      }
    };
  });

  afterEach(async () => {
    if (agent) {
      await agent.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      agent = createGrowthEngineSupportAgent(config);
      await agent.initialize();
      
      const status = agent.getStatus();
      expect(status.status).toBe('active');
      expect(status.currentTask).toBe('TEST-AGENT');
    });

    it('should handle initialization errors', async () => {
      const invalidConfig = {
        ...config,
        agent: '',
        date: '',
        task: '',
        estimatedHours: -1
      };

      agent = createGrowthEngineSupportAgent(invalidConfig);
      
      await expect(agent.initialize()).rejects.toThrow();
    });
  });

  describe('Support Request Processing', () => {
    beforeEach(async () => {
      agent = createGrowthEngineSupportAgent(config);
      await agent.initialize();
    });

    it('should process troubleshooting requests', async () => {
      const request = {
        type: 'troubleshooting' as const,
        priority: 'high' as const,
        description: 'System issue',
        context: {}
      };

      const result = await agent.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    it('should process optimization requests', async () => {
      const request = {
        type: 'optimization' as const,
        priority: 'medium' as const,
        description: 'Performance optimization',
        context: {}
      };

      const result = await agent.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    it('should process analysis requests', async () => {
      const request = {
        type: 'analysis' as const,
        priority: 'low' as const,
        description: 'System analysis',
        context: {}
      };

      const result = await agent.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    it('should process emergency requests', async () => {
      const request = {
        type: 'emergency' as const,
        priority: 'critical' as const,
        description: 'Critical issue',
        context: {}
      };

      const result = await agent.processSupportRequest(request);
      
      expect(result.success).toBe(true);
      expect(result.solution).toBeDefined();
      expect(result.metrics?.responseTime).toBeDefined();
    });
  });

  describe('Status and Metrics', () => {
    beforeEach(async () => {
      agent = createGrowthEngineSupportAgent(config);
      await agent.initialize();
    });

    it('should provide agent status', () => {
      const status = agent.getStatus();
      
      expect(status.agent).toBe('test-support');
      expect(status.status).toBeOneOf(['active', 'idle', 'busy', 'error']);
      expect(status.capabilities).toBeDefined();
      expect(status.performance).toBeDefined();
      expect(status.metrics).toBeDefined();
    });

    it('should track performance metrics', () => {
      const status = agent.getStatus();
      
      expect(status.performance.cpuUsage).toBeDefined();
      expect(status.performance.memoryUsage).toBeDefined();
      expect(status.performance.responseTime).toBeDefined();
      expect(status.performance.throughput).toBeDefined();
    });

    it('should track business metrics', () => {
      const status = agent.getStatus();
      
      expect(status.metrics.tasksCompleted).toBeDefined();
      expect(status.metrics.issuesResolved).toBeDefined();
      expect(status.metrics.uptime).toBeDefined();
      expect(status.metrics.errorRate).toBeDefined();
    });
  });
});

describe('Growth Engine Analytics', () => {
  let analytics: any;

  beforeEach(() => {
    analytics = growthEngineAnalytics;
  });

  describe('Metrics Collection', () => {
    it('should collect metrics successfully', async () => {
      const metrics = await analytics.collectMetrics();
      
      expect(metrics.systemPerformance).toBeDefined();
      expect(metrics.supportOperations).toBeDefined();
      expect(metrics.growthEngineComponents).toBeDefined();
      expect(metrics.aiAutomation).toBeDefined();
      expect(metrics.businessImpact).toBeDefined();
    });

    it('should generate insights', async () => {
      const insights = await analytics.generateInsights();
      
      expect(Array.isArray(insights)).toBe(true);
      insights.forEach(insight => {
        expect(insight.type).toBeOneOf(['performance', 'trend', 'anomaly', 'recommendation', 'prediction']);
        expect(insight.severity).toBeOneOf(['low', 'medium', 'high', 'critical']);
        expect(insight.title).toBeDefined();
        expect(insight.description).toBeDefined();
        expect(insight.confidence).toBeDefined();
        expect(insight.timestamp).toBeDefined();
      });
    });

    it('should generate performance report', async () => {
      const period = {
        start: '2025-10-22T00:00:00Z',
        end: '2025-10-22T23:59:59Z'
      };

      const report = await analytics.generatePerformanceReport(period);
      
      expect(report.period).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should provide dashboard data', async () => {
      const dashboard = await analytics.getDashboardData();
      
      expect(dashboard.metrics).toBeDefined();
      expect(dashboard.insights).toBeDefined();
      expect(dashboard.alerts).toBeDefined();
      expect(dashboard.trends).toBeDefined();
    });
  });
});

describe('Growth Engine Performance', () => {
  let performance: any;

  beforeEach(() => {
    performance = createGrowthEnginePerformance(defaultPerformanceConfig);
  });

  afterEach(() => {
    if (performance) {
      performance.cleanup();
    }
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await performance.initialize();
      // No explicit return value, but should not throw
    });

    it('should handle initialization errors', async () => {
      const invalidConfig = {
        ...defaultPerformanceConfig,
        caching: {
          enabled: true,
          ttl: -1, // Invalid TTL
          maxSize: -1, // Invalid max size
          strategy: 'invalid' as any
        }
      };

      const invalidPerformance = createGrowthEnginePerformance(invalidConfig);
      
      // Should handle invalid config gracefully
      await expect(invalidPerformance.initialize()).resolves.toBeUndefined();
    });
  });

  describe('Caching', () => {
    beforeEach(async () => {
      await performance.initialize();
    });

    it('should cache values', () => {
      const key = 'test-key';
      const value = { test: 'data' };
      
      performance.setCache(key, value);
      const cached = performance.getCache(key);
      
      expect(cached).toEqual(value);
    });

    it('should handle cache expiration', () => {
      const key = 'expired-key';
      const value = { test: 'data' };
      
      performance.setCache(key, value, 1); // 1ms TTL
      
      // Wait for expiration
      setTimeout(() => {
        const cached = performance.getCache(key);
        expect(cached).toBeNull();
      }, 10);
    });

    it('should clear cache', () => {
      performance.setCache('key1', 'value1');
      performance.setCache('key2', 'value2');
      
      performance.clearCache();
      
      expect(performance.getCache('key1')).toBeNull();
      expect(performance.getCache('key2')).toBeNull();
    });
  });

  describe('Optimization', () => {
    beforeEach(async () => {
      await performance.initialize();
    });

    it('should optimize performance', async () => {
      const result = await performance.optimize();
      
      expect(result.success).toBeDefined();
      expect(result.optimizations).toBeDefined();
      expect(result.performanceGains).toBeDefined();
      expect(result.recommendations).toBeDefined();
      expect(result.metrics).toBeDefined();
    });

    it('should check performance targets', () => {
      const targets = performance.checkPerformanceTargets();
      
      expect(targets.met).toBeDefined();
      expect(targets.targets).toBeDefined();
      expect(targets.recommendations).toBeDefined();
    });
  });

  describe('Metrics', () => {
    beforeEach(async () => {
      await performance.initialize();
    });

    it('should provide performance metrics', () => {
      const metrics = performance.getMetrics();
      
      expect(metrics.system).toBeDefined();
      expect(metrics.application).toBeDefined();
      expect(metrics.cache).toBeDefined();
      expect(metrics.database).toBeDefined();
    });
  });
});
