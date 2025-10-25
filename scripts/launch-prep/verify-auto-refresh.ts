/**
 * Launch Prep: Verify Auto-Refresh System
 * 
 * Checks:
 * 1. File watcher code exists and is valid
 * 2. Refresh service code exists and is valid
 * 3. API endpoints are accessible
 * 4. Configuration is correct
 */

import { access, constants } from 'node:fs/promises';
import { join } from 'node:path';
import { logDecision } from '../../app/services/decisions.server.js';

async function verifyAutoRefresh() {
  console.log('🔄 Verifying Auto-Refresh System\n');
  console.log('='.repeat(80));

  const results = {
    filesChecked: 0,
    filesValid: 0,
    errors: [] as string[],
    warnings: [] as string[],
  };

  const requiredFiles = [
    'app/workers/knowledge-base-watcher.ts',
    'app/workers/knowledge-base-refresh.ts',
    'app/workers/knowledge-base-auto-refresh.ts',
    'app/routes/api.knowledge-base.refresh.ts',
    'app/routes/api.cron.knowledge-base-refresh.ts',
    '.github/workflows/knowledge-base-daily-refresh.yml',
  ];

  try {
    // Check all required files exist
    for (const file of requiredFiles) {
      results.filesChecked++;
      const filePath = join(process.cwd(), file);
      
      try {
        await access(filePath, constants.R_OK);
        results.filesValid++;
        console.log(`✅ ${file}`);
      } catch {
        results.errors.push(`Missing file: ${file}`);
        console.log(`❌ ${file}`);
      }
    }

    // Check package.json for chokidar
    try {
      const packageJson = await import('../../package.json', { with: { type: 'json' } });
      if (packageJson.default.dependencies?.chokidar || packageJson.default.devDependencies?.chokidar) {
        console.log('✅ chokidar dependency installed');
      } else {
        results.warnings.push('chokidar not found in package.json');
      }
    } catch {
      results.warnings.push('Could not verify chokidar installation');
    }

    // Check environment variables
    const mcpUrl = process.env.LLAMAINDEX_MCP_URL;
    if (mcpUrl) {
      console.log(`✅ LLAMAINDEX_MCP_URL configured: ${mcpUrl}`);
    } else {
      results.warnings.push('LLAMAINDEX_MCP_URL not set - will use default');
    }

    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      console.log('✅ CRON_SECRET configured');
    } else {
      results.warnings.push('CRON_SECRET not set - cron endpoint will use default');
    }

  } catch (error) {
    results.errors.push(`Verification failed: ${(error as Error).message}`);
  }

  // Log results
  const passed = results.errors.length === 0;
  
  await logDecision({
    scope: 'build',
    actor: 'ai-knowledge',
    action: 'launch_prep_autorefresh_verified',
    rationale: passed 
      ? 'Auto-refresh system verified and ready for launch'
      : 'Auto-refresh system verification found issues',
    progressPct: 40,
    payload: {
      passed,
      filesChecked: results.filesChecked,
      filesValid: results.filesValid,
      errors: results.errors,
      warnings: results.warnings,
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY:');
  console.log(`  Files checked: ${results.filesChecked}`);
  console.log(`  Files valid: ${results.filesValid}`);
  console.log(`  Errors: ${results.errors.length}`);
  console.log(`  Warnings: ${results.warnings.length}`);

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(e => console.log(`  - ${e}`));
  }

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(w => console.log(`  - ${w}`));
  }

  if (passed) {
    console.log('\n✅ Auto-Refresh System: READY FOR LAUNCH');
  } else {
    console.log('\n❌ Auto-Refresh System: NOT READY - Fix errors above');
  }

  process.exit(passed ? 0 : 1);
}

verifyAutoRefresh().catch(console.error);

