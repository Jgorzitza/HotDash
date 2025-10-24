/**
 * Growth Engine Support Framework
 *
 * Main service that coordinates MCP Evidence, Heartbeat, and Dev MCP Ban
 * for Growth Engine phases 9-12 compliance.
 */
import { MCPEvidenceEntry } from './mcp-evidence.server';
import { HeartbeatEntry } from './heartbeat.server';
export interface GrowthEngineConfig {
    agent: string;
    date: string;
    task: string;
    estimatedHours: number;
}
export declare class GrowthEngineSupportFramework {
    private config;
    private heartbeatInterval?;
    constructor(config: GrowthEngineConfig);
    /**
     * Initialize the Growth Engine Support Framework
     */
    initialize(): Promise<void>;
    /**
     * Log MCP tool usage
     */
    logMCPUsage(tool: MCPEvidenceEntry['tool'], docRef: string, requestId: string, purpose: string, topic?: string): Promise<void>;
    /**
     * Update heartbeat status
     */
    updateHeartbeat(status: HeartbeatEntry['status'], progress?: string, file?: string): Promise<void>;
    /**
     * Validate production safety (Dev MCP Ban)
     */
    validateProductionSafety(): Promise<{
        valid: boolean;
        violations: any[];
    }>;
    /**
     * Generate PR template sections
     */
    generatePRTemplate(): Promise<{
        mcpEvidence: string;
        heartbeat: string;
        devMCPCheck: string;
    }>;
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
     * Get compliance report
     */
    getComplianceReport(): Promise<string>;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
    /**
     * Create CI check scripts
     */
    createCIChecks(): Promise<void>;
    /**
     * Get MCP evidence entries
     */
    getMCPEvidence(topic?: string): Promise<MCPEvidenceEntry[]>;
    /**
     * Get heartbeat entries
     */
    getHeartbeatEntries(): Promise<HeartbeatEntry[]>;
    /**
     * Check if heartbeat is stale
     */
    isHeartbeatStale(): Promise<boolean>;
}
/**
 * Factory function to create Growth Engine Support Framework
 */
export declare function createGrowthEngineSupport(config: GrowthEngineConfig): GrowthEngineSupportFramework;
/**
 * Utility function to log MCP usage with automatic framework integration
 */
export declare function logMCPUsage(framework: GrowthEngineSupportFramework, tool: MCPEvidenceEntry['tool'], docRef: string, requestId: string, purpose: string, topic?: string): Promise<void>;
/**
 * Utility function to update heartbeat with automatic framework integration
 */
export declare function updateHeartbeat(framework: GrowthEngineSupportFramework, status: HeartbeatEntry['status'], progress?: string, file?: string): Promise<void>;
//# sourceMappingURL=growth-engine-support.server.d.ts.map