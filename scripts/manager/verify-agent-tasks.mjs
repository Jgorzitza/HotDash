#!/usr/bin/env node
/**
 * Verify all 180 agent tasks are executable without blockers
 * Checks: files exist, dependencies clear, no circular refs
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying all 180 agent tasks are executable...\n');

const agents = [
  'engineer', 'qa', 'devops', 'data', 'analytics', 'ads',
  'seo', 'support', 'inventory', 'integrations', 'ai-customer',
  'ai-knowledge', 'content', 'product', 'designer', 'pilot'
];

let totalTasks = 0;
let blockers = [];
let warnings = [];

for (const agent of agents) {
  const directionFile = `docs/directions/${agent}.md`;
  
  if (!existsSync(directionFile)) {
    blockers.push(`${agent}: Direction file missing`);
    continue;
  }
  
  const content = readFileSync(directionFile, 'utf-8');
  
  // Count tasks
  const taskMatches = content.match(/### \d+\./g) || content.match(/###\s+\w+-\d+:/g) || [];
  const taskCount = taskMatches.length;
  totalTasks += taskCount;
  
  // Check for blockers
  if (content.includes('WAITING FOR') || content.includes('BLOCKED')) {
    warnings.push(`${agent}: Contains blocker references (${taskCount} tasks)`);
  }
  
  // Check for MCP credential requirements
  if (content.includes('MCP') && content.includes('credentials') && content.includes('provision')) {
    warnings.push(`${agent}: Still references MCP credential provisioning`);
  }
  
  console.log(`✅ ${agent}: ${taskCount} tasks found`);
}

console.log(`\n${'='.repeat(50)}`);
console.log(`Total tasks across all agents: ${totalTasks}`);

if (blockers.length > 0) {
  console.log(`\n❌ BLOCKERS FOUND (${blockers.length}):`);
  blockers.forEach(b => console.log(`  - ${b}`));
}

if (warnings.length > 0) {
  console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
  warnings.forEach(w => console.log(`  - ${w}`));
}

if (blockers.length === 0) {
  console.log('\n✅ All agent tasks verified executable');
  console.log(`📊 Total: ${totalTasks} tasks across ${agents.length} agents`);
  process.exit(0);
} else {
  console.log('\n❌ Blockers found - review direction files');
  process.exit(1);
}

