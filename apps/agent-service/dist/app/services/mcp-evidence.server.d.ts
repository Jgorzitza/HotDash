/**
 * MCP Evidence Service
 *
 * Manages MCP tool usage evidence for Growth Engine compliance.
 * Required for all code changes to ensure proper MCP tool usage tracking.
 */
export interface MCPEvidenceEntry {
    tool: 'storefront' | 'customer-accounts' | 'context7' | 'shopify-dev' | 'chrome-devtools' | 'web-search';
    doc_ref: string;
    request_id: string;
    timestamp: string;
    purpose: string;
}
export declare class MCPEvidenceService {
    private basePath;
    constructor(basePath?: string);
    /**
     * Initialize MCP evidence file for an agent and date
     */
    initializeEvidenceFile(agent: string, date: string, topic: string): Promise<string>;
    /**
     * Append MCP evidence entry to JSONL file
     */
    appendEvidence(agent: string, date: string, topic: string, entry: MCPEvidenceEntry): Promise<void>;
    /**
     * Get all evidence entries for an agent and date
     */
    getEvidenceEntries(agent: string, date: string, topic: string): Promise<MCPEvidenceEntry[]>;
    /**
     * Validate evidence entry format
     */
    private validateEvidenceEntry;
    /**
     * Get evidence file paths for PR template
     */
    getEvidenceFilePaths(agent: string, date: string): Promise<string[]>;
    /**
     * Check if evidence files exist for code changes
     */
    hasEvidenceFiles(agent: string, date: string): Promise<boolean>;
    /**
     * Generate MCP Evidence section for PR template
     */
    generatePRTemplateSection(agent: string, date: string): Promise<string>;
}
export declare const mcpEvidenceService: MCPEvidenceService;
//# sourceMappingURL=mcp-evidence.server.d.ts.map