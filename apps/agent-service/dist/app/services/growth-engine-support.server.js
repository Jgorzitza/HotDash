/**
 * Growth Engine Support Framework
 *
 * Main service that coordinates MCP Evidence, Heartbeat, and Dev MCP Ban
 * for Growth Engine phases 9-12 compliance.
 */
import { mcpEvidenceService } from './mcp-evidence.server';
import { heartbeatService } from './heartbeat.server';
import { devMCPBanService } from './dev-mcp-ban.server';
export class GrowthEngineSupportFramework {
    config;
    heartbeatInterval;
    constructor(config) {
        this.config = config;
    }
    /**
     * Initialize the Growth Engine Support Framework
     */
    async initialize() {
        const { agent, date, task, estimatedHours } = this.config;
        // Initialize MCP evidence system
        await mcpEvidenceService.initializeEvidenceFile(agent, date, 'general');
        // Initialize heartbeat system if task >2 hours
        if (estimatedHours > 2) {
            await heartbeatService.initializeHeartbeatFile(agent, date);
            // Start heartbeat monitoring
            this.heartbeatInterval = await heartbeatService.startHeartbeatMonitoring(agent, date, task, 15 // 15 minutes interval
            );
        }
    }
    /**
     * Log MCP tool usage
     */
    async logMCPUsage(tool, docRef, requestId, purpose, topic = 'general') {
        const entry = {
            tool,
            doc_ref: docRef,
            request_id: requestId,
            timestamp: new Date().toISOString(),
            purpose
        };
        await mcpEvidenceService.appendEvidence(this.config.agent, this.config.date, topic, entry);
    }
    /**
     * Update heartbeat status
     */
    async updateHeartbeat(status, progress, file) {
        const entry = {
            timestamp: new Date().toISOString(),
            task: this.config.task,
            status,
            progress,
            file
        };
        await heartbeatService.appendHeartbeat(this.config.agent, this.config.date, entry);
    }
    /**
     * Validate production safety (Dev MCP Ban)
     */
    async validateProductionSafety() {
        return await devMCPBanService.validateProductionSafety();
    }
    /**
     * Generate PR template sections
     */
    async generatePRTemplate() {
        const [mcpEvidence, heartbeat, devMCPCheck] = await Promise.all([
            mcpEvidenceService.generatePRTemplateSection(this.config.agent, this.config.date),
            heartbeatService.generatePRTemplateSection(this.config.agent, this.config.date, this.config.task),
            devMCPBanService.generatePRTemplateSection()
        ]);
        return {
            mcpEvidence,
            heartbeat,
            devMCPCheck
        };
    }
    /**
     * Check if all requirements are met
     */
    async checkCompliance() {
        const [hasEvidence, hasHeartbeat, validation] = await Promise.all([
            mcpEvidenceService.hasEvidenceFiles(this.config.agent, this.config.date),
            this.config.estimatedHours > 2 ?
                heartbeatService.hasHeartbeatFile(this.config.agent, this.config.date) :
                true,
            devMCPBanService.validateProductionSafety()
        ]);
        const overall = hasEvidence && hasHeartbeat && validation.valid;
        return {
            mcpEvidence: hasEvidence,
            heartbeat: hasHeartbeat,
            devMCPBan: validation.valid,
            overall
        };
    }
    /**
     * Get compliance report
     */
    async getComplianceReport() {
        const compliance = await this.checkCompliance();
        const prTemplate = await this.generatePRTemplate();
        const report = [
            '# Growth Engine Support Framework Compliance Report',
            '',
            '## Compliance Status',
            `- MCP Evidence: ${compliance.mcpEvidence ? '✅' : '❌'}`,
            `- Heartbeat: ${compliance.heartbeat ? '✅' : '❌'}`,
            `- Dev MCP Ban: ${compliance.devMCPBan ? '✅' : '❌'}`,
            `- Overall: ${compliance.overall ? '✅' : '❌'}`,
            '',
            '## PR Template Sections',
            '',
            prTemplate.mcpEvidence,
            '',
            prTemplate.heartbeat,
            '',
            prTemplate.devMCPCheck
        ];
        return report.join('\n');
    }
    /**
     * Cleanup resources
     */
    async cleanup() {
        if (this.heartbeatInterval) {
            heartbeatService.stopHeartbeatMonitoring(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }
    /**
     * Create CI check scripts
     */
    async createCIChecks() {
        await devMCPBanService.createCICheckScript();
        await devMCPBanService.createPreCommitHook();
    }
    /**
     * Get MCP evidence entries
     */
    async getMCPEvidence(topic = 'general') {
        return await mcpEvidenceService.getEvidenceEntries(this.config.agent, this.config.date, topic);
    }
    /**
     * Get heartbeat entries
     */
    async getHeartbeatEntries() {
        return await heartbeatService.getHeartbeatEntries(this.config.agent, this.config.date);
    }
    /**
     * Check if heartbeat is stale
     */
    async isHeartbeatStale() {
        return await heartbeatService.isHeartbeatStale(this.config.agent, this.config.date, this.config.task);
    }
}
/**
 * Factory function to create Growth Engine Support Framework
 */
export function createGrowthEngineSupport(config) {
    return new GrowthEngineSupportFramework(config);
}
/**
 * Utility function to log MCP usage with automatic framework integration
 */
export async function logMCPUsage(framework, tool, docRef, requestId, purpose, topic) {
    await framework.logMCPUsage(tool, docRef, requestId, purpose, topic);
}
/**
 * Utility function to update heartbeat with automatic framework integration
 */
export async function updateHeartbeat(framework, status, progress, file) {
    await framework.updateHeartbeat(status, progress, file);
}
//# sourceMappingURL=growth-engine-support.server.js.map