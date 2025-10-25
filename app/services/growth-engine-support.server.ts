/**
 * Growth Engine Support Framework
 * 
 * Main service that coordinates MCP Evidence, Heartbeat, and Dev MCP Ban
 * for Growth Engine phases 9-12 compliance.
 */

import { mcpEvidenceService, MCPEvidenceEntry } from './mcp-evidence.server';
import { heartbeatService, HeartbeatEntry } from './heartbeat.server';

export interface GrowthEngineConfig {
  agent: string;
  date: string;
  task: string;
  estimatedHours: number;
}

export class GrowthEngineSupportFramework {
  private config: GrowthEngineConfig;
  private heartbeatInterval?: NodeJS.Timeout;

  constructor(config: GrowthEngineConfig) {
    this.config = config;
  }

  /**
   * Initialize the Growth Engine Support Framework
   */
  async initialize(): Promise<void> {
    const { agent, date, task, estimatedHours } = this.config;
    
    // Initialize MCP evidence system
    await mcpEvidenceService.initializeEvidenceFile(agent, date, 'general');
    
    // Initialize heartbeat system if task >2 hours
    if (estimatedHours > 2) {
      await heartbeatService.initializeHeartbeatFile(agent, date);
      
      // Start heartbeat monitoring
      this.heartbeatInterval = await heartbeatService.startHeartbeatMonitoring(
        agent, 
        date, 
        task, 
        15 // 15 minutes interval
      );
    }
  }

  /**
   * Log MCP tool usage
   */
  async logMCPUsage(
    tool: MCPEvidenceEntry['tool'],
    docRef: string,
    requestId: string,
    purpose: string,
    topic: string = 'general'
  ): Promise<void> {
    const entry: MCPEvidenceEntry = {
      tool,
      doc_ref: docRef,
      request_id: requestId,
      timestamp: new Date().toISOString(),
      purpose
    };
    
    await mcpEvidenceService.appendEvidence(
      this.config.agent,
      this.config.date,
      topic,
      entry
    );
  }

  /**
   * Update heartbeat status
   */
  async updateHeartbeat(
    status: HeartbeatEntry['status'],
    progress?: string,
    file?: string
  ): Promise<void> {
    const entry: HeartbeatEntry = {
      timestamp: new Date().toISOString(),
      task: this.config.task,
      status,
      progress,
      file
    };
    
    await heartbeatService.appendHeartbeat(
      this.config.agent,
      this.config.date,
      entry
    );
  }

  /**
   * Generate PR template sections
   */
  async generatePRTemplate(): Promise<{
    mcpEvidence: string;
    heartbeat: string;
  }> {
    const [mcpEvidence, heartbeat] = await Promise.all([
      mcpEvidenceService.generatePRTemplateSection(
        this.config.agent, 
        this.config.date
      ),
      heartbeatService.generatePRTemplateSection(
        this.config.agent, 
        this.config.date, 
        this.config.task
      )
    ]);

    return {
      mcpEvidence,
      heartbeat
    };
  }

  /**
   * Check if all requirements are met
   */
  async checkCompliance(): Promise<{
    mcpEvidence: boolean;
    heartbeat: boolean;
    overall: boolean;
  }> {
    const [hasEvidence, hasHeartbeat] = await Promise.all([
      mcpEvidenceService.hasEvidenceFiles(this.config.agent, this.config.date),
      this.config.estimatedHours > 2 ? 
        heartbeatService.hasHeartbeatFile(this.config.agent, this.config.date) : 
        true
    ]);

    const overall = hasEvidence && hasHeartbeat;

    return {
      mcpEvidence: hasEvidence,
      heartbeat: hasHeartbeat,
      overall
    };
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(): Promise<string> {
    const compliance = await this.checkCompliance();
    const prTemplate = await this.generatePRTemplate();
    
    const report = [
      '# Growth Engine Support Framework Compliance Report',
      '',
      '## Compliance Status',
      `- MCP Evidence: ${compliance.mcpEvidence ? '✅' : '❌'}`,
      `- Heartbeat: ${compliance.heartbeat ? '✅' : '❌'}`,
      `- Overall: ${compliance.overall ? '✅' : '❌'}`,
      '',
      '## PR Template Sections',
      '',
      prTemplate.mcpEvidence,
      '',
      prTemplate.heartbeat
    ];
    
    return report.join('\n');
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.heartbeatInterval) {
      heartbeatService.stopHeartbeatMonitoring(this.heartbeatInterval);
      this.heartbeatInterval = undefined;
    }
  }

  /**
   * Create CI check scripts
   */
  async createCIChecks(): Promise<void> {
    // Dev MCP ban checks are managed by CI scripts under scripts/ci.
    // Intentionally no-op in runtime to avoid dev tooling in production code.
    return;
  }

  /**
   * Get MCP evidence entries
   */
  async getMCPEvidence(topic: string = 'general'): Promise<MCPEvidenceEntry[]> {
    return await mcpEvidenceService.getEvidenceEntries(
      this.config.agent,
      this.config.date,
      topic
    );
  }

  /**
   * Get heartbeat entries
   */
  async getHeartbeatEntries(): Promise<HeartbeatEntry[]> {
    return await heartbeatService.getHeartbeatEntries(
      this.config.agent,
      this.config.date
    );
  }

  /**
   * Check if heartbeat is stale
   */
  async isHeartbeatStale(): Promise<boolean> {
    return await heartbeatService.isHeartbeatStale(
      this.config.agent,
      this.config.date,
      this.config.task
    );
  }
}

/**
 * Factory function to create Growth Engine Support Framework
 */
export function createGrowthEngineSupport(config: GrowthEngineConfig): GrowthEngineSupportFramework {
  return new GrowthEngineSupportFramework(config);
}

/**
 * Utility function to log MCP usage with automatic framework integration
 */
export async function logMCPUsage(
  framework: GrowthEngineSupportFramework,
  tool: MCPEvidenceEntry['tool'],
  docRef: string,
  requestId: string,
  purpose: string,
  topic?: string
): Promise<void> {
  await framework.logMCPUsage(tool, docRef, requestId, purpose, topic);
}

/**
 * Utility function to update heartbeat with automatic framework integration
 */
export async function updateHeartbeat(
  framework: GrowthEngineSupportFramework,
  status: HeartbeatEntry['status'],
  progress?: string,
  file?: string
): Promise<void> {
  await framework.updateHeartbeat(status, progress, file);
}
