/**
 * MCP Evidence Service
 * 
 * Manages MCP tool usage evidence for Growth Engine compliance.
 * Required for all code changes to ensure proper MCP tool usage tracking.
 */

import { promises as fs } from 'fs';
import path from 'path';

export interface MCPEvidenceEntry {
  tool: 'storefront' | 'customer-accounts' | 'context7' | 'shopify-dev' | 'chrome-devtools' | 'web-search';
  doc_ref: string;
  request_id: string;
  timestamp: string;
  purpose: string;
}

export class MCPEvidenceService {
  private basePath: string;

  constructor(basePath: string = 'artifacts') {
    this.basePath = basePath;
  }

  /**
   * Initialize MCP evidence file for an agent and date
   */
  async initializeEvidenceFile(agent: string, date: string, topic: string): Promise<string> {
    const evidencePath = path.join(this.basePath, agent, date, 'mcp', `${topic}.jsonl`);
    const dirPath = path.dirname(evidencePath);
    
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });
    
    // Create empty file if it doesn't exist
    try {
      await fs.access(evidencePath);
    } catch {
      await fs.writeFile(evidencePath, '', 'utf8');
    }
    
    return evidencePath;
  }

  /**
   * Append MCP evidence entry to JSONL file
   */
  async appendEvidence(
    agent: string, 
    date: string, 
    topic: string, 
    entry: MCPEvidenceEntry
  ): Promise<void> {
    const evidencePath = await this.initializeEvidenceFile(agent, date, topic);
    
    // Validate entry
    this.validateEvidenceEntry(entry);
    
    // Append to JSONL file
    const jsonLine = JSON.stringify(entry) + '\n';
    await fs.appendFile(evidencePath, jsonLine, 'utf8');
  }

  /**
   * Get all evidence entries for an agent and date
   */
  async getEvidenceEntries(agent: string, date: string, topic: string): Promise<MCPEvidenceEntry[]> {
    const evidencePath = path.join(this.basePath, agent, date, 'mcp', `${topic}.jsonl`);
    
    try {
      const content = await fs.readFile(evidencePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      return lines.map(line => {
        try {
          return JSON.parse(line) as MCPEvidenceEntry;
        } catch (error) {
          console.error(`Invalid JSON in evidence file: ${line}`);
          throw new Error(`Invalid JSON in evidence file: ${line}`);
        }
      });
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Validate evidence entry format
   */
  private validateEvidenceEntry(entry: MCPEvidenceEntry): void {
    const validTools = ['storefront', 'customer-accounts', 'context7', 'shopify-dev', 'chrome-devtools', 'web-search'];
    
    if (!validTools.includes(entry.tool)) {
      throw new Error(`Invalid tool: ${entry.tool}. Must be one of: ${validTools.join(', ')}`);
    }
    
    if (!entry.doc_ref || typeof entry.doc_ref !== 'string') {
      throw new Error('doc_ref is required and must be a string');
    }
    
    if (!entry.request_id || typeof entry.request_id !== 'string') {
      throw new Error('request_id is required and must be a string');
    }
    
    if (!entry.timestamp || typeof entry.timestamp !== 'string') {
      throw new Error('timestamp is required and must be a string');
    }
    
    if (!entry.purpose || typeof entry.purpose !== 'string') {
      throw new Error('purpose is required and must be a string');
    }
    
    // Validate timestamp format (ISO 8601)
    const timestampRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    if (!timestampRegex.test(entry.timestamp)) {
      throw new Error('timestamp must be in ISO 8601 format');
    }
  }

  /**
   * Get evidence file paths for PR template
   */
  async getEvidenceFilePaths(agent: string, date: string): Promise<string[]> {
    const mcpDir = path.join(this.basePath, agent, date, 'mcp');
    
    try {
      const files = await fs.readdir(mcpDir);
      return files
        .filter(file => file.endsWith('.jsonl'))
        .map(file => path.relative(process.cwd(), path.join(mcpDir, file)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  /**
   * Check if evidence files exist for code changes
   */
  async hasEvidenceFiles(agent: string, date: string): Promise<boolean> {
    const filePaths = await this.getEvidenceFilePaths(agent, date);
    return filePaths.length > 0;
  }

  /**
   * Generate MCP Evidence section for PR template
   */
  async generatePRTemplateSection(agent: string, date: string): Promise<string> {
    const filePaths = await this.getEvidenceFilePaths(agent, date);
    
    if (filePaths.length === 0) {
      return '## MCP Evidence (required for code changes)\n- No MCP usage - non-code change';
    }
    
    const pathsList = filePaths.map(path => `- ${path}`).join('\n');
    return `## MCP Evidence (required for code changes)\n${pathsList}`;
  }
}

// Export singleton instance
export const mcpEvidenceService = new MCPEvidenceService();
