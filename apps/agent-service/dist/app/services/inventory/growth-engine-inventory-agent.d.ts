/**
 * Growth Engine Inventory Agent (INVENTORY-534)
 *
 * Enhanced inventory agent that integrates with the Growth Engine framework
 * to provide advanced inventory management capabilities with MCP evidence,
 * heartbeat monitoring, and action queue integration.
 *
 * Context7: /microsoft/typescript - advanced type patterns
 * Context7: /websites/reactrouter - API patterns
 */
import { ActionQueueItem } from "~/lib/growth-engine/action-queue";
export interface GrowthEngineInventoryConfig {
    agent: string;
    date: string;
    task: string;
    estimatedHours: number;
    shopDomain: string;
    enableAdvancedFeatures?: boolean;
    enableEmergencySourcing?: boolean;
    enableROPCalculation?: boolean;
    enableReconciliation?: boolean;
}
export interface InventoryAction {
    type: 'inventory_reorder' | 'emergency_sourcing' | 'rop_optimization' | 'reconciliation' | 'stock_alert';
    target: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: {
        metric: string;
        delta: number;
        unit: string;
    };
    confidence: number;
    evidence: {
        mcp_request_ids: string[];
        dataset_links: string[];
        telemetry_refs: string[];
    };
    rollback_plan: string;
    freshness_label: string;
}
export declare class GrowthEngineInventoryAgent {
    private framework;
    private config;
    private isInitialized;
    constructor(config: GrowthEngineInventoryConfig);
    /**
     * Initialize the Growth Engine Inventory Agent
     */
    initialize(): Promise<void>;
    /**
     * Run comprehensive inventory analysis
     */
    runInventoryAnalysis(): Promise<ActionQueueItem[]>;
    /**
     * Run ROP (Reorder Point) analysis
     */
    private runROPAnalysis;
    /**
     * Run emergency sourcing analysis
     */
    private runEmergencySourcingAnalysis;
    /**
     * Run stock alert analysis
     */
    private runStockAlertAnalysis;
    /**
     * Run advanced inventory analysis
     */
    private runAdvancedInventoryAnalysis;
    /**
     * Run nightly reconciliation
     */
    runNightlyReconciliation(): Promise<ActionQueueItem[]>;
    /**
     * Get compliance report
     */
    getComplianceReport(): Promise<string>;
    /**
     * Check if all requirements are met
     */
    checkCompliance(): Promise<{
        mcpEvidence: boolean;
        heartbeat: boolean;
        devMCPBan: boolean;
        overall: boolean;
    }>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Growth Engine Inventory Agent
 */
export declare function createGrowthEngineInventoryAgent(config: GrowthEngineInventoryConfig): GrowthEngineInventoryAgent;
/**
 * Utility function to run inventory analysis with Growth Engine integration
 */
export declare function runGrowthEngineInventoryAnalysis(config: GrowthEngineInventoryConfig): Promise<ActionQueueItem[]>;
//# sourceMappingURL=growth-engine-inventory-agent.d.ts.map