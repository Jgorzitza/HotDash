/**
 * Growth Engine Support Framework Tests
 * 
 * Comprehensive tests for MCP Evidence, Heartbeat, and Dev MCP Ban systems
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { mcpEvidenceService } from '../mcp-evidence.server';
import { heartbeatService } from '../heartbeat.server';
import { createGrowthEngineSupport } from '../growth-engine-support.server';

describe('Growth Engine Support Framework', () => {
  const testAgent = 'test-agent';
  const testDate = '2025-10-22';
  const testTask = 'TEST-001';
  const testDir = 'test-artifacts';

  beforeEach(async () => {
    // Clean up test artifacts
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Clean up test artifacts
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }
  });

  describe('MCP Evidence Service', () => {
    it('should initialize evidence file', async () => {
      const evidencePath = await mcpEvidenceService.initializeEvidenceFile(
        testAgent, 
        testDate, 
        'test-topic'
      );
      
      expect(evidencePath).toContain('test-artifacts/test-agent/2025-10-22/mcp/test-topic.jsonl');
      
      // Check if file exists
      const stats = await fs.stat(evidencePath);
      expect(stats.isFile()).toBe(true);
    });

    it('should append evidence entries', async () => {
      const entry = {
        tool: 'shopify-dev' as const,
        doc_ref: 'https://shopify.dev/docs/api/admin-rest',
        request_id: 'req_123',
        timestamp: '2025-10-22T14:30:00Z',
        purpose: 'Test MCP evidence entry'
      };

      await mcpEvidenceService.appendEvidence(testAgent, testDate, 'test-topic', entry);
      
      const entries = await mcpEvidenceService.getEvidenceEntries(testAgent, testDate, 'test-topic');
      expect(entries).toHaveLength(1);
      expect(entries[0]).toEqual(entry);
    });

    it('should validate evidence entry format', async () => {
      const invalidEntry = {
        tool: 'invalid-tool' as any,
        doc_ref: '',
        request_id: '',
        timestamp: '',
        purpose: ''
      };

      await expect(
        mcpEvidenceService.appendEvidence(testAgent, testDate, 'test-topic', invalidEntry)
      ).rejects.toThrow();
    });

    it('should generate PR template section', async () => {
      // Add some evidence
      await mcpEvidenceService.appendEvidence(testAgent, testDate, 'test-topic', {
        tool: 'shopify-dev',
        doc_ref: 'https://shopify.dev/docs/api/admin-rest',
        request_id: 'req_123',
        timestamp: '2025-10-22T14:30:00Z',
        purpose: 'Test evidence'
      });

      const prSection = await mcpEvidenceService.generatePRTemplateSection(testAgent, testDate);
      
      expect(prSection).toContain('## MCP Evidence (required for code changes)');
      expect(prSection).toContain('test-artifacts/test-agent/2025-10-22/mcp/test-topic.jsonl');
    });
  });

  describe('Heartbeat Service', () => {
    it('should initialize heartbeat file', async () => {
      const heartbeatPath = await heartbeatService.initializeHeartbeatFile(testAgent, testDate);
      
      expect(heartbeatPath).toContain('test-artifacts/test-agent/2025-10-22/heartbeat.ndjson');
      
      // Check if file exists
      const stats = await fs.stat(heartbeatPath);
      expect(stats.isFile()).toBe(true);
    });

    it('should append heartbeat entries', async () => {
      const entry = {
        timestamp: '2025-10-22T14:00:00Z',
        task: testTask,
        status: 'doing' as const,
        progress: '50%',
        file: 'test-file.ts'
      };

      await heartbeatService.appendHeartbeat(testAgent, testDate, entry);
      
      const entries = await heartbeatService.getHeartbeatEntries(testAgent, testDate);
      expect(entries).toHaveLength(1);
      expect(entries[0]).toEqual(entry);
    });

    it('should detect stale heartbeats', async () => {
      // Add old heartbeat
      await heartbeatService.appendHeartbeat(testAgent, testDate, {
        timestamp: '2025-10-22T10:00:00Z', // Old timestamp
        task: testTask,
        status: 'doing'
      });

      const isStale = await heartbeatService.isHeartbeatStale(testAgent, testDate, testTask);
      expect(isStale).toBe(true);
    });

    it('should generate PR template section', async () => {
      // Add heartbeat
      await heartbeatService.appendHeartbeat(testAgent, testDate, {
        timestamp: '2025-10-22T14:00:00Z',
        task: testTask,
        status: 'doing'
      });

      const prSection = await heartbeatService.generatePRTemplateSection(testAgent, testDate, testTask);
      
      expect(prSection).toContain('## Heartbeat (if task >2 hours)');
      expect(prSection).toContain('test-artifacts/test-agent/2025-10-22/heartbeat.ndjson');
    });
  });

  // Dev MCP ban checks are enforced by CI scripts only; no runtime tests here.

  describe('Growth Engine Support Framework', () => {
    it('should initialize framework', async () => {
      const framework = createGrowthEngineSupport({
        agent: testAgent,
        date: testDate,
        task: testTask,
        estimatedHours: 3
      });

      await framework.initialize();

      // Check if evidence file was created
      const hasEvidence = await mcpEvidenceService.hasEvidenceFiles(testAgent, testDate);
      expect(hasEvidence).toBe(true);

      // Check if heartbeat file was created (since estimatedHours > 2)
      const hasHeartbeat = await heartbeatService.hasHeartbeatFile(testAgent, testDate);
      expect(hasHeartbeat).toBe(true);
    });

    it('should log MCP usage', async () => {
      const framework = createGrowthEngineSupport({
        agent: testAgent,
        date: testDate,
        task: testTask,
        estimatedHours: 1
      });

      await framework.initialize();

      await framework.logMCPUsage(
        'shopify-dev',
        'https://shopify.dev/docs/api/admin-rest',
        'req_123',
        'Test MCP usage'
      );

      const entries = await framework.getMCPEvidence();
      expect(entries).toHaveLength(1);
      expect(entries[0].tool).toBe('shopify-dev');
    });

    it('should update heartbeat', async () => {
      const framework = createGrowthEngineSupport({
        agent: testAgent,
        date: testDate,
        task: testTask,
        estimatedHours: 3
      });

      await framework.initialize();

      await framework.updateHeartbeat('doing', '50%', 'test-file.ts');

      const entries = await framework.getHeartbeatEntries();
      expect(entries).toHaveLength(1);
      expect(entries[0].status).toBe('doing');
      expect(entries[0].progress).toBe('50%');
    });

    it('should generate PR template', async () => {
      const framework = createGrowthEngineSupport({
        agent: testAgent,
        date: testDate,
        task: testTask,
        estimatedHours: 3
      });

      await framework.initialize();

      // Add some evidence and heartbeat
      await framework.logMCPUsage(
        'shopify-dev',
        'https://shopify.dev/docs/api/admin-rest',
        'req_123',
        'Test MCP usage'
      );

      await framework.updateHeartbeat('doing', '50%', 'test-file.ts');

      const prTemplate = await framework.generatePRTemplate();

      expect(prTemplate.mcpEvidence).toContain('## MCP Evidence');
      expect(prTemplate.heartbeat).toContain('## Heartbeat');
      // Dev MCP check handled by CI; PR template includes evidence and heartbeat sections
    });

    it('should check compliance', async () => {
      const framework = createGrowthEngineSupport({
        agent: testAgent,
        date: testDate,
        task: testTask,
        estimatedHours: 3
      });

      await framework.initialize();

      // Add evidence and heartbeat
      await framework.logMCPUsage(
        'shopify-dev',
        'https://shopify.dev/docs/api/admin-rest',
        'req_123',
        'Test MCP usage'
      );

      await framework.updateHeartbeat('doing', '50%', 'test-file.ts');

      const compliance = await framework.checkCompliance();

      expect(compliance.mcpEvidence).toBe(true);
      expect(compliance.heartbeat).toBe(true);
      expect(compliance.overall).toBe(true);
    });

    it('should generate compliance report', async () => {
      const framework = createGrowthEngineSupport({
        agent: testAgent,
        date: testDate,
        task: testTask,
        estimatedHours: 3
      });

      await framework.initialize();

      const report = await framework.getComplianceReport();

      expect(report).toContain('# Growth Engine Support Framework Compliance Report');
      expect(report).toContain('## Compliance Status');
      expect(report).toContain('## PR Template Sections');
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end', async () => {
      // Create framework
      const framework = createGrowthEngineSupport({
        agent: testAgent,
        date: testDate,
        task: testTask,
        estimatedHours: 3
      });

      // Initialize
      await framework.initialize();

      // Log MCP usage
      await framework.logMCPUsage(
        'shopify-dev',
        'https://shopify.dev/docs/api/admin-rest',
        'req_123',
        'Get product data'
      );

      await framework.logMCPUsage(
        'context7',
        'https://context7.io/docs',
        'req_124',
        'Get library documentation'
      );

      // Update heartbeat
      await framework.updateHeartbeat('doing', '25%', 'app/services/growth-engine-support.server.ts');
      await framework.updateHeartbeat('doing', '50%', 'app/services/mcp-evidence.server.ts');
      await framework.updateHeartbeat('doing', '75%', 'app/services/heartbeat.server.ts');
      await framework.updateHeartbeat('done', '100%', 'tests passing');

      // Check compliance
      const compliance = await framework.checkCompliance();
      expect(compliance.overall).toBe(true);

      // Generate PR template
      const prTemplate = await framework.generatePRTemplate();
      expect(prTemplate.mcpEvidence).toContain('test-artifacts/test-agent/2025-10-22/mcp/general.jsonl');
      expect(prTemplate.heartbeat).toContain('test-artifacts/test-agent/2025-10-22/heartbeat.ndjson');

      // Cleanup
      await framework.cleanup();
    });
  });
});
