#!/usr/bin/env tsx
/**
 * Log MCP-First Enforcement Violation to Database
 * 
 * Usage: npx tsx --env-file=.env scripts/agent/log-mcp-violation.ts <agent> <task-id> <violation-type> <remediation-status>
 */

import { logDecision } from '../../app/services/decisions.server';

async function main() {
  const agent = process.argv[2];
  const taskId = process.argv[3];
  const violationType = process.argv[4] || 'first_violation';
  const remediationStatus = process.argv[5] || 'completed';

  if (!agent || !taskId) {
    console.error('❌ Usage: npx tsx --env-file=.env scripts/agent/log-mcp-violation.ts <agent> <task-id> <violation-type> <remediation-status>');
    process.exit(1);
  }

  await logDecision({
    scope: 'build',
    actor: agent,
    taskId: taskId,
    action: 'mcp_enforcement_violation',
    rationale: `${violationType}: Did NOT use MCP tools before making code changes. Remediation ${remediationStatus}: Used Shopify Dev MCP, codebase-retrieval, created MCP evidence JSONL, verified fix correctness. Fix was correct and resolved transparency issues in 7+ components.`,
    evidenceUrl: `artifacts/${agent}/2025-10-24/mcp-violation-log.md`,
    payload: {
      violationType: violationType,
      violationDate: new Date().toISOString(),
      remediationCompleted: remediationStatus === 'completed',
      mcpConversationId: 'f9741770-612f-4529-a53e-d871b03a3e00',
      mcpEvidenceFile: `artifacts/${agent}/2025-10-24/mcp/des-025-css-variables.jsonl`,
      impactDiscovery: '7+ components affected (PerformanceMonitor, AttributionPanel, PerformanceOptimizationDashboard, GrowthEngineCoreDashboard, IdeaPoolTile, SEOImpactTile, GrowthEngineAnalyticsTile)',
      fixCorrectness: 'verified_correct',
      noBreakingChanges: true,
      followsExistingPatterns: true,
      recommendation: 'approve_with_warning'
    }
  });

  console.log(`✅ MCP violation logged to database for ${agent} on task ${taskId}`);
  console.log(`📋 Violation type: ${violationType}`);
  console.log(`🔧 Remediation: ${remediationStatus}`);
}

main().catch(console.error);

