#!/usr/bin/env tsx
/**
 * KB SEARCH SCRIPT FOR AGENTS
 * 
 * This script allows agents to search the KB before executing tasks
 * to avoid redoing work and ensure they have full context.
 * 
 * Usage: npx tsx scripts/agent/kb-search.ts <task-id> <task-title> <agent-name>
 * 
 * Example: npx tsx scripts/agent/kb-search.ts ENG-052 "Approval Queue Route" engineer
 */

import "dotenv/config";
import { preTaskKBSearch } from "../../app/services/kb-integration.server";

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    console.log('❌ Usage: npx tsx scripts/agent/kb-search.ts <task-id> <task-title> <agent-name>');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx scripts/agent/kb-search.ts ENG-052 "Approval Queue Route" engineer');
    console.log('  npx tsx scripts/agent/kb-search.ts DATA-001 "Database Migration" data');
    console.log('  npx tsx scripts/agent/kb-search.ts MGR-005 "Task Assignment" manager');
    process.exit(1);
  }
  
  const [taskId, taskTitle, agentName] = args;
  
  console.log(`🔍 KB SEARCH FOR AGENT: ${agentName.toUpperCase()}`);
  console.log(`📋 Task: ${taskId} - ${taskTitle}`);
  console.log('');
  
  try {
    // Perform KB search
    const searchResults = await preTaskKBSearch(
      taskId,
      taskTitle,
      `Implementation task for ${taskTitle}`,
      agentName
    );
    
    console.log(`\n✅ KB search completed successfully!`);
    console.log(`📊 Found ${searchResults.results.length} relevant results`);
    console.log(`💡 Generated ${searchResults.recommendations.length} recommendations`);
    
    // Save results to file for agent reference
    const resultsFile = `kb-search-${taskId}-${Date.now()}.json`;
    const fs = await import('fs');
    await fs.promises.writeFile(
      resultsFile,
      JSON.stringify(searchResults, null, 2)
    );
    
    console.log(`\n💾 Results saved to: ${resultsFile}`);
    console.log(`\n🚀 Agent can now proceed with task execution with full context!`);
    
  } catch (error) {
    console.error(`❌ KB search failed: ${error.message}`);
    process.exit(1);
  }
}

main();
