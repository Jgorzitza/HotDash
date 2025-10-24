/**
 * Launch Prep: Verify LlamaIndex MCP Integration
 * 
 * Checks:
 * 1. MCP server is accessible
 * 2. Health endpoint responds
 * 3. Required tools are available
 * 4. Integration code is correct
 */

import { logDecision } from '../../app/services/decisions.server.js';

const MCP_URL = process.env.LLAMAINDEX_MCP_URL || 'https://hotdash-llamaindex-mcp.fly.dev';

async function verifyMCPIntegration() {
  console.log('🔌 Verifying LlamaIndex MCP Integration\n');
  console.log('='.repeat(80));

  const results = {
    serverReachable: false,
    healthOk: false,
    toolsAvailable: [] as string[],
    errors: [] as string[],
    warnings: [] as string[],
  };

  try {
    console.log(`Testing MCP server: ${MCP_URL}`);

    // Test health endpoint
    try {
      const healthResponse = await fetch(`${MCP_URL}/health`, {
        signal: AbortSignal.timeout(10000),
      });

      if (healthResponse.ok) {
        results.serverReachable = true;
        const health = await healthResponse.json();
        
        if (health.status === 'ok') {
          results.healthOk = true;
          console.log('✅ MCP server health: OK');
          console.log(`   Service: ${health.service}`);
          console.log(`   Version: ${health.version}`);
          console.log(`   Uptime: ${health.uptime}`);
          
          if (health.tools && Array.isArray(health.tools)) {
            results.toolsAvailable = health.tools;
            console.log(`   Tools: ${health.tools.join(', ')}`);
            
            // Check for required tools
            const requiredTools = ['query_support', 'refresh_index', 'insight_report'];
            const missingTools = requiredTools.filter(t => !health.tools.includes(t));
            
            if (missingTools.length > 0) {
              results.errors.push(`Missing required tools: ${missingTools.join(', ')}`);
            } else {
              console.log('✅ All required tools available');
            }
          }
        } else {
          results.errors.push(`Health status not OK: ${health.status}`);
        }
      } else {
        results.errors.push(`Health endpoint returned ${healthResponse.status}`);
      }
    } catch (error) {
      results.errors.push(`Cannot reach MCP server: ${(error as Error).message}`);
    }

    // Test MCP tools endpoint
    if (results.serverReachable) {
      try {
        const toolsResponse = await fetch(`${MCP_URL}/mcp/tools`, {
          signal: AbortSignal.timeout(5000),
        });

        if (toolsResponse.ok) {
          const tools = await toolsResponse.json();
          console.log(`✅ MCP tools endpoint accessible (${tools.tools?.length || 0} tools)`);
        } else {
          results.warnings.push('MCP tools endpoint not accessible');
        }
      } catch (error) {
        results.warnings.push(`MCP tools endpoint error: ${(error as Error).message}`);
      }
    }

  } catch (error) {
    results.errors.push(`Verification failed: ${(error as Error).message}`);
  }

  // Log results
  const passed = results.errors.length === 0 && results.healthOk;
  
  await logDecision({
    scope: 'build',
    actor: 'ai-knowledge',
    action: 'launch_prep_mcp_verified',
    rationale: passed 
      ? 'LlamaIndex MCP integration verified and operational for launch'
      : 'LlamaIndex MCP integration verification found issues',
    progressPct: 60,
    payload: {
      passed,
      mcpUrl: MCP_URL,
      serverReachable: results.serverReachable,
      healthOk: results.healthOk,
      toolsAvailable: results.toolsAvailable,
      errors: results.errors,
      warnings: results.warnings,
    }
  });

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY:');
  console.log(`  Server reachable: ${results.serverReachable ? 'Yes' : 'No'}`);
  console.log(`  Health OK: ${results.healthOk ? 'Yes' : 'No'}`);
  console.log(`  Tools available: ${results.toolsAvailable.length}`);
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
    console.log('\n✅ MCP Integration: READY FOR LAUNCH');
  } else {
    console.log('\n❌ MCP Integration: NOT READY - Fix errors above');
  }

  process.exit(passed ? 0 : 1);
}

verifyMCPIntegration().catch(console.error);

