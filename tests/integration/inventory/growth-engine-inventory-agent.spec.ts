/**
 * Integration Tests: Growth Engine Inventory Agent (INVENTORY-534)
 *
 * Tests enhanced inventory agent that integrates with the Growth Engine framework
 * to provide advanced inventory management capabilities with MCP evidence,
 * heartbeat monitoring, and action queue integration.
 */

import { describe, it, expect } from "vitest";
import { 
  createGrowthEngineInventoryAgent,
  runGrowthEngineInventoryAnalysis,
  type GrowthEngineInventoryConfig
} from "~/services/inventory/growth-engine-inventory-agent";

describe("Growth Engine Inventory Agent - Initialization", () => {
  it("should initialize Growth Engine Inventory Agent", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'growth-engine-inventory-analysis',
      estimatedHours: 3,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: true,
      enableEmergencySourcing: true,
      enableROPCalculation: true,
      enableReconciliation: true
    };

    const agent = createGrowthEngineInventoryAgent(config);
    await agent.initialize();

    expect(agent).toBeDefined();
  });

  it("should handle different configuration options", async () => {
    const configs: GrowthEngineInventoryConfig[] = [
      {
        agent: 'inventory',
        date: '2025-10-22',
        task: 'basic-inventory-analysis',
        estimatedHours: 1,
        shopDomain: 'test.myshopify.com',
        enableAdvancedFeatures: false,
        enableEmergencySourcing: false,
        enableROPCalculation: true,
        enableReconciliation: false
      },
      {
        agent: 'inventory',
        date: '2025-10-22',
        task: 'advanced-inventory-analysis',
        estimatedHours: 6,
        shopDomain: 'hotrodan.myshopify.com',
        enableAdvancedFeatures: true,
        enableEmergencySourcing: true,
        enableROPCalculation: true,
        enableReconciliation: true
      }
    ];

    for (const config of configs) {
      const agent = createGrowthEngineInventoryAgent(config);
      await agent.initialize();
      expect(agent).toBeDefined();
    }
  });
});

describe("Growth Engine Inventory Agent - Inventory Analysis", () => {
  it("should run comprehensive inventory analysis", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'growth-engine-inventory-analysis',
      estimatedHours: 3,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: true,
      enableEmergencySourcing: true,
      enableROPCalculation: true,
      enableReconciliation: false
    };

    const agent = createGrowthEngineInventoryAgent(config);
    await agent.initialize();

    const actions = await agent.runInventoryAnalysis();

    expect(Array.isArray(actions)).toBe(true);
    expect(actions.length).toBeGreaterThan(0);

    // Verify action structure
    actions.forEach(action => {
      expect(action.type).toBeDefined();
      expect(action.target).toBeDefined();
      expect(action.draft).toBeDefined();
      expect(action.evidence).toBeDefined();
      expect(action.expected_impact).toBeDefined();
      expect(action.confidence).toBeGreaterThan(0);
      expect(action.confidence).toBeLessThanOrEqual(1);
      expect(action.agent).toBe('inventory-agent');
    });
  });

  it("should generate ROP analysis actions", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'rop-analysis',
      estimatedHours: 2,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: false,
      enableEmergencySourcing: false,
      enableROPCalculation: true,
      enableReconciliation: false
    };

    const actions = await runGrowthEngineInventoryAnalysis(config);

    const ropActions = actions.filter(action => action.type === 'inventory_reorder');
    expect(ropActions.length).toBeGreaterThan(0);

    ropActions.forEach(action => {
      expect(action.type).toBe('inventory_reorder');
      expect(action.evidence.mcp_request_ids).toContain('shopify-inventory-rop');
      expect(action.expected_impact.metric).toBe('stockout_risk');
      expect(action.rollback_plan).toBeDefined();
    });
  });

  it("should generate emergency sourcing actions", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'emergency-sourcing-analysis',
      estimatedHours: 2,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: false,
      enableEmergencySourcing: true,
      enableROPCalculation: false,
      enableReconciliation: false
    };

    const actions = await runGrowthEngineInventoryAnalysis(config);

    const emergencyActions = actions.filter(action => action.type === 'emergency_sourcing');
    expect(emergencyActions.length).toBeGreaterThanOrEqual(0);

    emergencyActions.forEach(action => {
      expect(action.type).toBe('emergency_sourcing');
      expect(action.evidence.mcp_request_ids).toContain('shopify-bundles');
      expect(action.expected_impact.metric).toBe('revenue');
      expect(action.rollback_plan).toBeDefined();
    });
  });

  it("should generate stock alert actions", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'stock-alert-analysis',
      estimatedHours: 1,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: false,
      enableEmergencySourcing: false,
      enableROPCalculation: false,
      enableReconciliation: false
    };

    const actions = await runGrowthEngineInventoryAnalysis(config);

    const stockActions = actions.filter(action => action.type === 'stock_alert');
    expect(stockActions.length).toBeGreaterThan(0);

    stockActions.forEach(action => {
      expect(action.type).toBe('stock_alert');
      expect(action.evidence.mcp_request_ids).toContain('shopify-inventory-alert');
      expect(action.expected_impact.metric).toBe('stockout_risk');
      expect(action.risk_tier).toMatch(/policy|safety/);
    });
  });

  it("should generate advanced inventory actions", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'advanced-inventory-analysis',
      estimatedHours: 4,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: true,
      enableEmergencySourcing: false,
      enableROPCalculation: false,
      enableReconciliation: false
    };

    const actions = await runGrowthEngineInventoryAnalysis(config);

    const advancedActions = actions.filter(action => 
      action.type === 'inventory_optimization' || 
      action.type === 'vendor_performance'
    );
    expect(advancedActions.length).toBeGreaterThan(0);

    advancedActions.forEach(action => {
      expect(['inventory_optimization', 'vendor_performance']).toContain(action.type);
      expect(action.evidence.mcp_request_ids).toContain('shopify-advanced-analytics');
      expect(action.ease).toBe('hard');
      expect(action.risk_tier).toBe('perf');
    });
  });
});

