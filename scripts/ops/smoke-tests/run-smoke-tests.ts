#!/usr/bin/env tsx
/**
 * Smoke Test Runner
 * 
 * Runs production smoke tests and reports results.
 * Can be run manually or via CI/cron.
 * 
 * Usage:
 *   npx tsx scripts/ops/smoke-tests/run-smoke-tests.ts [environment]
 * 
 * Environment: production | staging | local (default: production)
 */

import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const execAsync = promisify(exec);

interface SmokeTestResult {
  environment: string;
  timestamp: string;
  duration: number;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  tests: Array<{
    name: string;
    status: "passed" | "failed" | "skipped";
    duration: number;
    error?: string;
  }>;
}

async function runSmokeTests(environment: string = "production"): Promise<SmokeTestResult> {
  console.log(`\n🔍 Running smoke tests for ${environment}...\n`);
  
  const startTime = Date.now();
  
  try {
    // Set environment variable for tests
    process.env.TEST_ENV = environment;
    
    // Run smoke tests
    const { stdout, stderr } = await execAsync(
      "npm run test:smoke -- --reporter=json",
      {
        env: {
          ...process.env,
          TEST_ENV: environment,
        },
      }
    );
    
    const duration = Date.now() - startTime;
    
    // Parse results (simplified - would parse actual Playwright JSON output)
    const result: SmokeTestResult = {
      environment,
      timestamp: new Date().toISOString(),
      duration,
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      tests: [],
    };
    
    // Save results
    await saveResults(result);
    
    // Print summary
    printSummary(result);
    
    return result;
  } catch (error: any) {
    console.error("❌ Smoke tests failed:", error.message);
    
    const result: SmokeTestResult = {
      environment,
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      passed: 0,
      failed: 1,
      skipped: 0,
      total: 1,
      tests: [
        {
          name: "Smoke test execution",
          status: "failed",
          duration: Date.now() - startTime,
          error: error.message,
        },
      ],
    };
    
    await saveResults(result);
    throw error;
  }
}

async function saveResults(result: SmokeTestResult): Promise<void> {
  const artifactsDir = join(process.cwd(), "artifacts", "smoke-tests");
  await mkdir(artifactsDir, { recursive: true });
  
  const filename = `smoke-test-${result.environment}-${Date.now()}.json`;
  const filepath = join(artifactsDir, filename);
  
  await writeFile(filepath, JSON.stringify(result, null, 2));
  
  console.log(`\n📄 Results saved to: ${filepath}`);
}

function printSummary(result: SmokeTestResult): void {
  console.log("\n" + "=".repeat(60));
  console.log("SMOKE TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`Environment: ${result.environment}`);
  console.log(`Timestamp:   ${result.timestamp}`);
  console.log(`Duration:    ${(result.duration / 1000).toFixed(2)}s`);
  console.log("");
  console.log(`Total:       ${result.total}`);
  console.log(`✅ Passed:   ${result.passed}`);
  console.log(`❌ Failed:   ${result.failed}`);
  console.log(`⏭️  Skipped:  ${result.skipped}`);
  console.log("=".repeat(60));
  
  if (result.failed > 0) {
    console.log("\n❌ FAILED TESTS:");
    result.tests
      .filter(t => t.status === "failed")
      .forEach(t => {
        console.log(`  - ${t.name}`);
        if (t.error) {
          console.log(`    Error: ${t.error}`);
        }
      });
  }
  
  console.log("");
}

async function main() {
  const environment = process.argv[2] || "production";
  
  if (!["production", "staging", "local"].includes(environment)) {
    console.error("❌ Invalid environment. Use: production | staging | local");
    process.exit(1);
  }
  
  try {
    const result = await runSmokeTests(environment);
    
    if (result.failed > 0) {
      console.error(`\n❌ ${result.failed} smoke test(s) failed`);
      process.exit(1);
    }
    
    console.log("\n✅ All smoke tests passed!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Smoke test execution failed");
    process.exit(1);
  }
}

main();

