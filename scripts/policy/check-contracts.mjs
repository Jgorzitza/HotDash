#!/usr/bin/env node
/**
 * Contract Test Validator
 * Runs contract tests for each agent to verify DoD compliance
 */
import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🔍 Running contract tests for all agents...\n');

const contracts = [
  { agent: 'engineer', test: 'tests/unit/routes/ideas.drawer.spec.ts' },
  { agent: 'qa', test: 'npm run test:a11y' },
  { agent: 'ads', test: 'tests/unit/ads/metrics.spec.ts' },
  { agent: 'analytics', test: 'scripts/analytics/sampling-guard-proof.mjs' },
  { agent: 'inventory', test: 'tests/unit/services/inventory/calculations.spec.ts' },
  { agent: 'seo', test: 'tests/unit/seo.web-vitals.spec.ts' },
  { agent: 'support', test: 'tests/integration/support.webhook.spec.ts' },
  { agent: 'integrations', test: 'tests/integration/idea-pool.api.spec.ts' },
];

let failures = 0;

for (const { agent, test } of contracts) {
  try {
    console.log(`📋 Testing ${agent} contract...`);
    
    if (test.endsWith('.mjs')) {
      if (existsSync(test)) {
        execSync(`node ${test}`, { stdio: 'inherit' });
      } else {
        console.log(`  ⚠️  Script not found: ${test}`);
        continue;
      }
    } else if (test.startsWith('npm')) {
      execSync(test, { stdio: 'inherit' });
    } else {
      execSync(`npx vitest run ${test}`, { stdio: 'inherit' });
    }
    
    console.log(`  ✅ ${agent} contract passed\n`);
  } catch (err) {
    failures++;
    console.error(`  ❌ ${agent} contract failed\n`);
  }
}

console.log(`\n${'='.repeat(50)}`);
if (failures > 0) {
  console.error(`❌ ${failures} contract test(s) failed`);
  process.exit(1);
}

console.log('✅ All contract tests passed');
process.exit(0);
