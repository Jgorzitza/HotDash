#!/usr/bin/env node
/**
 * Analytics Rollback Automation
 *
 * Automates rollback procedures from analytics_pipeline.md
 * Use in emergency situations to restore analytics to last known good state.
 *
 * Usage:
 *   node scripts/analytics/rollback.mjs [options]
 *
 * Options:
 *   --dry-run           Show what would be done without executing
 *   --component=NAME    Rollback specific component only (migrations|snapshots|scripts)
 *   --confirm           Skip confirmation prompt (dangerous!)
 *
 * Examples:
 *   node scripts/analytics/rollback.mjs --dry-run
 *   node scripts/analytics/rollback.mjs --component=migrations
 *   node scripts/analytics/rollback.mjs --confirm  # Use with caution!
 */

import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const component = args.find((a) => a.startsWith("--component="))?.split("=")[1];
const skipConfirm = args.includes("--confirm");

const projectRoot = join(__dirname, "../..");

// ============================================================================
// Rollback Procedures
// ============================================================================

const rollbackProcedures = {
  migrations: {
    name: "Analytics Migrations",
    description: "Rollback Supabase analytics migrations",
    dangerous: true,
    steps: [
      {
        action: "Disable analytics feature flag",
        command: "echo 'ANALYTICS_PIPELINE_ENABLED=false' >> .env.local",
        verify: "grep ANALYTICS_PIPELINE_ENABLED .env.local",
      },
      {
        action: "Document rollback in feedback",
        command: `echo "## $(date -Iseconds) — Analytics Rollback Executed" >> feedback/analytics/$(date +%Y-%m-%d).md`,
        verify: `tail -5 feedback/analytics/$(date +%Y-%m-%d).md`,
      },
      {
        action: "Note: Supabase migrations must be rolled back manually",
        command: "echo 'Run: supabase migration down --name 20251017_analytics_facts'",
        verify: "echo 'Manual step - verify with DevOps'",
      },
    ],
  },
  snapshots: {
    name: "Analytics Snapshots",
    description: "Restore from last known good snapshot",
    dangerous: false,
    steps: [
      {
        action: "List recent snapshots",
        command: "ls -lt artifacts/analytics/snapshots/*.json | head -5",
        verify: "ls artifacts/analytics/snapshots/*.json | wc -l",
      },
      {
        action: "Create backup of current snapshots",
        command: `mkdir -p artifacts/analytics/snapshots-backup-$(date +%Y%m%d) && cp artifacts/analytics/snapshots/*.json artifacts/analytics/snapshots-backup-$(date +%Y%m%d)/`,
        verify: `ls artifacts/analytics/snapshots-backup-$(date +%Y%m%d)/*.json | wc -l`,
      },
      {
        action: "Note: Identify good snapshot manually",
        command: "echo 'Restore process: cp artifacts/analytics/snapshots/YYYY-MM-DD.json artifacts/analytics/snapshots/$(date +%Y-%m-%d).json'",
        verify: "echo 'Manual step - select snapshot to restore'",
      },
    ],
  },
  scripts: {
    name: "Analytics Scripts",
    description: "Restore analytics scripts from git",
    dangerous: false,
    steps: [
      {
        action: "Show recent changes to analytics scripts",
        command: "git log --oneline --all -- scripts/analytics/ | head -10",
        verify: "git status scripts/analytics/",
      },
      {
        action: "Create backup of current scripts",
        command: `mkdir -p backup/analytics-scripts-$(date +%Y%m%d) && cp -r scripts/analytics backup/analytics-scripts-$(date +%Y%m%d)/`,
        verify: `ls backup/analytics-scripts-$(date +%Y%m%d)/`,
      },
      {
        action: "Note: Restore from git commit",
        command: "echo 'Restore process: git checkout <commit-hash> -- scripts/analytics/'",
        verify: "echo 'Manual step - select commit to restore from'",
      },
    ],
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

async function confirmAction(message) {
  if (skipConfirm) return true;

  console.log("");
  console.log("⚠️  WARNING: " + message);
  console.log("");
  console.log("Type 'ROLLBACK' to confirm, or anything else to cancel:");

  return new Promise((resolve) => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question("> ", (answer) => {
      readline.close();
      resolve(answer === "ROLLBACK");
    });
  });
}

async function executeStep(step, dryRun) {
  console.log(`\n  Action: ${step.action}`);
  console.log(`  Command: ${step.command}`);

  if (dryRun) {
    console.log("  [DRY RUN] Would execute command");
    return { success: true, output: "[dry run]" };
  }

  try {
    const { stdout, stderr } = await execAsync(step.command, {
      cwd: projectRoot,
      shell: "/bin/bash",
    });
    console.log(`  ✓ Success`);
    if (stdout) console.log(`  Output: ${stdout.trim()}`);
    return { success: true, output: stdout };
  } catch (error) {
    console.log(`  ✗ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function verifyStep(step, dryRun) {
  if (dryRun) {
    console.log(`  [DRY RUN] Would verify: ${step.verify}`);
    return { success: true };
  }

  try {
    const { stdout } = await execAsync(step.verify, {
      cwd: projectRoot,
      shell: "/bin/bash",
    });
    console.log(`  Verification: ${stdout.trim() || "OK"}`);
    return { success: true };
  } catch (error) {
    console.log(`  Verification failed: ${error.message}`);
    return { success: false };
  }
}

// ============================================================================
// Main Execution
// ============================================================================

async function main() {
  console.log("=".repeat(60));
  console.log("Analytics Rollback Automation");
  console.log("=".repeat(60));
  console.log(`Mode: ${dryRun ? "DRY RUN" : "EXECUTE"}`);
  console.log(`Component: ${component || "ALL"}`);
  console.log("");

  // Select procedures to run
  let procedures = [];
  if (component) {
    if (!rollbackProcedures[component]) {
      console.error(`Error: Unknown component '${component}'`);
      console.error(`Available: ${Object.keys(rollbackProcedures).join(", ")}`);
      process.exit(1);
    }
    procedures = [{ key: component, ...rollbackProcedures[component] }];
  } else {
    procedures = Object.keys(rollbackProcedures).map((key) => ({
      key,
      ...rollbackProcedures[key],
    }));
  }

  // Show procedures
  console.log("Rollback Procedures:");
  procedures.forEach((proc, i) => {
    console.log(`  ${i + 1}. ${proc.name} - ${proc.description}`);
    if (proc.dangerous) {
      console.log(`     ⚠️  DANGEROUS: This procedure requires extra caution`);
    }
  });

  // Confirm if not dry run
  if (!dryRun) {
    const confirmed = await confirmAction(
      "This will execute rollback procedures. Data may be lost.",
    );
    if (!confirmed) {
      console.log("\nRollback cancelled.");
      process.exit(0);
    }
  }

  // Execute procedures
  const results = [];
  for (const proc of procedures) {
    console.log("");
    console.log("=".repeat(60));
    console.log(`Procedure: ${proc.name}`);
    console.log("=".repeat(60));

    for (const step of proc.steps) {
      const executeResult = await executeStep(step, dryRun);
      const verifyResult = await verifyStep(step, dryRun);

      results.push({
        procedure: proc.name,
        step: step.action,
        success: executeResult.success && verifyResult.success,
      });

      if (!executeResult.success) {
        console.log(`\n⚠️  Step failed, continuing with next step...`);
      }
    }
  }

  // Summary
  console.log("");
  console.log("=".repeat(60));
  console.log("ROLLBACK SUMMARY");
  console.log("=".repeat(60));

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.filter((r) => !r.success).length;

  console.log(`Total Steps: ${results.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Failed: ${failureCount}`);

  if (failureCount > 0) {
    console.log("\nFailed Steps:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.procedure}: ${r.step}`);
      });
  }

  console.log("");
  if (dryRun) {
    console.log("This was a DRY RUN. No changes were made.");
  } else {
    console.log("Rollback completed.");
    console.log("\nNext Steps:");
    console.log("1. Verify analytics endpoints return expected results");
    console.log("2. Check health endpoint: curl /api/analytics/health");
    console.log("3. Review feedback file for rollback details");
    console.log("4. Notify Manager and CEO of rollback");
  }
  console.log("=".repeat(60));

  process.exit(failureCount > 0 ? 1 : 0);
}

main();

