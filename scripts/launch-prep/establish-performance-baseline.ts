/**
 * Launch Prep: Establish Performance Baseline
 * 
 * Measures and records baseline performance metrics for:
 * 1. Knowledge base file scanning
 * 2. MCP server response times
 * 3. API endpoint response times
 */

import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { logDecision } from '../../app/services/decisions.server.js';

const SUPPORT_DIR = join(process.cwd(), 'data/support');
const MCP_URL = process.env.LLAMAINDEX_MCP_URL || 'https://hotdash-llamaindex-mcp.fly.dev';

async function establishBaseline() {
  console.log('📊 Establishing Performance Baseline\n');
  console.log('='.repeat(80));

  const baseline = {
    fileScan: { durationMs: 0, filesScanned: 0, totalSizeKB: 0 },
    mcpHealth: { durationMs: 0, success: false },
    mcpRefresh: { durationMs: 0, success: false, timedOut: false },
  };

  // 1. File Scanning Performance
  console.log('\n1. File Scanning Performance');
  console.log('-'.repeat(80));
  
  try {
    const scanStart = Date.now();
    const files = await readdir(SUPPORT_DIR, { recursive: true });
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    let totalSize = 0;
    for (const file of mdFiles) {
      const filePath = join(SUPPORT_DIR, file);
      const fileStat = await stat(filePath);
      totalSize += fileStat.size;
    }
    
    const scanDuration = Date.now() - scanStart;
    
    baseline.fileScan = {
      durationMs: scanDuration,
      filesScanned: mdFiles.length,
      totalSizeKB: totalSize / 1024,
    };
    
    console.log(`✅ Scanned ${mdFiles.length} files in ${scanDuration}ms`);
    console.log(`   Total size: ${(totalSize / 1024).toFixed(2)} KB`);
    console.log(`   Avg per file: ${(scanDuration / mdFiles.length).toFixed(2)}ms`);
  } catch (error) {
    console.log(`❌ File scan failed: ${(error as Error).message}`);
  }

  // 2. MCP Health Check Performance
  console.log('\n2. MCP Health Check Performance');
  console.log('-'.repeat(80));
  
  try {
    const healthStart = Date.now();
    const healthResponse = await fetch(`${MCP_URL}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    const healthDuration = Date.now() - healthStart;
    
    baseline.mcpHealth = {
      durationMs: healthDuration,
      success: healthResponse.ok,
    };
    
    if (healthResponse.ok) {
      console.log(`✅ Health check responded in ${healthDuration}ms`);
    } else {
      console.log(`⚠️  Health check returned ${healthResponse.status} in ${healthDuration}ms`);
    }
  } catch (error) {
    console.log(`❌ Health check failed: ${(error as Error).message}`);
  }

  // 3. MCP Refresh Performance (with timeout)
  console.log('\n3. MCP Refresh Performance');
  console.log('-'.repeat(80));
  console.log('⏳ Testing refresh operation (may take 60-180s)...');
  
  try {
    const refreshStart = Date.now();
    const refreshResponse = await fetch(`${MCP_URL}/mcp/tools/call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'refresh_index',
        arguments: {},
      }),
      signal: AbortSignal.timeout(180000), // 3 minute timeout
    });
    const refreshDuration = Date.now() - refreshStart;
    
    baseline.mcpRefresh = {
      durationMs: refreshDuration,
      success: refreshResponse.ok,
      timedOut: false,
    };
    
    if (refreshResponse.ok) {
      console.log(`✅ Refresh completed in ${refreshDuration}ms (${(refreshDuration / 1000).toFixed(1)}s)`);
    } else {
      console.log(`⚠️  Refresh returned ${refreshResponse.status} in ${refreshDuration}ms`);
    }
  } catch (error) {
    const errorMsg = (error as Error).message;
    if (errorMsg.includes('timeout') || errorMsg.includes('aborted')) {
      baseline.mcpRefresh.timedOut = true;
      console.log('⚠️  Refresh timed out after 180s (expected for cold start)');
    } else {
      console.log(`❌ Refresh failed: ${errorMsg}`);
    }
  }

  // Log baseline to decision log
  await logDecision({
    scope: 'build',
    actor: 'ai-knowledge',
    action: 'launch_prep_baseline_established',
    rationale: 'Performance baseline established for knowledge base system',
    progressPct: 80,
    payload: {
      baseline,
      timestamp: new Date().toISOString(),
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('PERFORMANCE BASELINE SUMMARY:');
  console.log('\nFile Scanning:');
  console.log(`  Duration: ${baseline.fileScan.durationMs}ms`);
  console.log(`  Files: ${baseline.fileScan.filesScanned}`);
  console.log(`  Size: ${baseline.fileScan.totalSizeKB.toFixed(2)} KB`);
  console.log(`  Throughput: ${(baseline.fileScan.totalSizeKB / (baseline.fileScan.durationMs / 1000)).toFixed(2)} KB/s`);

  console.log('\nMCP Health Check:');
  console.log(`  Duration: ${baseline.mcpHealth.durationMs}ms`);
  console.log(`  Success: ${baseline.mcpHealth.success ? 'Yes' : 'No'}`);

  console.log('\nMCP Refresh:');
  if (baseline.mcpRefresh.timedOut) {
    console.log('  Status: Timed out (expected for cold start)');
  } else {
    console.log(`  Duration: ${baseline.mcpRefresh.durationMs}ms (${(baseline.mcpRefresh.durationMs / 1000).toFixed(1)}s)`);
    console.log(`  Success: ${baseline.mcpRefresh.success ? 'Yes' : 'No'}`);
  }

  console.log('\n✅ Performance baseline established and logged');

  process.exit(0);
}

establishBaseline().catch(console.error);

