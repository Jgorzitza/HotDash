#!/usr/bin/env node

/**
 * CI Guard: Heartbeat Verification
 * 
 * Verifies that heartbeat NDJSON files are present and not stale for long-running tasks.
 * This is a CI merge blocker - PRs cannot merge with stale heartbeats.
 * 
 * Requirements:
 * - Parse PR body for Heartbeat section
 * - Extract NDJSON file path
 * - Verify file exists
 * - Check heartbeat staleness (must be within 15 minutes for "doing" status)
 * 
 * Exemptions:
 * - Single session tasks (<2 hours)
 * - If PR body contains "<2h single session" or "<2 hours"
 */

const fs = require('fs');

/**
 * Parse PR body and extract Heartbeat NDJSON file path
 * @param {string} prBody - PR description body
 * @returns {string | null} - File path or null if exempted
 * @throws {Error} - If Heartbeat section missing or invalid
 */
function parseHeartbeatSection(prBody) {
  // Extract Heartbeat section (between ## Heartbeat and next ##)
  const match = prBody.match(/## Heartbeat.*?\n([\s\S]*?)(?:\n##|$)/);
  
  if (!match) {
    throw new Error("❌ Heartbeat section missing from PR body. Required format:\n\n## Heartbeat\n- artifacts/<agent>/<date>/heartbeat.ndjson\n\nOr for short tasks:\n\n## Heartbeat\n<2h single session - heartbeat not required");
  }
  
  const section = match[1];
  
  // Check for "<2h single session" exemption
  if (section.includes("<2h single session") || 
      section.includes("<2 hours") || 
      section.includes("< 2h") || 
      section.includes("single session")) {
    console.log("✅ Single session (<2h) exemption found - heartbeat not required");
    return null;
  }
  
  // Extract heartbeat file path: artifacts/<agent>/<date>/heartbeat.ndjson
  const pathMatch = section.match(/artifacts\/([^\/\s]+)\/([^\/\s]+)\/heartbeat\.ndjson/);
  
  if (!pathMatch) {
    throw new Error("❌ No heartbeat file path found in PR body.\n\nExpected format:\n- artifacts/<agent>/<date>/heartbeat.ndjson\n\nExample:\n- artifacts/devops/2025-10-21/heartbeat.ndjson");
  }
  
  return pathMatch[0];
}

/**
 * Verify heartbeat file is not stale
 * @param {string} filePath - Path to NDJSON heartbeat file
 * @throws {Error} - If file doesn't exist or heartbeat is stale
 */
function verifyHeartbeat(filePath) {
  // Check file exists
  if (!fs.existsSync(filePath)) {
    throw new Error(`❌ Heartbeat file not found: ${filePath}\n\nFile must be committed to the repository.`);
  }
  
  // Read file content
  const content = fs.readFileSync(filePath, 'utf8').trim();
  
  if (content.length === 0) {
    throw new Error(`❌ Heartbeat file is empty: ${filePath}\n\nHeartbeat must be logged every 15 minutes for tasks >2 hours.`);
  }
  
  // Split into lines and get last heartbeat
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  
  if (lines.length === 0) {
    throw new Error(`❌ Heartbeat file has no valid entries: ${filePath}`);
  }
  
  // Parse last heartbeat
  let lastHeartbeat;
  try {
    lastHeartbeat = JSON.parse(lines[lines.length - 1]);
  } catch (error) {
    throw new Error(`❌ Last heartbeat line is not valid JSON: ${error.message}\n\nExpected format:\n{"timestamp":"2025-10-21T14:00:00Z","task":"TASK-001","status":"doing|done","progress":"40%","file":"path/to/file.ts"}`);
  }
  
  // Verify required fields
  if (!lastHeartbeat.timestamp) {
    throw new Error("❌ Last heartbeat missing 'timestamp' field");
  }
  
  if (!lastHeartbeat.status) {
    throw new Error("❌ Last heartbeat missing 'status' field (must be 'doing' or 'done')");
  }
  
  // Parse timestamp
  const lastTimestamp = new Date(lastHeartbeat.timestamp);
  if (isNaN(lastTimestamp.getTime())) {
    throw new Error(`❌ Invalid timestamp format: ${lastHeartbeat.timestamp}. Expected: YYYY-MM-DDTHH:MM:SSZ`);
  }
  
  const now = new Date();
  const minutesAgo = (now - lastTimestamp) / 1000 / 60;
  
  console.log(`Last heartbeat: ${lastHeartbeat.timestamp} (${minutesAgo.toFixed(1)} minutes ago)`);
  console.log(`Status: ${lastHeartbeat.status}`);
  console.log(`Total heartbeat entries: ${lines.length}`);
  
  // Only enforce staleness check if status is "doing"
  // If task is "done", we don't fail on staleness
  if (lastHeartbeat.status === 'doing' && minutesAgo > 15) {
    throw new Error(`❌ Heartbeat stale: Last update was ${minutesAgo.toFixed(1)} minutes ago (>15 minute threshold)\n\nFor tasks >2 hours, heartbeat must be updated every 15 minutes.\n\nIf task is complete, set status to "done" in last heartbeat entry.`);
  }
  
  if (lastHeartbeat.status === 'done') {
    console.log("✅ Task marked as done - staleness check skipped");
  } else {
    console.log("✅ Heartbeat fresh - within 15 minute threshold");
  }
  
  console.log(`✅ Heartbeat OK: ${lines.length} entries`);
}

/**
 * Main execution
 */
async function main() {
  const prBody = process.env.PR_BODY;
  
  if (!prBody) {
    throw new Error("❌ PR_BODY environment variable not set.\n\nThis script must be run in GitHub Actions with PR context.");
  }
  
  console.log("🔍 Verifying Heartbeat...\n");
  
  try {
    const path = parseHeartbeatSection(prBody);
    
    if (path === null) {
      // Single session exemption
      console.log("\n✅ Heartbeat Check PASSED (exempted)");
      process.exit(0);
    }
    
    console.log(`Found heartbeat file: ${path}\n`);
    
    verifyHeartbeat(path);
    
    console.log(`\n✅ Heartbeat Check PASSED`);
    process.exit(0);
    
  } catch (error) {
    console.error(`\n${error.message}\n`);
    console.error("💡 To fix this:");
    console.error("1. Append heartbeat entries every 15 minutes for tasks >2 hours");
    console.error("2. Format: {\"timestamp\":\"2025-10-21T14:00:00Z\",\"task\":\"TASK-001\",\"status\":\"doing|done\",\"progress\":\"40%\"}");
    console.error("3. Commit the heartbeat file to artifacts/<agent>/<date>/");
    console.error("4. List the file in the PR body under '## Heartbeat'");
    console.error("\nSee: docs/runbooks/agent_startup_checklist.md (Section 2.1)\n");
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error(`\n❌ Unexpected error: ${error.message}\n`);
    process.exit(1);
  });
}

module.exports = { parseHeartbeatSection, verifyHeartbeat };