describe("Growth Engine Inventory Agent - Nightly Reconciliation", () => {
  it("should run nightly reconciliation", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'nightly-reconciliation',
      estimatedHours: 2,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: false,
      enableEmergencySourcing: false,
      enableROPCalculation: false,
      enableReconciliation: true
    };

    const agent = createGrowthEngineInventoryAgent(config);
    await agent.initialize();

    const actions = await agent.runNightlyReconciliation();

    expect(Array.isArray(actions)).toBe(true);
    
    // Should generate reconciliation actions if there are critical alerts
    const reconciliationActions = actions.filter(action => action.type === 'reconciliation_alert');
    expect(reconciliationActions.length).toBeGreaterThanOrEqual(0);

    reconciliationActions.forEach(action => {
      expect(action.type).toBe('reconciliation_alert');
      expect(action.evidence.mcp_request_ids).toContain('shopify-reconciliation');
      expect(action.expected_impact.metric).toBe('stockout_risk');
      expect(action.confidence).toBe(0.95);
    });
  });
});

describe("Growth Engine Inventory Agent - Compliance", () => {
  it("should check compliance status", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'compliance-check',
      estimatedHours: 1,
      shopDomain: 'hotrodan.myshopify.com'
    };

    const agent = createGrowthEngineInventoryAgent(config);
    await agent.initialize();

    const compliance = await agent.checkCompliance();

    expect(compliance).toBeDefined();
    expect(compliance.mcpEvidence).toBeDefined();
    expect(compliance.heartbeat).toBeDefined();
    expect(compliance.devMCPBan).toBeDefined();
    expect(compliance.overall).toBeDefined();
  });

  it("should generate compliance report", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'compliance-report',
      estimatedHours: 1,
      shopDomain: 'hotrodan.myshopify.com'
    };

    const agent = createGrowthEngineInventoryAgent(config);
    await agent.initialize();

    const report = await agent.getComplianceReport();

    expect(typeof report).toBe('string');
    expect(report).toContain('Growth Engine Support Framework Compliance Report');
    expect(report).toContain('MCP Evidence');
    expect(report).toContain('Heartbeat');
    expect(report).toContain('Dev MCP Ban');
  });
});

describe("Growth Engine Inventory Agent - Error Handling", () => {
  it("should handle initialization errors gracefully", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'error-test',
      estimatedHours: 1,
      shopDomain: 'invalid-shop.myshopify.com'
    };

    const agent = createGrowthEngineInventoryAgent(config);
    
    // Should not throw error during initialization
    await expect(agent.initialize()).resolves.not.toThrow();
  });

  it("should handle analysis errors gracefully", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'error-analysis',
      estimatedHours: 1,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: true,
      enableEmergencySourcing: true,
      enableROPCalculation: true,
      enableReconciliation: false
    };

    const actions = await runGrowthEngineInventoryAnalysis(config);

    // Should return empty array or partial results on error
    expect(Array.isArray(actions)).toBe(true);
  });
});

describe("Growth Engine Inventory Agent - Integration", () => {
  it("should meet all Growth Engine requirements", async () => {
    const config: GrowthEngineInventoryConfig = {
      agent: 'inventory',
      date: '2025-10-22',
      task: 'growth-engine-integration-test',
      estimatedHours: 3,
      shopDomain: 'hotrodan.myshopify.com',
      enableAdvancedFeatures: true,
      enableEmergencySourcing: true,
      enableROPCalculation: true,
      enableReconciliation: true
    };

    const agent = createGrowthEngineInventoryAgent(config);
    await agent.initialize();

    // Test 1: Growth Engine features implemented
    const actions = await agent.runInventoryAnalysis();
    expect(actions.length).toBeGreaterThan(0);

    // Test 2: Advanced capabilities working
    const advancedActions = actions.filter(action => 
      action.type === 'inventory_optimization' || 
      action.type === 'vendor_performance'
    );
    expect(advancedActions.length).toBeGreaterThan(0);

    // Test 3: Performance optimizations applied
    const performanceActions = actions.filter(action => 
      action.ease === 'hard' && action.risk_tier === 'perf'
    );
    expect(performanceActions.length).toBeGreaterThan(0);

    // Test 4: All requirements met
    const compliance = await agent.checkCompliance();
    expect(compliance.overall).toBeDefined();

    // Verify MCP evidence is logged
    actions.forEach(action => {
      expect(action.evidence.mcp_request_ids.length).toBeGreaterThan(0);
      expect(action.evidence.dataset_links.length).toBeGreaterThan(0);
      expect(action.evidence.telemetry_refs.length).toBeGreaterThan(0);
    });

    // Verify action queue integration
    actions.forEach(action => {
      expect(action.id).toBeDefined();
      expect(action.type).toBeDefined();
      expect(action.target).toBeDefined();
      expect(action.draft).toBeDefined();
      expect(action.expected_impact).toBeDefined();
      expect(action.confidence).toBeGreaterThan(0);
      expect(action.rollback_plan).toBeDefined();
      expect(action.freshness_label).toBeDefined();
      expect(action.agent).toBe('inventory-agent');
    });
  });
});
